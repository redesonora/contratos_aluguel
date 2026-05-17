'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Users, 
  FileText, 
  CreditCard, 
  LayoutDashboard, 
  PlusCircle,
  AlertCircle,
  Ban,
  Info,
  Settings,
  Bell,
  Printer,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Home,
  X,
  Menu,
  BadgeDollarSign,
  Loader2,
  CheckCircle2,
  Download,
  Edit3,
  Trash2,
  Search,
  FileDown,
  FileUp,
  ExternalLink,
  Archive,
  ArchiveRestore,
  Mail,
  Send,
  Eye,
  TrendingUp,
  TrendingDown,
  MapPin,
  ShieldAlert,
  User,
  ShieldCheck,
  Building,
  Copy,
  Hash,
  Lock,
  DollarSign,
  Bold,
  Italic,
  Underline,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { formatarMoeda, numeroParaExtenso } from '@/lib/utils-format';
import { supabase } from '@/lib/supabase';
import PropertyMap from '@/components/PropertyMap';

// Tipos
interface Imovel {
  id: string;
  endereco: string;
  numero: string;
  complemento?: string;
  cep: string;
  tipo_imovel: string;
  cemig: string;
  copasa: string;
  bairro: string;
  cidade: string;
  estado: string;
  status: string;
  proprietario_id?: string;
  apelido?: string;
  descricao?: string;
  arquivado?: boolean;
}

interface Inquilino {
  id: string;
  nome: string;
  cpf_cnpj: string;
  email: string;
  telefone: string;
  estado_civil?: string;
  rg?: string;
  profissao?: string;
  nacionalidade?: string;
  naturalidade?: string;
  uf_nascimento?: string;
  nome_fiador?: string;
  cpf_fiador?: string;
  rg_fiador?: string;
  endereco_fiador?: string;
  documentos_fiador?: string[];
  arquivado?: boolean;
}

interface Proprietario {
  id: string;
  nome: string;
  cpf_cnpj: string;
  rg?: string;
  estado_civil?: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  email?: string;
  telefone?: string;
  arquivado?: boolean;
}

interface UserProfile {
  id: string;
  role: 'ADMIN' | 'CORRETOR' | 'PROPRIETARIO';
  nome: string | null;
  cpf?: string;
  approved: boolean;
  plano?: string;
  status_pagamento?: string;
  data_inicio?: string;
  trial_ends_at?: string;
  last_access?: string;
  proprietario_id: string | null;
}

interface Contrato {
  id: string;
  imovel_id: string;
  inquilino_id: string;
  proprietario_id?: string;
  valor_aluguel: number;
  data_inicio: string;
  data_fim: string;
  dia_vencimento?: number;
  clausulas?: string;
  alinhamento_texto?: 'left' | 'center' | 'right' | 'justify';
  arquivo_url?: string;
  documentos?: string[];
  imoveis?: { 
    endereco: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cep?: string;
    cidade: string;
    estado: string;
    apelido?: string;
    proprietario_id?: string;
    proprietarios?: { nome: string; cpf_cnpj: string };
  };
  inquilinos?: { nome: string; cpf_cnpj: string; email: string };
  proprietarios?: { nome: string; cpf_cnpj: string };
  arquivado?: boolean;
  renovacoes_count?: number;
}

enum StatusPagamento {
  PENDENTE = 'Pendente',
  PAGO = 'Pago',
  ATRASADO = 'Atrasado'
}

interface Pagamento {
  id: string;
  contrato_id: string;
  valor_pago?: number;
  valor_esperado: number;
  data_vencimento: string;
  data_pagamento?: string;
  competencia_mes: number;
  competencia_ano: number;
  status: StatusPagamento;
  multa?: number;
  juros?: number;
  observacoes?: string;
  user_id: string;
  contratos?: Contrato;
}

// Tipos Simples para a Demo
interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <motion.button
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} className={active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500 transition-colors'} />
    <span className={`font-semibold tracking-tight ${active ? 'text-white' : 'text-slate-600'}`}>{label}</span>
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
    )}
  </motion.button>
);

