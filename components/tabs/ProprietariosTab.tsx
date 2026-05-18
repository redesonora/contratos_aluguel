import React from 'react';
import { Archive, ArchiveRestore, X } from 'lucide-react';

interface ProprietariosTabProps {
  showArchived: boolean;
  archivedProprietarios: any[];
  proprietarios: any[];
  getPaginatedAndSortedData: (data: any[], tab: string) => { data: any[], totalPages: number };
  SortHeader: React.ElementType;
  Pagination: React.ElementType;
  can: (action: string, tab: string) => boolean;
  handleToggleArchive: (item: any, type: string) => void;
  openCreateModal: (item: any) => void;
  setItemToDelete: (obj: {id: string, type: 'proprietarios'} | null) => void;
  proprietarioSearch: string;
  setProprietarioSearch: (search: string) => void;
}

export const ProprietariosTab: React.FC<ProprietariosTabProps> = ({
  showArchived,
  archivedProprietarios,
  proprietarios,
  getPaginatedAndSortedData,
  SortHeader,
  Pagination,
  can,
  handleToggleArchive,
  openCreateModal,
  setItemToDelete,
  proprietarioSearch,
  setProprietarioSearch
}) => {
  const dataToUse = (showArchived ? archivedProprietarios : proprietarios).filter(pr => 
    pr.nome.toLowerCase().includes(proprietarioSearch.toLowerCase()) || 
    pr.cpf_cnpj?.toLowerCase().includes(proprietarioSearch.toLowerCase())
  );
  
  const { data: paginatedProprietarios, totalPages: proprietariosPages } = getPaginatedAndSortedData(dataToUse, 'proprietarios');
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-100">
        <input 
          type="text" 
          placeholder="Buscar proprietário..." 
          value={proprietarioSearch}
          onChange={(e) => setProprietarioSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500 text-[10px] uppercase tracking-widest font-black">
              <SortHeader label="Proprietário" sortKey="nome" activeTab="proprietarios" />
              <SortHeader label="Cidade" sortKey="cidade" activeTab="proprietarios" />
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 transition-all text-sm font-medium">
            {paginatedProprietarios.map(pr => (
            <tr key={pr.id} className="hover:bg-slate-50/50">
              <td className="px-6 py-4">
                <p className="font-bold text-slate-800 uppercase tracking-tight">{pr.nome}</p>
                <p className="text-[10px] text-slate-400 font-bold font-mono">CPF/CNPJ: {pr.cpf_cnpj}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-slate-700 font-bold">{pr.cidade} - {pr.estado}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest truncate max-w-[200px]">{pr.bairro}, {pr.endereco}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-xs text-blue-600 font-bold">{pr.email}</p>
                <p className="text-xs text-slate-500">{pr.telefone}</p>
              </td>
              <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                 {can('ARCHIVE', 'proprietarios') && (
                   <button 
                    onClick={() => handleToggleArchive(pr, 'proprietarios')}
                    className="text-slate-400 hover:text-amber-500 p-2 transition-colors"
                    title={pr.arquivado ? "Restaurar" : "Arquivar"}
                  >
                    {pr.arquivado ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                  </button>
                 )}
                {can('EDIT', 'proprietarios') && (
                  <button 
                    onClick={() => openCreateModal(pr)}
                    className="text-slate-400 hover:text-blue-600 font-bold p-2 transition-colors text-xs uppercase tracking-widest"
                  >
                    Editar
                  </button>
                )}
                {can('DELETE', 'proprietarios') && (
                  <button 
                    onClick={() => setItemToDelete({ id: pr.id, type: 'proprietarios' })}
                    className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </td>
            </tr>
          ))}
          {paginatedProprietarios.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-20 text-slate-400 font-medium italic">Nenhum proprietário {showArchived ? 'arquivado' : 'cadastrado'}.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    <Pagination tab="proprietarios" totalPages={proprietariosPages} />
  </div>
  );
};
