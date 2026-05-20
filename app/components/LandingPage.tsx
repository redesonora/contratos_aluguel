import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Home, ShieldCheck, Zap, LineChart, FileText, ChevronRight, CheckCircle2, TrendingUp, Building, MessageCircle, Gift, BookOpen, Users } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
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
              onClick={onRegister}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-95"
            >
              Teste Grátis
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
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              O Padrão Ouro em Gestão de Contratos
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[1.05]">
              Gestão de Contratos <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Sem Complicações.
              </span>
            </h1>
            
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
              Automatize cobranças, gerencie dezenas de contratos, e tenha total controle com métricas preditivas que projetam sua receita futura.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <button 
                onClick={onRegister}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95 flex items-center justify-center gap-3 group"
              >
                Crie sua conta agora
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="flex items-center gap-6 mt-6">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden z-[${4-i}]`} style={{ zIndex: 4-i }}>
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="text-xs font-bold text-slate-500">
                <span className="text-slate-800 font-black block text-sm">Mais de 500+</span>
                empresas confiam
              </div>
            </div>
          </motion.div>

          <motion.div 
            style={{ y: y1 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-emerald-50 rounded-[3rem] transform rotate-3 scale-105 -z-10 blur-xl opacity-70"></div>
            <div className="bg-white border-2 border-slate-100 p-8 rounded-[3rem] shadow-2xl flex flex-col gap-6 relative z-10 hover:border-blue-200 transition-colors duration-500">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Receita Prevista</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Até Setembro</p>
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

      {/* Features */}
      <section id="recursos" className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">Tudo que você precisa em um só lugar.</h2>
            <p className="text-slate-500 font-medium">Deixe as planilhas no passado. Nossa plataforma consolida contratos, financeiro e métricas avançadas num fluxo de trabalho inteligente.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FileText size={32} />}
              title="Geração de Contratos"
              desc="Gere contratos em PDF automaticamente usando templates personalizáveis com a sua marca e dados preenchidos na hora."
              color="text-blue-600"
              bg="bg-blue-50"
              border="border-blue-100"
            />
            <FeatureCard 
              icon={<LineChart size={32} />}
              title="Previsibilidade Financeira"
              desc="Acompanhe gráficos preditivos de receitas, taxas de inadimplência e projeções financeiras automatizadas para seu negócio escalável."
              color="text-emerald-600"
              bg="bg-emerald-50"
              border="border-emerald-100"
            />
            <FeatureCard 
              icon={<Zap size={32} />}
              title="Automação Inteligente"
              desc="Disparo de lembretes, reajustes automáticos pelo IPCA e validação inteligente de pagamentos para não gerar atritos."
              color="text-amber-600"
              bg="bg-amber-50"
              border="border-amber-100"
            />
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
                  onClick={onRegister}
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
              onClick={onRegister}
              className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] transition-all active:scale-95"
            >
              Começar Teste de 7 Dias Grátis
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

