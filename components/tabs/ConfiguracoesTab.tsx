import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getSupabase } from '@/lib/supabase';
import { 
  saveRestorePointToIDB, 
  getAllRestorePointsFromIDB, 
  deleteRestorePointFromIDB,
  clearOldRestorePointsFromIDB 
} from '@/lib/indexeddb-backup';
import { 
  Settings, 
  Shield, 
  Palette, 
  Loader2,
  BadgeDollarSign,
  RefreshCw,
  Activity,
  Sparkles,
  ChevronRight,
  CreditCard,
  Database,
  Download,
  Upload,
  RotateCcw,
  History,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Clock,
  Layers,
  ShieldCheck,
  Save,
  Sliders,
  Check,
  Eye,
  FileText,
  Home,
  Users,
  Building2,
  FileSignature
} from 'lucide-react';

export interface SystemBackupPayload {
  app: string;
  version: string;
  createdAt: string;
  authorEmail?: string;
  authorName?: string;
  label?: string;
  visualSettings: {
    platformName: string;
    platformSubtitle: string;
    primaryColorTheme: string;
    notificationDays: number;
    asaasSettings: {
      apiKey: string;
      env: 'sandbox' | 'production';
      autoBilling: boolean;
    };
  };
  data: {
    imoveis: any[];
    proprietarios: any[];
    inquilinos: any[];
    contratos: any[];
    pagamentos: any[];
    contract_templates: any[];
    audit_logs?: any[];
    user_profiles?: any[];
  };
  summary: {
    totalImoveis: number;
    totalProprietarios: number;
    totalInquilinos: number;
    totalContratos: number;
    totalPagamentos: number;
    totalTemplates: number;
  };
}

export interface RestorePoint {
  id: string;
  label: string;
  createdAt: string;
  summary: {
    totalImoveis: number;
    totalProprietarios: number;
    totalInquilinos: number;
    totalContratos: number;
    totalPagamentos: number;
    totalTemplates: number;
  };
  payload: SystemBackupPayload;
}

interface ConfiguracoesTabProps {
  perfis?: any[];
  logs?: any[];
  imoveis?: any[];
  inquilinos?: any[];
  proprietarios?: any[];
  contratos?: any[];
  pagamentos?: any[];
  contractTemplates?: any[];
  setContractTemplates?: React.Dispatch<React.SetStateAction<any[]>>;
  notificationDays?: number;
  setNotificationDays?: (days: number) => void;
  platformName?: string;
  setPlatformName?: (name: string) => void;
  platformSubtitle?: string;
  setPlatformSubtitle?: (sub: string) => void;
  primaryColorTheme?: string;
  setPrimaryColorTheme?: (color: string) => void;
  userProfile?: any;
  session?: any;
  fetchData?: () => Promise<void>;
  recordLog?: (acao: string, tabela: string, registroId?: string, detalhes?: any) => Promise<void>;
}

