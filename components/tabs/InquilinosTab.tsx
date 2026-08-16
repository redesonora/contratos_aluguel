import React from 'react';
import { Search, Archive, ArchiveRestore, Trash2, Edit2 } from 'lucide-react';

interface InquilinosTabProps {
  showArchived: boolean;
  archivedInquilinos: any[];
  inquilinos: any[];
  inquilinoSearch: string;
  setInquilinoSearch: (s: string) => void;
  getPaginatedAndSortedData: (data: any[], tab: string) => { data: any[], totalPages: number };
  SortHeader: React.ElementType;
  Pagination: React.ElementType;
  can: (action: string, tab: string) => boolean;
  handleToggleArchive: (item: any, type: string) => void;
  openCreateModal: (item: any) => void;
  setItemToDelete: (obj: {id: string, type: 'inquilinos'} | null) => void;
}

export const InquilinosTab: React.FC<InquilinosTabProps> = ({
  showArchived,
  archivedInquilinos,
  inquilinos,
  inquilinoSearch,
  setInquilinoSearch,
  getPaginatedAndSortedData,
  SortHeader,
  Pagination,
  can,
  handleToggleArchive,
  openCreateModal,
  setItemToDelete
}) => {
  const rawDataToUse = showArchived ? archivedInquilinos : inquilinos;
  
  const filteredData = rawDataToUse.filter(inq => {
    const searchLower = inquilinoSearch.toLowerCase();
    const matchesSearch = 
      inquilinoSearch === '' ||
      (inq.nome || '').toLowerCase().includes(searchLower) ||
      (inq.email || '').toLowerCase().includes(searchLower) ||
      (inq.cpf_cnpj || '').toLowerCase().includes(searchLower) ||
      (inq.telefone || '').toLowerCase().includes(searchLower);
    
    return matchesSearch;
  });

  const { data: paginatedInquilinos, totalPages: inquilinosPages } = getPaginatedAndSortedData(filteredData, 'inquilinos');

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
            placeholder="Buscar por nome, e-mail, CPF/CNPJ ou telefone..."
            value={inquilinoSearch}
            onChange={(e) => setInquilinoSearch(e.target.value)}
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
                <SortHeader label="Locatário / Cliente" sortKey="nome" activeTab="inquilinos" />
                <th className="px-5 py-3 font-medium">Contato</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-normal">
              {paginatedInquilinos.map(inq => (
                <tr key={inq.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 font-semibold text-xs border border-zinc-200 flex-shrink-0">
                        {inq.nome?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">{inq.nome}</p>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">DOC: {inq.cpf_cnpj}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-xs text-zinc-700 font-normal">{inq.email}</p>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{inq.telefone}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                      inq.arquivado 
                        ? 'bg-zinc-100 text-zinc-600 border-zinc-200/60' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                    }`}>
                      {inq.arquivado ? 'Arquivado' : 'Ativo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {can('ARCHIVE', 'inquilinos') && (
                        <button 
                          onClick={() => handleToggleArchive(inq, 'inquilinos')}
                          className="text-zinc-400 hover:text-amber-600 p-1.5 rounded-md hover:bg-amber-50 transition-colors"
                          title={inq.arquivado ? "Restaurar" : "Arquivar"}
                        >
                          {inq.arquivado ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                        </button>
                      )}
                      {can('EDIT', 'inquilinos') && (
                        <button 
                          onClick={() => openCreateModal(inq)}
                          className="text-zinc-400 hover:text-zinc-800 p-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={15} />
                        </button>
                      )}
                      {can('DELETE', 'inquilinos') && (
                        <button 
                          onClick={() => setItemToDelete({ id: inq.id, type: 'inquilinos' })}
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
              {paginatedInquilinos.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-zinc-400 font-normal">
                    Nenhum locatário/cliente {showArchived ? 'arquivado' : 'cadastrado'}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination tab="inquilinos" totalPages={inquilinosPages} />
      </div>
    </div>
  );
};

