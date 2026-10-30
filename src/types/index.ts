export type UserRole = 
  | 'admin' 
  | 'engenheiro_residente' 
  | 'fiscal_auditor' 
  | 'mestre_obras' 
  | 'auditor_externo';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatar: string;
  crea?: string;
  artPrincipal?: string;
  phone: string;
  company: string;
  unit: string;
  twoFactorEnabled: boolean;
  tokenIcp: string;
  icpExpiry: string;
  activeProjects: string[]; // project IDs
  status: 'active' | 'suspended' | 'pending';
  lastAccess: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  engineer: string;
  crea: string;
  status: 'active' | 'planning' | 'completed';
  statusLabel: string;
  progressPercent: number;
  plannedPercent: number;
  activeWorkers: number;
  openRdoCount: number;
  rdoNumber: string;
  pluviometryMm: number;
  criticalIssuesCount: number;
  contractValue: number;
  realizedCost: number;
  budgetCost: number;
  deliveryDate: string;
  hasCamera: boolean;
  isFavorite?: boolean;
  isOfflineCached?: boolean;
}

export interface WorkerEntry {
  id: string;
  name: string;
  role: string;
  contractType: 'clt' | 'sub';
  company: string;
  status: 'presente' | 'falta_justificada' | 'falta_injustificada';
  entryTime: string;
  front: string;
  workHours: number;
  extraHours: number;
  sstCompliance: string[];
  catracaPoint: string;
  matricula: string;
  avatarInitials: string;
  projectId?: string; // sem projectId: colaborador disponível em todas as obras
  ativo?: boolean; // false = desligado/desmobilizado
}

export interface PhotoEvidence {
  id: string;
  title: string;
  description: string;
  discipline: string;
  status: 'conforme' | 'rnc' | 'em_andamento' | 'antes_depois';
  statusLabel: string;
  rdoNumber: string;
  author: string;
  timestamp: string;
  date: string;
  location: string;
  coords: string;
  altitude: string;
  imageUrl: string;
  comparativePairId?: string;
  beforeImageUrl?: string;
  tags: string[];
}

export interface FvsItem {
  id: string;
  code: string;
  title: string;
  description: string;
  front: string;
  responsible: string;
  contractor: string;
  standardTolerance: string;
  status: 'pendente' | 'aprovado' | 'aprovado_ressalva' | 'reprovado_rnc';
  evidenceCount: number;
  evidenceThumbnail?: string;
  photos: string[];
  discipline: 'estrutural' | 'alvenaria' | 'impermeabilizacao' | 'hidraulica' | 'eletrica' | 'revestimento';
  date: string;
}

export interface RncItem {
  id: string;
  code: string;
  fvsOrigin: string;
  front: string;
  severity: 'critica' | 'media' | 'leve';
  severityLabel: string;
  status: 'aberta' | 'em_retrabalho' | 'pronto_reinspecao' | 'encerrada';
  description: string;
  rootCause: string;
  actionPlan: string;
  contractor: string;
  inspector: string;
  deadline: string;
  blocksWork: boolean;
  photos: string[];
  technicalBase: string;
}

export interface CostLineItem {
  id: string;
  code: string;
  category: string;
  description: string;
  budgetAmount: number;
  committedAmount: number;
  realizedAmount: number;
  projectedAmount: number;
  deviationPercent: number;
  status: 'no_orcamento' | 'atencao' | 'estouro';
  costCenter: string;
  erpRef: string;
  lastUpdated: string;
}

export interface ErpSyncLog {
  id: string;
  system: 'SAP' | 'TOTVS' | 'Sienge' | 'Mega' | 'ContaAzul';
  endpoint: string;
  status: 'success' | 'syncing' | 'failed';
  recordsTransferred: number;
  timestamp: string;
  details: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  category: 'RDO' | 'CUSTOS' | 'RNC' | 'FVS' | 'USUARIO' | 'ASSINATURA';
  ip: string;
  device: string;
  hashSha256: string;
  details: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderRole: string;
  senderInitials: string;
  isSelf: boolean;
  isBot?: boolean;
  timestamp: string;
  text?: string;
  audio?: {
    duration: string;
    transcript: string;
  };
  attachment?: {
    type: 'pdf' | 'image' | 'dwg';
    name: string;
    size: string;
    url?: string;
    isIcpSigned?: boolean;
  };
  photoEvidence?: {
    id: string;
    title: string;
    gps: string;
    cota: string;
    imageUrl: string;
  };
}

export interface ChatChannel {
  id: string;
  name: string;
  category: string;
  frontName: string;
  lastMessageTime: string;
  lastMessageText: string;
  unreadCount: number;
  hasRncAlert?: boolean;
  badge?: string;
}

export interface WbsPhase {
  id: string;
  order: number;
  name: string;
  period: string;
  progressPercent: number;
  weightPercent: number;
  status: 'concluido' | 'em_andamento' | 'atrasado' | 'nao_iniciado';
  milestoneCode?: string;
  isCritical: boolean;
  delayDays?: number;
  contractor?: string;
  notes?: string;
  baselineStart?: string; // YYYY-MM-DD
  baselineEnd?: string;   // YYYY-MM-DD
  actualStart?: string;
  actualEnd?: string;
  dependencies?: string[]; // IDs das fases predecessoras
}

export interface LookaheadRestriction {
  id: string;
  phaseId: string;
  phaseName: string;
  category: 'projetos' | 'suprimentos' | 'mao_de_obra' | 'equipamentos' | 'liberacao';
  categoryLabel: string;
  description: string;
  responsible: string;
  dueDate: string;
  status: 'pendente' | 'em_tratativa' | 'liberado';
  weekLabel: string; // ex: 'Semana 44 (28/Out - 01/Nov)'
  notes?: string;
}

export interface BaselineSnapshot {
  id: string;
  projectId: string;
  versionName: string; // ex: 'v1.2'
  name: string;        // ex: 'Linha de Base Contratual Homologada'
  createdAt: string;
  createdFormatted: string; // ex: '15/Mai/2024'
  author: string;
  justification: string;
  cutoffDate: string;  // ex: '2024-10-24'
  isActive: boolean;
  phasesCount: number;
  totalWeight: number;
  phases: {
    phaseId: string;
    order: number;
    name: string;
    period: string;
    baselineStart?: string;
    baselineEnd?: string;
    weightPercent: number;
  }[];
}



