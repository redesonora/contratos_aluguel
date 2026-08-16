import React from 'react';
import { 
  Building, 
  User, 
  FileText, 
  ExternalLink, 
  Mail, 
  Ban, 
  Archive, 
  ArchiveRestore, 
  CreditCard,
  CheckCircle2,
  Search,
  PlusCircle,
  Hash,
  Trash2,
  Edit3,
  RefreshCw,
  Eye
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
}

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
  setContractToRenew
}) => {
  const activeContratos = contratos.filter(c => !c.arquivado);
  
  const filteredContratos = activeContratos.filter(co => {
    const search = contractSearch.toLowerCase();
    const matchEndereco = co.imoveis?.endereco?.toLowerCase().includes(search);
    const matchApelido = co.imoveis?.apelido?.toLowerCase().includes(search);
    const matchInquilino = co.inquilinos?.nome?.toLowerCase().includes(search);
    const matchProprietario = co.proprietarios?.nome?.toLowerCase().includes(search);
    return matchEndereco || matchApelido || matchInquilino || matchProprietario;
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
                text-align: left; /* Alinhamento padrão à esquerda */
              }

              .contract-content {
                width: 100%;
                color: inherit;
                text-align: left; /* Garante que o conteúdo comece à esquerda */
              }

              /* Reset rigoroso para respeitar o HTML do editor */
              .contract-content {
                width: 100%;
                color: inherit;
                text-align: left;
                font-weight: 400; /* reset bold leak */
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
                text-transform: none; /* Não forçar maiúsculas */
                text-align: inherit;
              }
              .contract-content h1 { font-size: 2em; }
              .contract-content h2 { font-size: 1.5em; }
              .contract-content h3 { font-size: 1.17em; }
              .contract-content h4 { font-size: 1em; }
              .contract-content h5 { font-size: 0.83em; }
              .contract-content h6 { font-size: 0.67em; }
              
              /* Tamanhos de Fonte Baseados no Editor */
              .contract-content font[size="1"] { font-size: 10px !important; }
              .contract-content font[size="2"] { font-size: 13px !important; }
              .contract-content font[size="3"] { font-size: 16px !important; }
              .contract-content font[size="4"] { font-size: 18px !important; }
              .contract-content font[size="5"] { font-size: 24px !important; }
              .contract-content font[size="6"] { font-size: 32px !important; }
              .contract-content font[size="7"] { font-size: 48px !important; }
              
              /* Garante que estilos inline do editor prevaleçam */
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
      {/* Header com Busca e Novo Contrato */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 sm:p-4 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredContratos.map((co) => (
          <div key={co.id} className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col hover:border-zinc-300 transition-colors">
            <div className="p-5 flex-1 flex flex-col justify-between">
              {/* Top Row: Address & Status Badge */}
              <div>
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-md bg-zinc-100 text-zinc-600 flex items-center justify-center flex-shrink-0">
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
                  <div className={`text-[11px] px-2 py-0.5 rounded-md font-medium border flex-shrink-0 ${
                    co.status === 'ativo' || !co.status ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 
                    co.status === 'finalizado' ? 'bg-zinc-100 text-zinc-600 border-zinc-200/60' : 
                    'bg-rose-50 text-rose-700 border-rose-200/60'
                  }`}>
                    {co.status === 'ativo' || !co.status ? 'Ativo' : co.status === 'finalizado' ? 'Finalizado' : 'Cancelado'}
                  </div>
                </div>

                {/* People Section */}
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

                {/* Dates info */}
                <div className="grid grid-cols-2 gap-3 bg-zinc-50/75 rounded-lg p-3 border border-zinc-200/60 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block">Início</span>
                    <span className="font-medium text-zinc-700">
                      {co.data_inicio ? new Date(co.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR') : '--/--/----'}
                    </span>
                  </div>
                  <div className="border-l border-zinc-200/60 pl-3">
                    <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block">Término</span>
                    <span className={`font-medium ${new Date(co.data_fim) < new Date() ? 'text-rose-600' : 'text-zinc-700'}`}>
                      {co.data_fim ? new Date(co.data_fim + 'T00:00:00').toLocaleDateString('pt-BR') : '--/--/----'}
                    </span>
                  </div>
                </div>

                {/* Documents Area */}
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

            {/* Actions Footer */}
            <div className="bg-zinc-50/75 border-t border-zinc-200/80 px-4 py-2.5 flex items-center justify-between gap-2">
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
                {(co.status === 'ativo' || !co.status) && (
                  <button 
                    onClick={() => handleFinishContract(co)}
                    className="p-1.5 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                    title="Finalizar Contrato"
                  >
                    <Ban size={15} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handlePrintDocument(co)}
                  className="px-2.5 py-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-md transition-colors inline-flex items-center gap-1"
                >
                  <Eye size={13} />
                  <span>Ver</span>
                </button>
                <button 
                  onClick={() => {
                    setContractToRenew(co);
                    setIsRenewModalOpen(true);
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors inline-flex items-center gap-1"
                >
                  <RefreshCw size={13} />
                  <span>Renovar</span>
                </button>
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
        ))}
      </div>

      {filteredContratos.length === 0 && (
        <div className="bg-white border border-zinc-200/80 rounded-xl py-20 flex flex-col items-center justify-center text-center px-4">
          <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mb-3">
            <FileText size={22} />
          </div>
          <h3 className="text-sm font-semibold text-zinc-800">Nenhum contrato encontrado</h3>
          <p className="text-zinc-500 text-xs max-w-xs mt-1">Sua busca não retornou resultados ou você ainda não possui contratos registrados.</p>
          {contractSearch && (
            <button 
              onClick={() => setContractSearch('')}
              className="mt-4 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Limpar busca
            </button>
          )}
        </div>
      )}
    </div>
  );
};
