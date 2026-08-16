import React from 'react';
import { Search, Archive, ArchiveRestore, Trash2, Edit2 } from 'lucide-react';

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
    (pr.nome || '').toLowerCase().includes(proprietarioSearch.toLowerCase()) || 
    (pr.cpf_cnpj || '').toLowerCase().includes(proprietarioSearch.toLowerCase()) ||
    (pr.email || '').toLowerCase().includes(proprietarioSearch.toLowerCase())
  );
  
  const { data: paginatedProprietarios, totalPages: proprietariosPages } = getPaginatedAndSortedData(dataToUse, 'proprietarios');
  
  return (
    <div className="flex flex-col gap-4">
      {/* Busca */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <Search size={15} />
          </span>
          <input 
            type="text" 
            placeholder="Buscar por proprietário, cedente, e-mail ou documento..." 
            value={proprietarioSearch}
            onChange={(e) => setProprietarioSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-xs font-normal text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all w-full bg-white"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-zinc-50/75 border-b border-zinc-200/80">
              <tr className="text-zinc-500 text-xs font-medium">
                <SortHeader label="Proprietário / Cedente" sortKey="nome" activeTab="proprietarios" />
                <SortHeader label="Cidade & Endereço" sortKey="cidade" activeTab="proprietarios" />
                <th className="px-5 py-3 font-medium">Contato</th>
                <th className="px-5 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-normal">
              {paginatedProprietarios.map(pr => (
                <tr key={pr.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 font-semibold text-xs border border-zinc-200 flex-shrink-0">
                        {pr.nome?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">{pr.nome}</p>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">DOC: {pr.cpf_cnpj}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-zinc-800 font-medium">{pr.cidade} - {pr.estado}</p>
                    <p className="text-[11px] text-zinc-400 truncate max-w-[220px]">{pr.bairro}, {pr.endereco}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-xs text-zinc-700">{pr.email}</p>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{pr.telefone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {can('ARCHIVE', 'proprietarios') && (
                        <button 
                          onClick={() => handleToggleArchive(pr, 'proprietarios')}
                          className="text-zinc-400 hover:text-amber-600 p-1.5 rounded-md hover:bg-amber-50 transition-colors"
                          title={pr.arquivado ? "Restaurar" : "Arquivar"}
                        >
                          {pr.arquivado ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                        </button>
                      )}
                      {can('EDIT', 'proprietarios') && (
                        <button 
                          onClick={() => openCreateModal(pr)}
                          className="text-zinc-400 hover:text-zinc-800 p-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={15} />
                        </button>
                      )}
                      {can('DELETE', 'proprietarios') && (
                        <button 
                          onClick={() => setItemToDelete({ id: pr.id, type: 'proprietarios' })}
                          className="text-zinc-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedProprietarios.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-zinc-400 font-normal">
                    Nenhum proprietário/cedente {showArchived ? 'arquivado' : 'cadastrado'}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination tab="proprietarios" totalPages={proprietariosPages} />
      </div>
    </div>
  );
};

