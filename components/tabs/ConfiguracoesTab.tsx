import React, { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { 
  Settings, 
  Shield, 
  Palette, 
  Loader2,
  BadgeDollarSign,
  RefreshCw,
  Activity,
  Sparkles,
  ChevronRight,
  CreditCard
} from 'lucide-react';

interface ConfiguracoesTabProps {
  perfis?: any[];
  logs?: any[];
}

export const ConfiguracoesTab: React.FC<ConfiguracoesTabProps> = ({ perfis = [], logs = [] }) => {
  // States para Integração Asaas
  const [asaasApiKey, setAsaasApiKey] = useState('');
  const [asaasEnv, setAsaasEnv] = useState<'sandbox' | 'production'>('sandbox');
  const [asaasAutoBilling, setAsaasAutoBilling] = useState(false);
  const [isTestingAsaas, setIsTestingAsaas] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string; showSql?: boolean } | null>(null);

  // Procura no log por última sincronização do webhook do Asaas
  const lastAsaasWebhookLog = React.useMemo(() => {
    return logs.find(log => 
      log.acao === 'ASSINATURA_UPGRADE_WEBHOOK' || 
      log.acao?.toLowerCase().includes('asaas') ||
      (log.tabela === 'user_profiles' && log.detalhes?.integration === 'asaas_webhook')
    );
  }, [logs]);

  // Contagem de assinaturas ativas de outros usuários (apenas para MASTER)
  const activeSubscriptionsCount = React.useMemo(() => {
    if (!perfis || perfis.length === 0) return 0;
    // Conta perfis cujo plano não seja Gratuito e pagamento esteja PAGO ou ATIVO
    return perfis.filter(p => 
      p.plano && 
      p.plano !== 'Gratuito' && 
      (p.status_pagamento === 'PAGO' || p.status_pagamento === 'Ativo' || p.status_pagamento === 'ATIVO')
    ).length;
  }, [perfis]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('asaas_api_key') || process.env.NEXT_PUBLIC_ASAAS_API_KEY || '';
      const savedEnv = (localStorage.getItem('asaas_env') as 'sandbox' | 'production') || (process.env.NEXT_PUBLIC_ASAAS_ENV as 'sandbox' | 'production') || 'sandbox';
      const savedAutoBilling = localStorage.getItem('asaas_auto_billing') === 'true';
      setAsaasApiKey(savedKey);
      setAsaasEnv(savedEnv);
      setAsaasAutoBilling(savedAutoBilling);
    }

    const loadProfileFromDb = async () => {
      try {
        const supabase = getSupabase();
        if (!supabase) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          if (profile.asaas_key) {
            setAsaasApiKey(profile.asaas_key);
            localStorage.setItem('asaas_api_key', profile.asaas_key);
          }
          if (profile.asaas_env) {
            setAsaasEnv(profile.asaas_env as 'sandbox' | 'production');
            localStorage.setItem('asaas_env', profile.asaas_env);
          }
          if (profile.asaas_auto_billing !== undefined && profile.asaas_auto_billing !== null) {
            setAsaasAutoBilling(profile.asaas_auto_billing);
            localStorage.setItem('asaas_auto_billing', profile.asaas_auto_billing ? 'true' : 'false');
          }
        }
      } catch (e) {
        console.warn("Erro ao ler credenciais do banco:", e);
      }
    };
    loadProfileFromDb();
  }, []);

  const saveSettingsToDb = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase não pôde ser carregado.");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      const { error } = await supabase
        .from('user_profiles')
        .update({
          asaas_key: asaasApiKey,
          asaas_env: asaasEnv,
          asaas_auto_billing: asaasAutoBilling
        })
        .eq('id', user.id);

      if (error) {
        console.error("Erro ao salvar no banco:", error);
        // Se erro for de coluna inexistente (code 42703)
        if (error.code === '42703' || error.message?.includes('asaas_key') || error.message?.includes('column')) {
          setSaveStatus({
            success: false,
            message: "Atenção: A tabela 'user_profiles' não possui os campos de integração do Asaas. Por favor, execute as instruções SQL abaixo no 'SQL Editor' do seu painel Supabase para habilitar o salvamento persistente.",
            showSql: true
          });
          return;
        }
        throw error;
      }

      setSaveStatus({ success: true, message: "Todas as configurações do Asaas foram salvas com sucesso e estão disponíveis globalmente para todos os usuários!" });
      setTimeout(() => setSaveStatus(null), 8000);
    } catch (err: any) {
      setSaveStatus({ success: false, message: err.message || "Erro ao salvar as configurações." });
    } finally {
      setIsSaving(false);
    }
  };

  const testAsaasConnection = async () => {
    if (!asaasApiKey) return;
    setIsTestingAsaas(true);
    setTestResult(null);
    try {
      const response = await fetch('/api/asaas/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: asaasApiKey,
          env: asaasEnv,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        setTestResult({ success: false, message: 'Não foi possível ler a resposta do servidor. Por favor, verifique se seu servidor já carregou a rota e tente novamente.' });
        return;
      }

      if (response.ok && data.success) {
        setTestResult({ success: true, message: 'Sucesso! Chave conectada com sucesso.' });
      } else {
        setTestResult({ success: false, message: data.error || 'Falha na conexão.' });
      }
    } catch (err) {
      setTestResult({ success: false, message: 'Erro ao tentar se conectar ao Asaas.' });
    } finally {
      setIsTestingAsaas(false);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Cabeçalho da Aba Master */}
      <section className="bg-slate-900 text-white p-8 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg">
               <Settings size={28} />
             </div>
             <div>
               <h2 className="text-2xl font-black tracking-tight italic uppercase">Painel Master de Configurações</h2>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Definições estratégicas do sistema de gestão</p>
             </div>
          </div>
          <span className="px-4 py-1.5 bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-500/30">
            Nível Master Autorizado
          </span>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-0" />
      </section>

      {/* Integração ASAAS */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <BadgeDollarSign size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Integração Asaas</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Automatize a geração de cobranças de planos (Boleto, Pix e Cartão)</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">Ativo</span>
        </div>

        {/* INDICADORES E TELEMETRIA DE INTEGRACAO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 pb-10 border-b border-slate-100">
          {/* Card 1: Status Sincronização Webhook */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/50 hover:shadow-sm transition-all relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                <RefreshCw size={22} className="animate-spin-slow" />
              </div>
              {asaasApiKey ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Webhook Sincronizado
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  Sem Sincronismo
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sincronização Ativa</h3>
              <h4 className="text-lg font-black text-slate-800 tracking-tight italic uppercase">Status da Última Sincronização</h4>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Último evento Webhook:</span>
                <span className="font-black text-slate-700">
                  {lastAsaasWebhookLog ? (
                    new Date(lastAsaasWebhookLog.created_at).toLocaleString('pt-BR')
                  ) : asaasApiKey ? (
                    "Conectável / Ouvindo Gateway"
                  ) : (
                    "Não detectado"
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Ambiente Selecionado:</span>
                <span className="font-black uppercase text-[9px] text-slate-600">
                  {asaasEnv === 'sandbox' ? 'Sandbox / Testes' : 'Produção'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Licenças de Usuários / Assinaturas Ativas */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/50 hover:shadow-sm transition-all relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
                <Activity size={22} />
              </div>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 text-[9px] font-black uppercase tracking-widest rounded-full border border-purple-100">
                Licenciamento Master
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recorrências Compensadas</h3>
              <h4 className="text-lg font-black text-slate-800 tracking-tight italic uppercase">Assinaturas de Usuários Ativas</h4>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-slate-800 tracking-tight italic">
                  {activeSubscriptionsCount} <span className="text-xs text-slate-400 font-bold uppercase tracking-widest not-italic">Ativa(s)</span>
                </p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 leading-normal">
                  Inquilinos/Clientes ativos na plataforma.
                </p>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700 flex flex-col items-center justify-center border border-amber-100/50 leading-none min-w-[70px]">
                <span className="text-sm font-black">{perfis.length}</span>
                <span className="text-[7px] font-black uppercase tracking-tight mt-0.5 text-slate-500">Contas</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulário de Configuração */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block">API Key ASAAS (Geral)</label>
                <input 
                  type="password" 
                  value={asaasApiKey}
                  onChange={(e) => {
                    setAsaasApiKey(e.target.value);
                    localStorage.setItem('asaas_api_key', e.target.value);
                  }}
                  placeholder="Ex: $aae.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-400 outline-none rounded-2xl px-4 py-3 font-mono text-sm transition-all"
                />
                <span className="text-[9px] text-slate-400 font-medium block ml-1 leading-normal">
                  Chave gerada no painel do Asaas em <strong>Minha Conta &gt; Integrações &gt; Gerar API Key</strong>.
                </span>
                <div className="p-3 bg-amber-50/60 border border-amber-100/50 rounded-xl text-[9px] text-amber-800 leading-normal mt-2">
                  💡 <strong>Dica de Navegador (IFrame):</strong> Se você estiver visualizando o aplicativo dentro da janela (iFrame) do Google AI Studio, o seu navegador pode redefinir o LocalStorage devido a restrições de cookies de terceiros. Para nunca perder sua chave de API salva, use o aplicativo abrindo-o diretamente em uma <strong>nova aba de navegador</strong>!
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block">Ambiente</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className={`flex-1 flex items-center gap-3 p-4 bg-slate-50 border-2 rounded-2xl cursor-pointer hover:bg-slate-100/50 transition-all ${asaasEnv === 'sandbox' ? 'border-blue-500 bg-white ring-4 ring-blue-50' : 'border-slate-100'}`}>
                    <input 
                      type="radio" 
                      name="asaas_env" 
                      value="sandbox" 
                      checked={asaasEnv === 'sandbox'} 
                      onChange={() => {
                        setAsaasEnv('sandbox');
                        localStorage.setItem('asaas_env', 'sandbox');
                      }}
                      className="accent-blue-600"
                    />
                    <div>
                      <p className="text-xs font-black text-slate-700 uppercase">Homologação (Sandbox)</p>
                      <p className="text-[10px] text-slate-400 font-medium">Ambiente de Testes</p>
                    </div>
                  </label>
                  
                  <label className={`flex-1 flex items-center gap-3 p-4 bg-slate-50 border-2 rounded-2xl cursor-pointer hover:bg-slate-100/50 transition-all ${asaasEnv === 'production' ? 'border-blue-500 bg-white ring-4 ring-blue-50' : 'border-slate-100'}`}>
                    <input 
                      type="radio" 
                      name="asaas_env" 
                      value="production" 
                      checked={asaasEnv === 'production'} 
                      onChange={() => {
                        setAsaasEnv('production');
                        localStorage.setItem('asaas_env', 'production');
                      }}
                      className="accent-blue-600"
                    />
                    <div>
                      <p className="text-xs font-black text-slate-700 uppercase">Produção</p>
                      <p className="text-[10px] text-slate-400 font-medium">Transações Reais</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                <input 
                  type="checkbox" 
                  id="auto_billing" 
                  checked={asaasAutoBilling} 
                  onChange={(e) => {
                    setAsaasAutoBilling(e.target.checked);
                    localStorage.setItem('asaas_auto_billing', e.target.checked ? 'true' : 'false');
                  }}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" 
                />
                <label htmlFor="auto_billing" className="text-xs text-slate-600 font-bold select-none cursor-pointer">
                  Habilitar Emissão Automática no faturamento do usuário
                </label>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={testAsaasConnection}
                    disabled={isTestingAsaas || !asaasApiKey}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black disabled:opacity-40 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    {isTestingAsaas ? <Loader2 className="animate-spin" size={14} /> : null}
                    Testar Conexão
                  </button>

                  <button
                    type="button"
                    onClick={saveSettingsToDb}
                    disabled={isSaving || !asaasApiKey}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={14} /> : null}
                    Salvar no Banco (Disponibilizar Globalmente)
                  </button>
                  
                  {testResult !== null && (
                    <span className={`text-[10px] font-black uppercase tracking-widest ${testResult.success ? 'text-emerald-600' : 'text-red-500'}`}>
                      {testResult.message}
                    </span>
                  )}
                </div>

                {saveStatus !== null && (
                  <div className={`p-4 rounded-2xl text-[11px] leading-relaxed font-bold border-2 ${saveStatus.success ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-red-50 text-red-900 border-red-200'}`}>
                    <p>{saveStatus.message}</p>
                    {saveStatus.showSql && (
                      <div className="mt-3 bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-[10px] space-y-2 select-all whitespace-pre-wrap">
                        <p className="text-yellow-400 font-extrabold uppercase">Instrução SQL - Execute no Supabase:</p>
                        <code>{`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS asaas_key text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS asaas_env text DEFAULT 'sandbox';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS asaas_auto_billing boolean DEFAULT false;`}</code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Status e Fluxo de Integração */}
          <div className="bg-slate-50/85 p-8 rounded-[2rem] border border-slate-200/50 flex flex-col justify-between">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Controle de Assinaturas</p>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                A integração do Asaas controla as assinaturas de planos do sistema correspondentes às mensalidades e cobranças recorrentes dos locadores que contratam a ferramenta.
              </p>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <p className="text-[10px] text-amber-700 leading-normal font-bold">
                  ℹ️ <strong>Importante:</strong> Conforme decisão estratégica, as parcelas individuais de locação/aluguéis cadastradas pelos usuários dentro de seus contratos não são operadas pelo Asaas neste momento, mantendo o foco total do integrador no controle financeiro de assinantes do Realizze.
                </p>
              </div>
            </div>
            
            <div className="border-t border-slate-200/60 pt-6 mt-6">
              <p className="text-[10px] font-bold text-slate-400 leading-normal">
                ⚠️ <strong className="text-slate-500">Nota sobre Produção:</strong> Certifique-se de que sua conta Asaas esteja certificada antes de colocar as chaves mestras e alternar o ambiente para Produção.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Outras Configurações Simples */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 font-black">
                <Palette size={14} />
                Aparência e Marca do Sistema
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome da Plataforma</label>
                  <input 
                    type="text" 
                    defaultValue="REALIZZE IMÓVEIS - Gestão Integrada"
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-400 outline-none rounded-2xl px-4 py-3 font-bold text-sm transition-all"
                  />
                </div>
              </div>
           </div>
           
           <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 font-black">
                <Shield size={14} />
                Segurança & Diretrizes Master
              </h3>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium italic">
                  Apenas usuários autorizados com nível "MASTER" podem carregar e salvar definições de faturamento global, integrações de webhook gerais, e gerenciar credenciais operacionais.
                </p>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};
