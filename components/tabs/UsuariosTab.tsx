import React, { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { 
  Search, 
  Loader2, 
  Trash, 
  Edit3, 
  RefreshCw, 
  Eye, 
  ShieldCheck, 
  Clock, 
  Key, 
  X, 
  BadgeCheck, 
  CalendarDays, 
  UserPlus2,
  Mail,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  DollarSign
} from 'lucide-react';

interface UsuariosTabProps {
  perfis: any[];
  SortHeader: React.ElementType;
  loading: boolean;
  handleApproveUser: (id: string) => void;
  handleChangeRole: (id: string, role: string) => void;
  handleDeleteUser: (id: string, role: string) => Promise<any>;
  onEditUser: (user: any) => void;
  onSyncData?: () => void;
}

export const UsuariosTab: React.FC<UsuariosTabProps> = ({
  perfis,
  SortHeader,
  loading,
  handleApproveUser,
  handleChangeRole,
  handleDeleteUser,
  onEditUser,
  onSyncData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'ALL' | 'INICIANTE' | 'PROFISSIONAL' | 'ILIMITADO' | 'GRATUITO'>('ALL');
  const [syncLoading, setSyncLoading] = useState(false);
  const [userSyncLoading, setUserSyncLoading] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [quickTrialUser, setQuickTrialUser] = useState<any>(null);
  const [quickTrialDays, setQuickTrialDays] = useState('7');
  const [resetPwdUser, setResetPwdUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [localMessage, setLocalMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSyncUserWithAsaas = async (userId: string) => {
    setUserSyncLoading(userId);
    try {
      const supabase = getSupabase();
      const sessionRes = await supabase?.auth?.getSession().catch(() => ({ data: { session: null } }));
      const userToken = sessionRes?.data?.session?.access_token || '';

      const res = await fetch('/api/asaas/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, supabaseToken: userToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro desconhecido na sincronização.');
      }

      if (data.success) {
        showMessage(data.message || 'Usuário sincronizado com sucesso!');
        if (onSyncData) await onSyncData(); // Atualiza a tabela chamando o callback do pai (fetchData)
      } else {
        showMessage(data.message || 'Não foi possível sincronizar o usuário.', 'error');
      }
    } catch (err: any) {
      console.error('Erro de sync individual:', err);
      showMessage('Falha ao sincronizar: ' + (err.message || err.toString()), 'error');
    } finally {
      setUserSyncLoading(null);
    }
  };

  const handleResendConfirmationUser = async (id: string, email: string) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) {
        throw error;
      }
      showMessage("E-mail de confirmação reenviado com sucesso!");
    } catch (err: any) {
      showMessage("Erro ao reenviar e-mail: " + (err.message || err.toString()), 'error');
    }
  };

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setLocalMessage({ text, type });
    setTimeout(() => setLocalMessage(null), 4000);
  };

  const handleSyncButton = async () => {
    if (onSyncData) {
      setSyncLoading(true);
      await onSyncData();
      setSyncLoading(false);
      showMessage('Dados sincronizados com sucesso!');
    }
  };

  const handleExtendTrial = async () => {
    if (!quickTrialUser) return;
    try {
      const days = parseInt(quickTrialDays, 10);
      const newTrialEnds = new Date();
      newTrialEnds.setDate(newTrialEnds.getDate() + days);
      
      const { data, error } = await require('@/lib/supabase').supabase
        .from('user_profiles')
        .update({ 
          trial_ends_at: newTrialEnds.toISOString(),
          status_pagamento: 'TRIAL',
          plano: 'Trial'
        })
        .eq('id', quickTrialUser.id);
        
      if (error) throw error;
      
      showMessage(`Acesso Trial estendido por mais ${days} dias!`);
      setQuickTrialUser(null);
      if (onSyncData) onSyncData();
    } catch (err: any) {
      showMessage(err.message || 'Erro ao estender o trial.', 'error');
    }
  };

  const handleForcePasswordReset = async () => {
    if (!resetPwdUser) return;
    try {
      // Usando supabase.auth para enviar o e-mail de recuperação
      const { error } = await require('@/lib/supabase').supabase.auth.resetPasswordForEmail(resetPwdUser.email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) throw error;
      showMessage(`E-mail de recuperação enviado para ${resetPwdUser.email}!`);
      setResetPwdUser(null);
    } catch (err: any) {
      showMessage(err.message || 'Erro ao enviar e-mail de recuperação.', 'error');
    }
  };

  const executeUserDeletion = async () => {
    if (!deletingUser) return;
    
    const expectedName = (deletingUser.nome || '').trim().toLowerCase();
    const typedName = deleteConfirmationName.trim().toLowerCase();
    
    if (expectedName !== typedName) {
      setDeleteError('O nome digitado não corresponde exatamente ao nome do usuário.');
      return;
    }
    
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const response = await handleDeleteUser(deletingUser.id, deletingUser.role);
      if (response && response.error) {
        throw new Error(response.error);
      }
      showMessage('Usuário removido com sucesso!');
      setDeletingUser(null);
      setDeleteConfirmationName('');
      if (onSyncData) onSyncData();
    } catch (err: any) {
      console.error('Erro ao excluir usuário:', err);
      setDeleteError(err.message || 'Ocorreu um erro ao tentar excluir o usuário.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtragem de dados
  const filteredPerfis = perfis.filter(p => {
    // 1. Aplicar filtro de plano se ativo
    if (planFilter !== 'ALL') {
      const pName = (p.plano || '').trim().toLowerCase();
      const isFree = pName === '' || pName === 'nenhum' || pName === 'gratuito';
      if (planFilter === 'INICIANTE' && !pName.includes('iniciante')) return false;
      if (planFilter === 'PROFISSIONAL' && !pName.includes('profissional') && !pName.includes('pro')) return false;
      if (planFilter === 'ILIMITADO' && !pName.includes('ilimitado')) return false;
      if (planFilter === 'GRATUITO' && !isFree) return false;
    }

    // 2. Aplicar termo de busca
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const nome = (p.nome || '').toLowerCase();
    const email = (p.email || '').toLowerCase();
    const cpf = (p.cpf || '').toLowerCase();
    const role = (p.role || '').toLowerCase();
    const plano = (p.plano || '').toLowerCase();
    return nome.includes(search) || email.includes(search) || cpf.includes(search) || role.includes(search) || plano.includes(search);
  });

  const getPlanPrice = (planName: string) => {
    const cleanName = (planName || '').trim().toLowerCase();
    const isAnual = cleanName.includes('anual');
    if (cleanName.includes('iniciante')) return isAnual ? 15.90 : 19.90;
    if (cleanName.includes('profissional') || cleanName.includes('pro')) return isAnual ? 15.90 : 19.90;
    if (cleanName.includes('ilimitado')) return isAnual ? 15.90 : 19.90;
    return 0;
  };

  const getPlanNameFormatted = (planName: string) => {
    const cleanName = (planName || '').trim().toLowerCase();
    const isAnual = cleanName.includes('anual');
    if (cleanName.includes('iniciante')) return isAnual ? 'Iniciante Anual [Upgrade] (R$ 15,90/mês)' : 'Iniciante Mensal [Upgrade] (R$ 19,90/mês)';
    if (cleanName.includes('profissional') || cleanName.includes('pro')) return isAnual ? 'Profissional Anual [Upgrade] (R$ 15,90/mês)' : 'Profissional Mensal [Upgrade] (R$ 19,90/mês)';
    if (cleanName.includes('ilimitado')) return isAnual ? 'Ilimitado Anual (R$ 15,90/mês)' : 'Ilimitado Mensal (R$ 19,90/mês)';
    return 'Nenhum / Gratuito';
  };

  const isTrialActive = (trialEnds: string | null) => {
    if (!trialEnds) return false;
    return new Date(trialEnds) > new Date();
  };

  const filterSubscribers = (perfList: any[], status: 'paid' | 'overdue' | 'trial' | 'pending') => {
    return perfList.filter(p => {
      const isPaid = p.status_pagamento === 'PAGO';
      const isLate = p.status_pagamento === 'ATRASADO' || p.status_pagamento === 'VENCIDO';
      const trial = p.status_pagamento === 'TRIAL' || isTrialActive(p.trial_ends_at);
      
      if (status === 'paid') return isPaid;
      if (status === 'overdue') return isLate;
      if (status === 'trial') return trial && !isPaid;
      if (status === 'pending') return !isPaid && !isLate && !trial;
      return false;
    });
  };

  const assinantesPagos = filterSubscribers(perfis, 'paid');
  const assinantesAtrasados = filterSubscribers(perfis, 'overdue');
  const assinantesTrial = filterSubscribers(perfis, 'trial');
  const assinantesPendentes = filterSubscribers(perfis, 'pending');

  const totalMRR = assinantesPagos.reduce((sum, p) => sum + getPlanPrice(p.plano), 0);

  const countIniciante = perfis.filter(p => (p.plano || '').toLowerCase().includes('iniciante')).length;
  const countProfissional = perfis.filter(p => (p.plano || '').toLowerCase().includes('profissional') || (p.plano || '').toLowerCase().includes('pro')).length;
  const countIlimitado = perfis.filter(p => (p.plano || '').toLowerCase().includes('ilimitado')).length;
  const countGratuito = perfis.filter(p => {
    const pl = (p.plano || '').toLowerCase().trim();
    return pl === '' || pl === 'nenhum' || pl === 'gratuito';
  }).length;

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return 'Nunca';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return 'Nenhum';
      return d.toLocaleDateString('pt-BR');
    } catch (e) {
      return 'Nenhum';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {localMessage && (
        <div 
          className={`fixed top-4 right-4 z-[999] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 font-medium text-xs border ${
            localMessage.type === 'success' 
              ? 'bg-emerald-600 text-white border-emerald-700' 
              : 'bg-rose-600 text-white border-rose-700'
          }`}
        >
          {localMessage.type === 'success' ? <BadgeCheck size={16} /> : <AlertCircle size={16} />}
          <span>{localMessage.text}</span>
        </div>
      )}

      {/* PAINEL ADMINISTRATIVO HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-base font-semibold text-zinc-900 tracking-tight">Usuários & Assinantes</h1>
          <p className="text-xs text-zinc-500 font-normal mt-0.5">Gestão de acessos e status de faturamento integrado ao Asaas</p>
        </div>
        <button 
          onClick={handleSyncButton}
          disabled={syncLoading || loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors rounded-lg text-xs font-medium shadow-sm cursor-pointer shrink-0"
        >
          <RefreshCw size={13} className={syncLoading ? 'animate-spin' : ''} />
          Sincronizar Geral
        </button>
      </div>

      {/* DASHBOARD DE ASSINATURAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* MRR Card */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <span className="text-xs font-normal text-zinc-500">MRR Estimado (Recorrente)</span>
          <p className="text-xl font-semibold text-zinc-900 tracking-tight my-1">
            R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-zinc-400 font-normal">Planos ativos mensais</p>
        </div>

        {/* Paid Users Card */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-normal text-zinc-500">Assinaturas Pagas</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-xl font-semibold text-zinc-900 tracking-tight my-1">
            {assinantesPagos.length}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">Acesso total ativo</p>
        </div>

        {/* Due/Overdue Card */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-normal text-zinc-500">Em Débito</span>
            <span className={`w-2 h-2 rounded-full ${assinantesAtrasados.length > 0 ? 'bg-rose-500' : 'bg-zinc-300'}`} />
          </div>
          <p className="text-xl font-semibold text-zinc-900 tracking-tight my-1">
            {assinantesAtrasados.length}
          </p>
          <p className={`text-[11px] font-normal ${assinantesAtrasados.length > 0 ? 'text-rose-600 font-medium' : 'text-zinc-400'}`}>
            {assinantesAtrasados.length > 0 ? 'Pendência de pagamento' : 'Nenhum atraso'}
          </p>
        </div>

        {/* Pending / Trial Card */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-normal text-zinc-500">Período de Teste</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <p className="text-xl font-semibold text-zinc-900 tracking-tight my-1">
            {assinantesTrial.length + assinantesPendentes.length}
          </p>
          <p className="text-[11px] text-zinc-400 font-normal">
            {assinantesTrial.length} trial, {assinantesPendentes.length} sem plano
          </p>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setPlanFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              planFilter === 'ALL'
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            Todos ({perfis.length})
          </button>
          <button
            type="button"
            onClick={() => setPlanFilter('GRATUITO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              planFilter === 'GRATUITO'
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            Gratuito ({countGratuito})
          </button>
          <button
            type="button"
            onClick={() => setPlanFilter('ILIMITADO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              planFilter === 'ILIMITADO'
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            Ilimitado ({perfis.filter(p => {
              const pl = (p.plano || '').toLowerCase();
              return pl.includes('ilimitado') || pl.includes('iniciante') || pl.includes('profissional') || pl.includes('pro');
            }).length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome, e-mail ou CPF..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-zinc-200 focus:border-zinc-400 outline-none rounded-lg text-xs font-normal text-zinc-800 transition-colors placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* COMPREHENSIVE TABLE LAYOUT */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[950px]">
            <thead className="bg-zinc-50/75 border-b border-zinc-200/80 text-zinc-500 text-xs font-medium">
              <tr>
                <th className="px-4 py-3">Usuário</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Plano</th>
                <th className="px-4 py-3 text-center">Início</th>
                <th className="px-4 py-3 text-center">Expiração</th>
                <th className="px-4 py-3 text-center">Último Acesso</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-normal">
              {filteredPerfis.map((p) => {
                const isTrialActiveUser = isTrialActive(p.trial_ends_at);
                const isMaster = p.role === 'MASTER';
                const isPaid = isMaster || (p.status_pagamento === 'PAGO' && (p.trial_ends_at && new Date(p.trial_ends_at) > new Date()));
                const isLate = !isMaster && ((p.status_pagamento === 'ATRASADO' || p.status_pagamento === 'VENCIDO') || (p.status_pagamento === 'PAGO' && p.trial_ends_at && new Date(p.trial_ends_at) <= new Date()));
                const isTrial = !isMaster && (p.status_pagamento === 'TRIAL' || (!isPaid && !isLate && isTrialActiveUser));

                return (
                  <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                    {/* USUÁRIO (ROLE) */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-zinc-900 leading-tight">
                          {p.nome || 'Sem nome'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {p.role || 'USER'}
                          </span>
                          {!p.approved && (
                            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded">Pendente</span>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* CPF */}
                    <td className="px-4 py-3 font-mono text-zinc-500 text-[11px]">{p.cpf || '—'}</td>
                    {/* E-MAIL */}
                    <td className="px-4 py-3 text-zinc-600 truncate max-w-[180px]">{p.email || '—'}</td>
                    {/* STATUS PAGAMENTO */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${
                        isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                        isLate ? 'bg-rose-50 text-rose-700 border-rose-200/60' :
                        isTrial ? 'bg-amber-50 text-amber-700 border-amber-200/60' :
                        p.status_pagamento === 'PENDENTE' ? 'bg-purple-50 text-purple-700 border-purple-200/60' :
                        'bg-zinc-100 text-zinc-600 border-zinc-200/60'
                      }`}>
                        {isPaid ? 'Pago' :
                         isLate ? 'Atrasado' :
                         isTrial ? 'Trial' :
                         p.status_pagamento === 'PENDENTE' ? 'Pendente' :
                         p.status_pagamento || 'Sem assinatura'}
                      </span>
                    </td>
                    {/* PLANO & VALOR */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200/60">
                        {p.plano || 'Nenhum'}
                      </span>
                    </td>
                    {/* INÍCIO */}
                    <td className="px-4 py-3 text-center text-zinc-500 text-[11px]">{formatDate(p.created_at)}</td>
                    {/* EXPIRAÇÃO */}
                    <td className="px-4 py-3 text-center text-zinc-500 text-[11px]">{formatDate(p.trial_ends_at)}</td>
                    {/* ÚLTIMO ACESSO */}
                    <td className="px-4 py-3 text-center text-zinc-500 text-[11px]">{formatDate(p.last_access)}</td>
                    {/* AÇÕES COMPLETO */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end items-center gap-1">
                        {/* LIVE ASAAS SYNC */}
                        <button 
                          onClick={() => handleSyncUserWithAsaas(p.id)}
                          disabled={userSyncLoading === p.id}
                          className="text-zinc-400 hover:text-zinc-900 p-1.5 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Sincronizar com Asaas"
                        >
                          {userSyncLoading === p.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <RefreshCw size={13} />
                          )}
                        </button>
                        {/* VIEW ACTION */}
                        <button 
                          onClick={() => setViewingUser(p)}
                          className="text-zinc-400 hover:text-zinc-900 p-1.5 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                          title="Visualizar Detalhes"
                        >
                          <Eye size={13} />
                        </button>
                        {/* VALIDATE/APPROVE ACTION */}
                        {!p.approved && (
                          <>
                            <button 
                              onClick={() => handleApproveUser(p.id)}
                              className="text-emerald-600 hover:text-emerald-800 p-1.5 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Aprovar Usuário"
                            >
                              <ShieldCheck size={13} />
                            </button>
                            <button 
                              onClick={() => handleResendConfirmationUser(p.id, p.email)}
                              className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Reenviar E-mail"
                            >
                              <Mail size={13} />
                            </button>
                          </>
                        )}
                        {/* QUICK TRIAL CALENDAR */}
                        <button 
                          onClick={() => setQuickTrialUser(p)}
                          className="text-zinc-400 hover:text-zinc-900 p-1.5 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                          title="Período Trial"
                        >
                          <Clock size={13} />
                        </button>
                        {/* PASSWORD RESET ACTION */}
                        <button 
                          onClick={() => setResetPwdUser(p)}
                          className="text-zinc-400 hover:text-zinc-900 p-1.5 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                          title="Recuperar Senha"
                        >
                          <Key size={13} />
                        </button>
                        {/* EDIT ACTION */}
                        <button 
                          onClick={() => onEditUser(p)}
                          className="text-zinc-400 hover:text-zinc-900 p-1.5 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                          title="Editar Usuário"
                        >
                          <Edit3 size={13} />
                        </button>
                        {/* DELETE ACTION */}
                        <button 
                          onClick={() => {
                            setDeletingUser(p);
                            setDeleteConfirmationName('');
                            setDeleteError(null);
                          }}
                          disabled={p.role === 'MASTER'}
                          className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                          title="Remover Usuário"
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPerfis.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-zinc-400 font-normal">Nenhum usuário encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK VIEW DETAILS MODAL */}
      {viewingUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative overflow-hidden border border-zinc-200">
            <button 
              onClick={() => setViewingUser(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors p-1 cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-zinc-100 text-zinc-800 rounded-lg flex items-center justify-center text-sm font-semibold">
                {viewingUser.nome ? viewingUser.nome.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">{viewingUser.nome || 'Usuário sem Nome'}</h3>
                <p className="text-xs text-zinc-500 font-mono">{viewingUser.role || 'USER'}</p>
              </div>
            </div>

            <div className="space-y-3.5 border-t border-b border-zinc-100 py-4 mb-5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-0.5">E-mail</label>
                  <p className="font-medium text-zinc-800 break-all">{viewingUser.email || '—'}</p>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-0.5">CPF</label>
                  <p className="font-mono text-zinc-800">{viewingUser.cpf || '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-0.5">Status de Acesso</label>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${
                    viewingUser.approved ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-amber-50 text-amber-700 border-amber-200/60'
                  }`}>
                    {viewingUser.approved ? 'Aprovado' : 'Aguardando'}
                  </span>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-0.5">Status Pagamento</label>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${
                    viewingUser.status_pagamento === 'PAGO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                    (viewingUser.status_pagamento === 'ATRASADO' || viewingUser.status_pagamento === 'VENCIDO') ? 'bg-rose-50 text-rose-700 border-rose-200/60' :
                    'bg-zinc-100 text-zinc-700 border-zinc-200/60'
                  }`}>
                    {viewingUser.status_pagamento || 'Sem assinatura'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-0.5">Data de Expiração</label>
                  <p className="text-zinc-800">{formatDate(viewingUser.trial_ends_at)}</p>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-0.5">Plano</label>
                  <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-[10px] font-medium inline-block">{viewingUser.plano || 'Nenhum'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setViewingUser(null)}
                className="px-3.5 py-2 text-zinc-600 hover:text-zinc-900 rounded-lg transition-colors text-xs font-medium cursor-pointer"
              >
                Voltar
              </button>
              <button 
                onClick={() => {
                  setViewingUser(null);
                  onEditUser(viewingUser);
                }}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-colors text-xs font-medium shadow-sm cursor-pointer"
              >
                Editar Perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK EXPIRATION / TRIAL MODIFIER MODAL */}
      {quickTrialUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative overflow-hidden border border-zinc-200">
            <button 
              onClick={() => setQuickTrialUser(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors p-1 cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                <Clock size={16} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Alterar Período Trial</h3>
            </div>
            <p className="text-xs text-zinc-500 mb-4 font-normal leading-relaxed">
              Defina os dias adicionais para o período de teste do usuário <strong className="text-zinc-800 font-medium">{quickTrialUser.nome}</strong>.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[11px] font-medium text-zinc-600 mb-1 block">Selecione o período</label>
                <select 
                  value={quickTrialDays}
                  onChange={(e) => setQuickTrialDays(e.target.value)}
                  className="w-full border border-zinc-200 outline-none rounded-lg px-3 py-2 text-xs font-normal text-zinc-800 transition-colors bg-white focus:border-zinc-400"
                >
                  <option value="7">Estender +7 Dias</option>
                  <option value="15">Estender +15 Dias</option>
                  <option value="30">Estender +30 Dias (1 Mês)</option>
                  <option value="60">Estender +60 Dias (2 Meses)</option>
                  <option value="90">Estender +90 Dias (3 Meses)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setQuickTrialUser(null)}
                className="px-3 py-1.5 text-zinc-600 hover:text-zinc-900 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleExtendTrial}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer"
              >
                Salvar Período
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECOVERY MODAL FOR USER FROM ADMIN FLOW */}
      {resetPwdUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative overflow-hidden border border-zinc-200">
            <button 
              onClick={() => setResetPwdUser(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors p-1 cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Key size={16} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Recuperar Senha</h3>
            </div>
            <p className="text-xs text-zinc-500 mb-5 font-normal leading-relaxed">
              Deseja enviar instruções de redefinição de senha para <strong className="text-zinc-800 font-medium">{resetPwdUser.nome}</strong> no e-mail <strong className="text-zinc-800 font-medium">{resetPwdUser.email}</strong>?
            </p>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setResetPwdUser(null)}
                className="px-3 py-1.5 text-zinc-600 hover:text-zinc-900 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleForcePasswordReset}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer"
              >
                Enviar E-mail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXCLUSÃO DE USUÁRIO COM CONFIRMAÇÃO DE NOME */}
      {deletingUser && (
        <div id="modal-delete-user-root" className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative overflow-hidden border border-zinc-200">
            <button 
              onClick={() => setDeletingUser(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors p-1 cursor-pointer"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
                <Trash size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Excluir Usuário</h3>
                <p className="text-xs text-zinc-500 font-normal mt-0.5">Esta ação é irreversível</p>
              </div>
            </div>

            <p className="text-xs text-zinc-500 mb-3 font-normal leading-relaxed">
              O usuário <strong className="text-zinc-800 font-medium">{deletingUser.nome}</strong> terá seu acesso revogado e perfil removido.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[11px] font-medium text-zinc-600 mb-1.5 block">
                  Digite <span className="font-semibold text-zinc-800">{deletingUser.nome}</span> para confirmar:
                </label>
                <input 
                  type="text"
                  placeholder="Nome completo do usuário"
                  value={deleteConfirmationName}
                  onChange={(e) => {
                    setDeleteConfirmationName(e.target.value);
                    setDeleteError(null);
                  }}
                  className="w-full border border-zinc-200 focus:border-rose-400 outline-none rounded-lg px-3 py-2 text-xs font-normal text-zinc-800 transition-colors"
                />
                
                {deleteError && (
                  <p className="text-rose-600 text-xs font-normal mt-1.5 flex items-center gap-1">
                    <AlertCircle size={13} className="shrink-0" />
                    {deleteError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setDeletingUser(null)}
                disabled={deleteLoading}
                className="px-3.5 py-2 text-zinc-600 hover:text-zinc-900 disabled:opacity-50 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={executeUserDeletion}
                disabled={deleteLoading || deleteConfirmationName.trim().toLowerCase() !== (deletingUser.nome || '').trim().toLowerCase()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-zinc-100 disabled:text-zinc-400 text-white rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer"
              >
                {deleteLoading && <Loader2 size={13} className="animate-spin" />}
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
