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
    <div className="flex flex-col gap-8">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Filtrado</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{formatarMoeda(stats.totalFiltrado)}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-green-200 transition-all">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Recebido</p>
            <h3 className="text-2xl font-black text-green-600 tracking-tight">{formatarMoeda(stats.totalRecebido)}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-red-200 transition-all">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pendente</p>
            <h3 className="text-2xl font-black text-red-600 tracking-tight">{formatarMoeda(stats.totalPendente)}</h3>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">Histórico de Recebimentos</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Exibindo registros de {selectedYear}</p>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative min-w-[280px] grow md:grow-0">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </span>
              <input 
                type="text"
                placeholder="Pesquisar..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-all transition-duration-300 shadow-sm"
              />
            </div>
            
            <select 
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white border-2 border-slate-50 rounded-2xl text-xs font-black text-slate-600 uppercase tracking-widest outline-none focus:border-blue-400 transition-all shadow-sm"
            >
              <option value="todos">Todos Status</option>
              <option value={StatusPagamento.PENDENTE}>Pendente</option>
              <option value={StatusPagamento.PAGO}>Pago</option>
              <option value={StatusPagamento.ATRASADO}>Atrasado</option>
            </select>

            <select 
              value={paymentMonthFilter}
              onChange={(e) => setPaymentMonthFilter(Number(e.target.value))}
              className="px-4 py-3 bg-white border-2 border-slate-50 rounded-2xl text-xs font-black text-slate-600 uppercase tracking-widest outline-none focus:border-blue-400 transition-all shadow-sm"
            >
              <option value={0}>Todos Meses</option>
              {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>

            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl border-2 border-slate-50 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ano:</span>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent border-none outline-none text-xs font-black text-slate-600"
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button 
              className="px-4 py-3 bg-white border-2 border-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
              title="Exportar dados"
            >
              <FileDown size={14} />
              Exportar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-8">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-50">
                <th className="px-8 py-5">Beneficiário</th>
                <th className="px-8 py-5">Período</th>
                <th className="px-8 py-5">Vencimento</th>
                <th className="px-8 py-5">Data Pagto</th>
                <th className="px-8 py-5">Valor</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPagamentos.map(p => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const vencimentoDate = new Date(p.data_vencimento + 'T00:00:00');
                const isAtrasado = p.status !== StatusPagamento.PAGO && vencimentoDate < today;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <p className="font-black text-slate-800 tracking-tight text-sm uppercase">
                          {p.contratos?.inquilinos?.nome || 'Inquilino'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate max-w-[200px] italic">
                          {p.contratos?.imoveis?.endereco}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                        {String(p.competencia_mes).padStart(2, '0')}/{p.competencia_ano}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className={`text-xs font-bold italic ${isAtrasado ? 'text-red-400 underline decoration-red-200' : 'text-slate-500'}`}>
                        {new Date(p.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-slate-600">
                        {p.data_pagamento ? new Date(p.data_pagamento).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className={`text-sm font-black ${p.status === StatusPagamento.PAGO ? 'text-green-600' : 'text-slate-800'}`}>
                        {formatarMoeda(p.valor_pago || p.valor_esperado || 0)}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-sm border ${
                          p.status === StatusPagamento.PAGO ? 'bg-green-50 text-green-600 border-green-100' : 
                          isAtrasado ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                          {p.status === StatusPagamento.PAGO ? (
                            <><CheckCircle2 size={10} /> Pago</>
                          ) : isAtrasado ? (
                            <><AlertCircle size={10} /> Atrasado</>
                          ) : (
                            <><Clock size={10} /> Pendente</>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {p.status === StatusPagamento.PAGO ? (
                          <button 
                            onClick={() => openReceiptModal(p)}
                            className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1 transition-all"
                          >
                            <Printer size={12} /> Recibo
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            {p.observacoes && p.observacoes.startsWith('Asaas|') && (
                              <button 
                                onClick={() => {
                                  const parts = p.observacoes.split('|');
                                  const url = parts[1];
                                  if (url) window.open(url, '_blank');
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-widest transition-all shadow-md shadow-blue-100 flex items-center gap-2 cursor-pointer"
                                title="Abrir link de cobrança no Asaas (Pix, Boleto, Cartão)"
                              >
                                <CreditCard size={12} />
                                Pagar (Asaas)
                              </button>
                            )}
                            <button 
                               onClick={() => handleMarkAsPaid(p, p.valor_esperado || 0)}
                               disabled={loading}
                               className={`bg-green-600 text-white text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-widest hover:bg-green-700 transition-[#1A1A1A] block transition-all shadow-md shadow-green-100 flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {loading ? <Loader2 size={12} className="animate-spin" /> : null}
                              Baixar
                            </button>
                          </div>
                        )}
                        
                        {isAtrasado && p.status !== StatusPagamento.PAGO && (
                          <button 
                            onClick={() => handleSendEmailNotification(p.contratos, 'ATRASO', new Date(p.data_vencimento + 'T00:00:00'))}
                            className="p-2 text-slate-400 hover:text-red-500 transition-all"
                            title="Notificar cobrança"
                          >
                            <Mail size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPagamentos.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-24">
                    <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">Nenhum registro encontrado para {selectedYear}</p>
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
