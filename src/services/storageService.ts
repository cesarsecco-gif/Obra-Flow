import { 
  Project, 
  UserProfile, 
  WorkerEntry, 
  PhotoEvidence, 
  FvsItem, 
  RncItem, 
  CostLineItem, 
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
  AUDIT_LOGS, 
  INITIAL_MESSAGES,
  DEFAULT_WBS_PHASES,
  DEFAULT_BASELINES,
  DEFAULT_LOOKAHEAD_RESTRICTIONS 
} from '../mock/data';


const STORAGE_KEYS = {
  USER: 'obrasync_v1_user',
  PROJECTS: 'obrasync_v1_projects',
  ACTIVE_PROJECT_ID: 'obrasync_v1_active_project_id',
  WORKERS: 'obrasync_v1_workers',
  PHOTO_EVIDENCES: 'obrasync_v1_photo_evidences',
  FVS_ITEMS: 'obrasync_v1_fvs_items',
  RNC_ITEMS: 'obrasync_v1_rnc_items',
  COSTS: 'obrasync_v1_costs',
  AUDIT_LOGS: 'obrasync_v1_audit_logs',
  CHAT_MESSAGES: 'obrasync_v1_chat_messages',
  RDO_NOTES: 'obrasync_v1_rdo_notes',
  RDO_SIGNED: 'obrasync_v1_rdo_signed',
  WBS_PHASES: 'obrasync_v1_wbs_phases',
  BASELINES: 'obrasync_v1_baselines',
  ACTIVE_BASELINE_ID: 'obrasync_v1_active_baseline_id',
  COMPARISON_BASELINE_ID: 'obrasync_v1_comparison_baseline_id',
  LOOKAHEAD_RESTRICTIONS: 'obrasync_v1_lookahead_restrictions',
  LAST_SAVED: 'obrasync_v1_last_saved',
} as const;


function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[StorageService] Erro ao ler chave ${key}:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
  } catch (err) {
    console.error(`[StorageService] Erro ao gravar chave ${key}:`, err);
  }
}

