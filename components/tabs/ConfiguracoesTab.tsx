import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Shield, 
  Palette, 
  BellRing, 
  Database,
  PlusCircle,
  Users,
  FileText,
  Trash2,
  BookOpen,
  X,
  Target,
  Hash,
  ShieldAlert,
  Building,
  Loader2,
  Sparkles
} from 'lucide-react';
import { RichEditor } from '../RichEditor';
import { TagItem } from '../TagItem';

interface ConfiguracoesTabProps {
  contractTemplates: any[];
  setContractTemplates: (templates: any[]) => void;
  notificationDays: number;
  setNotificationDays: (days: number) => void;
  onSave?: (templates: any[]) => Promise<void>;
  onDeleteTemplate?: (templateId: string) => Promise<void>;
}

export const ConfiguracoesTab: React.FC<ConfiguracoesTabProps> = ({
  contractTemplates,
  setContractTemplates,
  notificationDays,
  setNotificationDays,
  onSave,
  onDeleteTemplate
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
        { label: 'PROFISSÃO', tag: '{{locatario_profissao}}' },
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
    <div className="space-y-12 pb-24">
      {/* Modelos de Contratos Side-by-Side */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
               <FileText size={20} />
             </div>
             <div>
               <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Modelos de Contratos</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Edite seus modelos e utilize tags para preenchimento automático.</p>
             </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => setIsPromptModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              <Sparkles size={14} />
              Elaborar com IA
            </button>
            <button 
              onClick={handleAddTemplate}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              <PlusCircle size={14} />
              Novo Modelo
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200">
          {/* Sidebar de Modelos */}
          <div className="w-full lg:w-72 space-y-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-4">Selecione para Editar</p>
            {contractTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all border-2 flex flex-col gap-1 group ${
                  selectedTemplateId === template.id 
                    ? 'bg-white border-blue-500 shadow-md ring-4 ring-blue-50' 
                    : 'bg-transparent border-transparent text-slate-500 hover:bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-black uppercase tracking-tight ${selectedTemplateId === template.id ? 'text-blue-600' : 'text-slate-600'}`}>
                    {template.name}
                  </span>
                  <div className={`transition-opacity ${selectedTemplateId === template.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">Última edição: {new Date().toLocaleDateString()}</p>
              </button>
            ))}
            {contractTemplates.length === 0 && (
              <div className="p-8 text-center text-slate-400 font-medium italic text-xs">Nenhum modelo criado.</div>
            )}
          </div>

          {/* Editor de Modelo Selecionado */}
          <div className="flex-1 min-w-0">
            {selectedTemplate ? (
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in duration-300">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
                  <div className="flex-1 w-full">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Identificação do Modelo</label>
                    <input 
                      type="text"
                      value={selectedTemplate.name}
                      onChange={(e) => handleUpdateTemplate(selectedIndex, 'name', e.target.value)}
                      className="w-full bg-white border-2 border-slate-100 focus:border-blue-400 outline-none rounded-xl px-4 py-2 font-black text-slate-800 text-sm transition-all"
                      placeholder="Ex: Contrato Residencial"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowTagGuide(true)}
                      className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm group border border-transparent hover:border-slate-100"
                      title="Guia de Tags"
                    >
                      <BookOpen size={18} />
                    </button>
                    <button 
                      onClick={() => setTemplateToDelete(selectedTemplate.id)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm group border border-transparent hover:border-slate-100"
                      title="Excluir este Modelo"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <RichEditor 
                    content={selectedTemplate.content}
                    onChange={(val) => handleUpdateTemplate(selectedIndex, 'content', val)}
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                  />

                  <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Atalhos (Insert Tags):</label>
                      <div className="flex flex-wrap gap-2">
                        {tagGroups.slice(0, 4).flatMap(g => g.tags.slice(0, 3)).map((tag, index) => (
                          <button 
                            key={`shortcut-${tag.tag}-${index}`}
                            onMouseDown={(e) => { e.preventDefault(); handleInsertTag(tag.tag); }}
                            className="px-2.5 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-bold border border-slate-100 hover:border-blue-200 hover:text-blue-600 transition-all"
                          >
                            {tag.tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                       {saveSuccess && (
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest animate-pulse">Salvo!</span>
                       )}
                       <button 
                         onClick={handleSave}
                         disabled={isSaving}
                         className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
                       >
                          {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                          {isSaving ? 'Salvando...' : 'Salvar Modelo'}
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 italic text-sm">
                Selecione um modelo para começar a editar
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Alertas e Notificações */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <BellRing size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Alertas e Notificações</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Regras de aviso para vencimentos e tarefas</p>
          </div>
        </div>

        <div className="max-w-md space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Antecedência de Alerta</label>
              <span className="text-xl font-black text-blue-600 italic">{notificationDays} dias</span>
            </div>
            <input 
              type="range"
              min="15"
              max="120"
              step="5"
              value={notificationDays}
              onChange={(e) => setNotificationDays(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-tighter">
              <span>15 Dias</span>
              <span>120 Dias</span>
            </div>
          </div>
        </div>
      </section>

      {/* Outras Configurações Simples */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Palette size={14} />
                Aparência e Marca
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome da Imobiliária</label>
                  <input 
                    type="text" 
                    defaultValue="REALIZZE IMÓVEIS"
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-400 outline-none rounded-2xl px-4 py-3 font-bold text-sm transition-all"
                  />
                </div>
              </div>
           </div>
           
           <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Shield size={14} />
                Segurança
              </h3>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium italic">
                  As permissões de acesso são gerenciadas automaticamente com base no nível do usuário (Administrador, Corretor ou Proprietário).
                </p>
              </div>
           </div>
        </div>
      </section>

      {/* Tag Guide Modal */}
      {showTagGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowTagGuide(false)} />
          <div className="relative bg-slate-50 w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden border border-white flex flex-col motion-safe:animate-in motion-safe:zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 bg-white flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                   <Target size={24} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Dicionário de Tags do Contrato</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Clique na tag para copiar</p>
                 </div>
               </div>
               <button onClick={() => setShowTagGuide(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                 <X size={24} className="text-slate-400" />
               </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {tagGroups.map((group) => (
                    <div key={group.title} className={`${group.fullWidth ? 'md:col-span-2 lg:col-span-4 bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100' : 'space-y-4'}`}>
                       <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-4 ${
                         group.color === 'blue' ? 'text-blue-600' : 
                         group.color === 'purple' ? 'text-purple-600' :
                         group.color === 'amber' ? 'text-amber-600' :
                         group.color === 'emerald' ? 'text-emerald-600' : 'text-slate-600'
                       }`}>
                         {group.color === 'blue' && <Users size={14} />}
                         {group.color === 'purple' && <Users size={14} />}
                         {group.color === 'amber' && <ShieldAlert size={14} />}
                         {group.color === 'emerald' && <Building size={14} />}
                         {group.color === 'slate' && <FileText size={14} />}
                         {group.title}
                       </h3>
                       
                       <div className={`${group.fullWidth ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4' : 'grid grid-cols-1 gap-3'}`}>
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
            
            <div className="p-8 bg-white border-t border-slate-100 flex justify-between items-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                 Use estas tags dentro do editor de cláusulas para preenchimento automático.
               </p>
               <button 
                 onClick={() => setShowTagGuide(false)}
                 className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
               >
                 Fechar Guia
               </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Contract Model Maker Modal */}
      {isPromptModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isAiGenerating && setIsPromptModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden border border-white flex flex-col motion-safe:animate-in motion-safe:zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 bg-white flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl shadow-lg shadow-indigo-50">
                   <Sparkles size={24} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic flex items-center gap-2">Elaborar Modelo com IA</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Escreva as diretrizes e a Inteligência Artificial criará um modelo estruturado com tags automáticas.</p>
                 </div>
               </div>
               <button onClick={() => !isAiGenerating && setIsPromptModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                 <X size={24} className="text-slate-400" />
               </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 space-y-6 custom-scrollbar bg-slate-50/55">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Tipo de Contrato</label>
                 <select 
                   value={contractType}
                   onChange={(e) => setContractType(e.target.value)}
                   className="w-full bg-white border-2 border-slate-100 focus:border-indigo-400 outline-none rounded-2xl px-4 py-3 font-bold text-sm transition-all"
                 >
                   <option value="Contrato de Locação Residencial">Contrato de Locação Residencial</option>
                   <option value="Contrato de Locação Comercial">Contrato de Locação Comercial</option>
                   <option value="Contrato de Compra e Venda de Imóvel">Contrato de Compra e Venda de Imóvel</option>
                   <option value="Contrato de Locação por Temporada">Contrato de Locação por Temporada</option>
                   <option value="Outro">Outro (Digitar personalizado...)</option>
                 </select>
               </div>

               {contractType === 'Outro' && (
                 <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Digite o Nome do Tipo de Contrato</label>
                   <input 
                     type="text"
                     placeholder="Ex: Contrato de Comodato de Imóvel"
                     value={customType}
                     onChange={(e) => setCustomType(e.target.value)}
                     className="w-full bg-white border-2 border-slate-100 focus:border-indigo-400 outline-none rounded-2xl px-4 py-3 font-bold text-sm transition-all"
                   />
                 </div>
               )}

               <div className="space-y-2">
                 <div className="flex justify-between items-center ml-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Exigências, Cláusulas e Regras Especiais</label>
                   <span className="text-[9px] text-slate-400 font-bold uppercase">Cláusulas Personalizadas</span>
                 </div>
                 <textarea 
                   rows={5}
                   placeholder="Ex: Reajuste anual pelo IPCA, prazo de 30 meses, proibir animais domésticos, multa rescisória proporcional de 3 aluguéis, solicitar caução de 3 meses como garantia..."
                   value={contractRulesPrompt}
                   onChange={(e) => setContractRulesPrompt(e.target.value)}
                   className="w-full bg-white border-2 border-slate-100 focus:border-indigo-400 outline-none rounded-2xl px-4 py-3 font-bold text-sm transition-all resize-none leading-relaxed"
                 />
                 <p className="text-[10px] text-slate-400 font-bold leading-normal ml-1 bg-slate-100/50 p-3 rounded-xl border border-slate-200/50">
                   💡 <strong className="text-slate-600">Dica da IA:</strong> Você pode descrever de forma livre. A IA irá incluir automaticamente as seções jurídicas padrão e inserir as tags dinâmicas como <code className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-black text-[9px]">{"{{locador_nome}}"}</code>, <code className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-black text-[9px]">{"{{valor_aluguel}}"}</code> etc., nos campos corretos para que sejam substituídos automaticamente ao emitir um contrato real!
                 </p>
               </div>

               {generationError && (
                 <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-2xl font-semibold">
                   ⚠️ {generationError}
                 </div>
               )}
            </div>
            
            <div className="p-8 bg-white border-t border-slate-100 flex justify-between items-center">
               <button 
                 onClick={() => setIsPromptModalOpen(false)}
                 disabled={isAiGenerating}
                 className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
               >
                 Cancelar
               </button>
               <button 
                 onClick={handleGenerateAiTemplate}
                 disabled={isAiGenerating}
                 className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50"
               >
                 {isAiGenerating ? (
                   <>
                     <Loader2 className="animate-spin" size={14} />
                     Elaborando com IA...
                   </>
                 ) : (
                   <>
                     <Sparkles size={14} />
                     Elaborar Contrato
                   </>
                 )}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {templateToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setTemplateToDelete(null)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white flex flex-col motion-safe:animate-in motion-safe:zoom-in-95 duration-200">
             <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                   <Trash2 size={40} />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Confirmar Exclusão?</h2>
                   <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                     O modelo <strong className="text-slate-800 font-black">"{contractTemplates.find(t => t.id === templateToDelete)?.name}"</strong> será removido permanentemente. Esta ação não poderá ser desfeita.
                   </p>
                </div>
                
                <div className="flex gap-4">
                   <button 
                     onClick={() => setTemplateToDelete(null)}
                     className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                   >
                     Cancelar
                   </button>
                   <button 
                     onClick={handleDeleteTemplate}
                     className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                   >
                     Sim, Excluir
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
