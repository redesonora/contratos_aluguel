import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, env } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "Chave de API não informada." }, { status: 400 });
    }

    const baseUrl = env === "production" ? "https://api.asaas.com/v3" : "https://sandbox.asaas.com/api/v3";

    // O endpoint correto do Asaas v3 para obter os dados da conta/empresa é /myAccount
    const response = await fetch(`${baseUrl}/myAccount`, {
      method: "GET",
      headers: {
        "access_token": apiKey,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    const responseText = await response.text();
    let data: any = null;
    let isJson = true;

    try {
      data = JSON.parse(responseText);
    } catch (e) {
      isJson = false;
    }

    if (!isJson) {
      console.log("Resposta asaas não-JSON:", responseText.substring(0, 500));
      return NextResponse.json({ 
        success: false, 
        error: `Resposta inesperada do servidor do Asaas (HTML: ${responseText.substring(0, 200)}...). Verifique se a chave de API ($aae...) é do ambiente correto (${env === 'production' ? 'Produção' : 'Homologação/Sandbox'}).` 
      }, { status: 400 });
    }

    if (response.ok) {
      return NextResponse.json({ success: true, message: "Conectado com sucesso!", company: data });
    } else {
      let errorMsg = "Falha na autenticação do token do Asaas.";
      if (data && data.errors && data.errors[0]) {
        errorMsg = data.errors[0].description;
      } else if (data && data.error) {
        errorMsg = data.error;
      }
      return NextResponse.json({ success: false, error: errorMsg, status: response.status }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Erro na validação da chave Asaas:", error);
    return NextResponse.json({ error: error.message || "Erro interno de rede ao conectar ao Asaas." }, { status: 500 });
  }
}
