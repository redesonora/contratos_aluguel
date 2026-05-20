'use client';

export const dynamic = 'force-dynamic';

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
  Clock,
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
import { formatarMoeda, numeroParaExtenso } from '../lib/utils-format';
import { supabase } from '../lib/supabase';
import PropertyMap from '../components/PropertyMap';

import { 
  Imovel, 
  Inquilino, 
  Proprietario, 
  UserProfile, 
  Contrato, 
  StatusPagamento, 
  Pagamento, 
  ReceiptData 
} from '../types';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

import { SidebarItem } from '../components/SidebarItem';
import { RichEditor } from '../components/RichEditor';
import { TagItem } from '../components/TagItem';
import { DashboardTab } from '../components/tabs/DashboardTab';
import { ImoveisTab } from '../components/tabs/ImoveisTab';
import { ProprietariosTab } from '../components/tabs/ProprietariosTab';
import { InquilinosTab } from '../components/tabs/InquilinosTab';
import { ContratosTab } from '../components/tabs/ContratosTab';
import { PagamentosTab } from '../components/tabs/PagamentosTab';
import { LogsTab } from '../components/tabs/LogsTab';
import { UsuariosTab } from '../components/tabs/UsuariosTab';
import { ConfiguracoesTab } from '../components/tabs/ConfiguracoesTab';
import { LandingPage } from './components/LandingPage';

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
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [myProfileName, setMyProfileName] = useState('');
  const [myProfileEmail, setMyProfileEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [notificationDays, setNotificationDays] = useState(60);
  const [notifications, setNotifications] = useState<Contrato[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('todos');
  const [paymentMonthFilter, setPaymentMonthFilter] = useState<number>(0);
  const [imovelSearch, setImovelSearch] = useState('');
  const [imovelCityFilter, setImovelCityFilter] = useState('todas');
  const [imovelStatusFilter, setImovelStatusFilter] = useState('todos');
  const [imovelTypeFilter, setImovelTypeFilter] = useState('todos');
  const [inquilinoSearch, setInquilinoSearch] = useState('');
  const [proprietarioSearch, setProprietarioSearch] = useState('');
  const [contractProprietarioId, setContractProprietarioId] = useState<string>('');
  const [contractSearch, setContractSearch] = useState('');
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
    inquilinos: { key: 'nome', direction: 'asc' },
    usuarios: { key: 'nome', direction: 'asc' }
  });
  const [currentPage, setCurrentPage] = useState<{[key: string]: number}>({
    imoveis: 1,
    proprietarios: 1,
    inquilinos: 1
  });
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'recover'>('login');
  const [showAuth, setShowAuth] = useState(false);
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
      
      let payloadToUpdate = { ...updatedData };
      let { error } = await supabase
        .from('user_profiles')
        .update(payloadToUpdate)
        .eq('id', editingUser.id);
        
      if (error && (error.code === '42703' || error.code === 'PGRST204' || error.message?.toLowerCase().includes('email'))) {
        delete payloadToUpdate.email;
        const { error: retryError } = await supabase
          .from('user_profiles')
          .update(payloadToUpdate)
          .eq('id', editingUser.id);
        error = retryError;
      }
      
      if (error) throw error;
      
      // Atualizar lista local
      setPerfis(prev => prev.map(p => p.id === editingUser.id ? { ...p, ...payloadToUpdate } : p));
      
      // Se estiver atualizando a PRÓPRIA conta, atualizar o state userProfile
      if (userProfile && userProfile.id === editingUser.id) {
          setUserProfile({...userProfile, ...payloadToUpdate} as UserProfile);
      }
      
      setEditingUser(null);
      alert("Usuário atualizado com sucesso!");
    } catch (err: any) {
      console.error('Erro ao atualizar usuário:', err?.message || err || 'Erro desconhecido');
      alert("Erro ao atualizar usuário: " + (err?.message || 'Verifique o console para mais detalhes.'));
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
    setSortConfig(prev => {
      const currentTabConfig = prev[tab] || { key: '', direction: 'asc' };
      return {
        ...prev,
        [tab]: {
          key,
          direction: currentTabConfig.key === key && currentTabConfig.direction === 'asc' ? 'desc' : 'asc'
        }
      };
    });
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
    const tabConfig = sortConfig[activeTab];
    const isSorted = tabConfig ? tabConfig.key === sortKey : false;
    const direction = tabConfig ? tabConfig.direction : 'asc';
    
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
    if (!templatesLoaded || !session?.user || !userProfile) return;
    
    // Verifica se os templates carregados pertencem ao usuário atual (prevenção extra)
    // Se estivermos em um estado inconsistente, evitamos salvar
    
    try {
      const storageKey = `contratos_templates_${session.user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(contractTemplates));
    } catch (e) {
      console.warn("Storage error:", e);
    }
    
    // Configura um timer para debouncing de 2 segundos antes de salvar no supabase
    const timer = setTimeout(() => {
      const syncWithSupabase = async () => {
        if (!session?.user || !templatesLoaded) return;
        
        // Garante que templates criados localmente tenham um id
        let changed = false;
        const validTemplates = contractTemplates.map(t => {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t.id || '');
          if (!t.id || !isUuid) {
            changed = true;
            return { ...t, id: generateUUID() };
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
              .not('id', 'in', currentIds);
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
          console.error("Erro ao sincronizar templates com Supabase:", e);
          // Opcional: mostrar um toast ou notificação ao usuário se possível, 
          // mas por enquanto apenas logar com mais detalhes.
        }
      };
      
      syncWithSupabase();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [contractTemplates, session, templatesLoaded]);

  /* state already declared above */
  
  // Receipt State
  const [receiptData, setReceiptData] = useState<ReceiptData>({
    inquilino: 'João Silva',
    cpf: '123.456.789-00',
    valor: 1500,
    competencia: 'Abril/2026',
    vencimento: '10/04/2026',
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
    if (userProfile.role === 'MASTER') return true;
    if (userProfile.role === 'ADMIN') {
      if (['logs', 'usuarios'].includes(tab || '')) return false; // Admin não gerencia usuários do sistema (só MASTER)
      return true;
    }

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
        .maybeSingle();

      if (error) {
        console.error('DEBUG: Detalhes do erro Supabase (Code):', error.code);
        console.error('DEBUG: Detalhes do erro Supabase (Full):', JSON.stringify(error, null, 2));
        
        if (error.code === '42P01') {
          console.error('ERRO CRÍTICO: A tabela "user_profiles" não existe no banco de dados.');
          console.info('DICA: Execute o conteúdo do arquivo SUPABASE_SCHEMA.sql no Editor SQL do seu painel Supabase.');
          setUserProfile({ id: userId, role: 'MASTER', nome: 'Master (Pendente)', approved: true, proprietario_id: null });
          return;
        }
      }

      if (!data) {
        // Perfil não existe
        // Criar perfil padrão para novos usuários (MASTER se for o primeiro, senão CORRETOR)
        try {
          const { count, error: countError } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
          
          if (countError) {
            console.error('Erro ao contar perfis:', JSON.stringify(countError));
          }

          const role = (count === 0 && !countError) ? 'MASTER' : 'CORRETOR';
          const approved = role === 'MASTER';
          
          // Buscar metadados do Auth User se estiver disponível
          const { data: { user } } = await supabase.auth.getUser();
          const meta = user?.user_metadata || {};
          
          const newProfileBase = { 
            id: userId, 
            role, 
            nome: meta.full_name || userEmail?.split('@')[0] || 'Usuário',
            cpf: meta.cpf || null,
            approved
          };

          const newProfileFull = {
            ...newProfileBase,
            email: userEmail || null,
            plano: 'Nenhum',
            status_pagamento: 'Sem Assinatura'
          };
          
          // Tentar inserir com todos os campos
          const { error: insertError } = await supabase.from('user_profiles').insert(newProfileFull);
          
          if (insertError) {
            console.error('Erro ao inserir novo perfil:', JSON.stringify(insertError));
            
            // Se falhou por causa de coluna esquecida (PGRST204 ou 42703), tentamos o base
            if (insertError.code === 'PGRST204' || insertError.code === '42703' || insertError.message?.toLowerCase().includes('email')) {
              const { error: retryError } = await supabase.from('user_profiles').insert(newProfileBase);
              if (retryError) throw retryError;
              
              // Se deu certo o retry, buscamos os dados (mesmo parciais)
              const { data: retryData } = await supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle();
              setUserProfile(retryData || (newProfileBase as UserProfile));
            } else {
              // Se for outro erro, usamos o fallback memória
              const fallbackProfile: UserProfile = { 
                id: userId, 
                role: 'MASTER', 
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
            }
          } else {
            // Sucesso na inserção completa, buscar os dados reais (incluindo triggers de data)
            const { data: insertedData } = await supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle();
            setUserProfile(insertedData || (newProfileFull as UserProfile));
          }
        } catch (createErr) {
          console.error('Exceção ao criar perfil:', createErr);
          setUserProfile({ id: userId, role: 'MASTER', nome: 'Master (Fallback Exception)', approved: true, proprietario_id: null });
        }
      } else {
        // Usuário existe, atualizar last_access e setar estado
        let finalData = { ...data };
        try {
          await supabase.from('user_profiles').update({ last_access: new Date().toISOString() }).eq('id', userId);
        } catch (err) {
          console.warn('Falha ao atualizar last_access:', err);
        }

        // Auto-sincronizar o e-mail se estiver sem ele no perfil
        if (!finalData.email && userEmail) {
          try {
            await supabase.from('user_profiles').update({ email: userEmail }).eq('id', userId);
            finalData.email = userEmail;
          } catch (updateErr) {
            console.warn('Falha silenciosa ao sincronizar e-mail no user_profiles (provavelmente a coluna email ainda não existe no DB):', updateErr);
          }
        }

        // Auto-upgrade o pioneiro para MASTER
        try {
          if (finalData.role === 'ADMIN') {
             const { data: firstUserData } = await supabase.from('user_profiles').select('id').order('created_at', { ascending: true }).limit(1).single();
             if (firstUserData && firstUserData.id === userId) {
                 await supabase.from('user_profiles').update({ role: 'MASTER' }).eq('id', userId);
                 finalData.role = 'MASTER';
             }
          }
        } catch(e) {}

        setUserProfile(finalData as UserProfile);
      }
    } catch (err: any) {
      console.error('Erro fetchProfile:', err);
      const msg = err.message?.toLowerCase() || '';
      if (msg.includes('refresh token') || msg.includes('not found') || msg.includes('invalid')) {
         // Se erro crítico de auth, tenta limpar
         try { await supabase.auth.signOut(); } catch(e) {}
         setSession(null);
         setUserProfile(null);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    const handleAuthError = async () => {
      console.log('handleAuthError: limpando sessão devido a erro técnico');
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
        // Tenta limpar cookies também se possível (alguns browsers/configs usam cookies)
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
      }
      setSession(null);
      setUserProfile(null);
      setAuthLoading(false);
      
      // Se estávamos num loop, um reload pode ajudar a resetar o estado do cliente Supabase
      if (typeof window !== 'undefined') {
        // Recarregar apenas se detectarmos que estamos presos
        const lastError = sessionStorage.getItem('last_auth_error_time');
        const now = Date.now();
        if (!lastError || (now - parseInt(lastError)) > 10000) {
          sessionStorage.setItem('last_auth_error_time', now.toString());
          window.location.reload();
        }
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const err = event.reason;
      const msg = err?.message?.toLowerCase() || '';
      if (
        msg.includes('refresh token') || 
        msg.includes('not found') || 
        msg.includes('invalid') || 
        msg.includes('expired') ||
        (err?.name === 'AuthApiError' && err?.status === 400)
      ) {
        console.warn('Capturado Unhandled Rejection de Auth no Supabase:', err);
        event.preventDefault();
        handleAuthError();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
    }

    const initAuth = async () => {
      console.log('initAuth: começando');
      
      // Fallback de timeout: se em 8 segundos não resolver, libera o loading
      const fallbackTimer = setTimeout(() => {
        if (authLoading) {
          console.warn('initAuth: timeout atingido, liberando loading');
          setAuthLoading(false);
        }
      }, 8000);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        clearTimeout(fallbackTimer);
        console.log('initAuth: getSession result', { session, error });
        
        if (error) {
          console.error('Erro ao buscar sessão inicial:', error);
          const msg = error.message?.toLowerCase() || '';
          if (msg.includes('refresh token') || msg.includes('not found') || msg.includes('invalid') || msg.includes('expired')) {
            console.log('initAuth: erro de auth, tratando');
            await handleAuthError();
          } else {
            console.log('initAuth: erro desconhecido, setAuthLoading(false)');
            setAuthLoading(false);
          }
          return;
        }

        setSession(session);
        if (session) {
          console.log('initAuth: tem sessão, fetchProfile');
          fetchProfile(session.user.id, session.user.email);
        } else {
          console.log('initAuth: não tem sessão, setAuthLoading(false)');
          setAuthLoading(false);
        }
      } catch (err: any) {
        clearTimeout(fallbackTimer);
        console.error('Falha no carregamento da autenticação:', err);
        const msg = err?.message?.toLowerCase() || '';
        if (msg.includes('refresh token') || msg.includes('not found') || msg.includes('invalid') || msg.includes('expired')) {
          console.log('initAuth: exceção de auth, tratando');
          await handleAuthError();
        } else {
          console.log('initAuth: exceção, setAuthLoading(false)');
          setAuthLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log('Auth event change:', event);
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
         setSession(session);
         if (session) {
           fetchProfile(session.user.id, session.user.email);
         }
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setSession(null);
        setUserProfile(null);
        setAuthLoading(false);
        // Limpeza rigorosa de estados para evitar vazamento
        setImoveis([]);
        setInquilinos([]);
        setProprietarios([]);
        setContratos([]);
        setPagamentos([]);
        setContractTemplates([]);
        setTemplatesLoaded(false);
        setNotifications([]);
        setLogs([]);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      }
    };
  }, []);

  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [registeredEmailWelcome, setRegisteredEmailWelcome] = useState<string | null>(null);

  const translateErrorMsg = (msg: string | null | undefined) => {
    if (!msg) return 'Ocorreu um erro desconhecido.';
    const txt = msg.toLowerCase();
    if (txt.includes('user already exists')) return 'Este e-mail já está cadastrado no sistema. Por favor, faça login ou recupere sua senha.';
    if (txt.includes('database error saving new user')) return 'Erro no banco de dados. Este e-mail pode ter um cadastro residual no sistema de autenticação.';
    if (txt.includes('rate limit')) return 'Muitas tentativas! Limite de acessos atingido por segurança. Aguarde cerca de 1 hora.';
    if (txt.includes('invalid login credentials') || txt.includes('invalid grant')) return 'E-mail ou senha inválidos. Por favor, tente novamente.';
    if (txt.includes('password should be') || txt.includes('weak_password')) return 'A senha deve conter pelo menos 6 caracteres.';
    if (txt.includes('confirm') || txt.includes('not verified')) return 'E-mail não verificado! Acesse o link de confirmação enviado ao seu e-mail.';
    if (txt.includes('network')) return 'Falha de rede. Verifique sua conexão com a internet.';
    return msg.startsWith('Erro de duplicidade') || msg.startsWith('Ops!') || msg.startsWith('E-mail') || msg.startsWith('Sua senha') || msg.startsWith('As senhas') || msg.startsWith('CPF') ? msg : `Erro: ${msg}`;
  };

  const handleErrorModal = (msg: string) => {
    setLoginError(translateErrorMsg(msg));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    setLoginSuccess(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      handleErrorModal(err.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    setLoginSuccess(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) throw error;
      setLoginSuccess('Processo de redefinição iniciado. Verifique sua caixa de entrada para redefinir sua senha.');
    } catch (err: any) {
      handleErrorModal(err.message || 'Erro ao enviar e-mail de redefinição de senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    setLoginSuccess(null);
    const formData = new FormData(e.currentTarget);
    const nome = formData.get('nome') as string;
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const rawCpf = (formData.get('cpf') as string) || '';
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    const cleanCpf = rawCpf.replace(/\D/g, '');

    const isValidCpf = (val: string): boolean => {
      const clean = val.replace(/\D/g, '');
      if (clean.length !== 11) return false;
      if (/^(\d)\1{10}$/.test(clean)) return false;
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(clean.charAt(i)) * (10 - i);
      }
      let rev = 11 - (sum % 11);
      if (rev === 10 || rev === 11) rev = 0;
      if (rev !== parseInt(clean.charAt(9))) return false;
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(clean.charAt(i)) * (11 - i);
      }
      rev = 11 - (sum % 11);
      if (rev === 10 || rev === 11) rev = 0;
      if (rev !== parseInt(clean.charAt(10))) return false;
      return true;
    };

    if (!isValidCpf(cleanCpf)) {
      setLoginError('CPF inválido. Por favor, digite um CPF válido.');
      setLoading(false);
      return;
    }

    const cpf = `${cleanCpf.slice(0, 3)}.${cleanCpf.slice(3, 6)}.${cleanCpf.slice(6, 9)}-${cleanCpf.slice(9, 11)}`;

    if (password !== confirmPassword) {
      setLoginError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      // Verificar se este CPF ou e-mail já existe no banco de dados (user_profiles)
      let isDuplicate = false;
      let duplicateReason = '';

      const { data: dupDataVal, error: checkError } = await supabase
        .from('user_profiles')
        .select('id, nome, email, cpf')
        .or(`email.eq.${email.trim()},cpf.eq.${cpf.trim()}`);

      if (checkError && (checkError.code === '42703' || checkError.code === 'PGRST204' || checkError.message?.toLowerCase().includes('email'))) {
        // Fallback: buscar apenas por cpf caso o email não seja coluna de consulta ou dê erro
        const { data: fallbackCheck } = await supabase
          .from('user_profiles')
          .select('id, nome, cpf')
          .eq('cpf', cpf.trim());
        
        if (fallbackCheck && fallbackCheck.length > 0) {
          isDuplicate = true;
          duplicateReason = `Este CPF (${cpf}) já está registrado em nosso sistema.`;
        }
      } else if (dupDataVal && dupDataVal.length > 0) {
        isDuplicate = true;
        const findEmail = dupDataVal.find((p: any) => p.email?.trim().toLowerCase() === email.trim().toLowerCase());
        const findCpf = dupDataVal.find((p: any) => p.cpf?.trim() === cpf.trim());

        if (findEmail && findCpf) {
          duplicateReason = `O E-mail (${email}) e o CPF (${cpf}) já estão registrados.`;
        } else if (findEmail) {
          duplicateReason = `O E-mail (${email}) já está registrado.`;
        } else if (findCpf) {
          duplicateReason = `O CPF (${cpf}) já está registrado.`;
        } else {
          duplicateReason = `O CPF (${cpf}) ou E-mail (${email}) informado já está cadastrado no sistema.`;
        }
      }

      if (isDuplicate) {
        handleErrorModal(
          `Ops! ${duplicateReason} Se você já possui uma conta, recupere seus dados de acesso clicando no botão "Criar Conta / Entrar" e depois em "Recuperar" na parte inferior da tela.`
        );
        setLoading(false);
        return;
      }

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
      
      if (signUpError) {
        if (signUpError.message?.toLowerCase().includes('user already exists')) {
          handleErrorModal(
            `Erro de duplicidade: O e-mail (${email}) já está cadastrado no sistema. Por favor, use a opção de redefinição de senha.`
          );
          setLoading(false);
          return;
        }
        if (signUpError.message?.toLowerCase().includes('rate limit')) {
          handleErrorModal(
            `Limite de envios excedido por segurança. Por favor, aguarde cerca de 1 hora para cadastrar novos usuários ou ajuste o Rate Limit no painel Authentication do seu Supabase.`
          );
          setLoading(false);
          return;
        }
        throw signUpError;
      }
      
      if (user) {
        // Garantir que criamos o registro imediatamente na tabela user_profiles com o e-mail preenchido!
        try {
          const { count, error: countError } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
          const role = (count === 0 && !countError) ? 'MASTER' : 'CORRETOR';
          const approved = role === 'MASTER';
          
          const newProfileFull = {
            id: user.id,
            role,
            nome,
            cpf,
            email, // <-- setting the email correctly!
            approved,
            plano: 'Nenhum',
            status_pagamento: 'Sem Assinatura',
            trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          };
          
          const { error: insertError } = await supabase.from('user_profiles').upsert(newProfileFull);
          if (insertError && (insertError.code === 'PGRST204' || insertError.code === '42703' || insertError.message?.toLowerCase().includes('email'))) {
            // Tentar novamente excluindo a coluna email
            const { email: ignoredEmail, ...newProfileBase } = newProfileFull;
            await supabase.from('user_profiles').upsert(newProfileBase);
          }
        } catch(ex_profile) {
          console.error("Erro ao pré-criar perfil:", ex_profile);
        }

        setRegisteredEmailWelcome(email);
        setLoginSuccess('Cadastro de novo usuário realizado com sucesso! Enviamos um e-mail de confirmação para você. Por favor, confirme seu e-mail para poder acessar o sistema.');
      }
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('user already exists')) {
        handleErrorModal(
          `Erro de duplicidade: O e-mail (${email}) já está cadastrado no sistema. Por favor, use a opção de redefinição de senha.`
        );
      } else {
        handleErrorModal(err.message || 'Erro ao realizar cadastro');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    if (isMyProfileOpen && userProfile) {
      setMyProfileName(userProfile.nome || '');
      setMyProfileEmail(userProfile.email || '');
    }
  }, [isMyProfileOpen, userProfile]);

  const handleUpdateMyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          nome: myProfileName,
          email: myProfileEmail
        })
        .eq('id', userProfile.id);

      if (error && (error.code === '42703' || error.message?.toLowerCase().includes('email'))) {
        // Retry but only update name
        const { error: retryError } = await supabase
          .from('user_profiles')
          .update({
            nome: myProfileName
          })
          .eq('id', userProfile.id);
        if (retryError) throw retryError;
      } else if (error) {
        throw error;
      }
      
      setUserProfile(prev => prev ? { ...prev, nome: myProfileName, email: myProfileEmail } : null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setIsMyProfileOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao atualizar perfil.');
      setTimeout(() => setErrorMsg(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      if (!session?.user || !userProfile) return;
      
      console.log(`fetchData: Buscando dados para o usuário ${session.user.id} (${userProfile.role})`);

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
      `).order('created_at', { ascending: false }).limit(1000);

      // Isolamento de dados
      if (userProfile.role === 'PROPRIETARIO' && userProfile.proprietario_id) {
        // Filtro para Proprietário: Vê apenas o que lhe pertence
        imQuery = imQuery.eq('proprietario_id', userProfile.proprietario_id);
        coQuery = coQuery.eq('proprietario_id', userProfile.proprietario_id);
        prQuery = prQuery.eq('id', userProfile.proprietario_id);
        inQuery = inQuery.eq('proprietario_id', userProfile.proprietario_id);
        paQuery = paQuery.not('contratos', 'is', null).filter('contratos.proprietario_id', 'eq', userProfile.proprietario_id);
      } else {
        // Filtro para MASTER, ADMIN e CORRETOR: Vê apenas os cadastros feitos por si mesmo
        imQuery = imQuery.eq('user_id', session.user.id);
        coQuery = coQuery.eq('user_id', session.user.id);
        prQuery = prQuery.eq('user_id', session.user.id);
        inQuery = inQuery.eq('user_id', session.user.id);
        paQuery = paQuery.not('contratos', 'is', null).filter('contratos.user_id', 'eq', session.user.id);
      }

      const tpQuery = supabase.from('contract_templates').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true });

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
      const userStorageKey = `contratos_templates_${session.user.id}`;
      const localSaved = localStorage.getItem(userStorageKey);
      let localTemplates: any[] = [];
      try {
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          localTemplates = Array.isArray(parsed) ? parsed : [];
        }
      } catch(e) {}
      
      const hasRealLocalTemplates = localTemplates.length > 1 || (localTemplates.length === 1 && localTemplates[0]?.name !== 'Residencial Padrão');

      if (tpRes.error) {
        console.error('Erro ao buscar templates do banco:', tpRes.error);
        setContractTemplates(localTemplates.length > 0 ? localTemplates : [{
          id: generateUUID(),
          name: 'Residencial Padrão',
          content: '<h1>CONTRATO DE LOCAÇÃO RESIDENCIAL</h1><p>Conteúdo do contrato...</p>',
          fontSize: 12,
          fontColor: '#000000',
          bold: false,
          alignment: 'justify'
        }]);
      } else if (tpRes.data && tpRes.data.length > 0) {
        // Encontrou dados no Supabase. Priorizamos o Supabase.
        const dbTemplates = tpRes.data.map((t: any) => ({
          id: t.id,
          name: t.name,
          content: t.content,
          fontSize: t.font_size,
          fontColor: t.font_color,
          bold: t.bold,
          alignment: (t.alignment || 'justify') as 'left' | 'center' | 'right' | 'justify'
        }));
        setContractTemplates(dbTemplates);
        localStorage.setItem(userStorageKey, JSON.stringify(dbTemplates));
      } else {
        // Banco vazio. Se tiver local (específico do usuário!), migra para o banco.
        if (localTemplates.length > 0) {
          try {
            console.log("Iniciando migração de templates locais para o Supabase...");
            const toInsert = localTemplates.map((t: any) => {
              // Garante que o ID seja um UUID válido
              const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t.id || '');
              
              return {
                id: isUuid ? t.id : generateUUID(),
                name: String(t.name || 'Modelo Migrado').substring(0, 100),
                content: t.content || '',
                font_size: Number(t.fontSize || 12),
                font_color: t.fontColor || '#000000',
                bold: !!t.bold,
                alignment: (['left', 'center', 'right', 'justify'].includes(t.alignment) ? t.alignment : 'justify'),
                user_id: session.user.id
              };
            });

            // Usamos upsert para evitar erros de duplicidade se o ID já existir
            const { data: insertedValues, error: insErr } = await supabase.from('contract_templates').upsert(toInsert).select();
            
            if (insErr) {
              console.error("Erro ao migrar templates para o banco:", JSON.stringify(insErr, null, 2));
              // Fallback para local se falhar a migração
              setContractTemplates(localTemplates);
            } else if (insertedValues) {
              console.log("Migração de templates concluída com sucesso.");
              const mapped = insertedValues.map((t: any) => ({
                id: t.id,
                name: t.name,
                content: t.content,
                fontSize: t.font_size,
                fontColor: t.font_color,
                bold: t.bold,
                alignment: (t.alignment || 'justify') as 'left' | 'center' | 'right' | 'justify'
              }));
              setContractTemplates(mapped);
              localStorage.setItem(userStorageKey, JSON.stringify(mapped));
            }
          } catch (insE) {
            console.error("Exceção ao migrar:", insE);
            setContractTemplates(localTemplates);
          }
        } else {
          // Tudo vazio, criar o primeiro padrão
          const defaultTemplate: {
            id: string,
            name: string,
            content: string,
            fontSize: number,
            fontColor: string,
            bold: boolean,
            alignment: 'left' | 'center' | 'right' | 'justify'
          }[] = [{ 
            id: 'dev-standard-id',
            name: 'Residencial Padrão',
            content: '<h1>CONTRATO DE LOCAÇÃO RESIDENCIAL</h1><p>Conteúdo do contrato...</p>',
            fontSize: 12,
            fontColor: '#000000',
            bold: false,
            alignment: 'justify'
          }];
          setContractTemplates(defaultTemplate);
        }
      }

      if (userProfile.role === 'MASTER') {
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

      // Isolamento de dados arquivados
      if (userProfile.role === 'PROPRIETARIO' && userProfile.proprietario_id) {
        imQuery = imQuery.eq('proprietario_id', userProfile.proprietario_id);
        coQuery = coQuery.eq('proprietario_id', userProfile.proprietario_id);
        prQuery = prQuery.eq('id', userProfile.proprietario_id);
        inQuery = inQuery.eq('proprietario_id', userProfile.proprietario_id);
      } else {
        imQuery = imQuery.eq('user_id', session.user.id);
        coQuery = coQuery.eq('user_id', session.user.id);
        prQuery = prQuery.eq('user_id', session.user.id);
        inQuery = inQuery.eq('user_id', session.user.id);
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
      body = `Olá, ${nomeInquilino}.\n\nGostaríamos de informar que seu contrato de locação do imóvel em ${enderecoImovel} está próximo do vencimento em ${dataFim}.\n\nPor favor, entre em contato conosco para discutirmos a renovação ou os próximos passos.\n\nAtenciosamente,\nGestão de Contratos`;
    } else {
      subject = `AVISO: Pendência Financeira / Aluguel em Aberto - ${enderecoImovel}`;
      const dataVenc = nextDueDate ? nextDueDate.toLocaleDateString('pt-BR') : `dia ${contrato.dia_vencimento}`;
      body = `Olá, ${nomeInquilino}.\n\nIdentificamos que o pagamento do aluguel referente ao imóvel em ${enderecoImovel}, com vencimento em ${dataVenc}, ainda não consta em nosso sistema.\n\nCaso o pagamento já tenha sido realizado, por favor desconsidere este e-mail e nos envie o comprovante para regularização.\n\nAtenciosamente,\nGestão de Contratos`;
    }

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');

    // Registrar no log
    await recordLog('NOTIFICAÇÃO', 'contratos', contrato.id, { tipo: type, email_enviado: email });
  };

  useEffect(() => {
    const loadData = async () => {
      if (session && userProfile) {
        try {
          await fetchData();
          // Log de acesso
          if (session.user.id) {
             recordLog('ACESSO', 'sessão', session.user.id, { email: session.user.email });
          }
        } catch (err) {
          console.error("Erro crítico em loadData:", err);
          // Se falhar drasticamente, garante que sai do loading pelo menos
          setTemplatesLoaded(true);
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
    setContractProprietarioId(item?.proprietario_id || '');
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
          
          await supabase.from('pagamentos').delete()
            .eq('contrato_id', itemToDelete.id)
            .eq('user_id', session.user.id);
        }
      } 
      else if (itemToDelete.type === 'imoveis') {
        // Cascade: Excluir todos os contratos e seus pagamentos deste imóvel
        const conts = contratos.filter(c => c.imovel_id === itemToDelete.id);
        for (const c of conts) {
          await supabase.from('pagamentos').delete().eq('contrato_id', c.id).eq('user_id', session.user.id);
          await supabase.from('contratos').delete().eq('id', c.id).eq('user_id', session.user.id);
        }
      }
      else if (itemToDelete.type === 'inquilinos') {
        // Cascade: Excluir todos os contratos deste inquilino
        const conts = contratos.filter(c => c.inquilino_id === itemToDelete.id);
        for (const c of conts) {
          await supabase.from('pagamentos').delete().eq('contrato_id', c.id).eq('user_id', session.user.id);
          await supabase.from('contratos').delete().eq('id', c.id).eq('user_id', session.user.id);
        }
      }
      else if (itemToDelete.type === 'proprietarios') {
        // Cascade: Excluir todos os contratos ligados ao proprietario
        const conts = contratos.filter(c => c.proprietario_id === itemToDelete.id);
        for (const c of conts) {
          await supabase.from('pagamentos').delete().eq('contrato_id', c.id).eq('user_id', session.user.id);
          await supabase.from('contratos').delete().eq('id', c.id).eq('user_id', session.user.id);
        }
        // Excluir imoveis que pertecem ao proprietário
        const imvs = imoveis.filter(im => im.proprietario_id === itemToDelete.id);
        for (const im of imvs) {
          await supabase.from('imoveis').delete().eq('id', im.id).eq('user_id', session.user.id);
        }
      }

      console.log(`Iniciando exclusão de ${itemToDelete.type}: ${itemToDelete.id} para o usuário ${session.user.id}`);
      
      const { error, count } = await supabase
        .from(itemToDelete.type)
        .delete({ count: 'exact' })
        .eq('id', itemToDelete.id)
        .eq('user_id', session.user.id);
      
      if (error) {
        if (error.code === '23503') {
          let relation = 'registros vinculados';
          if (itemToDelete.type === 'imoveis') relation = 'contratos ativos ou histórico';
          if (itemToDelete.type === 'inquilinos') relation = 'contratos ativos';
          if (itemToDelete.type === 'proprietarios') relation = 'imóveis ou contratos';
          throw new Error(`Não foi possível excluir completamente. Restam vínculos no banco remoto. Detalhes: ${error.message}`);
        }
        throw error;
      }

      if (count === 0) {
        throw new Error("O registro não pôde ser excluído do banco de dados (não encontrado ou sem permissão).");
      }

      await recordLog('EXCLUIR', itemToDelete.type, itemToDelete.id);
      
      if (imovelIdToRelease) {
        await supabase.from('imoveis').update({ status: 'Disponível' }).eq('id', imovelIdToRelease);
      }

      setSuccess(true);
      setItemToDelete(null);
      setDeleteConfirmationInput('');
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao excluir registro. Verifique vínculos ativos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplates = async (templates: any[]) => {
    if (!session?.user) return;
    
    try {
      const toUpsert = templates.map(t => ({
        id: t.id,
        name: t.name,
        content: t.content,
        font_size: t.fontSize || 12,
        font_color: t.fontColor || '#000000',
        bold: !!t.bold,
        alignment: t.alignment || 'justify',
        user_id: session.user.id
      }));

      const { error } = await supabase.from('contract_templates').upsert(toUpsert);
      if (error) throw error;
      
      const userStorageKey = `contratos_templates_${session.user.id}`;
      localStorage.setItem(userStorageKey, JSON.stringify(templates));
      
      console.log("Templates salvos com sucesso.");
    } catch (err) {
      console.error("Erro ao salvar templates:", err);
      throw err;
    }
  };

  const handleDeleteTemplateDB = async (templateId: string) => {
    if (!session?.user) return;
    
    try {
      const { error } = await supabase
        .from('contract_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', session.user.id);
        
      if (error) throw error;
      console.log("Template excluído do banco.");
    } catch (err) {
      console.error("Erro ao excluir template do banco:", err);
      throw err;
    }
  };
  
  const generateContractPayments = async (contract: any, startDateStr: string, endDateStr: string, rentValue: number, dueDay: number) => {
    if (!contract || !session?.user || !contract.id) {
      console.warn("generateContractPayments: Dados insuficientes", { contract, session });
      return false;
    }
    
    try {
      // Verificar se já existem parcelas para este contrato para evitar duplicidade
      const { data: existingPagamentos } = await supabase
        .from('pagamentos')
        .select('competencia_mes, competencia_ano')
        .eq('contrato_id', contract.id);
      
      const existingKeys = new Set((existingPagamentos || []).map((p: any) => `${p.competencia_mes}_${p.competencia_ano}`));

      // Ajuste de fuso horário
      const startDate = new Date(startDateStr + 'T12:00:00');
      const endDate = new Date(endDateStr + 'T12:00:00');
      
      const parcelas = [];
      let currentDate = new Date(startDate);
      
      let safetyCounter = 0;
      while (currentDate <= endDate && safetyCounter < 120) {
        safetyCounter++;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        
        if (!existingKeys.has(`${month}_${year}`)) {
          // Calcular dia de vencimento real
          const lastDayOfMonth = new Date(year, month, 0).getDate();
          const actualDueDay = Math.min(dueDay || 5, lastDayOfMonth);
          const dueDate = new Date(year, month - 1, actualDueDay);
          
          parcelas.push({
            contrato_id: contract.id,
            valor_esperado: rentValue,
            data_vencimento: dueDate.toISOString().split('T')[0],
            competencia_mes: month,
            competencia_ano: year,
            status: StatusPagamento.PENDENTE,
            user_id: session.user.id
          });
        }
        
        currentDate.setMonth(currentDate.getMonth() + 1);
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
      
      currentY += 6;
      doc.setFont("helvetica", "normal");
      doc.text("Vencimento:", marginX, currentY);
      doc.setFont("helvetica", "bold");
      doc.text(String(receiptData.vencimento || ""), marginX + 22, currentY);
      
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

  const handlePrintReceipt = () => {
    const win = window.open('', '_blank');
    if (!win) {
      alert("Por favor, permita pop-ups para imprimir o recibo.");
      return;
    }

    const valorFormatado = formatarMoeda(receiptData.valor);
    const extenso = numeroParaExtenso(receiptData.valor);
    const anoAtual = new Date().getFullYear();

    win.document.title = `Recibo_No_0001_${anoAtual}`;
    win.document.write(`
      <html>
        <head>
          <title>Recibo Nº 0001/${anoAtual}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,700;0,900;1,900&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', sans-serif;
              background-color: #ffffff;
              color: #1e293b;
              padding: 10mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              height: 100vh;
              min-height: 100vh;
              max-height: 100vh;
              overflow: hidden;
            }

            @page {
              size: A4;
              margin: 0;
            }

            .print-container {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              height: 100%;
              width: 100%;
            }

            .receipt-card {
              border: 1px solid #cbd5e1;
              border-radius: 12px;
              padding: 24px;
              position: relative;
              background-color: #ffffff;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              height: 47%; /* Fits perfectly two copies on A4 */
              box-shadow: none;
            }

            .header-flex {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 12px;
            }

            .title-area {
              display: flex;
              flex-direction: column;
              gap: 2px;
            }

            .flex-row-title {
              display: flex;
              align-items: center;
              gap: 12px;
            }

            .title {
              font-size: 26px;
              font-weight: 900;
              text-transform: uppercase;
              font-style: italic;
              color: #0f172a;
              letter-spacing: -0.025em;
            }

            .via-badge {
              font-size: 8px;
              font-weight: 900;
              color: #475569;
              background-color: #f1f5f9;
              padding: 3px 8px;
              border-radius: 999px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            .doc-no {
              font-size: 10px;
              font-weight: 900;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }

            .value-box {
              background-color: #eff6ff;
              border: 1px solid #bfdbfe;
              font-size: 24px;
              font-weight: 900;
              color: #2563eb;
              padding: 10px 20px;
              border-radius: 8px;
              line-height: 1;
              text-align: right;
            }

            .body-content {
              font-size: 13px;
              line-height: 1.6;
              color: #334155;
              margin-top: 14px;
              flex-grow: 1;
            }

            .bold-text {
              font-weight: 900;
              color: #0f172a;
            }

            .reference-area {
              margin-top: 12px;
              border-left: 2px solid #e2e8f0;
              padding-left: 10px;
            }

            .reference-label {
              font-size: 9px;
              font-weight: 900;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 2px;
            }

            .reference-text {
              font-size: 12px;
              font-weight: 700;
              color: #1e293b;
            }

            .meta-line {
              display: flex;
              align-items: center;
              gap: 16px;
              margin-top: 12px;
              font-size: 12px;
            }

            .meta-item {
              display: flex;
              gap: 4px;
            }

            .meta-label {
              color: #64748b;
            }

            .meta-value {
              font-weight: 900;
              color: #0f172a;
            }

            .footer-area {
              margin-top: auto;
              padding-top: 12px;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 12px;
            }

            .date-placeholder {
              color: #cbd5e1;
              font-size: 11px;
              font-weight: 700;
              font-style: italic;
              text-align: center;
              border-bottom: 1px dashed #e2e8f0;
              padding-bottom: 4px;
              width: 100%;
            }

            .signature-box {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              margin-top: 35px;
            }

            .signature-line {
              width: 280px;
              border-top: 1.5px solid #0f172a;
              height: 0;
              margin-bottom: 6px;
            }

            .locador-name {
              font-size: 13px;
              font-weight: 900;
              color: #0f172a;
              text-transform: uppercase;
            }

            .locador-doc {
              font-size: 8px;
              font-weight: 900;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            .divider {
              border-top: 1px dashed #cbd5e1;
              margin: 10px 0;
              position: relative;
              text-align: center;
            }

            .divider-text {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: #ffffff;
              padding: 0 10px;
              font-size: 8px;
              font-weight: 900;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }

            /* Custom print controls */
            .print-controls {
              position: fixed;
              bottom: 20px;
              right: 20px;
              z-index: 9999;
              display: flex;
              gap: 10px;
            }

            .btn {
              padding: 10px 20px;
              font-size: 10px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              border-radius: 999px;
              cursor: pointer;
              border: none;
              transition: all 0.2s;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }

            .btn-blue {
              background-color: #2563eb;
              color: #ffffff;
            }

            .btn-blue:hover {
              background-color: #1d4ed8;
            }

            .btn-gray {
              background-color: #f1f5f9;
              color: #475569;
              border: 1px solid #cbd5e1;
            }

            .btn-gray:hover {
              background-color: #e2e8f0;
            }

            @media print {
              .print-controls {
                display: none !important;
              }
              body {
                padding: 10mm !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-controls">
            <button class="btn btn-gray" onclick="window.close()">Fechar</button>
            <button class="btn btn-blue" onclick="window.print()">Imprimir</button>
          </div>

          <div class="print-container">
            <!-- 1ª Via -->
            <div class="receipt-card">
              <div class="header-flex">
                <div class="title-area">
                  <div class="flex-row-title">
                    <span class="title">Recibo</span>
                    <span class="via-badge">1ª Via - Locador</span>
                  </div>
                  <span class="doc-no">Nº 0001/${anoAtual}</span>
                </div>
                <div class="value-box">${valorFormatado}</div>
              </div>

              <div class="body-content">
                Recebemos de <span class="bold-text">${receiptData.inquilino}</span>,
                inscrito sob o CPF/CNPJ <span class="bold-text">${receiptData.cpf}</span>,
                a importância supra de <span class="bold-text">${extenso}</span>.
                
                <div class="reference-area">
                  <div class="reference-label">Referente ao pagamento do aluguel do imóvel situado em:</div>
                  <div class="reference-text">
                    ${receiptData.endereco}, ${receiptData.numero} ${receiptData.complemento ? `- ${receiptData.complemento}` : ''} - ${receiptData.bairro}, ${receiptData.cidade} - ${receiptData.estado}, CEP: ${receiptData.cep}
                  </div>
                </div>

                <div class="meta-line">
                  <div class="meta-item">
                    <span class="meta-label">Competência:</span>
                    <span class="meta-value">${receiptData.competencia}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Vencimento:</span>
                    <span class="meta-value">${receiptData.vencimento}</span>
                  </div>
                </div>
              </div>

              <div class="footer-area">
                <div class="date-placeholder">
                  Local/Data: ____________________________________, ______ de ______________________ de 20______
                </div>
                <div class="signature-box">
                  <div class="signature-line"></div>
                  <div class="locador-name">${receiptData.locador}</div>
                  <div class="locador-doc">Locador - ${receiptData.locador_cpf || ''}</div>
                </div>
              </div>
            </div>

            <!-- Divider with scissor icon -->
            <div class="divider">
              <span class="divider-text">✂️ dobra ou corte</span>
            </div>

            <!-- 2ª Via -->
            <div class="receipt-card">
              <div class="header-flex">
                <div class="title-area">
                  <div class="flex-row-title">
                    <span class="title">Recibo</span>
                    <span class="via-badge">2ª Via - Inquilino</span>
                  </div>
                  <span class="doc-no">Nº 0001/${anoAtual}</span>
                </div>
                <div class="value-box">${valorFormatado}</div>
              </div>

              <div class="body-content">
                Recebemos de <span class="bold-text">${receiptData.inquilino}</span>,
                inscrito sob o CPF/CNPJ <span class="bold-text">${receiptData.cpf}</span>,
                a importância supra de <span class="bold-text">${extenso}</span>.
                
                <div class="reference-area">
                  <div class="reference-label">Referente ao pagamento do aluguel do imóvel situado em:</div>
                  <div class="reference-text">
                    ${receiptData.endereco}, ${receiptData.numero} ${receiptData.complemento ? `- ${receiptData.complemento}` : ''} - ${receiptData.bairro}, ${receiptData.cidade} - ${receiptData.estado}, CEP: ${receiptData.cep}
                  </div>
                </div>

                <div class="meta-line">
                  <div class="meta-item">
                    <span class="meta-label">Competência:</span>
                    <span class="meta-value">${receiptData.competencia}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Vencimento:</span>
                    <span class="meta-value">${receiptData.vencimento}</span>
                  </div>
                </div>
              </div>

              <div class="footer-area">
                <div class="date-placeholder">
                  Local/Data: ____________________________________, ______ de ______________________ de 20______
                </div>
                <div class="signature-box">
                  <div class="signature-line"></div>
                  <div class="locador-name">${receiptData.locador}</div>
                  <div class="locador-doc">Locador - ${receiptData.locador_cpf || ''}</div>
                </div>
              </div>
            </div>
          </div>

          <script>
            // Automatically launch native print dialog on page load
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
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
            descricao: rawData.descricao,
            proprietario_id: userProfile?.role === 'PROPRIETARIO' ? userProfile.proprietario_id : (rawData.proprietario_id || null)
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
            documentos_fiador: finalGuarantorDocs,
            proprietario_id: userProfile?.role === 'PROPRIETARIO' ? userProfile.proprietario_id : (rawData.proprietario_id || null)
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
            status: StatusPagamento.PENDENTE,
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

  const openReceiptModal = (parcela: Pagamento) => {
    const contrato = parcela.contratos || contratos.find(c => c.id === parcela.contrato_id);
    const locadorNome = contrato?.proprietarios?.nome || contrato?.imoveis?.proprietarios?.nome || 'N/A';
    const locadorCpf = contrato?.proprietarios?.cpf_cnpj || contrato?.imoveis?.proprietarios?.cpf_cnpj || 'N/A';

    setReceiptData({
      inquilino: contrato?.inquilinos?.nome || 'N/A',
      cpf: contrato?.inquilinos?.cpf_cnpj || 'N/A',
      valor: parcela.valor_pago || parcela.valor_esperado || contrato?.valor_aluguel || 0,
      competencia: `${parcela.competencia_mes}/${parcela.competencia_ano}`,
      vencimento: parcela.data_vencimento ? new Date(parcela.data_vencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A',
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
  };

  const handleMarkAsPaid = async (parcela: Pagamento, valorPago: number) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const { error } = await supabase.from('pagamentos').update({
        status: StatusPagamento.PAGO,
        valor_pago: valorPago,
        data_pagamento: new Date().toISOString()
      }).eq('id', parcela.id);

      if (error) {
        console.error('Erro Supabase ao baixar:', error);
        throw new Error(`Erro ao registrar pagamento: ${error.message}`);
      }

      await recordLog('PAGAMENTO', 'pagamentos', parcela.id, {
        contrato_id: parcela.contrato_id,
        valor: valorPago
      });

      await fetchData();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Auto-open receipt
      openReceiptModal(parcela);
      
    } catch (err: any) {
      console.error('Erro ao marcar como pago:', err);
      setErrorMsg(err.message || 'Erro ao processar a baixa do pagamento.');
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
          <DashboardTab
            containerVariants={containerVariants}
            itemVariants={itemVariants}
            stats={stats}
            formatarMoeda={formatarMoeda}
            monthlyCashFlowData={monthlyCashFlowData}
            notificationDays={notificationDays}
            notifications={notifications}
            pagamentos={pagamentos}
            can={can}
            setActiveTab={setActiveTab}
            setEditingItem={setEditingItem}
            setFilesToUpload={setFilesToUpload}
            setGuarantorFilesToUpload={setGuarantorFilesToUpload}
            setContractFileToUpload={setContractFileToUpload}
            setExistingDocs={setExistingDocs}
            setExistingGuarantorDocs={setExistingGuarantorDocs}
            setCreateModalOpen={setCreateModalOpen}
            handleSendEmailNotification={handleSendEmailNotification}
          />
        );
      }
      
      case 'imoveis': {
        return (
          <ImoveisTab
            showArchived={showArchived}
            archivedImoveis={archivedImoveis}
            imoveis={imoveis}
            imovelCityFilter={imovelCityFilter}
            imovelStatusFilter={imovelStatusFilter}
            imovelTypeFilter={imovelTypeFilter}
            imovelSearch={imovelSearch}
            setImovelSearch={setImovelSearch}
            setImovelCityFilter={setImovelCityFilter}
            setImovelStatusFilter={setImovelStatusFilter}
            setImovelTypeFilter={setImovelTypeFilter}
            getPaginatedAndSortedData={getPaginatedAndSortedData}
            SortHeader={SortHeader}
            Pagination={Pagination}
            itemVariants={itemVariants}
            setViewingItem={setViewingItem}
            setViewModalOpen={setViewModalOpen}
            can={can}
            handleToggleArchive={handleToggleArchive}
            openCreateModal={openCreateModal}
            setItemToDelete={setItemToDelete}
          />
        );
      }
      
      case 'proprietarios': {
        return (
          <ProprietariosTab
            showArchived={showArchived}
            archivedProprietarios={archivedProprietarios}
            proprietarios={proprietarios}
            getPaginatedAndSortedData={getPaginatedAndSortedData}
            SortHeader={SortHeader}
            Pagination={Pagination}
            can={can}
            handleToggleArchive={handleToggleArchive}
            openCreateModal={openCreateModal}
            setItemToDelete={setItemToDelete}
            proprietarioSearch={proprietarioSearch}
            setProprietarioSearch={setProprietarioSearch}
          />
        );
      }
      
      case 'inquilinos': {
        return (
          <InquilinosTab
            showArchived={showArchived}
            archivedInquilinos={archivedInquilinos}
            inquilinos={inquilinos}
            inquilinoSearch={inquilinoSearch}
            setInquilinoSearch={setInquilinoSearch}
            getPaginatedAndSortedData={getPaginatedAndSortedData}
            SortHeader={SortHeader}
            Pagination={Pagination}
            can={can}
            handleToggleArchive={handleToggleArchive}
            openCreateModal={openCreateModal}
            setItemToDelete={setItemToDelete}
          />
        );
      }
      
      case 'logs': {
        return <LogsTab logs={logs} />;
      }

      case 'contratos': {
        return (
          <ContratosTab
            contratos={contratos}
            pagamentos={pagamentos}
            can={can}
            contractSearch={contractSearch}
            setContractSearch={setContractSearch}
            handleSendEmailNotification={handleSendEmailNotification}
            handleFinishContract={handleFinishContract}
            handleToggleArchive={handleToggleArchive}
            setSelectedContractForFinance={setSelectedContractForFinance}
            setFinanceModalOpen={setFinanceModalOpen}
            selectedTemplateIdx={selectedTemplateIdx}
            contractTemplates={contractTemplates}
            openCreateModal={openCreateModal}
            setItemToDelete={setItemToDelete}
            setIsRenewModalOpen={setIsRenewModalOpen}
            setContractToRenew={setContractToRenew}
          />
        );
      }
      
      case 'pagamentos': {
        return (
          <PagamentosTab
            pagamentos={pagamentos}
            paymentSearch={paymentSearch}
            setPaymentSearch={setPaymentSearch}
            paymentStatusFilter={paymentStatusFilter}
            setPaymentStatusFilter={setPaymentStatusFilter}
            paymentMonthFilter={paymentMonthFilter}
            setPaymentMonthFilter={setPaymentMonthFilter}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            formatarMoeda={formatarMoeda}
            StatusPagamento={StatusPagamento}
            handleSendEmailNotification={handleSendEmailNotification}
            openReceiptModal={openReceiptModal}
            handleMarkAsPaid={handleMarkAsPaid}
            openCreateModal={openCreateModal}
            showArchived={showArchived}
            setShowArchived={setShowArchived}
            loading={loading}
          />
        );
      }
      
      case 'usuarios': {
        return (
          <UsuariosTab
            perfis={perfis}
            SortHeader={SortHeader}
            loading={loading}
            handleApproveUser={async (id) => {
               if (confirm(`Aprovar entrada?`)) {
                 const { error } = await supabase.from('user_profiles').update({ approved: true, status_pagamento: 'PAGO', plano: 'Pro' }).eq('id', id);
                 if (!error) fetchData();
               }
            }}
            handleChangeRole={async (id, newRole) => {
               if (confirm(`Alterar nível para ${newRole}?`)) {
                 const { error } = await supabase.from('user_profiles').update({ role: newRole }).eq('id', id);
                 if (error) {
                   console.error("Erro ao alterar nível", error);
                   alert("Erro ao alterar nível: " + error.message);
                 }
                 if (!error) fetchData();
               }
            }}
            handleDeleteUser={async (id, role) => {
               if (userProfile?.id === id) {
                 return { success: false, error: "Você não pode se auto-excluir do sistema." };
               }
               if (role === 'MASTER') {
                 return { success: false, error: "Usuários com nível MASTER não podem ser excluídos." };
               }
               
               // Tenta usar a função RPC que exclui da auth.users e user_profiles
               const { error } = await supabase.rpc('delete_user_by_id', { p_user_id: id });
               
               if (error) {
                 if (error.code === 'PGRST202' || error.message?.includes('function delete_user_by_id') || error.message?.toLowerCase().includes('não permitida') || error.message?.toLowerCase().includes('could not find')) {
                   // Fallback para apenas avisar que a função do DB ainda não foi criada
                   return { 
                     success: false, 
                     error: "A exclusão de conta completa exige um ajuste no banco de dados. Por favor, execute as instruções do arquivo SUPABASE_SCHEMA.sql (seção delete_user_by_id) no SQL Editor do Supabase." 
                   };
                 }
                 console.error("Erro ao excluir usuário:", error);
                 return { success: false, error: error.message || 'Erro ao excluir usuário do banco de dados.' };
               }
               
               fetchData();
               return { success: true };
            }}
            onEditUser={(user) => setEditingUser(user)}
            onSyncData={fetchData}
          />
        );
      }
      
      case 'configuracoes': {
        return (
          <ConfiguracoesTab 
            contractTemplates={contractTemplates} 
            setContractTemplates={setContractTemplates}
            notificationDays={notificationDays}
            setNotificationDays={setNotificationDays}
            onSave={handleSaveTemplates}
            onDeleteTemplate={handleDeleteTemplateDB}
          />
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
    if (!showAuth) {
      return (
        <LandingPage 
          onLogin={() => {
            setAuthTab('login');
            setShowAuth(true);
          }}
          onRegister={() => {
            setAuthTab('register');
            setShowAuth(true);
          }}
        />
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative">
        <button 
          onClick={() => setShowAuth(false)}
          className="absolute top-6 left-6 text-slate-500 hover:text-slate-700 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-colors z-50 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
        >
          ← Voltar ao Início
        </button>

        {registeredEmailWelcome && (
          <div className="fixed inset-0 z-[999] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg border-2 border-slate-100 relative text-center"
            >
              <button 
                onClick={() => {
                  setRegisteredEmailWelcome(null);
                  setAuthTab('login');
                }}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                title="Fechar"
              >
                <X size={20} />
              </button>

              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-50">
                <CheckCircle2 size={40} strokeWidth={2.5} className="animate-bounce" />
              </div>

              <span className="text-[10px] font-black tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full uppercase">
                🎉 Cadastro Iniciado!
              </span>

              <h2 className="text-2xl sm:text-3.5xl font-black text-slate-800 tracking-tight uppercase mt-4 leading-tight">
                Seja Bem-Vindo à REALIZZE!
              </h2>

              <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed">
                Faltam apenas alguns passos para você começar! Enviamos um e-mail de confirmação para:
              </p>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 my-4 font-mono text-xs text-blue-600 font-bold tracking-tight select-all break-all">
                {registeredEmailWelcome}
              </div>

              <div className="text-left text-xs text-slate-400 space-y-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/30">
                <p className="font-bold uppercase tracking-widest text-[9px] text-blue-600 mb-1">Passos para ativação de sua conta:</p>
                <div className="flex gap-2">
                  <span className="font-black text-blue-600">1.</span>
                  <span>Acesse sua caixa de entrada (ou lixo eletrônico/spam).</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-black text-blue-600">2.</span>
                  <span>Abra o e-mail de registro enviado pela nossa equipe do Supabase e clique em <strong>Confirmar E-mail</strong> (Confirm Email).</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-black text-blue-600">3.</span>
                  <span>Depois de confirmado, você poderá logar no sistema com as suas credenciais para usufruir de seus 7 dias grátis de trial.</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setRegisteredEmailWelcome(null);
                  setAuthTab('login');
                }}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest py-4 rounded-2xl shadow-lg shadow-blue-100 hover:shadow-xl transition-all active:scale-95"
              >
                Concluir e ir para o Login
              </button>
            </motion.div>
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200"
        >
          <div className="flex items-center gap-3 text-blue-600 mb-8 justify-center">
            <Home size={32} strokeWidth={2.5} />
            <h1 className="text-2xl font-black tracking-tight">ImobiSaaS</h1>
          </div>
          
          {authTab !== 'recover' ? (
            <div className="bg-slate-50 p-1.5 rounded-2xl flex items-center gap-2 mb-8">
              <button 
                onClick={() => { setAuthTab('login'); setLoginError(null); setLoginSuccess(null); }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  authTab === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Entrar
              </button>
              <button 
                onClick={() => { setAuthTab('register'); setLoginError(null); setLoginSuccess(null); }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  authTab === 'register' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Cadastrar
              </button>
            </div>
          ) : (
            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Recuperar Senha</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Insira seu e-mail de cadastro para receber as instruções</p>
            </div>
          )}

          <form onSubmit={authTab === 'login' ? handleLogin : authTab === 'register' ? handleRegister : handleRecoverPassword} className="space-y-5">
            {loginSuccess && (
              <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-emerald-100 relative text-center"
                >
                  <button 
                    onClick={() => setLoginSuccess(null)}
                    type="button"
                    className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-50 animate-bounce">
                    <CheckCircle2 size={32} strokeWidth={2.5} />
                  </div>
                  
                  <h3 className="text-[17px] font-black text-slate-800 mb-3 uppercase tracking-tight">Sucesso</h3>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-[280px] mx-auto mb-8">
                    {loginSuccess}
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => setLoginSuccess(null)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:shadow-xl active:scale-95 transition-all font-black text-[11px] uppercase tracking-widest py-4 rounded-xl"
                  >
                    Continuar
                  </button>
                </motion.div>
              </div>
            )}

            {loginError && (
              <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-red-100 relative text-center"
                >
                  <button 
                    onClick={() => setLoginError(null)}
                    type="button"
                    className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-50 animate-shake">
                    <AlertCircle size={32} strokeWidth={2.5} />
                  </div>
                  
                  <h3 className="text-[17px] font-black text-slate-800 mb-3 uppercase tracking-tight">Ocorreu um erro</h3>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-[280px] mx-auto mb-8">
                    {loginError}
                  </p>
                  
                  {authTab === 'register' && (loginError.includes('duplicidade') || loginError.includes('cadastrado')) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('recover');
                        setLoginError(null);
                        setLoginSuccess(null);
                      }}
                      className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all font-black text-[11px] uppercase tracking-widest py-4 rounded-xl text-center mb-3"
                    >
                      Ir para Recuperar Senha →
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setLoginError(null)}
                    className="w-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 transition-all font-black text-[11px] uppercase tracking-widest py-4 rounded-xl"
                  >
                    Tentar Novamente
                  </button>
                </motion.div>
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
                    maxLength={14}
                    onChange={(e) => {
                      const value = e.target.value;
                      const digits = value.replace(/\D/g, '').slice(0, 11);
                      let formatted = digits;
                      if (digits.length > 3 && digits.length <= 6) {
                        formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`;
                      } else if (digits.length > 6 && digits.length <= 9) {
                        formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
                      } else if (digits.length > 9) {
                        formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
                      }
                      e.target.value = formatted;
                    }}
                    className="w-full bg-slate-50/50 border-2 border-slate-100 focus:border-emerald-400 outline-none rounded-2xl pl-12 pr-4 py-4 font-bold text-sm transition-all" 
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
            )}

            {authTab !== 'recover' && (
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
            )}

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
                  : authTab === 'register'
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100'
                    : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-100'
              } disabled:opacity-50`}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  {authTab === 'login' ? 'Acessar Dashboard' : authTab === 'register' ? 'Criar minha conta' : 'Enviar E-mail de Recuperação'}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
            
            {authTab === 'recover' && (
              <button 
                type="button"
                onClick={() => { setAuthTab('login'); setLoginError(null); setLoginSuccess(null); }}
                className="w-full text-center text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 py-2.5"
              >
                ← Voltar para Entrar
              </button>
            )}
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
              Esqueceu sua senha? <button type="button" onClick={() => { setAuthTab('recover'); setLoginError(null); setLoginSuccess(null); }} className="text-blue-500 hover:underline">Recuperar</button>
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  const isTrialActive = userProfile?.trial_ends_at ? new Date(userProfile.trial_ends_at) > new Date() : false;
  const trialDaysLeft = userProfile?.trial_ends_at ? Math.max(0, Math.ceil((new Date(userProfile.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  const isAccessBlocked = userProfile && userProfile.role !== 'MASTER' && !userProfile.approved && !isTrialActive;

  if (isAccessBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-lg border border-slate-200 text-center flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-2">
            <Clock size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic leading-tight">Acesso Pendente</h1>
            <p className="text-slate-500 font-medium leading-relaxed italic">
              Olá, <span className="font-bold text-slate-800">{userProfile.nome}</span>. Seu cadastro foi recebido e está <span className="text-amber-600 font-black">AGUARDANDO APROVAÇÃO</span> de um administrador.
            </p>
          </div>
          <div className="w-full h-px bg-slate-100" />
          <div className="space-y-4 w-full">
            <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-2xl text-amber-700 text-xs font-bold border border-amber-100 text-left">
              <Info size={18} className="shrink-0" />
              <p>Você receberá acesso aos módulos autorizados assim que o administrador liberar o seu perfil.</p>
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
              label="Cedentes / Proprietários" 
              active={activeTab === 'proprietarios'} 
              onClick={() => { setActiveTab('proprietarios'); setIsSidebarOpen(false); setShowArchived(false); }} 
            />
          )}
          {can('VIEW', 'imoveis') && (
            <SidebarItem 
              icon={Building2} 
              label="Bens / Itens" 
              active={activeTab === 'imoveis'} 
              onClick={() => { setActiveTab('imoveis'); setIsSidebarOpen(false); setShowArchived(false); }} 
            />
          )}
          {can('VIEW', 'inquilinos') && (
            <SidebarItem 
              icon={Users} 
              label="Locatários / Clientes" 
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
          {userProfile?.role === 'MASTER' && (
            <SidebarItem 
              icon={Users} 
              label="Usuários" 
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
                userProfile?.role === 'MASTER' ? 'bg-purple-100 text-purple-600' : 
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
            onClick={() => setIsMyProfileOpen(true)}
            className="text-[10px] font-black text-slate-400 hover:text-blue-500 uppercase tracking-widest p-2 transition-colors text-left flex items-center gap-1.5"
          >
            Meu Perfil
          </button>
          <button 
            onClick={() => {
              setPwdForm({ current: '', new: '', confirm: '' });
              setIsChangePasswordOpen(true);
            }}
            className="text-[10px] font-black text-slate-400 hover:text-blue-500 uppercase tracking-widest p-2 transition-colors text-left flex items-center gap-1.5"
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
              <span className="text-blue-500">{activeTab === 'configuracoes' ? 'Definições' : activeTab === 'dashboard' ? 'Início' : activeTab}</span>
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
              {userProfile?.role === 'MASTER' && activeTab === 'contratos' && (
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
                    {editingItem ? 'Editar ' : 'Novo '}{activeTab === 'imoveis' ? 'Bem / Item' : 
                         activeTab === 'inquilinos' ? 'Locatário / Cliente' :
                         activeTab === 'proprietarios' ? 'Cedente / Proprietário' :
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
                          Apelido / Identificação do Bem / Item
                          {formErrors.apelido && <span className="text-red-500 normal-case font-bold">{formErrors.apelido}</span>}
                        </label>
                        <input 
                          name="apelido" 
                          defaultValue={editingItem?.apelido}
                          onBlur={handleFieldBlur}
                          className={`w-full border-2 ${formErrors.apelido ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-bold transition-all placeholder:font-normal`} 
                          placeholder="Ex: Apartamento 301, Carro Sedan, Furadeira Profissional..."
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
                            <label className="text-[10px] font-black text-slate-500 uppercase block tracking-tight">Tipo de Bem / Item</label>
                            <div className="group relative">
                              <Info size={12} className="text-slate-400 cursor-help" />
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl z-[60] leading-tight">
                                <p className="font-bold mb-1 text-blue-400">Residencial / Pessoal:</p>
                                <p className="mb-2 text-slate-300">Bens/itens para moradia, uso pessoal ou locação residencial padrão.</p>
                                <p className="font-bold mb-1 text-purple-400">Comercial / Negógio:</p>
                                <p className="text-slate-300">Bens/itens para fins de negócio, comercial, frotas, ferramentas e zoneamento.</p>
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
                        <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block tracking-tight">Status do Bem / Item</label>
                        <select name="status" defaultValue={editingItem?.status || "Disponível"} className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all appearance-none bg-white">
                          <option value="Disponível">Disponível</option>
                          <option value="Alugado">Alugado / Em Uso</option>
                          <option value="Em Manutenção">Em Manutenção</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block tracking-tight">Cedente / Proprietário (Opcional)</label>
                        <select name="proprietario_id" defaultValue={editingItem?.proprietario_id || ""} className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all appearance-none bg-white">
                          <option value="">Selecione um cedente / proprietário...</option>
                          {proprietarios.map(p => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                          ))}
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
                          <label className="text-[10px] font-black text-orange-500 uppercase mb-1 block">Concessionária de Luz (Instalação)</label>
                          <input name="cemig" defaultValue={editingItem?.cemig} className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-blue-500 uppercase mb-1 block">Concessionária de Água (Matrícula)</label>
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
                      {userProfile?.role !== 'PROPRIETARIO' && (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight">Proprietário (Opcional)</label>
                          <select 
                            name="proprietario_id" 
                            defaultValue={editingItem?.proprietario_id || ""} 
                            className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all appearance-none bg-white"
                          >
                            <option value="">Selecione um proprietário...</option>
                            {proprietarios.map(pr => <option key={pr.id} value={pr.id}>{pr.nome}</option>)}
                          </select>
                        </div>
                      )}
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
                      {userProfile?.role !== 'PROPRIETARIO' ? (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>Proprietário / Locador</span>
                            {formErrors.proprietario_id && <span className="text-red-500 normal-case font-bold">{formErrors.proprietario_id}</span>}
                          </label>
                          <select name="proprietario_id" defaultValue={editingItem?.proprietario_id || ""} required onBlur={handleFieldBlur} onChange={(e) => setContractProprietarioId(e.target.value)} className={`w-full border-2 ${formErrors.proprietario_id ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all appearance-none bg-white`}>
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
                            <span>Bem / Item de Locação</span>
                            {formErrors.imovel_id && <span className="text-red-500 normal-case font-bold">{formErrors.imovel_id}</span>}
                          </label>
                          {imoveis.length > 0 ? (
                            <select name="imovel_id" defaultValue={editingItem?.imovel_id || ""} required onBlur={handleFieldBlur} onChange={(e) => {
                              // Se alterar imóvel, atualizar proprietário se necessário? Não, o fluxo é Proprietário -> Imóvel
                            }} className={`w-full border-2 ${formErrors.imovel_id ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all appearance-none bg-white`}>
                              <option value="">Selecione o Bem / Item...</option>
                              {imoveis
                                .filter(im => !contractProprietarioId || im.proprietario_id === contractProprietarioId)
                                .map(im => {
                                  const isRented = im.status === 'Alugado' && editingItem?.imovel_id !== im.id;
                                  return (
                                    <option 
                                      key={im.id} 
                                      value={im.id} 
                                      disabled={isRented}
                                      className={isRented ? 'text-slate-300' : ''}
                                    >
                                      {im.apelido ? `[${im.apelido}] ${im.endereco}` : im.endereco}, {im.numero} 
                                      {isRented ? ' (INDISPONÍVEL)' : ` (${im.status || 'Disponível'})`}
                                    </option>
                                  );
                                })}
                            </select>
                          ) : (
                            <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg border border-red-100 italic">Nenhum bem/item disponível para este proprietário/cedente.</p>
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-tight flex justify-between">
                            <span>Locatário / Cliente</span>
                            {formErrors.inquilino_id && <span className="text-red-500 normal-case font-bold">{formErrors.inquilino_id}</span>}
                          </label>
                          {inquilinos.length > 0 ? (
                            <select name="inquilino_id" defaultValue={editingItem?.inquilino_id || ""} required onBlur={handleFieldBlur} className={`w-full border-2 ${formErrors.inquilino_id ? 'border-red-200 bg-red-50' : 'border-slate-100'} focus:border-blue-400 outline-none rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all appearance-none bg-white`}>
                              <option value="">Selecione o Locatário / Cliente...</option>
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

      {/* Professional Receipt Modal */}
      <AnimatePresence>
        {isReceiptModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <h2 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">Visualização do Recibo</h2>
                <button 
                  onClick={() => setReceiptModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30" id="printable-area">
                {isEditing ? (
                  /* Single Edit Card to avoid double-editing confusion */
                  <div className="bg-white border border-slate-200 p-6 md:p-12 rounded-lg shadow-sm space-y-10 relative overflow-hidden">
                    <div className="absolute inset-0 border-8 border-slate-50 pointer-events-none opacity-50" />
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic animate-pulse">Editar Recibo</h1>
                        <p className="text-xs font-black text-slate-400 tracking-widest uppercase">{`Nº 0001/${new Date().getFullYear()}`}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex flex-col gap-1 items-end">
                           <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Valor R$</span>
                           <input 
                             type="number" 
                             value={receiptData.valor} 
                             onChange={(e) => handleReceiptChange('valor', parseFloat(e.target.value) || 0)}
                             className="text-3xl font-black text-blue-600 border-2 border-blue-100 rounded-xl px-4 py-1 w-40 outline-none focus:border-blue-400 transition-all text-right animate-pulse"
                           />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 text-slate-800 leading-relaxed text-lg relative z-10">
                      <div className="space-y-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Inquilino</label>
                            <input 
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" 
                              value={receiptData.inquilino} 
                              onChange={(e) => handleReceiptChange('inquilino', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF/CNPJ</label>
                            <input 
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" 
                              value={receiptData.cpf} 
                              onChange={(e) => handleReceiptChange('cpf', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço Completo</label>
                            <input 
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" 
                              value={receiptData.endereco} 
                              onChange={(e) => handleReceiptChange('endereco', e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                             <div className="col-span-1 space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nº</label>
                                <input 
                                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" 
                                  value={receiptData.numero} 
                                  onChange={(e) => handleReceiptChange('numero', e.target.value)}
                                />
                             </div>
                             <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bairro</label>
                                <input 
                                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" 
                                  value={receiptData.bairro} 
                                  onChange={(e) => handleReceiptChange('bairro', e.target.value)}
                                />
                             </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Locador</label>
                            <input 
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" 
                              value={receiptData.locador} 
                              onChange={(e) => handleReceiptChange('locador', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF/CNPJ Locador</label>
                            <input 
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" 
                              value={receiptData.locador_cpf} 
                              onChange={(e) => handleReceiptChange('locador_cpf', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Double Read-Only Vias - Renders 1a and 2a side by side or stacked, fits perfectly on 1 Printed page */
                  ['1ª VIA - LOCADOR', '2ª VIA - INQUILINO'].map((viaLabel, idx) => (
                    <React.Fragment key={viaLabel}>
                      {idx > 0 && (
                        <div className="border-t-2 border-dashed border-slate-300 my-4 py-2 text-center text-[10px] font-black tracking-widest text-slate-400 uppercase relative print-divider flex justify-center items-center gap-2 no-print">
                          ✂️ COLOQUE AQUI A DOBRA OU CORTE DO RECIBO
                        </div>
                      )}
                      <div className="bg-white border border-slate-200 p-8 md:p-12 rounded-lg shadow-sm space-y-10 relative overflow-hidden print-card">
                        {/* Decorative Border */}
                        <div className="absolute inset-0 border-8 border-slate-50 pointer-events-none opacity-50 print:hidden" />
                        
                        <div className="flex justify-between items-start relative z-10 print-header-flex">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase italic print-title-size">Recibo</h1>
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full print-via-label">{viaLabel}</span>
                            </div>
                            <p className="text-xs font-black text-slate-400 tracking-widest uppercase print-doc-no">{`Nº 0001/${new Date().getFullYear()}`}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl md:text-4xl font-black text-blue-600 tracking-tight print-value-size">{formatarMoeda(receiptData.valor)}</p>
                          </div>
                        </div>

                        <div className="space-y-8 font-medium text-slate-700 leading-relaxed md:text-xl print-body-size">
                          <p>
                            Recebemos de <span className="font-black text-slate-900 border-b-2 border-slate-900 px-1">{receiptData.inquilino}</span>, 
                            inscrito sob o CPF/CNPJ <span className="font-black text-slate-900">{receiptData.cpf}</span>, 
                            a importância supra de <span className="font-black text-slate-900">{numeroParaExtenso(receiptData.valor)}</span>.
                          </p>
                          
                          <div className="space-y-2 print-ref-spacing">
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest print-ref-label">Referente ao pagamento do aluguel do imóvel situado em:</p>
                            <p className="font-black text-slate-800">
                               {receiptData.endereco}, {receiptData.numero} {receiptData.complemento ? `- ${receiptData.complemento}` : ''} - {receiptData.bairro}, {receiptData.cidade} - {receiptData.estado}, CEP: {receiptData.cep}
                            </p>
                          </div>
                          
                          <p className="flex gap-4 items-center flex-wrap print-meta">
                            <span>Competência: <span className="font-black text-slate-900">{receiptData.competencia}</span></span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full print:hidden" />
                            <span>Vencimento: <span className="font-black text-slate-900">{receiptData.vencimento}</span></span>
                          </p>
                        </div>

                        <div className="pt-16 flex flex-col items-center gap-8 relative z-10 print-signature-area">
                          <p className="text-slate-300 font-bold italic border-b border-dashed border-slate-200 pb-2 text-sm w-full text-center print-date-line">
                             Local/Data: ____________________________________, ______ de ______________________ de 20______
                          </p>
                          <div className="flex flex-col items-center gap-1 text-center mt-4 print-sign-line">
                            <div className="w-80 h-px bg-slate-900 mb-2 print-sign-bar" />
                            <p className="text-lg font-black text-slate-900 uppercase tracking-tight print-locador-name">{receiptData.locador}</p>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none print-locador-doc">Locador - {receiptData.locador_cpf}</span>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  ))
                )}
              </div>

              <div className="p-8 border-t border-slate-100 flex justify-center flex-wrap gap-4 bg-white/80 backdrop-blur-md">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-8 py-3.5 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all border shadow-sm ${
                    isEditing ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isEditing ? 'Confirmar Edição' : 'Editar Recibo'}
                </button>
                <button 
                  onClick={generateReceiptPDF}
                  className="px-8 py-3.5 bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-900 shadow-xl shadow-slate-200 flex items-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  <FileDown size={14} />
                  Baixar PDF
                </button>
                <button 
                  onClick={handlePrintReceipt}
                  className="px-8 py-3.5 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  <Printer size={14} />
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
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Detalhes do Bem / Item</h2>
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
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tipo de Bem / Item</label>
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

      {/* Meu Perfil Modal */}
      <AnimatePresence>
        {isMyProfileOpen && userProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col"
            >
              <div className="px-8 pt-8 pb-4 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
                  <User size={20} className="text-blue-500" />
                  Meu Perfil
                </h3>
                <button onClick={() => setIsMyProfileOpen(false)} className="text-slate-300 hover:text-slate-500"><X size={24} /></button>
              </div>

              <div className="p-8 space-y-6 text-slate-700 overflow-y-auto max-h-[60vh]">
                {/* Visual Avatar Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-lg">
                    {userProfile.nome ? userProfile.nome.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight">{userProfile.nome}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                      {userProfile.role} • {userProfile.plano || 'Sem Plano'}
                    </p>
                  </div>
                </div>

                <form id="my-profile-form" onSubmit={handleUpdateMyProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Nome Completo</label>
                    <input 
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all text-sm"
                      placeholder="Nome do usuário"
                      value={myProfileName}
                      onChange={(e) => setMyProfileName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">E-mail</label>
                    <input 
                      type="email"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all text-sm"
                      placeholder="seu@email.com"
                      value={myProfileEmail}
                      onChange={(e) => setMyProfileEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">CPF</span>
                      <p className="font-mono text-xs font-bold text-slate-700 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100">{userProfile.cpf || 'Sem CPF'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Pagamento</span>
                      <p className="text-xs font-bold text-slate-700 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100 uppercase">{userProfile.status_pagamento || 'Sem Plano'}</p>
                    </div>
                  </div>

                  {userProfile.trial_ends_at && (
                    <div className="bg-purple-50 p-4 border border-purple-100/30 rounded-xl flex items-center gap-3">
                      <Clock size={16} className="text-purple-600" />
                      <div>
                        <p className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Período de Acesso Trial</p>
                        <p className="text-xs text-purple-900 font-bold mt-0.5">Expira em: {new Date(userProfile.trial_ends_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  )}
                </form>

                <div className="w-full h-px bg-slate-50" />
                
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMyProfileOpen(false);
                      setPwdForm({ current: '', new: '', confirm: '' });
                      setIsChangePasswordOpen(true);
                    }}
                    className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-blue-100 transition-all text-center"
                  >
                    Alterar Senha de Acesso
                  </button>
                </div>
              </div>

              <div className="p-8 bg-slate-50 flex items-center justify-end gap-3 rounded-b-[2.5rem]">
                <button 
                  type="button"
                  onClick={() => setIsMyProfileOpen(false)}
                  className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  form="my-profile-form"
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
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const vencimentoDate = new Date(p.data_vencimento + 'T00:00:00');
                                  const isAtrasado = p.status !== StatusPagamento.PAGO && vencimentoDate < today;

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
                                              disabled={loading}
                                              className={`bg-green-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-md shadow-green-100 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                              {loading && <Loader2 size={10} className="animate-spin" />}
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
                                                  vencimento: p.data_vencimento ? new Date(p.data_vencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A',
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

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight italic">Editar Usuário</h2>
                <button 
                  onClick={() => setEditingUser(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Perfil do Colaborador</label>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center text-slate-700 font-black text-lg">
                      {editingUser.nome ? editingUser.nome.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{editingUser.nome}</p>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{editingUser.plano || 'Sem Plano'} • {editingUser.role}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nome Completo</label>
                    <input 
                      type="text" 
                      value={editingUser.nome || ''}
                      onChange={(e) => setEditingUser({...editingUser, nome: e.target.value})}
                      className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Função (Role)</label>
                      <select 
                        value={editingUser.role || 'CORRETOR'}
                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value as any})}
                        className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition-all appearance-none bg-white"
                      >
                        <option value="MASTER">Master</option>
                        <option value="ADMIN">Administrador</option>
                        <option value="CORRETOR">Corretor</option>
                        <option value="PROPRIETARIO">Proprietário</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Plano</label>
                      <input 
                        type="text" 
                        value={editingUser.plano || ''}
                        onChange={(e) => setEditingUser({...editingUser, plano: e.target.value})}
                        className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition-all bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status Pagamento</label>
                    <select 
                        value={editingUser.status_pagamento || ''}
                        onChange={(e) => setEditingUser({...editingUser, status_pagamento: e.target.value})}
                        className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition-all appearance-none bg-white"
                      >
                        <option value="">Nenhum</option>
                        <option value="PAGO">PAGO</option>
                        <option value="ATRASADO">ATRASADO</option>
                        <option value="CANCELADO">CANCELADO</option>
                        <option value="TRIAL">TRIAL</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Data de Início</label>
                      <input 
                        type="date" 
                        value={editingUser.created_at ? editingUser.created_at.split('T')[0] : ''}
                        readOnly // Geralmente não se edita a data de início (created_at), mas coloquei como visualização. Pode-se alterar se o backend permitir
                        className="w-full border-2 border-slate-100 bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold text-slate-400 transition-all"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Data de Expiração</label>
                      <input 
                        type="date" 
                        value={editingUser.trial_ends_at ? editingUser.trial_ends_at.split('T')[0] : ''}
                        onChange={(e) => setEditingUser({...editingUser, trial_ends_at: e.target.value ? new Date(e.target.value).toISOString() : null})}
                        className="w-full border-2 border-slate-100 focus:border-blue-400 outline-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="px-6 py-3 text-slate-400 hover:text-slate-600 font-black uppercase text-xs tracking-widest transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleUpdateUser(editingUser)}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Salvar Alterações'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media print {
          /* Hide all page content except printable-area and its children */
          body * {
            visibility: hidden !important;
          }
          #printable-area, #printable-area * {
            visibility: visible !important;
          }
          #printable-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            min-height: 100% !important;
            max-height: 100% !important;
            margin: 0 !important;
            padding: 15px !important; 
            overflow: hidden !important;
            background: white !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-shadow: none !important;
          }
          /* Override styles in the receipt cards to fit A4 on 1 page */
          .print-card {
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
            padding: 16px !important;
            margin: 0 !important;
            background: white !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            flex: 1 !important;
            max-height: 48% !important; /* Forces each card to occupy around 48% of the A4 page height */
            box-sizing: border-box !important;
          }
          /* Custom dividers inside the card */
          .print-card > * + * {
            margin-top: 0 !important;
          }
          /* Shrink typography for print to fit single A4 page */
          .print-title-size {
            font-size: 20px !important;
            line-height: 1.2 !important;
          }
          .print-via-label {
            font-size: 8px !important;
            padding: 2px 6px !important;
          }
          .print-doc-no {
            font-size: 9px !important;
            margin-top: 2px !important;
          }
          .print-value-size {
            font-size: 20px !important;
            line-height: 1.2 !important;
          }
          .print-body-size {
            font-size: 11px !important;
            line-height: 1.4 !important;
            margin-top: 8px !important;
          }
          .print-body-size > * {
            margin-top: 6px !important;
          }
          .print-ref-spacing {
            margin-top: 4px !important;
          }
          .print-ref-label {
            font-size: 8px !important;
          }
          .print-meta {
            font-size: 11px !important;
            margin-top: 6px !important;
          }
          .print-signature-area {
            padding-top: 10px !important;
            margin-top: auto !important;
            gap: 10px !important;
          }
          .print-date-line {
            font-size: 10px !important;
            padding-bottom: 2px !important;
          }
          .print-sign-line {
            margin-top: 4px !important;
            gap: 2px !important;
          }
          .print-sign-bar {
            width: 240px !important;
            margin-bottom: 2px !important;
          }
          .print-locador-name {
            font-size: 11px !important;
          }
          .print-locador-doc {
            font-size: 8px !important;
          }
          .print-divider {
            margin: 4px 0 !important;
            padding: 0 !important;
            border-top: 1px dashed #cbd5e1 !important;
            font-size: 8px !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
}