// Components
const RichEditor = ({ content, onChange, activeDropdown, setActiveDropdown }: { 
  content: string, 
  onChange: (html: string) => void,
  activeDropdown: 'size' | 'color' | null,
  setActiveDropdown: (val: 'size' | 'color' | null) => void
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const initialized = React.useRef(false);

  useEffect(() => {
    if (editorRef.current && !initialized.current) {
      editorRef.current.innerHTML = content;
      initialized.current = true;
    }
  }, [content]);

  // Se o conteúdo mudar externamente (ex: trocar de template), atualizamos o HTML
  useEffect(() => {
    if (editorRef.current && initialized.current && editorRef.current.innerHTML !== content) {
       // Apenas atualiza se não for o foco atual para evitar perder cursor
       if (document.activeElement !== editorRef.current) {
         editorRef.current.innerHTML = content;
       }
    }
  }, [content]);

  const exec = (command: string, value: string = '') => {
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  return (
    <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-0.5">
          <button 
            type="button"
            onMouseDown={(e) => { e.preventDefault(); exec('bold'); }}
            className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-600 transition-all focus:ring-0 outline-none"
            title="Negrito"
          >
            <Bold size={14} />
          </button>
          <button 
            type="button"
            onMouseDown={(e) => { e.preventDefault(); exec('italic'); }}
            className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-600 transition-all focus:ring-0 outline-none"
            title="Itálico"
          >
            <Italic size={14} />
          </button>
          <button 
            type="button"
            onMouseDown={(e) => { e.preventDefault(); exec('underline'); }}
            className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-600 transition-all focus:ring-0 outline-none"
            title="Sublinhado"
          >
            <Underline size={14} />
          </button>
        </div>
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <div className="flex items-center gap-0.5">
          <button 
            type="button"
            onMouseDown={(e) => { e.preventDefault(); exec('justifyLeft'); }}
            className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-600 transition-all focus:ring-0 outline-none"
            title="Alinhar à Esquerda"
          >
            <AlignLeft size={14} />
          </button>
          <button 
            type="button"
            onMouseDown={(e) => { e.preventDefault(); exec('justifyCenter'); }}
            className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-600 transition-all focus:ring-0 outline-none"
            title="Centralizar"
          >
            <AlignCenter size={14} />
          </button>
          <button 
            type="button"
            onMouseDown={(e) => { e.preventDefault(); exec('justifyRight'); }}
            className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-600 transition-all focus:ring-0 outline-none"
            title="Alinhar à Direita"
          >
            <AlignRight size={14} />
          </button>
          <button 
            type="button"
            onMouseDown={(e) => { e.preventDefault(); exec('justifyFull'); }}
            className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-600 transition-all focus:ring-0 outline-none"
            title="Justificar"
          >
            <AlignJustify size={14} />
          </button>
        </div>
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <div className="relative">
          <button 
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setActiveDropdown(activeDropdown === 'size' ? null : 'size')}
            className={`p-1.5 rounded border border-transparent flex items-center gap-1 transition-all ${activeDropdown === 'size' ? 'bg-white border-slate-200 text-blue-600 shadow-sm' : 'hover:bg-white hover:border-slate-200 text-slate-600'}`}
          >
            <Type size={14} />
            <ChevronDown size={10} className={`transition-transform duration-200 ${activeDropdown === 'size' ? 'rotate-180' : ''}`} />
          </button>
          {activeDropdown === 'size' && (
            <div className="absolute top-full left-0 mt-1 flex flex-col bg-white border border-slate-200 rounded-lg shadow-xl z-[100] min-w-[140px] animate-in fade-in zoom-in-95 duration-200">
              {[
                { label: 'Muito Pequeno', size: '1' },
                { label: 'Pequeno', size: '2' },
                { label: 'Normal', size: '3' },
                { label: 'Médio', size: '4' },
                { label: 'Grande', size: '5' },
                { label: 'Muito Grande', size: '6' },
                { label: 'Gigante', size: '7' }
              ].map(s => (
                <button 
                  key={s.size}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec('fontSize', s.size);
                    setActiveDropdown(null);
                  }}
                  className="px-3 py-2 text-[10px] hover:bg-slate-50 text-left first:rounded-t-lg last:rounded-b-lg font-bold text-slate-700 hover:text-blue-600 border-b border-slate-50 last:border-0"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button 
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')}
            className={`p-1.5 rounded border border-transparent flex items-center gap-1 transition-all ${activeDropdown === 'color' ? 'bg-white border-slate-200 text-blue-600 shadow-sm' : 'hover:bg-white hover:border-slate-200 text-slate-600'}`}
          >
            <Palette size={14} />
            <ChevronDown size={10} className={`transition-transform duration-200 ${activeDropdown === 'color' ? 'rotate-180' : ''}`} />
          </button>
          {activeDropdown === 'color' && (
            <div className="absolute top-full left-0 mt-1 grid grid-cols-4 gap-1.5 p-2.5 bg-white border border-slate-200 rounded-lg shadow-xl z-[100] animate-in fade-in zoom-in-95 duration-200">
              {['#000000', '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#64748b', '#0f172a', '#94a3b8', '#ec4899', '#14b8a6', '#f43f5e', '#ffffff'].map(color => (
                <button 
                  key={color}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec('foreColor', color);
                    setActiveDropdown(null);
                  }}
                  className="w-6 h-6 rounded border border-slate-200 transition-all hover:scale-110 active:scale-95 shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div 
        ref={editorRef}
        className="w-full h-80 text-sm font-sans bg-transparent p-4 focus:outline-none overflow-y-auto leading-relaxed rich-editor"
        contentEditable
        suppressContentEditableWarning={true}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  );
};

const TagItem = ({ tag, label }: { tag: string, label: string }) => (
  <div className="flex items-center justify-between p-2 hover:bg-white rounded-lg group transition-all border border-transparent hover:border-slate-100 hover:shadow-sm">
    <div className="flex flex-col">
       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</span>
       <span 
         className="text-[12px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded cursor-pointer hover:bg-blue-100 transition-colors" 
         onClick={() => {
           navigator.clipboard.writeText(tag);
           alert(`Tag ${tag} copiada!`);
         }}
       >
         {tag}
       </span>
    </div>
    <button 
      onClick={() => {
        navigator.clipboard.writeText(tag);
        alert(`Tag ${tag} copiada!`);
      }}
      className="p-1.5 text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"
    >
      <Copy size={14} />
    </button>
  </div>
);

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [perfis, setPerfis] = useState<UserProfile[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isReceiptModalOpen, setReceiptModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'contratos' | 'imoveis' | 'inquilinos' | 'proprietarios'} | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [notificationDays, setNotificationDays] = useState(60);
  const [notifications, setNotifications] = useState<Contrato[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('todos');
  const [paymentMonthFilter, setPaymentMonthFilter] = useState<number>(0);
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState<number>(0);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [guarantorFilesToUpload, setGuarantorFilesToUpload] = useState<File[]>([]);
  const [contractFileToUpload, setContractFileToUpload] = useState<File | null>(null);
  const [contractFileUrl, setContractFileUrl] = useState<string | null>(null);
  const [existingDocs, setExistingDocs] = useState<string[]>([]);
  const [existingGuarantorDocs, setExistingGuarantorDocs] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedContratos, setArchivedContratos] = useState<Contrato[]>([]);
  const [archivedImoveis, setArchivedImoveis] = useState<Imovel[]>([]);
  const [archivedInquilinos, setArchivedInquilinos] = useState<Inquilino[]>([]);
  const [archivedProprietarios, setArchivedProprietarios] = useState<Proprietario[]>([]);
  const [archivedLoading, setArchivedLoading] = useState(false);
  const [archivedLoaded, setArchivedLoaded] = useState(false);
  const [sortConfig, setSortConfig] = useState<{[key: string]: {key: string, direction: 'asc' | 'desc'}}>({
    imoveis: { key: 'endereco', direction: 'asc' },
    proprietarios: { key: 'nome', direction: 'asc' },
    inquilinos: { key: 'nome', direction: 'asc' }
  });
  const [currentPage, setCurrentPage] = useState<{[key: string]: number}>({
    imoveis: 1,
    proprietarios: 1,
    inquilinos: 1
  });
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [activeEditorDropdown, setActiveEditorDropdown] = useState<'size' | 'color' | null>(null);
  const [clausulasHtml, setClausulasHtml] = useState('');
  const [contractAlignment, setContractAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('justify');
  const [isTagGuideOpen, setIsTagGuideOpen] = useState(false);
  const [financeModalOpen, setFinanceModalOpen] = useState(false);
  const [selectedContractForFinance, setSelectedContractForFinance] = useState<Contrato | null>(null);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [contractToRenew, setContractToRenew] = useState<Contrato | null>(null);
  const itemsPerPage = 8;

  const recordLog = useCallback(async (acao: string, tabela: string, registroId?: string, detalhes?: any) => {
    try {
      if (!session?.user) return;
      
      await supabase.from('audit_logs').insert([{
        user_id: session.user.id,
        acao,
        tabela,
        registro_id: registroId,
        detalhes
      }]);
    } catch (err) {
      console.error('Erro ao gravar log:', err);
    }
  }, [session]);

  const handleUpdateUser = async (updatedData: Partial<UserProfile>) => {
    if (!editingUser) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_profiles')
        .update(updatedData)
        .eq('id', editingUser.id);
        
      if (error) throw error;
      
      // Atualizar lista local
      setPerfis(prev => prev.map(p => p.id === editingUser.id ? { ...p, ...updatedData } : p));
      setEditingUser(null);
      // Opcional: mostrar toast de sucesso
    } catch (err: any) {
      console.error('Erro ao atualizar usuário:', err?.message || err || 'Erro desconhecido');
      // Opcional: mostrar toast de erro
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.new !== pwdForm.confirm) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }
    if (pwdForm.new.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwdForm.new });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setIsChangePasswordOpen(false);
      setPwdForm({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (tab: string, key: string) => {
    setSortConfig(prev => ({
      ...prev,
      [tab]: {
        key,
        direction: prev[tab].key === key && prev[tab].direction === 'asc' ? 'desc' : 'asc'
      }
    }));
  };

  const monthlyCashFlowData = React.useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, idx) => {
      const monthNum = idx + 1;
      const monthPagamentos = pagamentos.filter(p => p.competencia_mes === monthNum && p.competencia_ano === currentYear);
      
      const recebido = monthPagamentos
        .filter(p => p.status === StatusPagamento.PAGO)
        .reduce((acc, p) => acc + (p.valor_pago || 0), 0);
        
      const pendente = monthPagamentos
        .filter(p => p.status !== StatusPagamento.PAGO)
        .reduce((acc, p) => acc + (p.valor_esperado || p.contratos?.valor_aluguel || 0), 0);
        
      return {
        name: month,
        recebido,
        pendente
      };
    });
  }, [pagamentos]);

  const stats = React.useMemo(() => {
    const activeContratos = contratos.filter(c => !c.arquivado);
    const activeImoveis = imoveis.filter(i => !i.arquivado);
    const totalImoveis = activeImoveis.length;
    const alugadosCount = activeImoveis.filter(i => i.status === 'Alugado').length;
    const disponiveisCount = activeImoveis.filter(i => i.status === 'Disponível').length;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const currentMonthPagamentos = pagamentos.filter(p => p.competencia_mes === currentMonth && p.competencia_ano === currentYear);
    
    const aReceber = currentMonthPagamentos
      .filter(p => !p.status || p.status === StatusPagamento.PENDENTE || p.status === StatusPagamento.ATRASADO)
      .reduce((acc, p) => acc + (p.valor_esperado || p.contratos?.valor_aluguel || 0), 0);
      
    const recebido = currentMonthPagamentos
      .filter(p => p.status === StatusPagamento.PAGO)
      .reduce((acc, p) => acc + (p.valor_pago || 0), 0);
      
    const inadimplenciaCount = currentMonthPagamentos
      .filter(p => p.status === StatusPagamento.ATRASADO || (!p.status && new Date(p.data_vencimento) < now))
      .length;

    return {
      activeContratosCount: activeContratos.length,
      pagamentosCount: currentMonthPagamentos.length,
      aReceber,
      recebido,
      inadimplenciaCount,
      totalImoveis,
      alugadosCount,
      disponiveisCount,
      alugadosPercent: totalImoveis > 0 ? (alugadosCount / totalImoveis) * 100 : 0
    };
  }, [contratos, imoveis, pagamentos]);

  const getPaginatedAndSortedData = useCallback((data: any[], tab: string) => {
    const { key, direction } = sortConfig[tab] || { key: '', direction: 'asc' };
    
    // Filter by archive status first
    const filtered = data.filter(item => showArchived ? item.arquivado : !item.arquivado);

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (!key) return 0;
      const valA = a[key]?.toString().toLowerCase() || '';
      const valB = b[key]?.toString().toLowerCase() || '';
      
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const page = currentPage[tab] || 1;
    const startIndex = (page - 1) * itemsPerPage;
    const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

    return {
      data: paginated,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  }, [showArchived, sortConfig, currentPage]);

  const Pagination = ({ tab, totalPages }: { tab: string, totalPages: number }) => {
    if (totalPages <= 1) return null;
    const page = currentPage[tab] || 1;

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Página {page} de {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setCurrentPage(prev => ({ ...prev, [tab]: page - 1 }))}
            className="px-3 py-1 bg-white border border-slate-200 rounded text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all"
          >
            Anterior
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setCurrentPage(prev => ({ ...prev, [tab]: page + 1 }))}
            className="px-3 py-1 bg-white border border-slate-200 rounded text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all"
          >
            Próxima
          </button>
        </div>
      </div>
    );
  };

  const SortHeader = ({ label, sortKey, activeTab }: { label: string, sortKey: string, activeTab: string }) => {
    const isSorted = sortConfig[activeTab].key === sortKey;
    const direction = sortConfig[activeTab].direction;
    
    return (
      <th 
        className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group"
        onClick={() => handleSort(activeTab, sortKey)}
      >
        <div className="flex items-center gap-1">
          {label}
          <span className={`transition-opacity ${isSorted ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'}`}>
            {isSorted && direction === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </span>
        </div>
      </th>
    );
  };
  
  const [templatesLoaded, setTemplatesLoaded] = useState(false);
  const [contractTemplates, setContractTemplates] = useState<{
    id?: string,
    name: string, 
    content: string,
    fontSize?: number,
    fontColor?: string,
    bold?: boolean,
    alignment?: 'left' | 'center' | 'right' | 'justify'
  }[]>([]);

  useEffect(() => {
    if (!templatesLoaded || !session?.user) return;
    
    localStorage.setItem('contratos_templates', JSON.stringify(contractTemplates));
    
    // Configura um timer para debouncing de 2 segundos antes de salvar no supabase
    const timer = setTimeout(() => {
      const syncWithSupabase = async () => {
        if (!session?.user) return;
        
        // Garante que templates criados localmente tenham um id
        let changed = false;
        const validTemplates = contractTemplates.map(t => {
          if (!t.id) {
            changed = true;
            return { ...t, id: crypto.randomUUID() };
          }
          return t;
        });
        
        if (changed) {
           setContractTemplates(validTemplates);
           return; // the next effect execution will save
        }
        
        try {
          // Extrai os IDs atuais
          const currentIds = validTemplates.map(t => t.id).filter(Boolean);
          
          if (currentIds.length > 0) {
            // Remove templates que não estão mais no array local
            await supabase.from('contract_templates')
              .delete()
              .eq('user_id', session.user.id)
              .not('id', 'in', `(${currentIds.join(',')})`);
          } else {
             // Deleta todos se vazio
             await supabase.from('contract_templates')
              .delete()
              .eq('user_id', session.user.id);
          }

          if (validTemplates.length > 0) {
            const toUpsert = validTemplates.map(t => ({
              id: t.id,
              user_id: session.user.id,
              name: t.name,
              content: t.content,
              font_size: t.fontSize || 12,
              font_color: t.fontColor || '#000000',
              bold: t.bold || false,
              alignment: t.alignment || 'justify'
            }));
            
            await supabase.from('contract_templates').upsert(toUpsert);
          }
        } catch(e) {
          console.error("Erro ao sincronizar templates", e);
        }
      };
      
      syncWithSupabase();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [contractTemplates, session, templatesLoaded]);

  /* state already declared above */
  
  interface ReceiptData {
  inquilino: string;
  cpf: string;
  valor: number;
  competencia: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  locador: string;
  locador_cpf: string;
  data: string;
}

// Receipt State
  const [receiptData, setReceiptData] = useState<ReceiptData>({
    inquilino: 'João Silva',
    cpf: '123.456.789-00',
    valor: 1500,
    competencia: 'Abril/2026',
    endereco: 'Rua das Flores',
    numero: '123',
    complemento: '',
    bairro: 'Centro',
    cidade: 'Cidade',
    estado: 'UF',
    cep: '00000-000',
    locador: 'Gleison Isaias',
    locador_cpf: '123.456.789-00',
    data: new Date().toLocaleDateString('pt-BR')
  });

  /* auth states declared above */
  
  // Percursor check permissions helper
  const can = (action: string, tab?: string) => {
    if (!userProfile) return false;
    if (userProfile.role === 'ADMIN') return true;

    if (userProfile.role === 'CORRETOR') {
      if (action === 'DELETE') return false; // Corretores não excluem nada
      if (['logs', 'usuarios'].includes(tab || '')) return false; // Corretores não veem logs ou usuários
      return true;
    }

    if (userProfile.role === 'PROPRIETARIO') {
      if (action === 'VIEW') {
        return ['dashboard', 'imoveis', 'contratos', 'pagamentos'].includes(tab || '');
      }
      return false; // Proprietários são apenas leitura
    }

    return false;
  };

  // Auth State Listener
  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('DEBUG: Detalhes do erro Supabase (Code):', error.code);
        console.error('DEBUG: Detalhes do erro Supabase (Full):', JSON.stringify(error, null, 2));
        
        if (error.code === 'PGRST116') { // Perfil não existe
          // Criar perfil padrão para novos usuários (ADMIN se for o primeiro, senão CORRETOR)
          try {
            const { count, error: countError } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
            
            if (countError) {
              console.error('Erro ao contar perfis:', JSON.stringify(countError));
            }

            const role = (count === 0 && !countError) ? 'ADMIN' : 'CORRETOR';
            const approved = role === 'ADMIN';
            
            // Buscar metadados do Auth User se estiver disponível
            const { data: { user } } = await supabase.auth.getUser();
            const meta = user?.user_metadata || {};
            
            const newProfile = { 
              id: userId, 
              role, 
              nome: meta.full_name || userEmail?.split('@')[0] || 'Usuário',
              cpf: meta.cpf || null,
              approved,
              plano: 'Nenhum',
              status_pagamento: 'Sem Assinatura',
              last_access: new Date().toISOString()
            };
            
            const { error: insertError } = await supabase.from('user_profiles').insert(newProfile);
            
            if (insertError) {
              console.error('Erro ao inserir novo perfil (Cache Schema?):', JSON.stringify(insertError));
              // Se falhou ao inserir (ex: PGRST204), usamos o fallback completo
              const fallbackProfile: UserProfile = { 
                id: userId, 
                role: 'ADMIN', 
                nome: meta.full_name || userEmail?.split('@')[0] || 'Usuário (Modo Seguro)', 
                approved: true, 
                plano: 'Pro',
                status_pagamento: 'PAGO',
                data_inicio: new Date().toISOString(),
                trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                last_access: new Date().toISOString(),
                proprietario_id: null 
              };
              setUserProfile(fallbackProfile);
            } else {
              // Buscar o perfil inserido para pegar o trial_ends_at gerado pelo DB
              const { data: insertedData } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
              setUserProfile(insertedData || (newProfile as UserProfile));
            }
          } catch (createErr) {
            console.error('Exceção ao criar perfil:', createErr);
            setUserProfile({ id: userId, role: 'ADMIN', nome: 'Admin (Fallback Exception)', approved: true, proprietario_id: null });
          }
        } else if (error.code === '42P01') {
          console.error('ERRO CRÍTICO: A tabela "user_profiles" não existe no banco de dados.');
          console.info('DICA: Execute o conteúdo do arquivo SUPABASE_SCHEMA.sql no Editor SQL do seu painel Supabase.');
          // Fallback para permitir o uso básico do sistema se o admin ainda não rodou o script
          setUserProfile({ id: userId, role: 'ADMIN', nome: 'Admin (Pendente)', approved: true, proprietario_id: null });
        } else if (data) {
          // Atualizar o last_access para usuários existentes
          await supabase.from('user_profiles').update({ last_access: new Date().toISOString() }).eq('id', userId);
          setUserProfile(data as UserProfile);
        }
      } else if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Erro fetchProfile:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    const handleAuthError = async () => {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // Ignorar erro no logout se já estivermos deslogados
      }
      // Limpeza manual de tokens se o signOut falhar por causa do token inválido
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.includes('-auth-token')) {
            localStorage.removeItem(key);
          }
        });
      }
      setSession(null);
      setUserProfile(null);
      setAuthLoading(false);
    };

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao buscar sessão inicial:', error);
          const msg = error.message?.toLowerCase() || '';
          if (msg.includes('refresh token') || msg.includes('not found') || msg.includes('invalid')) {
            await handleAuthError();
          } else {
            setAuthLoading(false);
          }
          return;
        }

        setSession(session);
        if (session) {
          fetchProfile(session.user.id, session.user.email);
        } else {
          setAuthLoading(false);
        }
      } catch (err: any) {
        console.error('Falha no carregamento da autenticação:', err);
        const msg = err?.message?.toLowerCase() || '';
        if (msg.includes('refresh token') || msg.includes('not found') || msg.includes('invalid')) {
          await handleAuthError();
        } else {
          setAuthLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUserProfile(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setLoginError(err.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    const formData = new FormData(e.currentTarget);
    const nome = formData.get('nome') as string;
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const cpf = formData.get('cpf') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setLoginError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: nome,
            username: username,
            cpf: cpf
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      if (user) {
        // O fetchProfile será chamado automaticamente pelo useEffect onAuthStateChange
        setLoginError('Cadastro realizado! Se o e-mail não estiver confirmado, verifique sua caixa de entrada.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      if (!session?.user || !userProfile) return;

      let imQuery = supabase.from('imoveis').select('*').or('arquivado.eq.false,arquivado.is.null').order('created_at', { ascending: false }).limit(200);
      let inQuery = supabase.from('inquilinos').select('*').or('arquivado.eq.false,arquivado.is.null').order('created_at', { ascending: false }).limit(200);
      let prQuery = supabase.from('proprietarios').select('*').or('arquivado.eq.false,arquivado.is.null').order('created_at', { ascending: false }).limit(200);
      let coQuery = supabase.from('contratos').select(`
        *, 
        imoveis(endereco, apelido, cidade, estado, numero, complemento, cep, bairro), 
        inquilinos(nome, cpf_cnpj, email),
        proprietarios(nome, cpf_cnpj)
      `).or('arquivado.eq.false,arquivado.is.null').order('created_at', { ascending: false }).limit(200);
      
      let paQuery = supabase.from('pagamentos').select(`
        *, 
        contratos(
          *, 
          imoveis(endereco, apelido, cidade, estado, numero, complemento, cep, bairro), 
          inquilinos(nome, cpf_cnpj, email),
          proprietarios(nome, cpf_cnpj)
        )
      `).order('created_at', { ascending: false }).limit(500);

      // Filtro para Proprietário: Vê apenas o que lhe pertence
      if (userProfile.role === 'PROPRIETARIO' && userProfile.proprietario_id) {
        // Obter ids de imóveis do proprietário para filtrar pagamentos indiretamente se necessário
        imQuery = imQuery.eq('proprietario_id', userProfile.proprietario_id);
        coQuery = coQuery.eq('proprietario_id', userProfile.proprietario_id);
        prQuery = prQuery.eq('id', userProfile.proprietario_id);
        inQuery = inQuery.eq('proprietario_id', userProfile.proprietario_id);
        
        // Pagamentos: Para filtrar por proprietário_id dentro do objeto relacionado 'contratos'
        paQuery = paQuery.not('contratos', 'is', null).filter('contratos.proprietario_id', 'eq', userProfile.proprietario_id);
      }

      const tpQuery = supabase.from('contract_templates').select('*').order('created_at', { ascending: true });

      const [imRes, inRes, prRes, coRes, paRes, logRes, tpRes] = await Promise.all([
        imQuery,
        inQuery,
        prQuery,
        coQuery,
        paQuery,
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50),
        tpQuery
      ]);
      
      setLogs(logRes.data || []);

      setImoveis(imRes.data || []);
      
      setInquilinos(inRes.data || []);
      
      setProprietarios(prRes.data || []);
      setContratos(coRes.data || []);
      setPagamentos(paRes.data || []);

      // Migração e carregamento de templates do banco
      const localSaved = localStorage.getItem('contratos_templates');
      let localTemplates: any[] = [];
      try {
        if (localSaved) localTemplates = JSON.parse(localSaved);
      } catch(e) {}
      
      const hasRealLocalTemplates = localTemplates.length > 1 || (localTemplates.length === 1 && localTemplates[0].name !== 'Residencial Padrão');

      if (tpRes.data && tpRes.data.length > 0) {
        if (hasRealLocalTemplates) {
          // Merge: Apenas mantém o local ativo para ser "synced" para cima pelo useEffect
          // Isso evita perder o localStorage se o banco tiver apenas o padrão
          const dbHasReal = tpRes.data.length > 1 || (tpRes.data.length === 1 && tpRes.data[0].name !== 'Residencial Padrão');
          if (!dbHasReal) {
             // Deixe o frontend usar o local, o effect vai sobrescrever o DB
          } else {
             // Ambos tem templates reais? Idealmente mesclamos, mas para evitar complexidade,
             // vamos carregar o banco.
             setContractTemplates(tpRes.data.map((t: any) => ({
                id: t.id,
                name: t.name,
                content: t.content,
                fontSize: t.font_size,
                fontColor: t.font_color,
                bold: t.bold,
                alignment: t.alignment
              })));
          }
        } else {
          setContractTemplates(tpRes.data.map((t: any) => ({
            id: t.id,
            name: t.name,
            content: t.content,
            fontSize: t.font_size,
            fontColor: t.font_color,
            bold: t.bold,
            alignment: t.alignment
          })));
        }
      } else {
        // Se estiver vazio no banco, tentar salvar do localStorage para o Supabase e na memória
        if (localTemplates.length > 0) {
          try {
            const toInsert = localTemplates.map(t => ({
              id: t.id || crypto.randomUUID(),
              name: t.name || 'Modelo Migrado',
              content: t.content || '',
              font_size: t.fontSize || 12,
              font_color: t.fontColor || '#000000',
              bold: t.bold || false,
              alignment: t.alignment || 'justify',
              user_id: session.user.id
            }));
            const { data: insertedValues } = await supabase.from('contract_templates').insert(toInsert).select();
            if (insertedValues) {
              setContractTemplates(insertedValues.map((t: any) => ({
                id: t.id,
                name: t.name,
                content: t.content,
                fontSize: t.font_size,
                fontColor: t.font_color,
                bold: t.bold,
                alignment: t.alignment
              })));
            }
          } catch(e) {
            console.error("Erro ao migrar templates do localStorage", e);
          }
        } else {
          // Caso final: Tudo vazio, usar o padrão
          setContractTemplates([{ 
            name: 'Residencial Padrão', 
            content: `CONTRATO DE LOCAÇÃO RESIDENCIAL\n\nLOCADOR: [DADOS DO PROPRIETÁRIO]\nLOCATÁRIO: {{inquilino}}, CPF: {{cpf}}\n\nOBJETO: O imóvel localizado em {{imovel}}.\n\nCLÁUSULA PRIMEIRA - DO VALOR: O aluguel mensal é de R$ {{valor}}.\n\nCLÁUSULA SEGUNDA - DO PRAZO: O contrato tem início em {{data_inicio}} e término em {{data_fim}}.\n\n[RESTANTE DAS CLÁUSULAS PADRÃO...]`,
            fontSize: 12,
            fontColor: '#000000',
            bold: false,
            alignment: 'justify'
          }]);
        }
      }

      if (userProfile.role === 'ADMIN') {
        const { data: perfisData } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
        setPerfis(perfisData || []);
      }

      // Se já carregamos arquivados antes, talvez devamos atualizar o cache se necessário, 
      // mas por enquanto vamos apenas garantir que a lista principal esteja limpa de arquivados.
      
      // Filter notifications
      const threshold = new Date();
      threshold.setDate(threshold.getDate() + notificationDays);
      
      const contracts = (coRes.data as Contrato[] || []).filter(c => !c.arquivado);
      
      // 1. Contract Expirations
      const expirations = contracts.filter(c => {
        const endDate = new Date(c.data_fim + 'T00:00:00');
        return endDate <= threshold && endDate >= new Date();
      });

      // 2. Upcoming Rent Payments
      // This logic will notify payments due in the next few days
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth(); // 0-indexed
      const today = new Date().getDate();

      const rentAlerts = contracts.filter(c => {
        if (!c.dia_vencimento) return false;
        
        // Calculate due date for current month
        let dueDate = new Date(currentYear, currentMonth, c.dia_vencimento);
        
        // If due date has passed this month, check next month
        if (dueDate < new Date()) {
          dueDate = new Date(currentYear, currentMonth + 1, c.dia_vencimento);
        }

        const daysDiff = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff <= 7; // Notificar apenas se faltar 7 dias ou menos
      });

      // 3. Overdue Payments
      const overdues = contracts.filter(c => {
        if (!c.dia_vencimento) return false;
        
        const dueDate = new Date(currentYear, currentMonth, c.dia_vencimento);
        
        // Se já passou da data de vencimento este mês
        if (new Date() > dueDate) {
          const hasPayment = (paRes.data || []).some((p: any) => 
            p.contrato_id === c.id && 
            p.competencia_mes === (currentMonth + 1) && 
            p.competencia_ano === currentYear
          );
          return !hasPayment;
        }
        return false;
      });
      
      // Combine (avoiding duplicates if it matches both)
      const combinedAlerts = [...expirations];
      
      rentAlerts.forEach(r => {
        if (!combinedAlerts.some(a => a.id === r.id)) {
          combinedAlerts.push(r);
        }
      });

      overdues.forEach(o => {
        if (!combinedAlerts.some(a => a.id === o.id)) {
          combinedAlerts.push(o);
        }
      });

      setNotifications(combinedAlerts);
      setTemplatesLoaded(true);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  }, [session, userProfile, notificationDays, setImoveis, setInquilinos, setProprietarios, setContratos, setPagamentos, setLogs, setNotifications, setTemplatesLoaded]);

  const fetchArchivedData = useCallback(async (force = false) => {
    if (!force && (archivedLoaded || archivedLoading)) return;
    
    setArchivedLoading(true);
    try {
      if (!session?.user || !userProfile) return;

      let imQuery = supabase.from('imoveis').select('*').eq('arquivado', true).order('created_at', { ascending: false });
      let inQuery = supabase.from('inquilinos').select('*').eq('arquivado', true).order('created_at', { ascending: false });
      let prQuery = supabase.from('proprietarios').select('*').eq('arquivado', true).order('created_at', { ascending: false });
      let coQuery = supabase.from('contratos').select(`
        *, 
        imoveis(endereco, apelido, cidade, estado, numero, cep, bairro), 
        inquilinos(nome, cpf_cnpj, email),
        proprietarios(nome, cpf_cnpj)
      `).eq('arquivado', true).order('created_at', { ascending: false });

      if (userProfile.role === 'PROPRIETARIO' && userProfile.proprietario_id) {
        imQuery = imQuery.eq('proprietario_id', userProfile.proprietario_id);
        coQuery = coQuery.eq('proprietario_id', userProfile.proprietario_id);
        prQuery = prQuery.eq('id', userProfile.proprietario_id);
      }

      const [imRes, inRes, prRes, coRes] = await Promise.all([
        imQuery,
        inQuery,
        prQuery,
        coQuery
      ]);

      setArchivedImoveis(imRes.data || []);
      setArchivedInquilinos(inRes.data || []);
      setArchivedProprietarios(prRes.data || []);
      setArchivedContratos(coRes.data || []);
      setArchivedLoaded(true);
    } catch (err) {
      console.error("Erro ao buscar arquivados:", err);
    } finally {
      setArchivedLoading(false);
    }
  }, [session, userProfile, archivedLoaded, archivedLoading]);

  const handleSendEmailNotification = async (contrato: Contrato, type: 'VENCIMENTO' | 'ATRASO', nextDueDate?: Date) => {
    if (!contrato.inquilinos?.email) {
      alert('Este inquilino não possui e-mail cadastrado ou o cadastro está incompleto.');
      return;
    }

    const email = contrato.inquilinos.email;
    const nomeInquilino = contrato.inquilinos.nome;
    const enderecoImovel = contrato.imoveis?.endereco || 'Imóvel locado';
    
    let subject = '';
    let body = '';

    if (type === 'VENCIMENTO') {
      subject = `AVISO: Vencimento de Contrato de Locação - ${enderecoImovel}`;
      const dataFim = new Date(contrato.data_fim + 'T00:00:00').toLocaleDateString('pt-BR');
      body = `Olá, ${nomeInquilino}.\n\nGostaríamos de informar que seu contrato de locação do imóvel em ${enderecoImovel} está próximo do vencimento em ${dataFim}.\n\nPor favor, entre em contato conosco para discutirmos a renovação ou os próximos passos.\n\nAtenciosamente,\nGestão Imobiliária`;
    } else {
      subject = `AVISO: Pendência Financeira / Aluguel em Aberto - ${enderecoImovel}`;
      const dataVenc = nextDueDate ? nextDueDate.toLocaleDateString('pt-BR') : `dia ${contrato.dia_vencimento}`;
      body = `Olá, ${nomeInquilino}.\n\nIdentificamos que o pagamento do aluguel referente ao imóvel em ${enderecoImovel}, com vencimento em ${dataVenc}, ainda não consta em nosso sistema.\n\nCaso o pagamento já tenha sido realizado, por favor desconsidere este e-mail e nos envie o comprovante para regularização.\n\nAtenciosamente,\nGestão Imobiliária`;
    }

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');

    // Registrar no log
    await recordLog('NOTIFICAÇÃO', 'contratos', contrato.id, { tipo: type, email_enviado: email });
  };

  useEffect(() => {
    const loadData = async () => {
      if (session && userProfile) {
        await fetchData();
        // Log de acesso
        if (session.user.id) {
           recordLog('ACESSO', 'sessão', session.user.id, { email: session.user.email });
        }
      }
    };
    loadData();
  }, [session, userProfile, fetchData, recordLog]);

  const [loadingCep, setLoadingCep] = useState(false);

  const openCreateModal = (item: any = null) => {
    setEditingItem(item);
    setErrorMsg(null);
    setFormErrors({});
    setSuccess(false);
    setLoading(false);
    setFilesToUpload([]);
    setGuarantorFilesToUpload([]);
    setContractFileToUpload(null);
    setContractFileUrl(item?.arquivo_url || null);
    setExistingDocs(item?.documentos || []);
    setExistingGuarantorDocs(item?.documentos_fiador || []);
    setClausulasHtml(item?.clausulas || '');
    setContractAlignment(item?.alinhamento_texto || 'justify');
    setCreateModalOpen(true);
  };

  const formatCpfCnpj = (value: string) => {
    const clean = value.replace(/\D/g, '');
    if (clean.length <= 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").substring(0, 14);
    }
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5").substring(0, 18);
  };

  const formatPhone = (value: string) => {
    const clean = value.replace(/\D/g, '');
    if (clean.length <= 10) {
      return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3").substring(0, 14);
    }
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3").substring(0, 15);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpfCnpj(e.target.value);
    e.target.value = formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    e.target.value = formatted;
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value;
    if (!startDate) return;

    const date = new Date(startDate + 'T00:00:00');
    date.setFullYear(date.getFullYear() + 1);
    
    // Format to yyyy-mm-dd
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    const endDate = `${year}-${month}-${day}`;
    
    // Find the end date input in the form
    const form = e.target.form;
    if (form) {
      const endDateInput = form.elements.namedItem('data_fim') as HTMLInputElement;
      if (endDateInput) {
        endDateInput.value = endDate;
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const handleToggleArchive = async (item: any, type: string) => {
    const isArchiving = !item.arquivado;
    const confirmMsg = isArchiving 
      ? `Tem certeza que deseja ARQUIVAR este registro? Ele deixará de aparecer na lista principal.`
      : `Deseja RESTAURAR este registro?`;

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from(type)
        .update({ arquivado: isArchiving })
        .eq('id', item.id);
 
      if (error) {
        if (error.code === '42703') {
           throw new Error('A coluna "arquivado" não existe no banco de dados. Por favor, execute o script de migração no painel do Supabase.');
        }
        throw error;
      }
      
      await recordLog(isArchiving ? 'ARQUIVAR' : 'RESTAURAR', type, item.id, { 
        identificador: item.nome || item.endereco || item.apelido || item.id 
      });
      
      setArchivedLoaded(false);
      setSuccess(true);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setTimeout(() => setSuccess(false), 2000);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      let imovelIdToRelease = null;
      
      // Cascading delete for contracts
      if (itemToDelete.type === 'contratos') {
        const contract = contratos.find(c => c.id === itemToDelete.id);
        if (contract) {
          imovelIdToRelease = contract.imovel_id;
          
          // First, delete all payments associated with this contract
          const { error: prepayError } = await supabase
            .from('pagamentos')
            .delete()
            .eq('contrato_id', itemToDelete.id);
            
          if (prepayError) throw prepayError;
        }
      }

      const { error } = await supabase.from(itemToDelete.type).delete().eq('id', itemToDelete.id);
      
      if (error) {
        if (error.code === '23503') {
          // Identify relation
          let relation = 'registros vinculados';
          if (itemToDelete.type === 'imoveis') relation = 'contratos ativos ou histórico';
          if (itemToDelete.type === 'inquilinos') relation = 'contratos ativos';
          if (itemToDelete.type === 'proprietarios') relation = 'imóveis ou contratos';
          
          throw new Error(`Não é possível excluir este registro pois existem ${relation}. Exclua primeiro os dados dependentes.`);
        }
        throw error;
      }

      await recordLog('EXCLUIR', itemToDelete.type, itemToDelete.id);
      
      if (imovelIdToRelease) {
        await supabase.from('imoveis').update({ status: 'Disponível' }).eq('id', imovelIdToRelease);
      }

      setSuccess(true);
      setItemToDelete(null);
      setDeleteConfirmationInput('');
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao excluir registro. Verifique vínculos ativos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const generateContractPayments = async (contract: any, startDateStr: string, endDateStr: string, rentValue: number, dueDay: number) => {
    if (!contract || !session?.user || !contract.id) {
      console.warn("generateContractPayments: Dados insuficientes", { contract, session });
      return false;
    }
    
    try {
      // Ajuste de fuso horário para garantir que a data seja interpretada corretamente
      const startDate = new Date(startDateStr + 'T12:00:00');
      const endDate = new Date(endDateStr + 'T12:00:00');
      
      const parcelas = [];
      let currentDate = new Date(startDate);
      
      // Limitar a 120 parcelas (10 anos)
      let safetyCounter = 0;
      while (currentDate <= endDate && safetyCounter < 120) {
        safetyCounter++;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        
        // Calcular dia de vencimento real para o mês
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        const actualDueDay = Math.min(dueDay || 5, lastDayOfMonth);
        const dueDate = new Date(year, month - 1, actualDueDay);
        
        parcelas.push({
          contrato_id: contract.id,
          valor_esperado: rentValue,
          data_vencimento: dueDate.toISOString().split('T')[0],
          competencia_mes: month,
          competencia_ano: year,
          status: 'Pendente',
          user_id: session.user.id
        });
        
        // Mover para o próximo mês
        currentDate.setMonth(currentDate.getMonth() + 1);
        // Garantir que estamos no início/meio do mês para evitar saltos de data
        currentDate.setDate(1); 
      }
      
      if (parcelas.length > 0) {
        console.log(`Gerando ${parcelas.length} parcelas para o contrato ${contract.id}`);
        const { error: pErr } = await supabase.from('pagamentos').insert(parcelas);
        if (pErr) {
          console.error("Erro ao inserir parcelas:", pErr);
          return false;
        }
        return true;
      }
    } catch (err) {
      console.error("Erro crítico na geração de parcelas:", err);
      return false;
    }
    return false;
  };

  const handleRenewContract = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contractToRenew) return;

    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const newDataFim = formData.get('nova_data_fim') as string;
    const novoValorAluguel = parseFloat(formData.get('novo_valor_aluguel') as string || (contractToRenew.valor_aluguel || 0).toString());

    try {
      const { error } = await supabase
        .from('contratos')
        .update({
          data_fim: newDataFim,
          valor_aluguel: novoValorAluguel,
          renovacoes_count: (contractToRenew.renovacoes_count || 0) + 1,
          status: 'ativo'
        })
        .eq('id', contractToRenew.id);

      if (error) throw error;

      // Gerar novas parcelas para o período da renovação
      // Inicia um dia após o fim do contrato anterior
      let startOfRenewalStr = '';
      try {
        const prevDataFim = new Date(contractToRenew.data_fim + 'T12:00:00');
        const startOfRenewal = new Date(prevDataFim);
        startOfRenewal.setDate(startOfRenewal.getDate() + 1);
        startOfRenewalStr = startOfRenewal.toISOString().split('T')[0];
      } catch (dateErr) {
        console.error("Erro ao calcular data de renovação:", dateErr);
        startOfRenewalStr = newDataFim; // fallback seguro
      }
      
      await generateContractPayments(
        contractToRenew, 
        startOfRenewalStr, 
        newDataFim, 
        novoValorAluguel, 
        contractToRenew.dia_vencimento || 10
      );

      await recordLog('RENOVAR', 'contratos', contractToRenew.id, { 
        data_anterior: contractToRenew.data_fim, 
        nova_data: newDataFim,
        novo_valor: novoValorAluguel
      });

      setSuccess(true);
      setIsRenewModalOpen(false);
      setContractToRenew(null);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao renovar contrato.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishContract = async (contract: Contrato) => {
    try {
      const inquilinoNome = contract.inquilinos?.nome || 'este inquilino';
      const resp = confirm(`Tem certeza que deseja FINALIZAR o contrato de ${inquilinoNome}? Esta ação liberará o imóvel.`);
      if (!resp) return;

      setLoading(true);
      setErrorMsg(null);

      // 1. Atualizar status do contrato
      const { error: coError } = await supabase
        .from('contratos')
        .update({ status: 'finalizado' })
        .eq('id', contract.id);

      if (coError) {
        console.error('Erro ao finalizar contrato (update):', coError);
        throw coError;
      }

      // 2. Liberar o imóvel
      if (contract.imovel_id) {
        const { error: imError } = await supabase
          .from('imoveis')
          .update({ status: 'Disponível' })
          .eq('id', contract.imovel_id);
        
        if (imError) console.warn('Erro ao liberar imóvel (não crítico):', imError);
      }

      await recordLog('FINALIZAR', 'contratos', contract.id, { 
        inquilino: inquilinoNome,
        imovel: contract.imoveis?.apelido || contract.imoveis?.endereco || 'Desconhecido'
      });

      setSuccess(true);
      await fetchData();
      alert('Contrato finalizado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao finalizar contrato:', err);
      const msg = err.message || 'Erro inesperado';
      setErrorMsg(msg);
      alert('Erro ao finalizar contrato: ' + msg + '\nVerifique se o banco de dados está atualizado (SQL rodado?).');
    } finally {
      setLoading(false);
    }
  };

  const generateReceiptPDF = () => {
    const doc = new jsPDF();
    
    const drawReceipt = (yOffset: number, label: string) => {
      // Label da Via
      doc.setTextColor(203, 213, 225); // slate-300
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(label, 190, yOffset + 10, { align: "right" });

      // Estilos Básicos
      doc.setTextColor(30, 41, 59); // slate-800
      
      // Cabeçalho
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("RECIBO", 20, yOffset + 30);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Nº 0001/${new Date().getFullYear()}`, 20, yOffset + 37);
      
      // Box de Valor
      doc.setDrawColor(241, 245, 249); // slate-100
      doc.setFillColor(248, 250, 252); // slate-50
      doc.roundedRect(140, yOffset + 20, 50, 20, 3, 3, "FD");
      
      doc.setTextColor(37, 99, 235); // blue-600
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(formatarMoeda(receiptData.valor), 165, yOffset + 33, { align: "center" });
      
      // Linha divisória
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(20, yOffset + 50, 190, yOffset + 50);
      
      // Corpo do Recibo
      doc.setTextColor(51, 65, 85); // slate-700
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      
      const marginX = 20;
      let currentY = yOffset + 58;
      
      doc.text("Recebemos de:", marginX, currentY);
      doc.setFont("helvetica", "bold");
      doc.text(String(receiptData.inquilino || ""), marginX + 28, currentY);
      
      currentY += 6;
      doc.setFont("helvetica", "normal");
      doc.text("Inscrito sob o CPF/CNPJ:", marginX, currentY);
      doc.setFont("helvetica", "bold");
      doc.text(String(receiptData.cpf || ""), marginX + 42, currentY);
      
      currentY += 9;
      doc.setFont("helvetica", "normal");
      doc.text("A importância de:", marginX, currentY);
      currentY += 4.5;
      doc.setFont("helvetica", "bold");
      const extenso = numeroParaExtenso(receiptData.valor);
      const splitExtenso = doc.splitTextToSize(extenso, 160);
      doc.text(splitExtenso, marginX, currentY);
      
      currentY += splitExtenso.length * 4.5 + 5;
      doc.setFont("helvetica", "normal");
      doc.text("Referente ao pagamento do aluguel do imóvel situado em:", marginX, currentY);
      currentY += 4.5;
      doc.setFont("helvetica", "bold");
      const fullAddress = `${receiptData.endereco}, ${receiptData.numero}${receiptData.complemento ? ` - ${receiptData.complemento}` : ''} - ${receiptData.bairro}, ${receiptData.cidade} - ${receiptData.estado}, CEP: ${receiptData.cep}`;
      const splitEndereco = doc.splitTextToSize(fullAddress, 160);
      doc.text(splitEndereco, marginX, currentY);
      
      currentY += splitEndereco.length * 4.5 + 5;
      doc.setFont("helvetica", "normal");
      doc.text("Competência:", marginX, currentY);
      doc.setFont("helvetica", "bold");
      doc.text(String(receiptData.competencia || ""), marginX + 22, currentY);
      
      // Rodapé e Assinatura
      currentY += 10;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7.5);
      doc.text("Local/Data: ___________________________, ____ de ________________ de 20____", 105, currentY, { align: "center" });
      
      currentY += 12;
      doc.setDrawColor(30, 41, 59);
      doc.line(60, currentY, 150, currentY);
      
      currentY += 4;
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.text(String(receiptData.locador || ""), 105, currentY, { align: "center" });
      
      currentY += 3.5;
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`Locador - ${receiptData.locador_cpf || ""}`, 105, currentY, { align: "center" });
    };

    // Desenha as duas vias
    drawReceipt(5, "1ª VIA - LOCADOR");
    
    // Linha de corte
    doc.setLineDashPattern([2, 1], 0);
    doc.setDrawColor(203, 213, 225);
    doc.line(5, 148.5, 205, 148.5);
    doc.setLineDashPattern([], 0);

    drawReceipt(155, "2ª VIA - INQUILINO");
    
    doc.save(`Recibo_${(receiptData.inquilino || "inquilino").replace(/\s+/g, '_')}_${(receiptData.competencia || "competencia").replace('/', '-')}.pdf`);
  };

  const generateContractTemplate = (form: HTMLFormElement, templateContent?: string) => {
    const rawData = Object.fromEntries(new FormData(form).entries());
    const imovel = imoveis.find(i => i.id === rawData.imovel_id);
    const inquilino = inquilinos.find(i => i.id === rawData.inquilino_id);
    const valorNum = parseFloat(rawData.valor_aluguel as string || '0');
    const valor = formatarMoeda(valorNum);
    const inicio = rawData.data_inicio ? new Date(rawData.data_inicio as string + 'T00:00:00') : null;
    const fim = rawData.data_fim ? new Date(rawData.data_fim as string + 'T00:00:00') : null;
    const proprietario = proprietarios.find(p => p.id === imovel?.proprietario_id) || proprietarios.find(p => p.id === rawData.proprietario_id);

    // Use selected template index if no content provided
    const content = templateContent || contractTemplates[selectedTemplateIdx]?.content || '';

    let template = content;
    if (!template) return;

    // Helper para formatar data br
    const fmtData = (d: Date | null) => d ? d.toLocaleDateString('pt-BR') : '[DATA]';
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    // Mapeamento exaustivo de tags
    const tagsMap: Record<string, string> = {
      // Locatário (Inquilino)
      '{{inquilino}}': inquilino?.nome || '[NOME]',
      '{{inquilino_nome}}': inquilino?.nome || '[NOME]',
      '{{locatario_nome}}': inquilino?.nome || '[NOME]',
      '{{cpf}}': inquilino?.cpf_cnpj || '[CPF]',
      '{{inquilino_cpf}}': inquilino?.cpf_cnpj || '[CPF]',
      '{{inquilino_cpf_cnpj}}': inquilino?.cpf_cnpj || '[CPF]',
      '{{locatario_cpf_cnpj}}': inquilino?.cpf_cnpj || '[CPF]',
      '{{inquilino_rg}}': inquilino?.rg || '[RG]',
      '{{locatario_rg}}': inquilino?.rg || '[RG]',
      '{{inquilino_telefone}}': inquilino?.telefone || '[TELEFONE]',
      '{{locatario_telefone}}': inquilino?.telefone || '[TELEFONE]',
      '{{inquilino_email}}': inquilino?.email || '[EMAIL]',
      '{{locatario_email}}': inquilino?.email || '[EMAIL]',
      '{{inquilino_estado_civil}}': inquilino?.estado_civil || '[ESTADO CIVIL]',
      '{{locatario_estado_civil}}': inquilino?.estado_civil || '[ESTADO CIVIL]',
      '{{inquilino_profissao}}': inquilino?.profissao || '[PROFISSÃO]',
      '{{locatario_profissao}}': inquilino?.profissao || '[PROFISSÃO]',
      '{{inquilino_nacionalidade}}': inquilino?.nacionalidade || '[NACIONALIDADE]',
      '{{locatario_nacionalidade}}': inquilino?.nacionalidade || '[NACIONALIDADE]',
      '{{inquilino_naturalidade}}': inquilino?.naturalidade || '[NATURALIDADE]',
      '{{locatario_naturalidade}}': inquilino?.naturalidade || '[NATURALIDADE]',
      '{{inquilino_uf_nasc}}': inquilino?.uf_nascimento || '[UF NASC]',
      '{{locatario_uf_nasc}}': inquilino?.uf_nascimento || '[UF NASC]',

      // Fiador
      '{{fiador_nome}}': inquilino?.nome_fiador || '[NOME FIADOR]',
      '{{fiador_cpf}}': inquilino?.cpf_fiador || '[CPF FIADOR]',
      '{{fiador_rg}}': inquilino?.rg_fiador || '[RG FIADOR]',
      '{{fiador_endereco}}': inquilino?.endereco_fiador || '[ENDEREÇO FIADOR]',
      '{{fiador_cep}}': '[CEP FIADOR]', // Not explicitly in interface but added for completeness

      // Imóvel
      '{{imovel}}': imovel?.endereco ? `${imovel.endereco}, ${imovel.numero}` : '[ENDEREÇO]',
      '{{imovel_endereco}}': imovel?.endereco || '[ENDEREÇO]',
      '{{imovel_numero}}': imovel?.numero || '[NÚMERO]',
      '{{imovel_bairro}}': imovel?.bairro || '[BAIRRO]',
      '{{imovel_cidade}}': imovel?.cidade || '[CIDADE]',
      '{{imovel_estado}}': imovel?.estado || '[ESTADO]',
      '{{imovel_uf}}': imovel?.estado || '[UF]',
      '{{imovel_cep}}': imovel?.cep || '[CEP]',
      '{{imovel_tipo}}': imovel?.tipo_imovel || '[TIPO]',
      '{{imovel_cemig}}': imovel?.cemig || '[INSTALACAO CEMIG]',
      '{{imovel_copasa}}': imovel?.copasa || '[MATRICULA COPASA]',
      '{{imovel_apelido}}': imovel?.apelido || '[APELIDO]',
      '{{imovel_obs}}': imovel?.descricao || '[OBSERVAÇÕES]',

      // Locador (Proprietário)
      '{{proprietario_nome}}': proprietario?.nome || '[NOME PROPRIETÁRIO]',
      '{{locador_nome}}': proprietario?.nome || '[NOME LOCADOR]',
      '{{proprietario_cpf}}': proprietario?.cpf_cnpj || '[CPF PROPRIETÁRIO]',
      '{{locador_cpf_cnpj}}': proprietario?.cpf_cnpj || '[CPF LOCADOR]',
      '{{proprietario_rg}}': proprietario?.rg || '[RG PROPRIETÁRIO]',
      '{{locador_rg}}': proprietario?.rg || '[RG LOCADOR]',
      '{{proprietario_telefone}}': proprietario?.telefone || '[TEL PROPRIETÁRIO]',
      '{{locador_telefone}}': proprietario?.telefone || '[TEL LOCADOR]',
      '{{proprietario_email}}': proprietario?.email || '[EMAIL PROPRIETÁRIO]',
      '{{locador_email}}': proprietario?.email || '[EMAIL LOCADOR]',
      '{{proprietario_endereco}}': proprietario?.endereco || '[ENDEREÇO PROPRIETÁRIO]',
      '{{locador_endereco}}': proprietario?.endereco || '[ENDEREÇO LOCADOR]',
      '{{proprietario_bairro}}': proprietario?.bairro || '[BAIRRO PROPRIETÁRIO]',
      '{{locador_bairro}}': proprietario?.bairro || '[BAIRRO LOCADOR]',
      '{{proprietario_cidade}}': proprietario?.cidade || '[CIDADE PROPRIETÁRIO]',
      '{{locador_cidade}}': proprietario?.cidade || '[CIDADE LOCADOR]',
      '{{proprietario_estado}}': proprietario?.estado || '[ESTADO PROPRIETÁRIO]',
      '{{locador_uf}}': proprietario?.estado || '[UF LOCADOR]',
      '{{locador_estado_civil}}': proprietario?.estado_civil || '[ESTADO CIVIL LOCADOR]',

      // Contrato
      '{{valor}}': valor,
      '{{valor_aluguel}}': valor,
      '{{valor_total}}': valor,
      '{{valor_numerico}}': valorNum.toFixed(2),
      '{{valor_extenso}}': numeroParaExtenso(valorNum),
      '{{data_vencimento}}': rawData.dia_vencimento ? `dia ${rawData.dia_vencimento}` : '[DIA]',
      '{{dia_vencimento}}': rawData.dia_vencimento as string || '[DIA]',
      '{{data_inicio}}': fmtData(inicio),
      '{{data_fim}}': fmtData(fim),
      '{{foro}}': imovel?.cidade || '[CIDADE FORO]',
      '{{condicoes_pagamento}}': 'Mensal via boleto/transferência bancária',
      '{{data_hoje}}': dataHoje,
      '{{testemunha_1}}': '_________________________________',
      '{{testemunha_2}}': '_________________________________'
    };

    // Aplica as substituições
    let processedTemplate = template;
    Object.entries(tagsMap).forEach(([tag, value]) => {
      const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      processedTemplate = processedTemplate.replace(new RegExp(escapedTag, 'g'), value);
    });

    const clausulasInput = form.elements.namedItem('clausulas') as HTMLTextAreaElement;
    if (clausulasInput) {
      clausulasInput.value = processedTemplate;
      setClausulasHtml(processedTemplate);
      
      // Update global alignment from template if defined
      const currentTemplate = contractTemplates[selectedTemplateIdx];
      if (currentTemplate?.alignment) {
        setContractAlignment(currentTemplate.alignment);
      }
    }
  };

  const validarCpfCnpj = (val: string) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length === 11) {
      // Simplificado:penas checagem de tamanho básico e dígitos repetidos comuns
      if (/^(\d)\1+$/.test(clean)) return false;
      let sum = 0;
      let rest;
      for (let i = 1; i <= 9; i++) sum = sum + parseInt(clean.substring(i - 1, i)) * (11 - i);
      rest = (sum * 10) % 11;
      if ((rest === 10) || (rest === 11)) rest = 0;
      if (rest !== parseInt(clean.substring(9, 10))) return false;
      sum = 0;
      for (let i = 1; i <= 10; i++) sum = sum + parseInt(clean.substring(i - 1, i)) * (12 - i);
      rest = (sum * 10) % 11;
      if ((rest === 10) || (rest === 11)) rest = 0;
      if (rest !== parseInt(clean.substring(10, 11))) return false;
      return true;
    } else if (clean.length === 14) {
      // Simplificado CNPJ
      if (/^(\d)\1+$/.test(clean)) return false;
      let size = clean.length - 2;
      let numbers = clean.substring(0, size);
      const digits = clean.substring(size);
      let sum = 0;
      let pos = size - 7;
      for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
      if (result !== parseInt(digits.charAt(0))) return false;
      size = size + 1;
      numbers = clean.substring(0, size);
      sum = 0;
      pos = size - 7;
      for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
      if (result !== parseInt(digits.charAt(1))) return false;
      return true;
    }
    return false;
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    let clean = phone.replace(/\D/g, '');
    // If it starts with 0 and has 12 digits, it's likely a 0DD+9 digits or 0DD+8 digits
    if (clean.length === 12 && clean.startsWith('0')) {
      clean = clean.substring(1);
    }
    return clean.length >= 10 && clean.length <= 11;
  };

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, required } = e.target;
    let error = '';

    if (required && !value.trim()) {
      error = 'Campo obrigatório';
    } else if (value.trim()) {
      if (name === 'email' && !validateEmail(value)) {
        error = 'E-mail inválido';
      } else if (name === 'telefone' && !validatePhone(value)) {
        error = 'Telefone inválido';
      } else if ((name === 'cpf_cnpj' || name === 'cpf_fiador') && !validarCpfCnpj(value)) {
        error = 'Documento inválido';
      }
    }

    setFormErrors(prev => {
      const next = { ...prev };
      if (error) {
        next[name] = error;
      } else {
        delete next[name];
      }
      return next;
    });

    if (error) {
      e.target.classList.add('border-red-400');
      e.target.classList.remove('focus:border-blue-400');
    } else {
      e.target.classList.remove('border-red-400');
      e.target.classList.add('focus:border-blue-400');
    }
  };

  const handleCpfBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleFieldBlur(e);
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const cep = value.replace(/\D/g, '');
    
    // Clear previous errors for this field
    setFormErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });

    if (!cep) return;

    if (cep.length !== 8) {
      setFormErrors(prev => ({ ...prev, [name]: 'CEP deve ter 8 dígitos' }));
      return;
    }

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error('Falha na conexão com serviço de CEP');
      
      const data = await response.json();
      
      if (data.erro) {
        setFormErrors(prev => ({ ...prev, [name]: 'CEP não localizado' }));
      } else {
        const form = e.target.form;
        if (form) {
          if (name === 'cep_fiador') {
            const fiadorAddress = form.elements.namedItem('endereco_fiador') as HTMLInputElement;
            if (fiadorAddress) {
              fiadorAddress.value = `${data.logradouro}${data.bairro ? `, ${data.bairro}` : ''}, ${data.localidade} - ${data.uf}`;
              // Trigger change for validation if needed
              fiadorAddress.dispatchEvent(new Event('blur'));
            }
          } else {
            const fields = {
              endereco: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf
            };
            
            Object.entries(fields).forEach(([fieldName, fieldValue]) => {
              const field = form.elements.namedItem(fieldName) as HTMLInputElement;
              if (field && fieldValue) {
                field.value = fieldValue;
                field.dispatchEvent(new Event('blur'));
              }
            });
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
      setFormErrors(prev => ({ ...prev, [name]: 'Erro ao consultar CEP. Tente novamente.' }));
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCreateSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) {
      alert('Sua sessão expirou. Por favor, faça login novamente.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    // Final Validation Check
    const errors: {[key: string]: string} = {};
    const formElements = e.currentTarget.elements;

    for (let i = 0; i < formElements.length; i++) {
        const element = formElements[i] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (!element.name) continue;

        if (element.required && !element.value.trim()) {
            errors[element.name] = 'Campo obrigatório';
        } else if (element.value.trim()) {
            if (element.name === 'email' && !validateEmail(element.value)) {
                errors[element.name] = 'E-mail inválido';
            } else if (element.name === 'telefone' && !validatePhone(element.value)) {
                errors[element.name] = 'Telefone inválido';
            } else if ((element.name === 'cpf_cnpj' || element.name === 'cpf_fiador') && !validarCpfCnpj(element.value)) {
                errors[element.name] = 'Documento inválido';
            }
        }
    }

    if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setErrorMsg('Por favor, corrija os erros no formulário.');
        setLoading(false);
        return;
    }

    try {
        let dbError: any = null;
        let finalDocUrls = [...existingDocs];
        let finalContractUrl = contractFileUrl;

        const timestamp = Date.now();
        let finalGuarantorDocs = [...existingGuarantorDocs];

        // Handle main contract PDF upload
        if (contractFileToUpload) {
            const sanitizedOriginName = contractFileToUpload.name
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '_')
                .replace(/[()]/g, '');
            const fileName = `contrato_${timestamp}_${sanitizedOriginName}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('contratos')
                .upload(`files/${fileName}`, contractFileToUpload);
            
            if (uploadError) {
                throw uploadError;
            } else if (uploadData) {
                const { data: { publicUrl } } = supabase.storage.from('contratos').getPublicUrl(uploadData.path);
                finalContractUrl = publicUrl;
            }
        }

        // Handle generic File Uploads
        if (filesToUpload.length > 0) {
            const uploadPromises = filesToUpload.map(async (file) => {
                const sanitizedOriginName = file.name
                    .normalize('NFD') // Decompose special chars (e.g., Í -> I + accent)
                    .replace(/[\u0300-\u036f]/g, '') // Remove accents
                    .replace(/\s+/g, '_') // Spaces to underscores
                    .replace(/[()]/g, ''); // Remove parentheses
                const fileName = `${timestamp}_${sanitizedOriginName}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('contratos')
                    .upload(`documents/${fileName}`, file);
                
                if (uploadError) {
                    console.error('File upload error:', uploadError);
                    if (uploadError.message.includes('Bucket not found')) {
                        throw new Error('Erro: O bucket "contratos" não foi encontrado no Supabase Storage.');
                    }
                    throw uploadError;
                }
                
                if (uploadData) {
                    const { data: { publicUrl } } = supabase.storage.from('contratos').getPublicUrl(uploadData.path);
                    return publicUrl;
                }
                return null;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            finalDocUrls.push(...uploadedUrls.filter((url): url is string => url !== null));
        }

        // Handle Guarantor Documents Uploads
        if (guarantorFilesToUpload.length > 0) {
            const uploadPromises = guarantorFilesToUpload.map(async (file) => {
                const sanitizedOriginName = file.name
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, '_')
                    .replace(/[()]/g, '');
                const fileName = `fiador_${timestamp}_${sanitizedOriginName}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('contratos')
                    .upload(`fiadores/${fileName}`, file);
                
                if (uploadError) {
                    console.error('Guarantor file upload error:', uploadError);
                    throw uploadError;
                }
                
                if (uploadData) {
                    const { data: { publicUrl } } = supabase.storage.from('contratos').getPublicUrl(uploadData.path);
                    return publicUrl;
                }
                return null;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            finalGuarantorDocs.push(...uploadedUrls.filter((url): url is string => url !== null));
        }

      if (editingItem) {
        // Update logic
        if (activeTab === 'imoveis') {
          const payload = { 
            apelido: rawData.apelido,
            endereco: rawData.endereco,
            numero: rawData.numero,
            complemento: rawData.complemento,
            cep: rawData.cep,
            bairro: rawData.bairro,
            cidade: rawData.cidade,
            estado: rawData.estado,
            tipo_imovel: rawData.tipo_imovel,
            status: rawData.status,
            cemig: rawData.cemig,
            copasa: rawData.copasa,
            descricao: rawData.descricao
          };
          const { error: err } = await supabase.from('imoveis').update(payload).eq('id', editingItem.id);
          dbError = err;
        } else if (activeTab === 'inquilinos') {
          const payload: any = { 
            nome: rawData.nome,
            cpf_cnpj: rawData.cpf_cnpj || null,
            email: rawData.email || null,
            telefone: rawData.telefone || null,
            estado_civil: rawData.estado_civil,
            rg: rawData.rg || null,
            profissao: rawData.profissao || null,
            nacionalidade: rawData.nacionalidade || null,
            naturalidade: rawData.naturalidade || null,
            uf_nascimento: rawData.uf_nascimento || null,
            documentos_fiador: finalGuarantorDocs
          };
          
          // Fiador fields
          if (rawData.nome_fiador !== undefined) payload.nome_fiador = rawData.nome_fiador;
          if (rawData.cpf_fiador !== undefined) payload.cpf_fiador = rawData.cpf_fiador;
          if (rawData.rg_fiador !== undefined) payload.rg_fiador = rawData.rg_fiador;
          if (rawData.cep_fiador !== undefined) payload.cep_fiador = rawData.cep_fiador;
          if (rawData.endereco_fiador !== undefined) payload.endereco_fiador = rawData.endereco_fiador;

          let { error: err } = await supabase.from('inquilinos').update(payload).eq('id', editingItem.id);
          
          // Fallback if columns are missing (especially guarantor related)
          if (err && (err.message?.includes('column') || err.code === 'PGRST204')) {
            console.warn("Detectada ausência de colunas de fiador no banco. Tentando atualizar apenas dados básicos do inquilino...");
            const fallbackPayload = { ...payload };
            delete fallbackPayload.documentos_fiador;
            delete fallbackPayload.nome_fiador;
            delete fallbackPayload.cpf_fiador;
            delete fallbackPayload.rg_fiador;
            delete fallbackPayload.endereco_fiador;
            delete fallbackPayload.cep_fiador;
            delete fallbackPayload.arquivado;
            const { error: secondErr } = await supabase.from('inquilinos').update(fallbackPayload).eq('id', editingItem.id);
            err = secondErr;
          }
          
          dbError = err;
        } else if (activeTab === 'proprietarios') {
          const { error: err } = await supabase.from('proprietarios').update({ 
            nome: rawData.nome,
            cpf_cnpj: rawData.cpf_cnpj,
            rg: rawData.rg,
            estado_civil: rawData.estado_civil,
            endereco: rawData.endereco,
            bairro: rawData.bairro,
            cidade: rawData.cidade,
            estado: rawData.estado,
            email: rawData.email,
            telefone: rawData.telefone
          }).eq('id', editingItem.id);
          dbError = err;
        } else if (activeTab === 'contratos') {
          const payload: any = { 
            imovel_id: rawData.imovel_id,
            inquilino_id: rawData.inquilino_id,
            proprietario_id: rawData.proprietario_id,
            valor_aluguel: parseFloat(rawData.valor_aluguel as string),
            dia_vencimento: parseInt(rawData.dia_vencimento as string),
            data_inicio: rawData.data_inicio,
            data_fim: rawData.data_fim,
            clausulas: rawData.clausulas,
            alinhamento_texto: rawData.alinhamento_texto,
            arquivo_url: finalContractUrl,
            documentos: finalDocUrls
          };
          
          const oldImovelId = editingItem?.imovel_id;
          let { error: err } = await supabase.from('contratos').update(payload).eq('id', editingItem.id);
          
          // Fallback if column 'arquivo_url' is missing
          if (err && err.message?.includes('column "arquivo_url" of relation "contratos" does not exist')) {
            console.warn("Column 'arquivo_url' missing, merging into 'documentos'");
            const fallbackPayload = { ...payload };
            delete fallbackPayload.arquivo_url;
            if (finalContractUrl) {
                fallbackPayload.documentos = [finalContractUrl, ...(finalDocUrls || [])];
            }
            const { error: secondErr } = await supabase.from('contratos').update(fallbackPayload).eq('id', editingItem.id);
            err = secondErr;
          }
          
          dbError = err;

          if (!err) {
            // Se mudou o imóvel, libera o antigo
            if (oldImovelId && oldImovelId !== rawData.imovel_id) {
              await supabase.from('imoveis').update({ status: 'Disponível' }).eq('id', oldImovelId);
            }
            // Reserva o novo/atual
            await supabase.from('imoveis').update({ status: 'Alugado' }).eq('id', rawData.imovel_id);
          }
        }
      } else {
        // Insert logic
        if (activeTab === 'imoveis') {
          const payload = { 
            apelido: rawData.apelido,
            endereco: rawData.endereco,
            numero: rawData.numero,
            complemento: rawData.complemento,
            cep: rawData.cep,
            bairro: rawData.bairro,
            cidade: rawData.cidade,
            estado: rawData.estado,
            tipo_imovel: rawData.tipo_imovel,
            status: rawData.status,
            cemig: rawData.cemig,
            copasa: rawData.copasa,
            descricao: rawData.descricao,
            user_id: session.user.id,
            proprietario_id: userProfile?.role === 'PROPRIETARIO' ? userProfile.proprietario_id : (rawData.proprietario_id || null)
          };
          const { error: err } = await supabase.from('imoveis').insert([payload]);
          dbError = err;
        } else if (activeTab === 'inquilinos') {
          const payload: any = { 
            nome: rawData.nome,
            cpf_cnpj: rawData.cpf_cnpj || null,
            email: rawData.email || null,
            telefone: rawData.telefone || null,
            estado_civil: rawData.estado_civil,
            rg: rawData.rg || null,
            profissao: rawData.profissao || null,
            nacionalidade: rawData.nacionalidade || null,
            naturalidade: rawData.naturalidade || null,
            uf_nascimento: rawData.uf_nascimento || null,
            documentos_fiador: finalGuarantorDocs,
            user_id: session.user.id,
            proprietario_id: userProfile?.role === 'PROPRIETARIO' ? userProfile.proprietario_id : (rawData.proprietario_id || null)
          };

          // Fiador fields
          if (rawData.nome_fiador !== undefined) payload.nome_fiador = rawData.nome_fiador;
          if (rawData.cpf_fiador !== undefined) payload.cpf_fiador = rawData.cpf_fiador;
          if (rawData.rg_fiador !== undefined) payload.rg_fiador = rawData.rg_fiador;
          if (rawData.cep_fiador !== undefined) payload.cep_fiador = rawData.cep_fiador;
          if (rawData.endereco_fiador !== undefined) payload.endereco_fiador = rawData.endereco_fiador;

          let { error: err } = await supabase.from('inquilinos').insert([payload]);

          // Fallback for missing columns (guarantor related)
          if (err && (err.message?.includes('column') || err.code === 'PGRST204')) {
            console.warn("Detectada ausência de colunas de fiador no banco. Tentando salvar apenas dados básicos do inquilino...");
            const fallbackPayload = { ...payload };
            // Remove todos os campos que costumam causar erro de esquema se a tabela for antiga
            delete fallbackPayload.documentos_fiador;
            delete fallbackPayload.nome_fiador;
            delete fallbackPayload.cpf_fiador;
            delete fallbackPayload.rg_fiador;
            delete fallbackPayload.endereco_fiador;
            delete fallbackPayload.cep_fiador; // Caso exista
            delete fallbackPayload.arquivado;

            const { error: secondErr } = await supabase.from('inquilinos').insert([fallbackPayload]);
            err = secondErr;
          }

          dbError = err;
        } else if (activeTab === 'proprietarios') {
          const { error: err } = await supabase.from('proprietarios').insert([{ 
            nome: rawData.nome,
            cpf_cnpj: rawData.cpf_cnpj,
            rg: rawData.rg,
            estado_civil: rawData.estado_civil,
            endereco: rawData.endereco,
            bairro: rawData.bairro,
            cidade: rawData.cidade,
            estado: rawData.estado,
            email: rawData.email,
            telefone: rawData.telefone,
            user_id: session.user.id
          }]);
          dbError = err;
        } else if (activeTab === 'contratos') {
          // Check if property is already rented before creating a NEW contract
          if (!editingItem) {
            // First check by property status (fast)
            const { data: checkImovel } = await supabase
              .from('imoveis')
              .select('status')
              .eq('id', rawData.imovel_id)
              .single();

            if (checkImovel?.status === 'Alugado') {
              // Double check in contracts table for non-archived contracts
              const { data: activeContratos, error: cErr } = await supabase
                .from('contratos')
                .select('id')
                .eq('imovel_id', rawData.imovel_id)
                .is('arquivado', false);

              if (!cErr && activeContratos && activeContratos.length > 0) {
                throw new Error('Este imóvel já possui um contrato ativo registrado. Por favor, arquive o contrato anterior ou escolha outro imóvel.');
              }
            }
          }

          const payload: any = { 
            imovel_id: rawData.imovel_id,
            inquilino_id: rawData.inquilino_id,
            proprietario_id: (rawData.proprietario_id && rawData.proprietario_id !== "") ? rawData.proprietario_id : (userProfile?.role === 'PROPRIETARIO' ? userProfile?.proprietario_id : null),
            valor_aluguel: parseFloat(rawData.valor_aluguel as string),
            dia_vencimento: parseInt(rawData.dia_vencimento as string),
            data_inicio: rawData.data_inicio,
            data_fim: rawData.data_fim,
            user_id: session.user.id,
            clausulas: rawData.clausulas,
            alinhamento_texto: rawData.alinhamento_texto,
            arquivo_url: finalContractUrl,
            documentos: finalDocUrls
          };
          
          let { error: err } = await supabase.from('contratos').insert([payload]);
          
          // Fallback if columns are missing
          if (err && (err.message?.includes('column "arquivo_url"') || err.message?.includes('column "arquivado"'))) {
            const fallbackPayload = { ...payload };
            delete fallbackPayload.arquivo_url;
            delete fallbackPayload.arquivado;
            const { error: secondErr } = await supabase.from('contratos').insert([fallbackPayload]);
            err = secondErr;
          }
          
          dbError = err;

            if (!err) {
              await supabase.from('imoveis').update({ status: 'Alugado' }).eq('id', rawData.imovel_id);
              
              // Gerar parcelas automaticamente usando o novo helper
              try {
                const { data: newContract } = await supabase.from('contratos')
                  .select('*')
                  .eq('imovel_id', rawData.imovel_id)
                  .eq('inquilino_id', rawData.inquilino_id)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .single();
                
                if (newContract) {
                  await generateContractPayments(
                    newContract, 
                    rawData.data_inicio as string, 
                    rawData.data_fim as string, 
                    parseFloat(rawData.valor_aluguel as string), 
                    parseInt(rawData.dia_vencimento as string)
                  );
                }
              } catch (pGenErr) {
                console.error("Falha silenciosa na geração de parcelas:", pGenErr);
              }
            }
        } else if (activeTab === 'pagamentos') {
          const { error: err } = await supabase.from('pagamentos').insert([{ 
            contrato_id: rawData.contrato_id as string,
            valor_pago: parseFloat(rawData.valor_pago as string),
            competencia_mes: parseInt(rawData.competencia_mes as string),
            competencia_ano: parseInt(rawData.competencia_ano as string),
            user_id: session.user.id 
          }]);
          dbError = err;
        }
      }

      if (dbError) throw dbError;

      await recordLog(editingItem ? 'EDITAR' : 'CRIAR', activeTab, editingItem?.id, {
        identificador: rawData.nome || rawData.endereco || rawData.apelido || rawData.contrato_id
      });

      setSuccess(true);
      await fetchData();
      setTimeout(() => {
        setSuccess(false);
        setCreateModalOpen(false);
        setEditingItem(null);
      }, 1500);
    } catch (err: any) {
      console.error('Erro detalhado ao criar:', err);
      // Extrair mensagem de erro amigável se for erro do Supabase
      const message = err.message || (err.error_description) || (typeof err === 'string' ? err : 'Erro ao realizar o cadastro. Verifique sua conexão.');
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }, [session, userProfile, existingDocs, existingGuarantorDocs, contractFileUrl, contractFileToUpload, filesToUpload, guarantorFilesToUpload, activeTab, editingItem, fetchData, recordLog]);

  const handleMarkAsPaid = async (parcela: Pagamento, valorPago: number) => {
    try {
      setLoading(true);
      const { error } = await supabase.from('pagamentos').update({
        status: StatusPagamento.PAGO,
        valor_pago: valorPago,
        data_pagamento: new Date().toISOString()
      }).eq('id', parcela.id);

      if (error) throw error;

      await recordLog('PAGAMENTO', 'pagamentos', parcela.id, {
        contrato_id: parcela.contrato_id,
        valor: valorPago
      });

      await fetchData();
      
      // Auto-open receipt
      const contrato = parcela.contratos || contratos.find(c => c.id === parcela.contrato_id);
      const locadorNome = contrato?.proprietarios?.nome || contrato?.imoveis?.proprietarios?.nome || 'N/A';
      const locadorCpf = contrato?.proprietarios?.cpf_cnpj || contrato?.imoveis?.proprietarios?.cpf_cnpj || 'N/A';

      setReceiptData({
        inquilino: contrato?.inquilinos?.nome || 'N/A',
        cpf: contrato?.inquilinos?.cpf_cnpj || 'N/A',
        valor: valorPago,
        competencia: `${parcela.competencia_mes}/${parcela.competencia_ano}`,
        locador: locadorNome,
        locador_cpf: locadorCpf,
        endereco: contrato?.imoveis?.endereco || 'N/A',
        numero: contrato?.imoveis?.numero || '',
        complemento: contrato?.imoveis?.complemento || '',
        bairro: contrato?.imoveis?.bairro || '',
        cidade: contrato?.imoveis?.cidade || '',
        estado: contrato?.imoveis?.estado || '',
        cep: contrato?.imoveis?.cep || '',
        data: new Date().toLocaleDateString('pt-BR')
      });
      setReceiptModalOpen(true);
      
    } catch (err) {
      console.error('Erro ao marcar como pago:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptChange = (field: string, value: string | number) => {
    setReceiptData(prev => ({ ...prev, [field]: value }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': {
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
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Ocupação Total</h3>
                <div className="flex items-end gap-1">
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{stats.alugadosCount}</p>
                  <p className="text-[10px] font-bold text-slate-400 mb-1">/ {stats.totalImoveis} total</p>
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
                  
                  // Detecção de atraso real (venceu e não tem pagamento este mês)
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
                                // Pre-fill flow: we will use a timeout to let the tab change and state settle
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
    }
      
      case 'imoveis': {
        const dataToUse = showArchived ? archivedImoveis : imoveis;
        const { data: paginatedImoveis, totalPages: imoveisPages } = getPaginatedAndSortedData(dataToUse, 'imoveis');
        
        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-slate-500 text-[10px] uppercase tracking-widest font-black">
                    <SortHeader label="Imóvel / Endereço" sortKey="endereco" activeTab="imoveis" />
                    <SortHeader label="Bairro" sortKey="bairro" activeTab="imoveis" />
                    <SortHeader label="Tipo" sortKey="tipo_imovel" activeTab="imoveis" />
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 transition-all text-sm font-medium">
                  <AnimatePresence mode="popLayout">
                    {paginatedImoveis.map((im, idx) => (
                      <motion.tr 
                        key={im.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        custom={idx}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            {im.apelido && (
                              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 opacity-70 group-hover:opacity-100 transition-all">
                                {im.apelido}
                              </span>
                            )}
                            <p className="font-bold text-slate-800 tracking-tight">{im.endereco}, {im.numero}</p>
                            <p className="text-[10px] text-slate-400 font-medium font-mono uppercase mt-0.5">CEP: {im.cep}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-slate-700 font-bold">{im.bairro}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{im.cidade} / {im.estado}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest inline-block w-fit border ${
                            im.tipo_imovel === 'COMERCIAL' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {im.tipo_imovel || 'RESIDENCIAL'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter inline-block w-fit border ${
                            im.status === 'Disponível' ? 'bg-green-50 text-green-600 border-green-100' : 
                            im.status === 'Alugado' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {im.status || 'Disponível'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                                onClick={() => {
                                  setViewingItem(im);
                                  setViewModalOpen(true);
                                }}
                                className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all"
                                title="Visualizar Detalhes"
                              >
                                <Eye size={16} />
                              </button>
                             {can('ARCHIVE', 'imoveis') && (
                               <button 
                                onClick={() => handleToggleArchive(im, 'imoveis')}
                                className="text-slate-400 hover:text-amber-500 p-2 rounded-lg hover:bg-amber-50 transition-all"
                                title={im.arquivado ? "Restaurar" : "Arquivar"}
                              >
                                {im.arquivado ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                              </button>
                             )}
                            {can('EDIT', 'imoveis') && (
                              <button 
                                onClick={() => openCreateModal(im)}
                                className="text-[10px] font-black text-slate-400 hover:text-blue-600 px-3 py-2 uppercase tracking-widest transition-all hover:bg-blue-50 rounded-lg"
                              >
                                Editar
                              </button>
                            )}
                            {can('DELETE', 'imoveis') && (
                              <button 
                                onClick={() => setItemToDelete({ id: im.id, type: 'imoveis' })}
                                className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {paginatedImoveis.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-20 text-slate-400 font-medium italic">Nenhum imóvel {showArchived ? 'arquivado' : 'cadastrado'}.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination tab="imoveis" totalPages={imoveisPages} />
          </div>
        );
      }

      case 'proprietarios': {
        const dataToUse = showArchived ? archivedProprietarios : proprietarios;
        const { data: paginatedProprietarios, totalPages: proprietariosPages } = getPaginatedAndSortedData(dataToUse, 'proprietarios');
        
        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-slate-500 text-[10px] uppercase tracking-widest font-black">
                    <SortHeader label="Proprietário" sortKey="nome" activeTab="proprietarios" />
                    <SortHeader label="Cidade" sortKey="cidade" activeTab="proprietarios" />
                    <th className="px-6 py-4">Contato</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 transition-all text-sm font-medium">
                  {paginatedProprietarios.map(pr => (
                  <tr key={pr.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 uppercase tracking-tight">{pr.nome}</p>
                      <p className="text-[10px] text-slate-400 font-bold font-mono">CPF/CNPJ: {pr.cpf_cnpj}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700 font-bold">{pr.cidade} - {pr.estado}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest truncate max-w-[200px]">{pr.bairro}, {pr.endereco}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-blue-600 font-bold">{pr.email}</p>
                      <p className="text-xs text-slate-500">{pr.telefone}</p>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                       {can('ARCHIVE', 'proprietarios') && (
                         <button 
                          onClick={() => handleToggleArchive(pr, 'proprietarios')}
                          className="text-slate-400 hover:text-amber-500 p-2 transition-colors"
                          title={pr.arquivado ? "Restaurar" : "Arquivar"}
                        >
                          {pr.arquivado ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                        </button>
                       )}
                      {can('EDIT', 'proprietarios') && (
                        <button 
                          onClick={() => openCreateModal(pr)}
                          className="text-slate-400 hover:text-blue-600 font-bold p-2 transition-colors text-xs uppercase tracking-widest"
                        >
                          Editar
                        </button>
                      )}
                      {can('DELETE', 'proprietarios') && (
                        <button 
                          onClick={() => setItemToDelete({ id: pr.id, type: 'proprietarios' })}
                          className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {paginatedProprietarios.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-20 text-slate-400 font-medium italic">Nenhum proprietário {showArchived ? 'arquivado' : 'cadastrado'}.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination tab="proprietarios" totalPages={proprietariosPages} />
        </div>
        );
      }

      case 'inquilinos': {
        const dataToUse = showArchived ? archivedInquilinos : inquilinos;
        const { data: paginatedInquilinos, totalPages: inquilinosPages } = getPaginatedAndSortedData(dataToUse, 'inquilinos');

        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-slate-500 text-[10px] uppercase tracking-widest font-black">
                    <SortHeader label="Inquilino" sortKey="nome" activeTab="inquilinos" />
                    <th className="px-6 py-4">Contato</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 transition-all text-sm font-medium">
                  {paginatedInquilinos.map(inq => (
                    <tr key={inq.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-black text-xs border border-slate-200">
                            {inq.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 uppercase tracking-tight">{inq.nome}</p>
                            <p className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-tighter">DOC: {inq.cpf_cnpj}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-blue-600 font-bold">{inq.email}</p>
                        <p className="text-xs text-slate-500">{inq.telefone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          {inq.arquivado ? 'Arquivado' : 'Ativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {can('ARCHIVE', 'inquilinos') && (
                          <button 
                            onClick={() => handleToggleArchive(inq, 'inquilinos')}
                            className="text-slate-400 hover:text-amber-500 p-2 transition-colors"
                            title={inq.arquivado ? "Restaurar" : "Arquivar"}
                          >
                            {inq.arquivado ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                          </button>
                        )}
                        {can('EDIT', 'inquilinos') && (
                          <button 
                            onClick={() => openCreateModal(inq)}
                            className="text-slate-400 hover:text-blue-600 font-bold p-2 transition-colors text-xs uppercase tracking-widest"
                          >
                            Editar
                          </button>
                        )}
                        {can('DELETE', 'inquilinos') && (
                          <button 
                            onClick={() => setItemToDelete({ id: inq.id, type: 'inquilinos' })}
                            className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paginatedInquilinos.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-20 text-slate-400 font-medium italic">Nenhum inquilino {showArchived ? 'arquivado' : 'cadastrado'}.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination tab="inquilinos" totalPages={inquilinosPages} />
          </div>
        );
      }
      
      case 'logs': {
        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Audit Log System</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Last 100 system events</p>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Data/Hora</th>
                    <th className="px-6 py-4">Ação</th>
                    <th className="px-6 py-4">Módulo</th>
                    <th className="px-6 py-4">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-mono">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                          log.acao === 'CRIAR' ? 'bg-green-50 text-green-600' :
                          log.acao === 'EDITAR' ? 'bg-blue-50 text-blue-600' :
                          log.acao === 'EXCLUIR' ? 'bg-red-50 text-red-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {log.acao}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 uppercase tracking-widest font-bold">
                        {log.tabela}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-800 font-bold">{log.detalhes?.identificador || log.registro_id || '-'}</p>
                        <p className="text-[10px] text-slate-400">ID: {log.registro_id || 'N/A'}</p>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-20 text-slate-400 italic">No logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'contratos': {
        const dataToUse = showArchived ? archivedContratos : contratos;
        const { data: paginatedContratos, totalPages: contratosPages } = getPaginatedAndSortedData(dataToUse, 'contratos');

        return (
          <div className="flex flex-col gap-4">
            {paginatedContratos.map(co => (
              <div key={co.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-200 transition-all relative overflow-hidden">
                {co.arquivado && <div className="absolute top-0 right-0 w-24 h-6 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center rotate-45 translate-x-8 -translate-y-1">Arquivado</div>}
                <div className="flex items-center gap-8">
                  <div className="p-4 bg-slate-50 rounded-2xl text-slate-300 border border-slate-100 shrink-0">
                    <FileText size={32} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight italic mb-1 truncate">
                      {co.imoveis?.apelido ? (
                        <>
                          <span className="text-blue-600">{co.imoveis.apelido}</span>
                          <span className="mx-2 text-slate-300">-</span>
                          <span className="text-slate-700">{co.imoveis.endereco}</span>
                        </>
                      ) : (
                        co.imoveis?.endereco || 'Imóvel s/ endereço'
                      )}
                    </h4>
                    <div className="space-y-0.5">
                      <p className="text-slate-500 font-bold text-sm">Locatário: <span className="text-slate-700">{co.inquilinos?.nome || 'Inquilino s/ nome'}</span></p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Proprietário: {co.proprietarios?.nome || 'Não informado'}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 items-center">
                      <div className="flex items-center gap-4">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Início: <span className="text-slate-600">{new Date(co.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}</span></p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Fim: <span className="text-slate-600">{new Date(co.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')}</span></p>
                      </div>
                      <div className="flex gap-2">
                        {co.renovacoes_count && co.renovacoes_count > 0 && (
                          <p className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                            <CheckCircle2 size={10} />
                            {co.renovacoes_count === 1 ? '1 Renovação' : `${co.renovacoes_count} Renovações`}
                          </p>
                        )}
                        <p className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest flex items-center gap-1 shadow-sm ${
                          co.status === 'ativo' || !co.status ? 'bg-green-50 text-green-600' : 
                          co.status === 'finalizado' ? 'bg-slate-100 text-slate-500' : 
                          'bg-red-50 text-red-600'
                        }`}>
                          {co.status === 'ativo' || !co.status ? 'Contrato Ativo' : co.status === 'finalizado' ? 'Finalizado' : 'Cancelado'}
                        </p>
                      </div>
                    </div>

                    {(co.arquivo_url || (co.documentos && co.documentos.length > 0)) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {/* Botão Principal do Contrato */}
                        <a 
                          href={co.arquivo_url || (co.documentos && co.documentos[0])} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-blue-600 border border-blue-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                        >
                          <FileText size={12} />
                          Visualizar Contrato PDF
                          <ExternalLink size={10} />
                        </a>
                        
                        {/* Outros Anexos */}
                        {co.documentos?.map((doc: string, idx: number) => {
                          if (!co.arquivo_url && idx === 0) return null;
                          return (
                            <a 
                              key={idx} 
                              href={doc} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5 hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                            >
                              <FileText size={10} />
                              Anexo {co.arquivo_url ? idx + 1 : idx}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 text-right">
                    <div className="flex gap-2">
                       <button 
                         onClick={() => handleSendEmailNotification(co, 'VENCIMENTO')}
                         className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                         title="Enviar Lembrete por E-mail"
                       >
                         <Mail size={16} />
                       </button>
                       {(co.status === 'ativo' || !co.status) && (
                         <button 
                           onClick={() => handleFinishContract(co)}
                           className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                           title="Finalizar Contrato (Locatário saiu)"
                         >
                           <Ban size={16} />
                         </button>
                       )}
                       {(co.status === 'finalizado' || co.status === 'cancelado') && can('ARCHIVE', 'contratos') && (
                         <button 
                          onClick={() => handleToggleArchive(co, 'contratos')}
                          className="text-slate-400 hover:text-amber-500 p-2 hover:bg-amber-50 rounded-lg transition-all"
                          title={co.arquivado ? "Restaurar" : "Arquivar"}
                        >
                          {co.arquivado ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                        </button>
                       )}
                      <button 
                         onClick={() => {
                           setSelectedContractForFinance(co);
                           setFinanceModalOpen(true);
                         }}
                         className="bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 hover:text-white hover:border-slate-800 transition-all shadow-sm"
                       >
                         <CreditCard size={12} strokeWidth={3} />
                         Financeiro
                       </button>
                      <button 
                        onClick={() => {
                          const inquilino = co.inquilinos?.nome || 'Locatário';
                          const clausulas = co.clausulas || 'Este documento não possui cláusulas registradas. Utilize a função Editar para gerar o contrato completo.';
                          
                          // Obter estilos do modelo selecionado atualmente
                          const currentTemplate = contractTemplates[selectedTemplateIdx];
                          const fontSize = currentTemplate?.fontSize || 12;
                          const fontColor = currentTemplate?.fontColor || '#000000';
                          const fontWeight = currentTemplate?.bold ? 'bold' : 'normal';

                          const win = window.open('', '_blank');
                          if (win) {
                            win.document.title = `Contrato - ${inquilino}`;
                            win.document.write(`
                              <html>
                                <head>
                                  <title>Contrato - ${inquilino}</title>
                                  <style>
                                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                                    * { box-sizing: border-box; }
                                    body { 
                                      font-family: 'Inter', sans-serif; 
                                      font-weight: 400;
                                      padding: 40px; 
                                      line-height: 1.6; 
                                      color: ${fontColor}; 
                                      background: #f1f5f9;
                                      margin: 0;
                                      -webkit-print-color-adjust: exact;
                                      print-color-adjust: exact;
                                    }
                                    .paper {
                                      background: white;
                                      padding: 80px;
                                      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                                      max-width: 800px;
                                      margin: 40px auto;
                                      min-height: 1000px;
                                      border-radius: 4px;
                                    }
                                    .contract-content { 
                                      font-size: ${fontSize}px;
                                      color: #000000;
                                      font-weight: 400 !important;
                                      text-align: ${co.alinhamento_texto || 'justify'};
                                      white-space: pre-wrap;
                                    }
                                    .contract-content * {
                                      font-family: inherit;
                                    }
                                    .contract-content p, .contract-content span, .contract-content div { 
                                      font-weight: inherit; 
                                    }
                                    .contract-content b, .contract-content strong { font-weight: 700 !important; }
                                    .contract-content h1, .contract-content h2, .contract-content h3, .contract-content h4, .contract-content h5, .contract-content h6 {
                                      font-size: inherit;
                                      font-weight: inherit;
                                      margin: 0;
                                    }
                                    .contract-content u { text-decoration: underline; }
                                    .contract-content i { font-style: italic; }
                                    @media print {
                                      body { padding: 0 !important; background: white !important; margin: 0 !important; }
                                      .paper { box-shadow: none !important; padding: 0 !important; max-width: none !important; margin: 0 !important; }
                                      .no-print { display: none !important; opacity: 0 !important; visibility: hidden !important; height: 0 !important; overflow: hidden !important; }
                                    }
                                    .controls { 
                                      position: fixed; 
                                      top: 20px; 
                                      left: 50%; 
                                      transform: translateX(-50%); 
                                      background: rgba(15, 23, 42, 0.9); 
                                      backdrop-filter: blur(8px);
                                      padding: 8px 16px; 
                                      border-radius: 99px; 
                                      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                                      display: flex;
                                      gap: 12px;
                                      align-items: center;
                                      z-index: 100;
                                    }
                                    .btn-print {
                                      background: #2563eb; 
                                      color: white; 
                                      border: none; 
                                      padding: 8px 16px; 
                                      border-radius: 99px; 
                                      font-weight: 800; 
                                      cursor: pointer;
                                      text-transform: uppercase;
                                      font-size: 11px;
                                      letter-spacing: 0.1em;
                                      transition: all 0.2s;
                                    }
                                    .btn-print:hover { background: #1d4ed8; transform: translateY(-1px); }
                                    .info-badge { color: white; font-size: 10px; font-weight: bold; opacity: 0.7; }
                                  </style>
                                </head>
                                <body>
                                  <div class="controls no-print">
                                    <span class="info-badge no-print">MODO DE IMPRESSÃO</span>
                                    <button onclick="window.print()" class="btn-print no-print">Imprimir Contrato</button>
                                  </div>
                                  <div class="paper">
                                    <div class="contract-content">${clausulas}</div>
                                  </div>
                                </body>
                              </html>
                            `);
                            win.document.close();
                          }
                        }}
                        className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-2 py-1 rounded uppercase tracking-widest transition-all"
                      >
                        Visualizar
                      </button>
                      <button 
                         onClick={() => {
                           setContractToRenew(co);
                           setIsRenewModalOpen(true);
                         }}
                         className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors flex items-center gap-1"
                         title="Renovar este contrato"
                       >
                         <ArchiveRestore size={12} />
                         Renovar
                       </button>
                      {can('EDIT', 'contratos') && (
                        <button 
                          onClick={() => openCreateModal(co)}
                          className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
                        >
                          Editar
                        </button>
                      )}
                      {can('DELETE', 'contratos') && (
                        <button 
                          onClick={() => setItemToDelete({ id: co.id, type: 'contratos' })}
                          className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatarMoeda(co.valor_aluguel)}</p>
                    <span className={`text-[10px] font-black ${co.arquivado ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'} px-2.5 py-1 rounded-full uppercase tracking-tighter inline-block font-mono`}>
                      {co.arquivado ? 'Contrato Arquivado' : 'Contrato Ativo'}
                    </span>
                  </div>
              </div>
            ))}
            {paginatedContratos.length === 0 && (
              <div className="text-center py-20 text-slate-400 font-medium italic">
                Nenhum contrato {showArchived ? 'arquivado' : 'ativo'}.
              </div>
            )}
            <Pagination tab="contratos" totalPages={contratosPages} />
          </div>
        );
      }

      case 'pagamentos': {
        const filteredPagamentos = pagamentos.filter(pa => {
          const matchesYear = pa.competencia_ano === selectedYear;
          const matchesMonth = paymentMonthFilter === 0 || pa.competencia_mes === paymentMonthFilter;
          const matchesStatus = paymentStatusFilter === 'todos' || pa.status === paymentStatusFilter;
          const searchLower = paymentSearch.toLowerCase();
          const matchesSearch = 
            paymentSearch === '' ||
            (pa.contratos?.inquilinos?.nome || '').toLowerCase().includes(searchLower) ||
            (pa.contratos?.imoveis?.endereco || '').toLowerCase().includes(searchLower) ||
            (pa.valor_pago?.toString() || '').includes(paymentSearch);
          
          return matchesYear && matchesMonth && matchesStatus && matchesSearch;
        });
        const availableYears = Array.from(new Set(pagamentos.map(pa => pa.competencia_ano))).sort((a, b) => b - a);
        if (availableYears.length === 0) availableYears.push(new Date().getFullYear());

        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto custom-scrollbar">
            <div className="p-6 border-b border-slate-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50/30 min-w-[1000px]">
              <div>
                <h3 className="font-black text-slate-800 uppercase tracking-tight italic">Histórico de Recebimentos</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Exibindo registros de {selectedYear}</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={14} />
                  </span>
                  <input 
                    type="text"
                    placeholder="Pesquisar..."
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    className="pl-8 pr-4 py-1.5 border-2 border-slate-100 rounded-lg text-[11px] font-bold text-slate-700 outline-none focus:border-blue-400 transition-all w-48 sm:w-64 bg-white"
                  />
                </div>

                <select 
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="bg-white border-2 border-slate-100 rounded-lg px-3 py-1 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all"
                >
                   <option value="todos">Todos Status</option>
                   <option value={StatusPagamento.PAGO}>Pagos</option>
                   <option value={StatusPagamento.PENDENTE}>Pendentes</option>
                </select>

                <select 
                  value={paymentMonthFilter}
                  onChange={(e) => setPaymentMonthFilter(parseInt(e.target.value))}
                  className="bg-white border-2 border-slate-100 rounded-lg px-3 py-1 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all"
                >
                   <option value={0}>Todos Meses</option>
                   {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                     <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                   ))}
                </select>

                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ano:</label>
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="bg-white border-2 border-slate-100 rounded-lg px-3 py-1 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <button 
                  className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 px-3 py-1 border border-slate-200 rounded-lg hover:bg-white transition-all"
                >
                  Exportar
                </button>
              </div>
            </div>
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Beneficiário</th>
                  <th className="px-6 py-4">Período</th>
                  <th className="px-6 py-4 text-center">Vencimento</th>
                  <th className="px-6 py-4 text-center">Data Pagto</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {filteredPagamentos.map(pa => {
                  const dueDate = new Date(pa.data_vencimento + 'T00:00:00');
                  const paymentDate = pa.data_pagamento ? new Date(pa.data_pagamento) : null;
                  const isOverdue = !pa.data_pagamento && dueDate < new Date();

                  return (
                    <tr key={pa.id} className={`hover:bg-slate-50 transition-colors ${isOverdue ? 'bg-red-50/20' : ''}`}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{pa.contratos?.inquilinos?.nome}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate max-w-[200px]">{pa.contratos?.imoveis?.endereco}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">
                          {pa.competencia_mes.toString().padStart(2, '0')}/{pa.competencia_ano}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-400 font-mono italic">
                        {dueDate.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600 font-mono">
                        {paymentDate ? paymentDate.toLocaleDateString('pt-BR') : '---'}
                      </td>
                      <td className="px-6 py-4 font-black">
                        <span className={pa.status === StatusPagamento.PAGO ? "text-green-600" : "text-slate-800"}>
                          {formatarMoeda(pa.status === StatusPagamento.PAGO ? (pa.valor_pago || 0) : (pa.valor_esperado || 0))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {pa.status === StatusPagamento.PAGO ? (
                          <span className="text-[9px] font-black bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center justify-center gap-1 mx-auto w-fit">
                            <CheckCircle2 size={10} /> Pago
                          </span>
                        ) : isOverdue ? (
                          <span className="text-[9px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center justify-center gap-1 mx-auto w-fit animate-pulse">
                            <AlertCircle size={10} /> Atrasado
                          </span>
                        ) : (
                          <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center justify-center gap-1 mx-auto w-fit">
                             Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {pa.status === StatusPagamento.PAGO ? (
                          <button 
                            onClick={() => {
                              const contrato = pa.contratos;
                              const locadorNome = contrato?.proprietarios?.nome || contrato?.imoveis?.proprietarios?.nome || 'N/A';
                              const locadorCpf = contrato?.proprietarios?.cpf_cnpj || contrato?.imoveis?.proprietarios?.cpf_cnpj || 'N/A';
                              
                              setReceiptData({
                                inquilino: contrato?.inquilinos?.nome || 'N/A',
                                cpf: contrato?.inquilinos?.cpf_cnpj || 'N/A',
                                valor: pa.valor_pago || 0,
                                competencia: `${pa.competencia_mes}/${pa.competencia_ano}`,
                                locador: locadorNome,
                                locador_cpf: locadorCpf,
                                endereco: contrato?.imoveis?.endereco || 'N/A',
                                numero: contrato?.imoveis?.numero || '',
                                complemento: contrato?.imoveis?.complemento || '',
                                bairro: contrato?.imoveis?.bairro || '',
                                cidade: contrato?.imoveis?.cidade || '',
                                estado: contrato?.imoveis?.estado || '',
                                cep: contrato?.imoveis?.cep || '',
                                data: pa.data_pagamento ? new Date(pa.data_pagamento).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')
                              });
                              setReceiptModalOpen(true);
                            }}
                            className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            Recibo
                          </button>
                        ) : (
                          <button 
                             onClick={() => handleMarkAsPaid(pa, pa.valor_esperado || 0)}
                             className="bg-green-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-md shadow-green-100"
                          >
                             Baixar
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredPagamentos.length === 0 && (
              <div className="text-center py-20 text-slate-400 font-medium italic">
                Nenhum registro financeiro encontrado para os filtros selecionados.
              </div>
            )}
          </div>
        );
      }

      case 'configuracoes': {
        return (
          <div className="flex flex-col gap-8">
            {/* Modelos de Contratos - Priorizado */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <FileText size={24} className="text-blue-600" />
                    Modelos de Contratos Personalizados
                  </h3>
                  <p className="text-xs text-slate-500 font-medium italic mt-1">Configure modelos que podem ser selecionados na criação de novos contratos.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsTagGuideOpen(true)}
                    className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                  >
                    <Hash size={16} />
                    Guia de Tags
                  </button>
                  <button 
                    onClick={() => {
                      const newTemplates = [...contractTemplates, { name: 'Novo Modelo', content: 'Escreva seu contrato aqui...' }];
                      setContractTemplates(newTemplates);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    <PlusCircle size={16} />
                    Novo Modelo
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {contractTemplates.map((template, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 group flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nome do Modelo</label>
                        <input 
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                          value={template.name}
                          onChange={(e) => {
                            const newTemplates = [...contractTemplates];
                            newTemplates[idx].name = e.target.value;
                            setContractTemplates(newTemplates);
                          }}
                        />
                      </div>
                      <button 
                        onClick={() => {
                          if (contractTemplates.length <= 1) {
                            alert('Você deve ter pelo menos um modelo de contrato.');
                            return;
                          }
                          if (confirm('Deseja realmente excluir este modelo de contrato?')) {
                            const newTemplates = contractTemplates.filter((_, i) => i !== idx);
                            setContractTemplates(newTemplates);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                        title="Excluir este modelo"
                      >
                        <X size={14} />
                        Excluir Modelo
                      </button>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Conteúdo das Cláusulas</label>
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg overflow-hidden p-0.5 shadow-sm">
                          <button
                            type="button"
                            onClick={() => {
                              const newTemplates = [...contractTemplates];
                              newTemplates[idx].alignment = 'left';
                              setContractTemplates(newTemplates);
                            }}
                            className={`p-1 transition-all rounded ${template.alignment === 'left' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                            title="Alinhar à Esquerda"
                          >
                            <AlignLeft size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newTemplates = [...contractTemplates];
                              newTemplates[idx].alignment = 'center';
                              setContractTemplates(newTemplates);
                            }}
                            className={`p-1 transition-all rounded ${template.alignment === 'center' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                            title="Centralizar"
                          >
                            <AlignCenter size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newTemplates = [...contractTemplates];
                              newTemplates[idx].alignment = 'right';
                              setContractTemplates(newTemplates);
                            }}
                            className={`p-1 transition-all rounded ${template.alignment === 'right' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                            title="Alinhar à Direita"
                          >
                            <AlignRight size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newTemplates = [...contractTemplates];
                              newTemplates[idx].alignment = 'justify';
                              setContractTemplates(newTemplates);
                            }}
                            className={`p-1 transition-all rounded ${template.alignment === 'justify' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                            title="Justificar"
                          >
                            <AlignJustify size={12} />
                          </button>
                        </div>
                      </div>
                          <RichEditor 
                            content={template.content} 
                            onChange={(newContent) => {
                              const newTemplates = [...contractTemplates];
                              if (newTemplates[idx].content !== newContent) {
                                newTemplates[idx].content = newContent;
                                setContractTemplates(newTemplates);
                              }
                            }}
                            activeDropdown={activeEditorDropdown}
                            setActiveDropdown={setActiveEditorDropdown}
                          />
                    </div>
                    
                    <div className="flex justify-between items-center mt-2 px-1">
                      <p className="text-[9px] text-slate-400 font-medium italic">Edite o texto e as tags livremente.</p>
                      <button 
                        type="button"
                        onClick={() => {
                          setSuccess(true);
                          setTimeout(() => setSuccess(false), 3000);
                        }}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                      >
                        <CheckCircle2 size={14} />
                        Salvar Alterações
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block w-full mb-1">Tags Disponíveis (Clique para Inserir):</span>
                      {[
                        { label: "Locatário: Nome", tag: "{{inquilino_nome}}" },
                        { label: "Locatário: CPF/CNPJ", tag: "{{inquilino_cpf}}" },
                        { label: "Locatário: RG", tag: "{{inquilino_rg}}" },
                        { label: "Locatário: Tel", tag: "{{inquilino_telefone}}" },
                        { label: "Locatário: Email", tag: "{{inquilino_email}}" },
                        { label: "Locatário: Est. Civil", tag: "{{inquilino_estado_civil}}" },
                        { label: "Locatário: Profissão", tag: "{{inquilino_profissao}}" },
                        { label: "Imóvel: Endereço", tag: "{{imovel_endereco}}" },
                        { label: "Imóvel: Bairro", tag: "{{imovel_bairro}}" },
                        { label: "Imóvel: Cidade", tag: "{{imovel_cidade}}" },
                        { label: "Imóvel: Estado", tag: "{{imovel_estado}}" },
                        { label: "Imóvel: CEP", tag: "{{imovel_cep}}" },
                        { label: "Proprietário: Nome", tag: "{{proprietario_nome}}" },
                        { label: "Proprietário: CPF/CNPJ", tag: "{{proprietario_cpf}}" },
                        { label: "Proprietário: Endereço", tag: "{{proprietario_endereco}}" },
                        { label: "Proprietário: Cidade", tag: "{{proprietario_cidade}}" },
                        { label: "Valor Total", tag: "{{valor_total}}" },
                        { label: "Valor Extenso", tag: "{{valor_extenso}}" },
                        { label: "Vencimento", tag: "{{data_vencimento}}" },
                        { label: "Data Início", tag: "{{data_inicio}}" },
                        { label: "Data Fim", tag: "{{data_fim}}" },
                        { label: "Data Hoje", tag: "{{data_hoje}}" },
                        { label: "Foro", tag: "{{foro}}" },
                        { label: "Condições Pag.", tag: "{{condicoes_pagamento}}" },
                        { label: "Testemunha 1", tag: "{{testemunha_1}}" },
                        { label: "Testemunha 2", tag: "{{testemunha_2}}" }
                      ].map(item => (
                        <button 
                          key={item.tag} 
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            document.execCommand('insertText', false, item.tag);
                          }}
                          className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded text-[9px] font-mono font-bold text-blue-600 transition-all"
                        >
                          {item.label}
                        </button>
                      ))}
                      <button 
                        type="button"
                        onClick={() => setIsTagGuideOpen(true)}
                        className="px-2 py-1 bg-blue-600 border border-blue-700 hover:bg-blue-700 rounded text-[9px] font-bold text-white transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Hash size={10} />
                        GUIA DE TAGS
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notificações - Reduzido */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
                <Bell size={20} className="text-slate-400" />
                Alertas e Notificações
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Antecedência de Alerta</label>
                    <span className="text-2xl font-black text-blue-600">{notificationDays} dias</span>
                  </div>
                  <input 
                    type="range" 
                    min="15" 
                    max="180" 
                    step="15"
                    value={notificationDays}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setNotificationDays(val);
                      fetchData();
                    }}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between opacity-50 grayscale cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-400 rounded-lg">
                      <Bell size={18} />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notificações via E-mail</p>
                  </div>
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase">Upgrade Pro</span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'usuarios': {
        const assinantesCount = perfis.filter(p => p.status_pagamento === 'PAGO').length;
        const trialCount = perfis.filter(p => p.trial_ends_at && new Date(p.trial_ends_at) > new Date() && p.status_pagamento !== 'PAGO').length;

        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 px-4 py-2 rounded-xl flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 font-sans">{assinantesCount} Assinantes</span>
                </div>
                <div className="bg-amber-50 px-4 py-2 rounded-xl flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 font-sans">{trialCount} em Trial</span>
                </div>
              </div>
              <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar por nome, e-mail ou CPF..." 
                  className="bg-slate-50 border-2 border-slate-100 focus:border-blue-400 outline-none rounded-2xl px-12 py-3 text-sm font-bold w-full md:w-80 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden text-slate-700">
              <div className="overflow-x-auto overflow-y-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-5">Usuário</th>
                      <th className="px-6 py-5">Nome Completo</th>
                      <th className="px-6 py-5 text-center">Status Pagto</th>
                      <th className="px-6 py-5 text-center">Plano</th>
                      <th className="px-6 py-5">Expiração</th>
                      <th className="px-6 py-5">Último Acesso</th>
                      <th className="px-6 py-5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {perfis.map((p) => {
                      const isGleison = p.nome?.toLowerCase().includes('gleison') || p.role === 'ADMIN';
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-700">{p.nome?.split(' ')[0].toLowerCase()}</span>
                              <span className={`text-[9px] font-bold uppercase tracking-tighter ${p.role === 'ADMIN' ? 'text-blue-500' : 'text-slate-400'}`}>{p.role}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-slate-600">{p.nome || '-'}</td>
                          <td className="px-6 py-5">
                            <div className="flex justify-center">
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                p.status_pagamento === 'PAGO' ? 'bg-emerald-50 text-emerald-600' : 
                                p.status_pagamento === 'ATRASADO' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {p.status_pagamento || 'SEM ASSINATURA'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex justify-center">
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                p.plano === 'Pro' ? 'bg-blue-50 text-blue-600' : 
                                p.plano === 'Platinum' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {p.plano || 'NENHUM'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className={`text-xs font-black ${
                                isGleison ? 'text-emerald-500' :
                                p.trial_ends_at && new Date(p.trial_ends_at) < new Date() ? 'text-red-500' : 'text-slate-600'
                              }`}>
                                {isGleison ? '∞' : (p.trial_ends_at ? new Date(p.trial_ends_at).toLocaleDateString() : '-')}
                              </span>
                              <span className="text-[9px] font-bold uppercase text-slate-400">
                                {isGleison ? 'VITALÍCIO' : (p.trial_ends_at && new Date(p.trial_ends_at) < new Date() ? 'EXPIRADO' : 'ATIVO')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${p.last_access ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                              {p.last_access ? new Date(p.last_access).toLocaleDateString() : 'Nunca'}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => setEditingUser(p)}
                                className="p-2 hover:bg-blue-50 text-slate-300 hover:text-blue-500 rounded-lg transition-all"
                              >
                                <Edit3 size={16} />
                              </button>
                              {userProfile?.id !== p.id && (
                                <button 
                                  onClick={async () => {
                                    if (confirm(`Remover acesso de ${p.nome}?`)) {
                                      const { error } = await supabase.from('user_profiles').delete().eq('id', p.id);
                                      if (!error) fetchData();
                                    }
                                  }}
                                  className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal de Edição */}
            <AnimatePresence>
              {editingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col"
                  >
                    <div className="px-10 pt-10 pb-6 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Editar Usuário</h3>
                      <button onClick={() => setEditingUser(null)} className="text-slate-300 hover:text-slate-500"><X size={24} /></button>
                    </div>

                    <div className="p-10 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar text-slate-700">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-400">Perfil do Colaborador</label>
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl font-black text-slate-400 border border-slate-100 shadow-sm">
                            {editingUser.nome?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-700">{editingUser.nome}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editingUser.plano || 'Nenhum'} • {editingUser.role}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-400">Nome Completo</label>
                        <input 
                          id="edit-nome"
                          defaultValue={editingUser.nome || ''}
                          className="w-full bg-slate-50/50 border-2 border-slate-100 focus:border-blue-400 outline-none rounded-2xl px-4 py-4 font-bold text-sm transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-400">Função (Role)</label>
                          <select 
                            id="edit-role"
                            defaultValue={editingUser.role}
                            className="w-full bg-slate-50/50 border-2 border-slate-100 focus:border-blue-400 outline-none rounded-2xl px-4 py-4 font-bold text-sm transition-all appearance-none"
                          >
                            <option value="CORRETOR">Usuário Comum</option>
                            <option value="ADMIN">Administrador</option>
                            <option value="PROPRIETARIO">Proprietário</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-400">Plano</label>
                          <select 
                            id="edit-plano"
                            defaultValue={editingUser.plano || 'Nenhum'}
                            className="w-full bg-slate-50/50 border-2 border-slate-100 focus:border-blue-400 outline-none rounded-2xl px-4 py-4 font-bold text-sm transition-all appearance-none"
                          >
                            <option value="Nenhum">Nenhum</option>
                            <option value="Basic">Basic</option>
                            <option value="Pro">Pro</option>
                            <option value="Platinum">Platinum</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-400">Status Pagamento</label>
                        <select 
                          id="edit-status"
                          defaultValue={editingUser.status_pagamento || 'Sem Assinatura'}
                          className="w-full bg-slate-50/50 border-2 border-slate-100 focus:border-blue-400 outline-none rounded-2xl px-4 py-4 font-bold text-sm transition-all appearance-none"
                        >
                          <option value="Sem Assinatura">Sem Assinatura</option>
                          <option value="PAGO">PAGO</option>
                          <option value="ATRASADO">ATRASADO</option>
                          <option value="PENDENTE">PENDENTE</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-400">Data de Início</label>
                          <input 
                            id="edit-data-inicio"
                            type="date"
                            defaultValue={editingUser.data_inicio ? new Date(editingUser.data_inicio).toISOString().split('T')[0] : ''}
                            className="w-full bg-slate-50/50 border-2 border-slate-100 focus:border-blue-400 outline-none rounded-2xl px-4 py-4 font-bold text-sm transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-400">Data de Expiração</label>
                          <input 
                            id="edit-data-fim"
                            type="date"
                            defaultValue={editingUser.trial_ends_at ? new Date(editingUser.trial_ends_at).toISOString().split('T')[0] : ''}
                            className="w-full bg-slate-50/50 border-2 border-slate-100 focus:border-blue-400 outline-none rounded-2xl px-4 py-4 font-bold text-sm transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-10 bg-slate-50 flex items-center justify-end gap-4 rounded-b-[2.5rem]">
                      <button 
                        onClick={() => setEditingUser(null)}
                        className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all font-sans"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => {
                          const nome = (document.getElementById('edit-nome') as HTMLInputElement).value;
                          const role = (document.getElementById('edit-role') as HTMLSelectElement).value;
                          const plano = (document.getElementById('edit-plano') as HTMLSelectElement).value;
                          const status_pagamento = (document.getElementById('edit-status') as HTMLSelectElement).value;
                          const data_inicio = (document.getElementById('edit-data-inicio') as HTMLInputElement).value;
                          const trial_ends_at = (document.getElementById('edit-data-fim') as HTMLInputElement).value;

                          handleUpdateUser({
                            nome,
                            role: role as any,
                            plano,
                            status_pagamento,
                            data_inicio: data_inicio ? new Date(data_inicio).toISOString() : undefined,
                            trial_ends_at: trial_ends_at ? new Date(trial_ends_at).toISOString() : undefined,
                            approved: true
                          });
                        }}
                        disabled={loading}
                        className="bg-blue-600 text-white px-12 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200"
        >
          <div className="flex items-center gap-3 text-blue-600 mb-8 justify-center">
            <Home size={32} strokeWidth={2.5} />
            <h1 className="text-2xl font-black tracking-tight">ImobiSaaS</h1>
          </div>
          
          <div className="bg-slate-50 p-1.5 rounded-2xl flex items-center gap-2 mb-8">
            <button 
              onClick={() => { setAuthTab('login'); setLoginError(null); }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                authTab === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Entrar
            </button>
            <button 
              onClick={() => { setAuthTab('register'); setLoginError(null); }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                authTab === 'register' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={authTab === 'login' ? handleLogin : handleRegister} className="space-y-5">
            {loginError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3 animate-shake">
                <AlertCircle size={18} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {authTab === 'register' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      name="nome" 
                      type="text" 
                      required 
                      className="w-full bg-slate-50/50 border-2 border-slate-100 focus:border-emerald-400 outline-none rounded-2xl pl-12 pr-4 py-4 font-bold text-sm transition-all" 
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      name="username" 
                      type="text" 
                      required 
                      className="w-full bg-slate-50/50 border-2 border-slate-100 focus:border-emerald-400 outline-none rounded-2xl pl-12 pr-4 py-4 font-bold text-sm transition-all" 
                      placeholder="Gleison"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  name="email" 
                  type="email" 
                  required 
                  className={`w-full bg-slate-50/50 border-2 border-slate-100 outline-none rounded-2xl pl-12 pr-4 py-4 font-bold text-sm transition-all ${authTab === 'login' ? 'focus:border-blue-400' : 'focus:border-emerald-400'}`}
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {authTab === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CPF</label>
                <div className="relative group">
                  <BadgeDollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    name="cpf" 
                    type="text" 
                    required 
                    className="w-full bg-slate-50/50 border-2 border-slate-100 focus:border-emerald-400 outline-none rounded-2xl pl-12 pr-4 py-4 font-bold text-sm transition-all" 
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  name="password" 
                  type="password" 
                  required 
                  className={`w-full bg-slate-50/50 border-2 border-slate-100 outline-none rounded-2xl pl-12 pr-4 py-4 font-bold text-sm transition-all ${authTab === 'login' ? 'focus:border-blue-400' : 'focus:border-emerald-400'}`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {authTab === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    name="confirmPassword" 
                    type="password" 
                    required 
                    className="w-full bg-slate-50/50 border-2 border-slate-100 focus:border-emerald-400 outline-none rounded-2xl pl-12 pr-4 py-4 font-bold text-sm transition-all" 
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg flex justify-center items-center gap-3 active:scale-95 ${
                authTab === 'login' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100' 
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100'
              } disabled:opacity-50`}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  {authTab === 'login' ? 'Acessar Dashboard' : 'Criar minha conta'}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          {authTab === 'register' && (
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 text-[11px] font-medium text-blue-700 leading-relaxed">
                <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
                <p>Se você é um novo colaborador, realize o cadastro para acessar as ferramentas imediatamente com período de trial.</p>
              </div>
              <div className="flex items-start gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 text-[10px] font-bold text-amber-700 leading-relaxed">
                <ShieldAlert size={16} className="shrink-0 mt-0.5 text-amber-500" />
                <p>
                  <span className="block uppercase tracking-tight mb-0.5">Nota de Segurança:</span>
                  O CPF é utilizado como identificador único para evitar duplicicade de contas e garantir a integridade dos seus dados financeiros.
                </p>
              </div>
            </div>
          )}

          {authTab === 'login' && (
            <p className="text-center mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              Esqueceu sua senha? <button className="text-blue-500 hover:underline">Recuperar</button>
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  const isTrialActive = userProfile?.trial_ends_at ? new Date(userProfile.trial_ends_at) > new Date() : false;
  const trialDaysLeft = userProfile?.trial_ends_at ? Math.max(0, Math.ceil((new Date(userProfile.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  if (userProfile && !userProfile.approved && !isTrialActive && userProfile.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-lg border border-slate-200 text-center flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
            <ShieldAlert size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic leading-tight">Período de Teste Encerrado</h1>
            <p className="text-slate-500 font-medium leading-relaxed italic">
              Olá, <span className="font-bold text-slate-800">{userProfile.nome}</span>. Seus 7 dias de trial terminaram e sua conta ainda não foi <span className="text-blue-600 font-black">APROVADA</span> definitivamente por um administrador.
            </p>
          </div>
          <div className="w-full h-px bg-slate-100" />
          <div className="space-y-4 w-full">
            <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-2xl text-blue-700 text-xs font-bold border border-blue-100 text-left">
              <Info size={18} className="shrink-0" />
              <p>Para continuar utilizando o sistema, entre em contato com o administrador responsável pela sua unidade.</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
            >
              Sair da Conta
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FDFDFD] font-sans selection:bg-blue-100 overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 z-50 sticky top-0">
        <div className="flex items-center gap-2 text-blue-600">
          <Home size={24} strokeWidth={2.5} />
          <h1 className="text-lg font-bold tracking-tight italic">REALIZE<span className="text-blue-600">.</span></h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 h-full md:h-screen z-40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 transition-transform duration-300 ease-in-out
      `}>
        <div className="flex items-center gap-2 text-blue-600 px-2">
          <Home size={28} strokeWidth={2.5} />
          <h1 className="text-xl font-bold tracking-tight italic">REALIZE<span className="text-blue-600">.</span></h1>
        </div>
        
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto custom-scrollbar">
          {can('VIEW', 'dashboard') && (
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); setShowArchived(false); }} 
            />
          )}
          {notifications.length > 0 && can('VIEW', 'dashboard') && (
            <div className="px-4 py-2 bg-orange-50 rounded-xl border border-orange-100 mb-2">
              <div className="flex items-center gap-2 text-orange-600">
                <Bell size={14} className="animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-tighter">{notifications.length} Alertas Ativos</span>
              </div>
            </div>
          )}
          {can('VIEW', 'proprietarios') && (
            <SidebarItem 
              icon={Building2} 
              label="Proprietários" 
              active={activeTab === 'proprietarios'} 
              onClick={() => { setActiveTab('proprietarios'); setIsSidebarOpen(false); setShowArchived(false); }} 
            />
          )}
          {can('VIEW', 'imoveis') && (
            <SidebarItem 
              icon={Building2} 
              label="Imóveis" 
              active={activeTab === 'imoveis'} 
              onClick={() => { setActiveTab('imoveis'); setIsSidebarOpen(false); setShowArchived(false); }} 
            />
          )}
          {can('VIEW', 'inquilinos') && (
            <SidebarItem 
              icon={Users} 
              label="Inquilinos" 
              active={activeTab === 'inquilinos'} 
              onClick={() => { setActiveTab('inquilinos'); setIsSidebarOpen(false); setShowArchived(false); }} 
            />
          )}
          {can('VIEW', 'contratos') && (
            <SidebarItem 
              icon={FileText} 
              label="Contratos" 
              active={activeTab === 'contratos'} 
              onClick={() => { setActiveTab('contratos'); setIsSidebarOpen(false); setShowArchived(false); }} 
            />
          )}
          {can('VIEW', 'pagamentos') && (
            <SidebarItem 
              icon={CreditCard} 
              label="Pagamentos" 
              active={activeTab === 'pagamentos'} 
              onClick={() => { setActiveTab('pagamentos'); setIsSidebarOpen(false); setShowArchived(false); }} 
            />
          )}
          {can('VIEW', 'configuracoes') && (
            <SidebarItem 
              icon={Settings} 
              label="Configurações" 
              active={activeTab === 'configuracoes'} 
              onClick={() => { setActiveTab('configuracoes'); setIsSidebarOpen(false); setShowArchived(false); }} 
            />
          )}
          {can('VIEW', 'logs') && (
            <SidebarItem 
              icon={Bell} 
              label="Auditoria" 
              active={activeTab === 'logs'} 
              onClick={() => { setActiveTab('logs'); setIsSidebarOpen(false); setShowArchived(false); }} 
            />
          )}
          {userProfile?.role === 'ADMIN' && (
            <SidebarItem 
              icon={Users} 
              label="Equipe" 
              active={activeTab === 'usuarios'} 
              onClick={() => { setActiveTab('usuarios'); setIsSidebarOpen(false); setShowArchived(false); }} 
            />
          )}
        </nav>

        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex justify-between items-start mb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usuário</p>
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                userProfile?.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 
                userProfile?.role === 'PROPRIETARIO' ? 'bg-amber-100 text-amber-600' : 
                'bg-blue-100 text-blue-600'
              }`}>
                {userProfile?.role}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-700 truncate">{userProfile?.nome || session?.user?.email?.split('@')[0] || 'Gleison Isaias'}</p>
          </div>
          <button 
            onClick={() => {
              setPwdForm({ current: '', new: '', confirm: '' });
              setIsChangePasswordOpen(true);
            }}
            className="text-[10px] font-black text-slate-400 hover:text-blue-500 uppercase tracking-widest p-2 transition-colors text-left"
          >
            Alterar Senha
          </button>
          <button 
            onClick={handleLogout}
            className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest p-2 transition-colors text-left"
          >
            Sair da Conta
          </button>
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center mt-2">v1.5.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full">
        {/* Toast Notifications */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: '-50%' }}
              animate={{ opacity: 1, y: 20, x: '-50%' }}
              exit={{ opacity: 0, y: -50, x: '-50%' }}
              className="fixed top-0 left-1/2 z-[100] bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black uppercase text-xs tracking-widest"
            >
              <CheckCircle2 size={20} />
              Operação realizada com sucesso!
            </motion.div>
          )}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: '-50%' }}
              animate={{ opacity: 1, y: 20, x: '-50%' }}
              exit={{ opacity: 0, y: -50, x: '-50%' }}
              className="fixed top-0 left-1/2 z-[100] bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black uppercase text-xs tracking-widest"
            >
              <AlertCircle size={20} />
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <span>Workspace</span>
              <ChevronRight size={10} className="text-slate-300" />
              <span className="text-blue-500">{activeTab}</span>
              {userProfile && !userProfile.approved && isTrialActive && (
                <div className="ml-4 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1 text-amber-600 shadow-sm animate-pulse">
                  <BadgeDollarSign size={12} className="text-amber-500" />
                  <span className="font-black italic">{trialDaysLeft} dias de teste</span>
                </div>
              )}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight italic leading-none flex items-center gap-4">
              {activeTab === 'dashboard' ? 'Overview' : 
               activeTab === 'logs' ? 'Auditoria' :
               activeTab === 'configuracoes' ? 'Configurações' :
               activeTab.toUpperCase()}
              {userProfile?.role === 'ADMIN' && activeTab === 'contratos' && (
                <span className="text-[10px] bg-blue-100 text-blue-600 px-3 py-1.5 rounded-2xl not-italic font-black flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  SISTEMA: {contratos.length} CARREGADOS
                </span>
              )}
            </h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {activeTab !== 'dashboard' && activeTab !== 'logs' && activeTab !== 'configuracoes' && (
              <>
                <button 
                  onClick={() => {
                    const newValue = !showArchived;
                    setShowArchived(newValue);
                    if (newValue && !archivedLoaded) {
                      fetchArchivedData();
                    }
                  }}
                  className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                    showArchived 
                      ? 'bg-amber-50 text-amber-600 border-amber-200' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600'
                  }`}
                >
                  {showArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                  {showArchived ? 'Ver Ativos' : 'Ver Arquivados'}
                </button>
                {can('CREATE', activeTab) && (
                  <button 
                    onClick={() => openCreateModal()}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 group"
                  >
                    <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    Novo {activeTab.slice(0, -1)}
                  </button>
                )}
              </>
            )}
          </div>
        </header>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </main>

      {/* Create Registration Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white sm:rounded-2xl shadow-2xl w-full sm:max-w-lg flex flex-col h-full sm:h-auto sm:max-h-[90vh] overflow-hidden border border-slate-200"
            >
              <form onSubmit={handleCreateSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
                  <h2 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-tight">
                    {editingItem ? 'Editar ' : 'Novo '}{activeTab === 'imoveis' ? 'Imóvel' : 
                         activeTab === 'inquilinos' ? 'Inquilino' :
                         activeTab === 'proprietarios' ? 'Proprietário' :
                         activeTab === 'contratos' ? 'Contrato' : 'Pagamento'}
                  </h2>
                  <button type="button" onClick={() => {
                    setCreateModalOpen(false);
                    setEditingItem(null);
                  }} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-3 sm:p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                  {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 animate-pulse mb-2">
                      <X size={14} /> {errorMsg}
                    </div>
                  )}
                  {activeTab === 'imoveis' && (
                    <>
                      <div>
                        <label className="text-[10px] font-black text-blue-600 uppercase mb-1 block flex justify-between">
                          Apelido / Nome do Imóvel
                          {formErrors.apelido && <span className="text-red-500 normal-case font-bold">{formErrors.apelido}</span>}
                        </label>
                        <input 
                          name="apelido" 
                          defaultValue={editingItem?.apelido}
                          onBlur={handleFieldBlur}
                          className={`w-full border-2 ${formErrors.apelido ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-bold transition-all placeholder:font-normal`} 
                          placeholder="Ex: Casa do Centro, Apartamento 301..."
                        />
                      </div>
                      <div className="grid grid-cols-6 gap-3">
                        <div className="col-span-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block flex justify-between">
                            CEP
                            {formErrors.cep ? (
                              <span className="text-red-500 normal-case font-bold">{formErrors.cep}</span>
                            ) : loadingCep && (
                              <span className="text-blue-500 normal-case font-bold animate-pulse">Buscando...</span>
                            )}
                          </label>
                          <div className="relative">
                            <input 
                              name="cep" 
                              onBlur={handleCepBlur}
                              defaultValue={editingItem?.cep}
                              required 
                              className={`w-full border-2 ${formErrors.cep ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} 
                              placeholder="00000-000" 
                            />
                            {loadingCep && <Loader2 className="absolute right-2 top-1.5 animate-spin text-blue-500" size={14} />}
                          </div>
                        </div>
                        <div className="col-span-3">
                          <div className="flex items-center gap-1 mb-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase block tracking-tight">Tipo Imóvel</label>
                            <div className="group relative">
                              <Info size={12} className="text-slate-400 cursor-help" />
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl z-[60] leading-tight">
                                <p className="font-bold mb-1 text-blue-400">Residencial:</p>
                                <p className="mb-2 text-slate-300">Imóveis para moradia. O sistema aplica regras padrão para contratos de locação residencial.</p>
                                <p className="font-bold mb-1 text-purple-400">Comercial:</p>
                                <p className="text-slate-300">Imóveis para fins de negócio. Afeta a vigência de prazos e permissões específicas de zoneamento.</p>
                                <div className="absolute left-2 top-full w-2 h-2 bg-slate-800 rotate-45 -mt-1"></div>
                              </div>
                            </div>
                          </div>
                          <select name="tipo_imovel" defaultValue={editingItem?.tipo_imovel || "RESIDENCIAL"} className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all appearance-none bg-white">
                            <option value="RESIDENCIAL">RESIDENCIAL</option>
                            <option value="COMERCIAL">COMERCIAL</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block tracking-tight">Status do Imóvel</label>
                        <select name="status" defaultValue={editingItem?.status || "Disponível"} className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all appearance-none bg-white">
                          <option value="Disponível">Disponível</option>
                          <option value="Alugado">Alugado</option>
                          <option value="Em Manutenção">Em Manutenção</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-8 gap-3">
                        <div className="md:col-span-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block flex justify-between">
                            Logradouro
                            {formErrors.endereco && <span className="text-red-500 normal-case font-bold">{formErrors.endereco}</span>}
                          </label>
                          <input name="endereco" defaultValue={editingItem?.endereco} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.endereco ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block flex justify-between">
                            Número
                            {formErrors.numero && <span className="text-red-500 normal-case font-bold">{formErrors.numero}</span>}
                          </label>
                          <input name="numero" defaultValue={editingItem?.numero} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.numero ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Complemento</label>
                          <input name="complemento" defaultValue={editingItem?.complemento} onBlur={handleFieldBlur} className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all" placeholder="Ex: Apto 101" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block flex justify-between">
                            Bairro
                            {formErrors.bairro && <span className="text-red-500 normal-case font-bold">{formErrors.bairro}</span>}
                          </label>
                          <input name="bairro" defaultValue={editingItem?.bairro} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.bairro ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block flex justify-between">
                            Cidade
                            {formErrors.cidade && <span className="text-red-500 normal-case font-bold">{formErrors.cidade}</span>}
                          </label>
                          <input name="cidade" defaultValue={editingItem?.cidade} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.cidade ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block flex justify-between">
                            UF
                            {formErrors.estado && <span className="text-red-500 normal-case font-bold">{formErrors.estado}</span>}
                          </label>
                          <input name="estado" maxLength={2} defaultValue={editingItem?.estado} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.estado ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium text-center uppercase transition-all`} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                        <div>
                          <label className="text-[10px] font-black text-orange-500 uppercase mb-1 block">Instalação CEMIG</label>
                          <input name="cemig" defaultValue={editingItem?.cemig} className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-blue-500 uppercase mb-1 block">Matrícula COPASA</label>
                          <input name="copasa" defaultValue={editingItem?.copasa} className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all" />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Obs / Detalhes</label>
                        <input name="descricao" defaultValue={editingItem?.descricao} className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all" placeholder="Apartamento, Fundos, etc" />
                      </div>
                    </>
                  )}

                  {activeTab === 'inquilinos' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>Nome Completo do Locatário</span>
                            {formErrors.nome && <span className="text-red-500 normal-case font-bold">{formErrors.nome}</span>}
                          </label>
                          <input name="nome" required onBlur={handleFieldBlur} defaultValue={editingItem?.nome} className={`w-full border-2 ${formErrors.nome ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-bold transition-all`} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>CPF do Locatário (Opcional)</span>
                            {formErrors.cpf_cnpj && <span className="text-red-500 normal-case font-bold">{formErrors.cpf_cnpj}</span>}
                          </label>
                          <input name="cpf_cnpj" onBlur={handleCpfBlur} onChange={handleDocumentChange} defaultValue={editingItem?.cpf_cnpj} className={`w-full border-2 ${formErrors.cpf_cnpj ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} placeholder="000.000.000-00" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>RG do Locatário (Opcional)</span>
                            {formErrors.rg && <span className="text-red-500 normal-case font-bold">{formErrors.rg}</span>}
                          </label>
                          <input name="rg" defaultValue={editingItem?.rg} onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.rg ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>Estado Civil</span>
                            {formErrors.estado_civil && <span className="text-red-500 normal-case font-bold">{formErrors.estado_civil}</span>}
                          </label>
                          <select name="estado_civil" defaultValue={editingItem?.estado_civil || 'SOLTEIRO'} className={`w-full border-2 ${formErrors.estado_civil ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all appearance-none bg-white`}>
                            <option value="SOLTEIRO">SOLTEIRO(A)</option>
                            <option value="CASADO">CASADO(A)</option>
                            <option value="DIVORCIADO">DIVORCIADO(A)</option>
                            <option value="VIUVO">VIÚVO(A)</option>
                            <option value="UNIAO_ESTAVEL">UNIÃO ESTÁVEL</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight">Profissão (Opcional)</label>
                          <input name="profissao" defaultValue={editingItem?.profissao} className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all" />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight">Nacionalidade</label>
                          <input name="nacionalidade" defaultValue={editingItem?.nacionalidade || "BRASILEIRO"} className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all" />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight">Naturalidade (Opcional)</label>
                          <input name="naturalidade" defaultValue={editingItem?.naturalidade} className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all" />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight">UF Nasc. (Opcional)</label>
                          <input name="uf_nascimento" maxLength={2} defaultValue={editingItem?.uf_nascimento} className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium text-center uppercase transition-all" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>E-mail de Contato (Opcional)</span>
                            {formErrors.email && <span className="text-red-500 normal-case font-bold">{formErrors.email}</span>}
                          </label>
                          <input name="email" type="email" placeholder="email@exemplo.com" onBlur={handleFieldBlur} defaultValue={editingItem?.email} className={`w-full border-2 ${formErrors.email ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>Telefone / WhatsApp (Opcional)</span>
                            {formErrors.telefone && <span className="text-red-500 normal-case font-bold">{formErrors.telefone}</span>}
                          </label>
                          <input name="telefone" placeholder="(00) 00000-0000" onBlur={handleFieldBlur} onChange={handlePhoneChange} defaultValue={editingItem?.telefone} className={`w-full border-2 ${formErrors.telefone ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-widest">Informações do Fiador (Se houver)</h4>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>Nome do Fiador</span>
                            {formErrors.nome_fiador && <span className="text-red-500 normal-case font-bold">{formErrors.nome_fiador}</span>}
                          </label>
                          <input name="nome_fiador" onBlur={handleFieldBlur} defaultValue={editingItem?.nome_fiador} className={`w-full border-2 ${formErrors.nome_fiador ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                              <span>CPF do Fiador</span>
                              {formErrors.cpf_fiador && <span className="text-red-500 normal-case font-bold">{formErrors.cpf_fiador}</span>}
                            </label>
                            <input name="cpf_fiador" onBlur={handleCpfBlur} onChange={handleDocumentChange} defaultValue={editingItem?.cpf_fiador} className={`w-full border-2 ${formErrors.cpf_fiador ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} placeholder="000.000.000-00" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                              <span>RG do Fiador</span>
                              {formErrors.rg_fiador && <span className="text-red-500 normal-case font-bold">{formErrors.rg_fiador}</span>}
                            </label>
                            <input name="rg_fiador" onBlur={handleFieldBlur} defaultValue={editingItem?.rg_fiador} className={`w-full border-2 ${formErrors.rg_fiador ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                              <span>CEP Fiador</span>
                              {formErrors.cep_fiador ? (
                                <span className="text-red-500 normal-case font-bold">{formErrors.cep_fiador}</span>
                              ) : loadingCep && (
                                <span className="text-blue-500 normal-case font-bold animate-pulse">Buscando...</span>
                              )}
                            </label>
                            <div className="relative">
                              <input 
                                name="cep_fiador" 
                                onBlur={handleCepBlur} 
                                defaultValue={editingItem?.cep_fiador} 
                                className={`w-full border-2 ${formErrors.cep_fiador ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} 
                                placeholder="00000-000" 
                              />
                              {loadingCep && <Loader2 className="absolute right-2 top-1.5 animate-spin text-blue-500" size={14} />}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                              <span>Endereço Completo do Fiador</span>
                              {formErrors.endereco_fiador && <span className="text-red-500 normal-case font-bold">{formErrors.endereco_fiador}</span>}
                            </label>
                            <input name="endereco_fiador" onBlur={handleFieldBlur} defaultValue={editingItem?.endereco_fiador} className={`w-full border-2 ${formErrors.endereco_fiador ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                          </div>
                        </div>

                        {/* Guarantor Documents Upload */}
                        <div className="pt-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-tight">Documentos do Fiador (RG, CPF, Comprovante Residência)</label>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {existingGuarantorDocs.map((url, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-blue-100">
                                <FileText size={12} />
                                <a href={url} target="_blank" rel="noopener noreferrer" className="truncate max-w-[100px] hover:underline flex items-center gap-1">
                                  Doc Fiador {idx + 1}
                                  <ExternalLink size={10} />
                                </a>
                                <button 
                                  type="button" 
                                  onClick={() => setExistingGuarantorDocs(prev => prev.filter((_, i) => i !== idx))}
                                  className="text-blue-400 hover:text-red-500 transition-colors ml-1"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                            {guarantorFilesToUpload.map((file, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-amber-100">
                                <Loader2 size={12} className="animate-pulse" />
                                <span className="truncate max-w-[100px]">{file.name}</span>
                                <button 
                                  type="button" 
                                  onClick={() => setGuarantorFilesToUpload(prev => prev.filter((_, i) => i !== idx))}
                                  className="text-amber-400 hover:text-red-500 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="relative group">
                            <input 
                              type="file" 
                              multiple 
                              onChange={(e) => {
                                if (e.target.files) {
                                  setGuarantorFilesToUpload(prev => [...prev, ...Array.from(e.target.files!)]);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="border-2 border-dashed border-slate-200 rounded-xl py-6 flex flex-col items-center justify-center gap-2 group-hover:border-blue-300 transition-all bg-slate-50/50">
                              <PlusCircle size={24} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anexar documentos do fiador</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'proprietarios' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                          <span>Nome Completo do Proprietário / Locador</span>
                          {formErrors.nome && <span className="text-red-500 normal-case font-bold">{formErrors.nome}</span>}
                        </label>
                        <input name="nome" defaultValue={editingItem?.nome} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.nome ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-bold transition-all`} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>CPF / CNPJ</span>
                            {formErrors.cpf_cnpj && <span className="text-red-500 normal-case font-bold">{formErrors.cpf_cnpj}</span>}
                          </label>
                          <input name="cpf_cnpj" required onBlur={handleCpfBlur} onChange={handleDocumentChange} defaultValue={editingItem?.cpf_cnpj} className={`w-full border-2 ${formErrors.cpf_cnpj ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} placeholder="000.000.000-00" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>RG do Locador</span>
                            {formErrors.rg && <span className="text-red-500 normal-case font-bold">{formErrors.rg}</span>}
                          </label>
                          <input name="rg" defaultValue={editingItem?.rg} onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.rg ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>Estado Civil</span>
                            {formErrors.estado_civil && <span className="text-red-500 normal-case font-bold">{formErrors.estado_civil}</span>}
                          </label>
                          <select name="estado_civil" defaultValue={editingItem?.estado_civil || 'SOLTEIRO'} className={`w-full border-2 ${formErrors.estado_civil ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all appearance-none bg-white`}>
                            <option value="SOLTEIRO">SOLTEIRO(A)</option>
                            <option value="CASADO">CASADO(A)</option>
                            <option value="DIVORCIADO">DIVORCIADO(A)</option>
                            <option value="VIUVO">VIÚVO(A)</option>
                            <option value="UNIAO_ESTAVEL">UNIÃO ESTÁVEL</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>CEP Locador</span>
                            {formErrors.cep ? (
                              <span className="text-red-500 normal-case font-bold">{formErrors.cep}</span>
                            ) : loadingCep && (
                              <span className="text-blue-500 normal-case font-bold animate-pulse">Buscando...</span>
                            )}
                          </label>
                          <div className="relative">
                            <input 
                              name="cep" 
                              onBlur={handleCepBlur} 
                              defaultValue={editingItem?.cep} 
                              className={`w-full border-2 ${formErrors.cep ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} 
                              placeholder="00000-000" 
                            />
                            {loadingCep && <Loader2 className="absolute right-2 top-1.5 animate-spin text-blue-500" size={14} />}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>Telefone de Contato</span>
                            {formErrors.telefone && <span className="text-red-500 normal-case font-bold">{formErrors.telefone}</span>}
                          </label>
                          <input name="telefone" onChange={handlePhoneChange} onBlur={handleFieldBlur} defaultValue={editingItem?.telefone} className={`w-full border-2 ${formErrors.telefone ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Endereço Residencial do Locador</h4>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>Logradouro / Endereço</span>
                            {formErrors.endereco && <span className="text-red-500 normal-case font-bold">{formErrors.endereco}</span>}
                          </label>
                          <input name="endereco" defaultValue={editingItem?.endereco} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.endereco ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                              <span>Bairro</span>
                              {formErrors.bairro && <span className="text-red-500 normal-case font-bold">{formErrors.bairro}</span>}
                            </label>
                            <input name="bairro" defaultValue={editingItem?.bairro} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.bairro ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                              <span>Cidade</span>
                              {formErrors.cidade && <span className="text-red-500 normal-case font-bold">{formErrors.cidade}</span>}
                            </label>
                            <input name="cidade" defaultValue={editingItem?.cidade} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.cidade ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                              <span>UF</span>
                              {formErrors.estado && <span className="text-red-500 normal-case font-bold">{formErrors.estado}</span>}
                            </label>
                            <input name="estado" maxLength={2} defaultValue={editingItem?.estado} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.estado ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium text-center uppercase transition-all`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'contratos' && (
                    <div className="space-y-3">
                      {userProfile?.role === 'ADMIN' ? (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>Proprietário / Locador</span>
                            {formErrors.proprietario_id && <span className="text-red-500 normal-case font-bold">{formErrors.proprietario_id}</span>}
                          </label>
                          <select name="proprietario_id" defaultValue={editingItem?.proprietario_id || ""} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.proprietario_id ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all appearance-none bg-white`}>
                            <option value="">Selecione o Proprietário...</option>
                            {proprietarios.map(pr => <option key={pr.id} value={pr.id}>{pr.nome}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <label className="text-[8px] font-black text-slate-400 uppercase mb-1 block tracking-widest">Proprietário / Locador</label>
                          <p className="text-[11px] font-black text-slate-800 uppercase">{proprietarios.find(p => p.id === userProfile?.proprietario_id)?.nome || userProfile?.nome || 'Seu Cadastro'}</p>
                          <input type="hidden" name="proprietario_id" value={userProfile?.proprietario_id || ""} />
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>Imóvel</span>
                            {formErrors.imovel_id && <span className="text-red-500 normal-case font-bold">{formErrors.imovel_id}</span>}
                          </label>
                          {imoveis.length > 0 ? (
                            <select name="imovel_id" defaultValue={editingItem?.imovel_id || ""} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.imovel_id ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all appearance-none bg-white`}>
                              <option value="">Selecione o Imóvel...</option>
                              {imoveis.map(im => {
                                const isRented = im.status === 'Alugado' && editingItem?.imovel_id !== im.id;
                                return (
                                  <option 
                                    key={im.id} 
                                    value={im.id} 
                                    disabled={isRented}
                                    className={isRented ? 'text-slate-300' : ''}
                                  >
                                    {im.apelido ? `[${im.apelido}] ${im.endereco}` : im.endereco}, {im.numero} 
                                    {isRented ? ' (INDISPONÍVEL - JÁ ALUGADO)' : ` (${im.status || 'Disponível'})`}
                                  </option>
                                );
                              })}
                            </select>
                          ) : (
                            <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg border border-red-100 italic">Nenhum imóvel disponível. Cadastre um primeiro.</p>
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>Inquilino / Locatário</span>
                            {formErrors.inquilino_id && <span className="text-red-500 normal-case font-bold">{formErrors.inquilino_id}</span>}
                          </label>
                          {inquilinos.length > 0 ? (
                            <select name="inquilino_id" defaultValue={editingItem?.inquilino_id || ""} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.inquilino_id ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all appearance-none bg-white`}>
                              <option value="">Selecione o Inquilino...</option>
                              {inquilinos.map(inq => <option key={inq.id} value={inq.id}>{inq.nome}</option>)}
                            </select>
                          ) : (
                            <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg border border-red-100 italic">Nenhum inquilino cadastrado.</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>Valor Mensal (R$)</span>
                            {formErrors.valor_aluguel && <span className="text-red-500 normal-case font-bold">{formErrors.valor_aluguel}</span>}
                          </label>
                          <input name="valor_aluguel" type="number" step="0.01" defaultValue={editingItem?.valor_aluguel || "1500.00"} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.valor_aluguel  ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-bold transition-all`} />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>Dia do Vencimento</span>
                            {formErrors.dia_vencimento && <span className="text-red-500 normal-case font-bold">{formErrors.dia_vencimento}</span>}
                          </label>
                          <input name="dia_vencimento" type="number" min="1" max="31" defaultValue={editingItem?.dia_vencimento || 10} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.dia_vencimento  ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-bold transition-all`} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>Data de Início</span>
                            {formErrors.data_inicio && <span className="text-red-500 normal-case font-bold">{formErrors.data_inicio}</span>}
                          </label>
                          <input name="data_inicio" type="date" onChange={handleStartDateChange} defaultValue={editingItem?.data_inicio} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.data_inicio ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>Data de Término</span>
                            {formErrors.data_fim && <span className="text-red-500 normal-case font-bold">{formErrors.data_fim}</span>}
                          </label>
                          <input name="data_fim" type="date" defaultValue={editingItem?.data_fim} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.data_fim ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all`} />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-tight">Arquivo PDF do Contrato</label>
                        <div className="relative group">
                          {contractFileUrl && !contractFileToUpload ? (
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100 mb-2">
                               <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <FileText size={16} />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-blue-700 uppercase">Contrato Selecionado</p>
                                    <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">documento_anexo.pdf</p>
                                  </div>
                               </div>
                               <button 
                                 type="button"
                                 onClick={() => setContractFileUrl(null)}
                                 className="p-2 text-blue-400 hover:text-red-500 transition-colors"
                               >
                                 <X size={16} />
                               </button>
                            </div>
                          ) : contractFileToUpload ? (
                            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100 mb-2">
                               <div className="flex items-center gap-3">
                                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg animate-pulse">
                                    <FileText size={16} />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-amber-700 uppercase">Novo Arquivo</p>
                                    <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">{contractFileToUpload.name}</p>
                                  </div>
                               </div>
                               <button 
                                 type="button"
                                 onClick={() => setContractFileToUpload(null)}
                                 className="p-2 text-amber-400 hover:text-red-500 transition-colors"
                               >
                                 <X size={16} />
                               </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-blue-400 transition-all cursor-pointer bg-slate-50 group-hover:bg-blue-50/30">
                              <input 
                                type="file" 
                                accept=".pdf"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    setContractFileToUpload(e.target.files[0]);
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className="text-center">
                                <FileUp size={24} className="mx-auto text-slate-400 mb-1 group-hover:text-blue-500 transition-colors" />
                                <p className="text-[10px] font-bold text-slate-500 group-hover:text-blue-700">Selecione o PDF do Contrato</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                        <div className="pt-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Cláusulas do Contrato (Edição Rica)</label>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 flex flex-col gap-0.5">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Modelo Selecionado</label>
                                <select 
                                  className="text-[10px] bg-white border-2 border-slate-100 px-2 py-1.5 rounded-lg font-bold text-slate-600 focus:outline-none focus:border-blue-400 transition-all min-w-[140px]"
                                  value={selectedTemplateIdx}
                                  onChange={(e) => setSelectedTemplateIdx(parseInt(e.target.value))}
                                >
                                  {contractTemplates.map((t, idx) => (
                                    <option key={idx} value={idx}>{t.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex flex-col gap-0.5">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 text-center">Alinhamento</label>
                                <div className="flex items-center border-2 border-slate-100 rounded-lg overflow-hidden bg-white">
                                  <button
                                    type="button"
                                    onClick={() => setContractAlignment('left')}
                                    className={`p-1.5 transition-colors ${contractAlignment === 'left' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                                    title="Alinhar à Esquerda"
                                  >
                                    <AlignLeft size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setContractAlignment('center')}
                                    className={`p-1.5 transition-colors ${contractAlignment === 'center' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                                    title="Centralizar"
                                  >
                                    <AlignCenter size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setContractAlignment('right')}
                                    className={`p-1.5 transition-colors ${contractAlignment === 'right' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                                    title="Alinhar à Direita"
                                  >
                                    <AlignRight size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setContractAlignment('justify')}
                                    className={`p-1.5 transition-colors ${contractAlignment === 'justify' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                                    title="Justificar"
                                  >
                                    <AlignJustify size={14} />
                                  </button>
                                </div>
                                <input type="hidden" name="alinhamento_texto" value={contractAlignment} />
                              </div>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  const form = (e.target as HTMLElement).closest('form');
                                  if (form) generateContractTemplate(form as HTMLFormElement);
                                }}
                                className="mt-3 text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-black uppercase tracking-widest transition-all shadow-md shadow-blue-100 flex items-center gap-1"
                              >
                                Aplicar Modelo
                              </button>
                            </div>
                          </div>
                          
                          <input type="hidden" name="clausulas" value={clausulasHtml} />
                          <RichEditor 
                            content={clausulasHtml}
                            onChange={(html) => setClausulasHtml(html)}
                            activeDropdown={activeEditorDropdown}
                            setActiveDropdown={setActiveEditorDropdown}
                          />
                        </div>

                      <div className="pt-4 border-t border-slate-100">
                        <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-tight">Anexar Documentos (RG, Comprovantes, etc)</label>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {existingDocs.map((url, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-blue-100">
                              <FileText size={12} />
                              <span className="truncate max-w-[100px]">Doc {idx + 1}</span>
                              <button 
                                type="button" 
                                onClick={() => setExistingDocs(prev => prev.filter((_, i) => i !== idx))}
                                className="text-blue-400 hover:text-red-500 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {filesToUpload.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-amber-100">
                              <Loader2 size={12} className="animate-pulse" />
                              <span className="truncate max-w-[100px]">{file.name}</span>
                              <button 
                                type="button" 
                                onClick={() => setFilesToUpload(prev => prev.filter((_, i) => i !== idx))}
                                className="text-amber-400 hover:text-red-500 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="relative group">
                          <input 
                            type="file" 
                            multiple 
                            onChange={(e) => {
                              if (e.target.files) {
                                setFilesToUpload(prev => [...prev, ...Array.from(e.target.files!)]);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="border-2 border-dashed border-slate-200 rounded-xl py-6 flex flex-col items-center justify-center gap-2 group-hover:border-blue-300 transition-all bg-slate-50/50">
                            <PlusCircle size={24} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clique ou arraste arquivos para anexar</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'pagamentos' && (
                    <>
                      <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase mb-0.5 block flex justify-between tracking-tighter">
                          <span>Contrato Ativo</span>
                          {formErrors.contrato_id && <span className="text-red-500 normal-case font-bold">{formErrors.contrato_id}</span>}
                        </label>
                        <select name="contrato_id" required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.contrato_id ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-sm font-medium transition-all appearance-none bg-white`}>
                          <option value="">Selecione...</option>
                          {contratos.map(co => (
                            <option key={co.id} value={co.id}>
                              {co.inquilinos?.nome} - {co.imoveis?.endereco}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase mb-0.5 block flex justify-between tracking-tighter">
                            <span>Valor Recebido (R$)</span>
                            {formErrors.valor_pago && <span className="text-red-500 normal-case font-bold">{formErrors.valor_pago}</span>}
                          </label>
                          <input name="valor_pago" type="number" step="0.01" required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.valor_pago ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-sm font-medium transition-all`} />
                        </div>
                        <div>
                          <label className="text-[8px] font-black text-slate-400 uppercase mb-0.5 block flex justify-between tracking-tighter">
                            <span>Ano</span>
                            {formErrors.competencia_ano && <span className="text-red-500 normal-case font-bold">{formErrors.competencia_ano}</span>}
                          </label>
                          <input name="competencia_ano" type="number" defaultValue={new Date().getFullYear().toString()} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.competencia_ano ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-2 py-1.5 text-sm font-medium transition-all`} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase mb-0.5 block tracking-tighter">Mês Referência</label>
                        <div className="grid grid-cols-6 gap-1">
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                            <label key={m} className={`relative flex items-center justify-center p-1.5 border-2 rounded-lg cursor-pointer transition-all text-[10px] font-bold text-slate-600 has-[:checked]:bg-blue-600 has-[:checked]:text-white has-[:checked]:border-blue-600 ${m === (new Date().getMonth() + 1) ? 'border-blue-200 bg-blue-50/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                              <input type="radio" name="competencia_mes" value={m} defaultChecked={m === (new Date().getMonth() + 1)} required className="absolute opacity-0" />
                              {m.toString().padStart(2, '0')}
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-3 sm:p-4 bg-slate-50 flex justify-end gap-2 border-t border-slate-100 flex-shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest text-[10px] sm:text-xs"
                  >
                    Descartar
                  </button>
                  <button 
                    type="submit"
                    disabled={loading || success}
                    className="bg-slate-900 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : success ? <CheckCircle2 size={14} /> : 'Salvar Registro'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Basic Receipt Modal */}
      <AnimatePresence>
        {isReceiptModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">Visualização do Recibo</h2>
                <button 
                  onClick={() => setReceiptModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <PlusCircle size={24} className="rotate-45" />
                </button>
              </div>
              
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar" id="printable-area">
                {[1, 2].map((via) => (
                  <div key={via} className={`${via === 2 ? 'print:mt-16 pt-8 border-t-2 border-dashed border-slate-200' : ''}`}>
                    <div className="relative border-4 border-slate-200 p-8 rounded-lg space-y-8 print:border-none print:p-0">
                      <div className="absolute top-4 right-4 text-[10px] font-black text-slate-300 uppercase tracking-widest hidden print:block">
                        {via === 1 ? '1ª VIA - LOCADOR' : '2ª VIA - INQUILINO'}
                      </div>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h1 className="text-3xl font-black text-slate-900 uppercase">Recibo</h1>
                          <p className="text-slate-500 font-medium">Nº 0001/2026</p>
                        </div>
                        <div className="text-right">
                          {isEditing ? (
                            via === 1 && (
                              <div className="flex flex-col gap-1 items-end">
                                 <span className="text-xs text-slate-400 font-bold uppercase">Valor R$</span>
                                 <input 
                                   type="number" 
                                   value={receiptData.valor} 
                                   onChange={(e) => handleReceiptChange('valor', parseFloat(e.target.value))}
                                   className="text-2xl font-black text-blue-600 border rounded px-2 w-32 border-blue-200"
                                 />
                              </div>
                            )
                          ) : (
                            <p className="text-2xl font-black text-blue-600">{formatarMoeda(receiptData.valor)}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4 text-slate-800 leading-relaxed text-lg">
                        {isEditing ? (
                          via === 1 ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-400 uppercase">Nome Inquilino</label>
                                  <input 
                                    className="w-full border rounded px-3 py-2 text-sm" 
                                    value={receiptData.inquilino} 
                                    onChange={(e) => handleReceiptChange('inquilino', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-400 uppercase">CPF/CNPJ</label>
                                  <input 
                                    className="w-full border rounded px-3 py-2 text-sm" 
                                    value={receiptData.cpf} 
                                    onChange={(e) => handleReceiptChange('cpf', e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Endereço</label>
                                    <input 
                                      className="w-full border rounded px-3 py-2 text-sm" 
                                      value={receiptData.endereco} 
                                      onChange={(e) => handleReceiptChange('endereco', e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Nº</label>
                                    <input 
                                      className="w-full border rounded px-3 py-2 text-sm" 
                                      value={receiptData.numero} 
                                      onChange={(e) => handleReceiptChange('numero', e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Bairro</label>
                                    <input 
                                      className="w-full border rounded px-3 py-2 text-sm" 
                                      value={receiptData.bairro} 
                                      onChange={(e) => handleReceiptChange('bairro', e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">CEP</label>
                                    <input 
                                      className="w-full border rounded px-3 py-2 text-sm" 
                                      value={receiptData.cep} 
                                      onChange={(e) => handleReceiptChange('cep', e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-400 uppercase">Cidade</label>
                                  <input 
                                    className="w-full border rounded px-3 py-2 text-sm" 
                                    value={receiptData.cidade} 
                                    onChange={(e) => handleReceiptChange('cidade', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-400 uppercase">UF</label>
                                  <input 
                                    className="w-full border rounded px-3 py-2 text-sm" 
                                    value={receiptData.estado} 
                                    onChange={(e) => handleReceiptChange('estado', e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Competência</label>
                                <input 
                                  className="w-full border rounded px-3 py-2 text-sm" 
                                  value={receiptData.competencia} 
                                  onChange={(e) => handleReceiptChange('competencia', e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-400 uppercase">Nome Locador</label>
                                  <input 
                                    className="w-full border rounded px-3 py-2 text-sm" 
                                    value={receiptData.locador} 
                                    onChange={(e) => handleReceiptChange('locador', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-400 uppercase">CPF/CNPJ Locador</label>
                                  <input 
                                    className="w-full border rounded px-3 py-2 text-sm" 
                                    value={receiptData.locador_cpf} 
                                    onChange={(e) => handleReceiptChange('locador_cpf', e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 italic">
                                <p>A segunda via será gerada automaticamente na impressão.</p>
                            </div>
                          )
                        ) : (
                          <>
                            <p>
                              Recebemos de <span className="font-bold border-b border-slate-300 pb-0.5">{receiptData.inquilino}</span>, 
                              inscrito sob o CPF/CNPJ <span className="font-bold">{receiptData.cpf}</span>, 
                              a importância supra de <span className="font-bold">{numeroParaExtenso(receiptData.valor)}</span>.
                            </p>
                            <p>
                              Referente ao pagamento do aluguel do imóvel situado em: <br/>
                              <span className="font-medium">{receiptData.endereco}, {receiptData.numero} - {receiptData.bairro}, {receiptData.cidade} - {receiptData.estado}, CEP: {receiptData.cep}</span>
                            </p>
                            <p>
                              Competência: <span className="font-bold">{receiptData.competencia}</span>.
                            </p>
                          </>
                        )}
                      </div>

                      <div className="pt-12 flex flex-col items-center gap-12">
                        <p className="text-slate-400 font-medium italic underline decoration-dotted underline-offset-4">Local/Data: ____________________, ____ de ____________ de 20____</p>
                        <div className="flex flex-col items-center gap-1 text-center">
                          <div className="w-64 border-t-2 border-slate-900 pt-2 text-sm font-bold uppercase tracking-widest text-slate-900">
                            {receiptData.locador}
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Locador - {receiptData.locador_cpf}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-6 py-2.5 font-medium rounded-lg transition-all border ${
                    isEditing ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  {isEditing ? 'Salvar Edição' : 'Editar Recibo'}
                </button>
                <button 
                  onClick={generateReceiptPDF}
                  className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 shadow-md shadow-slate-200 flex items-center gap-2"
                >
                  <FileDown size={18} />
                  Baixar PDF
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 flex items-center gap-2"
                >
                  <Printer size={18} />
                  Imprimir Recibo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Details Modal (Map) */}
      <AnimatePresence>
        {isViewModalOpen && viewingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Detalhes do Imóvel</h2>
                    <p className="text-xs text-slate-500 font-medium">Informações completas e localização</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                {/* Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Endereço Principal</label>
                      <p className="text-lg font-bold text-slate-800">{viewingItem.endereco}, {viewingItem.numero}{viewingItem.complemento ? ` - ${viewingItem.complemento}` : ''}</p>
                      <p className="text-sm text-slate-500 font-medium">{viewingItem.bairro} - {viewingItem.cidade} / {viewingItem.estado}</p>
                      <p className="text-xs text-slate-400 mt-1 font-mono uppercase">CEP: {viewingItem.cep}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                       <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status Atual</label>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                            viewingItem.status === 'Disponível' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {viewingItem.status || 'Disponível'}
                          </span>
                       </div>
                       <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tipo de Imóvel</label>
                          <span className="text-xs font-bold text-slate-700 uppercase">{viewingItem.tipo_imovel || 'RESIDENCIAL'}</span>
                       </div>
                    </div>

                    {/* Active Contract Info if Rented */}
                    {viewingItem.status === 'Alugado' && (
                       <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-3">
                          <div className="flex items-center gap-2 text-amber-800">
                             <FileText size={16} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Informações do Contrato</span>
                          </div>
                          {(() => {
                             const contract = contratos.find(c => c.imovel_id === viewingItem.id);
                             if (!contract) return <p className="text-[10px] text-amber-600 font-bold italic">Contrato não localizado no sistema.</p>;
                             
                             const contractLink = contract.arquivo_url || (contract.documentos && contract.documentos[0]);
                             
                             return (
                                <div className="space-y-2">
                                   <div className="flex justify-between items-center text-xs">
                                      <span className="text-amber-700 font-medium">Locatário/Inquilino:</span>
                                      <span className="text-amber-800 font-black uppercase tracking-tighter">{contract.inquilinos?.nome || 'Não informado'}</span>
                                   </div>
                                   {contractLink && (
                                      <a 
                                        href={contractLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full mt-2 bg-amber-600 text-white flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-colors shadow-sm"
                                      >
                                         <Download size={12} />
                                         Acessar Arquivo do Contrato
                                      </a>
                                   )}
                                </div>
                             );
                          })()}
                       </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-2">Contas de Serviço</label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-bold uppercase">Cemig (Luz):</span>
                          <span className="text-blue-700 font-black font-mono">{viewingItem.cemig || '--'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-bold uppercase">Copasa (Água):</span>
                          <span className="text-blue-700 font-black font-mono">{viewingItem.copasa || '--'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Section */}
                <div className="space-y-3">
                   <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-blue-600" />
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização Geográfica</label>
                   </div>
                   <PropertyMap 
                     address={viewingItem.endereco}
                     city={viewingItem.cidade}
                     state={viewingItem.estado}
                     number={viewingItem.numero}
                     neighborhood={viewingItem.bairro}
                     cep={viewingItem.cep}
                   />
                </div>

                {/* Description/Notes */}
                {viewingItem.descricao && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-black">Observações Internas</label>
                    <p className="text-sm text-slate-600 italic leading-relaxed">{viewingItem.descricao}</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setViewModalOpen(false)}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  Fechar Detalhes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Tag Guide Modal */}
      <AnimatePresence>
        {isTagGuideOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-600 text-white rounded-lg">
                      <Hash size={24} />
                   </div>
                   <div>
                      <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Dicionário de Tags do Contrato</h2>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Clique na tag para copiar</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsTagGuideOpen(false)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Locador */}
                  <div className="space-y-4">
                     <h3 className="text-[12px] font-black text-blue-600 uppercase tracking-[0.2em] border-b-2 border-blue-100 pb-2 flex items-center gap-2">
                       <User size={14} /> Locador
                     </h3>
                     <div className="space-y-1">
                       <TagItem label="Nome Completo" tag="{{locador_nome}}" />
                       <TagItem label="CPF / CNPJ" tag="{{locador_cpf_cnpj}}" />
                       <TagItem label="RG" tag="{{locador_rg}}" />
                       <TagItem label="Estado Civil" tag="{{locador_estado_civil}}" />
                       <TagItem label="Endereço" tag="{{locador_endereco}}" />
                       <TagItem label="Bairro" tag="{{locador_bairro}}" />
                       <TagItem label="Cidade" tag="{{locador_cidade}}" />
                       <TagItem label="UF" tag="{{locador_uf}}" />
                       <TagItem label="E-mail" tag="{{locador_email}}" />
                       <TagItem label="Telefone" tag="{{locador_telefone}}" />
                     </div>
                  </div>

                  {/* Locatário */}
                  <div className="space-y-4">
                     <h3 className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b-2 border-indigo-100 pb-2 flex items-center gap-2">
                       <Users size={14} /> Locatário
                     </h3>
                     <div className="space-y-1">
                       <TagItem label="Nome Completo" tag="{{locatario_nome}}" />
                       <TagItem label="CPF / CNPJ" tag="{{locatario_cpf_cnpj}}" />
                       <TagItem label="RG" tag="{{locatario_rg}}" />
                       <TagItem label="Profissão" tag="{{locatario_profissao}}" />
                       <TagItem label="Estado Civil" tag="{{locatario_estado_civil}}" />
                       <TagItem label="Nacionalidade" tag="{{locatario_nacionalidade}}" />
                       <TagItem label="Naturalidade" tag="{{locatario_naturalidade}}" />
                       <TagItem label="UF Nasc." tag="{{locatario_uf_nasc}}" />
                       <TagItem label="E-mail" tag="{{locatario_email}}" />
                       <TagItem label="Telefone" tag="{{locatario_telefone}}" />
                     </div>
                  </div>

                  {/* Fiador */}
                  <div className="space-y-4">
                     <h3 className="text-[12px] font-black text-amber-600 uppercase tracking-[0.2em] border-b-2 border-amber-100 pb-2 flex items-center gap-2">
                       <ShieldCheck size={14} /> Fiador
                     </h3>
                     <div className="space-y-1">
                       <TagItem label="Nome Fiador" tag="{{fiador_nome}}" />
                       <TagItem label="CPF Fiador" tag="{{fiador_cpf}}" />
                       <TagItem label="RG Fiador" tag="{{fiador_rg}}" />
                       <TagItem label="CEP Fiador" tag="{{fiador_cep}}" />
                       <TagItem label="Endereço Fiador" tag="{{fiador_endereco}}" />
                     </div>
                  </div>

                  {/* Imóvel */}
                  <div className="space-y-4">
                     <h3 className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.2em] border-b-2 border-emerald-100 pb-2 flex items-center gap-2">
                       <Building size={14} /> Imóvel
                     </h3>
                     <div className="space-y-1">
                       <TagItem label="Endereço / Logradouro" tag="{{imovel_endereco}}" />
                       <TagItem label="Número" tag="{{imovel_numero}}" />
                       <TagItem label="Bairro" tag="{{imovel_bairro}}" />
                       <TagItem label="Cidade" tag="{{imovel_cidade}}" />
                       <TagItem label="UF" tag="{{imovel_uf}}" />
                       <TagItem label="CEP" tag="{{imovel_cep}}" />
                       <TagItem label="Tipo de Imóvel" tag="{{imovel_tipo}}" />
                       <TagItem label="Instalação CEMIG" tag="{{imovel_cemig}}" />
                       <TagItem label="Matrícula COPASA" tag="{{imovel_copasa}}" />
                       <TagItem label="Observações" tag="{{imovel_obs}}" />
                     </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                   <h4 className="text-[12px] font-black text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <FileText size={14} /> Dados do Contrato
                   </h4>
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                     <TagItem label="Valor (R$)" tag="{{valor_aluguel}}" />
                     <TagItem label="Valor Extenso" tag="{{valor_extenso}}" />
                     <TagItem label="Vencimento (Dia)" tag="{{dia_vencimento}}" />
                     <TagItem label="Início Vigência" tag="{{data_inicio}}" />
                     <TagItem label="Fim Vigência" tag="{{data_fim}}" />
                   </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                 <p className="text-[10px] text-slate-400 font-bold uppercase italic">Use estas tags dentro do editor de cláusulas para preenchimento automático.</p>
                 <button 
                   onClick={() => setIsTagGuideOpen(false)}
                   className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
                 >
                   Fechar Guia
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isChangePasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col"
            >
              <div className="px-8 pt-8 pb-4 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
                  <Lock size={20} className="text-blue-500" />
                  Alterar Senha
                </h3>
                <button onClick={() => setIsChangePasswordOpen(false)} className="text-slate-300 hover:text-slate-500"><X size={24} /></button>
              </div>

              <div className="p-8 space-y-4 text-slate-700">
                <form id="change-pwd-form" onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Nova Senha</label>
                    <input 
                      type="password"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all text-sm"
                      placeholder="Mínimo 6 caracteres"
                      value={pwdForm.new}
                      onChange={(e) => setPwdForm({...pwdForm, new: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Confirmar Nova Senha</label>
                    <input 
                      type="password"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all text-sm"
                      placeholder="Repita a nova senha"
                      value={pwdForm.confirm}
                      onChange={(e) => setPwdForm({...pwdForm, confirm: e.target.value})}
                    />
                  </div>
                </form>
              </div>

              <div className="p-8 bg-slate-50 flex items-center justify-end gap-3 rounded-b-[2.5rem]">
                <button 
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  form="change-pwd-form"
                  disabled={loading}
                  className="bg-blue-600 border border-blue-700 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2 flex-1 max-w-[160px]"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Salvar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Finance Modal */}
      <AnimatePresence>
        {financeModalOpen && selectedContractForFinance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Painel Financeiro do Contrato</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedContractForFinance.imoveis?.endereco} - {selectedContractForFinance.inquilinos?.nome}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFinanceModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Resumo do Contrato</h4>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-500 font-medium">Valor do Aluguel:</span>
                           <span className="font-black text-slate-800">{formatarMoeda(selectedContractForFinance.valor_aluguel)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-500 font-medium">Dia Vencimento:</span>
                           <span className="font-black text-slate-800">Todo dia {selectedContractForFinance.dia_vencimento}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-2">
                           <span className="text-slate-500 font-medium">Total Recebido:</span>
                           <span className="font-black text-green-600">{formatarMoeda(pagamentos
                             .filter(p => p.contrato_id === selectedContractForFinance.id && p.status === StatusPagamento.PAGO)
                             .reduce((acc, p) => acc + (p.valor_pago || 0), 0))}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-500 font-medium">Saldo Pendente:</span>
                           <span className="font-black text-amber-600">{formatarMoeda(pagamentos
                             .filter(p => p.contrato_id === selectedContractForFinance.id && p.status !== StatusPagamento.PAGO)
                             .reduce((acc, p) => acc + (p.valor_esperado || 0), 0))}</span>
                        </div>
                        <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-2">
                           {(!selectedContractForFinance.arquivado) && (
                             <button
                               onClick={() => {
                                 handleFinishContract(selectedContractForFinance);
                                 setFinanceModalOpen(false);
                               }}
                               className="w-full py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                             >
                               <Ban size={14} />
                               Finalizar Contrato
                             </button>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Controle de Parcelas</h4>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-tight border-b border-slate-50">
                                 <th className="pb-2">Mês/Ano</th>
                                 <th className="pb-2">Vencimento</th>
                                 <th className="pb-2">Valor</th>
                                 <th className="pb-2 text-center">Status</th>
                                 <th className="pb-2 text-right">Ações</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              {pagamentos
                                .filter(p => p.contrato_id === selectedContractForFinance.id)
                                .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())
                                .map(p => {
                                  const isAtrasado = p.status !== StatusPagamento.PAGO && new Date(p.data_vencimento) < new Date();
                                  return (
                                    <tr key={p.id} className="text-sm hover:bg-slate-50/80 transition-colors">
                                       <td className="py-3 font-bold text-slate-600">
                                          {p.competencia_mes.toString().padStart(2, '0')}/{p.competencia_ano}
                                       </td>
                                       <td className="py-3 text-slate-500">
                                          {new Date(p.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                                       </td>
                                       <td className="py-3 font-black text-slate-800">
                                          {formatarMoeda(p.valor_esperado || selectedContractForFinance.valor_aluguel)}
                                       </td>
                                       <td className="py-3">
                                          <div className="flex justify-center">
                                            {p.status === StatusPagamento.PAGO ? (
                                              <span className="text-[9px] font-black bg-green-50 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1">
                                                 <CheckCircle2 size={10} /> Pago
                                              </span>
                                            ) : isAtrasado ? (
                                              <span className="text-[9px] font-black bg-red-50 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1 animate-pulse">
                                                 <AlertCircle size={10} /> Atrasado
                                              </span>
                                            ) : (
                                              <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                 Pendente
                                              </span>
                                            )}
                                          </div>
                                       </td>
                                       <td className="py-3 text-right">
                                          {p.status !== StatusPagamento.PAGO ? (
                                            <button 
                                              onClick={() => handleMarkAsPaid(p, p.valor_esperado || selectedContractForFinance.valor_aluguel)}
                                              className="bg-green-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-md shadow-green-100"
                                            >
                                              Baixar
                                            </button>
                                          ) : (
                                            <button 
                                              onClick={() => {
                                                const contrato = selectedContractForFinance;
                                                const locadorNome = contrato?.proprietarios?.nome || contrato?.imoveis?.proprietarios?.nome || 'N/A';
                                                const locadorCpf = contrato?.proprietarios?.cpf_cnpj || contrato?.imoveis?.proprietarios?.cpf_cnpj || 'N/A';
                                                setReceiptData({
                                                  inquilino: contrato?.inquilinos?.nome || 'N/A',
                                                  cpf: contrato?.inquilinos?.cpf_cnpj || 'N/A',
                                                  valor: p.valor_pago || 0,
                                                  competencia: `${p.competencia_mes}/${p.competencia_ano}`,
                                                  locador: locadorNome,
                                                  locador_cpf: locadorCpf,
                                                  endereco: contrato?.imoveis?.endereco || 'N/A',
                                                  numero: contrato?.imoveis?.numero || '',
                                                  complemento: contrato?.imoveis?.complemento || '',
                                                  bairro: contrato?.imoveis?.bairro || '',
                                                  cidade: contrato?.imoveis?.cidade || '',
                                                  estado: contrato?.imoveis?.estado || '',
                                                  cep: contrato?.imoveis?.cep || '',
                                                  data: p.data_pagamento ? new Date(p.data_pagamento).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')
                                                });
                                                setReceiptModalOpen(true);
                                              }}
                                              className="text-slate-400 hover:text-blue-600 p-1"
                                              title="Ver Recibo"
                                            >
                                              <Printer size={16} />
                                            </button>
                                          )}
                                       </td>
                                    </tr>
                                  );
                                })}
                           </tbody>
                        </table>
                     </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center transition-all">
                <div className="flex gap-4">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total do Contrato</span>
                      <span className="text-lg font-black text-slate-800">
                        {formatarMoeda(pagamentos
                          .filter(p => p.contrato_id === selectedContractForFinance.id)
                          .reduce((acc, p) => acc + (p.valor_esperado || 0), 0))}
                      </span>
                   </div>
                </div>
                <button 
                  onClick={() => setFinanceModalOpen(false)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  Fechar Painel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Modal de Renovação */}
      <AnimatePresence>
        {isRenewModalOpen && contractToRenew && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-lg">
                    <ArchiveRestore size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-indigo-900 uppercase tracking-tight italic">Renovação de Contrato</h2>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{contractToRenew.imoveis?.apelido || contractToRenew.imoveis?.endereco}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsRenewModalOpen(false)}
                  className="p-2 text-indigo-400 hover:text-indigo-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleRenewContract}>
                <div className="p-6 space-y-5">
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex gap-3">
                    <Info size={18} className="text-amber-500 shrink-0" />
                    <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                      A renovação irá estender a data final do contrato e opcionalmente atualizar o valor do aluguel. 
                      <strong className="block mt-1">O histórico financeiro anterior será preservado.</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <FileText size={10} /> Data Atual de Vencimento
                    </label>
                    <input 
                      type="text" 
                      disabled
                      value={new Date(contractToRenew.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <PlusCircle size={10} /> Nova Data de Término
                    </label>
                    <input 
                      type="date" 
                      name="nova_data_fim"
                      required
                      defaultValue={(() => {
                        const d = new Date(contractToRenew.data_fim + 'T00:00:00');
                        d.setFullYear(d.getFullYear() + 1);
                        return d.toISOString().split('T')[0];
                      })()}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <DollarSign size={10} /> Novo Valor do Aluguel (Opcional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        name="novo_valor_aluguel"
                        defaultValue={contractToRenew.valor_aluguel}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 transition-all shadow-sm"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium italic mt-1.5">Mantenha o valor atual ou aplique o reajuste negociado.</p>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsRenewModalOpen(false)}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Confirmar Renovação
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`bg-white rounded-2xl p-8 ${itemToDelete.type === 'contratos' ? 'max-w-md' : 'max-w-sm'} w-full shadow-2xl border border-slate-100`}
          >
            <div className={`w-16 h-16 ${itemToDelete.type === 'contratos' ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 text-center uppercase tracking-tight mb-2">Confirmar Exclusão</h3>
            
            <div className="space-y-4 mb-8">
              <p className="text-slate-500 text-center font-medium text-sm leading-relaxed italic">
                Tem certeza que deseja excluir este {
                  itemToDelete.type === 'contratos' ? 'contrato' : 
                  itemToDelete.type === 'imoveis' ? 'imóvel' : 
                  itemToDelete.type === 'inquilinos' ? 'inquilino' : 'proprietário'
                }? Esta ação removerá os dados permanentemente.
              </p>

              {itemToDelete.type === 'contratos' && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                  <div className="flex items-start gap-2 text-amber-800 text-[11px] font-bold uppercase tracking-tight">
                    <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                    <span>Atenção: Impactos da Exclusão</span>
                  </div>
                  <ul className="text-[10px] text-amber-700 font-medium space-y-1 list-disc pl-4">
                    <li>Todos os <strong>pagamentos vinculados</strong> a este contrato serão excluídos permanentemente.</li>
                    <li>O imóvel associado voltará automaticamente para o status <strong>&quot;Disponível&quot;</strong>.</li>
                    <li>Esta ação não pode ser desfeita.</li>
                  </ul>
                </div>
              )}

              {itemToDelete.type === 'contratos' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">
                    Digite <span className="text-red-500">CONFIRMAR</span> para prosseguir
                  </label>
                  <input 
                    type="text"
                    value={deleteConfirmationInput}
                    onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                    placeholder="CONFIRMAR"
                    className="w-full border-2 border-slate-100 focus:border-red-400 outline-none rounded-xl px-4 py-3 text-sm font-bold text-center transition-all uppercase"
                  />
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-xs font-bold animate-pulse">
                <AlertCircle size={14} className="shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setItemToDelete(null);
                  setErrorMsg(null);
                  setDeleteConfirmationInput('');
                }}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-100 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                disabled={loading || (itemToDelete.type === 'contratos' && deleteConfirmationInput !== 'CONFIRMAR')}
                className={`flex-1 py-3 px-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  itemToDelete.type === 'contratos' && deleteConfirmationInput !== 'CONFIRMAR' 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Excluir'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: visible;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
