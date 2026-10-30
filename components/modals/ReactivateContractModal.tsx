import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle, 
  Building, 
  User, 
  Calendar, 
  DollarSign, 
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Contrato } from '../../types';
import { formatarMoeda } from '../../lib/utils-format';

interface ReactivateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contrato: Contrato | null;
  onConfirmReactivate: (contrato: Contrato) => Promise<void>;
  loading?: boolean;
  errorMessage?: string | null;
}

export const ReactivateContractModal: React.FC<ReactivateContractModalProps> = ({
  isOpen,
  onClose,
  contrato,
  onConfirmReactivate,
  loading = false,
  errorMessage = null
}) => {
  if (!isOpen || !contrato) return null;

  const imovelNome = contrato.imoveis?.apelido || contrato.imoveis?.endereco || 'Imóvel não identificado';
  const imovelEndereco = contrato.imoveis?.endereco || '';
  const inquilinoNome = contrato.inquilinos?.nome || 'Inquilino não informado';
  const proprietarioNome = contrato.imoveis?.proprietarios?.nome || contrato.proprietarios?.nome || 'Proprietário não informado';

  const formatarData = (val?: string | null) => {
    if (!val) return 'Não definida';
    try {
      const parts = val.split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return val;
    } catch {
      return val;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl border border-zinc-200/90 w-full max-w-xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-emerald-100 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  Reativar Contrato de Locação
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Reversão segura de encerramento com validação cadastral
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Error Message if any */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-3"
              >
                <AlertCircle size={18} className="shrink-0 text-rose-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Não foi possível reativar</p>
                  <p className="text-rose-700 leading-relaxed">{errorMessage}</p>
                </div>
              </motion.div>
            )}

            {/* Explanatory banner */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-start gap-3 text-xs text-blue-900">
              <ShieldCheck size={18} className="shrink-0 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-blue-950">Verificação de Integridade e Segurança</span>
                <p className="text-blue-800 leading-relaxed">
                  O sistema verificará se o imóvel está disponível antes de reativar. Se aprovado, o contrato voltará ao status <strong>Ativo</strong>, o imóvel retornará para <strong>Alugado</strong> e a ação será registrada no histórico de auditoria.
                </p>
              </div>
            </div>

            {/* Contract Summary Box */}
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 space-y-3.5">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building size={13} className="text-zinc-500" />
                <span>Dados do Contrato</span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-sm font-semibold text-zinc-900">{imovelNome}</div>
                  {imovelEndereco && imovelEndereco !== imovelNome && (
                    <div className="text-xs text-zinc-500 mt-0.5">{imovelEndereco}</div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-200/70 text-xs">
                  <div className="flex items-start gap-2">
                    <User size={14} className="text-zinc-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[11px] text-zinc-400 block font-medium">Locatário</span>
                      <strong className="text-zinc-800">{inquilinoNome}</strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <User size={14} className="text-zinc-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[11px] text-zinc-400 block font-medium">Cedente / Prop.</span>
                      <strong className="text-zinc-800">{proprietarioNome}</strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar size={14} className="text-zinc-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[11px] text-zinc-400 block font-medium">Vigência</span>
                      <span className="text-zinc-700">
                        {formatarData(contrato.data_inicio)} até {formatarData(contrato.data_fim)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <DollarSign size={14} className="text-zinc-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[11px] text-zinc-400 block font-medium">Valor Mensal</span>
                      <strong className="text-emerald-700 font-semibold">
                        {formatarMoeda(contrato.valor_aluguel || 0)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status change visual preview */}
              <div className="pt-2.5 border-t border-zinc-200/70 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-zinc-200/80 text-zinc-700 font-medium text-[11px]">
                    Status: {contrato.status === 'finalizado' ? 'Finalizado' : contrato.status}
                  </span>
                  <ArrowRight size={13} className="text-zinc-400" />
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                    Novo Status: Ativo
                  </span>
                </div>

                <div className="text-[11px] text-zinc-500">
                  Imóvel: <span className="font-semibold text-emerald-700">Alugado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-800 hover:bg-zinc-200/60 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onConfirmReactivate(contrato)}
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Validando e Reativando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Confirmar e Reativar</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
