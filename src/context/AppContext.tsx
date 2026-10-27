import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Project, 
  UserProfile, 
  WorkerEntry, 
  PhotoEvidence, 
  FvsItem, 
  RncItem, 
  CostLineItem, 
  ErpSyncLog, 
  AuditLogItem, 
  ChatMessage, 
  ChatChannel 
} from '../types';
import { 
  INITIAL_PROJECTS, 
  DEMO_USERS, 
  COST_LINE_ITEMS, 
  WORKERS_LIST, 
  PHOTO_EVIDENCES, 
  FVS_ITEMS, 
  RNC_ITEMS, 
  ERP_SYNC_LOGS, 
  AUDIT_LOGS, 
  CHAT_CHANNELS, 
  INITIAL_MESSAGES 
} from '../mock/data';

export type NavigationTab = 
  | 'dashboard-gerencial'
  | 'diario-de-obra-rdo'
  | 'painel-de-custos'
  | 'relatorio-fotografico'
  | 'auditorias-inspecoes-fvs'
  | 'nao-conformidades-rnc'
  | 'cronograma-gantt'
  | 'efetivo-e-equipamentos'
  | 'comunicacao-de-campo'
  | 'gestao-de-usuarios'
  | 'integracao-erp-api'
  | 'logs-auditoria'
  | 'relatorios-executivos'
  | 'configuracoes';

