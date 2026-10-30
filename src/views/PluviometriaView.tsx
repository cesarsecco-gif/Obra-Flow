import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';

// Protótipo de layout (para aprovação): dados de exemplo em memória, ainda sem persistência.

type Intensidade = 'fraca' | 'moderada' | 'forte' | 'muito_forte';
type CondicaoSolo = 'tratavel' | 'saturado' | 'impraticavel';

interface RegistroChuva {
  id: string;
  data: string; // YYYY-MM-DD
  inicio: string;
  fim: string;
  mm: number;
  pluviometro: string;
  frentes: string[];
  solo: CondicaoSolo;
  horasParadas: number;
  paralisacaoTotal: boolean;
  rdo?: string;
  obs?: string;
}

const PLUVIOMETROS = ['PLV-01 Canteiro Central', 'PLV-02 Frente Km 12+400'];
const FRENTES = ['Terraplenagem', 'Drenagem', 'Pavimentação', 'Obras de Arte', 'Sinalização'];

const LIMITE_PRATICABILIDADE_MM = 10;

function classificar(mm: number): Intensidade {
  if (mm <= 5) return 'fraca';
  if (mm <= 15) return 'moderada';
  if (mm <= 30) return 'forte';
  return 'muito_forte';
}

const INTENSIDADE_LABEL: Record<Intensidade, string> = {
  fraca: 'Fraca (≤ 5 mm)',
  moderada: 'Moderada (5–15 mm)',
  forte: 'Forte (15–30 mm)',
  muito_forte: 'Muito forte (> 30 mm)',
};

const INTENSIDADE_COR: Record<Intensidade, string> = {
  fraca: '#a6c8ff',
  moderada: '#4589ff',
  forte: '#0f62fe',
  muito_forte: '#001d6c',
};

const SOLO_LABEL: Record<CondicaoSolo, string> = {
  tratavel: 'Tratável',
  saturado: 'Saturado',
  impraticavel: 'Impraticável',
};

const REGISTROS_EXEMPLO: RegistroChuva[] = [
  { id: 'r1', data: '2024-10-03', inicio: '06:10', fim: '07:30', mm: 2.5, pluviometro: PLUVIOMETROS[0], frentes: [], solo: 'tratavel', horasParadas: 0, paralisacaoTotal: false, rdo: 'RDO-0512' },
  { id: 'r2', data: '2024-10-07', inicio: '13:40', fim: '16:00', mm: 6, pluviometro: PLUVIOMETROS[1], frentes: ['Pavimentação'], solo: 'saturado', horasParadas: 2.5, paralisacaoTotal: false, rdo: 'RDO-0516' },
  { id: 'r3', data: '2024-10-08', inicio: '05:00', fim: '15:20', mm: 12.5, pluviometro: PLUVIOMETROS[0], frentes: ['Terraplenagem', 'Pavimentação', 'Drenagem'], solo: 'impraticavel', horasParadas: 9, paralisacaoTotal: true, rdo: 'RDO-0517', obs: 'Trecho Km 10 a 14 alagado. Equipes remanejadas para pátio.' },
  { id: 'r4', data: '2024-10-14', inicio: '18:30', fim: '19:10', mm: 1.5, pluviometro: PLUVIOMETROS[1], frentes: [], solo: 'tratavel', horasParadas: 0, paralisacaoTotal: false, rdo: 'RDO-0523' },
  { id: 'r5', data: '2024-10-17', inicio: '10:15', fim: '17:00', mm: 8, pluviometro: PLUVIOMETROS[0], frentes: ['Terraplenagem', 'Pavimentação'], solo: 'saturado', horasParadas: 6, paralisacaoTotal: true, rdo: 'RDO-0526' },
  { id: 'r6', data: '2024-10-18', inicio: '04:30', fim: '12:00', mm: 9.5, pluviometro: PLUVIOMETROS[0], frentes: ['Terraplenagem', 'Pavimentação', 'Obras de Arte'], solo: 'impraticavel', horasParadas: 8, paralisacaoTotal: true, rdo: 'RDO-0527' },
  { id: 'r7', data: '2024-10-21', inicio: '15:00', fim: '16:20', mm: 3, pluviometro: PLUVIOMETROS[1], frentes: ['Sinalização'], solo: 'tratavel', horasParadas: 1, paralisacaoTotal: false, rdo: 'RDO-0530' },
  { id: 'r8', data: '2024-10-23', inicio: '12:00', fim: '14:30', mm: 5, pluviometro: PLUVIOMETROS[1], frentes: ['Drenagem'], solo: 'saturado', horasParadas: 2, paralisacaoTotal: false, rdo: 'RDO-0532' },
];

