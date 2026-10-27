import React, { useState } from 'react';
import { 
  Building, 
  User, 
  FileText, 
  ExternalLink, 
  Mail, 
  Ban, 
  CreditCard,
  Search,
  PlusCircle,
  Hash,
  Trash2,
  Edit3,
  RefreshCw,
  Eye,
  Clock,
  AlertTriangle,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Filter,
  FileX,
  Printer
} from 'lucide-react';

interface ContratosTabProps {
  contratos: any[];
  pagamentos: any[];
  can: (action: string, tab?: string) => boolean;
  contractSearch: string;
  setContractSearch: (val: string) => void;
  handleSendEmailNotification: (co: any, type: 'VENCIMENTO' | 'ATRASO') => void;
  handleFinishContract: (co: any) => void;
  handleToggleArchive: (item: any, type: string) => void;
  setSelectedContractForFinance: (co: any) => void;
  setFinanceModalOpen: (open: boolean) => void;
  selectedTemplateIdx: number;
  contractTemplates: any[];
  openCreateModal: (item?: any) => void;
  setItemToDelete: (val: {id: string, type: 'contratos' | 'imoveis' | 'inquilinos' | 'proprietarios'}) => void;
  setIsRenewModalOpen: (open: boolean) => void;
  setContractToRenew: (co: any) => void;
  handleOpenRescisaoModal?: (co: any) => void;
}

export interface ContractExpirationInfo {
  daysRemaining: number | null;
  isExpiringSoon: boolean; // dentro de 30 dias (1 mês)
  isExpired: boolean;
  statusLabel: string | null;
  urgency: 'expired' | 'critical' | 'soon' | 'future' | 'none';
}

export const getContractExpirationInfo = (dataFim?: string | null, status?: string): ContractExpirationInfo => {
  if (!dataFim) {
    return {
      daysRemaining: null,
      isExpiringSoon: false,
      isExpired: false,
      statusLabel: null,
      urgency: 'none'
    };
  }

  const isFinalized = status === 'finalizado' || status === 'cancelado';

  const cleanStr = String(dataFim).trim();
  let endDate: Date;

  if (cleanStr.includes('-')) {
    const datePart = cleanStr.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length === 3) {
      endDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      endDate = new Date(cleanStr);
    }
  } else if (cleanStr.includes('/')) {
    const parts = cleanStr.split('/');
    if (parts.length === 3) {
      endDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    } else {
      endDate = new Date(cleanStr);
    }
  } else {
    endDate = new Date(cleanStr);
  }

  if (isNaN(endDate.getTime())) {
    return {
      daysRemaining: null,
      isExpiringSoon: false,
      isExpired: false,
      statusLabel: null,
      urgency: 'none'
    };
  }

  endDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - today.getTime();
  const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (isFinalized) {
    return {
      daysRemaining,
      isExpiringSoon: false,
      isExpired: false,
      statusLabel: null,
      urgency: 'none'
    };
  }

  const isExpired = daysRemaining < 0;
  const isExpiringSoon = daysRemaining >= 0 && daysRemaining <= 30; // Alerta de 1 mês antes

  let statusLabel = '';
  let urgency: 'expired' | 'critical' | 'soon' | 'future' = 'future';

  if (isExpired) {
    const absDays = Math.abs(daysRemaining);
    statusLabel = absDays === 1 ? 'Vencido há 1 dia' : `Vencido há ${absDays} dias`;
    urgency = 'expired';
  } else if (daysRemaining === 0) {
    statusLabel = 'Vence hoje!';
    urgency = 'critical';
  } else if (daysRemaining === 1) {
    statusLabel = 'Vence amanhã';
    urgency = 'critical';
  } else if (isExpiringSoon) {
    statusLabel = `Vence em ${daysRemaining} dias`;
    urgency = daysRemaining <= 7 ? 'critical' : 'soon';
  } else {
    statusLabel = `Vence em ${daysRemaining} dias`;
    urgency = 'future';
  }

  return {
    daysRemaining,
    isExpiringSoon,
    isExpired,
    statusLabel,
    urgency
  };
};

