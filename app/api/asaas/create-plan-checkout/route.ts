import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function parseAsaasError(errText: string, fallback: string): string {
  try {
    const parsed = JSON.parse(errText);
    if (parsed.errors && Array.isArray(parsed.errors)) {
      const messages = parsed.errors.map((e: any) => e.description || e.message).filter(Boolean);
      if (messages.length > 0) {
        return `${fallback} (${messages.join(" | ")})`;
      }
    }
    if (parsed.error) {
      return `${fallback} (${parsed.error})`;
    }
  } catch (e) {
    // Ignorar e usar texto se não for JSON
  }
  return `${fallback} (${errText || "unspecified issue"})`;
}

export async function POST(req: NextRequest) {
  try {
    const { apiKey, env, planName, cycle, cpfCnpj, userProfile, paymentMethod, supabaseToken } = await req.json();

    // Tentar obter as chaves do perfil de MASTER no banco de dados primeiro
    let dbKey = "";
    let dbEnv = "";
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

      if (supabaseUrl && (supabaseAnonKey || serviceRoleKey)) {
        let supabase;
        if (serviceRoleKey) {
          supabase = createClient(supabaseUrl, serviceRoleKey);
        } else if (supabaseToken) {
          supabase = createClient(supabaseUrl, supabaseAnonKey!, {
            global: {
              headers: {
                Authorization: `Bearer ${supabaseToken}`
              }
            }
          });
        } else {
          supabase = createClient(supabaseUrl, supabaseAnonKey!);
        }

        const { data: masterProf, error: selectError } = await supabase
          .from('user_profiles')
          .select('id, email, asaas_key, asaas_env, role')
          .eq('role', 'MASTER')
          .not('asaas_key', 'is', null)
          .neq('asaas_key', '')
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        console.log("DEBUG: create-plan-checkout - Master profile from DB:", {
          found: !!masterProf,
          email: masterProf?.email,
          role: masterProf?.role,
          hasAsaasKey: !!masterProf?.asaas_key,
          asaasKeyLength: masterProf?.asaas_key?.length || 0,
          asaasEnv: masterProf?.asaas_env,
          selectError: selectError ? { code: selectError.code, message: selectError.message } : null
        });

        if (masterProf) {
          dbKey = masterProf.asaas_key || "";
          dbEnv = masterProf.asaas_env || "";
        }
      }
    } catch (supabaseErr) {
      console.warn("Erro ao buscar configurações Asaas do MASTER no banco (tratando com fallbacks):", supabaseErr);
    }

    // Resolvendo de forma robusta e inteligente:
    // 1. Se dbKey foi encontrado e está preenchido, priorizamos dbKey e a dbEnv correspondente,
    //    pois as configurações salvas pelo MASTER no banco devem herdar globalmente para todos os usuários.
    // 2. Se não, usamos o apiKey do body (que o Master envia em testes inline).
    // 3. Caso contrário, usamos variáveis de ambiente como fallback.
    let activeApiKey = "";
    let activeEnv = "sandbox";

    if (dbKey) {
      activeApiKey = dbKey;
      activeEnv = dbEnv || "sandbox";
      console.log("DEBUG: Usando configurações do MASTER salvas no Banco de Dados:", {
        env: activeEnv,
        keyLength: activeApiKey.length,
        keyFirst5: activeApiKey.substring(0, 5)
      });
    } else if (apiKey) {
      activeApiKey = apiKey;
      activeEnv = env || "sandbox";
      console.log("DEBUG: Usando configurações enviadas na requisição (Master Inline):", {
        env: activeEnv,
        keyLength: activeApiKey.length,
        keyFirst5: activeApiKey.substring(0, 5)
      });
    } else {
      activeApiKey = process.env.ASAAS_API_KEY || 
        process.env.NEXT_PUBLIC_ASAAS_API_KEY || 
        process.env.NEXT_PUBLIC_ASAAS_API_KE || 
        process.env.ASAAS_API_KE || "";
        
      activeEnv = process.env.ASAAS_ENV || 
        process.env.NEXT_PUBLIC_ASAAS_ENV || 
        process.env.NEXT_PUBLIC_ASAAS_EN || 
        process.env.ASAAS_EN || 
        "sandbox";
        
      console.log("DEBUG: Usando chaves de Fallback das Variáveis de Ambiente (Vercel/CloudRun):", {
        env: activeEnv,
        keyLength: activeApiKey.length,
        keyFirst5: activeApiKey ? activeApiKey.substring(0, 5) : ""
      });
    }

    if (!activeApiKey) {
      return NextResponse.json({ 
        error: "Chave de API do Asaas não disponível. Por favor, adicione sua API Key nas configurações ou contate o administrador." 
      }, { status: 400 });
    }

    const baseUrl = activeEnv === "production" ? "https://api.asaas.com/v3" : "https://sandbox.asaas.com/api/v3";
    const headers = {
      "access_token": activeApiKey,
      "Content-Type": "application/json",
      "User-Agent": "RealizzeApp Plan Subscription Gateway"
    };

    // 1. Tabela de preços oficial
    const prices: {[key: string]: {mensal: number, anual: number}} = {
      'Iniciante': { mensal: 49.90, anual: 39.90 },
      'Profissional': { mensal: 99.90, anual: 79.90 },
      'Ilimitado': { mensal: 199.90, anual: 149.90 }
    };

    const currentPrices = prices[planName] || { mensal: 49.90, anual: 39.90 };
    const pricePerMonth = cycle === 'mensal' ? currentPrices.mensal : currentPrices.anual;
    const priceAmount = cycle === 'mensal' ? pricePerMonth : pricePerMonth * 12;

    const cleanCpfCnpj = cpfCnpj.replace(/\D/g, "");
    if (!cleanCpfCnpj || cleanCpfCnpj.length < 11) {
      return NextResponse.json({ error: "CPF ou CNPJ inválido ou incompleto." }, { status: 400 });
    }

    // 2. Procurar cliente por CPF/CNPJ no Asaas para evitar duplicidades
    let customerId: string | null = null;
    try {
      const searchRes = await fetch(`${baseUrl}/customers?cpfCnpj=${cleanCpfCnpj}`, {
        method: "GET",
        headers
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.data && searchData.data.length > 0) {
          customerId = searchData.data[0].id;
        }
      }
    } catch (err) {
      console.error("Erro ao buscar plano de cliente no Asaas:", err);
    }

    // 3. Se não encontrar, cadastrar o usuário no Asaas
    if (!customerId) {
      const customerPayload = {
        name: userProfile.nome || "Cliente Realizze",
        cpfCnpj: cleanCpfCnpj,
        email: userProfile.email || undefined,
        phone: userProfile.telefone || undefined,
        mobilePhone: userProfile.telefone || undefined,
      };

      const createCustRes = await fetch(`${baseUrl}/customers`, {
        method: "POST",
        headers,
        body: JSON.stringify(customerPayload)
      });

      if (!createCustRes.ok) {
        const errText = await createCustRes.text();
        return NextResponse.json({ 
          error: parseAsaasError(errText, "Erro ao cadastrar cliente no Asaas para faturamento de plano."),
          details: errText 
        }, { status: 400 });
      }

      const createdCustomer = await createCustRes.json();
      customerId = createdCustomer.id;
    }

    // 4. Mapear modalidade de faturamento
    let billingType = "UNDEFINED";
    if (paymentMethod === "pix") billingType = "PIX";
    else if (paymentMethod === "cartao") billingType = "CREDIT_CARD";
    else if (paymentMethod === "boleto") billingType = "BOLETO";

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1); // Vence em 1 dia dadas as validações de homologação
    const formattedDueDate = dueDate.toISOString().split('T')[0];

    const paymentPayload: any = {
      customer: customerId,
      billingType,
      value: parseFloat(priceAmount.toFixed(2)),
      dueDate: formattedDueDate,
      description: `Assinatura Plano ${planName} (${cycle === 'mensal' ? 'Faturamento Mensal' : 'Faturamento Anual - 20% OFF'}) - Realizze`,
      externalReference: `${userProfile.id}_${planName}_${cycle}`,
      postalService: false
    };

    let createRes = await fetch(`${baseUrl}/payments`, {
      method: "POST",
      headers,
      body: JSON.stringify(paymentPayload)
    });

    // Se houve erro de criação e a modalidade era cartão de crédito (CREDIT_CARD),
    // realizamos o fallback automático e transparente para UNDEFINED.
    // Isso garante que o link de checkout do Asaas seja gerado com sucesso para o usuário pagar por cartão
    // ou qualquer outro meio no checkout seguro, sem travar o aplicativo por limites cadastrais.
    if (!createRes.ok && billingType === "CREDIT_CARD") {
      const errText = await createRes.text();
      console.warn("Asaas CREDIT_CARD creation failed, falling back to UNDEFINED for higher resilience:", errText);
      
      const fallbackPayload = {
        ...paymentPayload,
        billingType: "UNDEFINED",
        description: paymentPayload.description + " (Escolha pagar via Cartão de Crédito na tela de checkout)"
      };

      createRes = await fetch(`${baseUrl}/payments`, {
        method: "POST",
        headers,
        body: JSON.stringify(fallbackPayload)
      });
    }

    if (!createRes.ok) {
      const errText = await createRes.text();
      return NextResponse.json({ 
        error: parseAsaasError(errText, "Erro ao gerar cobrança da assinatura no Asaas."),
        details: errText 
      }, { status: 400 });
    }

    const paymentData = await createRes.json();

    // 5. Se selecionou Pix, buscar o QR Code real e chave copia-cola com o Asaas
    let pixQrCode = null;
    let pixCopyPaste = null;

    if (billingType === "PIX" || paymentData.billingType === "PIX") {
      try {
        const pixRes = await fetch(`${baseUrl}/payments/${paymentData.id}/pixQrCode`, {
          method: "GET",
          headers
        });
        if (pixRes.ok) {
          const pixData = await pixRes.json();
          pixQrCode = pixData.encodedImage; // Base64 da imagem do QR code
          pixCopyPaste = pixData.payload;  // Chave Pix Copia e Cola
        }
      } catch (pixErr) {
        console.error("Erro ao obter QR Code Pix do Asaas:", pixErr);
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentData.id,
      invoiceUrl: paymentData.invoiceUrl,
      bankSlipUrl: paymentData.bankSlipUrl,
      pixQrCode,
      pixCopyPaste,
      value: priceAmount
    });

  } catch (error: any) {
    console.error("Erro crítico na transação do plano Asaas:", error);
    return NextResponse.json({ error: error.message || "Erro interno de faturamento." }, { status: 500 });
  }
}
