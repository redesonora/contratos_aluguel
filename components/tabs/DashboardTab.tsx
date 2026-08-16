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
  CheckCircle2,
  Calendar
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
  userProfile?: any;
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
      className="space-y-6"
    >
      {/* 4 Métricas Principais */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-500">Previsão do Mês</span>
            <span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">A Receber</span>
          </div>
          <p className="text-2xl font-semibold text-zinc-900 tracking-tight font-mono">{formatarMoeda(stats.aReceber)}</p>
          <p className="text-[11px] text-zinc-400 mt-1">Total contratual previsto</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-500">Realizado no Mês</span>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">Recebido</span>
          </div>
          <p className="text-2xl font-semibold text-zinc-900 tracking-tight font-mono">{formatarMoeda(stats.recebido)}</p>
          <p className="text-[11px] text-zinc-400 mt-1">Valores baixados e confirmados</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-500">Pendências / Atrasos</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
              stats.inadimplenciaCount > 0 
                ? 'text-rose-700 bg-rose-50 border-rose-200/60' 
                : 'text-zinc-600 bg-zinc-50 border-zinc-200/60'
            }`}>
              {stats.inadimplenciaCount > 0 ? `${stats.inadimplenciaCount} em atraso` : 'Em dia'}
            </span>
          </div>
          <p className={`text-2xl font-semibold tracking-tight font-mono ${stats.inadimplenciaCount > 0 ? 'text-rose-600' : 'text-zinc-900'}`}>
            {stats.inadimplenciaCount}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Parcelas vencidas no período</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-500">Ocupação da Carteira</span>
            <span className="text-[11px] font-medium text-zinc-700 bg-zinc-100 border border-zinc-200/60 px-2 py-0.5 rounded-md">
              {Math.round(stats.alugadosPercent)}%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-2xl font-semibold text-zinc-900 tracking-tight font-mono">{stats.alugadosCount}</p>
            <p className="text-xs text-zinc-400">/ {stats.totalImoveis} bens cadastrados</p>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Locações ativas no momento</p>
        </motion.div>
      </section>
      
      {/* Fluxo de Caixa Chart */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-zinc-100 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Fluxo de Caixa Mensal</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Visão consolidada de recebimentos e previsões ({new Date().getFullYear()})</p>
          </div>
          <div className="flex items-center gap-5 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-zinc-900 rounded-sm"></div>
              <span>Recebido</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></div>
              <span>Pendente</span>
            </div>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyCashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#71717a' }}
                dy={8}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#71717a' }}
                tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000) + 'k' : value}`}
              />
              <Tooltip 
                cursor={{ fill: '#f4f4f5' }}
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid #e4e4e7', 
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  fontSize: '12px',
                  color: '#18181b'
                }}
                formatter={(value: any) => [formatarMoeda(value), '']}
              />
              <Bar dataKey="recebido" name="Recebido" fill="#18181b" radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="pendente" name="Pendente" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Alertas e Próximas Ações */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <Bell size={15} className="text-zinc-500" />
              Alertas e Vencimentos Próximos
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Contratos e parcelas que exigem atenção nos próximos {notificationDays} dias</p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700">
            {notifications.length} {notifications.length === 1 ? 'pendência' : 'pendências'}
          </span>
        </div>
        
        <div className="divide-y divide-zinc-100">
          {notifications.map((co) => {
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
              <div key={co.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-50/60 transition-colors gap-3">
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    isOverdue ? 'bg-rose-50 text-rose-600 border border-rose-200/60' : 
                    isRentDue ? 'bg-amber-50 text-amber-600 border border-amber-200/60' : 
                    'bg-blue-50 text-blue-600 border border-blue-200/60'
                  }`}>
                    {isOverdue ? <BadgeDollarSign size={16} /> : isRentDue ? <CreditCard size={16} /> : <AlertCircle size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-medium text-zinc-900">{co.inquilinos?.nome || 'Sem Nome'}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                        isOverdue ? 'bg-rose-50 text-rose-700 border-rose-200/60' :
                        isRentDue ? 'bg-amber-50 text-amber-700 border-amber-200/60' : 
                        'bg-blue-50 text-blue-700 border-blue-200/60'
                      }`}>
                        {isOverdue ? 'Em atraso' : isRentDue ? 'Vencimento próximo' : 'Término de contrato'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{co.imoveis?.endereco || 'Endereço não informado'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pl-11 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[11px] text-zinc-400">
                      {isOverdue ? 'Vencimento' : isRentDue ? 'Próx. vencimento' : 'Data término'}
                    </p>
                    <p className={`text-xs font-medium font-mono ${isOverdue ? 'text-rose-600' : 'text-zinc-700'}`}>
                      {isOverdue && nextDueDate ? new Date(new Date().getFullYear(), new Date().getMonth(), co.dia_vencimento!).toLocaleDateString('pt-BR') :
                       isRentDue && nextDueDate ? nextDueDate.toLocaleDateString('pt-BR') : 
                       new Date(co.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
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
                        className="p-1.5 text-zinc-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Registrar Pagamento"
                      >
                        <DollarSign size={16} />
                      </button>
                    )}
                    {can('EDIT', 'contratos') && (
                      <button 
                        onClick={() => handleSendEmailNotification(co, isOverdue ? 'ATRASO' : 'VENCIMENTO', nextDueDate || undefined)}
                        className="p-1.5 text-zinc-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Enviar Notificação por E-mail"
                      >
                        <Mail size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setActiveTab('contratos');
                      }}
                      className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                      title="Ver contrato"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-2">
              <CheckCircle2 size={24} className="text-emerald-500/60" />
              <p className="text-xs text-zinc-500">Nenhum vencimento ou pendência para os próximos {notificationDays} dias.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

