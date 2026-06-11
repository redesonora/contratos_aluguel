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
      const { data: sessionData } = await supabase.auth.getSession();
      const userToken = sessionData?.session?.access_token || '';

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
    <div className="space-y-6">
      {/* Toast Alert */}
      {localMessage && (
        <div 
          className={`fixed top-4 right-4 z-[999] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold text-xs transition-all uppercase tracking-widest border ${
            localMessage.type === 'success' 
              ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-100' 
              : 'bg-red-500 text-white border-red-600 shadow-red-100'
          }`}
        >
          {localMessage.type === 'success' ? <BadgeCheck size={18} /> : <AlertCircle size={18} />}
          <span>{localMessage.text}</span>
        </div>
      )}

      {/* PAINEL ADMINISTRATIVO HEADER (ESTILO PRINT) */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
            <UserPlus2 size={32} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3.5xl font-black text-slate-800 tracking-tight uppercase">Painel de Usuários & Assinantes</h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Status de Faturamento Synced com Asaas</p>
          </div>
        </div>
        <button 
          onClick={handleSyncButton}
          disabled={syncLoading || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all text-white font-black uppercase text-xs tracking-widest px-8 py-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-blue-100 active:scale-95 shrink-0"
        >
          <RefreshCw size={16} className={`${syncLoading ? 'animate-spin' : ''}`} />
          Sincronizar Geral (Cadastro)
        </button>
      </div>

      {/* BENTO DASHBOARD DE ASSINATURAS (ASAAS CONTROL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-100 border border-emerald-500/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100/80 mb-2">MRR Estimado (Recorrente)</p>
          <p className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-emerald-100 font-semibold uppercase tracking-wide">
            Soma dos planos pagos ativos
          </p>
        </div>

        {/* Paid Users Card */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assinaturas Pagas</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-2.5xl font-black text-slate-800 tracking-tight leading-none mb-2">
              {assinantesPagos.length} Clientes
            </p>
          </div>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
            ✓ Acesso Total Seguro
          </p>
        </div>

        {/* Due/Overdue Card */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clientes em Débito</span>
              <span className={`w-2.5 h-2.5 rounded-full ${assinantesAtrasados.length > 0 ? 'bg-red-500 animate-bounce' : 'bg-slate-300'}`} />
            </div>
            <p className="text-2.5xl font-black text-slate-800 tracking-tight leading-none mb-2">
              {assinantesAtrasados.length} Pendentes
            </p>
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${assinantesAtrasados.length > 0 ? 'text-red-500' : 'text-slate-400'}`}>
            ⚠️ {assinantesAtrasados.length > 0 ? 'Inadimplência ou Atrasados' : 'Nenhum atraso crítico'}
          </p>
        </div>

        {/* Pending / Trial Card */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trial / Sem Limite</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <p className="text-2.5xl font-black text-slate-800 tracking-tight leading-none mb-2">
              {assinantesTrial.length + assinantesPendentes.length} Cadastros
            </p>
          </div>
          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1">
            ⌛ {assinantesTrial.length} em trial, {assinantesPendentes.length} sem plano
          </p>
        </div>
      </div>

      {/* CARD DE FILTROS POR PLANO COM QTD DE CLIENTES */}
      <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-50 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Controle de Assinantes por Plano</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Clique nos cartões de plano para filtrar a tabela de usuários imediatamente</p>
          </div>
          {/* Badge indicator if any filter is active */}
          {planFilter !== 'ALL' && (
            <button 
              type="button"
              onClick={() => setPlanFilter('ALL')}
              className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1 bg-blue-50 px-3.5 py-2 rounded-xl transition-colors active:scale-95"
            >
              × Limpar Filtro de Planos
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
          {/* Option 1: Todos */}
          <button
            type="button"
            id="filter-btn-all"
            onClick={() => setPlanFilter('ALL')}
            className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group cursor-pointer active:scale-[0.98] ${
              planFilter === 'ALL'
                ? 'border-blue-600 bg-blue-50/30 shadow-md shadow-blue-50/50'
                : 'border-slate-100 bg-slate-50/30 hover:border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-[9px] font-black uppercase tracking-wider ${planFilter === 'ALL' ? 'text-blue-700' : 'text-slate-400'}`}>
                Todos
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${planFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-200/80 text-slate-600'}`}>
                {perfis.length}
              </span>
            </div>
            <p className="text-sm font-black text-slate-700 mt-2 tracking-tight">Geral</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-wide">Todos usuários</p>
          </button>

          {/* Option 2: Gratuito */}
          <button
            type="button"
            id="filter-btn-gratuito"
            onClick={() => setPlanFilter('GRATUITO')}
            className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group cursor-pointer active:scale-[0.98] ${
              planFilter === 'GRATUITO'
                ? 'border-slate-600 bg-slate-100 shadow-md shadow-slate-100/50'
                : 'border-slate-100 bg-slate-50/30 hover:border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-[9px] font-black uppercase tracking-wider ${planFilter === 'GRATUITO' ? 'text-slate-700' : 'text-slate-400'}`}>
                Gratuito
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${planFilter === 'GRATUITO' ? 'bg-slate-600 text-white' : 'bg-slate-200/80 text-slate-600'}`}>
                {countGratuito}
              </span>
            </div>
            <p className="text-sm font-black text-slate-700 mt-2 tracking-tight">Gratuito / Nenhum</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-wide">Limite de 1 imóvel</p>
          </button>

          {/* Option 3: Ilimitado */}
          <button
            type="button"
            id="filter-btn-ilimitado"
            onClick={() => setPlanFilter('ILIMITADO')}
            className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group cursor-pointer active:scale-[0.98] ${
              planFilter === 'ILIMITADO'
                ? 'border-purple-600 bg-purple-50/30 shadow-md shadow-purple-50/50'
                : 'border-slate-100 bg-slate-50/30 hover:border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-[9px] font-black uppercase tracking-wider ${planFilter === 'ILIMITADO' ? 'text-purple-700' : 'text-slate-400'}`}>
                Ilimitado
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${planFilter === 'ILIMITADO' ? 'bg-purple-600 text-white' : 'bg-slate-200/80 text-slate-600'}`}>
                {perfis.filter(p => {
                  const pl = (p.plano || '').toLowerCase();
                  return pl.includes('ilimitado') || pl.includes('iniciante') || pl.includes('profissional') || pl.includes('pro');
                }).length}
              </span>
            </div>
            <p className="text-sm font-black text-slate-700 mt-2 tracking-tight">Ilimitado (R$ 19,90)</p>
            <p className="text-[9px] text-purple-600 font-bold uppercase mt-0.5 tracking-wide">Sem restrições</p>
          </button>
        </div>
      </div>

      {/* FILTRAGEM E BUSCA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Lista de Usuários no Sistema</h2>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide mt-1">Busque colaboradores, corretores e proprietários administrados</p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nome, e-mail ou CPF..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-50 focus:border-blue-400 outline-none rounded-2xl text-xs font-bold text-slate-700 transition-all placeholder:font-normal placeholder:text-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* COMPREHENSIVE TABLE LAYOUT (ESTILO PRINT) */}
      <div className="bg-white rounded-[2rem] border-2 border-slate-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-6 py-5">
                  <div className="flex items-center gap-1">
                    <span>Usuário</span>
                  </div>
                </th>
                <th className="px-6 py-5">Nome Completo</th>
                <th className="px-6 py-5">CPF</th>
                <th className="px-6 py-5">E-Mail</th>
                <th className="px-6 py-5 text-center">Status Pagamento</th>
                <th className="px-6 py-5 text-center">Plano & Valor</th>
                <th className="px-6 py-5 text-center">Início</th>
                <th className="px-6 py-5 text-center">Expiração</th>
                <th className="px-6 py-5 text-center">Último Acesso</th>
                <th className="px-6 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-semibold">
              {filteredPerfis.map((p) => {
                const isTrialActiveUser = isTrialActive(p.trial_ends_at);
                const isMaster = p.role === 'MASTER';
                const isPaid = isMaster || (p.status_pagamento === 'PAGO' && (p.trial_ends_at && new Date(p.trial_ends_at) > new Date()));
                const isLate = !isMaster && ((p.status_pagamento === 'ATRASADO' || p.status_pagamento === 'VENCIDO') || (p.status_pagamento === 'PAGO' && p.trial_ends_at && new Date(p.trial_ends_at) <= new Date()));
                const isTrial = !isMaster && (p.status_pagamento === 'TRIAL' || (!isPaid && !isLate && isTrialActiveUser));

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                    {/* USUÁRIO (ROLE) */}
                    <td className="px-6 py-4.5">
                      <div>
                        <p className="font-bold text-slate-800 tracking-tight leading-none mb-1 group-hover:text-blue-600 transition-colors">
                          {p.nome ? p.nome.split(' ')[0].toLowerCase() : 'usuário'}
                        </p>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {p.role || 'USER'}
                        </span>
                        {!p.approved && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded block mt-1">Pendente</span>
                        )}
                        {isLate && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-55 px-2 py-0.5 rounded block mt-1">Devendo</span>
                        )}
                      </div>
                    </td>
                    {/* NOME COMPLETO */}
                    <td className="px-6 py-4.5 font-bold text-slate-700">{p.nome || '--'}</td>
                    {/* CPF */}
                    <td className="px-6 py-4.5 font-mono text-slate-500 tracking-tighter">{p.cpf || '--'}</td>
                    {/* E-MAIL */}
                    <td className="px-6 py-4.5 text-slate-600 text-[11px] lowercase">{p.email || '--'}</td>
                    {/* STATUS PAGAMENTO */}
                    <td className="px-6 py-4.5 text-center">
                      <span className={`inline-block px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border text-center ${
                        isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' :
                        isLate ? 'bg-red-50 text-red-700 border-red-100/50 animate-pulse' :
                        isTrial ? 'bg-amber-50 text-amber-700 border-amber-100/50' :
                        p.status_pagamento === 'PENDENTE' ? 'bg-purple-50 text-purple-700 border-purple-100/50' :
                        'bg-slate-100 text-slate-500 border-slate-200/50'
                      }`}>
                        {isPaid ? 'PAGO (Em dia) ✅' :
                         isLate ? 'ATRASADO ⚠️' :
                         isTrial ? 'TRIAL (Testes) ⏳' :
                         p.status_pagamento === 'PENDENTE' ? 'COBRANÇA PENDENTE ⏳' :
                         p.status_pagamento || 'SEM ASSINATURA ❌'}
                      </span>
                    </td>
                    {/* PLANO & VALOR */}
                    <td className="px-6 py-4.5 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-bold text-center border uppercase tracking-wider ${
                          p.plano && p.plano.toUpperCase() !== 'NENHUM'
                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                            : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                          {p.plano || 'NENHUM'}
                        </span>
                        {p.plano && p.plano.toUpperCase() !== 'NENHUM' && (
                          <span className="text-[9px] text-slate-400 font-bold mt-1">
                            R$ {getPlanPrice(p.plano).toFixed(2)}/mês
                          </span>
                        )}
                      </div>
                    </td>
                    {/* INÍCIO */}
                    <td className="px-6 py-4.5 text-center text-slate-500">{formatDate(p.created_at)}</td>
                    {/* EXPIRAÇÃO */}
                    <td className="px-6 py-4.5 text-center">
                      <div>
                        <p className="text-slate-500 leading-none">{formatDate(p.trial_ends_at)}</p>
                        {isTrialActiveUser && !isPaid && (
                          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest block mt-0.5 animate-pulse">ATIVO</span>
                        )}
                      </div>
                    </td>
                    {/* ÚLTIMO ACESSO */}
                    <td className="px-6 py-4.5 text-center text-slate-500">{formatDate(p.last_access)}</td>
                    {/* AÇÕES COMPLETO */}
                    <td className="px-6 py-4.5">
                      <div className="flex justify-center items-center gap-1">
                        {/* LIVE ASAAS SYNC */}
                        <button 
                          onClick={() => handleSyncUserWithAsaas(p.id)}
                          disabled={userSyncLoading === p.id}
                          className="text-slate-400 hover:text-emerald-600 p-1.5 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-55"
                          title="Sincronizar com Asaas"
                        >
                          {userSyncLoading === p.id ? (
                            <Loader2 size={15} className="animate-spin text-emerald-600" />
                          ) : (
                            <RefreshCw size={15} />
                          )}
                        </button>
                        {/* VIEW ACTION */}
                        <button 
                          onClick={() => setViewingUser(p)}
                          className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all"
                          title="Visualizar Detalhes"
                        >
                          <Eye size={15} />
                        </button>
                        {/* VALIDATE/APPROVE ACTION */}
                        {!p.approved && (
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleApproveUser(p.id)}
                              className="text-emerald-500 hover:text-emerald-700 p-1.5 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Aprovar Usuário Manualmente"
                            >
                              <ShieldCheck size={15} />
                            </button>
                            <button 
                              onClick={() => handleResendConfirmationUser(p.id, p.email)}
                              className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded-lg transition-all"
                              title="Reenviar E-mail de Confirmação"
                            >
                              <Mail size={15} />
                            </button>
                          </div>
                        )}
                        {/* QUICK TRIAL CALENDAR */}
                        <button 
                          onClick={() => setQuickTrialUser(p)}
                          className="text-slate-400 hover:text-purple-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all"
                          title="Período Trial / Acesso"
                        >
                          <Clock size={15} />
                        </button>
                        {/* PASSWORD RESET ACTION */}
                        <button 
                          onClick={() => setResetPwdUser(p)}
                          className="text-slate-400 hover:text-orange-500 p-1.5 hover:bg-slate-100 rounded-lg transition-all"
                          title="Iniciar Recuperação de Senha"
                        >
                          <Key size={15} />
                        </button>
                        {/* EDIT ACTION */}
                        <button 
                          onClick={() => onEditUser(p)}
                          className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all"
                          title="Editar Usuário"
                        >
                          <Edit3 size={15} />
                        </button>
                        {/* DELETE ACTION */}
                        <button 
                          onClick={() => {
                            setDeletingUser(p);
                            setDeleteConfirmationName('');
                            setDeleteError(null);
                          }}
                          disabled={p.role === 'MASTER'}
                          className="text-slate-300 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Remover Usuário"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPerfis.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-20 text-slate-400 font-medium italic">Nenhum administrador ou usuário encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK VIEW DETAILS MODAL */}
      {viewingUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative overflow-hidden">
            <button 
              onClick={() => setViewingUser(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-black">
                {viewingUser.nome ? viewingUser.nome.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{viewingUser.nome || 'Usuário s/ Nome'}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{viewingUser.role || 'USER'}</p>
              </div>
            </div>

            <div className="space-y-4 border-t border-b border-slate-50 py-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">E-mail</label>
                  <p className="text-sm font-bold text-slate-700 break-all">{viewingUser.email || '--'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">CPF</label>
                  <p className="text-sm font-bold text-slate-700">{viewingUser.cpf || '--'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status de Acesso</label>
                  <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    viewingUser.approved ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                  }`}>
                    {viewingUser.approved ? 'Aprovado' : 'Aguardando Aprovação'}
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status Pagamento (Asaas)</label>
                  <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    viewingUser.status_pagamento === 'PAGO' ? 'bg-emerald-50 text-emerald-700' :
                    (viewingUser.status_pagamento === 'ATRASADO' || viewingUser.status_pagamento === 'VENCIDO') ? 'bg-red-50 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {viewingUser.status_pagamento || 'SEM ASSINATURA'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Data de Expiração / Trial</label>
                  <p className="text-sm font-bold text-slate-700">{formatDate(viewingUser.trial_ends_at)}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Plano & Mensalidade</label>
                  <div>
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest inline-block">{viewingUser.plano || 'Nenhum'}</span>
                    {viewingUser.plano && viewingUser.plano.toUpperCase() !== 'NENHUM' && (
                      <p className="text-xs text-slate-500 font-bold mt-1">R$ {getPlanPrice(viewingUser.plano).toFixed(2)}/mês</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setViewingUser(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 py-3 rounded-xl transition-all text-xs uppercase"
              >
                Voltar
              </button>
              <button 
                onClick={() => {
                  setViewingUser(null);
                  onEditUser(viewingUser);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl transition-all text-xs uppercase"
              >
                Editar Perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK EXPIRATION / TRIAL MODIFIER MODAL */}
      {quickTrialUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative overflow-hidden">
            <button 
              onClick={() => setQuickTrialUser(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="text-purple-600" size={24} />
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Alterar Período Trial</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
              Defina os dias adicionais para o período trial do usuário <strong className="text-slate-700">{quickTrialUser.nome}</strong>. O status será atualizado para TRIAL.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Selecione o período</label>
                <select 
                  value={quickTrialDays}
                  onChange={(e) => setQuickTrialDays(e.target.value)}
                  className="w-full border-2 border-slate-100 outline-none rounded-xl px-4 py-3 text-xs font-bold text-slate-700 transition-all appearance-none bg-white"
                >
                  <option value="7">Estender +7 Dias</option>
                  <option value="15">Estender +15 Dias</option>
                  <option value="30">Estender +30 Dias (1 Mês)</option>
                  <option value="60">Estender +60 Dias (2 Meses)</option>
                  <option value="90">Estender +90 Dias (3 Meses)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setQuickTrialUser(null)}
                className="px-4 py-2.5 text-slate-400 hover:text-slate-600 font-bold uppercase text-xs tracking-widest transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleExtendTrial}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95"
              >
                Salvar Periodo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECOVERY MODAL FOR USER FROM ADMIN FLOW */}
      {resetPwdUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative overflow-hidden">
            <button 
              onClick={() => setResetPwdUser(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Key className="text-orange-500" size={24} />
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Recuperar Senha</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
              Deseja enviar instruções de redefinição de senha para o usuário <strong className="text-slate-700">{resetPwdUser.nome}</strong> no e-mail <strong className="text-slate-700">{resetPwdUser.email}</strong>?
            </p>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setResetPwdUser(null)}
                className="px-4 py-2.5 text-slate-400 hover:text-slate-600 font-bold uppercase text-xs tracking-widest transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleForcePasswordReset}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95"
              >
                Enviar E-mail de Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXCLUSÃO DE USUÁRIO COM CONFIRMAÇÃO DE NOME */}
      {deletingUser && (
        <div id="modal-delete-user-root" className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative overflow-hidden border border-slate-150">
            <button 
              onClick={() => setDeletingUser(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center animate-pulse">
                <Trash size={22} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Excluir Usuário</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Aviso de Segurança Crítica</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
              Esta ação é <strong className="text-red-600">irreversível</strong> e removerá o perfil do colaborador <strong className="text-slate-700">{deletingUser.nome}</strong> permanentemente do banco de dados da <strong className="font-bold text-slate-800">REALIZZE</strong>.
            </p>

            <div className="bg-red-50/50 border border-red-100/30 rounded-2xl p-4 mb-5 text-xs font-semibold text-red-700 leading-relaxed">
              <span className="font-bold block uppercase tracking-wide text-[9px] text-red-600 mb-1">Atenção</span>
              A permissão de acesso e todas as vinculações deste usuário serão canceladas imediatamente.
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block leading-normal">
                  Para confirmar, digite exatamente o nome do usuário abaixo (<span className="text-slate-700 font-bold select-all italic bg-slate-50 px-1 py-0.5 rounded">{deletingUser.nome}</span>):
                </label>
                <input 
                  type="text"
                  placeholder="Digitar nome completo do usuário"
                  value={deleteConfirmationName}
                  onChange={(e) => {
                    setDeleteConfirmationName(e.target.value);
                    setDeleteError(null);
                  }}
                  className="w-full border-2 border-slate-100 focus:border-red-400 outline-none rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-700 transition-all placeholder:font-normal placeholder:text-slate-300"
                />
                
                {deleteError && (
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-wider mt-2.5 flex items-center gap-1.5 bg-red-50/60 p-2 rounded-xl border border-red-100/40">
                    <AlertCircle size={12} className="shrink-0" />
                    {deleteError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeletingUser(null)}
                disabled={deleteLoading}
                className="px-5 py-3 text-slate-400 hover:text-slate-600 disabled:opacity-50 font-black uppercase text-xs tracking-widest transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={executeUserDeletion}
                disabled={deleteLoading || deleteConfirmationName.trim().toLowerCase() !== (deletingUser.nome || '').trim().toLowerCase()}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-50 disabled:text-slate-300 disabled:shadow-none text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-100 active:scale-95 flex items-center gap-2"
              >
                {deleteLoading && <Loader2 size={12} className="animate-spin" />}
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
