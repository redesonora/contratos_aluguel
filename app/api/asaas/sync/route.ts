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
  } catch (e) {
    // ignore
  }
  return `${fallback} (${errText || "unspecified issues"})`;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, supabaseToken } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Defina o ID do usuário para sincronização." }, { status: 400 });
    }

    // 1. Obter conexão com o Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || (!supabaseAnonKey && !serviceRoleKey)) {
      return NextResponse.json({ error: "Configurações de Supabase ausentes." }, { status: 500 });
    }

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

    // 2. Tentar obter os dados do usuário a ser sincronizado
    const { data: userToSync, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !userToSync) {
      return NextResponse.json({ error: "Usuário não localizado no banco de dados." }, { status: 404 });
    }

    // 3. Tentar obter as chaves do perfil de MASTER no banco de dados para autenticar no Asaas
    let dbKey = "";
    let dbEnv = "";
    try {
      const { data: masterProf } = await supabase
        .from('user_profiles')
        .select('asaas_key, asaas_env')
        .eq('role', 'MASTER')
        .not('asaas_key', 'is', null)
        .neq('asaas_key', '')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (masterProf) {
        dbKey = masterProf.asaas_key || "";
        dbEnv = masterProf.asaas_env || "";
      }
    } catch (dbErr) {
      console.warn("Erro ao ler credenciais do MASTER para faturamento:", dbErr);
    }

    // Resolvendo a chave da API do Asaas de forma inteligente
    const activeApiKey = dbKey || 
      process.env.ASAAS_API_KEY || 
      process.env.NEXT_PUBLIC_ASAAS_API_KEY || 
      process.env.NEXT_PUBLIC_ASAAS_API_KE || 
      process.env.ASAAS_API_KE;

    const activeEnv = dbEnv || 
      process.env.ASAAS_ENV || 
      process.env.NEXT_PUBLIC_ASAAS_ENV || 
      process.env.NEXT_PUBLIC_ASAAS_EN || 
      process.env.ASAAS_EN || 
      "sandbox";

    if (!activeApiKey) {
      return NextResponse.json({ 
        error: "Chave do Asaas do MASTER não configurada no banco de dados. Configure a chave em Integrações para permitir sincronizações." 
      }, { status: 400 });
    }

    const baseUrl = activeEnv === "production" ? "https://api.asaas.com/v3" : "https://sandbox.asaas.com/api/v3";
    const headers = {
      "access_token": activeApiKey,
      "Content-Type": "application/json",
      "User-Agent": "RealizzeApp Sync Service"
    };

    const cleanCpfCnpj = (userToSync.cpf || "").replace(/\D/g, "");
    if (!cleanCpfCnpj) {
      return NextResponse.json({ 
        success: false, 
        message: "O usuário não possui CPF/CNPJ cadastrado. Não é possível sincronizar com o Asaas.",
        status_pagamento: userToSync.status_pagamento || "SEM ASSINATURA",
        plano: userToSync.plano || "Nenhum",
        valor: 0
      });
    }

    // 4. Buscar cliente por CPF/CNPJ no Asaas
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
      console.error("Erro ao buscar cliente no Asaas de sync:", err);
    }

    if (!customerId) {
      return NextResponse.json({
        success: true,
        synchronized: true,
        message: "Nenhum cadastro de faturamento ou cliente localizado no Asaas para este CPF.",
        status_pagamento: userToSync.status_pagamento || "SEM ASSINATURA",
        plano: userToSync.plano || "Nenhum",
        valor: 0
      });
    }

    // 5. Buscar cobranças/pagamentos vinculados a esse cliente do Asaas
    const paymentsRes = await fetch(`${baseUrl}/payments?customer=${customerId}&limit=20`, {
      method: "GET",
      headers
    });

    if (!paymentsRes.ok) {
      const errText = await paymentsRes.text();
      return NextResponse.json({ 
        error: parseAsaasError(errText, "Falha ao obter extrato de faturamentos no Asaas.") 
      }, { status: 400 });
    }

    const paymentsData = await paymentsRes.json();
    const paymentsList = paymentsData.data || [];

    // Se houver cobranças, analisar a mais recente ou que seja relacionada à Realizze / planos
    let matchedPayment = null;
    if (paymentsList.length > 0) {
      // Priorizar cobranças relativas a planos (externalReference contendo ID ou nome do plano) ou pegar a última criada
      matchedPayment = paymentsList.find((p: any) => p.externalReference && p.externalReference.includes(userId)) || paymentsList[0];
    }

    let finalStatus = userToSync.status_pagamento || "SEM ASSINATURA";
    let planPrice = 0;
    let syncedPlano = userToSync.plano || "Nenhum";
    let syncedTrialEnds = userToSync.trial_ends_at;

    if (matchedPayment) {
      const asaasStatus = matchedPayment.status; // RECEIVED, CONFIRMED, OVERDUE, PENDING, etc.
      planPrice = matchedPayment.value || 0;

      if (asaasStatus === "RECEIVED" || asaasStatus === "CONFIRMED") {
        finalStatus = "PAGO";
        
        // Calcular expiração correta e nome descritivo do plano a partir das referências externas (externalReference) do Asaas
        const extRef = matchedPayment.externalReference || "";
        const parts = extRef.split("_");
        if (parts.length >= 3) {
          const planNameFromRef = parts[1];
          const cycleFromRef = parts[2];
          const isAnual = cycleFromRef === "anual";
          const refDate = matchedPayment.confirmedDate ? new Date(matchedPayment.confirmedDate) : new Date();
          
          const expDate = new Date(refDate);
          if (isAnual) {
            expDate.setFullYear(refDate.getFullYear() + 1);
          } else {
            expDate.setMonth(refDate.getMonth() + 1);
          }
          
          syncedTrialEnds = expDate.toISOString();
          syncedPlano = isAnual ? `${planNameFromRef} Anual` : `${planNameFromRef} Mensal`;
        }
      } else if (asaasStatus === "OVERDUE") {
        finalStatus = "ATRASADO";
      } else if (asaasStatus === "PENDING") {
        // Verificar se já passou a data de vencimento
        const dueDate = new Date(matchedPayment.dueDate);
        const today = new Date();
        // Reset time parts for accurate date-only comparison
        dueDate.setHours(23, 59, 59, 999);
        if (dueDate < today) {
          finalStatus = "ATRASADO";
        } else {
          finalStatus = "PENDENTE";
        }
      } else if (asaasStatus === "DUNNING" || asaasStatus === "CHARGEBACK") {
        finalStatus = "ATRASADO";
      } else if (asaasStatus === "REFUNDED") {
        finalStatus = "SEM ASSINATURA";
      }
    } else {
      // Se tiver trial ativo, mantém como TRIAL
      const now = new Date();
      if (userToSync.trial_ends_at && new Date(userToSync.trial_ends_at) > now) {
        finalStatus = "TRIAL";
      } else {
        finalStatus = "SEM ASSINATURA";
      }
    }

    // 6. Atualizar status de pagamento do usuário no banco caso seja diferente do atual ou o plano e data de expiração tenham mudado
    const hasStatusChanged = finalStatus !== userToSync.status_pagamento;
    const hasPlanoChanged = syncedPlano !== userToSync.plano;
    const hasTrialEndsChanged = syncedTrialEnds !== userToSync.trial_ends_at;

    if (hasStatusChanged || hasPlanoChanged || hasTrialEndsChanged) {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          status_pagamento: finalStatus,
          plano: syncedPlano,
          trial_ends_at: syncedTrialEnds
        })
        .eq('id', userId);

      if (updateError) {
        console.error("Erro ao salvar sincronização de faturamento no banco:", updateError);
      }
    }

    return NextResponse.json({
      success: true,
      synchronized: true,
      message: matchedPayment 
        ? `Status atualizado com sucesso via Asaas (Valor da última cobrança: R$ ${planPrice.toFixed(2)})`
        : "Nenhuma cobrança ativa cadastrada no Asaas. Período trial avaliado localmente.",
      status_pagamento: finalStatus,
      plano: userToSync.plano || "Nenhum",
      valor: planPrice,
      paymentDetails: matchedPayment ? {
        id: matchedPayment.id,
        status: matchedPayment.status,
        billingType: matchedPayment.billingType,
        value: matchedPayment.value,
        dueDate: matchedPayment.dueDate,
        invoiceUrl: matchedPayment.invoiceUrl,
        bankSlipUrl: matchedPayment.bankSlipUrl,
        confirmedDate: matchedPayment.confirmedDate
      } : null
    });

  } catch (error: any) {
    console.error("Erro crítico ao sincronizar usuário com Asaas:", error);
    return NextResponse.json({ error: error.message || "Erro interno de sincronização." }, { status: 500 });
  }
}