export const ConfiguracoesTab: React.FC<ConfiguracoesTabProps> = ({
  perfis = [],
  logs = [],
  imoveis = [],
  inquilinos = [],
  proprietarios = [],
  contratos = [],
  pagamentos = [],
  contractTemplates = [],
  setContractTemplates,
  notificationDays = 60,
  setNotificationDays,
  platformName = 'REALIZZE',
  setPlatformName,
  platformSubtitle = 'Gestão Imobiliária Integrada',
  setPlatformSubtitle,
  primaryColorTheme = 'blue',
  setPrimaryColorTheme,
  userProfile,
  session,
  fetchData,
  recordLog
}) => {
  // States para Integração Asaas
  const [asaasApiKey, setAsaasApiKey] = useState('');
  const [asaasEnv, setAsaasEnv] = useState<'sandbox' | 'production'>('sandbox');
  const [asaasAutoBilling, setAsaasAutoBilling] = useState(false);
  const [isTestingAsaas, setIsTestingAsaas] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string; showSql?: boolean } | null>(null);

  // States para Aparência e Marca
  const [localPlatformName, setLocalPlatformName] = useState(platformName);
  const [localSubtitle, setLocalSubtitle] = useState(platformSubtitle);
  const [localTheme, setLocalTheme] = useState(primaryColorTheme);
  const [localNotifDays, setLocalNotifDays] = useState(notificationDays);
  const [isSavingVisual, setIsSavingVisual] = useState(false);
  const [visualSaveSuccess, setVisualSaveSuccess] = useState(false);

  // States para Sistema de Backup e Restauração
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [newSnapshotLabel, setNewSnapshotLabel] = useState('');
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<SystemBackupPayload | null>(null);
  const [restoreMode, setRestoreMode] = useState<'full' | 'merge'>('full');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStep, setRestoreStep] = useState<{ current: number; total: number; title: string } | null>(null);
  const [restoreFeedback, setRestoreFeedback] = useState<{ success: boolean; message: string; summary?: any } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Procura no log por última sincronização do webhook do Asaas
  const lastAsaasWebhookLog = useMemo(() => {
    return logs.find(log => 
      log.acao === 'ASSINATURA_UPGRADE_WEBHOOK' || 
      log.acao?.toLowerCase().includes('asaas') ||
      (log.tabela === 'user_profiles' && log.detalhes?.integration === 'asaas_webhook')
    );
  }, [logs]);

  // Contagem de assinaturas ativas de outros usuários (apenas para MASTER)
  const activeSubscriptionsCount = useMemo(() => {
    if (!perfis || perfis.length === 0) return 0;
    return perfis.filter(p => 
      p.plano && 
      p.plano !== 'Gratuito' && 
      (p.status_pagamento === 'PAGO' || p.status_pagamento === 'Ativo' || p.status_pagamento === 'ATIVO')
    ).length;
  }, [perfis]);

  // Carregar dados salvos locais
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('asaas_api_key') || '';
      const savedEnv = (localStorage.getItem('asaas_env') as 'sandbox' | 'production') || 'sandbox';
      const savedAutoBilling = localStorage.getItem('asaas_auto_billing') === 'true';
      setAsaasApiKey(savedKey);
      setAsaasEnv(savedEnv);
      setAsaasAutoBilling(savedAutoBilling);

      const savedName = localStorage.getItem('realizze_platform_name');
      if (savedName) {
        setLocalPlatformName(savedName);
        if (setPlatformName) setPlatformName(savedName);
      }
      const savedSub = localStorage.getItem('realizze_platform_subtitle');
      if (savedSub) {
        setLocalSubtitle(savedSub);
        if (setPlatformSubtitle) setPlatformSubtitle(savedSub);
      }
      const savedTheme = localStorage.getItem('realizze_theme_color');
      if (savedTheme) {
        setLocalTheme(savedTheme);
        if (setPrimaryColorTheme) setPrimaryColorTheme(savedTheme);
      }
      const savedDays = localStorage.getItem('notification_days');
      if (savedDays) {
        const d = parseInt(savedDays, 10);
        if (!isNaN(d)) {
          setLocalNotifDays(d);
          if (setNotificationDays) setNotificationDays(d);
        }
      }

      // Carregar pontos de restauração salvos do IndexedDB (e migrar legados do localStorage para liberar cota)
      const loadRestorePoints = async () => {
        try {
          // Migração de legados do localStorage se houver
          const savedPointsRaw = localStorage.getItem('realizze_system_restore_points_v1');
          if (savedPointsRaw) {
            try {
              const parsed = JSON.parse(savedPointsRaw);
              if (Array.isArray(parsed)) {
                for (const p of parsed) {
                  await saveRestorePointToIDB(p).catch(() => {});
                }
              }
            } catch {}
            // Limpa do localStorage para nunca mais estourar cota
            localStorage.removeItem('realizze_system_restore_points_v1');
          }

          const points = await getAllRestorePointsFromIDB();
          setRestorePoints(points);
        } catch (e) {
          console.warn("Erro ao carregar pontos de restauração do IndexedDB:", e);
        }
      };
      loadRestorePoints();
    }

    const loadProfileFromDb = async () => {
      try {
        const supabase = getSupabase();
        if (!supabase) return;

        const userRes = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
        const user = userRes?.data?.user;
        if (!user) return;

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          if (profile.asaas_key) {
            setAsaasApiKey(profile.asaas_key);
            localStorage.setItem('asaas_api_key', profile.asaas_key);
          }
          if (profile.asaas_env) {
            setAsaasEnv(profile.asaas_env as 'sandbox' | 'production');
            localStorage.setItem('asaas_env', profile.asaas_env);
          }
          if (profile.asaas_auto_billing !== undefined && profile.asaas_auto_billing !== null) {
            setAsaasAutoBilling(profile.asaas_auto_billing);
            localStorage.setItem('asaas_auto_billing', profile.asaas_auto_billing ? 'true' : 'false');
          }
        }
      } catch (e) {
        console.warn("Erro ao ler credenciais do banco:", e);
      }
    };
    loadProfileFromDb();
  }, [setPlatformName, setPlatformSubtitle, setPrimaryColorTheme, setNotificationDays]);

  // Função para gerar o payload completo de backup
  const generateBackupPayload = (label?: string): SystemBackupPayload => {
    return {
      app: 'REALIZZE',
      version: '2.0',
      createdAt: new Date().toISOString(),
      authorEmail: session?.user?.email || userProfile?.email || 'master@realizze.com',
      authorName: userProfile?.nome || 'Administrador Master',
      label: label || `Backup Geral - ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
      visualSettings: {
        platformName: localPlatformName,
        platformSubtitle: localSubtitle,
        primaryColorTheme: localTheme,
        notificationDays: localNotifDays,
        asaasSettings: {
          apiKey: asaasApiKey,
          env: asaasEnv,
          autoBilling: asaasAutoBilling
        }
      },
      data: {
        imoveis: imoveis || [],
        proprietarios: proprietarios || [],
        inquilinos: inquilinos || [],
        contratos: contratos || [],
        pagamentos: pagamentos || [],
        contract_templates: contractTemplates || [],
        audit_logs: (logs || []).slice(0, 100),
        user_profiles: (perfis || [])
      },
      summary: {
        totalImoveis: (imoveis || []).length,
        totalProprietarios: (proprietarios || []).length,
        totalInquilinos: (inquilinos || []).length,
        totalContratos: (contratos || []).length,
        totalPagamentos: (pagamentos || []).length,
        totalTemplates: (contractTemplates || []).length
      }
    };
  };

  // Salvar ponto de restauração instantâneo
  const handleCreateSnapshot = async (downloadAlso: boolean = false) => {
    setIsCreatingSnapshot(true);
    try {
      const payload = generateBackupPayload(newSnapshotLabel.trim() || undefined);
      const newPoint: RestorePoint = {
        id: `rp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        label: payload.label || 'Ponto de Restauração',
        createdAt: payload.createdAt,
        summary: payload.summary,
        payload
      };

      // Salva no IndexedDB sem restrição de cota
      await saveRestorePointToIDB(newPoint);
      await clearOldRestorePointsFromIDB(25);

      const updated = [newPoint, ...restorePoints.filter(p => p.id !== newPoint.id)].slice(0, 25);
      setRestorePoints(updated);

      if (recordLog) {
        await recordLog(
          'PONTO_RESTAURACAO_CRIADO',
          'sistema',
          newPoint.id,
          { label: newPoint.label, summary: newPoint.summary }
        ).catch(() => {});
      }

      if (downloadAlso) {
        downloadBackupJson(payload, `backup_completo_realizze_${new Date().toISOString().slice(0,10)}_${Date.now().toString().slice(-4)}.json`);
      }

      setNewSnapshotLabel('');
      setIsSnapshotModalOpen(false);
      setRestoreFeedback({
        success: true,
        message: `Ponto de restauração "${newPoint.label}" criado com sucesso! Todos os dados (${payload.summary.totalImoveis} imóveis, ${payload.summary.totalContratos} contratos, etc.) e configurações visuais estão salvos de forma segura no banco local do seu navegador.`
      });
      setTimeout(() => setRestoreFeedback(null), 8000);
    } catch (err: any) {
      console.error('Erro ao criar ponto de restauração:', err);
      setRestoreFeedback({
        success: false,
        message: 'Erro ao criar ponto de restauração: ' + (err?.message || 'Erro inesperado')
      });
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  // Download do arquivo JSON de backup
  const downloadBackupJson = (payload?: SystemBackupPayload, filename?: string) => {
    try {
      const dataToDownload = payload || generateBackupPayload();
      const jsonStr = JSON.stringify(dataToDownload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
      link.download = filename || `backup_completo_realizze_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert('Erro ao exportar arquivo de backup: ' + (e?.message || 'Erro desconhecido'));
    }
  };

  // Excluir ponto de restauração
  const handleDeleteSnapshot = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja excluir este ponto de restauração salvo?')) return;
    try {
      await deleteRestorePointFromIDB(id);
      const updated = restorePoints.filter(p => p.id !== id);
      setRestorePoints(updated);
    } catch (err: any) {
      console.warn("Erro ao deletar ponto do IndexedDB:", err);
      const updated = restorePoints.filter(p => p.id !== id);
      setRestorePoints(updated);
    }
  };

  // Leitura do arquivo de backup importado
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processBackupFile(files[0]);
  };

  const processBackupFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      alert('Por favor, selecione um arquivo válido no formato .json de backup do Realizze.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        // Validação mínima do schema
        if (!parsed || !parsed.data) {
          throw new Error('O arquivo selecionado não contém uma estrutura de backup válida (bloco "data" não encontrado).');
        }

        const validPayload: SystemBackupPayload = {
          app: parsed.app || 'REALIZZE',
          version: parsed.version || '2.0',
          createdAt: parsed.createdAt || new Date().toISOString(),
          authorEmail: parsed.authorEmail,
          authorName: parsed.authorName,
          label: parsed.label || file.name,
          visualSettings: parsed.visualSettings || {
            platformName: 'REALIZZE',
            platformSubtitle: 'Gestão Imobiliária Integrada',
            primaryColorTheme: 'blue',
            notificationDays: 60,
            asaasSettings: {
              apiKey: '',
              env: 'sandbox',
              autoBilling: false
            }
          },
          data: {
            imoveis: Array.isArray(parsed.data.imoveis) ? parsed.data.imoveis : [],
            proprietarios: Array.isArray(parsed.data.proprietarios) ? parsed.data.proprietarios : [],
            inquilinos: Array.isArray(parsed.data.inquilinos) ? parsed.data.inquilinos : [],
            contratos: Array.isArray(parsed.data.contratos) ? parsed.data.contratos : [],
            pagamentos: Array.isArray(parsed.data.pagamentos) ? parsed.data.pagamentos : [],
            contract_templates: Array.isArray(parsed.data.contract_templates) ? parsed.data.contract_templates : [],
            audit_logs: Array.isArray(parsed.data.audit_logs) ? parsed.data.audit_logs : [],
            user_profiles: Array.isArray(parsed.data.user_profiles) ? parsed.data.user_profiles : []
          },
          summary: parsed.summary || {
            totalImoveis: parsed.data.imoveis?.length || 0,
            totalProprietarios: parsed.data.proprietarios?.length || 0,
            totalInquilinos: parsed.data.inquilinos?.length || 0,
            totalContratos: parsed.data.contratos?.length || 0,
            totalPagamentos: parsed.data.pagamentos?.length || 0,
            totalTemplates: parsed.data.contract_templates?.length || 0
          }
        };

        setSelectedBackupForRestore(validPayload);
        setRestoreModalOpen(true);
      } catch (err: any) {
        alert('Erro ao interpretar arquivo de backup: ' + (err?.message || 'Arquivo JSON corrompido.'));
      }
    };
    reader.readAsText(file);
  };

  // Função para limpar registros de joins antes de enviar para o Supabase
  const sanitizeRecord = (rec: any, userId?: string) => {
    const clean = { ...rec };
    delete clean.imoveis;
    delete clean.inquilinos;
    delete clean.proprietarios;
    delete clean.contratos;
    if (userId && !clean.user_id) {
      clean.user_id = userId;
    }
    return clean;
  };

  // Executar a restauração
  const handleExecuteRestore = async () => {
    if (!selectedBackupForRestore) return;
    setIsRestoring(true);
    setRestoreFeedback(null);

    const supabase = getSupabase();
    const currentUserId = session?.user?.id || userProfile?.id;

    try {
      const { data, visualSettings } = selectedBackupForRestore;
      const totalSteps = 7;

      // 1. Restaurar Proprietários
      setRestoreStep({ current: 1, total: totalSteps, title: 'Restaurando Proprietários...' });
      if (supabase && data.proprietarios && data.proprietarios.length > 0) {
        const cleanProps = data.proprietarios.map(p => sanitizeRecord(p, currentUserId));
        for (const item of cleanProps) {
          await supabase.from('proprietarios').upsert(item, { onConflict: 'id' }).catch(() => {});
        }
      }

      // 2. Restaurar Inquilinos
      setRestoreStep({ current: 2, total: totalSteps, title: 'Restaurando Inquilinos / Locatários...' });
      if (supabase && data.inquilinos && data.inquilinos.length > 0) {
        const cleanInq = data.inquilinos.map(i => sanitizeRecord(i, currentUserId));
        for (const item of cleanInq) {
          await supabase.from('inquilinos').upsert(item, { onConflict: 'id' }).catch(() => {});
        }
      }

      // 3. Restaurar Imóveis
      setRestoreStep({ current: 3, total: totalSteps, title: 'Restaurando Imóveis...' });
      if (supabase && data.imoveis && data.imoveis.length > 0) {
        const cleanImov = data.imoveis.map(im => sanitizeRecord(im, currentUserId));
        for (const item of cleanImov) {
          await supabase.from('imoveis').upsert(item, { onConflict: 'id' }).catch(() => {});
        }
      }

      // 4. Restaurar Contratos
      setRestoreStep({ current: 4, total: totalSteps, title: 'Restaurando Contratos de Locação...' });
      if (supabase && data.contratos && data.contratos.length > 0) {
        const cleanContr = data.contratos.map(c => sanitizeRecord(c, currentUserId));
        for (const item of cleanContr) {
          await supabase.from('contratos').upsert(item, { onConflict: 'id' }).catch(() => {});
        }
      }

      // 5. Restaurar Pagamentos
      setRestoreStep({ current: 5, total: totalSteps, title: 'Restaurando Mensalidades e Repasses...' });
      if (supabase && data.pagamentos && data.pagamentos.length > 0) {
        const cleanPag = data.pagamentos.map(p => sanitizeRecord(p, currentUserId));
        for (const item of cleanPag) {
          await supabase.from('pagamentos').upsert(item, { onConflict: 'id' }).catch(() => {});
        }
      }

      // 6. Restaurar Modelos de Contratos
      setRestoreStep({ current: 6, total: totalSteps, title: 'Restaurando Modelos de Contratos...' });
      if (data.contract_templates && data.contract_templates.length > 0) {
        if (setContractTemplates) {
          setContractTemplates(data.contract_templates);
        }
        if (currentUserId && typeof window !== 'undefined') {
          localStorage.setItem(`contratos_templates_${currentUserId}`, JSON.stringify(data.contract_templates));
        }
        if (supabase) {
          const cleanTemplates = data.contract_templates.map(t => sanitizeRecord(t, currentUserId));
          for (const item of cleanTemplates) {
            await supabase.from('contract_templates').upsert(item, { onConflict: 'id' }).catch(() => {});
          }
        }
      }

      // 7. Restaurar Configurações Visuais e Integrações
      setRestoreStep({ current: 7, total: totalSteps, title: 'Restaurando Aparência, Alertas e Integrações...' });
      if (visualSettings) {
        if (visualSettings.platformName) {
          setLocalPlatformName(visualSettings.platformName);
          if (setPlatformName) setPlatformName(visualSettings.platformName);
          localStorage.setItem('realizze_platform_name', visualSettings.platformName);
        }
        if (visualSettings.platformSubtitle) {
          setLocalSubtitle(visualSettings.platformSubtitle);
          if (setPlatformSubtitle) setPlatformSubtitle(visualSettings.platformSubtitle);
          localStorage.setItem('realizze_platform_subtitle', visualSettings.platformSubtitle);
        }
        if (visualSettings.primaryColorTheme) {
          setLocalTheme(visualSettings.primaryColorTheme);
          if (setPrimaryColorTheme) setPrimaryColorTheme(visualSettings.primaryColorTheme);
          localStorage.setItem('realizze_theme_color', visualSettings.primaryColorTheme);
        }
        if (visualSettings.notificationDays) {
          setLocalNotifDays(visualSettings.notificationDays);
          if (setNotificationDays) setNotificationDays(visualSettings.notificationDays);
          localStorage.setItem('notification_days', String(visualSettings.notificationDays));
        }
        if (visualSettings.asaasSettings) {
          if (visualSettings.asaasSettings.apiKey) {
            setAsaasApiKey(visualSettings.asaasSettings.apiKey);
            localStorage.setItem('asaas_api_key', visualSettings.asaasSettings.apiKey);
          }
          if (visualSettings.asaasSettings.env) {
            setAsaasEnv(visualSettings.asaasSettings.env);
            localStorage.setItem('asaas_env', visualSettings.asaasSettings.env);
          }
          if (visualSettings.asaasSettings.autoBilling !== undefined) {
            setAsaasAutoBilling(visualSettings.asaasSettings.autoBilling);
            localStorage.setItem('asaas_auto_billing', visualSettings.asaasSettings.autoBilling ? 'true' : 'false');
          }
        }
      }

      // Gravar log de auditoria
      if (recordLog) {
        await recordLog(
          'SISTEMA_BACKUP_RESTAURADO',
          'sistema',
          undefined,
          {
            label: selectedBackupForRestore.label,
            restoredAt: new Date().toISOString(),
            summary: selectedBackupForRestore.summary
          }
        );
      }

      // Recarregar dados da tela
      if (fetchData) {
        await fetchData();
      }

      setRestoreFeedback({
        success: true,
        message: 'Sistema restaurado com sucesso para o ponto selecionado! Todas as tabelas de dados, contratos, cadastros e personalizações visuais foram atualizadas.',
        summary: selectedBackupForRestore.summary
      });
      setRestoreModalOpen(false);
      setSelectedBackupForRestore(null);
    } catch (err: any) {
      console.error('Erro na restauração:', err);
      setRestoreFeedback({
        success: false,
        message: 'Ocorreu um erro durante o processo de restauração: ' + (err?.message || 'Erro inesperado')
      });
    } finally {
      setIsRestoring(false);
      setRestoreStep(null);
    }
  };

  // Salvar Configurações Visuais
  const saveVisualSettings = () => {
    setIsSavingVisual(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('realizze_platform_name', localPlatformName);
        localStorage.setItem('realizze_platform_subtitle', localSubtitle);
        localStorage.setItem('realizze_theme_color', localTheme);
        localStorage.setItem('notification_days', String(localNotifDays));
      }

      if (setPlatformName) setPlatformName(localPlatformName);
      if (setPlatformSubtitle) setPlatformSubtitle(localSubtitle);
      if (setPrimaryColorTheme) setPrimaryColorTheme(localTheme);
      if (setNotificationDays) setNotificationDays(localNotifDays);

      setVisualSaveSuccess(true);
      setTimeout(() => setVisualSaveSuccess(false), 4000);
    } catch (e) {
      alert("Erro ao salvar visual local.");
    } finally {
      setIsSavingVisual(false);
    }
  };

  const saveSettingsToDb = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase não pôde ser carregado.");

      const userRes = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      const user = userRes?.data?.user;
      if (!user) throw new Error("Usuário não autenticado.");

      const { error } = await supabase
        .from('user_profiles')
        .update({
          asaas_key: asaasApiKey,
          asaas_env: asaasEnv,
          asaas_auto_billing: asaasAutoBilling
        })
        .eq('id', user.id);

      if (error) {
        console.error("Erro ao salvar no banco:", error);
        if (error.code === '42703' || error.message?.includes('asaas_key') || error.message?.includes('column')) {
          setSaveStatus({
            success: false,
            message: "Atenção: A tabela 'user_profiles' não possui os campos de integração do Asaas. Por favor, execute as instruções SQL abaixo no 'SQL Editor' do seu painel Supabase para habilitar o salvamento persistente.",
            showSql: true
          });
          return;
        }
        throw error;
      }

      setSaveStatus({ success: true, message: "Todas as configurações do Asaas foram salvas com sucesso e estão disponíveis globalmente para todos os usuários!" });
      setTimeout(() => setSaveStatus(null), 8000);
    } catch (err: any) {
      setSaveStatus({ success: false, message: err.message || "Erro ao salvar as configurações." });
    } finally {
      setIsSaving(false);
    }
  };

  const testAsaasConnection = async () => {
    if (!asaasApiKey) return;
    setIsTestingAsaas(true);
    setTestResult(null);
    try {
      const response = await fetch('/api/asaas/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: asaasApiKey,
          env: asaasEnv,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        setTestResult({ success: false, message: 'Não foi possível ler a resposta do servidor. Por favor, verifique se seu servidor já carregou a rota e tente novamente.' });
        return;
      }

      if (response.ok && data.success) {
        setTestResult({ success: true, message: 'Sucesso! Chave conectada com sucesso.' });
      } else {
        setTestResult({ success: false, message: data.error || 'Falha na conexão.' });
      }
    } catch (err) {
      setTestResult({ success: false, message: 'Erro ao tentar se conectar ao Asaas.' });
    } finally {
      setIsTestingAsaas(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Cabeçalho da Aba Master */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <Settings size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Configurações do Sistema</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                  Nível Master
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Gerencie pontos de restauração, backups JSON, identidade visual e parâmetros globais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback de Restauração / Backup Geral */}
      {restoreFeedback && (
        <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
          restoreFeedback.success ? 'bg-emerald-50/70 text-emerald-900 border-emerald-200/70' : 'bg-red-50/70 text-red-900 border-red-200/70'
        }`}>
          <div className={`p-2 rounded-lg shrink-0 ${restoreFeedback.success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {restoreFeedback.success ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          </div>
          <div className="space-y-1 flex-1 text-xs">
            <h4 className="font-semibold text-zinc-900">
              {restoreFeedback.success ? 'Operação Concluída com Sucesso' : 'Atenção na Operação'}
            </h4>
            <p className="text-zinc-600 leading-relaxed">{restoreFeedback.message}</p>
            {restoreFeedback.summary && (
              <div className="flex flex-wrap gap-2 pt-1.5">
                <span className="px-2.5 py-0.5 bg-white rounded-md text-[11px] font-medium text-zinc-700 border border-zinc-200/60 shadow-2xs">
                  {restoreFeedback.summary.totalImoveis || 0} Imóveis
                </span>
                <span className="px-2.5 py-0.5 bg-white rounded-md text-[11px] font-medium text-zinc-700 border border-zinc-200/60 shadow-2xs">
                  {restoreFeedback.summary.totalContratos || 0} Contratos
                </span>
                <span className="px-2.5 py-0.5 bg-white rounded-md text-[11px] font-medium text-zinc-700 border border-zinc-200/60 shadow-2xs">
                  {restoreFeedback.summary.totalInquilinos || 0} Inquilinos
                </span>
                <span className="px-2.5 py-0.5 bg-white rounded-md text-[11px] font-medium text-zinc-700 border border-zinc-200/60 shadow-2xs">
                  {restoreFeedback.summary.totalPagamentos || 0} Pagamentos
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setRestoreFeedback(null)}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-800 px-2.5 py-1 rounded-lg hover:bg-black/5 transition-all"
          >
            Fechar
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🛡️ CENTRAL DE BACKUP E PONTOS DE RESTAURAÇÃO */}
      {/* ========================================================================= */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200/60">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 tracking-tight">Backup & Restauração Completa</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Crie instantâneos seguros de 100% dos dados cadastrados e de toda a identidade visual para restauração a qualquer momento.
              </p>
            </div>
          </div>

          {/* Botões de Ação de Backup */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setIsSnapshotModalOpen(true)}
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-all shadow-xs active:scale-[0.98] cursor-pointer"
            >
              <Sparkles size={14} />
              Criar Ponto de Restauração
            </button>

            <button
              type="button"
              onClick={() => downloadBackupJson()}
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-white hover:bg-zinc-50 text-zinc-700 font-medium text-xs rounded-lg border border-zinc-200/80 transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
            >
              <Download size={14} />
              Baixar JSON
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-white hover:bg-zinc-50 text-zinc-700 font-medium text-xs rounded-lg border border-zinc-200/80 transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
            >
              <Upload size={14} />
              Importar Backup (.json)
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json,application/json" 
              onChange={handleFileChange}
              className="hidden" 
            />
          </div>
        </div>

        {/* Resumo ao Vivo dos Dados Protegidos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-100 text-center">
            <div className="text-[11px] font-medium text-zinc-500 mb-1 flex items-center justify-center gap-1.5">
              <Building2 size={13} className="text-zinc-400" /> Imóveis
            </div>
            <p className="text-xl font-semibold text-zinc-900 font-mono">{(imoveis || []).length}</p>
          </div>

          <div className="bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-100 text-center">
            <div className="text-[11px] font-medium text-zinc-500 mb-1 flex items-center justify-center gap-1.5">
              <FileSignature size={13} className="text-zinc-400" /> Contratos
            </div>
            <p className="text-xl font-semibold text-zinc-900 font-mono">{(contratos || []).length}</p>
          </div>

          <div className="bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-100 text-center">
            <div className="text-[11px] font-medium text-zinc-500 mb-1 flex items-center justify-center gap-1.5">
              <Users size={13} className="text-zinc-400" /> Inquilinos
            </div>
            <p className="text-xl font-semibold text-zinc-900 font-mono">{(inquilinos || []).length}</p>
          </div>

          <div className="bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-100 text-center">
            <div className="text-[11px] font-medium text-zinc-500 mb-1 flex items-center justify-center gap-1.5">
              <Home size={13} className="text-zinc-400" /> Proprietários
            </div>
            <p className="text-xl font-semibold text-zinc-900 font-mono">{(proprietarios || []).length}</p>
          </div>

          <div className="bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-100 text-center">
            <div className="text-[11px] font-medium text-zinc-500 mb-1 flex items-center justify-center gap-1.5">
              <CreditCard size={13} className="text-zinc-400" /> Pagamentos
            </div>
            <p className="text-xl font-semibold text-zinc-900 font-mono">{(pagamentos || []).length}</p>
          </div>

          <div className="bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-100 text-center">
            <div className="text-[11px] font-medium text-zinc-500 mb-1 flex items-center justify-center gap-1.5">
              <Palette size={13} className="text-zinc-400" /> Identidade
            </div>
            <p className="text-[11px] font-semibold text-emerald-600 uppercase mt-1">100% Protegido</p>
          </div>
        </div>

        {/* Zona de Drag & Drop para Restauração Rápida */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              processBackupFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 rounded-xl border border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2 ${
            dragActive 
              ? 'border-zinc-900 bg-zinc-100/80 scale-[1.005]' 
              : 'border-zinc-300 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-400'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-white text-zinc-700 flex items-center justify-center shadow-2xs border border-zinc-200/80">
            <FileJson size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-800">
              Arraste e solte o arquivo de backup (.json) aqui para restaurar
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Ou clique para selecionar um arquivo local no seu dispositivo
            </p>
          </div>
        </div>

        {/* Lista de Pontos de Restauração Salvos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-700 flex items-center gap-2">
              <History size={14} className="text-zinc-400" />
              Pontos de Restauração Recentes ({restorePoints.length})
            </h3>
            {restorePoints.length > 0 && (
              <span className="text-[11px] text-zinc-400">
                Armazenados com segurança via IndexedDB
              </span>
            )}
          </div>

          {restorePoints.length === 0 ? (
            <div className="p-8 bg-zinc-50/60 rounded-xl border border-zinc-100 text-center space-y-1.5">
              <Clock className="mx-auto text-zinc-300" size={28} />
              <p className="text-xs font-medium text-zinc-600">Nenhum ponto de restauração gravado ainda.</p>
              <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                Clique no botão "Criar Ponto de Restauração" acima para salvar o estado completo antes de realizar modificações.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {restorePoints.map((point, index) => (
                <div 
                  key={point.id}
                  className="p-3.5 bg-zinc-50/50 hover:bg-zinc-50 transition-all rounded-xl border border-zinc-200/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        index === 0 ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-700'
                      }`}>
                        {index === 0 ? 'Mais Recente' : `Snapshot #${restorePoints.length - index}`}
                      </span>
                      <h4 className="text-xs font-semibold text-zinc-900">{point.label}</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-zinc-500">
                      <span>{new Date(point.createdAt).toLocaleString('pt-BR')}</span>
                      <span>•</span>
                      <span className="text-zinc-700">
                        {point.summary.totalImoveis} imóveis, {point.summary.totalContratos} contratos, {point.summary.totalInquilinos} inquilinos
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBackupForRestore(point.payload);
                        setRestoreModalOpen(true);
                      }}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      Restaurar
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadBackupJson(point.payload, `backup_realizze_${point.id}.json`)}
                      title="Baixar JSON deste ponto"
                      className="p-1.5 bg-white hover:bg-zinc-100 text-zinc-600 rounded-lg border border-zinc-200 transition-all cursor-pointer shadow-2xs"
                    >
                      <Download size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSnapshot(point.id, e)}
                      title="Excluir este ponto"
                      className="p-1.5 bg-white hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-lg border border-zinc-200 transition-all cursor-pointer shadow-2xs"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🎨 APARÊNCIA, MARCA E DIRETRIZES DO SISTEMA */}
      {/* ========================================================================= */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200/60">
            <Palette size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900 tracking-tight">Identidade Visual & Preferências</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Personalize o nome da plataforma, subtítulo e políticas de alertas.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 block">Nome do Sistema / Plataforma</label>
              <input 
                type="text" 
                value={localPlatformName}
                onChange={(e) => setLocalPlatformName(e.target.value)}
                placeholder="Ex: REALIZZE"
                className="w-full bg-white border border-zinc-200/80 focus:border-zinc-400 outline-none rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-medium transition-all shadow-2xs"
              />
              <span className="text-[11px] text-zinc-400 block">
                Aparece no topo da barra de navegação, relatórios e documentos exportados.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 block">Subtítulo / Descritor</label>
              <input 
                type="text" 
                value={localSubtitle}
                onChange={(e) => setLocalSubtitle(e.target.value)}
                placeholder="Ex: Gestão Imobiliária Integrada"
                className="w-full bg-white border border-zinc-200/80 focus:border-zinc-400 outline-none rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 transition-all shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 block">
                Alerta de Vencimento de Contratos (Dias de antecedência)
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  min={10}
                  max={180}
                  value={localNotifDays}
                  onChange={(e) => setLocalNotifDays(parseInt(e.target.value) || 60)}
                  className="w-28 bg-white border border-zinc-200/80 focus:border-zinc-400 outline-none rounded-xl px-3 py-2 text-xs font-mono text-zinc-900 font-semibold transition-all shadow-2xs"
                />
                <span className="text-xs text-zinc-500">dias antes do vencimento</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={saveVisualSettings}
                disabled={isSavingVisual}
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-all shadow-xs cursor-pointer"
              >
                {isSavingVisual ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                Salvar Preferências
              </button>

              {visualSaveSuccess && (
                <p className="text-emerald-600 font-medium text-xs mt-2 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Preferências visuais atualizadas com sucesso.
                </p>
              )}
            </div>
          </div>

          <div className="bg-zinc-50/70 p-5 rounded-xl border border-zinc-200/70 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                <Eye size={14} className="text-zinc-500" />
                Pré-visualização do Cabeçalho
              </h3>
              <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-2xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
                  <Home size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 tracking-tight">
                    {localPlatformName || 'REALIZZE'}
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    {localSubtitle || 'Gestão Imobiliária Integrada'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-100/80 rounded-lg text-xs text-zinc-600 leading-relaxed">
              Todas as personalizações de marca são salvas localmente e preservadas em todos os pontos de restauração e exportações JSON.
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 💳 INTEGRAÇÃO ASAAS */}
      {/* ========================================================================= */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200/60">
              <BadgeDollarSign size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 tracking-tight">Integração Asaas</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Gateway para faturamento e gestão de assinaturas recorrentes (Boleto, Pix e Cartão).</p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Conector Ativo
          </span>
        </div>

        {/* Telemetria de Integração */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-50/70 p-4 rounded-xl border border-zinc-200/60 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-zinc-700">Status do Webhook</span>
              {asaasApiKey ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded-full border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sincronizado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[10px] font-medium rounded-full border border-zinc-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  Sem Chave
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-zinc-500">
                <span>Último evento Webhook:</span>
                <span className="font-medium text-zinc-800">
                  {lastAsaasWebhookLog ? (
                    new Date(lastAsaasWebhookLog.created_at).toLocaleString('pt-BR')
                  ) : asaasApiKey ? (
                    "Ouvindo Gateway"
                  ) : (
                    "Não detectado"
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>Ambiente:</span>
                <span className="font-medium text-zinc-800 capitalize">
                  {asaasEnv === 'sandbox' ? 'Homologação (Sandbox)' : 'Produção'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-50/70 p-4 rounded-xl border border-zinc-200/60 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-zinc-700">Licenciamento & Assinaturas</span>
              <span className="inline-flex items-center px-2 py-0.5 bg-zinc-100 text-zinc-700 text-[10px] font-medium rounded-full border border-zinc-200">
                Painel Master
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-zinc-900 font-mono">
                  {activeSubscriptionsCount}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Assinaturas ativas no sistema</p>
              </div>
              <div className="px-3 py-1.5 bg-white rounded-lg border border-zinc-200/80 text-center">
                <span className="text-xs font-mono font-semibold text-zinc-800 block">{perfis.length}</span>
                <span className="text-[10px] text-zinc-400 block">Contas totais</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Formulário de Configuração do Asaas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 block">API Key ASAAS</label>
              <input 
                type="password" 
                value={asaasApiKey}
                onChange={(e) => {
                  setAsaasApiKey(e.target.value);
                  localStorage.setItem('asaas_api_key', e.target.value);
                }}
                placeholder="Ex: $aae.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-white border border-zinc-200/80 focus:border-zinc-400 outline-none rounded-xl px-3.5 py-2.5 font-mono text-xs text-zinc-900 transition-all shadow-2xs"
              />
              <span className="text-[11px] text-zinc-400 block">
                Chave gerada no painel do Asaas em <strong>Minha Conta &gt; Integrações &gt; Gerar API Key</strong>.
              </span>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 block">Ambiente de Operação</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-2.5 p-3 bg-white border rounded-xl cursor-pointer transition-all ${
                  asaasEnv === 'sandbox' ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200/80 hover:bg-zinc-50'
                }`}>
                  <input 
                    type="radio" 
                    name="asaas_env" 
                    value="sandbox" 
                    checked={asaasEnv === 'sandbox'} 
                    onChange={() => {
                      setAsaasEnv('sandbox');
                      localStorage.setItem('asaas_env', 'sandbox');
                    }}
                    className="accent-zinc-900"
                  />
                  <div>
                    <p className="text-xs font-medium text-zinc-800">Sandbox</p>
                    <p className="text-[10px] text-zinc-400">Testes e Simulações</p>
                  </div>
                </label>
                
                <label className={`flex items-center gap-2.5 p-3 bg-white border rounded-xl cursor-pointer transition-all ${
                  asaasEnv === 'production' ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200/80 hover:bg-zinc-50'
                }`}>
                  <input 
                    type="radio" 
                    name="asaas_env" 
                    value="production" 
                    checked={asaasEnv === 'production'} 
                    onChange={() => {
                      setAsaasEnv('production');
                      localStorage.setItem('asaas_env', 'production');
                    }}
                    className="accent-zinc-900"
                  />
                  <div>
                    <p className="text-xs font-medium text-zinc-800">Produção</p>
                    <p className="text-[10px] text-zinc-400">Transações Reais</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 bg-zinc-50/70 rounded-xl border border-zinc-200/60">
              <input 
                type="checkbox" 
                id="auto_billing" 
                checked={asaasAutoBilling} 
                onChange={(e) => {
                  setAsaasAutoBilling(e.target.checked);
                  localStorage.setItem('asaas_auto_billing', e.target.checked ? 'true' : 'false');
                }}
                className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-500 border-zinc-300 accent-zinc-900" 
              />
              <label htmlFor="auto_billing" className="text-xs text-zinc-700 font-medium select-none cursor-pointer">
                Habilitar Emissão Automática no faturamento do usuário
              </label>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={testAsaasConnection}
                  disabled={isTestingAsaas || !asaasApiKey}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-white hover:bg-zinc-50 disabled:opacity-40 text-zinc-700 font-medium text-xs rounded-lg border border-zinc-200/80 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
                >
                  {isTestingAsaas ? <Loader2 className="animate-spin" size={14} /> : null}
                  Testar Conexão
                </button>

                <button
                  type="button"
                  onClick={saveSettingsToDb}
                  disabled={isSaving || !asaasApiKey}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white font-medium text-xs rounded-lg transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : null}
                  Salvar no Banco
                </button>
                
                {testResult !== null && (
                  <span className={`text-xs font-medium ${testResult.success ? 'text-emerald-600' : 'text-red-500'}`}>
                    {testResult.message}
                  </span>
                )}
              </div>

              {saveStatus !== null && (
                <div className={`p-3.5 rounded-xl text-xs leading-relaxed border ${saveStatus.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60' : 'bg-red-50 text-red-900 border-red-200/60'}`}>
                  <p>{saveStatus.message}</p>
                  {saveStatus.showSql && (
                    <div className="mt-2.5 bg-zinc-900 text-zinc-100 p-3 rounded-lg font-mono text-[11px] space-y-1.5 select-all whitespace-pre-wrap">
                      <p className="text-zinc-400 font-medium">Instrução SQL - Execute no Supabase:</p>
                      <code>{`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS asaas_key text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS asaas_env text DEFAULT 'sandbox';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS asaas_auto_billing boolean DEFAULT false;`}</code>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-zinc-50/70 p-5 rounded-xl border border-zinc-200/60 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-zinc-700">Controle de Assinaturas</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                A integração do Asaas gerencia as assinaturas e planos da ferramenta para locadores e imobiliárias.
              </p>
              <div className="bg-white p-3 rounded-lg border border-zinc-200/60 text-xs text-zinc-600 leading-relaxed">
                As parcelas individuais de aluguéis e contratos cadastrados pelos usuários são processadas internamente e protegidas pela base de dados do Realizze.
              </div>
            </div>
            
            <div className="border-t border-zinc-200/60 pt-3 text-[11px] text-zinc-400">
              Certifique-se de que a conta Asaas esteja verificada antes de alternar para Produção.
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL: CRIAR PONTO DE RESTAURAÇÃO */}
      {/* ========================================================================= */}
      {isSnapshotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg border border-zinc-200/80 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200/60">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900 tracking-tight">Criar Ponto de Restauração</h3>
                <p className="text-xs text-zinc-500">Gera um instantâneo seguro do sistema</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 block">
                  Identificador / Rótulo do Ponto
                </label>
                <input 
                  type="text" 
                  value={newSnapshotLabel}
                  onChange={(e) => setNewSnapshotLabel(e.target.value)}
                  placeholder="Ex: Antes de alterar dados cadastrais"
                  className="w-full bg-white border border-zinc-200/80 focus:border-zinc-400 outline-none rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 transition-all shadow-2xs"
                />
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 text-xs text-zinc-600 space-y-1">
                <p className="font-medium text-zinc-800">Serão incluídos no backup:</p>
                <p>• {imoveis.length} Imóveis, {contratos.length} Contratos e {inquilinos.length} Inquilinos</p>
                <p>• {proprietarios.length} Proprietários e {pagamentos.length} Mensalidades</p>
                <p>• {contractTemplates.length} Modelos de Contratos e Identidade Visual</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSnapshotModalOpen(false)}
                className="px-3.5 py-2 bg-white hover:bg-zinc-50 text-zinc-700 rounded-lg font-medium text-xs border border-zinc-200/80 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                disabled={isCreatingSnapshot}
                onClick={() => handleCreateSnapshot(false)}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                {isCreatingSnapshot ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                Salvar Localmente
              </button>

              <button
                type="button"
                disabled={isCreatingSnapshot}
                onClick={() => handleCreateSnapshot(true)}
                className="px-3.5 py-2 bg-white hover:bg-zinc-50 text-zinc-800 rounded-lg font-medium text-xs border border-zinc-200/80 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <Download size={14} />
                Baixar JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESTAURAR PONTO OU ARQUIVO JSON */}
      {/* ========================================================================= */}
      {restoreModalOpen && selectedBackupForRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-lg border border-zinc-200/80 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
                <RotateCcw size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900 tracking-tight">Confirmar Restauração do Sistema</h3>
                <p className="text-xs text-zinc-500">Retornar o banco de dados e preferências para o estado gravado</p>
              </div>
            </div>

            {/* Resumo do Backup */}
            <div className="bg-zinc-50/70 p-4 rounded-xl border border-zinc-200/70 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60">
                <span className="text-zinc-500 font-medium">Ponto Selecionado:</span>
                <span className="font-semibold text-zinc-800">{selectedBackupForRestore.label || 'Backup Geral'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Data de Criação:</span>
                <span className="font-mono text-zinc-700">{new Date(selectedBackupForRestore.createdAt).toLocaleString('pt-BR')}</span>
              </div>

              <div className="pt-2 border-t border-zinc-200/60">
                <p className="text-[11px] font-medium text-zinc-500 mb-2">Registros que serão atualizados:</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg border border-zinc-200/60">
                    <span className="text-[10px] text-zinc-400 block">Imóveis</span>
                    <span className="text-xs font-semibold text-zinc-900">{selectedBackupForRestore.summary.totalImoveis}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-zinc-200/60">
                    <span className="text-[10px] text-zinc-400 block">Contratos</span>
                    <span className="text-xs font-semibold text-zinc-900">{selectedBackupForRestore.summary.totalContratos}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-zinc-200/60">
                    <span className="text-[10px] text-zinc-400 block">Inquilinos</span>
                    <span className="text-xs font-semibold text-zinc-900">{selectedBackupForRestore.summary.totalInquilinos}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-zinc-200/60">
                    <span className="text-[10px] text-zinc-400 block">Proprietários</span>
                    <span className="text-xs font-semibold text-zinc-900">{selectedBackupForRestore.summary.totalProprietarios}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-zinc-200/60">
                    <span className="text-[10px] text-zinc-400 block">Pagamentos</span>
                    <span className="text-xs font-semibold text-zinc-900">{selectedBackupForRestore.summary.totalPagamentos}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-zinc-200/60">
                    <span className="text-[10px] text-zinc-400 block">Templates</span>
                    <span className="text-xs font-semibold text-zinc-900">{selectedBackupForRestore.summary.totalTemplates}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Aviso de Confirmação */}
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/70 text-amber-900 text-xs space-y-1">
              <p className="font-medium flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                Atenção
              </p>
              <p className="text-amber-800 leading-relaxed">
                Esta operação substituirá os registros atuais pelos contidos neste ponto de restauração.
              </p>
            </div>

            {/* Barra de Progresso Durante a Restauração */}
            {isRestoring && restoreStep && (
              <div className="space-y-1.5 p-3.5 bg-zinc-100 rounded-xl border border-zinc-200">
                <div className="flex justify-between items-center text-xs font-medium text-zinc-800">
                  <span>{restoreStep.title}</span>
                  <span>{restoreStep.current} / {restoreStep.total}</span>
                </div>
                <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-zinc-900 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(restoreStep.current / restoreStep.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isRestoring}
                onClick={() => {
                  setRestoreModalOpen(false);
                  setSelectedBackupForRestore(null);
                }}
                className="px-3.5 py-2 bg-white hover:bg-zinc-50 text-zinc-700 rounded-lg font-medium text-xs border border-zinc-200/80 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                disabled={isRestoring}
                onClick={handleExecuteRestore}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                {isRestoring ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                Confirmar Restauração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

