import React from 'react';
import { Mail, Clock } from 'lucide-react';

export function PendingActivation({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="text-amber-600" size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-4">Conta Pendente</h2>
        <p className="text-slate-600 mb-6">
          Olá! Seu cadastro na plataforma <span className="font-semibold">{email}</span> foi realizado com sucesso, porém aguarda confirmação de e-mail ou aprovação do administrador.
        </p>
        <div className="flex items-center justify-center text-slate-400 gap-2 mb-8">
            <Clock size={16} />
            <span className="text-sm font-medium">Aguardando ativação...</span>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
        >
          Verificar Status
        </button>
      </div>
    </div>
  );
}
