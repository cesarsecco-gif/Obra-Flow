import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkerEntry } from '../types';
import { hojeIso } from '../services/pluviometria';
import {
  EfetivoStorage,
  ApontamentoEfetivo,
  ApontamentosPorDia,
  FechamentoBoletim,
  StatusPresenca,
  STATUS_PRESENCA_LABEL,
  Equipamento,
  ApontamentoEquipamento,
  ApontamentosEquipPorDia,
  StatusEquipamento,
  STATUS_EQUIP_LABEL,
  JORNADA_PADRAO_H,
  EQUIPAMENTOS_EXEMPLO,
  APONT_EQUIP_EXEMPLO,
  colaboradoresDaObra,
  apontamentoDoCadastro,
  apontamentoPresente,
  horasEntre,
  lerCsvCatraca,
} from '../services/efetivo';

const DATA_EXEMPLO = '2024-10-24';

function num(v: string, max = 24): number {
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? Math.min(max, n) : 0;
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',');
}

function dataCurta(iso: string): string {
  return iso.split('-').reverse().join('/');
}

function iniciais(nome: string): string {
  return nome.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'TR';
}

type Aba = 'efetivo' | 'equipamentos';

interface FormColaborador {
  id?: string;
  name: string;
  matricula: string;
  role: string;
  company: string;
  contractType: 'clt' | 'sub';
  front: string;
  sst: string;
}

const FORM_COLAB_VAZIO: FormColaborador = { name: '', matricula: '', role: '', company: 'Construtora Horizonte (CLT)', contractType: 'clt', front: '', sst: 'ASO OK, NR-18' };

type FormEquip = Omit<Equipamento, 'id'> & { id?: string };
const FORM_EQUIP_VAZIO: FormEquip = { prefixo: '', tipo: '', modelo: '', propriedade: 'proprio', locador: '', status: 'ativo', horimetroInicial: 0 };

