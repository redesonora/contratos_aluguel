import React from 'react';
import { Search, Archive, ArchiveRestore, X } from 'lucide-react';

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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={14} />
          </span>
          <input 
            type="text"
            placeholder="Pesquisar por nome, e-mail, CPF/CNPJ ou telefone..."
            value={inquilinoSearch}
            onChange={(e) => setInquilinoSearch(e.target.value)}
            className="pl-8 pr-4 py-2 border-2 border-slate-100 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-blue-400 transition-all w-full bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500 text-[10px] uppercase tracking-widest font-black">
              <SortHeader label="Inquilino" sortKey="nome" activeTab="inquilinos" />
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 transition-all text-sm font-medium">
            {paginatedInquilinos.map(inq => (
              <tr key={inq.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-black text-xs border border-slate-200">
                      {inq.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 uppercase tracking-tight">{inq.nome}</p>
                      <p className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-tighter">DOC: {inq.cpf_cnpj}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-blue-600 font-bold">{inq.email}</p>
                  <p className="text-xs text-slate-500">{inq.telefone}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    {inq.arquivado ? 'Arquivado' : 'Ativo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  {can('ARCHIVE', 'inquilinos') && (
                    <button 
                      onClick={() => handleToggleArchive(inq, 'inquilinos')}
                      className="text-slate-400 hover:text-amber-500 p-2 transition-colors"
                      title={inq.arquivado ? "Restaurar" : "Arquivar"}
                    >
                      {inq.arquivado ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                    </button>
                  )}
                  {can('EDIT', 'inquilinos') && (
                    <button 
                      onClick={() => openCreateModal(inq)}
                      className="text-slate-400 hover:text-blue-600 font-bold p-2 transition-colors text-xs uppercase tracking-widest"
                    >
                      Editar
                    </button>
                  )}
                  {can('DELETE', 'inquilinos') && (
                    <button 
                      onClick={() => setItemToDelete({ id: inq.id, type: 'inquilinos' })}
                      className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {paginatedInquilinos.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-20 text-slate-400 font-medium italic">Nenhum inquilino {showArchived ? 'arquivado' : 'cadastrado'}.</td>
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
