import React from 'react';
import { 
  Building, 
  User, 
  CreditCard, 
  Search, 
  Printer, 
  Mail, 
  TrendingUp, 
  TrendingDown, 
  X, 
  BadgeDollarSign,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  PlusCircle,
  Archive,
  Download,
  FileDown,
  Loader2
} from 'lucide-react';

interface PagamentosTabProps {
  pagamentos: any[];
  paymentSearch: string;
  setPaymentSearch: (s: string) => void;
  paymentStatusFilter: string;
  setPaymentStatusFilter: (s: string) => void;
  paymentMonthFilter: number;
  setPaymentMonthFilter: (n: number) => void;
  selectedYear: number;
  setSelectedYear: (n: number) => void;
  formatarMoeda: (v: number) => string;
  StatusPagamento: any;
  handleSendEmailNotification: (co: any, type: 'ATRASO', date?: Date) => void;
  openReceiptModal: (p: any) => void;
  handleMarkAsPaid: (p: any, v: number) => void;
  openCreateModal: (item?: any) => void;
  showArchived: boolean;
  setShowArchived: (b: boolean) => void;
  loading?: boolean;
}

export const PagamentosTab: React.FC<PagamentosTabProps> = ({
  pagamentos,
  paymentSearch,
  setPaymentSearch,
  paymentStatusFilter,
  setPaymentStatusFilter,
  paymentMonthFilter,
  setPaymentMonthFilter,
  selectedYear,
  setSelectedYear,
  formatarMoeda,
  StatusPagamento,
  handleSendEmailNotification,
  openReceiptModal,
  handleMarkAsPaid,
  openCreateModal,
  showArchived,
  setShowArchived,
  loading
}) => {
  const filteredPagamentos = pagamentos.filter(p => {
    const matchesSearch = !paymentSearch || 
      (p.contratos?.inquilinos?.nome || '').toLowerCase().includes(paymentSearch.toLowerCase()) ||
      (p.contratos?.imoveis?.endereco || '').toLowerCase().includes(paymentSearch.toLowerCase());
    
    const matchesStatus = paymentStatusFilter === 'todos' || p.status === paymentStatusFilter;
    const matchesMonth = paymentMonthFilter === 0 || p.competencia_mes === paymentMonthFilter;
    const matchesYear = p.competencia_ano === selectedYear;
    
    return matchesSearch && matchesStatus && matchesMonth && matchesYear;
  });

  const stats = {
    totalFiltrado: filteredPagamentos.reduce((acc, p) => acc + (p.valor_esperado || 0), 0),
    totalRecebido: filteredPagamentos.filter(p => p.status === StatusPagamento.PAGO).reduce((acc, p) => acc + (p.valor_pago || p.valor_esperado || 0), 0),
    totalPendente: filteredPagamentos.filter(p => p.status !== StatusPagamento.PAGO).reduce((acc, p) => acc + (p.valor_esperado || 0), 0)
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-zinc-500 mb-0.5">Total Filtrado</p>
            <h3 className="text-xl font-semibold text-zinc-900 tracking-tight">{formatarMoeda(stats.totalFiltrado)}</h3>
          </div>
          <div className="w-9 h-9 bg-zinc-100 text-zinc-600 rounded-lg flex items-center justify-center">
            <DollarSign size={18} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-zinc-500 mb-0.5">Total Recebido</p>
            <h3 className="text-xl font-semibold text-emerald-600 tracking-tight">{formatarMoeda(stats.totalRecebido)}</h3>
          </div>
          <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-zinc-500 mb-0.5">Total Pendente</p>
            <h3 className="text-xl font-semibold text-amber-600 tracking-tight">{formatarMoeda(stats.totalPendente)}</h3>
          </div>
          <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Painel Principal com Tabela */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
        {/* Barra de Filtros */}
        <div className="p-3 sm:p-4 border-b border-zinc-200/80 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
            <input 
              type="text"
              placeholder="Buscar por inquilino ou endereço..."
              value={paymentSearch}
              onChange={(e) => setPaymentSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-normal text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select 
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            >
              <option value="todos">Todos Status</option>
              <option value={StatusPagamento.PENDENTE}>Pendente</option>
              <option value={StatusPagamento.PAGO}>Pago</option>
              <option value={StatusPagamento.ATRASADO}>Atrasado</option>
            </select>

            <select 
              value={paymentMonthFilter}
              onChange={(e) => setPaymentMonthFilter(Number(e.target.value))}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            >
              <option value={0}>Todos os Meses</option>
              {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-200">
              <span className="text-[11px] font-medium text-zinc-500">Ano:</span>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent border-none outline-none text-xs font-semibold text-zinc-800"
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de Recebimentos */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[850px]">
            <thead className="bg-zinc-50/75 border-b border-zinc-200/80">
              <tr className="text-zinc-500 text-xs font-medium">
                <th className="px-5 py-3">Locatário / Imóvel</th>
                <th className="px-5 py-3">Competência</th>
                <th className="px-5 py-3">Vencimento</th>
                <th className="px-5 py-3">Pagamento</th>
                <th className="px-5 py-3">Valor</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-normal">
              {filteredPagamentos.map(p => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const vencimentoDate = new Date(p.data_vencimento + 'T00:00:00');
                const isAtrasado = p.status !== StatusPagamento.PAGO && vencimentoDate < today;

                return (
                  <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <p className="font-medium text-zinc-900 text-xs">
                          {p.contratos?.inquilinos?.nome || 'Inquilino'}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate max-w-[220px] mt-0.5">
                          {p.contratos?.imoveis?.endereco}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] font-mono text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200/50">
                        {String(p.competencia_mes).padStart(2, '0')}/{p.competencia_ano}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className={`text-xs ${isAtrasado ? 'text-rose-600 font-medium' : 'text-zinc-600'}`}>
                        {new Date(p.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-zinc-600">
                        {p.data_pagamento ? new Date(p.data_pagamento).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className={`font-semibold ${p.status === StatusPagamento.PAGO ? 'text-emerald-600' : 'text-zinc-900'}`}>
                        {formatarMoeda(p.valor_pago || p.valor_esperado || 0)}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                        p.status === StatusPagamento.PAGO ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 
                        isAtrasado ? 'bg-rose-50 text-rose-700 border-rose-200/60' : 
                        'bg-amber-50 text-amber-700 border-amber-200/60'
                      }`}>
                        {p.status === StatusPagamento.PAGO ? (
                          <><CheckCircle2 size={11} /> Pago</>
                        ) : isAtrasado ? (
                          <><AlertCircle size={11} /> Atrasado</>
                        ) : (
                          <><Clock size={11} /> Pendente</>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status === StatusPagamento.PAGO ? (
                          <button 
                            onClick={() => openReceiptModal(p)}
                            className="text-zinc-600 hover:text-zinc-900 text-xs font-medium hover:bg-zinc-100 px-2 py-1 rounded-md transition-colors inline-flex items-center gap-1"
                          >
                            <Printer size={13} /> Recibo
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {p.observacoes && p.observacoes.startsWith('Asaas|') && (
                              <button 
                                onClick={() => {
                                  const parts = p.observacoes.split('|');
                                  const url = parts[1];
                                  if (url) window.open(url, '_blank');
                                }}
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 text-xs font-medium px-2.5 py-1 rounded-md transition-colors inline-flex items-center gap-1"
                                title="Abrir link de cobrança no Asaas (Pix, Boleto, Cartão)"
                              >
                                <CreditCard size={12} />
                                Asaas
                              </button>
                            )}
                            <button 
                               onClick={() => handleMarkAsPaid(p, p.valor_esperado || 0)}
                               disabled={loading}
                               className={`bg-zinc-900 text-white text-xs font-medium px-3 py-1 rounded-md hover:bg-zinc-800 transition-colors inline-flex items-center gap-1.5 shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {loading ? <Loader2 size={12} className="animate-spin" /> : null}
                              Baixar
                            </button>
                          </div>
                        )}
                        
                        {isAtrasado && p.status !== StatusPagamento.PAGO && (
                          <button 
                            onClick={() => handleSendEmailNotification(p.contratos, 'ATRASO', new Date(p.data_vencimento + 'T00:00:00'))}
                            className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Notificar cobrança por e-mail"
                          >
                            <Mail size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPagamentos.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-zinc-400 font-normal">
                    Nenhum registro encontrado para {selectedYear}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