export const StaffView: React.FC = () => {
  const { workers, addWorker, updateWorker, activeProject, currentUser, showToast, addAuditLog } = useApp();
  const pid = activeProject.id;
  const hoje = hojeIso();

  const [aba, setAba] = useState<Aba>('efetivo');
  const [data, setData] = useState(hoje);

  // ---- Estado persistido ----
  const [apontamentos, setApontamentos] = useState<ApontamentosPorDia>({});
  const [fechamentos, setFechamentos] = useState<Record<string, FechamentoBoletim>>({});
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [apontEquip, setApontEquip] = useState<ApontamentosEquipPorDia>({});

  const colaboradores = useMemo(() => colaboradoresDaObra(workers, pid), [workers, pid]);

  // Carrega (e na primeira vez semeia com os dados de exemplo) ao trocar de obra
  useEffect(() => {
    let ap = EfetivoStorage.getApontamentos(pid);
    if (!ap) {
      const base = Object.fromEntries(colaboradoresDaObra(workers, pid).map(w => [w.id, apontamentoDoCadastro(w)]));
      ap = { [hoje]: base, [DATA_EXEMPLO]: { ...base } };
      EfetivoStorage.setApontamentos(pid, ap);
    }
    let eq = EfetivoStorage.getEquipamentos(pid);
    let ae = EfetivoStorage.getApontEquip(pid);
    if (!eq) {
      eq = EQUIPAMENTOS_EXEMPLO;
      ae = { [hoje]: { ...APONT_EQUIP_EXEMPLO }, [DATA_EXEMPLO]: { ...APONT_EQUIP_EXEMPLO } };
      EfetivoStorage.setEquipamentos(pid, eq);
      EfetivoStorage.setApontEquip(pid, ae);
    }
    setApontamentos(ap);
    setFechamentos(EfetivoStorage.getFechamentos(pid));
    setEquipamentos(eq);
    setApontEquip(ae);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  const fechado = fechamentos[data];
  const diaEfetivo = apontamentos[data] || {};
  const diaEquip = apontEquip[data] || {};

  const salvarApontamentos = (novo: ApontamentosPorDia) => {
    if (EfetivoStorage.setApontamentos(pid, novo)) setApontamentos(novo);
    else showToast('Não foi possível salvar: armazenamento local cheio.', 'error');
  };
  const salvarApontEquip = (novo: ApontamentosEquipPorDia) => {
    if (EfetivoStorage.setApontEquip(pid, novo)) setApontEquip(novo);
    else showToast('Não foi possível salvar: armazenamento local cheio.', 'error');
  };
  const salvarEquipamentos = (novo: Equipamento[]) => {
    if (EfetivoStorage.setEquipamentos(pid, novo)) setEquipamentos(novo);
    else showToast('Não foi possível salvar: armazenamento local cheio.', 'error');
  };

  const apontar = (ids: string[], fn: (atual: ApontamentoEfetivo | undefined, w: WorkerEntry) => ApontamentoEfetivo) => {
    if (fechado) return;
    const dia = { ...diaEfetivo };
    ids.forEach(id => {
      const w = colaboradores.find(c => c.id === id);
      if (w) dia[id] = fn(dia[id], w);
    });
    salvarApontamentos({ ...apontamentos, [data]: dia });
  };

  // ---- Filtros e seleção ----
  const [busca, setBusca] = useState('');
  const [filtroContrato, setFiltroContrato] = useState<'all' | 'clt' | 'sub'>('all');
  const [filtroEmpresa, setFiltroEmpresa] = useState('all');
  const [filtroStatus, setFiltroStatus] = useState<'all' | StatusPresenca | 'nao_apontado'>('all');
  const [selecionados, setSelecionados] = useState<string[]>([]);
  useEffect(() => setSelecionados([]), [data, pid]);

  const empresas = useMemo(() => [...new Set(colaboradores.map(w => w.company))].sort(), [colaboradores]);

  const filtrados = useMemo(() => colaboradores.filter(w => {
    const ap = diaEfetivo[w.id];
    if (filtroContrato !== 'all' && w.contractType !== filtroContrato) return false;
    if (filtroEmpresa !== 'all' && w.company !== filtroEmpresa) return false;
    if (filtroStatus === 'nao_apontado' && ap) return false;
    if (filtroStatus !== 'all' && filtroStatus !== 'nao_apontado' && ap?.status !== filtroStatus) return false;
    if (busca) {
      const q = busca.toLowerCase();
      return w.name.toLowerCase().includes(q) || w.role.toLowerCase().includes(q) || w.matricula.toLowerCase().includes(q);
    }
    return true;
  }), [colaboradores, diaEfetivo, filtroContrato, filtroEmpresa, filtroStatus, busca]);

  // ---- Indicadores do efetivo ----
  const kpi = useMemo(() => {
    const aps = colaboradores.map(w => ({ w, ap: diaEfetivo[w.id] }));
    const presentes = aps.filter(x => x.ap?.status === 'presente');
    const hhNormais = presentes.reduce((s, x) => s + x.ap!.horasNormais, 0);
    const hhExtras = presentes.reduce((s, x) => s + x.ap!.horasExtras, 0);
    return {
      total: colaboradores.length,
      presentes: presentes.length,
      catraca: presentes.filter(x => x.ap!.origem === 'catraca').length,
      proprios: presentes.filter(x => x.w.contractType === 'clt').length,
      terceiros: presentes.filter(x => x.w.contractType === 'sub').length,
      faltaJust: aps.filter(x => x.ap?.status === 'falta_justificada').length,
      faltaInjust: aps.filter(x => x.ap?.status === 'falta_injustificada').length,
      folga: aps.filter(x => x.ap?.status === 'folga').length,
      naoApontados: aps.filter(x => !x.ap).length,
      hhNormais,
      hhExtras,
      pendSst: colaboradores.filter(w => w.sstCompliance.some(s => /venc|pend/i.test(s))).length,
    };
  }, [colaboradores, diaEfetivo]);

  // ---- Ações em lote ----
  const alvoLote = () => (selecionados.length ? selecionados : []);
  const loteStatus = (status: StatusPresenca) => {
    const ids = alvoLote();
    if (!ids.length) return;
    apontar(ids, (atual, w) => status === 'presente'
      ? { ...(atual?.status === 'presente' ? atual : apontamentoPresente(w)), status }
      : { status, entrada: '', horasNormais: 0, horasExtras: 0, frente: atual?.frente || w.front, origem: 'manual', obs: atual?.obs });
    showToast(`${ids.length} colaboradores marcados como "${STATUS_PRESENCA_LABEL[status]}".`, 'success');
    setSelecionados([]);
  };
  const loteExtras = () => {
    const ids = alvoLote().filter(id => diaEfetivo[id]?.status === 'presente');
    if (!ids.length) return showToast('Selecione colaboradores presentes para lançar hora extra.', 'warning');
    const v = window.prompt('Horas extras para cada colaborador selecionado:', '2');
    if (v === null) return;
    const h = num(v, 12);
    apontar(ids, atual => ({ ...atual!, horasExtras: h }));
    addAuditLog('HORA EXTRA AUTORIZADA', 'RDO', `${fmt(h)}h extras para ${ids.length} colaboradores em ${dataCurta(data)}`);
    showToast(`${fmt(h)}h extras lançadas para ${ids.length} colaboradores.`, 'success');
    setSelecionados([]);
  };
  const loteFrente = () => {
    const ids = alvoLote();
    if (!ids.length) return;
    const v = window.prompt('Nova frente de serviço para os selecionados:', '');
    if (!v?.trim()) return;
    apontar(ids, (atual, w) => ({ ...(atual || apontamentoPresente(w)), frente: v.trim() }));
    addAuditLog('REMANEJAMENTO DE MÃO DE OBRA', 'RDO', `${ids.length} colaboradores remanejados para "${v.trim()}" em ${dataCurta(data)}`);
    showToast(`${ids.length} colaboradores remanejados para ${v.trim()}.`, 'success');
    setSelecionados([]);
  };
  const marcarNaoApontadosPresentes = () => {
    const ids = colaboradores.filter(w => !diaEfetivo[w.id]).map(w => w.id);
    if (!ids.length) return;
    apontar(ids, (_, w) => apontamentoPresente(w));
    showToast(`${ids.length} colaboradores marcados como presentes (jornada de ${JORNADA_PADRAO_H}h).`, 'success');
  };
  const copiarDiaAnterior = () => {
    const anteriores = Object.keys(apontamentos).filter(d => d < data).sort();
    const ultimo = anteriores[anteriores.length - 1];
    if (!ultimo) return showToast('Não há apontamento anterior para copiar.', 'warning');
    const base = apontamentos[ultimo];
    const dia: Record<string, ApontamentoEfetivo> = {};
    colaboradores.forEach(w => { if (base[w.id]) dia[w.id] = { ...base[w.id], horasExtras: 0, origem: 'manual' }; });
    salvarApontamentos({ ...apontamentos, [data]: dia });
    showToast(`Apontamento copiado de ${dataCurta(ultimo)}. Confira faltas e horas.`, 'success');
  };

  // ---- Importação da catraca ----
  const inputCsvRef = useRef<HTMLInputElement>(null);
  const importarCatraca = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arq = e.target.files?.[0];
    e.target.value = '';
    if (!arq || fechado) return;
    const linhas = lerCsvCatraca(await arq.text());
    if (!linhas.length) return showToast('Arquivo sem linhas válidas. Formato: matrícula;entrada;saída (ex: 1042;06:54;17:12).', 'error');
    const porMatricula = new Map(colaboradores.map(w => [w.matricula.toLowerCase(), w]));
    const desconhecidas: string[] = [];
    const dia = { ...diaEfetivo };
    linhas.forEach(l => {
      const w = porMatricula.get(l.matricula.toLowerCase());
      if (!w) { desconhecidas.push(l.matricula); return; }
      const total = l.saida ? horasEntre(l.entrada, l.saida) : JORNADA_PADRAO_H;
      dia[w.id] = {
        status: 'presente',
        entrada: l.entrada,
        horasNormais: Math.min(total, JORNADA_PADRAO_H),
        horasExtras: Math.max(0, Math.round((total - JORNADA_PADRAO_H) * 10) / 10),
        frente: dia[w.id]?.frente || w.front,
        origem: 'catraca',
      };
    });
    salvarApontamentos({ ...apontamentos, [data]: dia });
    const ok = linhas.length - desconhecidas.length;
    addAuditLog('IMPORTAÇÃO DE CATRACA', 'RDO', `${ok} registros importados para ${dataCurta(data)} (${arq.name})`);
    showToast(desconhecidas.length
      ? `${ok} registros importados. Matrículas não encontradas: ${desconhecidas.slice(0, 5).join(', ')}${desconhecidas.length > 5 ? '…' : ''}`
      : `${ok} registros da catraca importados.`, desconhecidas.length ? 'warning' : 'success');
  };

  const fecharBoletim = () => {
    if (kpi.naoApontados > 0 && !window.confirm(`${kpi.naoApontados} colaboradores ainda não foram apontados. Fechar o boletim mesmo assim?`)) return;
    if (!window.confirm(`Fechar o boletim de efetivo de ${dataCurta(data)}? Depois de fechado não é possível editar.`)) return;
    const novo = { ...fechamentos, [data]: { por: currentUser?.name || activeProject.engineer, em: new Date().toISOString() } };
    if (EfetivoStorage.setFechamentos(pid, novo)) {
      setFechamentos(novo);
      addAuditLog('BOLETIM DE EFETIVO FECHADO', 'RDO', `${dataCurta(data)}: ${kpi.presentes} presentes, ${fmt(kpi.hhNormais + kpi.hhExtras)} Hh`);
      showToast(`Boletim de ${dataCurta(data)} fechado.`, 'success');
    }
  };

  // ---- Cadastro de colaborador ----
  const [formColab, setFormColab] = useState<FormColaborador | null>(null);
  const salvarColaborador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formColab) return;
    const f = formColab;
    const matricula = f.matricula.trim() || `MAT-${Math.floor(1000 + Math.random() * 9000)}`;
    if (colaboradores.some(w => w.matricula.toLowerCase() === matricula.toLowerCase() && w.id !== f.id)) {
      return showToast(`A matrícula ${matricula} já está cadastrada.`, 'error');
    }
    const campos = {
      name: f.name.trim(),
      matricula,
      role: f.role.trim(),
      company: f.company.trim(),
      contractType: f.contractType,
      front: f.front.trim(),
      sstCompliance: f.sst.split(',').map(s => s.trim()).filter(Boolean),
      avatarInitials: iniciais(f.name),
    };
    if (f.id) {
      updateWorker(f.id, campos);
      addAuditLog('CADASTRO DE EFETIVO ALTERADO', 'RDO', `${campos.name} (${matricula})`);
      showToast(`Cadastro de ${campos.name} atualizado.`, 'success');
    } else {
      addWorker({
        ...campos,
        status: 'presente',
        entryTime: '07:00',
        workHours: JORNADA_PADRAO_H,
        extraHours: 0,
        catracaPoint: 'Apontamento manual',
        projectId: pid,
        ativo: true,
      });
    }
    setFormColab(null);
  };
  const desligar = (w: WorkerEntry) => {
    if (!window.confirm(`Desligar ${w.name} desta obra? Os apontamentos já feitos continuam guardados.`)) return;
    updateWorker(w.id, { ativo: false });
    addAuditLog('COLABORADOR DESLIGADO', 'RDO', `${w.name} (${w.matricula})`);
    showToast(`${w.name} desligado.`, 'info');
  };

  // ---- Equipamentos ----
  const [formEquip, setFormEquip] = useState<FormEquip | null>(null);
  const [mostrarDesmob, setMostrarDesmob] = useState(false);
  const equipVisiveis = equipamentos.filter(e => mostrarDesmob || e.status !== 'desmobilizado');

  const salvarEquip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEquip) return;
    const prefixo = formEquip.prefixo.trim().toUpperCase();
    if (!prefixo || !formEquip.tipo.trim()) return showToast('Informe prefixo e tipo do equipamento.', 'error');
    if (equipamentos.some(x => x.prefixo.toUpperCase() === prefixo && x.id !== formEquip.id)) return showToast(`O prefixo ${prefixo} já existe.`, 'error');
    const item: Equipamento = { ...formEquip, prefixo, tipo: formEquip.tipo.trim(), modelo: formEquip.modelo.trim(), id: formEquip.id || crypto.randomUUID() };
    salvarEquipamentos(formEquip.id ? equipamentos.map(x => (x.id === item.id ? item : x)) : [...equipamentos, item]);
    addAuditLog(formEquip.id ? 'EQUIPAMENTO ALTERADO' : 'EQUIPAMENTO MOBILIZADO', 'RDO', `${item.prefixo} — ${item.tipo}`);
    showToast(`${item.prefixo} ${formEquip.id ? 'atualizado' : 'cadastrado'}.`, 'success');
    setFormEquip(null);
  };

  const apontarEquip = (id: string, parcial: Partial<ApontamentoEquipamento>) => {
    if (fechado) return;
    const atual = diaEquip[id] || { horasOperando: 0, horasParadas: 0 };
    salvarApontEquip({ ...apontEquip, [data]: { ...diaEquip, [id]: { ...atual, ...parcial } } });
  };

  const horimetroAtual = (eq: Equipamento): number => {
    // último horímetro final informado até a data, senão o inicial
    const datas = Object.keys(apontEquip).filter(d => d <= data).sort().reverse();
    for (const d of datas) {
      const h = apontEquip[d]?.[eq.id]?.horimetroFinal;
      if (h) return h;
    }
    return eq.horimetroInicial;
  };

  const kpiEq = useMemo(() => {
    const ativos = equipamentos.filter(e => e.status === 'ativo');
    const aps = ativos.map(e => diaEquip[e.id]).filter(Boolean) as ApontamentoEquipamento[];
    const op = aps.reduce((s, a) => s + a.horasOperando, 0);
    const par = aps.reduce((s, a) => s + a.horasParadas, 0);
    return {
      ativos: ativos.length,
      manutencao: equipamentos.filter(e => e.status === 'manutencao').length,
      operando: aps.filter(a => a.horasOperando > 0).length,
      horasOp: op,
      horasPar: par,
      utilizacao: op + par > 0 ? (op / (op + par)) * 100 : 0,
      locados: equipamentos.filter(e => e.status !== 'desmobilizado' && e.propriedade === 'locado').length,
    };
  }, [equipamentos, diaEquip]);

  // ---- Estilos ----
  const inputCls = 'w-full bg-surface px-2 py-1.5 text-xs border-b-2 border-surface-container-highest focus:border-primary focus:outline-none disabled:bg-transparent disabled:border-transparent';
  const labelCls = 'block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1';
  const btnSec = 'inline-flex items-center gap-1.5 px-3 py-2 bg-surface hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-surface-container-high disabled:opacity-40';
  const cardCls = 'bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high';

  const datasComApontamento = Object.keys(apontamentos).length;

  return (
    <div className="flex flex-col w-full space-y-6 font-body">
      {/* Topo */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium mb-1">
            <span>CANTEIRO &amp; OPERAÇÃO</span><span className="text-surface-container-highest">/</span>
            <span className="text-on-surface uppercase tracking-wider font-semibold">Efetivo &amp; Equipamentos</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface">Apontamento Diário de Efetivo &amp; Equipamentos</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            {activeProject.name} • presença, horas e frente de cada colaborador, e horas operando/paradas de cada máquina. Alimenta o RDO do dia.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2.5">
          <div>
            <span className={labelCls}>Data do apontamento</span>
            <input type="date" max={hoje} value={data} onChange={e => e.target.value && setData(e.target.value)} className="bg-surface px-3 py-2 text-xs border border-surface-container-high" />
          </div>
          {data !== hoje && <button type="button" onClick={() => setData(hoje)} className={btnSec}>Hoje</button>}
        </div>
      </div>

      {/* Abas */}
      <div className="flex border-b border-surface-container-high">
        {([['efetivo', 'groups', `Efetivo (${kpi.presentes}/${kpi.total})`], ['equipamentos', 'precision_manufacturing', `Equipamentos (${kpiEq.operando}/${kpiEq.ativos})`]] as const).map(([id, icone, rotulo]) => (
          <button key={id} type="button" onClick={() => setAba(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px ${aba === id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
            <span className="material-symbols-outlined text-base">{icone}</span>{rotulo}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pb-1 text-xs">
          {fechado ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-tertiary-container text-on-tertiary-container font-semibold">
              <span className="material-symbols-outlined text-sm">lock</span>
              Boletim fechado por {fechado.por} em {new Date(fechado.em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#fff8e1] text-[#7a5600] font-semibold">
              <span className="material-symbols-outlined text-sm">edit</span> Boletim em aberto
            </span>
          )}
        </div>
      </div>

      {aba === 'efetivo' && (
        <>
          {/* Indicadores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className={cardCls}>
              <span className="uppercase tracking-wider text-[11px] text-on-surface-variant font-medium">Presentes no dia</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-on-surface font-mono">{kpi.presentes}</span>
                <span className="text-xs text-on-surface-variant">de {kpi.total} na obra</span>
              </div>
              <div className="mt-3 w-full bg-surface-container-high h-1.5"><div className="bg-tertiary h-full" style={{ width: `${kpi.total ? (kpi.presentes / kpi.total) * 100 : 0}%` }} /></div>
              <div className="flex justify-between mt-2 text-[11px] text-on-surface-variant">
                <span>Catraca: {kpi.catraca}</span><span>Manual: {kpi.presentes - kpi.catraca}</span>
              </div>
            </div>
            <div className={cardCls}>
              <span className="uppercase tracking-wider text-[11px] text-on-surface-variant font-medium">Vínculo (presentes)</span>
              <div className="flex items-baseline gap-3 mt-2">
                <div><span className="text-2xl font-bold font-mono">{kpi.proprios}</span><span className="text-[11px] text-on-surface-variant block">Próprios</span></div>
                <div className="h-6 w-px bg-surface-container-high" />
                <div><span className="text-2xl font-bold font-mono">{kpi.terceiros}</span><span className="text-[11px] text-on-surface-variant block">Terceiros</span></div>
              </div>
              <div className="mt-3 flex gap-1 h-1.5">
                <div className="bg-primary h-full" style={{ width: `${kpi.presentes ? (kpi.proprios / kpi.presentes) * 100 : 0}%` }} />
                <div className="bg-surface-container-highest h-full flex-1" />
              </div>
              <span className="text-[11px] text-on-surface-variant mt-2">{empresas.length} empresas</span>
            </div>
            <div className={cardCls}>
              <span className="uppercase tracking-wider text-[11px] text-on-surface-variant font-medium">Faltas &amp; Ausências</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-3xl font-bold font-mono ${kpi.faltaJust + kpi.faltaInjust ? 'text-error' : 'text-on-surface'}`}>{kpi.faltaJust + kpi.faltaInjust}</span>
                <span className="text-xs text-on-surface-variant">{kpi.folga ? `+ ${kpi.folga} folga/férias` : 'faltas'}</span>
              </div>
              <div className="mt-3 flex justify-between text-[11px] text-on-surface-variant">
                <span>{kpi.faltaJust} justificadas</span><span className="text-error font-semibold">{kpi.faltaInjust} injustificadas</span>
              </div>
              <span className={`text-[11px] mt-2 ${kpi.naoApontados ? 'text-[#b78103] font-semibold' : 'text-on-surface-variant'}`}>
                {kpi.naoApontados ? `${kpi.naoApontados} sem apontamento` : 'Todos apontados'}
              </span>
            </div>
            <div className={cardCls}>
              <span className="uppercase tracking-wider text-[11px] text-on-surface-variant font-medium">Homem-hora do dia</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-on-surface font-mono">{fmt(kpi.hhNormais + kpi.hhExtras)}</span>
                <span className="text-xs text-on-surface-variant">Hh</span>
              </div>
              <div className="mt-3 flex justify-between text-[11px]">
                <span className="text-on-surface-variant">{fmt(kpi.hhNormais)} normais</span>
                <span className="text-primary font-bold">+{fmt(kpi.hhExtras)} extras</span>
              </div>
              <span className="text-[11px] text-on-surface-variant mt-2">Média {kpi.presentes ? fmt(Math.round(((kpi.hhNormais + kpi.hhExtras) / kpi.presentes) * 10) / 10) : 0} h/pessoa</span>
            </div>
            <div className={cardCls}>
              <span className="uppercase tracking-wider text-[11px] text-on-surface-variant font-medium">Conformidade SST</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-on-surface font-mono">{kpi.total ? Math.round(((kpi.total - kpi.pendSst) / kpi.total) * 100) : 100}%</span>
                <span className={`text-xs font-bold ${kpi.pendSst ? 'text-error' : 'text-tertiary'}`}>{kpi.pendSst ? `${kpi.pendSst} pendência(s)` : 'Em dia'}</span>
              </div>
              <span className="text-[11px] text-on-surface-variant mt-3">Itens com "vencendo" ou "pendente" no cadastro</span>
            </div>
          </div>

          {/* Filtros e ações */}
          <div className="bg-surface-container-low p-4 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3 border border-surface-container-high">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
                <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar nome, função ou matrícula" className="w-full bg-surface pl-8 pr-3 py-2 text-xs border border-surface-container-high focus:outline-none focus:border-primary" />
              </div>
              <select value={filtroContrato} onChange={e => setFiltroContrato(e.target.value as typeof filtroContrato)} className="bg-surface px-3 py-2 text-xs border border-surface-container-high">
                <option value="all">Todos os vínculos</option><option value="clt">Próprios (CLT)</option><option value="sub">Terceiros</option>
              </select>
              <select value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)} className="bg-surface px-3 py-2 text-xs border border-surface-container-high max-w-[220px]">
                <option value="all">Todas as empresas</option>
                {empresas.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as typeof filtroStatus)} className="bg-surface px-3 py-2 text-xs border border-surface-container-high">
                <option value="all">Todas as situações</option>
                {(Object.keys(STATUS_PRESENCA_LABEL) as StatusPresenca[]).map(s => <option key={s} value={s}>{STATUS_PRESENCA_LABEL[s]}</option>)}
                <option value="nao_apontado">Sem apontamento</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input ref={inputCsvRef} type="file" accept=".csv,.txt" onChange={importarCatraca} className="hidden" />
              <button type="button" disabled={!!fechado} onClick={() => inputCsvRef.current?.click()} className={btnSec} title="CSV: matrícula;entrada;saída">
                <span className="material-symbols-outlined text-base text-primary">upload_file</span> Importar catraca (CSV)
              </button>
              <button type="button" disabled={!!fechado} onClick={copiarDiaAnterior} className={btnSec}>
                <span className="material-symbols-outlined text-base text-primary">content_copy</span> Copiar dia anterior
              </button>
              <button type="button" onClick={() => setFormColab({ ...FORM_COLAB_VAZIO })} className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold">
                <span className="material-symbols-outlined text-base">person_add</span> Novo colaborador
              </button>
            </div>
          </div>

          {/* Barra de seleção / sem apontamento */}
          {!fechado && (selecionados.length > 0 || kpi.naoApontados > 0) && (
            <div className="bg-primary-container text-on-primary-fixed px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs">
              {selecionados.length > 0 ? (
                <>
                  <span className="font-semibold mr-2">{selecionados.length} selecionados:</span>
                  <button type="button" onClick={() => loteStatus('presente')} className="px-2.5 py-1 bg-surface font-semibold">Presente</button>
                  <button type="button" onClick={() => loteStatus('falta_justificada')} className="px-2.5 py-1 bg-surface font-semibold">Falta justificada</button>
                  <button type="button" onClick={() => loteStatus('falta_injustificada')} className="px-2.5 py-1 bg-surface font-semibold text-error">Falta injustificada</button>
                  <button type="button" onClick={loteExtras} className="px-2.5 py-1 bg-surface font-semibold">Hora extra…</button>
                  <button type="button" onClick={loteFrente} className="px-2.5 py-1 bg-surface font-semibold">Remanejar frente…</button>
                  <button type="button" onClick={() => setSelecionados([])} className="ml-auto font-semibold underline">Limpar seleção</button>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">info</span>
                  <span>{kpi.naoApontados} colaboradores sem apontamento em {dataCurta(data)}.</span>
                  <button type="button" onClick={marcarNaoApontadosPresentes} className="px-2.5 py-1 bg-surface font-semibold">Marcar como presentes ({JORNADA_PADRAO_H}h)</button>
                </>
              )}
            </div>
          )}

          {/* Tabela de efetivo */}
          <div className="bg-surface shadow-sm overflow-x-auto border border-surface-container-high">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-container text-on-surface uppercase text-[10px] font-semibold tracking-wider border-b border-surface-container-high">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">
                    <input type="checkbox" disabled={!!fechado} className="w-4 h-4 accent-primary"
                      checked={filtrados.length > 0 && filtrados.every(w => selecionados.includes(w.id))}
                      onChange={e => setSelecionados(e.target.checked ? filtrados.map(w => w.id) : [])} />
                  </th>
                  <th className="py-3 px-3 min-w-[220px]">Colaborador &amp; função</th>
                  <th className="py-3 px-3 min-w-[150px]">Empresa</th>
                  <th className="py-3 px-3 min-w-[170px]">Situação</th>
                  <th className="py-3 px-3 w-24">Entrada</th>
                  <th className="py-3 px-3 w-20 text-center">h normais</th>
                  <th className="py-3 px-3 w-20 text-center">h extras</th>
                  <th className="py-3 px-3 min-w-[180px]">Frente de serviço</th>
                  <th className="py-3 px-3 min-w-[140px]">SST</th>
                  <th className="py-3 px-3 w-20 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {filtrados.length === 0 && (
                  <tr><td colSpan={10} className="py-8 text-center text-on-surface-variant">Nenhum colaborador neste filtro.</td></tr>
                )}
                {filtrados.map(w => {
                  const ap = diaEfetivo[w.id];
                  const ausente = ap && ap.status !== 'presente';
                  const bloq = !!fechado;
                  return (
                    <tr key={w.id} className={`${ausente ? 'bg-error-container/40' : !ap ? 'bg-[#fffbeb]' : ''}`}>
                      <td className="py-2 px-4 text-center">
                        <input type="checkbox" disabled={bloq} checked={selecionados.includes(w.id)} className="w-4 h-4 accent-primary"
                          onChange={() => setSelecionados(prev => prev.includes(w.id) ? prev.filter(i => i !== w.id) : [...prev, w.id])} />
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-xs shrink-0">{w.avatarInitials}</div>
                          <div className="min-w-0">
                            <div className="font-semibold text-on-surface truncate">{w.name}</div>
                            <div className="text-[11px] text-on-surface-variant font-mono">Mat: {w.matricula} • {w.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold ${w.contractType === 'clt' ? 'bg-primary-container text-on-primary-fixed' : 'bg-surface-container text-on-surface'}`}>{w.company}</span>
                      </td>
                      <td className="py-2 px-3">
                        <select disabled={bloq} value={ap?.status || ''}
                          onChange={e => {
                            const s = e.target.value as StatusPresenca;
                            apontar([w.id], atual => s === 'presente'
                              ? { ...(atual?.status === 'presente' ? atual : apontamentoPresente(w)) }
                              : { status: s, entrada: '', horasNormais: 0, horasExtras: 0, frente: atual?.frente || w.front, origem: 'manual', obs: atual?.obs });
                          }}
                          className={`${inputCls} font-semibold ${ap?.status === 'presente' ? 'text-tertiary' : ap ? 'text-error' : 'text-[#b78103]'}`}>
                          {!ap && <option value="">— Sem apontamento —</option>}
                          {(Object.keys(STATUS_PRESENCA_LABEL) as StatusPresenca[]).map(s => <option key={s} value={s}>{STATUS_PRESENCA_LABEL[s]}</option>)}
                        </select>
                        {ap && (
                          <span className="text-[10px] text-on-surface-variant font-mono block mt-0.5 px-2">
                            {ap.status === 'presente' ? (ap.origem === 'catraca' ? 'Registro da catraca' : 'Apontamento manual') : (
                              <input disabled={bloq} value={ap.obs || ''} onChange={e => apontar([w.id], atual => ({ ...atual!, obs: e.target.value }))} placeholder="Motivo (ex: atestado)" className="bg-transparent w-full focus:outline-none" />
                            )}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <input type="time" disabled={bloq || ap?.status !== 'presente'} value={ap?.entrada || ''} onChange={e => apontar([w.id], atual => ({ ...atual!, entrada: e.target.value }))} className={`${inputCls} font-mono`} />
                      </td>
                      <td className="py-2 px-3">
                        <input inputMode="decimal" disabled={bloq || ap?.status !== 'presente'} value={ap?.status === 'presente' ? ap.horasNormais : ''} onChange={e => apontar([w.id], atual => ({ ...atual!, horasNormais: num(e.target.value, 12) }))} className={`${inputCls} text-center font-mono`} />
                      </td>
                      <td className="py-2 px-3">
                        <input inputMode="decimal" disabled={bloq || ap?.status !== 'presente'} value={ap?.status === 'presente' ? ap.horasExtras : ''} onChange={e => apontar([w.id], atual => ({ ...atual!, horasExtras: num(e.target.value, 12) }))} className={`${inputCls} text-center font-mono ${ap?.horasExtras ? 'text-primary font-bold' : ''}`} />
                      </td>
                      <td className="py-2 px-3">
                        <input disabled={bloq || !ap} value={ap?.frente ?? w.front} onChange={e => apontar([w.id], (atual, wk) => ({ ...(atual || apontamentoPresente(wk)), frente: e.target.value }))} className={inputCls} />
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex flex-wrap gap-1">
                          {w.sstCompliance.map(s => (
                            <span key={s} className={`px-1.5 text-[10px] font-semibold ${/venc|pend/i.test(s) ? 'bg-[#fff8e1] text-[#b78103]' : 'bg-tertiary-container text-on-tertiary-container'}`}>{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <button type="button" title="Editar cadastro" className="p-1 text-on-surface-variant hover:text-primary"
                          onClick={() => setFormColab({ id: w.id, name: w.name, matricula: w.matricula, role: w.role, company: w.company, contractType: w.contractType, front: w.front, sst: w.sstCompliance.join(', ') })}>
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button type="button" title="Desligar da obra" onClick={() => desligar(w)} className="p-1 text-on-surface-variant hover:text-error">
                          <span className="material-symbols-outlined text-base">person_remove</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {aba === 'equipamentos' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className={cardCls}>
              <span className="uppercase tracking-wider text-[11px] text-on-surface-variant font-medium">Operando no dia</span>
              <div className="flex items-baseline gap-2 mt-2"><span className="text-3xl font-bold font-mono">{kpiEq.operando}</span><span className="text-xs text-on-surface-variant">de {kpiEq.ativos} ativos</span></div>
              <span className="text-[11px] text-on-surface-variant mt-2">{kpiEq.manutencao} em manutenção • {kpiEq.locados} locados</span>
            </div>
            <div className={cardCls}>
              <span className="uppercase tracking-wider text-[11px] text-on-surface-variant font-medium">Horas operando</span>
              <div className="flex items-baseline gap-2 mt-2"><span className="text-3xl font-bold font-mono">{fmt(kpiEq.horasOp)}</span><span className="text-xs text-on-surface-variant">h</span></div>
              <span className="text-[11px] text-on-surface-variant mt-2">Soma dos equipamentos ativos</span>
            </div>
            <div className={cardCls}>
              <span className="uppercase tracking-wider text-[11px] text-on-surface-variant font-medium">Horas paradas</span>
              <div className="flex items-baseline gap-2 mt-2"><span className={`text-3xl font-bold font-mono ${kpiEq.horasPar ? 'text-error' : ''}`}>{fmt(kpiEq.horasPar)}</span><span className="text-xs text-on-surface-variant">h</span></div>
              <span className="text-[11px] text-on-surface-variant mt-2">Chuva, manutenção, falta de frente…</span>
            </div>
            <div className={cardCls}>
              <span className="uppercase tracking-wider text-[11px] text-on-surface-variant font-medium">Utilização</span>
              <div className="flex items-baseline gap-2 mt-2"><span className={`text-3xl font-bold font-mono ${kpiEq.utilizacao && kpiEq.utilizacao < 75 ? 'text-error' : ''}`}>{Math.round(kpiEq.utilizacao)}%</span></div>
              <div className="mt-3 w-full bg-surface-container-high h-1.5"><div className={`h-full ${kpiEq.utilizacao < 75 ? 'bg-error' : 'bg-tertiary'}`} style={{ width: `${kpiEq.utilizacao}%` }} /></div>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 border border-surface-container-high">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={mostrarDesmob} onChange={e => setMostrarDesmob(e.target.checked)} className="accent-primary" /> Mostrar desmobilizados
            </label>
            <button type="button" onClick={() => setFormEquip({ ...FORM_EQUIP_VAZIO })} className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold">
              <span className="material-symbols-outlined text-base">add</span> Cadastrar equipamento
            </button>
          </div>

          <div className="bg-surface shadow-sm overflow-x-auto border border-surface-container-high">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-container text-on-surface uppercase text-[10px] font-semibold tracking-wider border-b border-surface-container-high">
                <tr>
                  <th className="py-3 px-3 min-w-[200px]">Equipamento</th>
                  <th className="py-3 px-3">Propriedade</th>
                  <th className="py-3 px-3 w-44">Situação</th>
                  <th className="py-3 px-3 w-20 text-center">h operando</th>
                  <th className="py-3 px-3 w-20 text-center">h parado</th>
                  <th className="py-3 px-3 min-w-[170px]">Motivo da parada</th>
                  <th className="py-3 px-3 min-w-[150px]">Frente</th>
                  <th className="py-3 px-3 w-28 text-right">Horímetro</th>
                  <th className="py-3 px-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {equipVisiveis.length === 0 && (
                  <tr><td colSpan={9} className="py-8 text-center text-on-surface-variant">Nenhum equipamento cadastrado nesta obra.</td></tr>
                )}
                {equipVisiveis.map(eq => {
                  const ap = diaEquip[eq.id];
                  const podeApontar = eq.status === 'ativo' && !fechado;
                  const hAtual = horimetroAtual(eq);
                  return (
                    <tr key={eq.id} className={eq.status !== 'ativo' ? 'bg-surface-container-low text-on-surface-variant' : ''}>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-on-surface font-mono">{eq.prefixo}</div>
                        <div className="text-[11px] text-on-surface-variant">{eq.tipo}{eq.modelo ? ` • ${eq.modelo}` : ''}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 text-[11px] font-semibold ${eq.propriedade === 'proprio' ? 'bg-primary-container text-on-primary-fixed' : 'bg-surface-container text-on-surface'}`}>
                          {eq.propriedade === 'proprio' ? 'Próprio' : `Locado${eq.locador ? ` • ${eq.locador}` : ''}`}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <select value={eq.status} onChange={e => {
                          const s = e.target.value as StatusEquipamento;
                          salvarEquipamentos(equipamentos.map(x => (x.id === eq.id ? { ...x, status: s } : x)));
                          addAuditLog('SITUAÇÃO DE EQUIPAMENTO', 'RDO', `${eq.prefixo}: ${STATUS_EQUIP_LABEL[s]}`);
                        }} className={`${inputCls} font-semibold ${eq.status === 'ativo' ? 'text-tertiary' : eq.status === 'manutencao' ? 'text-[#b78103]' : ''}`}>
                          {(Object.keys(STATUS_EQUIP_LABEL) as StatusEquipamento[]).map(s => <option key={s} value={s}>{STATUS_EQUIP_LABEL[s]}</option>)}
                        </select>
                      </td>
                      <td className="py-2 px-3"><input inputMode="decimal" disabled={!podeApontar} value={ap?.horasOperando ?? ''} placeholder={podeApontar ? '0' : ''} onChange={e => apontarEquip(eq.id, { horasOperando: num(e.target.value) })} className={`${inputCls} text-center font-mono`} /></td>
                      <td className="py-2 px-3"><input inputMode="decimal" disabled={!podeApontar} value={ap?.horasParadas ?? ''} placeholder={podeApontar ? '0' : ''} onChange={e => apontarEquip(eq.id, { horasParadas: num(e.target.value) })} className={`${inputCls} text-center font-mono ${ap?.horasParadas ? 'text-error' : ''}`} /></td>
                      <td className="py-2 px-3"><input disabled={!podeApontar} value={ap?.motivoParada || ''} placeholder={ap?.horasParadas ? 'Informe o motivo' : ''} onChange={e => apontarEquip(eq.id, { motivoParada: e.target.value })} className={`${inputCls} ${ap?.horasParadas && !ap.motivoParada ? 'border-error' : ''}`} /></td>
                      <td className="py-2 px-3"><input disabled={!podeApontar} value={ap?.frente || ''} onChange={e => apontarEquip(eq.id, { frente: e.target.value })} className={inputCls} /></td>
                      <td className="py-2 px-3">
                        <input inputMode="decimal" disabled={!podeApontar} value={ap?.horimetroFinal ?? ''} placeholder={fmt(hAtual)} title="Horímetro final do dia"
                          onChange={e => apontarEquip(eq.id, { horimetroFinal: e.target.value === '' ? undefined : num(e.target.value, 1e7) })}
                          className={`${inputCls} text-right font-mono`} />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button type="button" title="Editar cadastro" onClick={() => setFormEquip({ ...eq })} className="p-1 text-on-surface-variant hover:text-primary">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Fechamento do boletim */}
      <div className="bg-surface-container-low p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 border border-surface-container-high text-xs">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-base text-tertiary">save</span>
          Tudo é salvo automaticamente neste aparelho. {datasComApontamento} {datasComApontamento === 1 ? 'dia apontado' : 'dias apontados'} nesta obra.
        </div>
        {!fechado && (
          <button type="button" onClick={fecharBoletim} className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface hover:bg-surface-container-high text-on-surface font-semibold border border-surface-container-high">
            <span className="material-symbols-outlined text-base text-primary">verified</span> Fechar boletim de {dataCurta(data)}
          </button>
        )}
      </div>

      {/* Modal colaborador */}
      {formColab && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setFormColab(null)}>
          <form onSubmit={salvarColaborador} onClick={e => e.stopPropagation()} className="bg-surface w-full max-w-lg p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider">{formColab.id ? 'Editar colaborador' : 'Novo colaborador'}</h3>
              <button type="button" onClick={() => setFormColab(null)} className="text-on-surface-variant"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div><label className={labelCls}>Nome completo</label><input required value={formColab.name} onChange={e => setFormColab({ ...formColab, name: e.target.value })} className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Matrícula</label><input value={formColab.matricula} onChange={e => setFormColab({ ...formColab, matricula: e.target.value })} placeholder="Gerada se vazia" className={`${inputCls} font-mono`} /></div>
              <div><label className={labelCls}>Função</label><input required value={formColab.role} onChange={e => setFormColab({ ...formColab, role: e.target.value })} placeholder="Ex: Operador de rolo" className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Empresa</label>
                <input required list="lista-empresas" value={formColab.company} onChange={e => setFormColab({ ...formColab, company: e.target.value })} className={inputCls} />
                <datalist id="lista-empresas">{empresas.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div>
                <label className={labelCls}>Vínculo</label>
                <select value={formColab.contractType} onChange={e => setFormColab({ ...formColab, contractType: e.target.value as 'clt' | 'sub' })} className={inputCls}>
                  <option value="clt">Próprio (CLT)</option><option value="sub">Terceiro / subempreiteira</option>
                </select>
              </div>
            </div>
            <div><label className={labelCls}>Frente de serviço padrão</label><input value={formColab.front} onChange={e => setFormColab({ ...formColab, front: e.target.value })} placeholder="Ex: Pavimentação km 12" className={inputCls} /></div>
            <div><label className={labelCls}>Conformidade SST (separada por vírgula)</label><input value={formColab.sst} onChange={e => setFormColab({ ...formColab, sst: e.target.value })} placeholder="ASO OK, NR-18, NR-35 Vencendo" className={inputCls} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setFormColab(null)} className={btnSec}>Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal equipamento */}
      {formEquip && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setFormEquip(null)}>
          <form onSubmit={salvarEquip} onClick={e => e.stopPropagation()} className="bg-surface w-full max-w-lg p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider">{formEquip.id ? 'Editar equipamento' : 'Cadastrar equipamento'}</h3>
              <button type="button" onClick={() => setFormEquip(null)} className="text-on-surface-variant"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={labelCls}>Prefixo</label><input required value={formEquip.prefixo} onChange={e => setFormEquip({ ...formEquip, prefixo: e.target.value })} placeholder="RC-03" className={`${inputCls} font-mono uppercase`} /></div>
              <div className="col-span-2"><label className={labelCls}>Tipo</label><input required value={formEquip.tipo} onChange={e => setFormEquip({ ...formEquip, tipo: e.target.value })} placeholder="Rolo compactador pé de carneiro" className={inputCls} /></div>
            </div>
            <div><label className={labelCls}>Marca / modelo</label><input value={formEquip.modelo} onChange={e => setFormEquip({ ...formEquip, modelo: e.target.value })} placeholder="Dynapac CA250" className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Propriedade</label>
                <select value={formEquip.propriedade} onChange={e => setFormEquip({ ...formEquip, propriedade: e.target.value as 'proprio' | 'locado' })} className={inputCls}>
                  <option value="proprio">Próprio</option><option value="locado">Locado</option>
                </select>
              </div>
              {formEquip.propriedade === 'locado' && (
                <div><label className={labelCls}>Locador</label><input value={formEquip.locador || ''} onChange={e => setFormEquip({ ...formEquip, locador: e.target.value })} className={inputCls} /></div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Horímetro na mobilização</label><input inputMode="decimal" value={formEquip.horimetroInicial} onChange={e => setFormEquip({ ...formEquip, horimetroInicial: num(e.target.value, 1e7) })} className={`${inputCls} font-mono`} /></div>
              <div>
                <label className={labelCls}>Situação</label>
                <select value={formEquip.status} onChange={e => setFormEquip({ ...formEquip, status: e.target.value as StatusEquipamento })} className={inputCls}>
                  {(Object.keys(STATUS_EQUIP_LABEL) as StatusEquipamento[]).map(s => <option key={s} value={s}>{STATUS_EQUIP_LABEL[s]}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setFormEquip(null)} className={btnSec}>Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold">Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
