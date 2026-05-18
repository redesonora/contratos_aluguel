import React from 'react';
import { Search, Loader2, Trash, Edit3 } from 'lucide-react';

interface UsuariosTabProps {
  perfis: any[];
  SortHeader: React.ElementType;
  loading: boolean;
  handleApproveUser: (id: string) => void;
  handleChangeRole: (id: string, role: string) => void;
  handleDeleteUser: (id: string, role: string) => void;
  onEditUser: (user: any) => void;
}

export const UsuariosTab: React.FC<UsuariosTabProps> = ({
  perfis,
  SortHeader,
  loading,
  handleApproveUser,
  handleChangeRole,
  handleDeleteUser,
  onEditUser
}) => {
  const assinantesCount = perfis.filter(p => p.status_pagamento === 'PAGO').length;
  const trialCount = perfis.filter(p => p.trial_ends_at && new Date(p.trial_ends_at) > new Date() && p.status_pagamento !== 'PAGO').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-4">Gestão de Usuários</h2>
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 px-4 py-2 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 font-sans">{assinantesCount} Assinantes</span>
            </div>
            <div className="bg-amber-50 px-4 py-2 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 font-sans">{trialCount} em Trial</span>
            </div>
          </div>
        </div>
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nome, e-mail ou CPF..." 
            className="bg-white border-2 border-slate-100 focus:border-blue-400 outline-none rounded-full px-12 py-3 text-sm font-bold w-full md:w-80 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500 text-[10px] uppercase font-black tracking-widest">
                <SortHeader label="Usuário / E-mail" sortKey="nome" activeTab="usuarios" />
                <th className="px-6 py-4 text-center">Nível</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              {perfis.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-700 font-black text-xs">
                        {p.nome ? p.nome.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 tracking-tight">{p.nome || 'Usuário s/ nome'}</p>
                        <p className="text-xs text-slate-400">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border text-center ${
                      p.role === 'MASTER' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                      p.role === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-100' : 
                      p.role === 'CORRETOR' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center flex-col items-center gap-1">
                      {!p.approved ? (
                        <button 
                          onClick={() => handleApproveUser(p.id)}
                          disabled={loading}
                          className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          {loading ? <Loader2 size={12} className="animate-spin" /> : 'Aguardando Aprovação'}
                        </button>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                          Aprovado
                        </span>
                      )}
                      
                      {p.plano && (
                         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{p.plano}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center flex-col md:flex-row gap-2">
                       <button 
                        onClick={() => onEditUser(p)}
                        className="text-slate-400 hover:text-blue-600 p-2 transition-all"
                        title="Editar Usuário"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(p.id, p.role)}
                        className="text-slate-300 hover:text-red-500 p-2 transition-all"
                        title="Remover Usuário"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {perfis.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-20 text-slate-400 font-medium italic">Nenhum usuário encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
