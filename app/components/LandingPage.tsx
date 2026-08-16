'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  ShieldCheck, 
  Zap, 
  LineChart, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  CheckCircle2, 
  TrendingUp, 
  Building, 
  MessageCircle, 
  Gift, 
  BookOpen, 
  Users, 
  Database, 
  Wrench, 
  Car,
  Printer,
  Bell,
  Sparkles,
  ArrowRight,
  Clock,
  DollarSign,
  Shield,
  HelpCircle,
  KeyRound,
  Check
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  XAxis, 
  Tooltip,
  CartesianGrid 
} from 'recharts';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: (plan?: 'Gratuito' | 'Iniciante' | 'Profissional' | 'Ilimitado', cycle?: 'mensal' | 'anual') => void;
}

const previewCashFlow = [
  { name: 'Jan', recebido: 22000, pendente: 3000 },
  { name: 'Fev', recebido: 26000, pendente: 2000 },
  { name: 'Mar', recebido: 25500, pendente: 1500 },
  { name: 'Abr', recebido: 31000, pendente: 2500 },
  { name: 'Mai', recebido: 37000, pendente: 1800 },
  { name: 'Jun', recebido: 46000, pendente: 2200 },
  { name: 'Jul', recebido: 44000, pendente: 1200 },
  { name: 'Ago', recebido: 51000, pendente: 1900 },
];

