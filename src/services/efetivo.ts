// Apontamento diário de efetivo e de equipamentos, por obra.
// Guardado no localStorage do aparelho (mesmo padrão do restante do app).

import { WorkerEntry } from '../types';

export type StatusPresenca = 'presente' | 'falta_justificada' | 'falta_injustificada' | 'folga';

export interface ApontamentoEfetivo {
  status: StatusPresenca;
  entrada: string; // HH:mm
  horasNormais: number;
  horasExtras: number;
  frente: string;
  origem: 'manual' | 'catraca';
  obs?: string;
}

export interface FechamentoBoletim {
  por: string;
  em: string; // ISO
}

/** data (YYYY-MM-DD) -> workerId -> apontamento */
export type ApontamentosPorDia = Record<string, Record<string, ApontamentoEfetivo>>;

export type StatusEquipamento = 'ativo' | 'manutencao' | 'desmobilizado';

export interface Equipamento {
  id: string;
  prefixo: string;
  tipo: string;
  modelo: string;
  propriedade: 'proprio' | 'locado';
  locador?: string;
  status: StatusEquipamento;
  horimetroInicial: number;
}

export interface ApontamentoEquipamento {
  horasOperando: number;
  horasParadas: number;
  motivoParada?: string;
  frente?: string;
  horimetroFinal?: number;
}

/** data -> equipamentoId -> apontamento */
export type ApontamentosEquipPorDia = Record<string, Record<string, ApontamentoEquipamento>>;

export const STATUS_PRESENCA_LABEL: Record<StatusPresenca, string> = {
  presente: 'Presente',
  falta_justificada: 'Falta justificada',
  falta_injustificada: 'Falta injustificada',
  folga: 'Folga / férias',
};

export const STATUS_EQUIP_LABEL: Record<StatusEquipamento, string> = {
  ativo: 'Ativo',
  manutencao: 'Em manutenção',
  desmobilizado: 'Desmobilizado',
};

export const JORNADA_PADRAO_H = 8;

const KEYS = {
  apontamentos: 'obrasync_v1_attendance',
  fechamentos: 'obrasync_v1_attendance_closed',
  equipamentos: 'obrasync_v1_equipment',
  apontEquip: 'obrasync_v1_equipment_log',
};

function ler<T>(key: string, padrao: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : padrao;
  } catch {
    return padrao;
  }
}

function gravar<T>(key: string, valor: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(valor));
    localStorage.setItem('obrasync_v1_last_saved', new Date().toISOString());
    return true;
  } catch (err) {
    console.error(`[Efetivo] Erro ao gravar ${key}:`, err);
    return false;
  }
}

const k = (base: string, projectId: string) => `${base}_${projectId}`;

export const EfetivoStorage = {
  getApontamentos(projectId: string): ApontamentosPorDia | null {
    return ler<ApontamentosPorDia | null>(k(KEYS.apontamentos, projectId), null);
  },
  setApontamentos(projectId: string, dados: ApontamentosPorDia): boolean {
    return gravar(k(KEYS.apontamentos, projectId), dados);
  },
  getFechamentos(projectId: string): Record<string, FechamentoBoletim> {
    return ler(k(KEYS.fechamentos, projectId), {});
  },
  setFechamentos(projectId: string, dados: Record<string, FechamentoBoletim>): boolean {
    return gravar(k(KEYS.fechamentos, projectId), dados);
  },
  getEquipamentos(projectId: string): Equipamento[] | null {
    return ler<Equipamento[] | null>(k(KEYS.equipamentos, projectId), null);
  },
  setEquipamentos(projectId: string, dados: Equipamento[]): boolean {
    return gravar(k(KEYS.equipamentos, projectId), dados);
  },
  getApontEquip(projectId: string): ApontamentosEquipPorDia {
    return ler(k(KEYS.apontEquip, projectId), {});
  },
  setApontEquip(projectId: string, dados: ApontamentosEquipPorDia): boolean {
    return gravar(k(KEYS.apontEquip, projectId), dados);
  },
};

/** Colaboradores ativos que pertencem à obra (ou a todas). */
export function colaboradoresDaObra(workers: WorkerEntry[], projectId: string): WorkerEntry[] {
  return workers.filter(w => w.ativo !== false && (!w.projectId || w.projectId === projectId));
}

