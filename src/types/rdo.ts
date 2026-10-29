export type TurnoTrabalho = 'manha' | 'tarde' | 'integral' | 'noite';
export type CondicaoClimatica = 'bom' | 'nublado' | 'chuva_leve' | 'chuva_forte' | 'impraticavel';

export interface EfetivoAlocado {
  funcao: string;
  quantidade: number;
  proprio: boolean;
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
