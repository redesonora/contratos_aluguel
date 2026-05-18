import React from 'react';

interface LogsTabProps {
  logs: any[];
}

export const LogsTab: React.FC<LogsTabProps> = ({ logs }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-50 bg-slate-50/30">
        <h3 className="font-black text-slate-800 uppercase tracking-tight">Audit Log System</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Last 50 system events</p>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Data/Hora</th>
              <th className="px-6 py-4">Ação</th>
              <th className="px-6 py-4">Módulo</th>
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-400 font-mono">
                  {new Date(log.created_at).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded uppercase text-[9px] font-black ${
                    log.acao === 'ACESSO' ? 'bg-blue-100 text-blue-600' : 
                    log.acao === 'EXCLUSÃO' ? 'bg-red-100 text-red-600' : 
                    log.acao === 'CRIAÇÃO' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {log.acao}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 font-bold uppercase tracking-tight">{log.tabela}</td>
                <td className="px-6 py-4 text-slate-500">{log.userProfiles?.nome || log.user_id?.substring(0, 8)}</td>
                <td className="px-6 py-4 text-slate-400 italic truncate max-w-[300px]">
                  {typeof log.detalhes === 'object' ? JSON.stringify(log.detalhes) : log.detalhes}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-20 text-slate-400 font-medium italic">Nenhum evento registrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
