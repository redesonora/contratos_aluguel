'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, ChevronDown, MessageCircle, FileText, Search } from 'lucide-react';

const faqs = [
  { 
    category: 'Primeiros Passos',
    icon: <HelpCircle size={16} />,
    items: [
      { question: 'Como funciona o plano Gratuito?', answer: 'O plano Gratuito oferece acesso completo ao sistema para gerenciamento de 1 imóvel ou contrato, sem limite de tempo e sem exigir cartão de crédito. Você pode gerar recibos, cadastrar o inquilino e acompanhar os pagamentos livremente.' },
      { question: 'Como faço para alterar meu plano?', answer: 'Para gerenciar mais de um contrato, você pode fazer o upgrade a qualquer momento. Acesse a aba "Meu Perfil" ou a tela de configurações, selecione o plano Ilimitado (mensal ou anual) e siga as instruções.' },
    ]
  },
  {
    category: 'Contratos e Recibos',
    icon: <FileText size={16} />,
    items: [
      { question: 'Como crio um novo contrato?', answer: 'Na tela principal (Dashboard), clique na aba "Contratos". Em seguida, clique no botão para adicionar um novo contrato. Preencha os dados básicos do imóvel, locatário, vigência e valores. O sistema manterá este registro ativo para acompanhamento.' },
      { question: 'Como gerar recibos em 2 vias?', answer: 'Com um contrato ativo, você pode clicar no botão "Recibo" associado a ele. O sistema irá compilar os dados preenchendo automaticamente o valor por extenso e demais informações, gerando um PDF formatado em 1ª via (Locador) e 2ª via (Inquilino).' }
    ]
  },
  {
    category: 'Notificações e Suporte',
    icon: <MessageCircle size={16} />,
    items: [
      { question: 'Como funcionam os avisos no WhatsApp?', answer: 'Em vez de digitar mensagens repetitivas, o sistema disponibiliza botões que abrem diretamente o seu WhatsApp com um texto pré-formatado (incluindo o nome do locatário e mês de referência), facilitando a cobrança e reduzindo a inadimplência.' },
      { question: 'Preciso de ajuda específica, com quem falo?', answer: 'Se você encontrar algum problema ou tiver uma dúvida não listada aqui, utilize o botão do WhatsApp flutuante na tela inicial, ou envie um e-mail para nossa equipe de suporte. Estamos sempre prontos para auxiliar!' }
    ]
  }
];

export default function HelpModal({ onClose }: { onClose: () => void }) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4 font-sans"
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-zinc-200"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
                <HelpCircle size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Central de Ajuda</h2>
                <p className="text-xs text-zinc-500 font-medium">Tire suas dúvidas e aprenda a usar o sistema</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-8 bg-white">
            {faqs.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-zinc-400">{section.icon}</div>
                  <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">{section.category}</h3>
                </div>
                <div className="space-y-3">
                  {section.items.map((item, itemIdx) => {
                    const id = `${sectionIdx}-${itemIdx}`;
                    const isOpen = openIndex === id;
                    return (
                      <div 
                        key={itemIdx} 
                        className={`border rounded-xl transition-colors overflow-hidden ${isOpen ? 'border-zinc-300 bg-zinc-50/30' : 'border-zinc-200/80 hover:border-zinc-300'}`}
                      >
                        <button
                          className="w-full text-left px-5 py-4 flex justify-between items-center gap-4 outline-none"
                          onClick={() => setOpenIndex(isOpen ? null : id)}
                        >
                          <span className={`text-sm font-semibold transition-colors ${isOpen ? 'text-zinc-900' : 'text-zinc-700'}`}>
                            {item.question}
                          </span>
                          <ChevronDown size={18} className={`flex-shrink-0 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-zinc-900' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 pt-1 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100/0">
                                {item.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
            <p className="text-[11px] text-zinc-500 font-medium">Ainda precisa de ajuda?</p>
            <button 
              onClick={() => window.open('https://wa.me/5511999999999?text=Preciso%20de%20ajuda%20com%20o%20REALIZZE', '_blank')}
              className="text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 shadow-sm px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors flex items-center gap-2"
            >
              <MessageCircle size={14} />
              Falar no WhatsApp
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