interface AppContextType {
  currentUser: UserProfile | null;
  login: (user: UserProfile) => void;
  logout: () => void;
  activeProject: Project;
  setActiveProject: (p: Project) => void;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  isOffline: boolean;
  toggleOffline: () => void;
  pendingOfflineCount: number;
  syncOfflineData: () => void;
  isSyncing: boolean;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isProjectDrawerOpen: boolean;
  setIsProjectDrawerOpen: (open: boolean) => void;
  isPdfModalOpen: boolean;
  setIsPdfModalOpen: (open: boolean) => void;
  pdfReportType: 'rdo' | 'custos' | 'fotos' | 'executivo';
  openPdfModal: (type: 'rdo' | 'custos' | 'fotos' | 'executivo') => void;
  toast: { message: string; type: 'success' | 'info' | 'error' | 'warning' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  
  // Data & Mutators
  workers: WorkerEntry[];
  addWorker: (w: Omit<WorkerEntry, 'id'>) => void;
  reallocateWorkers: (fromFront: string, toFront: string, count: number, reason: string) => void;
  fvsList: FvsItem[];
  approveFvs: (id: string, withReservation?: boolean) => void;
  batchApproveFvs: (ids: string[]) => void;
  rncList: RncItem[];
  addRnc: (rnc: Omit<RncItem, 'id' | 'code'>) => void;
  resolveRnc: (id: string) => void;
  costItems: CostLineItem[];
  erpLogs: ErpSyncLog[];
  triggerErpSync: (systemName: 'SAP' | 'TOTVS' | 'Sienge' | 'Mega') => Promise<void>;
  auditLogs: AuditLogItem[];
  addAuditLog: (action: string, category: AuditLogItem['category'], details: string) => void;
  chatMessages: ChatMessage[];
  sendMessage: (channelId: string, text: string) => void;
  activeChatChannel: string;
  setActiveChatChannel: (id: string) => void;
  isRdoSigned: boolean;
  signRdo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user: default to Eng. Ricardo Souza
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('obrasync_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEMO_USERS[0];
  });

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProject, setActiveProjectState] = useState<Project>(INITIAL_PROJECTS[0]);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard-gerencial');
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfReportType, setPdfReportType] = useState<'rdo' | 'custos' | 'fotos' | 'executivo'>('rdo');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | 'warning' } | null>(null);

  // Entities
  const [workers, setWorkers] = useState<WorkerEntry[]>(WORKERS_LIST);
  const [fvsList, setFvsList] = useState<FvsItem[]>(FVS_ITEMS);
  const [rncList, setRncList] = useState<RncItem[]>(RNC_ITEMS);
  const [costItems, setCostItems] = useState<CostLineItem[]>(COST_LINE_ITEMS);
  const [erpLogs, setErpLogs] = useState<ErpSyncLog[]>(ERP_SYNC_LOGS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(AUDIT_LOGS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [activeChatChannel, setActiveChatChannel] = useState<string>('ch-01');
  const [isRdoSigned, setIsRdoSigned] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('obrasync_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('obrasync_user');
    }
  }, [currentUser]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3800);
  };

  const login = (user: UserProfile) => {
    setCurrentUser(user);
    showToast(`Bem-vindo, ${user.name}! Sessão autenticada.`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Sessão corporativa encerrada.', 'info');
  };

  const setActiveProject = (p: Project) => {
    setActiveProjectState(p);
    addAuditLog('TROCA DE CONTEXTO DE CANTEIRO', 'USUARIO', `Alternado contexto para ${p.name} (${p.code})`);
    showToast(`Contexto alterado para: ${p.name}`, 'info');
  };

  const toggleOffline = () => {
    if (!isOffline) {
      setIsOffline(true);
      setPendingOfflineCount(4);
      showToast('Modo Offline Ativado: Dados salvos localmente em IndexedDB/SQLite.', 'warning');
    } else {
      setIsOffline(false);
      syncOfflineData();
    }
  };

  const syncOfflineData = () => {
    setIsSyncing(true);
    showToast('Sincronizando dados pendentes com a nuvem central...', 'info');
    setTimeout(() => {
      setPendingOfflineCount(0);
      setIsSyncing(false);
      showToast('Sincronização 100% concluída! 14 itens auditados e gravados.', 'success');
      addAuditLog('SINCRONIZAÇÃO NUVEM REALIZADA', 'RDO', 'Itens do buffer local descarregados com sucesso.');
    }, 1500);
  };

  const openPdfModal = (type: 'rdo' | 'custos' | 'fotos' | 'executivo') => {
    setPdfReportType(type);
    setIsPdfModalOpen(true);
  };

  const addWorker = (w: Omit<WorkerEntry, 'id'>) => {
    const newWorker: WorkerEntry = {
      ...w,
      id: `w-${Date.now()}`
    };
    setWorkers(prev => [newWorker, ...prev]);
    addAuditLog('NOVO APONTAMENTO MANUAL DE EFETIVO', 'RDO', `Operário ${w.name} (${w.role}) adicionado manualmente.`);
    showToast(`Operário ${w.name} registrado com sucesso!`, 'success');
  };

  const reallocateWorkers = (fromFront: string, toFront: string, count: number, reason: string) => {
    addAuditLog('REMANEJAMENTO DE CONTINGENTE', 'RDO', `${count} operários movidos de "${fromFront}" para "${toFront}". Motivo: ${reason}`);
    showToast(`Remanejamento de ${count} colaboradores aplicado no RDO!`, 'success');
  };

  const approveFvs = (id: string, withReservation: boolean = false) => {
    setFvsList(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: withReservation ? 'aprovado_ressalva' : 'aprovado'
        };
      }
      return item;
    }));
    addAuditLog('HOMOLOGAÇÃO DE FICHA FVS', 'FVS', `FVS ${id} liberada e assinada com carimbo ICP-Brasil.`);
    showToast(withReservation ? 'FVS Aprovada com Ressalva Técnica.' : 'FVS Aprovada e Liberada!', 'success');
  };

  const batchApproveFvs = (ids: string[]) => {
    setFvsList(prev => prev.map(item => {
      if (ids.includes(item.id)) {
        return { ...item, status: 'aprovado' };
      }
      return item;
    }));
    addAuditLog('APROVAÇÃO EM LOTE FVS', 'FVS', `${ids.length} fichas FVS liberadas simultaneamente.`);
    showToast(`${ids.length} fichas de verificação aprovadas com sucesso!`, 'success');
  };

  const addRnc = (rnc: Omit<RncItem, 'id' | 'code'>) => {
    const nextNum = rncList.length + 90;
    const newRnc: RncItem = {
      ...rnc,
      id: `rnc-${Date.now()}`,
      code: `RNC-2024-0${nextNum}`
    };
    setRncList(prev => [newRnc, ...prev]);
    addAuditLog('ABERTURA DE NÃO CONFORMIDADE', 'RNC', `RNC ${newRnc.code} aberta com severidade ${rnc.severity}. Bloqueio: ${rnc.blocksWork ? 'SIM' : 'NÃO'}`);
    showToast(`RNC ${newRnc.code} registrada com sucesso!`, 'error');
  };

  const resolveRnc = (id: string) => {
    setRncList(prev => prev.map(r => r.id === id ? { ...r, status: 'encerrada', blocksWork: false } : r));
    addAuditLog('BAIXA DEFINITIVA DE RNC', 'RNC', `RNC ${id} concluída com laudo pericial satisfatório.`);
    showToast('RNC concluída e frente liberada!', 'success');
  };

  const triggerErpSync = async (systemName: 'SAP' | 'TOTVS' | 'Sienge' | 'Mega') => {
    showToast(`Conectando ao barramento ${systemName}...`, 'info');
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newLog: ErpSyncLog = {
          id: `sync-${Date.now()}`,
          system: systemName,
          endpoint: `/api/v2/${systemName.toLowerCase()}/financeiro/sync-instantaneo`,
          status: 'success',
          recordsTransferred: Math.floor(Math.random() * 80) + 20,
          timestamp: 'Agora mesmo',
          details: `Sincronização em tempo real de ordens de compra, faturamento e centros de custo com ${systemName}.`
        };
        setErpLogs(prev => [newLog, ...prev]);
        addAuditLog(`SINCRONISMO ERP ${systemName}`, 'CUSTOS', `Atualização financeira de dados concluída via webhook.`);
        showToast(`Integração com ${systemName} concluída com sucesso!`, 'success');
        resolve();
      }, 1400);
    });
  };

  const addAuditLog = (action: string, category: AuditLogItem['category'], details: string) => {
    const randomHash = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newLog: AuditLogItem = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      user: currentUser ? currentUser.name : 'Sistema Automático',
      role: currentUser ? currentUser.roleLabel : 'System',
      action,
      category,
      ip: '189.40.112.58',
      device: 'Chrome 122 - Mac OS X (Canteiro Central)',
      hashSha256: `${randomHash}7f8a9e42109bc4b2`,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const sendMessage = (channelId: string, text: string) => {
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId,
      senderName: currentUser ? currentUser.name : 'Eng. Ricardo Souza',
      senderRole: currentUser ? currentUser.roleLabel : 'Engenheiro Residente',
      senderInitials: currentUser ? currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'RS',
      isSelf: true,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      text
    };
    setChatMessages(prev => [...prev, newMsg]);
    showToast('Mensagem enviada no canal da frente.', 'info');
  };

  const signRdo = () => {
    setIsRdoSigned(true);
    addAuditLog('ASSINATURA DIGITAL ICP-BRASIL', 'ASSINATURA', 'RDO nº 184 homologado e lacrado com hash SHA-256 e certificado A3.');
    showToast('RDO nº 184 assinado digitalmente com sucesso!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        activeProject,
        setActiveProject,
        projects,
        setProjects,
        isOffline,
        toggleOffline,
        pendingOfflineCount,
        syncOfflineData,
        isSyncing,
        activeTab,
        setActiveTab,
        isProjectDrawerOpen,
        setIsProjectDrawerOpen,
        isPdfModalOpen,
        setIsPdfModalOpen,
        pdfReportType,
        openPdfModal,
        toast,
        showToast,
        workers,
        addWorker,
        reallocateWorkers,
        fvsList,
        approveFvs,
        batchApproveFvs,
        rncList,
        addRnc,
        resolveRnc,
        costItems,
        erpLogs,
        triggerErpSync,
        auditLogs,
        addAuditLog,
        chatMessages,
        sendMessage,
        activeChatChannel,
        setActiveChatChannel,
        isRdoSigned,
        signRdo
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
