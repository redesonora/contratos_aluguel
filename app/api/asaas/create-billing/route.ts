import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, env, tenant, payments, contractId } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "Chave de API do Asaas não informada." }, { status: 400 });
    }

    if (!tenant || !tenant.nome || !tenant.cpf_cnpj) {
      return NextResponse.json({ error: "Dados do inquilino insuficientes para integração." }, { status: 400 });
    }

    const baseUrl = env === "production" ? "https://api.asaas.com/v3" : "https://sandbox.asaas.com/v3";
    const headers = {
      "access_token": apiKey,
      "Content-Type": "application/json",
      "User-Agent": "realizzeapp-integration"
    };

    // 1. Procurar inquilino por CPF/CNPJ no Asaas para evitar duplicidade
    const cleanCpfCnpj = tenant.cpf_cnpj.replace(/\D/g, "");
    let asaasCustomerId: string | null = null;

    try {
      const searchRes = await fetch(`${baseUrl}/customers?cpfCnpj=${cleanCpfCnpj}`, {
        method: "GET",
        headers
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.data && searchData.data.length > 0) {
          asaasCustomerId = searchData.data[0].id;
        }
      }
    } catch (err) {
      console.error("Erro ao buscar cliente no Asaas:", err);
    }

    // 2. Se não encontrar, cadastrar o inquilino no Asaas
    if (!asaasCustomerId) {
      const customerPayload = {
        name: tenant.nome,
        cpfCnpj: cleanCpfCnpj,
        email: tenant.email || undefined,
        phone: tenant.telefone || undefined,
        mobilePhone: tenant.telefone || undefined,
        externalReference: tenant.id
      };

      const createCustRes = await fetch(`${baseUrl}/customers`, {
        method: "POST",
        headers,
        body: JSON.stringify(customerPayload)
      });

      if (!createCustRes.ok) {
        const errText = await createCustRes.text();
        return NextResponse.json({ 
          error: "Erro ao cadastrar inquilino no Asaas.", 
          details: errText 
        }, { status: 400 });
      }

      const createdCustomer = await createCustRes.json();
      asaasCustomerId = createdCustomer.id;
    }

    // 3. Cadastrar as cobranças no Asaas para cada parcela/pagamento
    const results = [];
    
    if (payments && Array.isArray(payments)) {
      for (const pay of payments) {
        const paymentPayload = {
          customer: asaasCustomerId,
          billingType: "UNDEFINED", // Permite pix, boleto ou cartão de forma agregada pelo link do Asaas
          value: parseFloat(pay.valor_esperado || pay.valor_aluguel),
          dueDate: pay.data_vencimento,
          description: `Aluguel Ref: ${pay.competencia_mes}/${pay.competencia_ano} - Contrato #${contractId.substring(0, 8)}`,
          externalReference: pay.id,
          postalService: false
        };

        const createRes = await fetch(`${baseUrl}/payments`, {
          method: "POST",
          headers,
          body: JSON.stringify(paymentPayload)
        });

        if (createRes.ok) {
          const createdPayment = await createRes.json();
          results.push({
            paymentId: pay.id,
            asaasId: createdPayment.id,
            invoiceUrl: createdPayment.invoiceUrl,
            invoiceNumber: createdPayment.invoiceNumber,
            bankSlipUrl: createdPayment.bankSlipUrl,
            success: true
          });
        } else {
          const errText = await createRes.text();
          results.push({
            paymentId: pay.id,
            success: false,
            error: errText
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      asaasCustomerId, 
      results 
    });

  } catch (error: any) {
    console.error("Erro crítico na geração de cobranças Asaas:", error);
    return NextResponse.json({ error: error.message || "Erro de servidor." }, { status: 500 });
  }
}
