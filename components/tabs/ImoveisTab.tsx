import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Eye, Archive, ArchiveRestore, X } from 'lucide-react';

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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={14} />
          </span>
          <input 
            type="text"
            placeholder="Pesquisar bem / item, endereço, apelido..."
            value={imovelSearch}
            onChange={(e) => setImovelSearch(e.target.value)}
            className="pl-8 pr-4 py-2 border-2 border-slate-100 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-blue-400 transition-all w-full bg-white"
          />
        </div>

        <select 
          value={imovelCityFilter}
          onChange={(e) => setImovelCityFilter(e.target.value)}
          className="px-3 py-2 border-2 border-slate-100 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-blue-400 transition-all bg-white"
        >
          <option value="todas">Todas as Cidades</option>
          {availableCities.map(city => (
            <option key={city as string} value={city as string}>{city as string}</option>
          ))}
        </select>

        <select 
          value={imovelStatusFilter}
          onChange={(e) => setImovelStatusFilter(e.target.value)}
          className="px-3 py-2 border-2 border-slate-100 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-blue-400 transition-all bg-white"
        >
          <option value="todos">Todos os Status</option>
          {availableStatus.map(st => (
            <option key={st as string} value={st as string}>{st as string}</option>
          ))}
        </select>

        <select 
          value={imovelTypeFilter}
          onChange={(e) => setImovelTypeFilter(e.target.value)}
          className="px-3 py-2 border-2 border-slate-100 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-blue-400 transition-all bg-white"
        >
          <option value="todos">Todos os Tipos</option>
          {availableTypes.map(type => (
            <option key={type as string} value={type as string}>{type as string}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500 text-[10px] uppercase tracking-widest font-black">
                <SortHeader label="Bem / Item / Endereço" sortKey="endereco" activeTab="imoveis" />
                <SortHeader label="Bairro" sortKey="bairro" activeTab="imoveis" />
                <SortHeader label="Tipo" sortKey="tipo_imovel" activeTab="imoveis" />
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 transition-all text-sm font-medium">
            <AnimatePresence mode="popLayout">
              {paginatedImoveis.map((im, idx) => (
                <motion.tr 
                  key={im.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  custom={idx}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      {im.apelido && (
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 opacity-70 group-hover:opacity-100 transition-all">
                          {im.apelido}
                        </span>
                      )}
                      <p className="font-bold text-slate-800 tracking-tight">{im.endereco}, {im.numero}</p>
                      <p className="text-[10px] text-slate-400 font-medium font-mono uppercase mt-0.5">CEP: {im.cep}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-slate-700 font-bold">{im.bairro}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{im.cidade} / {im.estado}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest inline-block w-fit border ${
                      im.tipo_imovel === 'COMERCIAL' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {im.tipo_imovel || 'RESIDENCIAL'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter inline-block w-fit border ${
                      im.status === 'Disponível' ? 'bg-green-50 text-green-600 border-green-100' : 
                      im.status === 'Alugado' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {im.status || 'Disponível'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                          onClick={() => {
                            setViewingItem(im);
                            setViewModalOpen(true);
                          }}
                          className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all"
                          title="Visualizar Detalhes"
                        >
                          <Eye size={16} />
                        </button>
                       {can('ARCHIVE', 'imoveis') && (
                         <button 
                          onClick={() => handleToggleArchive(im, 'imoveis')}
                          className="text-slate-400 hover:text-amber-500 p-2 rounded-lg hover:bg-amber-50 transition-all"
                          title={im.arquivado ? "Restaurar" : "Arquivar"}
                        >
                          {im.arquivado ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                        </button>
                       )}
                      {can('EDIT', 'imoveis') && (
                        <button 
                          onClick={() => openCreateModal(im)}
                          className="text-[10px] font-black text-slate-400 hover:text-blue-600 px-3 py-2 uppercase tracking-widest transition-all hover:bg-blue-50 rounded-lg"
                        >
                          Editar
                        </button>
                      )}
                      {can('DELETE', 'imoveis') && (
                        <button 
                          onClick={() => setItemToDelete({ id: im.id, type: 'imoveis' })}
                          className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {paginatedImoveis.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-20 text-slate-400 font-medium italic">Nenhum bem/item {showArchived ? 'arquivado' : 'cadastrado'}.</td>
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
