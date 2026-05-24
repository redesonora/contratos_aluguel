'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, ChevronDown } from 'lucide-react';

const faq = [
  { question: 'Como crio um contrato?', answer: 'Vá na aba de Modelos de Contrato, selecione um modelo e preencha os dados necessários.' },
  { question: 'Como funciona o período gratuito?', answer: 'Todos os usuários têm acesso gratuito ilimitado para 1 cadastro de imóvel.' },
  { question: 'Como assino um plano?', answer: 'Clique no botão de upgrade e escolha entre Iniciante, Profissional ou Premium.' },
];

export default function HelpModal({ onClose }: { onClose: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <HelpCircle className="text-blue-600" />
              Ajuda & FAQ
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {faq.map((item, index) => (
              <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  className="w-full text-left p-4 flex justify-between items-center font-medium text-slate-700"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  {item.question}
                  <ChevronDown className={`transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                </button>
                {openIndex === index && (
                  <div className="p-4 pt-0 text-sm text-slate-500 border-t border-slate-100 bg-slate-50">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