// Acumulado mensal realizado x normal climatológica (mm)
const HISTORICO_MENSAL = [
  { mes: 'Nov/23', real: 110, normal: 130 },
  { mes: 'Dez/23', real: 185, normal: 160 },
  { mes: 'Jan/24', real: 210, normal: 190 },
  { mes: 'Fev/24', real: 140, normal: 165 },
  { mes: 'Mar/24', real: 95, normal: 130 },
  { mes: 'Abr/24', real: 60, normal: 90 },
  { mes: 'Mai/24', real: 140, normal: 100 },
  { mes: 'Jun/24', real: 70, normal: 95 },
  { mes: 'Jul/24', real: 45, normal: 90 },
  { mes: 'Ago/24', real: 30, normal: 75 },
  { mes: 'Set/24', real: 85, normal: 120 },
  { mes: 'Out/24', real: 48, normal: 140 },
];

const DIAS_NO_MES = 31;
const DIA_HOJE = 24;

export const PluviometriaView: React.FC = () => {
  const { activeProject, showToast } = useApp();

  const [registros, setRegistros] = useState<RegistroChuva[]>(REGISTROS_EXEMPLO);
  const [filtroPluviometro, setFiltroPluviometro] = useState<string>('todos');
  const [filtroFrente, setFiltroFrente] = useState<string>('todas');
  const [filtroIntensidade, setFiltroIntensidade] = useState<Intensidade | 'todas'>('todas');
  const [apenasParalisacao, setApenasParalisacao] = useState(false);

  // Formulário
  const [fData, setFData] = useState('2024-10-24');
  const [fInicio, setFInicio] = useState('');
  const [fFim, setFFim] = useState('');
  const [fMm, setFMm] = useState('');
  const [fPluviometro, setFPluviometro] = useState(PLUVIOMETROS[0]);
  const [fSolo, setFSolo] = useState<CondicaoSolo>('tratavel');
  const [fFrentes, setFFrentes] = useState<string[]>([]);
  const [fHoras, setFHoras] = useState('');
  const [fTotal, setFTotal] = useState(false);
  const [fObs, setFObs] = useState('');

  const filtrados = useMemo(() => registros.filter(r =>
    (filtroPluviometro === 'todos' || r.pluviometro === filtroPluviometro) &&
    (filtroFrente === 'todas' || r.frentes.includes(filtroFrente)) &&
    (filtroIntensidade === 'todas' || classificar(r.mm) === filtroIntensidade) &&
    (!apenasParalisacao || r.horasParadas > 0)
  ), [registros, filtroPluviometro, filtroFrente, filtroIntensidade, apenasParalisacao]);

  const kpis = useMemo(() => {
    const acumulado = filtrados.reduce((s, r) => s + r.mm, 0);
    const diasChuva = new Set(filtrados.map(r => r.data)).size;
    const diasParalisacao = new Set(filtrados.filter(r => r.paralisacaoTotal).map(r => r.data)).size;
    const horas = filtrados.reduce((s, r) => s + r.horasParadas, 0);
    const maxDia = filtrados.reduce((m, r) => Math.max(m, r.mm), 0);
    const normal = HISTORICO_MENSAL[HISTORICO_MENSAL.length - 1].normal;
    return { acumulado, diasChuva, diasParalisacao, horas, maxDia, normal };
  }, [filtrados]);

  const porDia = useMemo(() => {
    const arr = Array.from({ length: DIAS_NO_MES }, (_, i) => ({ dia: i + 1, mm: 0, total: false }));
    filtrados.forEach(r => {
      const d = Number(r.data.slice(8, 10));
      arr[d - 1].mm += r.mm;
      if (r.paralisacaoTotal) arr[d - 1].total = true;
    });
    return arr;
  }, [filtrados]);

  const distribuicao = useMemo(() => {
    const base: Record<Intensidade, number> = { fraca: 0, moderada: 0, forte: 0, muito_forte: 0 };
    filtrados.forEach(r => { base[classificar(r.mm)] += 1; });
    return base;
  }, [filtrados]);

  const salvarRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    const mm = Number(fMm.replace(',', '.'));
    if (!fData || !mm) {
      showToast('Informe a data e a leitura do pluviômetro (mm).', 'error');
      return;
    }
    setRegistros(prev => [...prev, {
      id: crypto.randomUUID(),
      data: fData,
      inicio: fInicio,
      fim: fFim,
      mm,
      pluviometro: fPluviometro,
      frentes: fFrentes,
      solo: fSolo,
      horasParadas: Number(fHoras.replace(',', '.')) || 0,
      paralisacaoTotal: fTotal,
      obs: fObs,
    }].sort((a, b) => a.data.localeCompare(b.data)));
    showToast(`Registro de ${mm} mm salvo (protótipo, sem persistência).`, 'success');
    setFMm(''); setFInicio(''); setFFim(''); setFHoras(''); setFTotal(false); setFFrentes([]); setFObs('');
  };

  // ---- Geometria dos gráficos ----
  const W = 760, H = 220, PAD_L = 34, PAD_B = 24, PAD_T = 12;
  const maxMmDia = Math.max(20, ...porDia.map(d => d.mm));
  const barW = (W - PAD_L - 8) / DIAS_NO_MES;
  const yDia = (mm: number) => PAD_T + (H - PAD_T - PAD_B) * (1 - mm / maxMmDia);

  const W2 = 520, H2 = 230;
  const maxMes = Math.max(...HISTORICO_MENSAL.map(m => Math.max(m.real, m.normal))) * 1.1;
  const colW = (W2 - PAD_L - 8) / HISTORICO_MENSAL.length;
  const yMes = (mm: number) => PAD_T + (H2 - PAD_T - PAD_B) * (1 - mm / maxMes);
  const normalPath = HISTORICO_MENSAL.map((m, i) => `${i === 0 ? 'M' : 'L'}${PAD_L + colW * i + colW / 2},${yMes(m.normal)}`).join(' ');

  const totalDistrib = Object.values(distribuicao).reduce((a, b) => a + b, 0) || 1;

  const inputCls = 'w-full bg-surface px-2.5 py-2 text-xs border-b-2 border-surface-container-highest focus:border-primary focus:outline-none';
  const labelCls = 'block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1';

  return (
    <div className="flex flex-col w-full space-y-6 font-body">
      {/* Cabeçalho */}
      <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">
            <span>Controle Climático</span><span>/</span><span className="text-primary font-semibold">Pluviometria</span>
          </div>
          <h1 className="text-2xl font-semibold text-on-surface mt-1">Pluviometria &amp; Impacto Climático</h1>
          <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
            Registro diário das leituras dos pluviômetros da obra, horas paralisadas e condição do solo.
            Alimenta o card de Pluviometria do Dashboard e o cômputo de dias impraticáveis para pleito de prazo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="flex items-center gap-2 px-3 py-2 text-xs bg-surface-container-low hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-base">download</span> Exportar CSV
          </button>
          <button type="button" className="flex items-center gap-2 px-3 py-2 text-xs bg-surface-container-low hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-base">picture_as_pdf</span> Relatório para Fiscalização
          </button>
        </div>
      </section>

      {/* Filtros */}
      <section className="bg-surface-container-low p-4 shadow-sm flex flex-wrap items-end gap-4">
        <div>
          <span className={labelCls}>Período</span>
          <select className="bg-surface px-3 py-2 text-xs min-w-[150px]" defaultValue="2024-10">
            <option value="2024-10">Outubro / 2024</option>
            <option value="2024-09">Setembro / 2024</option>
            <option value="2024-08">Agosto / 2024</option>
            <option value="custom">Intervalo personalizado…</option>
          </select>
        </div>
        <div>
          <span className={labelCls}>Pluviômetro</span>
          <select value={filtroPluviometro} onChange={e => setFiltroPluviometro(e.target.value)} className="bg-surface px-3 py-2 text-xs min-w-[200px]">
            <option value="todos">Todos os pluviômetros</option>
            {PLUVIOMETROS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <span className={labelCls}>Frente de Serviço</span>
          <select value={filtroFrente} onChange={e => setFiltroFrente(e.target.value)} className="bg-surface px-3 py-2 text-xs min-w-[170px]">
            <option value="todas">Todas as frentes</option>
            {FRENTES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <span className={labelCls}>Intensidade</span>
          <div className="flex">
            {(['todas', 'fraca', 'moderada', 'forte', 'muito_forte'] as const).map(i => (
              <button
                key={i}
                type="button"
                onClick={() => setFiltroIntensidade(i)}
                className={`px-2.5 py-2 text-[11px] border-r border-surface-container-high last:border-r-0 ${
                  filtroIntensidade === i ? 'bg-primary text-on-primary font-semibold' : 'bg-surface text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {i === 'todas' ? 'Todas' : INTENSIDADE_LABEL[i].split(' (')[0]}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-on-surface cursor-pointer pb-2">
          <input type="checkbox" checked={apenasParalisacao} onChange={e => setApenasParalisacao(e.target.checked)} className="accent-primary" />
          Somente dias com paralisação
        </label>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {[
          { label: 'Acumulado no Mês', valor: `${kpis.acumulado.toFixed(1)}`, un: 'mm', sub: `Normal climatológica: ${kpis.normal} mm (${Math.round(kpis.acumulado / kpis.normal * 100)}%)`, icon: 'water_drop', cor: 'text-primary' },
          { label: 'Dias com Chuva', valor: `${kpis.diasChuva}`, un: `/ ${DIA_HOJE} dias`, sub: `${Math.round(kpis.diasChuva / DIA_HOJE * 100)}% dos dias decorridos`, icon: 'rainy', cor: 'text-primary' },
          { label: 'Paralisação Total', valor: `${kpis.diasParalisacao}`, un: 'dias', sub: 'Dias impraticáveis para pleito de prazo', icon: 'block', cor: 'text-error' },
          { label: 'Horas Impactadas', valor: `${kpis.horas.toFixed(1)}`, un: 'h', sub: 'Soma das horas paralisadas nas frentes', icon: 'schedule', cor: 'text-error' },
          { label: 'Maior Chuva Diária', valor: `${kpis.maxDia.toFixed(1)}`, un: 'mm', sub: `Limite de praticabilidade: ${LIMITE_PRATICABILIDADE_MM} mm`, icon: 'thunderstorm', cor: 'text-on-surface' },
        ].map(k => (
          <div key={k.label} className="bg-surface-container-low p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">{k.label}</span>
              <span className={`material-symbols-outlined text-base ${k.cor}`}>{k.icon}</span>
            </div>
            <div className="flex items-baseline gap-1.5 my-2">
              <span className={`text-3xl font-semibold tracking-tight ${k.cor === 'text-error' ? 'text-error' : 'text-on-surface'}`}>{k.valor}</span>
              <span className="text-sm text-on-surface-variant">{k.un}</span>
            </div>
            <span className="text-[11px] text-on-surface-variant">{k.sub}</span>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Coluna de gráficos */}
        <div className="xl:col-span-2 space-y-6">
          {/* Gráfico diário */}
          <section className="bg-surface-container-low p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-semibold text-on-surface">Precipitação Diária — Outubro/2024</h2>
                <span className="text-[11px] text-on-surface-variant">Barras vermelhas indicam dia com paralisação total</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-on-surface-variant">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-primary inline-block" /> Chuva</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-error inline-block" /> Paralisação total</span>
                <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-dashed border-[#b28600] inline-block" /> Limite {LIMITE_PRATICABILIDADE_MM} mm</span>
              </div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[240px]">
              {[0, 5, 10, 15, 20].filter(v => v <= maxMmDia).map(v => (
                <g key={v}>
                  <line x1={PAD_L} x2={W - 8} y1={yDia(v)} y2={yDia(v)} stroke="#e0e0e0" />
                  <text x={PAD_L - 6} y={yDia(v) + 3} fontSize="9" textAnchor="end" fill="#525252">{v}</text>
                </g>
              ))}
              {porDia.map((d, i) => (
                <g key={d.dia}>
                  {d.dia === DIA_HOJE && (
                    <rect x={PAD_L + barW * i} y={PAD_T} width={barW} height={H - PAD_T - PAD_B} fill="#d0e2ff" opacity="0.5" />
                  )}
                  {d.mm > 0 && (
                    <>
                      <rect x={PAD_L + barW * i + 3} y={yDia(d.mm)} width={barW - 6} height={yDia(0) - yDia(d.mm)} fill={d.total ? '#da1e28' : '#0f62fe'}>
                        <title>{`${d.dia}/10: ${d.mm} mm`}</title>
                      </rect>
                      <text x={PAD_L + barW * i + barW / 2} y={yDia(d.mm) - 3} fontSize="8.5" textAnchor="middle" fill="#161616" fontWeight="600">{d.mm}</text>
                    </>
                  )}
                  <text x={PAD_L + barW * i + barW / 2} y={H - 8} fontSize="8.5" textAnchor="middle" fill={d.dia === DIA_HOJE ? '#0f62fe' : '#525252'} fontWeight={d.dia === DIA_HOJE ? '700' : '400'}>{d.dia}</text>
                </g>
              ))}
              <line x1={PAD_L} x2={W - 8} y1={yDia(LIMITE_PRATICABILIDADE_MM)} y2={yDia(LIMITE_PRATICABILIDADE_MM)} stroke="#b28600" strokeWidth="1.5" strokeDasharray="5 4" />
            </svg>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Histórico mensal x normal */}
            <section className="xl:col-span-2 bg-surface-container-low p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-sm font-semibold text-on-surface">Acumulado Mensal x Normal Climatológica</h2>
                  <span className="text-[11px] text-on-surface-variant">Últimos 12 meses do contrato</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-on-surface-variant">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#78a9ff] inline-block" /> Abaixo da normal</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#0043ce] inline-block" /> Acima da normal</span>
                  <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-on-surface inline-block" /> Normal</span>
                </div>
              </div>
              <svg viewBox={`0 0 ${W2} ${H2}`} className="w-full h-[220px]">
                {[0, 50, 100, 150, 200].map(v => (
                  <g key={v}>
                    <line x1={PAD_L} x2={W2 - 8} y1={yMes(v)} y2={yMes(v)} stroke="#e0e0e0" />
                    <text x={PAD_L - 6} y={yMes(v) + 3} fontSize="9" textAnchor="end" fill="#525252">{v}</text>
                  </g>
                ))}
                {HISTORICO_MENSAL.map((m, i) => (
                  <g key={m.mes}>
                    <rect x={PAD_L + colW * i + colW * 0.2} y={yMes(m.real)} width={colW * 0.6} height={yMes(0) - yMes(m.real)} fill={m.real > m.normal ? '#0043ce' : '#78a9ff'}>
                      <title>{`${m.mes}: ${m.real} mm (normal ${m.normal} mm)`}</title>
                    </rect>
                    <text x={PAD_L + colW * i + colW / 2} y={H2 - 8} fontSize="9" textAnchor="middle" fill="#525252">{m.mes}</text>
                  </g>
                ))}
                <path d={normalPath} fill="none" stroke="#161616" strokeWidth="1.5" />
                {HISTORICO_MENSAL.map((m, i) => (
                  <circle key={m.mes} cx={PAD_L + colW * i + colW / 2} cy={yMes(m.normal)} r="2.5" fill="#161616" />
                ))}
              </svg>
            </section>

            {/* Distribuição por intensidade */}
            <section className="bg-surface-container-low p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-on-surface">Eventos por Intensidade</h2>
              <span className="text-[11px] text-on-surface-variant">{filtrados.length} registros no filtro</span>
              <div className="mt-4 space-y-3">
                {(Object.keys(distribuicao) as Intensidade[]).map(i => (
                  <div key={i}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-on-surface">{INTENSIDADE_LABEL[i]}</span>
                      <span className="font-mono font-semibold">{distribuicao[i]}</span>
                    </div>
                    <div className="h-2 bg-surface-container-high">
                      <div className="h-2" style={{ width: `${distribuicao[i] / totalDistrib * 100}%`, background: INTENSIDADE_COR[i] }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-3 border-t border-surface-container-high text-[11px] text-on-surface-variant">
                Condição do solo hoje: <span className="font-semibold text-on-surface">Tratável</span>
              </div>
            </section>
          </div>
        </div>

        {/* Formulário de registro */}
        <section className="bg-surface-container-low p-4 shadow-sm h-fit border-t-4 border-primary">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">add_circle</span>
            <h2 className="text-sm font-semibold text-on-surface">Novo Registro Pluviométrico</h2>
          </div>
          <form onSubmit={salvarRegistro} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-3 sm:col-span-1">
                <label className={labelCls}>Data</label>
                <input type="date" value={fData} onChange={e => setFData(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Início</label>
                <input type="time" value={fInicio} onChange={e => setFInicio(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Fim</label>
                <input type="time" value={fFim} onChange={e => setFFim(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Leitura (mm)</label>
                <input inputMode="decimal" placeholder="Ex: 12,5" value={fMm} onChange={e => setFMm(e.target.value)} className={`${inputCls} font-mono text-sm`} />
                {fMm && Number(fMm.replace(',', '.')) > 0 && (
                  <span className="text-[10px] text-primary font-semibold">{INTENSIDADE_LABEL[classificar(Number(fMm.replace(',', '.')))]}</span>
                )}
              </div>
              <div>
                <label className={labelCls}>Pluviômetro</label>
                <select value={fPluviometro} onChange={e => setFPluviometro(e.target.value)} className={inputCls}>
                  {PLUVIOMETROS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Condição do Solo</label>
              <div className="flex">
                {(Object.keys(SOLO_LABEL) as CondicaoSolo[]).map(s => (
                  <button key={s} type="button" onClick={() => setFSolo(s)}
                    className={`flex-1 py-2 text-[11px] border-r border-surface-container-high last:border-r-0 ${
                      fSolo === s ? (s === 'impraticavel' ? 'bg-error text-on-error font-semibold' : 'bg-primary text-on-primary font-semibold') : 'bg-surface text-on-surface-variant'
                    }`}>
                    {SOLO_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Frentes Afetadas</label>
              <div className="flex flex-wrap gap-1.5">
                {FRENTES.map(f => {
                  const on = fFrentes.includes(f);
                  return (
                    <button key={f} type="button"
                      onClick={() => setFFrentes(prev => on ? prev.filter(x => x !== f) : [...prev, f])}
                      className={`px-2 py-1 text-[11px] ${on ? 'bg-primary-container text-on-primary-fixed font-semibold' : 'bg-surface text-on-surface-variant'}`}>
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 items-end">
              <div>
                <label className={labelCls}>Horas Paralisadas</label>
                <input inputMode="decimal" placeholder="Ex: 2,5" value={fHoras} onChange={e => setFHoras(e.target.value)} className={`${inputCls} font-mono`} />
              </div>
              <label className="flex items-center gap-2 text-xs pb-2 cursor-pointer">
                <input type="checkbox" checked={fTotal} onChange={e => setFTotal(e.target.checked)} className="accent-error" />
                Paralisação total do dia
              </label>
            </div>
            <div>
              <label className={labelCls}>Observações</label>
              <textarea rows={3} value={fObs} onChange={e => setFObs(e.target.value)} placeholder="Trechos alagados, remanejamento de equipes..." className={inputCls} />
            </div>
            <div className="flex items-center gap-2 bg-surface px-3 py-2 text-[11px] text-on-surface-variant">
              <span className="material-symbols-outlined text-base">photo_camera</span>
              Foto do pluviômetro (opcional)
              <span className="ml-auto text-primary font-semibold cursor-pointer">Anexar</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">link</span>
              Será vinculado ao RDO nº {activeProject.rdoNumber} do dia
            </div>
            <button type="submit" className="w-full py-3 bg-primary text-on-primary text-xs font-bold hover:bg-[#0353e9]">
              Salvar Registro
            </button>
          </form>
        </section>
      </div>

      {/* Tabela de registros */}
      <section className="bg-surface-container-low shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-sm font-semibold text-on-surface">Registros do Período</h2>
          <span className="text-[11px] text-on-surface-variant">{filtrados.length} de {registros.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface-container-high text-[10px] uppercase tracking-wider text-on-surface-variant text-left">
                <th className="px-4 py-2">Data</th>
                <th className="px-4 py-2">Horário</th>
                <th className="px-4 py-2 text-right">mm</th>
                <th className="px-4 py-2">Intensidade</th>
                <th className="px-4 py-2">Pluviômetro</th>
                <th className="px-4 py-2">Frentes Afetadas</th>
                <th className="px-4 py-2">Solo</th>
                <th className="px-4 py-2 text-right">Horas Paradas</th>
                <th className="px-4 py-2">RDO</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(r => {
                const int = classificar(r.mm);
                return (
                  <tr key={r.id} className={`border-t border-surface-container-high ${r.paralisacaoTotal ? 'bg-error-container' : 'bg-surface'}`}>
                    <td className="px-4 py-2 font-mono">{r.data.split('-').reverse().join('/')}</td>
                    <td className="px-4 py-2 font-mono text-on-surface-variant">{r.inicio && r.fim ? `${r.inicio}–${r.fim}` : '—'}</td>
                    <td className="px-4 py-2 font-mono font-semibold text-right">{r.mm.toFixed(1)}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 inline-block" style={{ background: INTENSIDADE_COR[int] }} />
                        {INTENSIDADE_LABEL[int].split(' (')[0]}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-on-surface-variant">{r.pluviometro}</td>
                    <td className="px-4 py-2">{r.frentes.length ? r.frentes.join(', ') : '—'}</td>
                    <td className={`px-4 py-2 ${r.solo === 'impraticavel' ? 'text-error font-semibold' : ''}`}>{SOLO_LABEL[r.solo]}</td>
                    <td className="px-4 py-2 font-mono text-right">
                      {r.horasParadas > 0 ? `${r.horasParadas.toFixed(1)} h` : '—'}
                      {r.paralisacaoTotal && <span className="ml-1.5 px-1 bg-error text-on-error text-[9px] font-bold">TOTAL</span>}
                    </td>
                    <td className="px-4 py-2 font-mono text-primary">{r.rdo || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
