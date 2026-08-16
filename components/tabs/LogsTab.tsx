import React from 'react';

interface LogsTabProps {
  logs: any[];
}

export const LogsTab: React.FC<LogsTabProps> = ({ logs }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
      <div className="p-4 border-b border-zinc-200/80 bg-zinc-50/50">
        <h3 className="font-semibold text-zinc-900 text-sm tracking-tight">Registro de Auditoria</h3>
        <p className="text-xs text-zinc-500 font-normal mt-0.5">Últimos eventos e atividades registradas no sistema</p>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left min-w-[750px]">
          <thead className="bg-zinc-50/75 text-zinc-500 text-xs font-medium border-b border-zinc-200/80">
            <tr>
              <th className="px-5 py-3">Data/Hora</th>
              <th className="px-5 py-3">Ação</th>
              <th className="px-5 py-3">Módulo</th>
              <th className="px-5 py-3">Usuário</th>
              <th className="px-5 py-3">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs font-normal">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-50/70 transition-colors">
                <td className="px-5 py-3 text-zinc-500 font-mono text-[11px]">
                  {new Date(log.created_at).toLocaleString('pt-BR')}
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${
                    log.acao === 'ACESSO' ? 'bg-blue-50 text-blue-700 border-blue-200/60' : 
                    log.acao === 'EXCLUSÃO' ? 'bg-rose-50 text-rose-700 border-rose-200/60' : 
                    log.acao === 'CRIAÇÃO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-zinc-100 text-zinc-700 border-zinc-200/60'
                  }`}>
                    {log.acao}
                  </span>
                </td>
                <td className="px-5 py-3 text-zinc-800 font-medium">{log.tabela}</td>
                <td className="px-5 py-3 text-zinc-600">{log.userProfiles?.nome || log.user_id?.substring(0, 8)}</td>
                <td className="px-5 py-3 text-zinc-400 truncate max-w-[300px]">
                  {typeof log.detalhes === 'object' ? JSON.stringify(log.detalhes) : log.detalhes}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-16 text-zinc-400 font-normal">Nenhum evento registrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

