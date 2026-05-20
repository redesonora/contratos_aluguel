import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  AlertCircle, 
  TrendingUp, 
  DollarSign,
  Bell,
  BadgeDollarSign,
  CreditCard,
  Mail,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

interface DashboardTabProps {
  containerVariants: any;
  itemVariants: any;
  stats: any;
  formatarMoeda: (value: number) => string;
  monthlyCashFlowData: any[];
  notificationDays: number;
  notifications: any[];
  pagamentos: any[];
  can: (action: string, tab?: string) => boolean;
  setActiveTab: (tab: string) => void;
  setEditingItem: (item: any) => void;
  setFilesToUpload: (files: File[]) => void;
  setGuarantorFilesToUpload: (files: File[]) => void;
  setContractFileToUpload: (file: File | null) => void;
  setExistingDocs: (docs: string[]) => void;
  setExistingGuarantorDocs: (docs: string[]) => void;
  setCreateModalOpen: (open: boolean) => void;
  handleSendEmailNotification: (co: any, type: 'VENCIMENTO' | 'ATRASO', nextDueDate?: Date) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  containerVariants,
  itemVariants,
  stats,
  formatarMoeda,
  monthlyCashFlowData,
  notificationDays,
  notifications,
  pagamentos,
  can,
  setActiveTab,
  setEditingItem,
  setFilesToUpload,
  setGuarantorFilesToUpload,
  setContractFileToUpload,
  setExistingDocs,
  setExistingGuarantorDocs,
  setCreateModalOpen,
  handleSendEmailNotification
}) => {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <DollarSign size={20} />
            </div>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">A Receber</span>
          </div>
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Previsão Mensal</h3>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{formatarMoeda(stats.aReceber)}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded uppercase tracking-wider">Recebido</span>
          </div>
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Realizado no Mês</h3>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{formatarMoeda(stats.recebido)}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
              <AlertCircle size={20} />
            </div>
            <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded uppercase tracking-wider">Inadimplência</span>
          </div>
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Vencidos / No Mês</h3>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{stats.inadimplenciaCount}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <Building2 size={20} />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xl font-black text-indigo-600">{Math.round(stats.alugadosPercent)}%</span>
            </div>
          </div>
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Locações Ativas / Em Uso</h3>
          <div className="flex items-end gap-1">
            <p className="text-2xl font-black text-slate-800 tracking-tight">{stats.alugadosCount}</p>
            <p className="text-[10px] font-bold text-slate-400 mb-1">/ {stats.totalImoveis} bens/itens</p>
          </div>
        </motion.div>
      </section>
      
      {/* Fluxo de Caixa Chart */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight italic">Fluxo de Caixa Mensal</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Gestão inteligente de recebimentos ({new Date().getFullYear()})</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recebido</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pendente</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCashFlowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                  tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000) + 'k' : value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: '1px solid #f1f5f9', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}
                  formatter={(value: any) => formatarMoeda(value)}
                />
                <Bar dataKey="recebido" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={32} />
                <Bar dataKey="pendente" fill="#f87171" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight italic">Próximos Alertas</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Ações recomendadas para os próximos {notificationDays} dias</p>
          </div>
        </div>
        
        <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Bell size={20} className="text-amber-500" />
          Alertas Críticos ({notifications.length})
        </h3>
        <div className="flex flex-col gap-3">
           {notifications.map((co) => {
            const isContractExpiring = new Date(co.data_fim + 'T00:00:00') <= new Date(new Date().setDate(new Date().getDate() + notificationDays));
            
            let nextDueDate = co.dia_vencimento ? new Date(new Date().getFullYear(), new Date().getMonth(), co.dia_vencimento) : null;
            
            const isOverdue = co.dia_vencimento && 
              new Date() > new Date(new Date().getFullYear(), new Date().getMonth(), co.dia_vencimento) &&
              !pagamentos.some(p => 
                p.contrato_id === co.id && 
                p.competencia_mes === (new Date().getMonth() + 1) && 
                p.competencia_ano === new Date().getFullYear()
              );
            
            if (!isOverdue && nextDueDate && nextDueDate < new Date()) {
              nextDueDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, co.dia_vencimento!);
            }
            
            const isRentDue = !isOverdue && nextDueDate && nextDueDate <= new Date(new Date().setDate(new Date().getDate() + 31));

            return (
              <div key={co.id} className={`flex items-center justify-between p-4 rounded-xl border scale-in-center transition-all ${
                isOverdue ? 'bg-red-50 border-red-100 shadow-sm' : 'bg-orange-50/50 border-orange-100'
              }`}>
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${
                    isOverdue ? 'bg-red-100 text-red-600' : 
                    isRentDue ? 'bg-amber-100 text-amber-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {isOverdue ? <BadgeDollarSign size={18} /> : isRentDue ? <CreditCard size={18} /> : <AlertCircle size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 uppercase text-xs tracking-tight flex items-center gap-2">
                      {co.inquilinos?.nome || 'Sem Nome'} 
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                        isOverdue ? 'bg-red-200 text-red-800' :
                        isRentDue ? 'bg-amber-200 text-amber-800' : 'bg-orange-200 text-orange-800'
                      }`}>
                        {isOverdue ? 'EM ATRASO' : isRentDue ? 'ALUGUEL' : 'CONTRATO'}
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium italic truncate max-w-[300px]">{co.imoveis?.endereco}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {isOverdue ? 'Vencido em:' : isRentDue ? 'Próximo Venc.:' : 'Expira em:'}
                    </p>
                    <p className={`text-xs font-black ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                      {isOverdue && nextDueDate ? new Date(new Date().getFullYear(), new Date().getMonth(), co.dia_vencimento!).toLocaleDateString('pt-BR') :
                       isRentDue && nextDueDate ? nextDueDate.toLocaleDateString('pt-BR') : 
                       new Date(co.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="flex gap-1">
                    {can('EDIT', 'pagamentos') && (isOverdue || isRentDue) && (
                      <button 
                        onClick={() => {
                          setActiveTab('pagamentos');
                          setEditingItem(null);
                          setFilesToUpload([]);
                          setGuarantorFilesToUpload([]);
                          setContractFileToUpload(null);
                          setExistingDocs([]);
                          setExistingGuarantorDocs([]);
                          setTimeout(() => {
                            setCreateModalOpen(true);
                          }, 50);
                        }}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Registrar Pagamento"
                      >
                        <DollarSign size={18} />
                      </button>
                    )}
                    {can('EDIT', 'contratos') && (
                      <button 
                        onClick={() => handleSendEmailNotification(co, isOverdue ? 'ATRASO' : 'VENCIMENTO', nextDueDate || undefined)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Enviar Notificação por E-mail"
                      >
                        <Mail size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setActiveTab('contratos');
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
              <CheckCircle2 size={32} className="text-green-200" />
              <p className="text-xs font-medium italic">Nenhum vencimento próximo nos próximos {notificationDays} dias.</p>
            </div>
          )}
        </div>
      </div>
      </motion.div>
    </motion.div>
  );
};
