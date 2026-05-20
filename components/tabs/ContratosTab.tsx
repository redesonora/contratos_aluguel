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
    <div className="space-y-6">
      {/* Header com Busca */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por bem / item, locatário ou proprietário / cedente..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            value={contractSearch}
            onChange={(e) => setContractSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => openCreateModal()}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 w-full md:w-auto justify-center"
        >
          <PlusCircle size={16} />
          Novo Contrato
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredContratos.map((co) => (
          <div key={co.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all group flex flex-col">
            <div className="p-6 flex-1">
              {/* Top Row: Address & Badge */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Building size={16} />
                    </div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight line-clamp-1">
                      {co.imoveis?.apelido || co.imoveis?.endereco || 'Bem / Item sem identificação'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium ml-9 line-clamp-1">
                    {co.imoveis?.endereco ? `${co.imoveis.endereco}, ${co.imoveis.numero || 'S/N'}` : 'Localização/Endereço não informado'}
                  </p>
                </div>
                <div className={`text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest shadow-sm ${
                  co.status === 'ativo' || !co.status ? 'bg-green-50 text-green-600 border border-green-100' : 
                  co.status === 'finalizado' ? 'bg-slate-50 text-slate-500 border border-slate-100' : 
                  'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {co.status === 'ativo' || !co.status ? 'Ativo' : co.status === 'finalizado' ? 'Finalizado' : 'Cancelado'}
                </div>
              </div>

              {/* People Section */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <User size={10} /> Locatário / Cliente
                  </p>
                  <p className="text-xs font-bold text-slate-700 truncate">{co.inquilinos?.nome || 'Locatário s/ nome'}</p>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <User size={10} /> Cedente / Proprietário
                  </p>
                  <p className="text-xs font-bold text-slate-700 truncate">{co.proprietarios?.nome || 'Não informado'}</p>
                </div>
              </div>

              {/* Info Bar */}
              <div className="bg-slate-50 rounded-2xl p-4 grid grid-cols-2 gap-4 border border-slate-100">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Início do Contrato</p>
                  <p className="text-xs font-black text-slate-600 tracking-tight">
                    {co.data_inicio ? new Date(co.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR') : '--/--/----'}
                  </p>
                </div>
                <div className="space-y-0.5 border-l border-slate-200 pl-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Término do Contrato</p>
                  <p className={`text-xs font-black tracking-tight ${new Date(co.data_fim) < new Date() ? 'text-red-600' : 'text-slate-600'}`}>
                    {co.data_fim ? new Date(co.data_fim + 'T00:00:00').toLocaleDateString('pt-BR') : '--/--/----'}
                  </p>
                </div>
              </div>

              {/* Document/Files Area */}
              {(co.arquivo_url || (co.documentos && co.documentos.length > 0)) && (
                <div className="mt-6 space-y-2">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Documentos Digitais</p>
                   <div className="flex flex-wrap gap-2">
                    {co.arquivo_url && (
                      <a 
                        href={co.arquivo_url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all border border-blue-100 shadow-sm"
                      >
                        <FileText size={12} />
                        Contrato PDF
                        <ExternalLink size={10} />
                      </a>
                    )}
                    {co.documentos?.map((doc: string, idx: number) => (
                      <a 
                        key={idx} 
                        href={doc} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white text-slate-600 px-3 py-1.5 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                      >
                        <Hash size={10} />
                        Anexo {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Secondary Actions (Icons) */}
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleSendEmailNotification(co, 'VENCIMENTO')}
                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md"
                    title="Enviar Lembrete por E-mail"
                  >
                    <Mail size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedContractForFinance(co);
                      setFinanceModalOpen(true);
                    }}
                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md"
                    title="Financeiro"
                  >
                    <CreditCard size={18} />
                  </button>
                  {(co.status === 'ativo' || !co.status) && (
                    <button 
                      onClick={() => handleFinishContract(co)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md"
                      title="Finalizar Contrato"
                    >
                      <Ban size={18} />
                    </button>
                  )}
                </div>

                {/* Main Action Buttons (Text) */}
                <div className="flex items-center gap-1 flex-1 sm:flex-none justify-end">
                  <button 
                    onClick={() => handlePrintDocument(co)}
                    className="flex-1 sm:flex-none px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all rounded-lg flex items-center gap-1.5"
                  >
                    <Eye size={14} />
                    <span>Visualizar</span>
                  </button>
                  <button 
                    onClick={() => {
                      setContractToRenew(co);
                      setIsRenewModalOpen(true);
                    }}
                    className="flex-1 sm:flex-none px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-600 hover:text-white transition-all rounded-lg flex items-center gap-1.5 shadow-sm bg-white"
                  >
                    <RefreshCw size={14} />
                    <span>Renovar</span>
                  </button>
                  <button 
                    onClick={() => openCreateModal(co)}
                    className="flex-1 sm:flex-none px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all rounded-lg flex items-center gap-1.5 shadow-sm bg-white"
                  >
                    <Edit3 size={14} />
                    <span>Editar</span>
                  </button>
                  {can('DELETE', 'contratos') && (
                    <button 
                      onClick={() => setItemToDelete({ id: co.id, type: 'contratos' })}
                      className="flex-1 sm:flex-none px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-lg flex items-center gap-1.5 shadow-sm bg-white"
                    >
                      <Trash2 size={14} />
                      <span>Excluir</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContratos.length === 0 && (
        <div className="bg-white border border-slate-200 border-dashed rounded-3xl py-32 flex flex-col items-center justify-center text-center px-4">
          <div className="p-6 bg-slate-50 rounded-full text-slate-300 mb-4">
            <FileText size={48} />
          </div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Nenhum contrato encontrado</h3>
          <p className="text-slate-500 text-sm max-w-xs mt-1">Sua busca não retornou resultados ou você ainda não possui contratos ativos registrados.</p>
          <button 
            onClick={() => setContractSearch('')}
            className="mt-6 text-blue-600 font-black uppercase tracking-widest text-[10px] hover:underline"
          >
            Limpar Busca
          </button>
        </div>
      )}
    </div>
  );
};
