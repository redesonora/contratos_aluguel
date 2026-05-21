import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Função para inicialização tardia (lazy initialization) do cliente Gemini.
// Isso evita erros ao carregar a rota quando a chave não está definida
// e nos permite retornar uma mensagem de erro amigável ao usuário.
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "A variável de ambiente GEMINI_API_KEY não foi encontrada ou está vazia no servidor. " +
      "Por favor, configure a chave de API do Gemini (GEMINI_API_KEY) nas variáveis de ambiente " +
      "do seu projeto de publicação (ex: painel do Vercel nas configurações de Environment Variables)."
    );
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const { tipo, detalhes, nomeModelo } = await req.json();

    if (!tipo) {
      return NextResponse.json({ error: "É necessário informar o tipo de contrato." }, { status: 400 });
    }

    // Inicializa o cliente Gemini de forma segura
    let ai;
    try {
      ai = getGeminiClient();
    } catch (initError: any) {
      return NextResponse.json({ error: initError.message }, { status: 401 });
    }

    const systemInstruction = `Você é um advogado especialista em direito imobiliário brasileiro e elaborador de contratos de alto nível.
Seu objetivo é gerar um modelo de contrato profissional estruturado em HTML para ser editado no editor de textos ricos (Rich Text Editor).
Sempre escreva o contrato em português do Brasil, utilizando linguagem jurídica formal, impecável, precisa e segura.

IMPORTANTE SOBRE AS TAGS DE PREENCHIMENTO AUTOMÁTICO (MERGE TAGS):
O sistema substitui automaticamente dados reais do locador, locatário, fiador, imóvel e dados do contrato baseados em tags especiais delimitadas por chaves duplas {{...}}.
Você DEVE obrigatoriamente usar estas tags no contrato nos locais adequados para que fiquem dinâmicos.
As tags disponíveis são:
- LOCADOR:
  - {{locador_nome}} (Nome Completo)
  - {{locador_cpf_cnpj}} (CPF ou CNPJ)
  - {{locador_rg}} (RG)
  - {{locador_estado_civil}} (Estado Civil)
  - {{locador_endereco}} (Endereço Completo)
  - {{locador_bairro}} (Bairro)
  - {{locador_cidade}} (Cidade)
  - {{locador_uf}} (Estado UF)
  - {{locador_email}} (E-mail)
  - {{locador_telefone}} (Telefone)

- LOCATÁRIO:
  - {{locatario_nome}} (Nome Completo)
  - {{locatario_cpf_cnpj}} (CPF ou CNPJ)
  - {{locatario_rg}} (RG)
  - {{locatario_profissao}} (Profissão)
  - {{locatario_estado_civil}} (Estado Civil)
  - {{locatario_nacionalidade}} (Nacionalidade)
  - {{locatario_naturalidade}} (Naturalidade)
  - {{locatario_uf_nasc}} (Estado / UF Nascimento)
  - {{locatario_email}} (E-mail)
  - {{locatario_telefone}} (Telefone)

- FIADOR (Caso aplicável):
  - {{fiador_nome}} (Nome Completo)
  - {{fiador_cpf}} (CPF)
  - {{fiador_rg}} (RG)
  - {{fiador_cep}} (CEP)
  - {{fiador_endereco}} (Endereço Completo)

- IMÓVEL:
  - {{imovel_endereco}} (Endereço completo)
  - {{imovel_numero}} (Número)
  - {{imovel_bairro}} (Bairro)
  - {{imovel_cidade}} (Cidade)
  - {{imovel_uf}} (Estado / UF)
  - {{imovel_cep}} (CEP)
  - {{imovel_tipo}} (Tipo, ex: Casa, Apartamento, Comercial)
  - {{imovel_cemig}} (Instalação Cemig)
  - {{imovel_copasa}} (Matrícula Copasa)
  - {{imovel_obs}} (Observações gerais)

- DADOS GERAIS DO ACORDO:
  - {{valor_aluguel}} (Valor mensal em R$)
  - {{valor_extenso}} (Valor por extenso)
  - {{dia_vencimento}} (Dia de vencimento mensal, ex: 10, 15)
  - {{data_inicio}} (Início de vigência)
  - {{data_fim}} (Fim de vigência)

REGRAS DE FORMATAÇÃO DO RETORNO:
1. Retorne o texto formatado como HTML puro, sem CSS pesado, estilizado de maneira clássica para contratos. Use tags como <h2 style="text-align: center; margin-bottom: 20px;"> para títulos centralizados, <p style="text-align: justify; text-indent: 2.5em; margin-bottom: 12px; line-height: 1.6;"> para parágrafos com recuo de parágrafo e texto justificado.
2. Sempre use uma estrutura jurídica sólida com seções (CLÁUSULA PRIMEIRA, CLÁUSULA SEGUNDA, CLÁUSULA TERCEIRA, etc.) em caixa alta e negrito.
3. Não use blocos de marcação de código do tipo \`\`\`html no início ou no fim do texto, envie o conteúdo HTML limpo, direto e pronto para ser copiado/processado, começando diretamente com os elementos HTML.
4. Integre com maestria as exigências e regras adicionais solicitadas pelo usuário!`;

    const userPrompt = `Gere um modelo de contrato de alta qualidade com os seguintes dados:
TIPO: ${tipo}
DETALHES E REGRAS SOLICITADAS: ${detalhes || "Utilize as regras padrões e leis brasileiras vigentes (ex: Lei do Inquilinato nº 8.245/91) para este tipo de contrato."}
NOME SUGERIDO DO MODELO: ${nomeModelo || tipo}

Lembre-se de utilizar a estrutura tradicional brasileira de contrato e preencher a qualificação e dados financeiros usando INTEGRALMENTE as tags {{...}} da instrução do sistema para que o preenchimento seja dinâmico.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      }
    });

    let generatedHtml = response.text || "";

    // Limpa wraps desnecessários de markdown se existirem
    if (generatedHtml.startsWith("```html")) {
      generatedHtml = generatedHtml.replace(/^```html\s*/, "").replace(/\s*```$/, "");
    } else if (generatedHtml.startsWith("```")) {
      generatedHtml = generatedHtml.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    return NextResponse.json({ content: generatedHtml.trim() });
  } catch (error: any) {
    console.error("Erro na rota de geração de modelo de contrato por IA:", error);
    return NextResponse.json({ error: error.message || "Erro interno ao gerar modelo." }, { status: 500 });
  }
}
