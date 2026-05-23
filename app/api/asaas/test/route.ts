import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, env } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "Chave de API não informada." }, { status: 400 });
    }

    const baseUrl = env === "production" ? "https://api.asaas.com/v3" : "https://sandbox.asaas.com/v3";

    const response = await fetch(`${baseUrl}/company`, {
      method: "GET",
      headers: {
        "access_token": apiKey,
        "User-Agent": "realizzeapp-integration"
      }
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ success: true, message: "Conectado com sucesso!", company: data });
    } else {
      const errorText = await response.text();
      let errorMsg = "Falha na autenticação do token.";
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.errors && errorJson.errors[0]) {
          errorMsg = errorJson.errors[0].description;
        }
      } catch (e) {
        // use default
      }
      return NextResponse.json({ success: false, error: errorMsg, status: response.status }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Erro na validação da chave Asaas:", error);
    return NextResponse.json({ error: error.message || "Erro interno de rede." }, { status: 500 });
  }
}
