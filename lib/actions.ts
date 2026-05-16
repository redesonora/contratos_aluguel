'use server';

import { supabase } from './supabase';

export async function registrarPagamento(formData: {
  contrato_id: string;
  valor_pago: number;
  competencia_mes: number;
  competencia_ano: number;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data: pagamento, error: payError } = await supabase
    .from('pagamentos')
    .insert([{ ...formData, user_id: user.id }])
    .select()
    .single();

  if (payError) throw payError;
  return pagamento;
}

export async function criarImovel(data: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Server Action Error: No user session found');
    throw new Error('Sua sessão expirou ou você não está logado. Por favor, faça login novamente.');
  }
  
  const { error } = await supabase
    .from('imoveis')
    .insert([{ ...data, user_id: user.id }]);

  if (error) {
    console.error('Database Error:', error);
    throw error;
  }
  return { success: true };
}

export async function criarInquilino(data: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Auth error');
  return await supabase.from('inquilinos').insert([{ ...data, user_id: user.id }]);
}

export async function criarContrato(data: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Auth error');
  return await supabase.from('contratos').insert([{ ...data, user_id: user.id }]);
}

export async function verificarPagamentoMesAtual(contrato_id: string) {
  const agora = new Date();
  const mes = agora.getMonth() + 1;
  const ano = agora.getFullYear();

  const { data, error } = await supabase
    .from('pagamentos')
    .select('id')
    .eq('contrato_id', contrato_id)
    .eq('competencia_mes', mes)
    .eq('competencia_ano', ano)
    .maybeSingle();

  if (error) return false;
  return !!data;
}

export async function getDashboardStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Query para contratos a vencer em 30/60 dias
  const hoje = new Date();
  const em30Dias = new Date();
  em30Dias.setDate(hoje.getDate() + 30);
  
  const { data: contratosVencendo } = await supabase
    .from('contratos')
    .select('*, imoveis(endereco), inquilinos(nome)')
    .lte('data_fim', em30Dias.toISOString().split('T')[0])
    .eq('status', 'ativo');

  return {
    contratosVencendo: contratosVencendo || [],
  };
}
