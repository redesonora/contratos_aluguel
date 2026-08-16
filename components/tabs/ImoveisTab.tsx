import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Eye, Archive, ArchiveRestore, Trash2, Edit2 } from 'lucide-react';

interface ImoveisTabProps {
  showArchived: boolean;
  archivedImoveis: any[];
  imoveis: any[];
  imovelCityFilter: string;
  imovelStatusFilter: string;
  imovelTypeFilter: string;
  imovelSearch: string;
  setImovelSearch: (s: string) => void;
  setImovelCityFilter: (s: string) => void;
  setImovelStatusFilter: (s: string) => void;
  setImovelTypeFilter: (s: string) => void;
  getPaginatedAndSortedData: (data: any[], tab: string) => { data: any[], totalPages: number };
  SortHeader: React.ElementType;
  Pagination: React.ElementType;
  itemVariants: any;
  setViewingItem: (item: any) => void;
  setViewModalOpen: (b: boolean) => void;
  can: (action: string, tab: string) => boolean;
  handleToggleArchive: (item: any, type: string) => void;
  openCreateModal: (item: any) => void;
  setItemToDelete: (obj: {id: string, type: 'imoveis'} | null) => void;
}

export const ImoveisTab: React.FC<ImoveisTabProps> = ({
  showArchived,
  archivedImoveis,
  imoveis,
  imovelCityFilter,
  imovelStatusFilter,
  imovelTypeFilter,
  imovelSearch,
  setImovelSearch,
  setImovelCityFilter,
  setImovelStatusFilter,
  setImovelTypeFilter,
  getPaginatedAndSortedData,
  SortHeader,
  Pagination,
  itemVariants,
  setViewingItem,
  setViewModalOpen,
  can,
  handleToggleArchive,
  openCreateModal,
  setItemToDelete
}) => {
  const rawDataToUse = showArchived ? archivedImoveis : imoveis;
  const availableCities = Array.from(new Set(rawDataToUse.map(im => im.cidade).filter(Boolean))).sort();
  const availableTypes = Array.from(new Set(rawDataToUse.map(im => im.tipo_imovel).filter(Boolean))).sort();
  const availableStatus = Array.from(new Set(rawDataToUse.map(im => im.status).filter(Boolean))).sort();

  const filteredData = rawDataToUse.filter(im => {
    const matchesCity = imovelCityFilter === 'todas' || im.cidade === imovelCityFilter;
    const matchesStatus = imovelStatusFilter === 'todos' || im.status === imovelStatusFilter;
    const matchesType = imovelTypeFilter === 'todos' || im.tipo_imovel === imovelTypeFilter;
    const searchLower = imovelSearch.toLowerCase();
    const matchesSearch = 
      imovelSearch === '' ||
      (im.endereco || '').toLowerCase().includes(searchLower) ||
      (im.bairro || '').toLowerCase().includes(searchLower) ||
      (im.apelido || '').toLowerCase().includes(searchLower) ||
      (im.cep || '').toLowerCase().includes(searchLower);
    
    return matchesCity && matchesStatus && matchesType && matchesSearch;
  });

  const { data: paginatedImoveis, totalPages: imoveisPages } = getPaginatedAndSortedData(filteredData, 'imoveis');
  
  return (
    <div className="flex flex-col gap-4">
      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-2.5">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <Search size={15} />
          </span>
          <input 
            type="text"
            placeholder="Buscar por endereço, apelido, bairro ou CEP..."
            value={imovelSearch}
            onChange={(e) => setImovelSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-xs font-normal text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all w-full bg-white"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <select 
            value={imovelCityFilter}
            onChange={(e) => setImovelCityFilter(e.target.value)}
            className="px-3 py-2 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 bg-white"
          >
            <option value="todas">Todas as Cidades</option>
            {availableCities.map(city => (
              <option key={city as string} value={city as string}>{city as string}</option>
            ))}
          </select>

          <select 
            value={imovelStatusFilter}
            onChange={(e) => setImovelStatusFilter(e.target.value)}
            className="px-3 py-2 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 bg-white"
          >
            <option value="todos">Todos os Status</option>
            {availableStatus.map(st => (
              <option key={st as string} value={st as string}>{st as string}</option>
            ))}
          </select>

          <select 
            value={imovelTypeFilter}
            onChange={(e) => setImovelTypeFilter(e.target.value)}
            className="px-3 py-2 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 bg-white"
          >
            <option value="todos">Todos os Tipos</option>
            {availableTypes.map(type => (
              <option key={type as string} value={type as string}>{type as string}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[650px]">
            <thead className="bg-zinc-50/75 border-b border-zinc-200/80">
              <tr className="text-zinc-500 text-xs font-medium">
                <SortHeader label="Bem / Item / Endereço" sortKey="endereco" activeTab="imoveis" />
                <SortHeader label="Bairro & Cidade" sortKey="bairro" activeTab="imoveis" />
                <SortHeader label="Tipo" sortKey="tipo_imovel" activeTab="imoveis" />
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-normal">
              <AnimatePresence mode="popLayout">
                {paginatedImoveis.map((im, idx) => (
                  <motion.tr 
                    key={im.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    custom={idx}
                    className="hover:bg-zinc-50/70 transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        {im.apelido && (
                          <span className="text-[11px] font-medium text-blue-600 mb-0.5">
                            {im.apelido}
                          </span>
                        )}
                        <p className="font-medium text-zinc-900">{im.endereco}, {im.numero}</p>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">CEP {im.cep}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-zinc-800 font-medium">{im.bairro}</p>
                      <p className="text-[11px] text-zinc-500">{im.cidade} - {im.estado}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                        im.tipo_imovel === 'COMERCIAL' 
                          ? 'bg-purple-50 text-purple-700 border-purple-200/60' 
                          : 'bg-zinc-100 text-zinc-700 border-zinc-200/60'
                      }`}>
                        {im.tipo_imovel || 'RESIDENCIAL'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                        im.status === 'Disponível' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 
                        im.status === 'Alugado' ? 'bg-blue-50 text-blue-700 border-blue-200/60' : 
                        'bg-amber-50 text-amber-700 border-amber-200/60'
                      }`}>
                        {im.status || 'Disponível'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => {
                            setViewingItem(im);
                            setViewModalOpen(true);
                          }}
                          className="text-zinc-400 hover:text-zinc-800 p-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                          title="Visualizar Detalhes"
                        >
                          <Eye size={15} />
                        </button>
                        {can('ARCHIVE', 'imoveis') && (
                          <button 
                            onClick={() => handleToggleArchive(im, 'imoveis')}
                            className="text-zinc-400 hover:text-amber-600 p-1.5 rounded-md hover:bg-amber-50 transition-colors"
                            title={im.arquivado ? "Restaurar" : "Arquivar"}
                          >
                            {im.arquivado ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                          </button>
                        )}
                        {can('EDIT', 'imoveis') && (
                          <button 
                            onClick={() => openCreateModal(im)}
                            className="text-zinc-400 hover:text-zinc-800 p-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={15} />
                          </button>
                        )}
                        {can('DELETE', 'imoveis') && (
                          <button 
                            onClick={() => setItemToDelete({ id: im.id, type: 'imoveis' })}
                            className="text-zinc-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {paginatedImoveis.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-zinc-400 font-normal">
                    Nenhum bem/item {showArchived ? 'arquivado' : 'cadastrado'}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination tab="imoveis" totalPages={imoveisPages} />
      </div>
    </div>
  );
};