/** Apontamento inicial a partir do cadastro (usado para semear o primeiro dia). */
export function apontamentoDoCadastro(w: WorkerEntry): ApontamentoEfetivo {
  return {
    status: w.status,
    entrada: w.status === 'presente' ? w.entryTime : '',
    horasNormais: w.status === 'presente' ? Math.min(w.workHours, JORNADA_PADRAO_H) : 0,
    horasExtras: w.status === 'presente' ? w.extraHours : 0,
    frente: w.front,
    origem: w.catracaPoint.toLowerCase().includes('manual') ? 'manual' : 'catraca',
  };
}

export function apontamentoPresente(w: WorkerEntry): ApontamentoEfetivo {
  return { status: 'presente', entrada: '07:00', horasNormais: JORNADA_PADRAO_H, horasExtras: 0, frente: w.front, origem: 'manual' };
}

/** "07:12" e "17:30" -> horas trabalhadas descontando 1h de almoço quando passar de 6h. */
export function horasEntre(entrada: string, saida: string): number {
  const [h1, m1] = entrada.split(':').map(Number);
  const [h2, m2] = saida.split(':').map(Number);
  if ([h1, m1, h2, m2].some(n => Number.isNaN(n))) return 0;
  let min = h2 * 60 + m2 - (h1 * 60 + m1);
  if (min <= 0) return 0;
  if (min > 6 * 60) min -= 60;
  return Math.round((min / 60) * 10) / 10;
}

export interface LinhaCatraca {
  matricula: string;
  entrada: string;
  saida?: string;
}

/**
 * Lê CSV exportado da catraca: matrícula;entrada;saída (separador ; ou ,).
 * Ignora cabeçalho e linhas inválidas.
 */
export function lerCsvCatraca(texto: string): LinhaCatraca[] {
  return texto
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => l.split(/[;,\t]/).map(c => c.trim().replace(/^"|"$/g, '')))
    .filter(c => c.length >= 2 && /^\d{1,2}:\d{2}/.test(c[1]))
    .map(c => ({ matricula: c[0], entrada: c[1].slice(0, 5), saida: c[2] && /^\d{1,2}:\d{2}/.test(c[2]) ? c[2].slice(0, 5) : undefined }));
}

export const EQUIPAMENTOS_EXEMPLO: Equipamento[] = [
  { id: 'eq-01', prefixo: 'GRU-01', tipo: 'Grua Torre', modelo: 'Liebherr 132 EC-H8', propriedade: 'locado', locador: 'Locaguindaste', status: 'ativo', horimetroInicial: 1482.4 },
  { id: 'eq-02', prefixo: 'BET-02', tipo: 'Betoneira 400L', modelo: 'CSM 400L elétrica', propriedade: 'proprio', status: 'ativo', horimetroInicial: 0 },
  { id: 'eq-03', prefixo: 'MCR-01', tipo: 'Mini Carregadeira', modelo: 'Bobcat S650', propriedade: 'proprio', status: 'ativo', horimetroInicial: 842.1 },
  { id: 'eq-04', prefixo: 'ESC-02', tipo: 'Escavadeira Hidráulica', modelo: 'CAT 320', propriedade: 'locado', locador: 'Sotreq Rental', status: 'manutencao', horimetroInicial: 6210 },
  { id: 'eq-05', prefixo: 'CB-07', tipo: 'Caminhão Basculante', modelo: 'VW Constellation 26.280', propriedade: 'proprio', status: 'ativo', horimetroInicial: 0 },
];

export const APONT_EQUIP_EXEMPLO: Record<string, ApontamentoEquipamento> = {
  'eq-01': { horasOperando: 6, horasParadas: 2, motivoParada: 'Ventos acima de 42 km/h', frente: 'Torre A — 14º Pav.', horimetroFinal: 1488.4 },
  'eq-02': { horasOperando: 8, horasParadas: 0, frente: 'Central de argamassa' },
  'eq-03': { horasOperando: 7, horasParadas: 1, motivoParada: 'Manutenção preventiva', frente: 'Talude perimetral', horimetroFinal: 849.1 },
  'eq-05': { horasOperando: 5, horasParadas: 3, motivoParada: 'Chuva — acesso impraticável', frente: 'Bota-fora' },
};
