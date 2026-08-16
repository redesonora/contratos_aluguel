import React from 'react';
import { Mail, Clock, RefreshCw } from 'lucide-react';

export function PendingActivation({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50/50 p-6">
      <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-center max-w-md w-full">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 border border-amber-200/60 rounded-xl flex items-center justify-center mx-auto mb-5">
          <Mail size={22} />
        </div>
        <h2 className="text-xl font-semibold text-zinc-900 tracking-tight mb-2">Conta Pendente de Ativação</h2>
        <p className="text-xs text-zinc-500 leading-relaxed mb-6">
          Seu cadastro com o e-mail <span className="font-medium text-zinc-800">{email}</span> foi realizado com sucesso e aguarda confirmação ou liberação de acesso.
        </p>
        <div className="inline-flex items-center justify-center text-zinc-400 gap-1.5 px-3 py-1.5 bg-zinc-50 rounded-full border border-zinc-200/60 text-xs mb-6">
          <Clock size={13} className="text-zinc-400" />
          <span className="font-medium text-zinc-600">Aguardando ativação</span>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-medium transition-all shadow-xs"
        >
          <RefreshCw size={14} />
          Verificar Status
        </button>
      </div>
    </div>
  );
}