export const StorageService = {
  // Usuário
  getUser(): UserProfile {
    return safeGet<UserProfile>(STORAGE_KEYS.USER, DEMO_USERS[0]);
  },
  setUser(user: UserProfile | null): void {
    if (user) safeSet(STORAGE_KEYS.USER, user);
    else localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Projetos
  getProjects(): Project[] {
    return safeGet<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  },
  setProjects(projects: Project[]): void {
    safeSet(STORAGE_KEYS.PROJECTS, projects);
  },
  getActiveProjectId(): string {
    return safeGet<string>(STORAGE_KEYS.ACTIVE_PROJECT_ID, INITIAL_PROJECTS[0].id);
  },
  setActiveProjectId(id: string): void {
    safeSet(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
  },

  // Efetivo de Funcionários
  getWorkers(): WorkerEntry[] {
    return safeGet<WorkerEntry[]>(STORAGE_KEYS.WORKERS, WORKERS_LIST);
  },
  setWorkers(workers: WorkerEntry[]): void {
    safeSet(STORAGE_KEYS.WORKERS, workers);
  },

  // Evidências Fotográficas
  getPhotoEvidences(): PhotoEvidence[] {
    return safeGet<PhotoEvidence[]>(STORAGE_KEYS.PHOTO_EVIDENCES, PHOTO_EVIDENCES);
  },
  setPhotoEvidences(photos: PhotoEvidence[]): void {
    safeSet(STORAGE_KEYS.PHOTO_EVIDENCES, photos);
  },

  // FVS (Fichas de Verificação de Serviço)
  getFvsItems(): FvsItem[] {
    return safeGet<FvsItem[]>(STORAGE_KEYS.FVS_ITEMS, FVS_ITEMS);
  },
  setFvsItems(items: FvsItem[]): void {
    safeSet(STORAGE_KEYS.FVS_ITEMS, items);
  },

  // RNC (Não Conformidades)
  getRncItems(): RncItem[] {
    return safeGet<RncItem[]>(STORAGE_KEYS.RNC_ITEMS, RNC_ITEMS);
  },
  setRncItems(items: RncItem[]): void {
    safeSet(STORAGE_KEYS.RNC_ITEMS, items);
  },

  // Custos e Indicadores
  getCostItems(): CostLineItem[] {
    return safeGet<CostLineItem[]>(STORAGE_KEYS.COSTS, COST_LINE_ITEMS);
  },
  setCostItems(items: CostLineItem[]): void {
    safeSet(STORAGE_KEYS.COSTS, items);
  },

  // Logs de Auditoria
  getAuditLogs(): AuditLogItem[] {
    return safeGet<AuditLogItem[]>(STORAGE_KEYS.AUDIT_LOGS, AUDIT_LOGS);
  },
  setAuditLogs(logs: AuditLogItem[]): void {
    safeSet(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // Mensagens de Campo
  getChatMessages(): ChatMessage[] {
    return safeGet<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, INITIAL_MESSAGES);
  },
  setChatMessages(messages: ChatMessage[]): void {
    safeSet(STORAGE_KEYS.CHAT_MESSAGES, messages);
  },

  // RDO Diário de Obra
  getRdoNotes(fallback: string): string {
    return safeGet<string>(STORAGE_KEYS.RDO_NOTES, fallback);
  },
  setRdoNotes(notes: string): void {
    safeSet(STORAGE_KEYS.RDO_NOTES, notes);
  },
  getRdoSigned(): boolean {
    return safeGet<boolean>(STORAGE_KEYS.RDO_SIGNED, false);
  },
  setRdoSigned(signed: boolean): void {
    safeSet(STORAGE_KEYS.RDO_SIGNED, signed);
  },
  // Etapas da EAP / Cronograma Gantt
  getWbsPhases(projectId?: string): WbsPhase[] {
    const key = projectId ? `${STORAGE_KEYS.WBS_PHASES}_${projectId}` : STORAGE_KEYS.WBS_PHASES;
    return safeGet<WbsPhase[]>(key, DEFAULT_WBS_PHASES);
  },
  setWbsPhases(phases: WbsPhase[], projectId?: string): void {
    const key = projectId ? `${STORAGE_KEYS.WBS_PHASES}_${projectId}` : STORAGE_KEYS.WBS_PHASES;
    safeSet(key, phases);
  },

  // Linhas de Base Salvas (Snapshots de Baseline)
  getBaselines(projectId?: string): BaselineSnapshot[] {
    const key = projectId ? `${STORAGE_KEYS.BASELINES}_${projectId}` : STORAGE_KEYS.BASELINES;
    return safeGet<BaselineSnapshot[]>(key, DEFAULT_BASELINES);
  },
  setBaselines(baselines: BaselineSnapshot[], projectId?: string): void {
    const key = projectId ? `${STORAGE_KEYS.BASELINES}_${projectId}` : STORAGE_KEYS.BASELINES;
    safeSet(key, baselines);
  },
  getActiveBaselineId(projectId?: string): string {
    const key = projectId ? `${STORAGE_KEYS.ACTIVE_BASELINE_ID}_${projectId}` : STORAGE_KEYS.ACTIVE_BASELINE_ID;
    return safeGet<string>(key, 'base-v1.2');
  },
  setActiveBaselineId(id: string, projectId?: string): void {
    const key = projectId ? `${STORAGE_KEYS.ACTIVE_BASELINE_ID}_${projectId}` : STORAGE_KEYS.ACTIVE_BASELINE_ID;
    safeSet(key, id);
  },
  getComparisonBaselineId(projectId?: string): string {
    const key = projectId ? `${STORAGE_KEYS.COMPARISON_BASELINE_ID}_${projectId}` : STORAGE_KEYS.COMPARISON_BASELINE_ID;
    return safeGet<string>(key, 'base-v1.2');
  },
  setComparisonBaselineId(id: string, projectId?: string): void {
    const key = projectId ? `${STORAGE_KEYS.COMPARISON_BASELINE_ID}_${projectId}` : STORAGE_KEYS.COMPARISON_BASELINE_ID;
    safeSet(key, id);
  },

  // Restrições de Médio Prazo (Lookahead Planning / Lean)
  getRestrictions(projectId?: string): LookaheadRestriction[] {
    const key = projectId ? `${STORAGE_KEYS.LOOKAHEAD_RESTRICTIONS}_${projectId}` : STORAGE_KEYS.LOOKAHEAD_RESTRICTIONS;
    return safeGet<LookaheadRestriction[]>(key, DEFAULT_LOOKAHEAD_RESTRICTIONS);
  },
  setRestrictions(restrictions: LookaheadRestriction[], projectId?: string): void {
    const key = projectId ? `${STORAGE_KEYS.LOOKAHEAD_RESTRICTIONS}_${projectId}` : STORAGE_KEYS.LOOKAHEAD_RESTRICTIONS;
    safeSet(key, restrictions);
  },

  // Metadados

  getLastSaved(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
  },

  // Limpeza e Restauração para Mocks de Fábrica
  resetToFactoryDefaults(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};
