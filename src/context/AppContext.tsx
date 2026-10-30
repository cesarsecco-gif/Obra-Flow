import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  WbsPhase,
  BaselineSnapshot,
  LookaheadRestriction 
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
  INITIAL_MESSAGES 
} from '../mock/data';
import { StorageService } from '../services/storageService';

export type NavigationTab = 
  | 'dashboard-gerencial'
  | 'diario-de-obra-rdo'
  | 'pluviometria'
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
  
  // Modais de Campo e IA
  isQuickCaptureOpen: boolean;
  setIsQuickCaptureOpen: (open: boolean) => void;
  isEngineeringAiOpen: boolean;
  setIsEngineeringAiOpen: (open: boolean) => void;
  lastSavedText: string;

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
  
  // Evidências Fotográficas
  photoEvidences: PhotoEvidence[];
  addPhotoEvidence: (photo: Omit<PhotoEvidence, 'id'>) => void;
  updatePhotoEvidence: (id: string, updates: Partial<PhotoEvidence>) => void;
  deletePhotoEvidence: (id: string) => void;

  // Cronograma e Medição Física (EAP / WBS)
  wbsPhases: WbsPhase[];
  updateWbsPhase: (id: string, updates: Partial<WbsPhase>) => void;
  addWbsPhase: (phase: Omit<WbsPhase, 'id' | 'order'>) => void;
  deleteWbsPhase: (id: string) => void;
  updateProjectProgress: (newProgress: number, newPlanned?: number) => void;

  // Gestão de Linhas de Base (Baseline Snapshots)
  savedBaselines: BaselineSnapshot[];
  activeBaselineId: string;
  comparisonBaselineId: string;
  setComparisonBaselineId: (id: string) => void;
  createBaselineSnapshot: (versionName: string, justification: string, cutoffDate: string) => void;
  activateBaseline: (id: string) => void;
  deleteBaselineSnapshot: (id: string) => void;

  // Gestão de Restrições Lookahead (Lean Construction)
  restrictions: LookaheadRestriction[];
  addRestriction: (r: Omit<LookaheadRestriction, 'id'>) => void;
  updateRestrictionStatus: (id: string, status: LookaheadRestriction['status']) => void;
  deleteRestriction: (id: string) => void;

  // RDO Diário de Obra
  rdoNotes: string;
  setRdoNotes: (notes: string) => void;
  isRdoSigned: boolean;
  signRdo: () => void;
  resetAllData: () => void;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_RDO_NOTES = `1. DDS (Diálogo Diário de Segurança) realizado às 07:15 abordando Trabalho em Altura (NR-35) e uso de linha de vida para concretagem periférica.
2. Recebimento de 2 caminhões betoneira da Usina Polimix (NF 89234 e 89235), com ensaios de Slump Test registrados em 12±2cm (Aprovados).
3. Notificação expedida à Subempreiteira HidroVolt para ajuste na vedação acústica das prumadas do 4º pavimento até amanhã às 12h.`;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => StorageService.getUser());
  const [projects, setProjects] = useState<Project[]>(() => StorageService.getProjects());
  
  const [activeProject, setActiveProjectState] = useState<Project>(() => {
    const list = StorageService.getProjects();
    const activeId = StorageService.getActiveProjectId();
    return list.find(p => p.id === activeId) || list[0] || INITIAL_PROJECTS[0];
  });

  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard-gerencial');
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfReportType, setPdfReportType] = useState<'rdo' | 'custos' | 'fotos' | 'executivo'>('rdo');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | 'warning' } | null>(null);

  // Modais de Campo e IA
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState<boolean>(false);
  const [isEngineeringAiOpen, setIsEngineeringAiOpen] = useState<boolean>(false);
  const [lastSavedText, setLastSavedText] = useState<string>('Sincronizado');

  // Entities persistidas
  const [workers, setWorkers] = useState<WorkerEntry[]>(() => StorageService.getWorkers());
  const [photoEvidences, setPhotoEvidences] = useState<PhotoEvidence[]>(() => StorageService.getPhotoEvidences());
  const [fvsList, setFvsList] = useState<FvsItem[]>(() => StorageService.getFvsItems());
  const [rncList, setRncList] = useState<RncItem[]>(() => StorageService.getRncItems());
  const [costItems, setCostItems] = useState<CostLineItem[]>(() => StorageService.getCostItems());
  const [erpLogs, setErpLogs] = useState<ErpSyncLog[]>(ERP_SYNC_LOGS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => StorageService.getAuditLogs());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => StorageService.getChatMessages());
  const [activeChatChannel, setActiveChatChannel] = useState<string>('ch-01');
  const [isRdoSigned, setIsRdoSignedState] = useState<boolean>(() => StorageService.getRdoSigned());
  const [rdoNotes, setRdoNotesState] = useState<string>(() => StorageService.getRdoNotes(DEFAULT_RDO_NOTES));
  const [wbsPhases, setWbsPhases] = useState<WbsPhase[]>(() => StorageService.getWbsPhases(activeProject?.id));
  const [savedBaselines, setSavedBaselines] = useState<BaselineSnapshot[]>(() => StorageService.getBaselines(activeProject?.id));
  const [activeBaselineId, setActiveBaselineIdState] = useState<string>(() => StorageService.getActiveBaselineId(activeProject?.id));
  const [comparisonBaselineId, setComparisonBaselineIdState] = useState<string>(() => StorageService.getComparisonBaselineId(activeProject?.id));
  const [restrictions, setRestrictions] = useState<LookaheadRestriction[]>(() => StorageService.getRestrictions(activeProject?.id));

  // Ao trocar de obra, carrega as etapas da EAP e baselines daquela obra
  useEffect(() => {
    setWbsPhases(StorageService.getWbsPhases(activeProject.id));
    setSavedBaselines(StorageService.getBaselines(activeProject.id));
    setActiveBaselineIdState(StorageService.getActiveBaselineId(activeProject.id));
    setComparisonBaselineIdState(StorageService.getComparisonBaselineId(activeProject.id));
    setRestrictions(StorageService.getRestrictions(activeProject.id));
  }, [activeProject.id]);


  // Auto-save listeners
  useEffect(() => {
    StorageService.setUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    StorageService.setProjects(projects);
    setLastSavedText('Salvo localmente');
  }, [projects]);

  useEffect(() => {
    StorageService.setWorkers(workers);
    setLastSavedText('Salvo localmente');
  }, [workers]);

  useEffect(() => {
    StorageService.setPhotoEvidences(photoEvidences);
    setLastSavedText('Salvo localmente');
  }, [photoEvidences]);

  useEffect(() => {
    StorageService.setFvsItems(fvsList);
    setLastSavedText('Salvo localmente');
  }, [fvsList]);

  useEffect(() => {
    StorageService.setRncItems(rncList);
    setLastSavedText('Salvo localmente');
  }, [rncList]);

  useEffect(() => {
    StorageService.setCostItems(costItems);
    setLastSavedText('Salvo localmente');
  }, [costItems]);

  useEffect(() => {
    StorageService.setAuditLogs(auditLogs);
    setLastSavedText('Salvo localmente');
  }, [auditLogs]);

  useEffect(() => {
    StorageService.setChatMessages(chatMessages);
  }, [chatMessages]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3800);
  }, []);

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
    StorageService.setActiveProjectId(p.id);
    addAuditLog('TROCA DE CONTEXTO DE CANTEIRO', 'USUARIO', `Alternado contexto para ${p.name} (${p.code})`);
    showToast(`Contexto alterado para: ${p.name}`, 'info');
  };

  const toggleOffline = () => {
    if (!isOffline) {
      setIsOffline(true);
      setPendingOfflineCount(4);
      showToast('Modo Offline Ativado: Dados salvos localmente em IndexedDB/Storage.', 'warning');
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
      showToast('Sincronização 100% concluída! Dados auditados e gravados.', 'success');
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
    addAuditLog('CADASTRO DE EFETIVO', 'RDO', `Operário ${w.name} adicionado à frente ${w.front}`);
    showToast(`Colaborador ${w.name} cadastrado com sucesso!`, 'success');
  };

  const reallocateWorkers = (fromFront: string, toFront: string, count: number, reason: string) => {
    addAuditLog('REMANEJAMENTO DE MÃO DE OBRA', 'RDO', `Transferidos ${count} operários de "${fromFront}" para "${toFront}". Motivo: ${reason}`);
    showToast(`Remanejamento efetuado: +${count} operários em ${toFront}`, 'info');
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

  // Evidências Fotográficas
  const addPhotoEvidence = (photo: Omit<PhotoEvidence, 'id'>) => {
    const newPhoto: PhotoEvidence = {
      ...photo,
      id: `photo-${Date.now()}`
    };
    setPhotoEvidences(prev => [newPhoto, ...prev]);
    addAuditLog('NOVA EVIDÊNCIA FOTOGRÁFICA', 'RDO', `Foto cadastrada: "${photo.title}" na frente ${photo.location}`);
    showToast('Evidência fotográfica adicionada e salva com sucesso!', 'success');
  };

  const updatePhotoEvidence = (id: string, updates: Partial<PhotoEvidence>) => {
    setPhotoEvidences(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    showToast('Evidência atualizada!', 'info');
  };

  const deletePhotoEvidence = (id: string) => {
    setPhotoEvidences(prev => prev.filter(p => p.id !== id));
    showToast('Evidência removida.', 'info');
  };

  // RDO
  const setRdoNotes = (notes: string) => {
    setRdoNotesState(notes);
    StorageService.setRdoNotes(notes);
  };

  const signRdo = () => {
    setIsRdoSignedState(true);
    StorageService.setRdoSigned(true);
    addAuditLog('ASSINATURA DIGITAL ICP-BRASIL', 'ASSINATURA', 'RDO nº 184 homologado e lacrado com hash SHA-256 e certificado A3.');
    showToast('RDO nº 184 assinado digitalmente com sucesso!', 'success');
  };

  // Cronograma e Medição Física (EAP / WBS)
  const updateWbsPhase = (id: string, updates: Partial<WbsPhase>) => {
    setWbsPhases(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      StorageService.setWbsPhases(updated, activeProject.id);
      
      // Cálculo ponderado do avanço global da obra
      const totalWeight = updated.reduce((sum, p) => sum + p.weightPercent, 0) || 100;
      const calculatedProgress = Number(
        (updated.reduce((sum, p) => sum + (p.progressPercent * p.weightPercent), 0) / totalWeight).toFixed(1)
      );

      setActiveProjectState(curr => {
        const next = { ...curr, progressPercent: calculatedProgress };
        setProjects(all => all.map(pr => pr.id === curr.id ? next : pr));
        return next;
      });

      const target = updated.find(p => p.id === id);
      addAuditLog(
        'MEDIÇÃO DE AVANÇO FÍSICO',
        'RDO',
        `Etapa "${target?.name}" recalculada para ${updates.progressPercent ?? target?.progressPercent}%. Novo avanço global: ${calculatedProgress}%.`
      );
      showToast(`Etapa atualizada! Novo avanço da obra: ${calculatedProgress}%`, 'success');
      return updated;
    });
  };

  const addWbsPhase = (phase: Omit<WbsPhase, 'id' | 'order'>) => {
    setWbsPhases(prev => {
      const nextOrder = prev.length + 1;
      const newPhase: WbsPhase = {
        ...phase,
        id: `phase-${Date.now()}`,
        order: nextOrder
      };
      const updated = [...prev, newPhase];
      StorageService.setWbsPhases(updated, activeProject.id);

      const totalWeight = updated.reduce((sum, p) => sum + p.weightPercent, 0) || 100;
      const calculatedProgress = Number(
        (updated.reduce((sum, p) => sum + (p.progressPercent * p.weightPercent), 0) / totalWeight).toFixed(1)
      );

      setActiveProjectState(curr => {
        const next = { ...curr, progressPercent: calculatedProgress };
        setProjects(all => all.map(pr => pr.id === curr.id ? next : pr));
        return next;
      });

      addAuditLog(
        'NOVA ETAPA ADICIONADA À EAP',
        'RDO',
        `Atividade "${newPhase.name}" criada na EAP com peso ${newPhase.weightPercent}% e período ${newPhase.period}.`
      );
      showToast(`Nova atividade "${newPhase.name}" adicionada com sucesso!`, 'success');
      return updated;
    });
  };

  const deleteWbsPhase = (id: string) => {
    setWbsPhases(prev => {
      const target = prev.find(p => p.id === id);
      const updated = prev.filter(p => p.id !== id).map((p, idx) => ({ ...p, order: idx + 1 }));
      StorageService.setWbsPhases(updated, activeProject.id);

      const totalWeight = updated.reduce((sum, p) => sum + p.weightPercent, 0) || 100;
      const calculatedProgress = Number(
        (updated.reduce((sum, p) => sum + (p.progressPercent * p.weightPercent), 0) / totalWeight).toFixed(1)
      );

      setActiveProjectState(curr => {
        const next = { ...curr, progressPercent: calculatedProgress };
        setProjects(all => all.map(pr => pr.id === curr.id ? next : pr));
        return next;
      });

      addAuditLog(
        'ETAPA REMOVIDA DA EAP',
        'RDO',
        `Atividade "${target?.name || id}" excluída da EAP/Cronograma.`
      );
      showToast(`Atividade removida da EAP.`, 'info');
      return updated;
    });
  };

  const setComparisonBaselineId = (id: string) => {
    setComparisonBaselineIdState(id);
    StorageService.setComparisonBaselineId(id, activeProject.id);
    const target = savedBaselines.find(b => b.id === id);
    showToast(`Comparando Gantt com ${target?.versionName || 'Baseline'} (${target?.name || ''})`, 'info');
  };

  const createBaselineSnapshot = (versionName: string, justification: string, cutoffDate: string) => {
    const totalWeight = wbsPhases.reduce((acc, p) => acc + p.weightPercent, 0);
    const newSnapshot: BaselineSnapshot = {
      id: `base-${Date.now()}`,
      projectId: activeProject.id,
      versionName: versionName.trim(),
      name: `Replanejamento ${versionName.trim()}`,
      createdAt: new Date().toISOString(),
      createdFormatted: new Date().toLocaleDateString('pt-BR'),
      author: currentUser ? currentUser.name : activeProject.engineer,
      justification: justification.trim(),
      cutoffDate,
      isActive: true,
      phasesCount: wbsPhases.length,
      totalWeight,
      phases: wbsPhases.map(p => ({
        phaseId: p.id,
        order: p.order,
        name: p.name,
        period: p.period,
        baselineStart: p.baselineStart,
        baselineEnd: p.baselineEnd,
        weightPercent: p.weightPercent
      }))
    };

    setSavedBaselines(prev => {
      const updated = prev.map(b => ({ ...b, isActive: false }));
      const nextList = [newSnapshot, ...updated];
      StorageService.setBaselines(nextList, activeProject.id);
      StorageService.setActiveBaselineId(newSnapshot.id, activeProject.id);
      StorageService.setComparisonBaselineId(newSnapshot.id, activeProject.id);
      setActiveBaselineIdState(newSnapshot.id);
      setComparisonBaselineIdState(newSnapshot.id);
      return nextList;
    });

    addAuditLog(
      'CONGELAMENTO DE LINHA DE BASE',
      'RDO',
      `Nova revisão de Linha de Base (${versionName}) congelada com ${wbsPhases.length} etapas. Justificativa: ${justification}`
    );
    showToast(`Linha de Base ${versionName} congelada e salva com sucesso!`, 'success');
  };

  const activateBaseline = (id: string) => {
    setSavedBaselines(prev => {
      const updated = prev.map(b => ({ ...b, isActive: b.id === id }));
      StorageService.setBaselines(updated, activeProject.id);
      StorageService.setActiveBaselineId(id, activeProject.id);
      setActiveBaselineIdState(id);
      const target = updated.find(b => b.id === id);
      addAuditLog(
        'TROCA DE LINHA DE BASE ATIVA',
        'RDO',
        `Linha de Base ativa alterada para ${target?.versionName} (${target?.name}).`
      );
      showToast(`Linha de Base ${target?.versionName} ativada como vigente!`, 'success');
      return updated;
    });
  };

  const deleteBaselineSnapshot = (id: string) => {
    setSavedBaselines(prev => {
      const target = prev.find(b => b.id === id);
      if (target?.versionName === 'v1.0' || target?.versionName === 'v1.2') {
        showToast('Linhas de base contratuais homologadas não podem ser excluídas.', 'warning');
        return prev;
      }
      const updated = prev.filter(b => b.id !== id);
      StorageService.setBaselines(updated, activeProject.id);
      showToast('Revisão de linha de base excluída.', 'info');
      return updated;
    });
  };

  const addRestriction = (r: Omit<LookaheadRestriction, 'id'>) => {
    const newRest: LookaheadRestriction = {
      ...r,
      id: `rest-${Date.now()}`
    };
    setRestrictions(prev => {
      const updated = [newRest, ...prev];
      StorageService.setRestrictions(updated, activeProject.id);
      return updated;
    });
    addAuditLog('RESTRIÇÃO LEAN ADICIONADA', 'RDO', `Nova restrição cadastrada para ${r.phaseName}: ${r.description}`);
    showToast('Restrição adicionada ao Lookahead!', 'success');
  };

  const updateRestrictionStatus = (id: string, status: LookaheadRestriction['status']) => {
    setRestrictions(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, status } : item);
      StorageService.setRestrictions(updated, activeProject.id);
      return updated;
    });
    showToast(`Status da restrição atualizado para ${status === 'liberado' ? 'Liberado' : status === 'em_tratativa' ? 'Em Tratativa' : 'Pendente'}`, 'info');
  };

  const deleteRestriction = (id: string) => {
    setRestrictions(prev => {
      const updated = prev.filter(item => item.id !== id);
      StorageService.setRestrictions(updated, activeProject.id);
      return updated;
    });
    showToast('Restrição removida do Lookahead.', 'info');
  };

  const updateProjectProgress = (newProgress: number, newPlanned?: number) => {

    setActiveProjectState(curr => {
      const next = { 
        ...curr, 
        progressPercent: newProgress,
        ...(newPlanned !== undefined ? { plannedPercent: newPlanned } : {})
      };
      setProjects(all => all.map(pr => pr.id === curr.id ? next : pr));
      return next;
    });
    addAuditLog('MEDIÇÃO GERAL DA OBRA ATUALIZADA', 'RDO', `Avanço físico geral ajustado para ${newProgress}%`);
    showToast(`Avanço físico da obra ajustado para ${newProgress}%!`, 'success');
  };

  const resetAllData = () => {
    StorageService.resetToFactoryDefaults();
    setProjects(INITIAL_PROJECTS);
    setWorkers(WORKERS_LIST);
    setPhotoEvidences(PHOTO_EVIDENCES);
    setFvsList(FVS_ITEMS);
    setRncList(RNC_ITEMS);
    setCostItems(COST_LINE_ITEMS);
    setAuditLogs(AUDIT_LOGS);
    setChatMessages(INITIAL_MESSAGES);
    setIsRdoSignedState(false);
    setRdoNotesState(DEFAULT_RDO_NOTES);
    showToast('Dados restaurados para o padrão de fábrica.', 'warning');
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
        isQuickCaptureOpen,
        setIsQuickCaptureOpen,
        isEngineeringAiOpen,
        setIsEngineeringAiOpen,
        lastSavedText,
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
        photoEvidences,
        addPhotoEvidence,
        updatePhotoEvidence,
        deletePhotoEvidence,
        rdoNotes,
        setRdoNotes,
        isRdoSigned,
        signRdo,
        wbsPhases,
        updateWbsPhase,
        addWbsPhase,
        deleteWbsPhase,
        savedBaselines,
        activeBaselineId,
        comparisonBaselineId,
        setComparisonBaselineId,
        createBaselineSnapshot,
        activateBaseline,
        deleteBaselineSnapshot,
        restrictions,
        addRestriction,
        updateRestrictionStatus,
        deleteRestriction,
        updateProjectProgress,
        resetAllData
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
