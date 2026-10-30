// Domínio de Pluviometria: tipos, parâmetros de classificação e agregações usadas
// pela tela de Pluviometria e pelo card do Dashboard.

export type Intensidade = 'fraca' | 'moderada' | 'forte' | 'muito_forte';
export type CondicaoSolo = 'tratavel' | 'saturado' | 'impraticavel';

export interface RegistroChuva {
  id: string;
  data: string; // YYYY-MM-DD
  inicio: string; // HH:mm
  fim: string; // HH:mm
  mm: number;
  pluviometro: string;
  frentes: string[];
  solo: CondicaoSolo;
  horasParadas: number;
  paralisacaoTotal: boolean;
  rdo?: string;
  obs?: string;
  fotoDataUrl?: string;
  criadoEm: string;
}

// Parâmetros provisórios: ajustar aos critérios do contrato.
export const LIMITE_PRATICABILIDADE_MM = 10;
export const FAIXAS_INTENSIDADE_MM = { fraca: 5, moderada: 15, forte: 30 };

export const PLUVIOMETROS = ['PLV-01 Canteiro Central', 'PLV-02 Frente Km 12+400'];
export const FRENTES = ['Terraplenagem', 'Drenagem', 'Pavimentação', 'Obras de Arte', 'Sinalização'];

// Normal climatológica mensal (mm), índice 0 = janeiro. Valores de referência provisórios.
export const NORMAL_CLIMATOLOGICA_MM = [190, 165, 130, 90, 100, 95, 90, 75, 120, 140, 130, 160];

export const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export const MESES_NOME = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const INTENSIDADE_LABEL: Record<Intensidade, string> = {
  fraca: `Fraca (≤ ${FAIXAS_INTENSIDADE_MM.fraca} mm)`,
  moderada: `Moderada (${FAIXAS_INTENSIDADE_MM.fraca}–${FAIXAS_INTENSIDADE_MM.moderada} mm)`,
  forte: `Forte (${FAIXAS_INTENSIDADE_MM.moderada}–${FAIXAS_INTENSIDADE_MM.forte} mm)`,
  muito_forte: `Muito forte (> ${FAIXAS_INTENSIDADE_MM.forte} mm)`,
};

export const INTENSIDADE_COR: Record<Intensidade, string> = {
  fraca: '#a6c8ff',
  moderada: '#4589ff',
  forte: '#0f62fe',
  muito_forte: '#001d6c',
};

export const SOLO_LABEL: Record<CondicaoSolo, string> = {
  tratavel: 'Tratável',
  saturado: 'Saturado',
  impraticavel: 'Impraticável',
};

export function classificarIntensidade(mm: number): Intensidade {
  if (mm <= FAIXAS_INTENSIDADE_MM.fraca) return 'fraca';
  if (mm <= FAIXAS_INTENSIDADE_MM.moderada) return 'moderada';
  if (mm <= FAIXAS_INTENSIDADE_MM.forte) return 'forte';
  return 'muito_forte';
}

/** 'YYYY-MM' -> 'Out/2024' */
export function rotuloMes(mesChave: string, curto = false): string {
  const [ano, mes] = mesChave.split('-').map(Number);
  return curto ? `${MESES_ABREV[mes - 1]}/${String(ano).slice(2)}` : `${MESES_NOME[mes - 1]}/${ano}`;
}

export function hojeIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function diasNoMes(mesChave: string): number {
  const [ano, mes] = mesChave.split('-').map(Number);
  return new Date(ano, mes, 0).getDate();
}

/** Lista de chaves 'YYYY-MM' dos `n` meses que terminam em `mesFinal`. */
export function mesesAnteriores(mesFinal: string, n: number): string[] {
  const [ano, mes] = mesFinal.split('-').map(Number);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(ano, mes - 1 - (n - 1 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
}

/** Mês de referência do card do Dashboard: o do registro mais recente, ou o mês atual. */
export function mesReferencia(registros: RegistroChuva[]): string {
  if (registros.length === 0) return hojeIso().slice(0, 7);
  return registros.reduce((max, r) => (r.data > max ? r.data : max), registros[0].data).slice(0, 7);
}

export interface ResumoPeriodo {
  acumuladoMm: number;
  diasChuva: number;
  diasParalisacaoTotal: number;
  horasParadas: number;
  maiorChuvaDiaMm: number;
  soloAtual?: CondicaoSolo;
}

export function resumir(registros: RegistroChuva[]): ResumoPeriodo {
  const porDia = new Map<string, number>();
  registros.forEach(r => porDia.set(r.data, (porDia.get(r.data) || 0) + r.mm));
  const ordenados = [...registros].sort((a, b) => (a.data + a.inicio).localeCompare(b.data + b.inicio));
  return {
    acumuladoMm: registros.reduce((s, r) => s + r.mm, 0),
    diasChuva: porDia.size,
    diasParalisacaoTotal: new Set(registros.filter(r => r.paralisacaoTotal).map(r => r.data)).size,
    horasParadas: registros.reduce((s, r) => s + r.horasParadas, 0),
    maiorChuvaDiaMm: Math.max(0, ...porDia.values()),
    soloAtual: ordenados[ordenados.length - 1]?.solo,
  };
}

export function formatarMm(mm: number): string {
  return Number.isInteger(mm) ? String(mm) : mm.toFixed(1).replace('.', ',');
}
