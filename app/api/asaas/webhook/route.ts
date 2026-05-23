import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { StatusPagamento } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    console.log("[Asaas Webhook] Recebendo nova requisição...");

    if (!rawBody) {
      return NextResponse.json({ error: "Payload vazio." }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const { event, payment } = payload;

    if (!event || !payment) {
      console.warn("[Asaas Webhook] Estrutura inválida ou evento não identificado.");
      return NextResponse.json({ error: "Estrutura do webhook inválida." }, { status: 400 });
    }

    const externalReference = payment.externalReference;
    console.log(`[Asaas Webhook] Evento: ${event} | ExternalRef: ${externalReference} | Status: ${payment.status}`);

    if (!externalReference) {
      console.log("[Asaas Webhook] Cobrança sem External Reference. Desconsiderando processamento.");
      return NextResponse.json({ received: true, ignored: true, reason: "No externalReference" });
    }

    const supabase = getSupabase();
    if (!supabase) {
      console.error("[Asaas Webhook] Supabase não pôde ser inicializado.");
      return NextResponse.json({ error: "Não foi possível conectar ao Supabase." }, { status: 500 });
    }

    // 1. Verificar se é uma cobrança de Assinatura/Upgrade de Plano de Usuário
    // Formato: `${userId}_${planName}_${cycle}` (Ex: "1efc5447-abc..._Profissional_mensal")
    const isPlanUpgradePattern = externalReference.includes("_") && externalReference.split("_").length >= 3;

    if (isPlanUpgradePattern) {
      const parts = externalReference.split("_");
      const userId = parts[0];
      const planName = parts[1];
      const cycle = parts[2];

      const validPlans = ["Iniciante", "Profissional", "Ilimitado"];
      if (validPlans.includes(planName)) {
        console.log(`[Asaas Webhook] Identificado pagamento de plano. Usuário: ${userId} | Plano: ${planName}`);

        // O pagamento de plano foi confirmado/recebido com sucesso?
        if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
          // Atualiza o perfil do usuário para o novo plano e o sinaliza como pago/aprovado
          const { error: updateProfileError } = await supabase
            .from("user_profiles")
            .update({
              plano: planName,
              status_pagamento: "PAGO",
              approved: true
            })
            .eq("id", userId);

          if (updateProfileError) {
            console.error(`[Asaas Webhook] Erro ao atualizar perfil do usuário ${userId}:`, updateProfileError);
            return NextResponse.json({ error: "Erro ao atualizar plano do usuário." }, { status: 500 });
          }

          // Registrar Log de Auditoria
          await supabase.from("audit_logs").insert([{
            user_id: userId,
            acao: "ASSINATURA_UPGRADE_WEBHOOK",
            tabela: "user_profiles",
            registro_id: userId,
            detalhes: {
              event,
              plano: planName,
              ciclo: cycle,
              paymentId: payment.id,
              integration: "asaas_webhook",
              value: payment.value,
              billingType: payment.billingType
            }
          }]).catch((logErr: any) => console.error("[Asaas Webhook] Erro ao inserir log de assinatura:", logErr));

          console.log(`[Asaas Webhook] Plano ${planName} ativado com sucesso para o usuário ${userId}`);
          return NextResponse.json({ success: true, message: `Plano ${planName} ativado para ${userId}` });
        } else if (event === "PAYMENT_OVERDUE") {
          // Marca a conta como vencida se o faturamento vencer sem pagamento
          await supabase
            .from("user_profiles")
            .update({
              status_pagamento: "VENCIDO"
            })
            .eq("id", userId)
            .catch((err: any) => console.error("[Asaas Webhook] Erro ao marcar perfil como vencido:", err));

          return NextResponse.json({ success: true, message: "Upgrade de plano do usuário marcado como vencido." });
        }

        return NextResponse.json({ received: true, message: "Ignorado - Evento não acionável para faturamento de plano." });
      }
    }

    // Se não for cobrança de plano, respondemos com sucesso, mas ignoramos
    console.log(`[Asaas Webhook] Evento ignorado (não é faturamento de plano do usuário): ${event}`);
    return NextResponse.json({ 
      success: true, 
      ignored: true,
      reason: "Rent payments/installments are not processed by Asaas in this system"
    });

  } catch (error: any) {
    console.error("[Asaas Webhook] Erro interno crítico do Webhook:", error);
    return NextResponse.json({ error: error.message || "Erro interno de servidor." }, { status: 500 });
  }
}
