'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BadgeDollarSign, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  setUserProfile: (profile: any) => void;
  fetchData: () => void;
  supabase: any;
  recordLog: (action: string, entity: string, entityId: string, details?: any) => Promise<any>;
}

export default function PlanSelectionModal({
  isOpen,
  onClose,
  userProfile,
  setUserProfile,
  fetchData,
  supabase,
  recordLog
}: PlanSelectionModalProps) {
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'boleto'>('pix');
  const [checkoutStep, setCheckoutStep] = useState<'select' | 'form' | 'success'>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [inlineApiKey, setInlineApiKey] = useState('');
  const [inlineEnv, setInlineEnv] = useState<'sandbox' | 'production'>('sandbox');
  const [simulateClientView, setSimulateClientView] = useState(false);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('asaas_api_key') || '';
      const savedEnv = (localStorage.getItem('asaas_env') as 'sandbox' | 'production') || 'sandbox';
      setInlineApiKey(savedKey);
      setInlineEnv(savedEnv);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-10 flex flex-col gap-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Modal Header */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                <BadgeDollarSign className="text-blue-600" size={32} />
                {checkoutStep === 'select' && 'Escolha o Plano Ideal'}
                {checkoutStep === 'form' && 'Detalhes da Cobrança Asaas'}
                {checkoutStep === 'success' && 'Cobrança Criada com Sucesso'}
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
                {checkoutStep === 'select' && 'Você atingiu o limite do seu plano atual. Ative uma assinatura para expandir seus limites.'}
                {checkoutStep === 'form' && `Preencha suas informações para gerar sua fatura do plano ${selectedPlan?.name}.`}
                {checkoutStep === 'success' && 'Realize o pagamento no gateway do Asaas para liberar seu acesso.'}
              </p>
            </div>
            <button 
              onClick={() => {
                onClose();
                setCheckoutStep('select');
                setError(null);
              }} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>

          {/* STEP 1: Plan Selection */}
          {checkoutStep === 'select' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Billing Cycle Toggle Switcher */}
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('mensal')}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all focus:outline-none ${
                      billingCycle === 'mensal'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Faturamento Mensal
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('anual')}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 focus:outline-none ${
                      billingCycle === 'anual'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Faturamento Anual
                    <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                      -20% OFF
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { 
                    name: 'Iniciante', 
                    price: billingCycle === 'mensal' ? '49,90' : '39,90',
                    contractors: 'Até 10 contratos ativos',
                    desc: 'Ideal para proprietários de bens ou imóveis autônomos.',
                    features: ['Contratos e Recibos Extras', 'Gestão Geral de Ativos', 'Notificações Avançadas']
                  },
                  { 
                    name: 'Profissional', 
                    price: billingCycle === 'mensal' ? '99,90' : '79,95',
                    contractors: 'Até 50 contratos ativos',
                    desc: 'Indicado para imobiliárias, corretores e locadoras em expansão.',
                    features: ['Assistente IA de Contratos 🤖', 'Notificações automáticas WhatsApp', 'Contratos ilimitados extras'],
                    popular: true
                  },
                  { 
                    name: 'Ilimitado', 
                    price: billingCycle === 'mensal' ? '199,90' : '149,90',
                    contractors: 'Contratos ilimitados',
                    desc: 'Para grandes locadoras de frotas e incorporadoras.',
                    features: ['Painel Multi-Usuários Ilimitados', 'Suporte e Implantação VIP', 'Apoio de integração total']
                  },
                ].map(plan => (
                  <div 
                    key={plan.name} 
                    className={`border-2 p-8 rounded-3xl flex flex-col justify-between gap-6 transition-all relative ${
                      plan.popular 
                        ? 'border-blue-600 shadow-xl shadow-blue-50 bg-white ring-4 ring-blue-50/50' 
                        : 'border-slate-100 hover:border-blue-300 bg-slate-50/50 hover:bg-white'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                        Mais Vendido 🏆
                      </div>
                    )}
                    <div>
                      <h3 className="font-black text-2xl text-slate-800">{plan.name}</h3>
                      <p className="text-slate-400 text-xs mt-1 font-medium">{plan.desc}</p>
                      
                      <div className="text-4xl font-black text-slate-800 mt-4">
                        R$ {plan.price}
                        <span className="text-xs text-slate-400 font-medium">/mês</span>
                      </div>
                      
                      {billingCycle === 'anual' && (
                        <p className="text-[9px] text-emerald-600 font-bold uppercase mt-1">
                          Faturado anualmente com desconto
                        </p>
                      )}

                      <div className="h-px bg-slate-100 my-4" />
                      
                      <ul className="text-slate-600 text-xs space-y-3">
                         <li className="font-bold flex items-center gap-2">✓ {plan.contractors}</li>
                         {plan.features.map(f => (
                           <li key={f} className="flex items-center gap-2 text-slate-500">✓ {f}</li>
                         ))}
                      </ul>
                    </div>

                    <button 
                      onClick={() => {
                        setSelectedPlan(plan);
                        setCheckoutStep('form');
                      }}
                      className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all focus:outline-none ${
                        plan.popular 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200' 
                          : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'
                      }`}
                    >
                      Escolher Plano {plan.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Asaas Configuration Form */}
          {checkoutStep === 'form' && (
            <div className="space-y-6 max-w-2xl mx-auto w-full animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[9px] font-black uppercase bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">Plano Selecionado</span>
                  <h4 className="font-black text-xl text-slate-800 mt-2">{selectedPlan?.name} ({billingCycle === 'mensal' ? 'Faturamento Mensal' : 'Faturamento Anual'})</h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">Sua conta terá limite de {selectedPlan?.contractors}.</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs uppercase font-bold">Valor Total</p>
                  <p className="text-2xl font-black text-blue-600 col-span-1">
                    R$ {billingCycle === 'mensal' 
                      ? `${selectedPlan?.price}` 
                      : `${(parseFloat(selectedPlan?.price.replace(',', '.')) * 12).toFixed(2).replace('.', ',')}`
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Master Inspector controls */}
                {userProfile?.role === 'MASTER' && (
                  <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-150 rounded-2xl text-xs text-slate-705">
                    <span className="font-extrabold flex items-center gap-1.5 uppercase text-[9px] text-yellow-800 tracking-wider">
                      🛠️ MODO DE ADMINISTRAÇÃO & TESTES (MASTER)
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={simulateClientView}
                        onChange={(e) => setSimulateClientView(e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-2 text-[9px] font-black uppercase text-slate-500 tracking-wider">Simular Visão do Cliente</span>
                    </label>
                  </div>
                )}

                {/* Inline Asaas Configuration Setup (Highly convenient and prevents validation/lost state issues) */}
                {userProfile?.role === 'MASTER' && !simulateClientView && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5 text-left">
                    <div className="flex justify-between items-center bg-slate-100/50 p-2 rounded-xl border border-slate-200/50">
                      <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1 block">
                        ⚙️ Configuração da Integração Asaas
                      </label>
                      <span className="text-[8px] font-bold uppercase py-0.5 px-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-full animate-pulse">
                        Ativo Localmente
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide ml-1">Chave de API (API Key) *</span>
                        <input 
                          type="password"
                          value={inlineApiKey}
                          onChange={(e) => {
                            setInlineApiKey(e.target.value);
                            if (typeof window !== 'undefined') {
                              localStorage.setItem('asaas_api_key', e.target.value);
                            }
                          }}
                          placeholder="Requerido. Ex: $aesp..."
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:bg-white outline-none rounded-xl px-3 py-2 font-mono text-xs text-slate-800 placeholder:text-slate-350"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide ml-1">Ambiente *</span>
                        <select
                          value={inlineEnv}
                          onChange={(e) => {
                            const val = e.target.value as 'sandbox' | 'production';
                            setInlineEnv(val);
                            if (typeof window !== 'undefined') {
                              localStorage.setItem('asaas_env', val);
                            }
                          }}
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none rounded-xl px-2.5 py-2 font-bold text-xs text-slate-700 h-[34px] cursor-pointer"
                        >
                          <option value="sandbox">Sandbox (Testes)</option>
                          <option value="production">Produção (Real)</option>
                        </select>
                      </div>
                    </div>
                    
                    <p className="text-[8px] text-slate-400 leading-normal ml-1">
                      Insira a chave obtida em seu painel do Asaas em <strong>Minha Conta &gt; Integrações &gt; Gerar API Key</strong> para habilitar as cobranças.
                    </p>
                  </div>
                )}

                {/* CPF or CNPJ Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-550 uppercase tracking-widest ml-1 block">
                    CPF ou CNPJ do Titular da Assinatura *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={cpfCnpj}
                    onChange={(e) => setCpfCnpj(e.target.value)}
                    placeholder="Insira CPF ou CNPJ para faturamento no Asaas"
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-400 focus:bg-white outline-none rounded-xl px-4 py-3 font-mono text-xs transition-all text-slate-800 placeholder:text-slate-350"
                  />
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-550 uppercase tracking-widest ml-1 block">
                    Selecione a Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'pix', label: '⚡ PIX', desc: 'Aprovação Instantânea' },
                      { id: 'cartao', label: '💳 CARTÃO', desc: 'Até 12x no Gateway' },
                      { id: 'boleto', label: '📄 BOLETO', desc: 'Emissão de Boleto' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-4 rounded-xl border-2 text-left flex flex-col justify-between h-20 transition-all focus:outline-none ${
                          paymentMethod === method.id 
                            ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-50' 
                            : 'border-slate-150 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className="font-extrabold text-[#111] text-xs uppercase">{method.label}</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">{method.desc}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium leading-relaxed mt-1.5 px-1 bg-slate-50 py-1 rounded border border-slate-100/50">
                    💡 <strong>Observação do Gateway:</strong> Se a conta do Asaas (Sandbox ou Produção) não estiver 100% verificada no painel deles, a cobrança via PIX pode expirar ou recusar. Caso ocorra erro, selecione <strong>Cartão</strong>, <strong>Boleto</strong> ou utilize a ativação direta.
                  </p>
                </div>
              </div>

              {error && (
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold text-xs border border-red-100 text-left">
                    ⚠️ {error}
                  </div>
                  <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl text-left space-y-2.5">
                    <p className="text-[10px] uppercase font-black text-blue-700 tracking-wider">💡 Dica de Validação ou Testes (Modo Simulação):</p>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Se a sua conta do Asaas (Sandbox ou Produção) estiver restrita do faturamento via cartão de crédito, ou se a chave API estiver inválida no momento, você pode realizar a <strong>ativação de testes/manual</strong> imediatamente para atualizar seus limites na plataforma neste dispositivo.
                    </p>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          const { error: dbError } = await supabase
                            .from('user_profiles')
                            .update({
                              plano: selectedPlan.name,
                              status_pagamento: 'PAGO',
                              approved: true
                            })
                            .eq('id', userProfile?.id);

                          if (dbError) throw dbError;

                          await recordLog('Ativação Manual de Upgrade (Erro Bypass)', 'user_profiles', userProfile?.id, {
                            plano: selectedPlan.name,
                            ciclo: billingCycle,
                            bypass_error: error
                          });

                          // Refresh user in memory
                          const { data: updatedProfile } = await supabase
                            .from('user_profiles')
                            .select('*')
                            .eq('id', userProfile?.id)
                            .single();
                            
                          if (updatedProfile) {
                            setUserProfile(updatedProfile);
                          }

                          onClose();
                          alert(`Parabéns! O plano ${selectedPlan.name} foi ativado na sua conta no banco de dados com sucesso. Seus limites foram atualizados.`);
                          setCheckoutStep('select');
                          fetchData();
                        } catch (err: any) {
                          alert(`Erro ao tentar ativar o plano: ${err.message}`);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-900 hover:bg-black text-white font-black text-[10px] py-3 px-4 rounded-xl uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? 'Confirmando...' : 'Ignorar e Ativar Plano Manualmente'}
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('select')}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all focus:outline-none"
                >
                  ← Voltar
                </button>
                <button
                  type="button"
                  disabled={isLoading || cpfCnpj.replace(/\D/g, '').length < 11}
                  onClick={async () => {
                    setIsLoading(true);
                    setError(null);
                    try {
                      const finalApiKey = inlineApiKey.trim() || localStorage.getItem('asaas_api_key') || '';
                      const finalEnv = inlineEnv || localStorage.getItem('asaas_env') || 'sandbox';

                      if (finalApiKey) {
                        localStorage.setItem('asaas_api_key', finalApiKey);
                      }
                      localStorage.setItem('asaas_env', finalEnv);

                      let userToken = '';
                      try {
                        const { data: sessionData } = await supabase.auth.getSession();
                        userToken = sessionData?.session?.access_token || '';
                      } catch (tokErr) {
                        console.warn("Failed to retrieve token for checkout request auth context:", tokErr);
                      }

                      const response = await fetch('/api/asaas/create-plan-checkout', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          apiKey: finalApiKey || undefined,
                          env: finalEnv,
                          planName: selectedPlan.name,
                          cycle: billingCycle,
                          cpfCnpj: cpfCnpj,
                          userProfile: {
                            id: userProfile?.id,
                            nome: userProfile?.nome,
                            email: userProfile?.email,
                            telefone: userProfile?.telefone || ''
                          },
                          paymentMethod,
                          supabaseToken: userToken
                        }),
                      }).catch(err => {
                        console.error('DEBUG: fetch failed:', err);
                        throw new Error(`Erro de rede ao conectar com servidor: ${err.message}`);
                      });

                      console.log('DEBUG: response status:', response.status);
                      const dataText = await response.text();
                      let data;
                      try {
                        data = JSON.parse(dataText);
                      } catch (e) {
                        data = { error: 'Formato de resposta inválido' };
                      }
                      console.log('DEBUG: response data:', data);
                      
                      if (!response.ok) {
                        throw new Error(data.error || `Erro ao gerar cobrança no Asaas (Status: ${response.status}).`);
                      }

                      setCheckoutResult(data);
                      setCheckoutStep('success');
                    } catch (err: any) {
                      console.error(err);
                      setError(err.message || 'Erro inesperado.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all disabled:opacity-40 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 focus:outline-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Integrando com Asaas...
                    </>
                  ) : (
                    'Iniciar Cobrança Asaas'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Checkout Success State */}
          {checkoutStep === 'success' && checkoutResult && (
            <div className="space-y-6 max-w-2xl mx-auto w-full text-center animate-in zoom-in-95 duration-300 flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              
              <div>
                <h3 className="font-extrabold text-2xl text-slate-800 uppercase tracking-tight">Cobrança Gerada no Asaas</h3>
                <p className="text-slate-500 text-xs mt-2 max-w-md mx-auto">
                  A cobrança do plano foi enviada à sua conta no Asaas com sucesso. Realize o pagamento de teste/produção abaixo.
                </p>
              </div>

              {/* PIX image QR Code representation directly from Asaas API */}
              {checkoutResult.pixQrCode && (
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col items-center gap-4 w-full">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escaneie para pagar via PIX</p>
                  
                  <div className="bg-white p-2 border border-slate-200 rounded-2xl shadow-sm">
                    <img 
                      src={`data:image/png;base64,${checkoutResult.pixQrCode}`} 
                      alt="Pix Asaas" 
                      className="w-44 h-44"
                    />
                  </div>

                  <div className="w-full flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={checkoutResult.pixCopyPaste || ''}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-mono text-slate-550 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (checkoutResult.pixCopyPaste) {
                          navigator.clipboard.writeText(checkoutResult.pixCopyPaste);
                          alert("Copia e Cola Pix copiado para a área de transferência!");
                        }
                      }}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all focus:outline-none"
                    >
                      Copiar Pix
                    </button>
                  </div>
                </div>
              )}

              {/* Invoices links */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                {checkoutResult.invoiceUrl && (
                  <a
                    href={checkoutResult.invoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-4 px-6 rounded-xl uppercase tracking-widest shadow-md transition-all active:scale-95 text-center"
                  >
                    Abrir Fatura do Asaas <ExternalLink size={16} />
                  </a>
                )}
                {checkoutResult.bankSlipUrl && (
                  <a
                    href={checkoutResult.bankSlipUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-extrabold text-xs py-4 px-6 rounded-xl uppercase tracking-widest transition-all text-center"
                  >
                    Baixar Boleto Asaas
                  </a>
                )}
              </div>

              <div className="h-px bg-slate-100 w-full my-3" />

              {/* Manual activation helper button */}
              <div className="bg-blue-50/60 border border-blue-100/50 p-5 rounded-2xl w-full text-center">
                <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1">
                  ⚠️ MÓDULO DE TESTES E LANÇAMENTO REALIZZE ⚠️
                </p>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">
                  Para fins de teste e validação do realizzeapp.com.br, você pode realizar o pagamento no Sandbox ou clicar no botão abaixo para **forçar a liberação imediata do plano** na sua conta diretamente no banco de dados.
                  Isso irá elevar os limites de cadastro instantaneamente.
                </p>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const { error: dbError } = await supabase
                        .from('user_profiles')
                        .update({
                          plano: selectedPlan.name,
                          status_pagamento: 'PAGO',
                          approved: true
                        })
                        .eq('id', userProfile?.id);

                      if (dbError) throw dbError;

                      await recordLog('Ativação Manual de Upgrade', 'user_profiles', userProfile?.id, {
                        plano: selectedPlan.name,
                        ciclo: billingCycle,
                        valor: checkoutResult.value
                      });

                      // Refresh user in memory
                      const { data: updatedProfile } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('id', userProfile?.id)
                        .single();
                        
                      if (updatedProfile) {
                        setUserProfile(updatedProfile);
                      }

                      onClose();
                      alert(`Parabéns! Sua assinatura do plano ${selectedPlan.name} (${billingCycle === 'mensal' ? 'Mensal' : 'Anual'}) foi confirmada com sucesso! Seus limites foram atualizados.`);
                      setCheckoutStep('select');
                      fetchData();
                    } catch (err: any) {
                      alert(`Erro ao tentar ativar o plano: ${err.message}`);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-900 hover:bg-black text-white font-black text-[10px] py-3.5 px-4 rounded-xl uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? 'Ativando...' : 'Confirmar Ativação do Plano Agora'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
