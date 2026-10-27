import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileText, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Building, 
  User, 
  Calendar, 
  DollarSign, 
  FileCheck, 
  Key, 
  FileX, 
  ShieldAlert,
  Eye,
  Info
} from 'lucide-react';
import { Contrato } from '../../types';

export interface RescisaoData {
  dataEncerramento: string;
  motivo: string;
  isentarMulta: boolean;
  valorMulta: number;
  aluguelProporcional: number;
  pendenciasContas: number;
  descricaoPendencias: string;
  statusVistoria: string;
  observacoes: string;
}

interface TermoRescisaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contrato: Contrato | null;
  onConfirmEncerramento: (contrato: Contrato, data: RescisaoData) => Promise<void>;
  loading?: boolean;
}

export const TermoRescisaoModal: React.FC<TermoRescisaoModalProps> = ({
  isOpen,
  onClose,
  contrato,
  onConfirmEncerramento,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState<'formulario' | 'preview'>('formulario');
  
  // Form state
  const [dataEncerramento, setDataEncerramento] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [motivo, setMotivo] = useState<string>('Rescisão consensual e amigável de comum acordo');
  const [isentarMulta, setIsentarMulta] = useState<boolean>(true);
  const [valorMulta, setValorMulta] = useState<number>(0);
  const [aluguelProporcional, setAluguelProporcional] = useState<number>(0);
  const [pendenciasContas, setPendenciasContas] = useState<number>(0);
  const [descricaoPendencias, setDescricaoPendencias] = useState<string>('Contas de água, luz e encargos conferidas e quitadas até a presente data.');
  const [statusVistoria, setStatusVistoria] = useState<string>('Imóvel vistoriado, desocupado e aprovado com devolução total de chaves');
  const [observacoes, setObservacoes] = useState<string>('');

  useEffect(() => {
    if (contrato) {
      if (contrato.data_encerramento) {
        setDataEncerramento(contrato.data_encerramento);
      } else {
        setDataEncerramento(new Date().toISOString().split('T')[0]);
      }
      if (contrato.motivo_encerramento) {
        setMotivo(contrato.motivo_encerramento);
      }
      if (contrato.multa_rescisoria !== undefined) {
        setValorMulta(contrato.multa_rescisoria);
        setIsentarMulta(contrato.multa_rescisoria === 0);
      } else {
        setIsentarMulta(true);
        setValorMulta(0);
      }
      if (contrato.valor_pendencias !== undefined) {
        setPendenciasContas(contrato.valor_pendencias);
      }
    }
  }, [contrato]);

  if (!isOpen || !contrato) return null;

  const isFinalizado = contrato.status === 'finalizado';

  const locatarioNome = contrato.inquilinos?.nome || 'Não informado';
  const locatarioCpf = contrato.inquilinos?.cpf_cnpj || 'Não informado';
  const locadorNome = contrato.proprietarios?.nome || 'Não informado';
  const locadorCpf = contrato.proprietarios?.cpf_cnpj || 'Não informado';
  const imovelEndereco = contrato.imoveis?.endereco || 'Endereço não informado';
  const imovelNumero = contrato.imoveis?.numero ? `, ${contrato.imoveis.numero}` : '';
  const imovelBairro = contrato.imoveis?.bairro ? ` - Bairro ${contrato.imoveis.bairro}` : '';
  const imovelCidadeUf = contrato.imoveis?.cidade ? ` - ${contrato.imoveis.cidade}/${contrato.imoveis.estado || 'MG'}` : '';
  const imovelCompleto = `${imovelEndereco}${imovelNumero}${imovelBairro}${imovelCidadeUf}`;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const formatDateBR = (isoStr?: string) => {
    if (!isoStr) return '--/--/----';
    try {
      const parts = isoStr.split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return new Date(isoStr).toLocaleDateString('pt-BR');
    } catch {
      return isoStr;
    }
  };

  const formatDateExtenso = (isoStr?: string) => {
    try {
      const d = isoStr ? new Date(isoStr + 'T12:00:00') : new Date();
      return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  const totalAcerto = (isentarMulta ? 0 : valorMulta) + (aluguelProporcional || 0) + (pendenciasContas || 0);

  const getRescisaoData = (): RescisaoData => ({
    dataEncerramento,
    motivo,
    isentarMulta,
    valorMulta: isentarMulta ? 0 : valorMulta,
    aluguelProporcional,
    pendenciasContas,
    descricaoPendencias,
    statusVistoria,
    observacoes
  });

  const handlePrint = () => {
    const dataFimBR = formatDateBR(contrato.data_fim);
    const dataInicioBR = formatDateBR(contrato.data_inicio);
    const dataEncerramentoBR = formatDateBR(dataEncerramento);
    const dataExtenso = formatDateExtenso(dataEncerramento);

    const win = window.open('', '_blank');
    if (!win) {
      alert('Por favor, permita pop-ups para imprimir o Termo de Rescisão.');
      return;
    }

    win.document.title = `Termo de Rescisão - ${locatarioNome}`;
    win.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Termo de Rescisão e Encerramento - ${locatarioNome}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              color: #1e293b;
              background: #f8fafc;
              line-height: 1.6;
              font-size: 11pt;
              -webkit-print-color-adjust: exact;
            }
            .no-print {
              position: fixed;
              top: 16px;
              left: 50%;
              transform: translateX(-50%);
              background: #0f172a;
              color: white;
              padding: 10px 20px;
              border-radius: 9999px;
              display: flex;
              align-items: center;
              gap: 16px;
              box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
              z-index: 9999;
            }
            .no-print span {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              color: #94a3b8;
            }
            .print-btn {
              background: #2563eb;
              color: white;
              border: none;
              padding: 8px 20px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.2s;
            }
            .print-btn:hover {
              background: #1d4ed8;
            }
            .page {
              width: 210mm;
              min-height: 297mm;
              margin: 80px auto 40px auto;
              background: white;
              padding: 25mm 22mm;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            }
            .doc-header {
              text-align: center;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 14px;
              margin-bottom: 24px;
            }
            .doc-header h1 {
              font-size: 15pt;
              font-weight: 800;
              letter-spacing: 0.02em;
              color: #0f172a;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .doc-header h2 {
              font-size: 10pt;
              font-weight: 600;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            .section {
              margin-bottom: 18px;
              text-align: justify;
              text-justify: inter-word;
            }
            .section-title {
              font-size: 10.5pt;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 6px;
              text-transform: uppercase;
              letter-spacing: 0.04em;
            }
            .partes-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 12px 14px;
              margin-bottom: 16px;
              font-size: 10pt;
              line-height: 1.5;
            }
            .partes-box strong {
              color: #0f172a;
            }
            .clause {
              margin-bottom: 14px;
              font-size: 10pt;
              line-height: 1.6;
              text-align: justify;
            }
            .clause strong {
              color: #0f172a;
            }
            .summary-table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
              font-size: 9.5pt;
            }
            .summary-table th, .summary-table td {
              border: 1px solid #cbd5e1;
              padding: 6px 10px;
            }
            .summary-table th {
              background: #f1f5f9;
              font-weight: 700;
              text-align: left;
            }
            .summary-table td.amount {
              text-align: right;
              font-weight: 600;
            }
            .signatures {
              margin-top: 45px;
              page-break-inside: avoid;
            }
            .sig-row {
              display: flex;
              justify-content: space-between;
              gap: 30px;
              margin-top: 40px;
            }
            .sig-col {
              flex: 1;
              text-align: center;
            }
            .sig-line {
              border-top: 1px solid #0f172a;
              margin-bottom: 6px;
            }
            .sig-name {
              font-size: 9.5pt;
              font-weight: 700;
              color: #0f172a;
              text-transform: uppercase;
            }
            .sig-role {
              font-size: 8.5pt;
              color: #64748b;
            }
            @media print {
              body { background: white; margin: 0; padding: 0; }
              .no-print { display: none !important; }
              .page {
                margin: 0;
                padding: 18mm 18mm;
                box-shadow: none;
                width: 100%;
                min-height: auto;
              }
              @page { size: A4; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <span>Visualização de Impressão</span>
            <button class="print-btn" onclick="window.print()">Imprimir Termo</button>
          </div>

          <div class="page">
            <div class="doc-header">
              <h1>Termo de Rescisão Contratual, Distrato e Devolução de Chaves</h1>
              <h2>Instrumento Particular de Encerramento de Locação e Quitação</h2>
            </div>

            <div class="partes-box">
              <p><strong>LOCADOR(A) / CEDENTE:</strong> ${locadorNome}, inscrito(a) no CPF/CNPJ sob o nº ${locadorCpf}.</p>
              <p style="margin-top: 4px;"><strong>LOCATÁRIO(A):</strong> ${locatarioNome}, inscrito(a) no CPF sob o nº ${locatarioCpf}.</p>
              ${contrato.inquilinos?.nome_fiador ? `
                <p style="margin-top: 4px;"><strong>FIADOR(A):</strong> ${contrato.inquilinos.nome_fiador}, inscrito(a) no CPF nº ${contrato.inquilinos.cpf_fiador || 'Não informado'}.</p>
              ` : ''}
              <p style="margin-top: 4px;"><strong>IMÓVEL LOCADO:</strong> ${imovelCompleto}.</p>
            </div>

            <div class="clause">
              <strong>CLÁUSULA PRIMEIRA - DA RESCISÃO CONTRATUAL:</strong>
              As partes retro qualificadas, de comum acordo e nos termos da Lei Federal nº 8.245/1991 (Lei do Inquilinato) e do Código Civil Brasileiro, resolvem <strong>RESCINDIR E DECLARAR ENCERRADO</strong> o Contrato de Locação celebrado em <strong>${dataInicioBR}</strong>, com término originalmente previsto para <strong>${dataFimBR}</strong>, fixando a data efetiva de rescisão e desocupação em <strong>${dataEncerramentoBR}</strong>.
            </div>

            <div class="clause">
              <strong>CLÁUSULA SEGUNDA - DA MOTIVAÇÃO:</strong>
              O presente distrato ocorre pelo seguinte motivo: <em>"${motivo}"</em>.
            </div>

            <div class="clause">
              <strong>CLÁUSULA TERCEIRA - DA DEVOLUÇÃO DAS CHAVES E DESOCUPAÇÃO:</strong>
              O(A) LOCATÁRIO(A) restitui expressamente neste ato ao(à) LOCADOR(A) a posse direta do imóvel locado, livre e desocupado de pessoas e pertences, acompanhado da totalidade das chaves pertinentes ao imóvel. A partir desta data cessa a obrigação do(a) Locatário(a) quanto ao pagamento de aluguéis vincendos.
            </div>

            <div class="clause">
              <strong>CLÁUSULA QUARTA - DA VISTORIA DE SAÍDA:</strong>
              Foi procedida à conferência física e vistoria final do imóvel, apurando-se a seguinte situação: <em>${statusVistoria}</em>.
            </div>

            <div class="clause">
              <strong>CLÁUSULA QUINTA - DO ACERTO FINANCEIRO E MULTA RESCISÓRIA:</strong>
              Para o encerramento do contrato, as partes pactuam os seguintes acertos:
              <table class="summary-table">
                <thead>
                  <tr>
                    <th>Item de Ajuste</th>
                    <th style="width: 220px; text-align: right;">Condição / Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Multa por rescisão antecipada</td>
                    <td class="amount">${isentarMulta ? 'ISENTA (Acordo amigável)' : formatCurrency(valorMulta)}</td>
                  </tr>
                  <tr>
                    <td>Aluguel proporcional aos dias de uso</td>
                    <td class="amount">${aluguelProporcional > 0 ? formatCurrency(aluguelProporcional) : 'Quitado'}</td>
                  </tr>
                  <tr>
                    <td>Encargos / Contas de consumo / Pendências</td>
                    <td class="amount">${pendenciasContas > 0 ? formatCurrency(pendenciasContas) : 'Quitadas'}</td>
                  </tr>
                  <tr style="background: #f8fafc; font-weight: 700;">
                    <td><strong>TOTAL DEVIDO PARA QUITAÇÃO</strong></td>
                    <td class="amount" style="color: #0f172a; font-size: 10.5pt;"><strong>${formatCurrency(totalAcerto)}</strong></td>
                  </tr>
                </tbody>
              </table>
              <p style="font-size: 9pt; color: #475569; margin-top: 4px;">
                <strong>Detalhamento das pendências:</strong> ${descricaoPendencias || 'Sem pendências financeiras registradas.'}
              </p>
            </div>

            ${observacoes ? `
              <div class="clause">
                <strong>CLÁUSULA SEXTA - DISPOSIÇÕES ESPECÍFICAS / OBSERVAÇÕES:</strong>
                ${observacoes}
              </div>
            ` : ''}

            <div class="clause">
              <strong>CLÁUSULA ${observacoes ? 'SÉTIMA' : 'SEXTA'} - DA QUITAÇÃO RECÍPROCA:</strong>
              Com o adimplemento dos eventuais valores acordados na Cláusula Quinta e a devolução das chaves, as partes outorgam-se mútua, plena, rasa, geral e irrevogável quitação de todas as obrigações principais e acessórias decorrentes da relação locatícia, nada mais tendo a exigir uma da outra, seja a que título for, em juízo ou fora dele.
            </div>

            <div class="clause">
              <strong>CLÁUSULA ${observacoes ? 'OITAVA' : 'SÉTIMA'} - DO FORO:</strong>
              Para dirimir quaisquer dúvidas oriundas do presente instrumento, as partes elegem o foro da Comarca do imóvel, com renúncia de qualquer outro por mais privilegiado que seja.
            </div>

            <p style="margin-top: 24px; font-size: 10pt; text-align: right;">
              ${contrato.imoveis?.cidade || 'Belo Horizonte'} - ${contrato.imoveis?.estado || 'MG'}, ${dataExtenso}.
            </p>

            <div class="signatures">
              <div class="sig-row">
                <div class="sig-col">
                  <div class="sig-line"></div>
                  <div class="sig-name">${locadorNome}</div>
                  <div class="sig-role">LOCADOR(A) / ADMINISTRADOR(A)</div>
                </div>
                <div class="sig-col">
                  <div class="sig-line"></div>
                  <div class="sig-name">${locatarioNome}</div>
                  <div class="sig-role">LOCATÁRIO(A)</div>
                </div>
              </div>

              ${contrato.inquilinos?.nome_fiador ? `
                <div class="sig-row" style="margin-top: 30px;">
                  <div class="sig-col" style="max-width: 50%; margin: 0 auto;">
                    <div class="sig-line"></div>
                    <div class="sig-name">${contrato.inquilinos.nome_fiador}</div>
                    <div class="sig-role">FIADOR(A)</div>
                  </div>
                </div>
              ` : ''}

              <div class="sig-row" style="margin-top: 35px;">
                <div class="sig-col">
                  <div class="sig-line"></div>
                  <div class="sig-name">Testemunha 1</div>
                  <div class="sig-role">Nome e CPF: _______________________</div>
                </div>
                <div class="sig-col">
                  <div class="sig-line"></div>
                  <div class="sig-name">Testemunha 2</div>
                  <div class="sig-role">Nome e CPF: _______________________</div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contrato) return;
    await onConfirmEncerramento(contrato, getRescisaoData());
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col my-4 border border-zinc-200"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-zinc-200/80 bg-zinc-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-200/60">
                <FileX size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900">
                    {isFinalizado ? 'Termo de Rescisão do Contrato' : 'Encerramento e Rescisão de Contrato'}
                  </h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                    isFinalizado 
                      ? 'bg-zinc-200 text-zinc-700' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isFinalizado ? 'Encerrado' : 'Contrato Ativo'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-normal truncate max-w-md">
                  {imovelEndereco} • Locatário: {locatarioNome}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/60 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="px-5 pt-3 border-b border-zinc-100 bg-white flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('formulario')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'formulario'
                    ? 'border-zinc-900 text-zinc-900 bg-zinc-100/70'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <FileCheck size={14} />
                <span>Dados da Rescisão</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'preview'
                    ? 'border-zinc-900 text-zinc-900 bg-zinc-100/70'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Eye size={14} />
                <span>Pré-visualizar Documento</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer size={13} />
              <span>Imprimir Termo</span>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5 overflow-y-auto max-h-[68vh] custom-scrollbar space-y-4">
            {activeTab === 'formulario' ? (
              <form id="rescisao-form" onSubmit={handleConfirmSubmit} className="space-y-4">
                {/* Resumo do Contrato */}
                <div className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-200/70 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Locatário</span>
                    <strong className="text-zinc-800 font-semibold truncate block">{locatarioNome}</strong>
                    <span className="text-[11px] text-zinc-500 font-mono">CPF: {locatarioCpf}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Cedente / Locador</span>
                    <strong className="text-zinc-800 font-semibold truncate block">{locadorNome}</strong>
                    <span className="text-[11px] text-zinc-500 font-mono">CPF: {locadorCpf}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Vigência Original</span>
                    <span className="text-zinc-700 font-medium">
                      {formatDateBR(contrato.data_inicio)} até {formatDateBR(contrato.data_fim)}
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      Aluguel: {formatCurrency(contrato.valor_aluguel)}
                    </span>
                  </div>
                </div>

                {/* Data e Motivo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1 mb-1">
                      <Calendar size={13} className="text-zinc-500" />
                      Data do Encerramento / Devolução de Chaves *
                    </label>
                    <input
                      type="date"
                      required
                      value={dataEncerramento}
                      onChange={(e) => setDataEncerramento(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-800 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1 mb-1">
                      <Info size={13} className="text-zinc-500" />
                      Motivo do Encerramento *
                    </label>
                    <select
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-800 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                    >
                      <option value="Rescisão consensual e amigável de comum acordo">Rescisão consensual e amigável (comum acordo)</option>
                      <option value="Desocupação antecipada por iniciativa do Locatário">Desocupação antecipada pelo locatário</option>
                      <option value="Término regular do prazo e entrega de chaves">Término regular do prazo contratual</option>
                      <option value="Infração ou descumprimento de cláusula contratual">Infração / Descumprimento contratual</option>
                      <option value="Solicitação de retomada pelo Locador">Retomada solicitada pelo Locador</option>
                      <option value="Outro motivo particular">Outro motivo particular</option>
                    </select>
                  </div>
                </div>

                {/* Multa Rescisória */}
                <div className="border border-zinc-200 rounded-xl p-3.5 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">Multa por Rescisão Antecipada</h4>
                      <p className="text-[11px] text-zinc-500">Defina se haverá cobrança de multa contratual ou isenção amigável</p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={isentarMulta}
                        onChange={(e) => {
                          setIsentarMulta(e.target.checked);
                          if (e.target.checked) setValorMulta(0);
                        }}
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400 h-3.5 w-3.5"
                      />
                      <span className="text-xs font-semibold text-zinc-700">Isentar Multa Rescisória</span>
                    </label>
                  </div>

                  {!isentarMulta && (
                    <div className="pt-2 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                          Valor da Multa Rescisória (R$)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-medium">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={valorMulta ?? 0}
                            onChange={(e) => setValorMulta(parseFloat(e.target.value) || 0)}
                            className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-semibold text-zinc-800 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                      <div className="text-[11px] text-zinc-500 flex items-center">
                        <span>A multa será registrada no termo impresso e no histórico do contrato.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pendências e Vistoria */}
                <div className="border border-zinc-200 rounded-xl p-3.5 space-y-3 bg-white">
                  <h4 className="text-xs font-bold text-zinc-900">Vistoria e Pendências Financeiras</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                        Aluguel Proporcional (R$) - Opcional
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-medium">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={aluguelProporcional ?? 0}
                          onChange={(e) => setAluguelProporcional(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium text-zinc-800 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                          placeholder="0,00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                        Contas / Encargos Pendentes (R$) - Opcional
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-medium">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={pendenciasContas ?? 0}
                          onChange={(e) => setPendenciasContas(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium text-zinc-800 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                      Status da Vistoria e Chaves
                    </label>
                    <input
                      type="text"
                      value={statusVistoria ?? ''}
                      onChange={(e) => setStatusVistoria(e.target.value)}
                      placeholder="Ex: Imóvel vistoriado, chaves entregues e aprovado sem pendências"
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-800 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                      Descrição das Pendências ou Comprovantes Apresentados
                    </label>
                    <textarea
                      rows={2}
                      value={descricaoPendencias ?? ''}
                      onChange={(e) => setDescricaoPendencias(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-800 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                      placeholder="Ex: Água e luz quitadas até 20/10/2026. Aluguel pago integralmente."
                    />
                  </div>
                </div>

                {/* Totalizador */}
                <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total a Acertar na Rescisão</span>
                    <p className="text-[11px] text-zinc-300">
                      {isentarMulta ? 'Multa isenta' : `Multa: ${formatCurrency(valorMulta)}`}
                      {aluguelProporcional > 0 && ` • Prop.: ${formatCurrency(aluguelProporcional)}`}
                      {pendenciasContas > 0 && ` • Encargos: ${formatCurrency(pendenciasContas)}`}
                    </p>
                  </div>
                  <span className="text-base font-extrabold tracking-tight text-emerald-400">
                    {formatCurrency(totalAcerto)}
                  </span>
                </div>
              </form>
            ) : (
              /* Pré-visualização do Documento */
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-4 text-zinc-800 text-xs leading-relaxed max-h-[60vh] overflow-y-auto">
                <div className="text-center border-b border-zinc-300 pb-3">
                  <h4 className="text-sm font-bold uppercase text-zinc-900">
                    Termo de Rescisão Contratual, Distrato e Devolução de Chaves
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wide">
                    Instrumento Particular de Encerramento de Locação
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-zinc-200 space-y-1 text-[11px]">
                  <p><strong>LOCADOR:</strong> {locadorNome} (CPF: {locadorCpf})</p>
                  <p><strong>LOCATÁRIO:</strong> {locatarioNome} (CPF: {locatarioCpf})</p>
                  <p><strong>IMÓVEL:</strong> {imovelCompleto}</p>
                  <p><strong>DATA DE RESCISÃO:</strong> {formatDateBR(dataEncerramento)}</p>
                </div>

                <p>
                  <strong>1. DA RESCISÃO:</strong> Pelo presente instrumento, as partes resolvem, de mútuo acordo, rescindir integralmente o contrato de locação vigente entre as partes, dando-o por encerrado a partir de {formatDateBR(dataEncerramento)}. Motivação: <em>"{motivo}"</em>.
                </p>

                <p>
                  <strong>2. DA DEVOLUÇÃO DE CHAVES E VISTORIA:</strong> O Locatário restitui neste ato a posse direta do imóvel locado com a entrega das chaves. Vistoria: <em>"{statusVistoria}"</em>.
                </p>

                <p>
                  <strong>3. DO AJUSTE FINANCEIRO:</strong>
                  {isentarMulta ? ' Fica acordada a expressa ISENÇÃO de multa rescisória.' : ` Multa rescisória acordada em ${formatCurrency(valorMulta)}.`}
                  {aluguelProporcional > 0 && ` Aluguel proporcional de ${formatCurrency(aluguelProporcional)}.`}
                  {pendenciasContas > 0 && ` Pendências e encargos no montante de ${formatCurrency(pendenciasContas)}.`}
                  {' '}Total acordado: <strong>{formatCurrency(totalAcerto)}</strong>.
                </p>

                <p>
                  <strong>4. DA QUITAÇÃO:</strong> Satisfeitas as condições, as partes outorgam-se mutuamente a mais plena, geral e irrevogável quitação de todas as obrigações do contrato rescindido.
                </p>

                <div className="text-right text-[11px] text-zinc-500 pt-3 border-t border-zinc-200">
                  {contrato.imoveis?.cidade || 'Belo Horizonte'} - {contrato.imoveis?.estado || 'MG'}, {formatDateExtenso(dataEncerramento)}.
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3.5 border-t border-zinc-200/80 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Printer size={14} />
              <span>Imprimir Termo de Rescisão</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-lg transition-colors"
              >
                Fechar
              </button>

              {!isFinalizado && (
                <button
                  type="submit"
                  form="rescisao-form"
                  disabled={loading}
                  className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  <span>Confirmar e Encerrar Contrato</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
