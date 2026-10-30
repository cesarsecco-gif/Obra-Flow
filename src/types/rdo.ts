export type TurnoTrabalho = 'manha' | 'tarde' | 'integral' | 'noite';
export type CondicaoClimatica = 'bom' | 'nublado' | 'chuva_leve' | 'chuva_forte' | 'impraticavel';

export interface EfetivoAlocado {
  funcao: string;
  quantidade: number;
  proprio: boolean;
  empresa?: string;
  horasPorPessoa?: number;
}

export interface EquipamentoAlocado {
  tipo: string;
  identificacao: string;
  horasOperativas: number;
  horasParadas: number;
  motivoParada?: string;
}

export interface OcorrenciaFrente {
  estacaInicial: string;
  estacaFinal: string;
  servico: string;
  descricao: string;
  status: 'em_andamento' | 'concluido' | 'interrompido';
  quantidade?: number;
  unidade?: string;
}

export interface RegistroFotografico {
  id: string;
  urlBlob: string;
  descricao: string;
  estaca?: string;
  timestamp: string;
}

export interface RDOItem {
  idLocal?: number;
  idRemoto?: string;
  numeroRdo: string;
  data: string;
  turno: TurnoTrabalho;
  climaManha: CondicaoClimatica;
  climaTarde: CondicaoClimatica;
  condicaoTrecho: 'praticavel' | 'impraticavel' | 'parcial';
  efetivo: EfetivoAlocado[];
  equipamentos: EquipamentoAlocado[];
  servicos: OcorrenciaFrente[];
  fotos: RegistroFotografico[];
  observacoesFiscais: string;
  criadoEm: string;
  sincronizado: boolean;
}

export type StatusDiario = 'rascunho' | 'assinado';

/** RDO completo de um dia, guardado por obra no IndexedDB do aparelho. */
export interface RdoDiario {
  id: string;
  projectId: string;
  numero: number;
  data: string; // YYYY-MM-DD
  turno: TurnoTrabalho;
  climaManha: CondicaoClimatica;
  climaTarde: CondicaoClimatica;
  condicaoTrecho: 'praticavel' | 'impraticavel' | 'parcial';
  efetivo: EfetivoAlocado[];
  equipamentos: EquipamentoAlocado[];
  servicos: OcorrenciaFrente[];
  fotos: RegistroFotografico[];
  observacoes: string;
  status: StatusDiario;
  assinadoPor?: string;
  assinadoEm?: string;
  criadoEm: string;
  atualizadoEm: string;
}
