import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { StorageService } from '../services/storageService';
import { comprimirImagem } from '../services/imageUtils';
import {
  RegistroChuva,
  Intensidade,
  CondicaoSolo,
  PLUVIOMETROS,
  FRENTES,
  LIMITE_PRATICABILIDADE_MM,
  NORMAL_CLIMATOLOGICA_MM,
  INTENSIDADE_LABEL,
  INTENSIDADE_COR,
  SOLO_LABEL,
  classificarIntensidade,
  rotuloMes,
  hojeIso,
  diasNoMes,
  mesesAnteriores,
  mesReferencia,
  resumir,
  formatarMm,
} from '../services/pluviometria';

type Periodo = { tipo: 'mes'; mes: string } | { tipo: 'intervalo'; de: string; ate: string };

function blobParaDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result as string);
    leitor.onerror = () => reject(leitor.error);
    leitor.readAsDataURL(blob);
  });
}

function numero(valor: string): number {
  return Number(valor.replace(',', '.'));
}

function baixarCsv(registros: RegistroChuva[], nomeArquivo: string) {
  const cab = ['Data', 'Início', 'Fim', 'mm', 'Intensidade', 'Pluviômetro', 'Frentes afetadas', 'Solo', 'Horas paradas', 'Paralisação total', 'RDO', 'Observações'];
  const linhas = registros.map(r => [
    r.data.split('-').reverse().join('/'),
    r.inicio,
    r.fim,
    String(r.mm).replace('.', ','),
    INTENSIDADE_LABEL[classificarIntensidade(r.mm)].split(' (')[0],
    r.pluviometro,
    r.frentes.join(' / '),
    SOLO_LABEL[r.solo],
    String(r.horasParadas).replace('.', ','),
    r.paralisacaoTotal ? 'Sim' : 'Não',
    r.rdo || '',
    (r.obs || '').replace(/\r?\n/g, ' '),
  ]);
  const csv = [cab, ...linhas].map(l => l.map(c => `"${c.replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}

export const PluviometriaView: React.FC = () => {
  const { activeProject, showToast } = useApp();

  const [registros, setRegistros] = useState<RegistroChuva[]>(() => StorageService.getRainRecords(activeProject.id));
  useEffect(() => {
    setRegistros(StorageService.getRainRecords(activeProject.id));
  }, [activeProject.id]);

  const persistir = (novos: RegistroChuva[]): boolean => {
    StorageService.setRainRecords(novos, activeProject.id);
    // safeSet engole erros de cota; confere se a gravação realmente aconteceu
    if (StorageService.getRainRecords(activeProject.id).length !== novos.length) {
      showToast('Não foi possível salvar: armazenamento local cheio. Remova fotos antigas ou exporte os dados.', 'error');
      return false;
    }
    setRegistros(novos);
    return true;
  };

  // ---- Filtros ----
  const mesesDisponiveis = useMemo(() => {
    const set = new Set(registros.map(r => r.data.slice(0, 7)));
    set.add(hojeIso().slice(0, 7));
    return [...set].sort().reverse();
  }, [registros]);

  const [periodo, setPeriodo] = useState<Periodo>(() => ({ tipo: 'mes', mes: mesReferencia(registros) }));
  const [filtroPluviometro, setFiltroPluviometro] = useState<string>('todos');
  const [filtroFrente, setFiltroFrente] = useState<string>('todas');
  const [filtroIntensidade, setFiltroIntensidade] = useState<Intensidade | 'todas'>('todas');
  const [apenasParalisacao, setApenasParalisacao] = useState(false);

  const [inicioPeriodo, fimPeriodo] = useMemo(() => {
    if (periodo.tipo === 'mes') return [`${periodo.mes}-01`, `${periodo.mes}-${String(diasNoMes(periodo.mes)).padStart(2, '0')}`];
    return periodo.de <= periodo.ate ? [periodo.de, periodo.ate] : [periodo.ate, periodo.de];
  }, [periodo]);

  const filtrados = useMemo(() => registros
    .filter(r =>
      r.data >= inicioPeriodo && r.data <= fimPeriodo &&
      (filtroPluviometro === 'todos' || r.pluviometro === filtroPluviometro) &&
      (filtroFrente === 'todas' || r.frentes.includes(filtroFrente)) &&
      (filtroIntensidade === 'todas' || classificarIntensidade(r.mm) === filtroIntensidade) &&
      (!apenasParalisacao || r.horasParadas > 0 || r.paralisacaoTotal))
    .sort((a, b) => (a.data + a.inicio).localeCompare(b.data + b.inicio)),
  [registros, inicioPeriodo, fimPeriodo, filtroPluviometro, filtroFrente, filtroIntensidade, apenasParalisacao]);

  const resumo = useMemo(() => resumir(filtrados), [filtrados]);

  // Dias do período (para o gráfico diário e dias decorridos)
  const diasPeriodo = useMemo(() => {
    const dias: string[] = [];
    const d = new Date(`${inicioPeriodo}T12:00:00`);
    const fim = new Date(`${fimPeriodo}T12:00:00`);
    while (d <= fim && dias.length < 366) {
      dias.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      d.setDate(d.getDate() + 1);
    }
    return dias;
  }, [inicioPeriodo, fimPeriodo]);

  const hoje = hojeIso();
  const diasDecorridos = diasPeriodo.filter(d => d <= hoje).length || diasPeriodo.length;

  const normalPeriodo = useMemo(() => {
    if (periodo.tipo !== 'mes') return null;
    return NORMAL_CLIMATOLOGICA_MM[Number(periodo.mes.slice(5, 7)) - 1];
  }, [periodo]);

  const porDia = useMemo(() => {
    const mapa = new Map<string, { mm: number; total: boolean }>();
    filtrados.forEach(r => {
      const atual = mapa.get(r.data) || { mm: 0, total: false };
      mapa.set(r.data, { mm: atual.mm + r.mm, total: atual.total || r.paralisacaoTotal });
    });
    return diasPeriodo.map(d => ({ data: d, mm: mapa.get(d)?.mm || 0, total: mapa.get(d)?.total || false }));
  }, [filtrados, diasPeriodo]);

  // Histórico de 12 meses até o fim do período (respeita pluviômetro e frente, ignora intensidade)
  const historico = useMemo(() => mesesAnteriores(fimPeriodo.slice(0, 7), 12).map(mes => ({
    mes,
    real: registros
      .filter(r => r.data.startsWith(mes) &&
        (filtroPluviometro === 'todos' || r.pluviometro === filtroPluviometro) &&
        (filtroFrente === 'todas' || r.frentes.includes(filtroFrente)))
      .reduce((s, r) => s + r.mm, 0),
    normal: NORMAL_CLIMATOLOGICA_MM[Number(mes.slice(5, 7)) - 1],
  })), [registros, fimPeriodo, filtroPluviometro, filtroFrente]);

  const distribuicao = useMemo(() => {
    const base: Record<Intensidade, number> = { fraca: 0, moderada: 0, forte: 0, muito_forte: 0 };
    filtrados.forEach(r => { base[classificarIntensidade(r.mm)] += 1; });
    return base;
  }, [filtrados]);

  const soloAtual = useMemo(() => resumir(registros).soloAtual, [registros]);

  // ---- Formulário ----
  const [fData, setFData] = useState(hoje);
  const [fInicio, setFInicio] = useState('');
  const [fFim, setFFim] = useState('');
  const [fMm, setFMm] = useState('');
  const [fPluviometro, setFPluviometro] = useState(PLUVIOMETROS[0]);
  const [fSolo, setFSolo] = useState<CondicaoSolo>('tratavel');
  const [fFrentes, setFFrentes] = useState<string[]>([]);
  const [fHoras, setFHoras] = useState('');
  const [fTotal, setFTotal] = useState(false);
  const [fObs, setFObs] = useState('');
  const [fFoto, setFFoto] = useState<string | undefined>();
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const inputFotoRef = useRef<HTMLInputElement>(null);
  const [fotoAberta, setFotoAberta] = useState<string | null>(null);

  const mmDigitado = numero(fMm);

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    setProcessandoFoto(true);
    try {
      const blob = await comprimirImagem(arquivo, 800, 0.6);
      setFFoto(await blobParaDataUrl(blob));
    } catch {
      showToast('Não foi possível processar a foto.', 'error');
    } finally {
      setProcessandoFoto(false);
    }
  };

  const limparFormulario = () => {
    setFMm(''); setFInicio(''); setFFim(''); setFHoras(''); setFTotal(false);
    setFFrentes([]); setFObs(''); setFFoto(undefined); setFSolo('tratavel');
  };

  const salvarRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fData) return showToast('Informe a data do registro.', 'error');
    if (fData > hoje) return showToast('A data não pode ser futura.', 'error');
    if (!(mmDigitado > 0) || mmDigitado > 500) return showToast('Informe uma leitura válida do pluviômetro (mm).', 'error');
    if (fInicio && fFim && fFim < fInicio) return showToast('O horário final deve ser depois do inicial.', 'error');
    const horas = fHoras ? numero(fHoras) : 0;
    if (!(horas >= 0) || horas > 24) return showToast('Horas paralisadas devem estar entre 0 e 24.', 'error');

    const novo: RegistroChuva = {
      id: crypto.randomUUID(),
      data: fData,
      inicio: fInicio,
      fim: fFim,
      mm: Math.round(mmDigitado * 10) / 10,
      pluviometro: fPluviometro,
      frentes: fFrentes,
      solo: fSolo,
      horasParadas: horas,
      paralisacaoTotal: fTotal,
      rdo: fData === hoje && activeProject.rdoNumber ? `RDO-${activeProject.rdoNumber}` : undefined,
      obs: fObs.trim() || undefined,
      fotoDataUrl: fFoto,
      criadoEm: new Date().toISOString(),
    };
    if (persistir([...registros, novo])) {
      showToast(`Registro de ${formatarMm(novo.mm)} mm salvo em ${fData.split('-').reverse().join('/')}.`, 'success');
      limparFormulario();
      const mes = fData.slice(0, 7);
      if (periodo.tipo === 'mes' && periodo.mes !== mes) setPeriodo({ tipo: 'mes', mes });
    }
  };

  const excluirRegistro = (r: RegistroChuva) => {
    if (!window.confirm(`Excluir o registro de ${formatarMm(r.mm)} mm de ${r.data.split('-').reverse().join('/')}?`)) return;
    if (persistir(registros.filter(x => x.id !== r.id))) showToast('Registro excluído.', 'info');
  };

  const exportarCsv = () => {
    if (filtrados.length === 0) return showToast('Nenhum registro no filtro atual para exportar.', 'warning');
    baixarCsv(filtrados, `pluviometria_${activeProject.code}_${inicioPeriodo}_a_${fimPeriodo}.csv`);
  };

  // ---- Geometria dos gráficos ----
  const W = 760, H = 220, PAD_L = 34, PAD_B = 24, PAD_T = 14;
  const maxMmDia = Math.max(20, ...porDia.map(d => d.mm)) * 1.08;
  const barW = (W - PAD_L - 8) / Math.max(1, porDia.length);
  const yDia = (mm: number) => PAD_T + (H - PAD_T - PAD_B) * (1 - mm / maxMmDia);
  const passoRotulo = porDia.length > 62 ? 14 : porDia.length > 31 ? 3 : 1;
  const ticksDia = [0, 5, 10, 15, 20, 30, 40, 60, 80, 100].filter(v => v <= maxMmDia);

  const W2 = 520, H2 = 230;
  const maxMes = Math.max(50, ...historico.map(m => Math.max(m.real, m.normal))) * 1.1;
  const colW = (W2 - PAD_L - 8) / historico.length;
  const yMes = (mm: number) => PAD_T + (H2 - PAD_T - PAD_B) * (1 - mm / maxMes);
  const passoTickMes = maxMes > 250 ? 100 : 50;
  const ticksMes = Array.from({ length: Math.floor(maxMes / passoTickMes) + 1 }, (_, i) => i * passoTickMes);
  const normalPath = historico.map((m, i) => `${i === 0 ? 'M' : 'L'}${PAD_L + colW * i + colW / 2},${yMes(m.normal)}`).join(' ');

  const totalDistrib = Object.values(distribuicao).reduce((a, b) => a + b, 0) || 1;
  const rotuloPeriodo = periodo.tipo === 'mes'
    ? rotuloMes(periodo.mes)
    : `${inicioPeriodo.split('-').reverse().join('/')} a ${fimPeriodo.split('-').reverse().join('/')}`;

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
        <div className="flex flex-wrap gap-2 no-print">
          <button type="button" onClick={exportarCsv} className="flex items-center gap-2 px-3 py-2 text-xs bg-surface-container-low hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-base">download</span> Exportar CSV
          </button>
          <button type="button" onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 text-xs bg-surface-container-low hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-base">print</span> Imprimir Relatório
          </button>
        </div>
      </section>

      {/* Filtros */}
      <section className="bg-surface-container-low p-4 shadow-sm flex flex-wrap items-end gap-4 no-print">
        <div>
          <span className={labelCls}>Período</span>
          <select
            className="bg-surface px-3 py-2 text-xs min-w-[150px]"
            value={periodo.tipo === 'mes' ? periodo.mes : 'intervalo'}
            onChange={e => {
              const v = e.target.value;
              if (v === 'intervalo') setPeriodo({ tipo: 'intervalo', de: inicioPeriodo, ate: fimPeriodo });
              else setPeriodo({ tipo: 'mes', mes: v });
            }}
          >
            {mesesDisponiveis.map(m => <option key={m} value={m}>{rotuloMes(m)}</option>)}
            <option value="intervalo">Intervalo personalizado…</option>
          </select>
        </div>
        {periodo.tipo === 'intervalo' && (
          <div className="flex items-end gap-2">
            <div>
              <span className={labelCls}>De</span>
              <input type="date" value={periodo.de} onChange={e => setPeriodo({ ...periodo, de: e.target.value })} className="bg-surface px-3 py-1.5 text-xs" />
            </div>
            <div>
              <span className={labelCls}>Até</span>
              <input type="date" value={periodo.ate} onChange={e => setPeriodo({ ...periodo, ate: e.target.value })} className="bg-surface px-3 py-1.5 text-xs" />
            </div>
          </div>
        )}
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
          {
            label: periodo.tipo === 'mes' ? 'Acumulado no Mês' : 'Acumulado no Período',
            valor: formatarMm(resumo.acumuladoMm), un: 'mm',
            sub: normalPeriodo ? `Normal climatológica: ${normalPeriodo} mm (${Math.round(resumo.acumuladoMm / normalPeriodo * 100)}%)` : rotuloPeriodo,
            icon: 'water_drop', erro: false,
          },
          { label: 'Dias com Chuva', valor: `${resumo.diasChuva}`, un: `/ ${diasDecorridos} dias`, sub: `${Math.round(resumo.diasChuva / diasDecorridos * 100)}% dos dias decorridos`, icon: 'rainy', erro: false },
          { label: 'Paralisação Total', valor: `${resumo.diasParalisacaoTotal}`, un: resumo.diasParalisacaoTotal === 1 ? 'dia' : 'dias', sub: 'Dias impraticáveis para pleito de prazo', icon: 'block', erro: resumo.diasParalisacaoTotal > 0 },
          { label: 'Horas Impactadas', valor: formatarMm(resumo.horasParadas), un: 'h', sub: 'Soma das horas paralisadas nas frentes', icon: 'schedule', erro: resumo.horasParadas > 0 },
          { label: 'Maior Chuva Diária', valor: formatarMm(resumo.maiorChuvaDiaMm), un: 'mm', sub: `Limite de praticabilidade: ${LIMITE_PRATICABILIDADE_MM} mm`, icon: 'thunderstorm', erro: resumo.maiorChuvaDiaMm > LIMITE_PRATICABILIDADE_MM },
        ].map(k => (
          <div key={k.label} className="bg-surface-container-low p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">{k.label}</span>
              <span className={`material-symbols-outlined text-base ${k.erro ? 'text-error' : 'text-primary'}`}>{k.icon}</span>
            </div>
            <div className="flex items-baseline gap-1.5 my-2">
              <span className={`text-3xl font-semibold tracking-tight ${k.erro ? 'text-error' : 'text-on-surface'}`}>{k.valor}</span>
              <span className="text-sm text-on-surface-variant">{k.un}</span>
            </div>
            <span className="text-[11px] text-on-surface-variant">{k.sub}</span>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Coluna de gráficos */}
        <div className="xl:col-span-2 space-y-6 min-w-0">
          {/* Gráfico diário */}
          <section className="bg-surface-container-low p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div>
                <h2 className="text-sm font-semibold text-on-surface">Precipitação Diária — {rotuloPeriodo}</h2>
                <span className="text-[11px] text-on-surface-variant">Barras vermelhas indicam dia com paralisação total</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-on-surface-variant">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-primary inline-block" /> Chuva</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-error inline-block" /> Paralisação total</span>
                <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-dashed border-[#b28600] inline-block" /> Limite {LIMITE_PRATICABILIDADE_MM} mm</span>
              </div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[240px]">
              {ticksDia.map(v => (
                <g key={v}>
                  <line x1={PAD_L} x2={W - 8} y1={yDia(v)} y2={yDia(v)} stroke="#e0e0e0" />
                  <text x={PAD_L - 6} y={yDia(v) + 3} fontSize="9" textAnchor="end" fill="#525252">{v}</text>
                </g>
              ))}
              {porDia.map((d, i) => {
                const dia = Number(d.data.slice(8, 10));
                const ehHoje = d.data === hoje;
                const gap = barW > 8 ? 3 : 0.5;
                return (
                  <g key={d.data}>
                    {ehHoje && <rect x={PAD_L + barW * i} y={PAD_T} width={barW} height={H - PAD_T - PAD_B} fill="#d0e2ff" opacity="0.5" />}
                    {d.mm > 0 && (
                      <>
                        <rect x={PAD_L + barW * i + gap} y={yDia(d.mm)} width={Math.max(1, barW - gap * 2)} height={yDia(0) - yDia(d.mm)} fill={d.total ? '#da1e28' : '#0f62fe'}>
                          <title>{`${d.data.split('-').reverse().join('/')}: ${formatarMm(d.mm)} mm`}</title>
                        </rect>
                        {barW > 14 && (
                          <text x={PAD_L + barW * i + barW / 2} y={yDia(d.mm) - 3} fontSize="8.5" textAnchor="middle" fill="#161616" fontWeight="600">{formatarMm(d.mm)}</text>
                        )}
                      </>
                    )}
                    {(i % passoRotulo === 0) && (
                      <text x={PAD_L + barW * i + barW / 2} y={H - 8} fontSize="8.5" textAnchor="middle" fill={ehHoje ? '#0f62fe' : '#525252'} fontWeight={ehHoje ? '700' : '400'}>
                        {passoRotulo > 1 ? `${dia}/${d.data.slice(5, 7)}` : dia}
                      </text>
                    )}
                  </g>
                );
              })}
              <line x1={PAD_L} x2={W - 8} y1={yDia(LIMITE_PRATICABILIDADE_MM)} y2={yDia(LIMITE_PRATICABILIDADE_MM)} stroke="#b28600" strokeWidth="1.5" strokeDasharray="5 4" />
            </svg>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Histórico mensal x normal */}
            <section className="xl:col-span-2 bg-surface-container-low p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <h2 className="text-sm font-semibold text-on-surface">Acumulado Mensal x Normal Climatológica</h2>
                  <span className="text-[11px] text-on-surface-variant">12 meses até {rotuloMes(fimPeriodo.slice(0, 7))}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-on-surface-variant">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#78a9ff] inline-block" /> Abaixo</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#0043ce] inline-block" /> Acima</span>
                  <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-on-surface inline-block" /> Normal</span>
                </div>
              </div>
              <svg viewBox={`0 0 ${W2} ${H2}`} className="w-full h-[220px]">
                {ticksMes.map(v => (
                  <g key={v}>
                    <line x1={PAD_L} x2={W2 - 8} y1={yMes(v)} y2={yMes(v)} stroke="#e0e0e0" />
                    <text x={PAD_L - 6} y={yMes(v) + 3} fontSize="9" textAnchor="end" fill="#525252">{v}</text>
                  </g>
                ))}
                {historico.map((m, i) => (
                  <g key={m.mes}>
                    {m.real > 0 && (
                      <rect x={PAD_L + colW * i + colW * 0.2} y={yMes(m.real)} width={colW * 0.6} height={yMes(0) - yMes(m.real)} fill={m.real > m.normal ? '#0043ce' : '#78a9ff'}>
                        <title>{`${rotuloMes(m.mes)}: ${formatarMm(m.real)} mm (normal ${m.normal} mm)`}</title>
                      </rect>
                    )}
                    <text x={PAD_L + colW * i + colW / 2} y={H2 - 8} fontSize="9" textAnchor="middle" fill="#525252">{rotuloMes(m.mes, true)}</text>
                  </g>
                ))}
                <path d={normalPath} fill="none" stroke="#161616" strokeWidth="1.5" />
                {historico.map((m, i) => (
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
                Condição do solo (último registro):{' '}
                <span className={`font-semibold ${soloAtual === 'impraticavel' ? 'text-error' : 'text-on-surface'}`}>{soloAtual ? SOLO_LABEL[soloAtual] : '—'}</span>
              </div>
            </section>
          </div>
        </div>

        {/* Formulário de registro */}
        <section className="bg-surface-container-low p-4 shadow-sm h-fit border-t-4 border-primary no-print">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">add_circle</span>
            <h2 className="text-sm font-semibold text-on-surface">Novo Registro Pluviométrico</h2>
          </div>
          <form onSubmit={salvarRegistro} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-3 sm:col-span-1">
                <label className={labelCls}>Data</label>
                <input type="date" max={hoje} value={fData} onChange={e => setFData(e.target.value)} className={inputCls} />
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
                <input inputMode="decimal" required placeholder="Ex: 12,5" value={fMm} onChange={e => setFMm(e.target.value)} className={`${inputCls} font-mono text-sm`} />
                {mmDigitado > 0 && (
                  <span className={`text-[10px] font-semibold ${mmDigitado > LIMITE_PRATICABILIDADE_MM ? 'text-error' : 'text-primary'}`}>
                    {INTENSIDADE_LABEL[classificarIntensidade(mmDigitado)]}
                    {mmDigitado > LIMITE_PRATICABILIDADE_MM && ' • acima do limite'}
                  </span>
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
            <input ref={inputFotoRef} type="file" accept="image/*" capture="environment" onChange={handleFoto} className="hidden" />
            <div className="flex items-center gap-2 bg-surface px-3 py-2 text-[11px] text-on-surface-variant">
              {fFoto
                ? <img src={fFoto} alt="Foto do pluviômetro" className="w-10 h-10 object-cover" />
                : <span className="material-symbols-outlined text-base">photo_camera</span>}
              {processandoFoto ? 'Comprimindo foto…' : fFoto ? 'Foto anexada' : 'Foto do pluviômetro (opcional)'}
              {fFoto && (
                <button type="button" onClick={() => setFFoto(undefined)} className="text-error font-semibold">Remover</button>
              )}
              <button type="button" onClick={() => inputFotoRef.current?.click()} className="ml-auto text-primary font-semibold">
                {fFoto ? 'Trocar' : 'Anexar'}
              </button>
            </div>
            {fData === hoje && activeProject.rdoNumber && (
              <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">link</span>
                Será vinculado ao RDO-{activeProject.rdoNumber} do dia
              </div>
            )}
            <button type="submit" disabled={processandoFoto} className="w-full py-3 bg-primary text-on-primary text-xs font-bold hover:bg-[#0353e9] disabled:opacity-50">
              Salvar Registro
            </button>
          </form>
        </section>
      </div>

      {/* Tabela de registros */}
      <section className="bg-surface-container-low shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-sm font-semibold text-on-surface">Registros do Período</h2>
          <span className="text-[11px] text-on-surface-variant">{filtrados.length} registros • {rotuloPeriodo}</span>
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
                <th className="px-4 py-2 no-print"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr className="bg-surface">
                  <td colSpan={10} className="px-4 py-8 text-center text-on-surface-variant">
                    Nenhum registro de chuva neste período e filtro.
                  </td>
                </tr>
              )}
              {filtrados.map(r => {
                const int = classificarIntensidade(r.mm);
                return (
                  <tr key={r.id} className={`border-t border-surface-container-high ${r.paralisacaoTotal ? 'bg-error-container' : 'bg-surface'}`} title={r.obs || undefined}>
                    <td className="px-4 py-2 font-mono">{r.data.split('-').reverse().join('/')}</td>
                    <td className="px-4 py-2 font-mono text-on-surface-variant">{r.inicio && r.fim ? `${r.inicio}–${r.fim}` : r.inicio || '—'}</td>
                    <td className="px-4 py-2 font-mono font-semibold text-right">{formatarMm(r.mm)}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 inline-block" style={{ background: INTENSIDADE_COR[int] }} />
                        {INTENSIDADE_LABEL[int].split(' (')[0]}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-on-surface-variant">{r.pluviometro}</td>
                    <td className="px-4 py-2">{r.frentes.length ? r.frentes.join(', ') : '—'}</td>
                    <td className={`px-4 py-2 ${r.solo === 'impraticavel' ? 'text-error font-semibold' : ''}`}>{SOLO_LABEL[r.solo]}</td>
                    <td className="px-4 py-2 font-mono text-right whitespace-nowrap">
                      {r.horasParadas > 0 ? `${formatarMm(r.horasParadas)} h` : '—'}
                      {r.paralisacaoTotal && <span className="ml-1.5 px-1 bg-error text-on-error text-[9px] font-bold">TOTAL</span>}
                    </td>
                    <td className="px-4 py-2 font-mono text-primary">{r.rdo || '—'}</td>
                    <td className="px-2 py-2 no-print whitespace-nowrap text-right">
                      {r.obs && <span className="material-symbols-outlined text-base text-on-surface-variant align-middle" title={r.obs}>notes</span>}
                      {r.fotoDataUrl && (
                        <button type="button" onClick={() => setFotoAberta(r.fotoDataUrl!)} className="p-1 text-primary" title="Ver foto do pluviômetro">
                          <span className="material-symbols-outlined text-base align-middle">photo_camera</span>
                        </button>
                      )}
                      <button type="button" onClick={() => excluirRegistro(r)} className="p-1 text-on-surface-variant hover:text-error" title="Excluir registro">
                        <span className="material-symbols-outlined text-base align-middle">delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {fotoAberta && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setFotoAberta(null)}>
          <img src={fotoAberta} alt="Foto do pluviômetro" className="max-w-full max-h-[85vh] shadow-lg" />
        </div>
      )}
    </div>
  );
};