export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');
  const [activePreviewTab, setActivePreviewTab] = useState<'dashboard' | 'recibo' | 'notificacoes'>('dashboard');
  const [imoveisCountSlider, setImoveisCountSlider] = useState<number>(12);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Calculadora de ROI / economia
  const horasEconomizadas = Math.round(imoveisCountSlider * 1.8);
  const economiaFinanceiraAno = Math.round(imoveisCountSlider * 420);

  const faqs = [
    {
      question: "O plano Gratuito tem pegadinha ou pede cartão de crédito?",
      answer: "Não. O plano Gratuito é 100% gratuito e não exige nenhum cartão de crédito no cadastro. Você pode gerenciar 1 contrato/imóvel com emissão de recibos e controle completo pelo tempo que desejar."
    },
    {
      question: "Como funciona a geração de recibos em 2 vias?",
      answer: "O REALIZZE gera automaticamente o recibo com o valor por extenso preenchido, discriminação do imóvel, competência e dados do locador e locatário, pronto para salvar em PDF ou imprimir na folha já formatada com 1ª via (Locador) e 2ª via (Inquilino)."
    },
    {
      question: "Posso utilizar para locação de veículos ou equipamentos além de imóveis?",
      answer: "Sim! A plataforma é multi-segmento e permite gerenciar contratos de locação imobiliária residencial, comercial, galpões, ferramentas, maquinários agrícolas e veículos com acompanhamento de prazos e valores."
    },
    {
      question: "Como funcionam os avisos no WhatsApp e e-mail?",
      answer: "Com apenas um clique, o sistema gera mensagens prontas com o link ou dados do pagamento e abre diretamente a conversa com o inquilino no WhatsApp ou cliente de e-mail, reduzindo a inadimplência sem desgaste."
    },
    {
      question: "Meus dados e contratos ficam seguros?",
      answer: "Sim. Todas as informações trafegam com criptografia TLS/HTTPS de ponta a ponta e ficam armazenadas em servidores seguros com rotinas de backup diário e opção de exportação completa dos seus dados."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-zinc-900 selection:text-white font-sans antialiased">
      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-zinc-200/80 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-sm">
              <Building2 size={18} />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-zinc-900 block leading-none">REALIZZE</span>
              <span className="text-[10px] font-medium text-zinc-500 block mt-0.5 tracking-normal">Gestão Imobiliária</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-600">
            <a href="#recursos" className="hover:text-zinc-900 transition-colors">Recursos</a>
            <a href="#demonstracao" className="hover:text-zinc-900 transition-colors">Como Funciona</a>
            <a href="#simulador" className="hover:text-zinc-900 transition-colors">Simulador</a>
            <a href="#planos" className="hover:text-zinc-900 transition-colors">Planos</a>
            <a href="#faq" className="hover:text-zinc-900 transition-colors">Dúvidas</a>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={onLogin}
              className="text-xs font-medium text-zinc-700 hover:text-zinc-900 px-3 py-2 transition-colors"
            >
              Entrar
            </button>
            <button 
              onClick={() => onRegister('Gratuito', 'mensal')}
              className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-xs font-medium shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-sm transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <span>Começar Grátis</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle geometric ambient lighting */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-b from-blue-50/50 via-zinc-100/40 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 text-[11px] font-medium text-zinc-700 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistema completo para locações de imóveis, bens e frotas</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.15] mb-6">
            Contratos, aluguéis e recibos gerenciados em um só lugar.
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Elimine planilhas manuais e formulários complexos. Automatize recibos em 2 vias com valor por extenso, controle vencimentos em tempo real e reduza a inadimplência com avisos práticos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto mb-10">
            <button 
              onClick={() => onRegister('Gratuito', 'mensal')}
              className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3.5 rounded-xl text-sm font-medium shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Criar Conta Gratuita</span>
              <ChevronRight size={16} />
            </button>
            <a 
              href="#demonstracao"
              className="w-full sm:w-auto bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 px-5 py-3.5 rounded-xl text-sm font-medium transition-colors text-center"
            >
              Ver Demonstração
            </a>
          </div>

          {/* Micro trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-zinc-500 font-medium pt-2 border-t border-zinc-200/60 max-w-xl mx-auto">
            <div className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-600" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-600" />
              <span>Recibos em PDF de 1 clique</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-600" />
              <span>Backup e segurança em nuvem</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Mockup Showcase */}
        <div id="demonstracao" className="max-w-5xl mx-auto mt-14">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            {/* Mockup Topbar */}
            <div className="bg-zinc-50/80 px-4 py-3 border-b border-zinc-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                </div>
                <span className="text-xs text-zinc-400 font-mono ml-2 hidden sm:inline">app.realizze.com.br</span>
              </div>

              {/* Interactive Mockup Tabs */}
              <div className="flex items-center bg-zinc-200/60 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('dashboard')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activePreviewTab === 'dashboard'
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Dashboard Financeiro
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('recibo')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activePreviewTab === 'recibo'
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Recibo em 2 Vias
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('notificacoes')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activePreviewTab === 'notificacoes'
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Alertas & WhatsApp
                </button>
              </div>
            </div>

            {/* Mockup Body Content */}
            <div className="p-5 sm:p-7 bg-zinc-50/30">
              <AnimatePresence mode="wait">
                {activePreviewTab === 'dashboard' && (
                  <motion.div
                    key="tab-dash"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-5"
                  >
                    {/* 4 Mini KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="text-[11px] font-medium text-zinc-500">Previsão do Mês</div>
                        <div className="text-xl font-semibold text-zinc-900 mt-1 font-mono">R$ 52.800,00</div>
                        <div className="text-[10px] text-emerald-600 font-medium mt-0.5">24 contratos ativos</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="text-[11px] font-medium text-zinc-500">Realizado / Pago</div>
                        <div className="text-xl font-semibold text-zinc-900 mt-1 font-mono">R$ 49.600,00</div>
                        <div className="text-[10px] text-zinc-500 font-medium mt-0.5">94% liquidado</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="text-[11px] font-medium text-zinc-500">Pendências</div>
                        <div className="text-xl font-semibold text-zinc-900 mt-1 font-mono">R$ 3.200,00</div>
                        <div className="text-[10px] text-rose-600 font-medium mt-0.5">2 em aberto</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="text-[11px] font-medium text-zinc-500">Ocupação</div>
                        <div className="text-xl font-semibold text-zinc-900 mt-1 font-mono">96%</div>
                        <div className="text-[10px] text-zinc-500 font-medium mt-0.5">24 de 25 bens locados</div>
                      </div>
                    </div>

                    {/* Chart Box */}
                    <div className="bg-white p-5 rounded-xl border border-zinc-200/80">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-xs font-semibold text-zinc-900">Histórico de Fluxo de Caixa</h4>
                          <p className="text-[11px] text-zinc-500">Acompanhamento consolidado mensal</p>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-sm bg-zinc-900" /> Recebido
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-sm bg-rose-500" /> Pendente
                          </span>
                        </div>
                      </div>
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={previewCashFlow} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                            <Bar dataKey="recebido" fill="#18181b" radius={[3, 3, 0, 0]} barSize={20} />
                            <Bar dataKey="pendente" fill="#f43f5e" radius={[3, 3, 0, 0]} barSize={20} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activePreviewTab === 'recibo' && (
                  <motion.div
                    key="tab-recibo"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="bg-white p-6 rounded-xl border border-zinc-200/80 max-w-2xl mx-auto space-y-4 text-xs font-sans"
                  >
                    <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
                      <div>
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Recibo de Aluguel</span>
                        <h4 className="text-base font-bold text-zinc-900 mt-0.5">Nº 0184/2026</h4>
                        <p className="text-[11px] text-zinc-500">1ª Via - Locador</p>
                      </div>
                      <div className="text-right bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200/80">
                        <div className="text-[10px] text-zinc-400 font-medium">Valor Total</div>
                        <div className="text-base font-bold text-zinc-900 font-mono">R$ 2.450,00</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-zinc-700 leading-relaxed bg-zinc-50/50 p-3.5 rounded-lg border border-zinc-100">
                      <p>
                        Recebemos de <strong className="text-zinc-900">Ana Beatriz Carvalho</strong> (CPF 048.***.***-22) a quantia de <strong className="text-zinc-900">Dois mil e quatrocentos e cinquenta reais</strong> referente ao aluguel do imóvel situado em:
                      </p>
                      <p className="text-zinc-500 font-medium">
                        Rua das Palmeiras, 340 - Apto 402, Centro - Belo Horizonte/MG
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-[11px] text-zinc-500 border-t border-dashed border-zinc-200">
                      <div>Competência: <strong>Agosto/2026</strong></div>
                      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200/60">
                        <CheckCircle2 size={12} />
                        <span>Pago e Quitado</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activePreviewTab === 'notificacoes' && (
                  <motion.div
                    key="tab-notif"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="max-w-xl mx-auto space-y-3"
                  >
                    <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-sm flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-200/60">
                          <MessageCircle size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-zinc-900">Aviso no WhatsApp (1 Clique)</div>
                          <div className="text-[11px] text-zinc-500">Lembrete de vencimento amigável para Carlos Oliveira</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/60 whitespace-nowrap">
                        Pronto para envio
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-sm flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-200/60">
                          <FileText size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-zinc-900">Vencimento de Contrato em 45 dias</div>
                          <div className="text-[11px] text-zinc-500">Imóvel Apto 102 - Notificação de renovação contratual</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200/60 whitespace-nowrap">
                        Alerta Automático
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Recurso Cards / Grid Section */}
      <section id="recursos" className="py-20 bg-white border-y border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Recursos Práticos</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Tudo o que você precisa para gerenciar sua carteira
            </h3>
            <p className="text-sm text-zinc-500 mt-2">
              Desenvolvido com base nas rotinas reais de proprietários, corretores e administradores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-50/60 p-6 rounded-xl border border-zinc-200/80 hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-4 shadow-sm">
                <Printer size={20} />
              </div>
              <h4 className="text-base font-semibold text-zinc-900 mb-2">Recibos em 2 Vias & PDF</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Geração automática com valor por extenso, detalhamento de dados do imóvel e formato perfeito para impressão ou envio digital.
              </p>
            </div>

            <div className="bg-zinc-50/60 p-6 rounded-xl border border-zinc-200/80 hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-4 shadow-sm">
                <LineChart size={20} />
              </div>
              <h4 className="text-base font-semibold text-zinc-900 mb-2">Fluxo de Caixa & Inadimplência</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Visão mensal de recebimentos, histórico de quitações, controle de taxa de ocupação e alertas visuais de parcelas em atraso.
              </p>
            </div>

            <div className="bg-zinc-50/60 p-6 rounded-xl border border-zinc-200/80 hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-4 shadow-sm">
                <FileText size={20} />
              </div>
              <h4 className="text-base font-semibold text-zinc-900 mb-2">Contratos com Tags Inteligentes</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Editor de contratos com substituição automática de dados de locatários, fiadores, reajustes, datas e guarda de documentos anexos.
              </p>
            </div>

            <div className="bg-zinc-50/60 p-6 rounded-xl border border-zinc-200/80 hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-4 shadow-sm">
                <MessageCircle size={20} />
              </div>
              <h4 className="text-base font-semibold text-zinc-900 mb-2">Disparos no WhatsApp & E-mail</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Lembretes pré-vencimento e avisos de pendência com texto formatado prontos para envio instantâneo sem fricção.
              </p>
            </div>

            <div className="bg-zinc-50/60 p-6 rounded-xl border border-zinc-200/80 hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-4 shadow-sm">
                <Building size={20} />
              </div>
              <h4 className="text-base font-semibold text-zinc-900 mb-2">Multi-Segmento Flexível</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Atende desde locações imobiliárias residenciais e comerciais até galpões, frotas de carros/motos e ferramentas/maquinários.
              </p>
            </div>

            <div className="bg-zinc-50/60 p-6 rounded-xl border border-zinc-200/80 hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-4 shadow-sm">
                <Database size={20} />
              </div>
              <h4 className="text-base font-semibold text-zinc-900 mb-2">Backup Seguro & Auditoria</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Armazenamento em nuvem com logs de auditoria de alterações, exportação e restauração completa de dados a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Simulator / ROI Section */}
      <section id="simulador" className="py-20 px-4 sm:px-6 bg-zinc-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-10 shadow-sm">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Simulador de Produtividade</span>
              <h3 className="text-2xl font-bold text-zinc-900 tracking-tight mt-1">
                Quanto tempo e dinheiro você economiza com o REALIZZE?
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 mb-2">
                  <span>Volume de imóveis ou contratos administrados:</span>
                  <span className="text-base font-bold text-zinc-900 font-mono bg-zinc-100 px-3 py-1 rounded-lg">
                    {imoveisCountSlider} {imoveisCountSlider === 1 ? 'contrato' : 'contratos'}
                  </span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="100"
                  value={imoveisCountSlider}
                  onChange={(e) => setImoveisCountSlider(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                />
                <div className="flex justify-between text-[11px] text-zinc-400 mt-1 font-mono">
                  <span>1</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100+</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 text-center">
                  <div className="text-xs text-zinc-500 font-medium">Tempo economizado todo mês</div>
                  <div className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-1 font-mono">
                    ~{horasEconomizadas} horas
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">em rotinas de cobrança, recibos e conferência</div>
                </div>

                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 text-center">
                  <div className="text-xs text-zinc-500 font-medium">Economia estimada ao ano</div>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 font-mono">
                    R$ {economiaFinanceiraAno.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">reduzindo atrasos e custos burocráticos</div>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => onRegister('Gratuito', 'mensal')}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-6 py-3 rounded-xl shadow-sm transition-all"
                >
                  Começar a economizar agora
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Planos */}
      <section id="planos" className="py-20 bg-white border-y border-zinc-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Valores Claros</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Planos sem tarifas ocultas
            </h3>
            <p className="text-sm text-zinc-500 mt-2">
              Comece no plano gratuito e evolua quando sua carteira crescer. Cancele quando quiser.
            </p>
          </div>

          {/* Switcher Mensal / Anual */}
          <div className="flex justify-center mb-12">
            <div className="bg-zinc-100 p-1 rounded-xl flex items-center border border-zinc-200/80 text-xs font-medium">
              <button
                type="button"
                onClick={() => setBillingCycle('mensal')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  billingCycle === 'mensal'
                    ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('anual')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  billingCycle === 'anual'
                    ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <span>Anual</span>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  -20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Gratuito */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-7 flex flex-col justify-between hover:border-zinc-300 transition-colors shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-zinc-500">Iniciante</span>
                  <span className="text-[10px] font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md">Sem Cartão</span>
                </div>

                <h4 className="text-xl font-bold text-zinc-900">Gratuito</h4>
                <p className="text-xs text-zinc-500 mt-1 mb-5">Ideal para conhecer a plataforma e gerenciar seu primeiro contrato.</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-zinc-900 font-mono">R$ 0</span>
                  <span className="text-xs text-zinc-500">/ sempre</span>
                </div>

                <ul className="space-y-3 text-xs text-zinc-600 mb-8 border-t border-zinc-100 pt-5">
                  <li className="flex items-center gap-2.5">
                    <Check size={15} className="text-zinc-900 flex-shrink-0" />
                    <span>Até <strong>1 imóvel / contrato ativo</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={15} className="text-zinc-900 flex-shrink-0" />
                    <span>Emissão de recibos em 2 vias com extenso</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={15} className="text-zinc-900 flex-shrink-0" />
                    <span>Controle de recebimentos e baixas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={15} className="text-zinc-900 flex-shrink-0" />
                    <span>Acesso a todas as tabelas e cadastros</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onRegister('Gratuito', 'mensal')}
                className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium text-xs rounded-xl transition-colors"
              >
                Começar Grátis
              </button>
            </div>

            {/* Ilimitado */}
            <div className="bg-zinc-900 text-white rounded-2xl p-7 flex flex-col justify-between shadow-md relative border border-zinc-800">
              <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                Recomendado
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-zinc-400">Profissional</span>
                </div>

                <h4 className="text-xl font-bold text-white">Ilimitado</h4>
                <p className="text-xs text-zinc-400 mt-1 mb-5">Para proprietários, administradores e imobiliárias sem limites de volume.</p>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-white font-mono">
                    R$ {billingCycle === 'mensal' ? '19,90' : '15,90'}
                  </span>
                  <span className="text-xs text-zinc-400">/ mês</span>
                </div>
                {billingCycle === 'anual' && (
                  <p className="text-[11px] text-emerald-400 font-medium mb-5">
                    Cobrado R$ 190,80 ao ano (Economia de R$ 48,00)
                  </p>
                )}
                {billingCycle === 'mensal' && <div className="mb-5" />}

                <ul className="space-y-3 text-xs text-zinc-300 mb-8 border-t border-zinc-800 pt-5">
                  <li className="flex items-center gap-2.5">
                    <Check size={15} className="text-emerald-400 flex-shrink-0" />
                    <span>Contratos e imóveis <strong>ilimitados</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={15} className="text-emerald-400 flex-shrink-0" />
                    <span>Disparos rápidos no WhatsApp e E-mail</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={15} className="text-emerald-400 flex-shrink-0" />
                    <span>Editor completo de minutas e tags dinâmicas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={15} className="text-emerald-400 flex-shrink-0" />
                    <span>Armazenamento de anexos e fiadores</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={15} className="text-emerald-400 flex-shrink-0" />
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onRegister('Ilimitado', billingCycle)}
                className="w-full py-3 bg-white hover:bg-zinc-100 text-zinc-900 font-medium text-xs rounded-xl transition-colors shadow-sm"
              >
                Assinar Plano Ilimitado
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-zinc-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Dúvidas Frequentes</h2>
            <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">Perguntas e Respostas</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-xl border border-zinc-200/80 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-zinc-900 hover:bg-zinc-50/50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown 
                      size={16} 
                      className={`text-zinc-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-zinc-800' : ''}`} 
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 bg-zinc-900 text-white text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h3 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Pronto para simplificar a gestão dos seus contratos?
          </h3>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Cadastre-se gratuitamente agora e comece a emitir seus recibos e organizar suas cobranças em menos de 2 minutos.
          </p>
          <div className="pt-2">
            <button 
              onClick={() => onRegister('Gratuito', 'mensal')}
              className="bg-white hover:bg-zinc-100 text-zinc-900 px-7 py-3.5 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-[0.98] inline-flex items-center gap-2"
            >
              <span>Criar Minha Conta Gratuita</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-zinc-200/80 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-zinc-900">
            <Building2 size={16} />
            <span>REALIZZE</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            © {new Date().getFullYear()} REALIZZE - Gestão Imobiliária e de Contratos. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* WhatsApp Floating Contact Button */}
      <a 
        href="#" 
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white p-3.5 rounded-full shadow-lg hover:bg-emerald-700 hover:scale-105 transition-all active:scale-95 flex items-center justify-center"
        aria-label="Falar conosco no WhatsApp"
        onClick={(e) => {
          e.preventDefault();
          window.open('https://wa.me/5511999999999?text=Ol%C3%A1,%20gostaria%20de%20saber%20mais%20sobre%20o%20REALIZZE!', '_blank');
        }}
      >
        <MessageCircle size={22} />
      </a>
    </div>
  );
}