export const ContratosTab: React.FC<ContratosTabProps> = ({
  contratos,
  pagamentos,
  can,
  contractSearch,
  setContractSearch,
  handleSendEmailNotification,
  handleFinishContract,
  handleToggleArchive,
  setSelectedContractForFinance,
  setFinanceModalOpen,
  selectedTemplateIdx,
  contractTemplates,
  openCreateModal,
  setItemToDelete,
  setIsRenewModalOpen,
  setContractToRenew,
  handleOpenRescisaoModal
}) => {
  const [filterMode, setFilterMode] = useState<'todos' | 'vencendo' | 'vigentes' | 'vencidos'>('todos');

  const activeContratos = contratos.filter(c => !c.arquivado);
  
  // Contadores para os filtros rápidos
  const stats = activeContratos.reduce((acc, co) => {
    const exp = getContractExpirationInfo(co.data_fim, co.status);
    if (co.status === 'ativo' || !co.status) {
      if (exp.isExpiringSoon) acc.vencendo++;
      else if (exp.isExpired) acc.vencidos++;
      else acc.vigentes++;
    }
    return acc;
  }, { vencendo: 0, vencidos: 0, vigentes: 0 });

  // Busca textual
  const searchedContratos = activeContratos.filter(co => {
    const search = contractSearch.toLowerCase();
    const matchEndereco = co.imoveis?.endereco?.toLowerCase().includes(search);
    const matchApelido = co.imoveis?.apelido?.toLowerCase().includes(search);
    const matchInquilino = co.inquilinos?.nome?.toLowerCase().includes(search);
    const matchProprietario = co.proprietarios?.nome?.toLowerCase().includes(search);
    return matchEndereco || matchApelido || matchInquilino || matchProprietario;
  });

  // Filtro por modo (todos / vencendo / vigentes / vencidos)
  const filteredContratos = searchedContratos.filter(co => {
    if (filterMode === 'todos') return true;
    const exp = getContractExpirationInfo(co.data_fim, co.status);
    const isActive = co.status === 'ativo' || !co.status;
    if (!isActive) return false;
    if (filterMode === 'vencendo') return exp.isExpiringSoon;
    if (filterMode === 'vencidos') return exp.isExpired;
    if (filterMode === 'vigentes') return !exp.isExpiringSoon && !exp.isExpired;
    return true;
  });

  // Ordenação: 
  // 1. Contratos próximos a vencer no topo (0 a 30 dias), ordenados do mais próximo para o mais distante.
  // 2. Contratos vencidos ativos.
  // 3. Demais contratos vigentes ordenados cronologicamente pelo término mais próximo.
  // 4. Sem data de término ou finalizados ao final.
  const sortedContratos = [...filteredContratos].sort((a, b) => {
    const expA = getContractExpirationInfo(a.data_fim, a.status);
    const expB = getContractExpirationInfo(b.data_fim, b.status);

    const getRank = (exp: ContractExpirationInfo, co: any) => {
      if (co.status === 'finalizado' || co.status === 'cancelado') return 4;
      if (exp.daysRemaining === null) return 4;
      if (exp.isExpiringSoon) return 1; // Prioridade máxima: vence em até 30 dias
      if (exp.isExpired) return 2;      // Vencidos ativos
      return 3;                         // Vigentes com prazo superior a 30 dias
    };

    const rankA = getRank(expA, a);
    const rankB = getRank(expB, b);

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    // Se ambos estão próximos a vencer: o que vence primeiro fica no topo
    if (rankA === 1) {
      return (expA.daysRemaining ?? 0) - (expB.daysRemaining ?? 0);
    }

    // Se ambos estão vencidos: o mais recentemente vencido primeiro
    if (rankA === 2) {
      return (expB.daysRemaining ?? 0) - (expA.daysRemaining ?? 0);
    }

    // Se ambos são vigentes regulares: ordenar pelo vencimento mais próximo
    if (rankA === 3) {
      return (expA.daysRemaining ?? 0) - (expB.daysRemaining ?? 0);
    }

    return 0;
  });

  const handlePrintDocument = (co: any) => {
    const inquilino = co.inquilinos?.nome || 'Locatário';
    const currentTemplate = contractTemplates[selectedTemplateIdx];
    const fontSize = currentTemplate?.fontSize || 12;
    const fontColor = currentTemplate?.fontColor || '#000000';

    const win = window.open('', '_blank');
    if (win) {
      win.document.title = `Contrato - ${inquilino}`;
      win.document.write(`
        <html>
          <head>
            <title>Contrato - ${inquilino}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
              
              * { margin: 0; padding: 0; box-sizing: border-box; }
              
              body { 
                font-family: 'Inter', sans-serif; 
                background: #f1f5f9;
                color: ${fontColor}; 
                line-height: 1.6;
                -webkit-print-color-adjust: exact;
              }

              .print-header {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1000;
                background: #0f172a;
                padding: 10px 16px;
                border-radius: 99px;
                display: flex;
                align-items: center;
                gap: 24px;
                box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
                border: 1px solid rgba(255,255,255,0.1);
              }

              .print-header span {
                color: #94a3b8;
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                margin-left: 12px;
              }

              .print-button {
                background: #2563eb;
                color: white;
                border: none;
                padding: 10px 28px;
                border-radius: 99px;
                font-size: 11px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              }

              .print-button:hover {
                background: #1d4ed8;
                transform: translateY(-1px) scale(1.02);
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
              }

              .page {
                width: 210mm;
                min-height: 297mm;
                padding: 30mm 25mm;
                margin: 100px auto 60px auto;
                background: white;
                box-shadow: 0 0 40px rgba(0,0,0,0.1);
                font-size: ${fontSize}px;
                position: relative;
                text-align: left;
              }

              .contract-content {
                width: 100%;
                color: inherit;
                text-align: left;
                font-weight: 400;
              }

              .contract-content p { 
                margin-bottom: 0.25em; 
                font-weight: normal; 
                text-transform: none;
              }
              
              .contract-content h1, .contract-content h2, .contract-content h3, 
              .contract-content h4, .contract-content h5, .contract-content h6 {
                margin-bottom: 0.5em;
                margin-top: 0.8em;
                line-height: 1.2;
                font-weight: bold;
                text-transform: none;
                text-align: inherit;
              }
              .contract-content h1 { font-size: 2em; }
              .contract-content h2 { font-size: 1.5em; }
              .contract-content h3 { font-size: 1.17em; }
              .contract-content h4 { font-size: 1em; }
              .contract-content h5 { font-size: 0.83em; }
              .contract-content h6 { font-size: 0.67em; }
              
              .contract-content font[size="1"] { font-size: 10px !important; }
              .contract-content font[size="2"] { font-size: 13px !important; }
              .contract-content font[size="3"] { font-size: 16px !important; }
              .contract-content font[size="4"] { font-size: 18px !important; }
              .contract-content font[size="5"] { font-size: 24px !important; }
              .contract-content font[size="6"] { font-size: 32px !important; }
              .contract-content font[size="7"] { font-size: 48px !important; }
              
              .contract-content *[style*="text-align: center"],
              .contract-content center { 
                text-align: center !important; 
                display: block; 
              }
              .contract-content *[style*="text-align: right"] { text-align: right !important; }
              .contract-content *[style*="text-align: justify"] { text-align: justify !important; }
              .contract-content *[style*="text-align: left"] { text-align: left !important; }
              
              .contract-content b, .contract-content strong {
                font-weight: bold !important;
              }

              @media print {
                body { background: white; padding: 0; margin: 0; }
                .print-header { display: none; }
                .page { 
                  margin: 0; 
                  padding: 20mm; 
                  width: 100%; 
                  box-shadow: none;
                  min-height: auto;
                }
                @page { size: A4; margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="print-header no-print">
              <span>Modo de Impressão</span>
              <button class="print-button" onclick="window.print()">Imprimir Contrato</button>
            </div>
            <div class="page">
              <div class="contract-content">
                ${co.clausulas || 'Contrato sem conteúdo registrado.'}
              </div>
            </div>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div className="space-y-4">
      {/* Alerta Global de Vencimentos Próximos se houver contratos expirando em 30 dias */}
      {stats.vencendo > 0 && filterMode !== 'vencendo' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_1px_3px_rgba(217,119,6,0.06)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Clock size={16} className="animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <span>{stats.vencendo === 1 ? '1 contrato próximo do vencimento' : `${stats.vencendo} contratos próximos do vencimento`}</span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                  Alerta de 1 mês
                </span>
              </p>
              <p className="text-[11px] text-amber-800/90 font-normal">
                Os contratos foram organizados com os vencimentos mais próximos posicionados no topo para agilizar sua renovação.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterMode('vencendo')}
            className="text-xs font-semibold text-amber-900 bg-white hover:bg-amber-100/70 border border-amber-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-xs"
          >
            <Filter size={12} />
            Ver apenas próximos
          </button>
        </div>
      )}

      {/* Header com Busca, Filtros Rápidos e Novo Contrato */}
      <div className="flex flex-col gap-3 bg-white p-3 sm:p-4 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
            <input 
              type="text" 
              placeholder="Buscar por bem / item, locatário ou cedente..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-normal text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all"
              value={contractSearch}
              onChange={(e) => setContractSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => openCreateModal()}
            className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg font-medium text-xs hover:bg-zinc-800 transition-colors w-full sm:w-auto justify-center shadow-sm"
          >
            <PlusCircle size={14} />
            Novo Contrato
          </button>
        </div>

        {/* Chips de Filtro Rápido e Ordenação */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterMode('todos')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                filterMode === 'todos'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
              }`}
            >
              <span>Todos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                filterMode === 'todos' ? 'bg-zinc-700 text-white' : 'bg-zinc-200 text-zinc-700'
              }`}>
                {activeContratos.length}
              </span>
            </button>

            <button
              onClick={() => setFilterMode('vencendo')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                filterMode === 'vencendo'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100/80 border border-amber-200/80'
              }`}
            >
              <Clock size={12} className={filterMode === 'vencendo' ? 'text-white' : 'text-amber-600'} />
              <span>Próximos a Vencer</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                filterMode === 'vencendo' ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
              }`}>
                {stats.vencendo}
              </span>
            </button>

            <button
              onClick={() => setFilterMode('vigentes')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                filterMode === 'vigentes'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
              }`}
            >
              <CheckCircle2 size={12} />
              <span>Vigentes</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                filterMode === 'vigentes' ? 'bg-zinc-700 text-white' : 'bg-zinc-200 text-zinc-700'
              }`}>
                {stats.vigentes}
              </span>
            </button>

            {stats.vencidos > 0 && (
              <button
                onClick={() => setFilterMode('vencidos')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  filterMode === 'vencidos'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100/80 border border-rose-200/80'
                }`}
              >
                <AlertCircle size={12} />
                <span>Vencidos</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  filterMode === 'vencidos' ? 'bg-rose-700 text-white' : 'bg-rose-200 text-rose-900'
                }`}>
                  {stats.vencidos}
                </span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Ordenados por proximidade do vencimento</span>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Contratos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedContratos.map((co) => {
          const expInfo = getContractExpirationInfo(co.data_fim, co.status);
          const isAtivo = co.status === 'ativo' || !co.status;

          return (
            <div 
              key={co.id} 
              className={`rounded-xl border shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col transition-all relative ${
                isAtivo && expInfo.isExpiringSoon
                  ? 'bg-gradient-to-b from-amber-50/40 via-white to-white border-amber-300 ring-1 ring-amber-200/70 hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/5'
                  : isAtivo && expInfo.isExpired
                  ? 'bg-gradient-to-b from-rose-50/40 via-white to-white border-rose-300 ring-1 ring-rose-200/60 hover:border-rose-400'
                  : 'bg-white border-zinc-200/80 hover:border-zinc-300'
              }`}
            >
              {/* Alerta Visual Sutil no Topo do Card para Contratos com Vencimento Próximo (1 mês) */}
              {isAtivo && expInfo.isExpiringSoon && (
                <div className="bg-gradient-to-r from-amber-100/90 via-amber-50 to-orange-50/70 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-amber-950">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Clock size={13} className="text-amber-600 flex-shrink-0 animate-pulse" />
                    <span>Vencimento Próximo: <strong className="text-amber-900">{expInfo.statusLabel}</strong></span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full border border-amber-300/60 shadow-2xs">
                    Alerta de 1 mês
                  </span>
                </div>
              )}

              {/* Alerta para Contratos Vencidos */}
              {isAtivo && expInfo.isExpired && (
                <div className="bg-gradient-to-r from-rose-100/90 via-rose-50 to-red-50/70 border-b border-rose-200 px-4 py-2 flex items-center justify-between text-rose-950">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <AlertCircle size={13} className="text-rose-600 flex-shrink-0" />
                    <span>Atenção: <strong className="text-rose-900">{expInfo.statusLabel}</strong></span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-200/70 px-2 py-0.5 rounded-full border border-rose-300/60 shadow-2xs">
                    Vencido
                  </span>
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between">
                {/* Linha Superior: Apelido/Endereço e Badges de Status */}
                <div>
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                          isAtivo && expInfo.isExpiringSoon 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          <Building size={13} />
                        </div>
                        <h4 className="text-xs font-semibold text-zinc-900 line-clamp-1">
                          {co.imoveis?.apelido || co.imoveis?.endereco || 'Item sem identificação'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-normal ml-8 line-clamp-1">
                        {co.imoveis?.endereco ? `${co.imoveis.endereco}, ${co.imoveis.numero || 'S/N'}` : 'Endereço não informado'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                      {isAtivo && expInfo.isExpiringSoon && (
                        <div className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <Clock size={10} className="text-amber-600" />
                          <span>{expInfo.daysRemaining === 0 ? 'Vence hoje' : `${expInfo.daysRemaining}d restantes`}</span>
                        </div>
                      )}
                      <div className={`text-[11px] px-2 py-0.5 rounded-md font-medium border flex-shrink-0 ${
                        isAtivo ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 
                        co.status === 'finalizado' ? 'bg-zinc-100 text-zinc-600 border-zinc-200/60' : 
                        'bg-rose-50 text-rose-700 border-rose-200/60'
                      }`}>
                        {isAtivo ? 'Ativo' : co.status === 'finalizado' ? 'Finalizado' : 'Cancelado'}
                      </div>
                    </div>
                  </div>

                  {/* Seção das Pessoas (Locatário e Cedente/Proprietário) */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-zinc-100 mb-3">
                    <div>
                      <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 uppercase tracking-wider mb-0.5">
                        <User size={10} /> Locatário
                      </p>
                      <p className="text-xs font-medium text-zinc-800 truncate">{co.inquilinos?.nome || 'Não informado'}</p>
                    </div>
                    <div className="border-l border-zinc-100 pl-3">
                      <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 uppercase tracking-wider mb-0.5">
                        <User size={10} /> Cedente / Prop.
                      </p>
                      <p className="text-xs font-medium text-zinc-800 truncate">{co.proprietarios?.nome || 'Não informado'}</p>
                    </div>
                  </div>

                  {/* Datas de Início e Término */}
                  <div className={`grid grid-cols-2 gap-3 rounded-lg p-3 border text-xs transition-colors ${
                    isAtivo && expInfo.isExpiringSoon 
                      ? 'bg-amber-50/60 border-amber-200/80' 
                      : isAtivo && expInfo.isExpired
                      ? 'bg-rose-50/50 border-rose-200/80'
                      : 'bg-zinc-50/75 border-zinc-200/60'
                  }`}>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block">Início</span>
                      <span className="font-medium text-zinc-700">
                        {co.data_inicio ? new Date(co.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR') : '--/--/----'}
                      </span>
                    </div>
                    <div className={`border-l pl-3 ${
                      isAtivo && expInfo.isExpiringSoon ? 'border-amber-200' : 'border-zinc-200/60'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block">Término</span>
                        {isAtivo && expInfo.isExpiringSoon && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.2 rounded">
                            {expInfo.statusLabel}
                          </span>
                        )}
                      </div>
                      <span className={`font-medium ${
                        isAtivo && expInfo.isExpired ? 'text-rose-600 font-semibold' : 
                        isAtivo && expInfo.isExpiringSoon ? 'text-amber-800 font-semibold' : 
                        'text-zinc-700'
                      }`}>
                        {co.data_fim ? new Date(co.data_fim + 'T00:00:00').toLocaleDateString('pt-BR') : '--/--/----'}
                      </span>
                    </div>
                  </div>

                  {/* Documentos Anexos */}
                  {(co.arquivo_url || (co.documentos && co.documentos.length > 0)) && (
                    <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                      {co.arquivo_url && (
                        <a 
                          href={co.arquivo_url}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200/70 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <FileText size={12} />
                          PDF do Contrato
                          <ExternalLink size={10} className="text-zinc-400" />
                        </a>
                      )}
                      {co.documentos?.map((doc: string, idx: number) => (
                        <a 
                          key={idx} 
                          href={doc} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 bg-white border border-zinc-200 px-2 py-0.5 rounded-md hover:border-zinc-300 transition-colors"
                        >
                          <Hash size={10} className="text-zinc-400" />
                          Anexo {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Rodapé de Ações */}
              <div className={`border-t px-4 py-2.5 flex items-center justify-between gap-2 ${
                isAtivo && expInfo.isExpiringSoon 
                  ? 'bg-amber-50/50 border-amber-200/70' 
                  : 'bg-zinc-50/75 border-zinc-200/80'
              }`}>
                <div className="flex items-center gap-0.5">
                  <button 
                    onClick={() => handleSendEmailNotification(co, 'VENCIMENTO')}
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-md transition-colors"
                    title="Enviar Lembrete por E-mail"
                  >
                    <Mail size={15} />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedContractForFinance(co);
                      setFinanceModalOpen(true);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-md transition-colors"
                    title="Financeiro"
                  >
                    <CreditCard size={15} />
                  </button>
                  <button 
                    onClick={() => handleOpenRescisaoModal ? handleOpenRescisaoModal(co) : handleFinishContract(co)}
                    className={`p-1.5 rounded-md transition-colors ${
                      isAtivo 
                        ? 'text-zinc-400 hover:text-rose-600 hover:bg-rose-50' 
                        : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60'
                    }`}
                    title={isAtivo ? "Encerrar / Rescindir Contrato" : "Ver Termo de Rescisão"}
                  >
                    <Ban size={15} />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handlePrintDocument(co)}
                    className="px-2.5 py-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-md transition-colors inline-flex items-center gap-1"
                  >
                    <Eye size={13} />
                    <span>Ver</span>
                  </button>
                  {isAtivo ? (
                    <button 
                      onClick={() => handleOpenRescisaoModal ? handleOpenRescisaoModal(co) : handleFinishContract(co)}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200/80 rounded-md transition-colors inline-flex items-center gap-1 shadow-2xs"
                      title="Encerrar contrato e emitir termo de rescisão"
                    >
                      <FileX size={13} />
                      <span>Encerrar</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleOpenRescisaoModal ? handleOpenRescisaoModal(co) : handleFinishContract(co)}
                      className="px-2.5 py-1 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200/80 rounded-md transition-colors inline-flex items-center gap-1 shadow-2xs"
                      title="Visualizar e imprimir termo de rescisão"
                    >
                      <Printer size={13} />
                      <span>Termo Rescisão</span>
                    </button>
                  )}
                  {isAtivo && (
                    <button 
                      onClick={() => {
                        setContractToRenew(co);
                        setIsRenewModalOpen(true);
                      }}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-1 ${
                        isAtivo && expInfo.isExpiringSoon
                          ? 'text-amber-800 bg-amber-100 hover:bg-amber-200/80 border border-amber-300'
                          : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      <RefreshCw size={13} />
                      <span>Renovar</span>
                    </button>
                  )}
                  <button 
                    onClick={() => openCreateModal(co)}
                    className="px-2.5 py-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-md transition-colors inline-flex items-center gap-1"
                  >
                    <Edit3 size={13} />
                    <span>Editar</span>
                  </button>
                  {can('DELETE', 'contratos') && (
                    <button 
                      onClick={() => setItemToDelete({ id: co.id, type: 'contratos' })}
                      className="px-2 py-1 text-xs font-medium text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors inline-flex items-center"
                      title="Excluir"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedContratos.length === 0 && (
        <div className="bg-white border border-zinc-200/80 rounded-xl py-20 flex flex-col items-center justify-center text-center px-4">
          <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mb-3">
            <FileText size={22} />
          </div>
          <h3 className="text-sm font-semibold text-zinc-800">Nenhum contrato encontrado</h3>
          <p className="text-zinc-500 text-xs max-w-xs mt-1">
            {filterMode !== 'todos' 
              ? 'Não há contratos nesta categoria no momento.' 
              : 'Sua busca não retornou resultados ou você ainda não possui contratos registrados.'}
          </p>
          {(contractSearch || filterMode !== 'todos') && (
            <div className="flex items-center gap-2 mt-4">
              {contractSearch && (
                <button 
                  onClick={() => setContractSearch('')}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Limpar busca
                </button>
              )}
              {filterMode !== 'todos' && (
                <button 
                  onClick={() => setFilterMode('todos')}
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:underline ml-2"
                >
                  Exibir todos os contratos
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
