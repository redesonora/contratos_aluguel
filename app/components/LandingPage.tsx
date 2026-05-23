import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Home, ShieldCheck, Zap, LineChart, FileText, ChevronRight, CheckCircle2, TrendingUp, Building, MessageCircle, Gift, BookOpen, Users, Database, Building2, Wrench, Car } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: (plan?: 'Gratuito' | 'Iniciante' | 'Profissional' | 'Ilimitado', cycle?: 'mensal' | 'anual') => void;
}

const predictiveData = [
  { name: 'Jan', value: 20000 },
  { name: 'Fev', value: 25000 },
  { name: 'Mar', value: 24000 },
  { name: 'Abr', value: 30000 },
  { name: 'Mai', value: 35000 },
  { name: 'Jun', value: 45000 },
  { name: 'Jul', value: 42000 },
  { name: 'Ago', value: 50000 },
  { name: 'Set', value: 58000 },
];

export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  
  const [mounted, setMounted] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500 selection:text-white overflow-hidden relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 text-blue-600">
            <Home size={32} strokeWidth={2.5} />
            <span className="text-2xl font-black tracking-tight">REALIZZE</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">Recursos</a>
            <a href="#planos" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">Planos</a>
            <a href="#afiliados" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">Afiliados</a>
            <a href="#blog" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">Blog</a>
            <div className="h-6 w-[2px] bg-slate-200"></div>
            <button 
              onClick={onLogin}
              className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              Acessar
            </button>
            <button 
              onClick={() => onRegister('Gratuito', 'mensal')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-95"
            >
              Começar Grátis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-8 items-start"
          >
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[1.05]">
              Controle suas locações de ponta a ponta sem planilhas bagunçadas.
            </h1>
            
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
              Crie contratos digitais, gerencie valores a pagar e envie recibos automáticos para locação de imóveis, ferramentas e carros. Tudo em um só lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <button 
                onClick={() => onRegister('Gratuito', 'mensal')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95 flex items-center justify-center gap-3 group"
              >
                Experimentar Sistema Grátis
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          <motion.div 
            style={{ y: y1 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-emerald-50 rounded-[3rem] transform rotate-3 scale-105 -z-10 blur-xl opacity-70 animate-pulse duration-[8s]"></div>
            <div className="bg-white border-2 border-slate-150 p-8 rounded-[3rem] shadow-2xl flex flex-col gap-6 relative z-10 hover:border-blue-200 transition-colors duration-500">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Receita Prevista</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Próximos Meses</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-500">R$ 58.000</div>
                  <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-lg mt-1">+26% em projeção</div>
                </div>
              </div>
              
              <div className="h-40 w-full mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={predictiveData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl text-center">
                   <div className="text-xl font-black text-slate-800">42</div>
                   <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bens Ativos</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-center">
                   <div className="text-xl font-black text-slate-800">100%</div>
                   <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Saudabilidade</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Elements */}
      <section className="bg-white py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          {[
            { icon: ShieldCheck, title: "Ambiente 100% Seguro", desc: "Dados criptografados e armazenados com segurança." },
            { icon: Database, title: "Backup Diário Automático", desc: "Suas informações e contratos sempre salvos e protegidos." },
            { icon: MessageCircle, title: "Suporte Humanizado", desc: "Atendimento via WhatsApp para tirar suas dúvidas sempre que precisar." }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <item.icon size={32} />
              </div>
              <h3 className="font-black text-lg tracking-tight">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features - Niches */}
      <section id="recursos" className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter text-center mb-16">Específico para o seu negócio</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Building2 size={32} />}
              title="Para Imóveis"
              desc="Controle o vencimento do aluguel de inquilinos, reajustes e gere recibos de quitação sem complicações."
              color="text-blue-600"
              bg="bg-blue-50"
              border="border-blue-100"
            />
            <FeatureCard 
              icon={<Wrench size={32} />}
              title="Para Ferramentas"
              desc="Monitore o prazo de devolução de maquinários e cobre diárias ou períodos com precisão."
              color="text-amber-600"
              bg="bg-amber-50"
              border="border-amber-100"
            />
            <FeatureCard 
              icon={<Car size={32} />}
              title="Para Carros e Frotas"
              desc="Gerencie as parcelas de motoristas de aplicativo e acompanhe o fluxo financeiro semanal ou mensal."
              color="text-emerald-600"
              bg="bg-emerald-50"
              border="border-emerald-100"
            />
          </div>
        </div>
      </section>

      {/* Pricing / Planos */}
      <section id="planos" className="py-24 bg-white border-b border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
              Planos Amigáveis que Crescem com Você
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              Precificação justa baseada no número de contratos ativos que você gerencia. Sem tarifas ocultas, cancele quando quiser.
            </p>
          </div>

          {/* Billing Cycle Switcher Toggle */}
          <div className="flex flex-col items-center justify-center gap-4 mb-16">
            <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center border border-slate-200">
              <button
                type="button"
                onClick={() => setBillingCycle('mensal')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
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
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  billingCycle === 'anual'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Faturamento Anual
                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  -20% OFF
                </span>
              </button>
            </div>
            
            {billingCycle === 'anual' && (
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest animate-pulse">
                🎉 Economia garantida de até R$ 600,00 reais por ano com ativação anual!
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Gratuito */}
            <div className="bg-slate-50 border-2 border-slate-100 p-8 rounded-[2.5rem] flex flex-col justify-between hover:border-blue-200 transition-all group hover:bg-white hover:shadow-xl hover:shadow-slate-100">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 bg-slate-200/50 group-hover:bg-slate-100 px-3 py-1.5 rounded-full inline-block mb-6">Freemium</span>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Gratuito</h3>
                <p className="text-xs text-slate-500 font-medium mb-6">Perfeito para locadores iniciantes testarem o sistema sem burocracia.</p>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-800">R$ 0</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ sempre</span>
                </div>
                <div className="h-[2px] bg-slate-100 mb-6 font-semibold text-[10px] text-slate-450 italic">Plano livre sem cobranças</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                    Até <strong>1 contrato ativo</strong>
                  </li>
                  <li className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                    Gestão Geral de Ativos
                  </li>
                  <li className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                    Envio de Recibos Básicos
                  </li>
                </ul>
              </div>
              <button onClick={() => onRegister('Gratuito', 'mensal')} className="w-full py-3.5 bg-slate-200 hover:bg-blue-600 hover:text-white text-slate-750 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all">
                Começar Grátis
              </button>
            </div>

            {/* Iniciante */}
            <div className="bg-slate-50 border-2 border-slate-100 p-8 rounded-[2.5rem] flex flex-col justify-between hover:border-blue-200 transition-all group hover:bg-white hover:shadow-xl hover:shadow-slate-100">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full inline-block mb-6">Autônomo</span>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Iniciante</h3>
                <p className="text-xs text-slate-500 font-medium mb-6">Ideal para proprietários de bens ou imóveis autônomos.</p>
                <div className="mb-6 flex flex-col gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-800">
                      R$ {billingCycle === 'mensal' ? '49,90' : '39,90'}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ mês</span>
                  </div>
                  {billingCycle === 'anual' && (
                    <span className="text-[10px] text-emerald-600 font-black uppercase italic">
                      Cobrado R$ 478,80/ano (Economia R$ 120,00)
                    </span>
                  )}
                </div>
                <div className="h-[2px] bg-slate-100 mb-6"></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                    Até <strong>10 contratos ativos</strong>
                  </li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                    Contratos e Recibos Extras
                  </li>
                  <li className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                    Notificações Avançadas
                  </li>
                </ul>
              </div>
              <button onClick={() => onRegister('Iniciante', billingCycle)} className="w-full py-3.5 bg-blue-600 text-white hover:bg-blue-700 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-100">
                Escolher Iniciante
              </button>
            </div>

            {/* Profissional */}
            <div className="bg-white border-2 border-blue-600 relative p-8 rounded-[2.5rem] flex flex-col justify-between transition-all group shadow-xl shadow-blue-50 hover:shadow-blue-100">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Excelente Custo-Benefício</div>
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full inline-block mb-6 text-center w-full">Mais Vendido 🏆</span>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Profissional</h3>
                <p className="text-xs text-slate-500 font-medium mb-6">Indicado para imobiliárias, corretores e locadoras em expansão.</p>
                <div className="mb-6 flex flex-col gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-800">
                      R$ {billingCycle === 'mensal' ? '99,90' : '79,90'}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ mês</span>
                  </div>
                  {billingCycle === 'anual' && (
                    <span className="text-[10px] text-emerald-600 font-black uppercase italic">
                      Cobrado R$ 958,80/ano (Economia R$ 240,00)
                    </span>
                  )}
                </div>
                <div className="h-[2px] bg-indigo-50 mb-6"></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                    Até <strong>50 contratos ativos</strong>
                  </li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                    Assistente IA de Contratos 🤖
                  </li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                    Notificações automáticas WhatsApp
                  </li>
                </ul>
              </div>
              <button onClick={() => onRegister('Profissional', billingCycle)} className="w-full py-3.5 bg-blue-600 text-white hover:bg-blue-700 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-200">
                Começar Profissional
              </button>
            </div>

            {/* Ilimitado */}
            <div className="bg-slate-50 border-2 border-slate-100 p-8 rounded-[2.5rem] flex flex-col justify-between hover:border-blue-200 transition-all group hover:bg-white hover:shadow-xl hover:shadow-slate-100">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full inline-block mb-6">Corporativo</span>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Ilimitado</h3>
                <p className="text-xs text-slate-500 font-medium mb-6">Para grandes locadoras de frotas e incorporadoras comerciais.</p>
                <div className="mb-6 flex flex-col gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-800">
                      R$ {billingCycle === 'mensal' ? '199,90' : '149,90'}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ mês</span>
                  </div>
                  {billingCycle === 'anual' && (
                    <span className="text-[10px] text-emerald-600 font-black uppercase italic">
                      Cobrado R$ 1.798,80/ano (Economia R$ 600,00)
                    </span>
                  )}
                </div>
                <div className="h-[2px] bg-slate-100 mb-6"></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                    Contratos <strong>Ilimitados</strong>
                  </li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                    Painel Multi-Usuários Ilimitados
                  </li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                    Suporte e Implantação VIP
                  </li>
                </ul>
              </div>
              <button onClick={() => onRegister('Ilimitado', billingCycle)} className="w-full py-3.5 bg-slate-900 text-white hover:bg-slate-800 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all">
                Falar c/ Especialista
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Section */}
      <section id="afiliados" className="py-24 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 lg:p-16 text-white overflow-hidden relative shadow-2xl shadow-blue-200">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md mb-6">
                  <Gift size={14} /> Módulo Afiliados
                </div>
                <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4 leading-tight">Ganhe Descontos ou Dinheiro Indicando.</h2>
                <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                  Traga outros empreendedores e administradores para a plataforma REALIZZE. A cada novo assinante ativo, você recebe mensalidades grátis.
                </p>
                <button 
                  onClick={() => onRegister('Gratuito', 'mensal')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-xl inline-flex items-center gap-2"
                >
                  Gerar Meu Link de Afiliado <ChevronRight size={18} />
                </button>
              </div>
              <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20">
                 <div className="flex flex-col gap-4">
                   <div className="bg-white/20 p-5 rounded-2xl flex items-center gap-4">
                      <div className="bg-emerald-500 p-3 rounded-xl text-white"><CheckCircle2 size={24} /></div>
                      <div>
                        <div className="font-black text-xl">1 Indicação</div>
                        <div className="text-blue-100 text-sm font-medium">1 Mês Grátis no seu plano</div>
                      </div>
                   </div>
                   <div className="bg-white/20 p-5 rounded-2xl flex items-center gap-4">
                      <div className="bg-amber-500 p-3 rounded-xl text-white"><Users size={24} /></div>
                      <div>
                        <div className="font-black text-xl">5 Indicações</div>
                        <div className="text-blue-100 text-sm font-medium">Plano Anual Vitálio ou R$ 500</div>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO / Blog Section */}
      <section id="blog" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Casos de Sucesso & Dicas</h2>
              <p className="text-slate-500 font-medium">Conteúdos que ajudam você a escalar a gestão de seus contratos.</p>
            </div>
            <button className="hidden md:flex text-sm font-bold text-blue-600 uppercase tracking-widest items-center gap-1 hover:text-blue-700 transition-colors">
              Ver todos os posts <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <BlogCard 
              tag="Gestão"
              title="Como reduzir a inadimplência em 80% usando gatilhos de WhatsApp"
              desc="Descubra a estratégia que nossos clientes usam para acelerar seus recebimentos com mensagens eficientes."
            />
            <BlogCard 
              tag="Tendências"
              title="Contratos Digitais: Porque o papel está reduzindo seus lucros"
              desc="Assinaturas eletrônicas e envios ágeis podem economizar horas semanais do seu time de gestão."
            />
            <BlogCard 
              tag="Sucesso"
              title="De 50 a 300 contratos administrados em menos de 1 ano"
              desc="Estudo de caso da Central de Acordos, que triplicou seus resultados após migrar para uma solução integrada."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
            Pronto para transformar sua gestão?
          </h2>
          <p className="text-slate-300 text-lg font-medium max-w-xl mx-auto">
            Junte-se a administradores que economizam horas todas as semanas com a automação e organização do REALIZZE.
          </p>
          <div className="pt-6">
            <button 
              onClick={() => onRegister('Gratuito', 'mensal')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] transition-all active:scale-95"
            >
              Começar Sistema Grátis
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-slate-100 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 text-slate-800 font-black mb-4">
            <Home size={20} /> REALIZZE
        </div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} REALIZZE - Gestão de Contratos. Todos os direitos reservados.
        </p>
      </footer>

      {/* WhatsApp Floating Button */}
      <a 
        href="#" 
        className="fixed bottom-8 right-8 z-[100] bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-300 flex items-center justify-center"
        aria-label="Falar conosco no WhatsApp"
        onClick={(e) => {
          e.preventDefault();
          window.open('https://wa.me/5511999999999?text=Ol%C3%A1,%20gostaria%20de%20saber%20mais%20sobre%20a%20plataforma%20REALIZZE!', '_blank');
        }}
      >
        <MessageCircle size={32} />
      </a>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color, bg, border }: any) {
  return (
    <div className={`p-8 rounded-[2rem] border-2 ${border} bg-white hover:shadow-xl transition-shadow group flex flex-col items-start`}>
      <div className={`w-16 h-16 rounded-2xl ${bg} ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-black text-slate-800 tracking-tight mb-3">{title}</h3>
      <p className="text-sm font-medium text-slate-500 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

function BlogCard({ tag, title, desc }: any) {
  return (
    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:shadow-lg transition-all group cursor-pointer flex flex-col items-start">
      <div className="bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600 mb-6">
        {tag}
      </div>
      <h3 className="text-lg font-black text-slate-800 tracking-tight mb-3 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
        {desc}
      </p>
      <div className="mt-auto text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 group-hover:text-blue-600 transition-colors">
        Ler Artigo <ChevronRight size={14} />
      </div>
    </div>
  );
}

