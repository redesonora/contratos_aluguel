import React, { useState } from 'react';
import { 
  PlusCircle,
  Trash2,
  BookOpen,
  X,
  Target,
  Loader2,
  Sparkles,
  Users,
  ShieldAlert,
  Building,
  Save,
  FileText,
  BellRing
} from 'lucide-react';
import { RichEditor } from '../RichEditor';
import { TagItem } from '../TagItem';

interface ModelosContratoTabProps {
  contractTemplates: any[];
  setContractTemplates: (templates: any[]) => void;
  onSave?: (templates: any[]) => Promise<void>;
  onDeleteTemplate?: (templateId: string) => Promise<void>;
  notificationDays: number;
  setNotificationDays: (days: number) => void;
}

export const ModelosContratoTab: React.FC<ModelosContratoTabProps> = ({
  contractTemplates,
  setContractTemplates,
  onSave,
  onDeleteTemplate,
  notificationDays,
  setNotificationDays
}) => {
  const [showTagGuide, setShowTagGuide] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(contractTemplates[0]?.id || null);
  const [activeDropdown, setActiveDropdown] = useState<'size' | 'color' | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // States para Elaboração de Modelo com IA
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [contractType, setContractType] = useState('Contrato de Locação Residencial');
  const [customType, setCustomType] = useState('');
  const [contractRulesPrompt, setContractRulesPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  React.useEffect(() => {
    if (contractTemplates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(contractTemplates[0].id);
    }
  }, [contractTemplates, selectedTemplateId]);

  const handleGenerateAiTemplate = async () => {
    const finalType = contractType === 'Outro' ? customType : contractType;
    if (!finalType.trim()) {
      setGenerationError("Por favor, informe o tipo de contrato.");
      return;
    }

    setIsAiGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch('/api/contracts/generate-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: finalType,
          detalhes: contractRulesPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao conectar-se à IA de contratos.");
      }

      const generatedContent = data.content;

      // Criar id único
      const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

      const newTemplate = {
        id: newId,
        name: `🤖 [IA] ${finalType}`,
        content: generatedContent,
      };

      const updatedTemplates = [...contractTemplates, newTemplate];
      setContractTemplates(updatedTemplates);
      setSelectedTemplateId(newId);
      setIsPromptModalOpen(false);
      
      // Limpa os prompts para a próxima
      setContractRulesPrompt("");
      setCustomType("");
      
      // Se tiver callback de salvar, chama automaticamente para persistir no Supabase!
      if (onSave) {
        try {
          await onSave(updatedTemplates);
        } catch (saveErr) {
          console.error("Erro ao persistir o modelo gerado pela IA no servidor:", saveErr);
        }
      }
    } catch (err: any) {
      console.error("Erro durante a elaboração de modelo com IA:", err);
      setGenerationError(err.message || "Não foi possível elaborar o modelo com assistência de IA. Tente novamente.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const selectedTemplate = contractTemplates.find(t => t.id === selectedTemplateId) || contractTemplates[0];
  const selectedIndex = contractTemplates.findIndex(t => t.id === (selectedTemplateId || contractTemplates[0]?.id));

  const handleUpdateTemplate = (index: number, field: string, value: any) => {
    if (index === -1) return;
    const newTemplates = [...contractTemplates];
    newTemplates[index] = { ...newTemplates[index], [field]: value };
    setContractTemplates(newTemplates);
  };

  const handleAddTemplate = () => {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    const newTemplate = {
      id: newId,
      name: 'Novo Modelo ' + (contractTemplates.length + 1),
      content: '<h2 style="text-align: center;">CONTRATO DE LOCAÇÃO</h2><p>Pelo presente instrumento particular de locação...</p>',
    };
    setContractTemplates([...contractTemplates, newTemplate]);
    setSelectedTemplateId(newId);
  };

  const handleDeleteTemplate = async () => {
    if (templateToDelete) {
      const idToDelete = templateToDelete;
      const newTemplates = contractTemplates.filter(t => t.id !== idToDelete);
      
      // Se tiver uma função de delete real (Supabase), chama
      if (onDeleteTemplate) {
        try {
          await onDeleteTemplate(idToDelete);
        } catch (err) {
          console.error("Erro ao excluir template:", err);
          alert("Erro ao excluir o modelo no servidor. Tente novamente.");
          setTemplateToDelete(null);
          return;
        }
      }

      setContractTemplates(newTemplates);
      if (selectedTemplateId === idToDelete) {
        setSelectedTemplateId(newTemplates[0]?.id || null);
      }
      setTemplateToDelete(null);
    }
  };

  const handleInsertTag = (tag: string) => {
    document.execCommand('insertHTML', false, tag);
    handleCopyTag(tag);
  };

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(contractTemplates);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        console.error("Erro ao salvar:", err);
      } finally {
        setIsSaving(false);
      }
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const tagGroups = [
    {
      title: 'LOCADOR',
      color: 'blue',
      tags: [
        { label: 'NOME COMPLETO', tag: '{{locador_nome}}' },
        { label: 'CPF / CNPJ', tag: '{{locador_cpf_cnpj}}' },
        { label: 'RG', tag: '{{locador_rg}}' },
        { label: 'ESTADO CIVIL', tag: '{{locador_estado_civil}}' },
        { label: 'ENDEREÇO', tag: '{{locador_endereco}}' },
        { label: 'BAIRRO', tag: '{{locador_bairro}}' },
        { label: 'CIDADE', tag: '{{locador_cidade}}' },
        { label: 'UF', tag: '{{locador_uf}}' },
        { label: 'E-MAIL', tag: '{{locador_email}}' },
        { label: 'TELEFONE', tag: '{{locador_telefone}}' },
      ]
    },
    {
      title: 'LOCATÁRIO',
      color: 'purple',
      tags: [
        { label: 'NOME COMPLETO', tag: '{{locatario_nome}}' },
        { label: 'CPF / CNPJ', tag: '{{locatario_cpf_cnpj}}' },
        { label: 'RG', tag: '{{locatario_rg}}' },
        { label: 'PROFISSÃO', tag: '{{locatario_profession}}' },
        { label: 'ESTADO CIVIL', tag: '{{locatario_estado_civil}}' },
        { label: 'NACIONALIDADE', tag: '{{locatario_nacionalidade}}' },
        { label: 'NATURALIDADE', tag: '{{locatario_naturalidade}}' },
        { label: 'UF NASC.', tag: '{{locatario_uf_nasc}}' },
        { label: 'E-MAIL', tag: '{{locatario_email}}' },
        { label: 'TELEFONE', tag: '{{locatario_telefone}}' },
      ]
    },
    {
      title: 'FIADOR',
      color: 'amber',
      tags: [
        { label: 'NOME FIADOR', tag: '{{fiador_nome}}' },
        { label: 'CPF FIADOR', tag: '{{fiador_cpf}}' },
        { label: 'RG FIADOR', tag: '{{fiador_rg}}' },
        { label: 'CEP FIADOR', tag: '{{fiador_cep}}' },
        { label: 'ENDEREÇO FIADOR', tag: '{{fiador_endereco}}' },
      ]
    },
    {
      title: 'IMÓVEL',
      color: 'emerald',
      tags: [
        { label: 'ENDEREÇO / LOGRADOURO', tag: '{{imovel_endereco}}' },
        { label: 'NÚMERO', tag: '{{imovel_numero}}' },
        { label: 'BAIRRO', tag: '{{imovel_bairro}}' },
        { label: 'CIDADE', tag: '{{imovel_cidade}}' },
        { label: 'UF', tag: '{{imovel_uf}}' },
        { label: 'CEP', tag: '{{imovel_cep}}' },
        { label: 'TIPO DE IMÓVEL', tag: '{{imovel_tipo}}' },
        { label: 'INSTALAÇÃO CEMIG', tag: '{{imovel_cemig}}' },
        { label: 'MATRÍCULA COPASA', tag: '{{imovel_copasa}}' },
        { label: 'OBSERVAÇÕES', tag: '{{imovel_obs}}' },
      ]
    },
    {
      title: 'DADOS DO CONTRATO',
      color: 'slate',
      fullWidth: true,
      tags: [
        { label: 'VALOR (R$)', tag: '{{valor_aluguel}}' },
        { label: 'VALOR EXTENSO', tag: '{{valor_extenso}}' },
        { label: 'VENCIMENTO (DIA)', tag: '{{dia_vencimento}}' },
        { label: 'INÍCIO VIGÊNCIA', tag: '{{data_inicio}}' },
        { label: 'FIM VIGÊNCIA', tag: '{{data_fim}}' },
      ]
    }
  ];

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Modelos de Contratos Side-by-Side */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 tracking-tight">Modelos de Contratos</h2>
            <p className="text-xs text-zinc-500 font-normal">Edite modelos e utilize tags dinâmicas para preenchimento automático.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => setIsPromptModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 rounded-lg text-xs font-medium transition-colors cursor-pointer border border-zinc-200/80"
            >
              <Sparkles size={13} className="text-indigo-600" />
              Elaborar com IA
            </button>
            <button 
              onClick={handleAddTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer"
            >
              <PlusCircle size={13} />
              Novo Modelo
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 bg-zinc-50/50 p-4 rounded-xl border border-zinc-200/80">
          {/* Sidebar de Modelos */}
          <div className="w-full lg:w-64 space-y-1.5">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-2 py-1">Modelos salvos</p>
            {contractTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`w-full text-left p-3 rounded-lg transition-all flex flex-col gap-0.5 group cursor-pointer border ${
                  selectedTemplateId === template.id 
                    ? 'bg-white border-zinc-300 shadow-sm text-zinc-900 font-medium' 
                    : 'bg-transparent border-transparent text-zinc-600 hover:bg-white/80 hover:border-zinc-200'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs truncate">
                    {template.name}
                  </span>
                  {selectedTemplateId === template.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                  )}
                </div>
              </button>
            ))}
            {contractTemplates.length === 0 && (
              <div className="p-6 text-center text-zinc-400 font-normal text-xs">Nenhum modelo criado.</div>
            )}
          </div>

          {/* Editor de Modelo Selecionado */}
          <div className="flex-1 min-w-0">
            {selectedTemplate ? (
              <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-full">
                <div className="p-4 border-b border-zinc-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-50/40">
                  <div className="flex-1 w-full">
                    <label className="text-[11px] font-medium text-zinc-500 mb-1 block">Nome do Modelo</label>
                    <input 
                      type="text"
                      value={selectedTemplate.name}
                      onChange={(e) => handleUpdateTemplate(selectedIndex, 'name', e.target.value)}
                      className="w-full bg-white border border-zinc-200 focus:border-zinc-400 outline-none rounded-lg px-3 py-1.5 font-medium text-zinc-800 text-xs transition-colors"
                      placeholder="Ex: Contrato de Locação Residencial"
                    />
                  </div>
                  <div className="flex items-center gap-1 self-end sm:self-center">
                    <button 
                      onClick={() => setShowTagGuide(true)}
                      className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                      title="Dicionário de Tags"
                    >
                      <BookOpen size={16} />
                    </button>
                    <button 
                      onClick={() => setTemplateToDelete(selectedTemplate.id)}
                      className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir este Modelo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <RichEditor 
                    content={selectedTemplate.content}
                    onChange={(val) => handleUpdateTemplate(selectedIndex, 'content', val)}
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                  />

                  <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Inserir Tags Rápidas:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {tagGroups.slice(0, 4).flatMap(g => g.tags.slice(0, 3)).map((tag, index) => (
                          <button 
                            key={`shortcut-${tag.tag}-${index}`}
                            onMouseDown={(e) => { e.preventDefault(); handleInsertTag(tag.tag); }}
                            className="px-2 py-1 bg-zinc-50 text-zinc-600 rounded-md text-[11px] font-mono border border-zinc-200/60 hover:border-zinc-300 hover:bg-white transition-colors cursor-pointer"
                          >
                            {tag.tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end md:self-center">
                       {saveSuccess && (
                         <span className="text-xs font-medium text-emerald-600 animate-pulse">Salvo com sucesso!</span>
                       )}
                       <button 
                         onClick={handleSave}
                         disabled={isSaving}
                         className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                       >
                          {isSaving ? <Loader2 className="animate-spin" size={13} /> : <Save size={13} />}
                          {isSaving ? 'Salvando...' : 'Salvar Modelo'}
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-white rounded-xl border border-dashed border-zinc-200 text-zinc-400 font-normal text-xs p-8">
                Selecione um modelo para começar a editar
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Alertas e Notificações */}
      <section className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-zinc-100 text-zinc-700 rounded-lg">
            <BellRing size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">Alertas de Vencimento de Contrato</h2>
            <p className="text-xs text-zinc-500 font-normal">Defina a antecedência dos avisos antes da data de término</p>
          </div>
        </div>

        <div className="max-w-sm space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-zinc-600">Antecedência configurada</label>
            <span className="text-xs font-semibold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200/60">{notificationDays} dias</span>
          </div>
          <input 
            type="range"
            min="15"
            max="120"
            step="5"
            value={notificationDays}
            onChange={(e) => setNotificationDays(parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
          />
          <div className="flex justify-between text-[10px] text-zinc-400 font-normal">
            <span>15 dias</span>
            <span>120 dias</span>
          </div>
        </div>
      </section>

      {/* Tag Guide Modal */}
      {showTagGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-xl overflow-hidden border border-zinc-200 flex flex-col">
            <div className="p-4 px-6 border-b border-zinc-200/80 flex justify-between items-center bg-zinc-50/50">
               <div>
                  <h2 className="text-sm font-semibold text-zinc-900">Dicionário de Tags de Contrato</h2>
                  <p className="text-xs text-zinc-500 font-normal">Clique na tag para copiá-la ou inseri-la no modelo</p>
               </div>
               <button onClick={() => setShowTagGuide(false)} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors cursor-pointer">
                 <X size={18} />
               </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {tagGroups.map((group) => (
                    <div key={group.title} className={`${group.fullWidth ? 'md:col-span-2 lg:col-span-4 bg-zinc-50/60 p-4 rounded-xl border border-zinc-200/80' : 'space-y-2'}`}>
                       <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                         {group.title}
                       </h3>
                       
                       <div className={`${group.fullWidth ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2' : 'grid grid-cols-1 gap-1.5'}`}>
                          {group.tags.map((tag) => (
                            <TagItem 
                              key={`${group.title}-${tag.tag}`} 
                              label={tag.label} 
                              tag={tag.tag} 
                              onClick={handleInsertTag} 
                            />
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="p-4 px-6 bg-zinc-50/50 border-t border-zinc-200 flex justify-between items-center">
               <p className="text-xs text-zinc-500 font-normal">
                 As tags entre chaves duplas serão substituídas pelos valores do cadastro.
               </p>
               <button 
                 onClick={() => setShowTagGuide(false)}
                 className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors cursor-pointer"
               >
                 Fechar
               </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Contract Model Maker Modal */}
      {isPromptModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl max-h-[85vh] rounded-2xl shadow-xl overflow-hidden border border-zinc-200 flex flex-col">
            <div className="p-4 px-6 border-b border-zinc-200/80 flex justify-between items-center bg-zinc-50/50">
               <div className="flex items-center gap-2.5">
                 <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                   <Sparkles size={16} />
                 </div>
                 <div>
                    <h2 className="text-sm font-semibold text-zinc-900">Elaborar Modelo com IA</h2>
                    <p className="text-xs text-zinc-500 font-normal">A IA gerará as cláusulas e inserirá as tags automáticas</p>
                 </div>
               </div>
               <button onClick={() => !isAiGenerating && setIsPromptModalOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors cursor-pointer">
                 <X size={18} />
               </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
               <div className="space-y-1.5">
                 <label className="text-xs font-medium text-zinc-700 block">Tipo de Contrato</label>
                 <select 
                   value={contractType}
                   onChange={(e) => setContractType(e.target.value)}
                   className="w-full bg-white border border-zinc-200 focus:border-zinc-400 outline-none rounded-lg px-3 py-2 text-xs font-normal text-zinc-800 transition-colors"
                 >
                   <option value="Contrato de Locação Residencial">Contrato de Locação Residencial</option>
                   <option value="Contrato de Locação Comercial">Contrato de Locação Comercial</option>
                   <option value="Contrato de Compra e Venda de Imóvel">Contrato de Compra e Venda de Imóvel</option>
                   <option value="Contrato de Locação por Temporada">Contrato de Locação por Temporada</option>
                   <option value="Outro">Outro (Digitar personalizado...)</option>
                 </select>
               </div>

               {contractType === 'Outro' && (
                 <div className="space-y-1.5">
                   <label className="text-xs font-medium text-zinc-700 block">Nome do Tipo de Contrato</label>
                   <input 
                     type="text"
                     placeholder="Ex: Contrato de Comodato de Imóvel"
                     value={customType}
                     onChange={(e) => setCustomType(e.target.value)}
                     className="w-full bg-white border border-zinc-200 focus:border-zinc-400 outline-none rounded-lg px-3 py-2 text-xs font-normal text-zinc-800 transition-colors"
                   />
                 </div>
               )}

               <div className="space-y-1.5">
                 <label className="text-xs font-medium text-zinc-700 block">Cláusulas e Requisitos Especiais</label>
                 <textarea 
                   rows={4}
                   placeholder="Ex: Reajuste anual pelo IPCA, prazo de 30 meses, proibir animais, multa rescisória de 3 aluguéis, caução de 3 meses..."
                   value={contractRulesPrompt}
                   onChange={(e) => setContractRulesPrompt(e.target.value)}
                   className="w-full bg-white border border-zinc-200 focus:border-zinc-400 outline-none rounded-lg px-3 py-2 text-xs font-normal text-zinc-800 transition-colors resize-none leading-relaxed"
                 />
                 <p className="text-[11px] text-zinc-500 font-normal bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/50">
                   A IA incluirá as seções jurídicas padrão e as tags de substituição dinâmica.
                 </p>
               </div>

               {generationError && (
                 <div className="p-3 bg-rose-50 border border-rose-200/60 text-rose-700 text-xs rounded-lg font-normal">
                   {generationError}
                 </div>
               )}
            </div>
            
            <div className="p-4 px-6 bg-zinc-50/50 border-t border-zinc-200 flex justify-end items-center gap-2">
               <button 
                 onClick={() => setIsPromptModalOpen(false)}
                 disabled={isAiGenerating}
                 className="px-4 py-2 text-zinc-600 hover:text-zinc-900 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
               >
                 Cancelar
               </button>
               <button 
                 onClick={handleGenerateAiTemplate}
                 disabled={isAiGenerating}
                 className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
               >
                 {isAiGenerating ? (
                   <>
                     <Loader2 className="animate-spin" size={13} />
                     Elaborando...
                   </>
                 ) : (
                   <>
                     <Sparkles size={13} />
                     Gerar Modelo
                   </>
                 )}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {templateToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-xl overflow-hidden border border-zinc-200 flex flex-col">
             <div className="p-6 text-center space-y-4">
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                   <Trash2 size={18} />
                </div>
                <div>
                   <h2 className="text-sm font-semibold text-zinc-900">Excluir Modelo?</h2>
                   <p className="text-xs text-zinc-500 font-normal mt-1 leading-relaxed">
                     O modelo <strong className="text-zinc-800 font-medium">"{contractTemplates.find(t => t.id === templateToDelete)?.name}"</strong> será removido permanentemente.
                   </p>
                </div>
                
                <div className="flex gap-2 pt-2">
                   <button 
                     onClick={() => setTemplateToDelete(null)}
                     className="flex-1 px-3 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-200 transition-colors cursor-pointer"
                   >
                     Cancelar
                   </button>
                   <button 
                     onClick={handleDeleteTemplate}
                     className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition-colors cursor-pointer shadow-sm"
                   >
                     Excluir
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
