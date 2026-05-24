import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, env, tenant, payments, contractId, supabaseToken } = await req.json();

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

        console.log("DEBUG: create-billing - Master profile from DB:", {
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
      console.warn("Erro ao buscar configurações Asaas do MASTER no banco (create-billing):", supabaseErr);
    }

    // Resolvendo de forma robusta e inteligente:
    // 1. Se dbKey foi encontrado e está preenchido, priorizamos dbKey e a dbEnv correspondente,
    //    pois as configurações salvas pelo MASTER no banco devem herdar globalmente para todos os usuários.
    // 2. Se não, usamos o apiKey do body.
    // 3. Caso contrário, usamos variáveis de ambiente como fallback.
    let activeApiKey = "";
    let activeEnv = "sandbox";

    if (dbKey) {
      activeApiKey = dbKey;
      activeEnv = dbEnv || "sandbox";
      console.log("DEBUG (create-billing): Usando configurações do MASTER salvas no Banco de Dados:", {
        env: activeEnv,
        keyLength: activeApiKey.length,
        keyFirst5: activeApiKey.substring(0, 5)
      });
    } else if (apiKey) {
      activeApiKey = apiKey;
      activeEnv = env || "sandbox";
      console.log("DEBUG (create-billing): Usando configurações enviadas na requisição (Master Inline):", {
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
        
      console.log("DEBUG (create-billing): Usando chaves de Fallback das Variáveis de Ambiente (Vercel/CloudRun):", {
        env: activeEnv,
        keyLength: activeApiKey.length,
        keyFirst5: activeApiKey ? activeApiKey.substring(0, 5) : ""
      });
    }

    if (!activeApiKey) {
      return NextResponse.json({ error: "Chave de API do Asaas não configurada no painel Master para faturamento." }, { status: 400 });
    }

    if (!tenant || !tenant.nome || !tenant.cpf_cnpj) {
      return NextResponse.json({ error: "Dados do inquilino insuficientes para faturamento." }, { status: 400 });
    }

    const baseUrl = activeEnv === "production" ? "https://api.asaas.com/v3" : "https://sandbox.asaas.com/api/v3";
    const headers = {
      "access_token": activeApiKey,
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
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
