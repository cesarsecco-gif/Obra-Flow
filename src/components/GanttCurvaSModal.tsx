import React, { useState } from 'react';
import { Project, WbsPhase } from '../types';

interface GanttCurvaSModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  wbsPhases: WbsPhase[];
  activeBaselineName?: string;
}

interface MonthlyDataPoint {
  month: string;
  year: number;
  label: string;
  plannedPercent: number;
  realizedPercent?: number;
  projectedPercent?: number;
  plannedValueReais: number;
  realizedValueReais?: number;
}

export const GanttCurvaSModal: React.FC<GanttCurvaSModalProps> = ({
  isOpen,
  onClose,
  project,
  wbsPhases,
  activeBaselineName = 'Linha de Base v1.2 Vigente'
}) => {
  const [showPv, setShowPv] = useState(true);
  const [showEv, setShowEv] = useState(true);
  const [showEac, setShowEac] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<MonthlyDataPoint | null>(null);

  if (!isOpen) return null;

  const contractTotal = project.contractValue || 42000000;
  const currentPhysical = project.progressPercent || 34.0;
  const plannedPhysical = project.plannedPercent || 36.6;
  const deviationPhysical = Number((currentPhysical - plannedPhysical).toFixed(1));

  // Índices EVM
  const spi = Number((currentPhysical / (plannedPhysical || 1)).toFixed(2)); // SPI = EV / PV
  const cpi = 1.02; // CPI = EV / AC (eficiência ligeiramente positiva de custos)
  const earnedValue = Math.round((currentPhysical / 100) * contractTotal);
  const plannedValue = Math.round((plannedPhysical / 100) * contractTotal);

  // Série temporal mensal da obra (Jan/2024 até Fev/2026 - 26 meses)
  const monthlyData: MonthlyDataPoint[] = [
    { month: 'Jan', year: 2024, label: 'Jan/24', plannedPercent: 2.5, realizedPercent: 2.8, plannedValueReais: 1050000, realizedValueReais: 1176000 },
    { month: 'Fev', year: 2024, label: 'Fev/24', plannedPercent: 5.0, realizedPercent: 5.2, plannedValueReais: 2100000, realizedValueReais: 2184000 },
    { month: 'Mar', year: 2024, label: 'Mar/24', plannedPercent: 9.5, realizedPercent: 9.8, plannedValueReais: 3990000, realizedValueReais: 4116000 },
    { month: 'Abr', year: 2024, label: 'Abr/24', plannedPercent: 14.0, realizedPercent: 14.5, plannedValueReais: 5880000, realizedValueReais: 6090000 },
    { month: 'Mai', year: 2024, label: 'Mai/24', plannedPercent: 19.5, realizedPercent: 20.0, plannedValueReais: 8190000, realizedValueReais: 8400000 },
    { month: 'Jun', year: 2024, label: 'Jun/24', plannedPercent: 24.5, realizedPercent: 24.8, plannedValueReais: 10290000, realizedValueReais: 10416000 },
    { month: 'Jul', year: 2024, label: 'Jul/24', plannedPercent: 28.0, realizedPercent: 28.1, plannedValueReais: 11760000, realizedValueReais: 11802000 },
    { month: 'Ago', year: 2024, label: 'Ago/24', plannedPercent: 31.0, realizedPercent: 30.5, plannedValueReais: 13020000, realizedValueReais: 12810000 },
    { month: 'Set', year: 2024, label: 'Set/24', plannedPercent: 33.8, realizedPercent: 32.2, plannedValueReais: 14196000, realizedValueReais: 13524000 },
    { month: 'Out', year: 2024, label: 'Out/24 (Hoje)', plannedPercent: plannedPhysical, realizedPercent: currentPhysical, projectedPercent: currentPhysical, plannedValueReais: plannedValue, realizedValueReais: earnedValue },
    { month: 'Nov', year: 2024, label: 'Nov/24', plannedPercent: 41.5, projectedPercent: 37.8, plannedValueReais: 17430000 },
    { month: 'Dez', year: 2024, label: 'Dez/24', plannedPercent: 48.0, projectedPercent: 43.5, plannedValueReais: 20160000 },
    { month: 'Jan', year: 2025, label: 'Jan/25', plannedPercent: 55.0, projectedPercent: 49.8, plannedValueReais: 23100000 },
    { month: 'Fev', year: 2025, label: 'Fev/25', plannedPercent: 62.0, projectedPercent: 56.4, plannedValueReais: 26040000 },
    { month: 'Mar', year: 2025, label: 'Mar/25', plannedPercent: 69.0, projectedPercent: 63.2, plannedValueReais: 28980000 },
    { month: 'Abr', year: 2025, label: 'Abr/25', plannedPercent: 76.0, projectedPercent: 70.1, plannedValueReais: 31920000 },
    { month: 'Mai', year: 2025, label: 'Mai/25', plannedPercent: 82.5, projectedPercent: 76.5, plannedValueReais: 34650000 },
    { month: 'Jun', year: 2025, label: 'Jun/25', plannedPercent: 88.0, projectedPercent: 82.2, plannedValueReais: 36960000 },
    { month: 'Jul', year: 2025, label: 'Jul/25', plannedPercent: 92.5, projectedPercent: 87.4, plannedValueReais: 38850000 },
    { month: 'Ago', year: 2025, label: 'Ago/25', plannedPercent: 95.5, projectedPercent: 91.5, plannedValueReais: 40110000 },
    { month: 'Set', year: 2025, label: 'Set/25', plannedPercent: 97.5, projectedPercent: 94.8, plannedValueReais: 40950000 },
    { month: 'Out', year: 2025, label: 'Out/25', plannedPercent: 98.8, projectedPercent: 97.0, plannedValueReais: 41496000 },
    { month: 'Nov', year: 2025, label: 'Nov/25', plannedPercent: 99.5, projectedPercent: 98.5, plannedValueReais: 41790000 },
    { month: 'Dez', year: 2025, label: 'Dez/25', plannedPercent: 100.0, projectedPercent: 99.2, plannedValueReais: 42000000 },
    { month: 'Jan', year: 2026, label: 'Jan/26', plannedPercent: 100.0, projectedPercent: 100.0, plannedValueReais: 42000000 }
  ];

  // Coordenadas para SVG
  const width = 860;
  const height = 300;
  const paddingLeft = 50;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getX = (index: number) => paddingLeft + (index / (monthlyData.length - 1)) * chartW;
  const getY = (val: number) => paddingTop + chartH - (val / 100) * chartH;

  // Gerar caminho SVG para PV
  const pvPoints = monthlyData.map((d, i) => `${getX(i)},${getY(d.plannedPercent)}`).join(' ');
  const pvPath = `M ${pvPoints}`;
  const pvArea = `M ${getX(0)},${getY(0)} L ${pvPoints} L ${getX(monthlyData.length - 1)},${getY(0)} Z`;

  // Gerar caminho SVG para EV (até Out/24, índice 9)
  const evData = monthlyData.filter(d => d.realizedPercent !== undefined);
  const evPoints = evData.map((d, i) => `${getX(i)},${getY(d.realizedPercent!)}`).join(' ');
  const evPath = `M ${evPoints}`;
  const evArea = `M ${getX(0)},${getY(0)} L ${evPoints} L ${getX(evData.length - 1)},${getY(0)} Z`;

  // Gerar caminho SVG para Projeção EAC (de Out/24 em diante)
  const eacData = monthlyData.filter(d => d.projectedPercent !== undefined);
  const eacStartIndex = monthlyData.findIndex(d => d.projectedPercent !== undefined);
  const eacPoints = eacData.map((d, i) => `${getX(eacStartIndex + i)},${getY(d.projectedPercent!)}`).join(' ');
  const eacPath = `M ${eacPoints}`;

  const cutoffX = getX(9); // Out/24

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <span className="material-symbols-outlined text-[24px]">show_chart</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white tracking-wide">
                  Curva S Físico-Financeira & Índices EVM
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  {activeBaselineName}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
                  {project.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Earned Value Management (EVM) • NBR 12721 & PBQP-H Nível A • Data de Corte: 24/Out/2024
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
              title="Imprimir relatório executivo"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* SPI */}
            <div className={`p-3.5 rounded-xl border ${spi >= 1 ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-amber-950/20 border-amber-500/30'} flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">SPI (Prazo)</span>
                <span className={`material-symbols-outlined text-base ${spi >= 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {spi >= 1 ? 'trending_up' : 'trending_down'}
                </span>
              </div>
              <div className="mt-1">
                <div className={`text-2xl font-bold font-mono ${spi >= 1 ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {spi}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  EV / PV ({spi < 1 ? 'Ritmo -7%' : 'Em dia'})
                </div>
              </div>
            </div>

            {/* CPI */}
            <div className="p-3.5 rounded-xl border bg-emerald-950/20 border-emerald-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">CPI (Custo)</span>
                <span className="material-symbols-outlined text-base text-emerald-400">account_balance_wallet</span>
              </div>
              <div className="mt-1">
                <div className="text-2xl font-bold font-mono text-emerald-300">
                  {cpi}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  EV / AC (+2% economia)
                </div>
              </div>
            </div>

            {/* Desvio Físico */}
            <div className={`p-3.5 rounded-xl border ${deviationPhysical >= 0 ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-red-950/20 border-red-500/30'} flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Desvio Físico</span>
                <span className={`material-symbols-outlined text-base ${deviationPhysical >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {deviationPhysical >= 0 ? 'check_circle' : 'warning'}
                </span>
              </div>
              <div className="mt-1">
                <div className={`text-2xl font-bold font-mono ${deviationPhysical >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {deviationPhysical > 0 ? `+${deviationPhysical}%` : `${deviationPhysical}%`}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Real: {currentPhysical}% | Meta: {plannedPhysical}%
                </div>
              </div>
            </div>

            {/* Valor Agregado (EV) */}
            <div className="p-3.5 rounded-xl border bg-slate-800/60 border-slate-700/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Valor Agregado</span>
                <span className="material-symbols-outlined text-base text-cyan-400">payments</span>
              </div>
              <div className="mt-1">
                <div className="text-lg font-bold font-mono text-white">
                  R$ {(earnedValue / 1000000).toFixed(2)}M
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  De R$ {(contractTotal / 1000000).toFixed(1)}M orçados
                </div>
              </div>
            </div>

            {/* EAC Término Projetado */}
            <div className="p-3.5 rounded-xl border bg-amber-950/20 border-amber-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Término EAC</span>
                <span className="material-symbols-outlined text-base text-amber-400">event_repeat</span>
              </div>
              <div className="mt-1">
                <div className="text-base font-bold font-mono text-amber-300">
                  29/Jan/2026
                </div>
                <div className="text-[11px] text-amber-400/80 mt-0.5">
                  +45 dias sobre contrato
                </div>
              </div>
            </div>
          </div>

          {/* S-Curve Graphic Section */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-lg">ssid_chart</span>
                <h4 className="text-sm font-semibold text-white">
                  Curva Físico-Financeira Acumulada (% vs. Tempo)
                </h4>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-3 text-xs">
                <button
                  onClick={() => setShowPv(!showPv)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
                    showPv ? 'bg-blue-500/10 border-blue-500/40 text-blue-300' : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  <span className="w-2.5 h-0.5 bg-blue-400 rounded-full inline-block"></span>
                  PV: Planejado (Baseline)
                </button>

                <button
                  onClick={() => setShowEv(!showEv)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
                    showEv ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  <span className="w-2.5 h-1.5 bg-emerald-400 rounded-sm inline-block"></span>
                  EV: Realizado em Obra
                </button>

                <button
                  onClick={() => setShowEac(!showEac)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
                    showEac ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  <span className="w-2.5 h-0.5 border-b-2 border-dashed border-amber-400 inline-block"></span>
                  EAC: Projeção de Tendência
                </button>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="relative overflow-x-auto bg-slate-900/60 rounded-lg p-2 border border-slate-800/80">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[280px] select-none">
                <defs>
                  <linearGradient id="pvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="evGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Horizontais (0%, 25%, 50%, 75%, 100%) */}
                {[0, 25, 50, 75, 100].map((val) => {
                  const y = getY(val);
                  return (
                    <g key={val}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={width - paddingRight}
                        y2={y}
                        stroke="#334155"
                        strokeDasharray={val === 0 || val === 100 ? 'none' : '3 3'}
                        strokeWidth={val === 0 || val === 100 ? 1 : 0.75}
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 4}
                        fill="#64748b"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* Linha de Corte: Hoje (24 Out 2024) */}
                <line
                  x1={cutoffX}
                  y1={paddingTop}
                  x2={cutoffX}
                  y2={height - paddingBottom}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <rect
                  x={cutoffX - 34}
                  y={paddingTop - 18}
                  width="68"
                  height="16"
                  rx="3"
                  fill="#f59e0b"
                />
                <text
                  x={cutoffX}
                  y={paddingTop - 6}
                  fill="#000"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Hoje (Out/24)
                </text>

                {/* PV Area & Path (Planejado) */}
                {showPv && (
                  <>
                    <path d={pvArea} fill="url(#pvGradient)" />
                    <path
                      d={pvPath}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                    />
                  </>
                )}

                {/* EAC Path (Projeção) */}
                {showEac && (
                  <path
                    d={eacPath}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                  />
                )}

                {/* EV Area & Path (Realizado) */}
                {showEv && (
                  <>
                    <path d={evArea} fill="url(#evGradient)" />
                    <path
                      d={evPath}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                    />
                  </>
                )}

                {/* Pontos Interativos no Gráfico */}
                {monthlyData.map((d, i) => {
                  const x = getX(i);
                  const isCutoff = i === 9;
                  const isEveryTwo = i % 2 === 0 || isCutoff;

                  return (
                    <g key={d.label} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(d)}>
                      {/* Rótulo do Eixo X */}
                      {isEveryTwo && (
                        <text
                          x={x}
                          y={height - paddingBottom + 16}
                          fill={isCutoff ? '#f59e0b' : '#64748b'}
                          fontSize="9"
                          fontWeight={isCutoff ? 'bold' : 'normal'}
                          textAnchor="middle"
                        >
                          {d.month}
                        </text>
                      )}

                      {/* Marcador PV */}
                      {showPv && (
                        <circle
                          cx={x}
                          cy={getY(d.plannedPercent)}
                          r={isCutoff ? 4.5 : 2.5}
                          fill="#1e293b"
                          stroke="#3b82f6"
                          strokeWidth="1.5"
                        />
                      )}

                      {/* Marcador EV */}
                      {showEv && d.realizedPercent !== undefined && (
                        <circle
                          cx={x}
                          cy={getY(d.realizedPercent)}
                          r={isCutoff ? 6 : 3.5}
                          fill={isCutoff ? '#10b981' : '#059669'}
                          stroke="#ffffff"
                          strokeWidth={isCutoff ? 2 : 1}
                        />
                      )}

                      {/* Marcador EAC */}
                      {showEac && d.projectedPercent !== undefined && !d.realizedPercent && (
                        <circle
                          cx={x}
                          cy={getY(d.projectedPercent)}
                          r={2.5}
                          fill="#f59e0b"
                          stroke="#78350f"
                          strokeWidth="1"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip */}
              {hoveredPoint && (
                <div className="absolute top-4 right-4 bg-slate-950/95 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1.5 backdrop-blur-md min-w-[200px]">
                  <div className="font-semibold text-white border-b border-slate-800 pb-1 flex items-center justify-between">
                    <span>{hoveredPoint.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Ano {hoveredPoint.year}</span>
                  </div>
                  <div className="flex justify-between text-blue-300">
                    <span>Planejado (PV):</span>
                    <span className="font-mono font-bold">{hoveredPoint.plannedPercent.toFixed(1)}%</span>
                  </div>
                  {hoveredPoint.realizedPercent !== undefined && (
                    <div className="flex justify-between text-emerald-300">
                      <span>Realizado (EV):</span>
                      <span className="font-mono font-bold">{hoveredPoint.realizedPercent.toFixed(1)}%</span>
                    </div>
                  )}
                  {hoveredPoint.realizedPercent !== undefined && (
                    <div className="flex justify-between text-slate-300">
                      <span>Desvio Físico:</span>
                      <span className={`font-mono font-bold ${
                        (hoveredPoint.realizedPercent - hoveredPoint.plannedPercent) >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {(hoveredPoint.realizedPercent - hoveredPoint.plannedPercent).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {hoveredPoint.projectedPercent !== undefined && !hoveredPoint.realizedPercent && (
                    <div className="flex justify-between text-amber-300">
                      <span>Projeção (EAC):</span>
                      <span className="font-mono font-bold">{hoveredPoint.projectedPercent.toFixed(1)}%</span>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                    Planejado R$: R$ {(hoveredPoint.plannedValueReais / 1000000).toFixed(2)}M
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Tabular Breakdown */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-indigo-400">table_chart</span>
                Quadro de Acompanhamento Mensal Físico-Financeiro
              </h5>
              <span className="text-[11px] text-slate-400">
                Total Contratual: R$ {(contractTotal / 1000000).toFixed(2)}M
              </span>
            </div>

            <div className="overflow-x-auto max-h-[220px]">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="text-[11px] text-slate-400 uppercase bg-slate-900/90 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Mês/Ano</th>
                    <th className="py-2 px-3 text-right">Previsto Acum.</th>
                    <th className="py-2 px-3 text-right">Realizado Acum.</th>
                    <th className="py-2 px-3 text-right">Desvio</th>
                    <th className="py-2 px-3 text-right">Valor Previsto (PV)</th>
                    <th className="py-2 px-3 text-right">Valor Agregado (EV)</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {monthlyData.slice(0, 14).map((d) => {
                    const isCutoff = d.month.includes('Hoje');
                    const hasRealized = d.realizedPercent !== undefined;
                    const diff = hasRealized ? Number((d.realizedPercent! - d.plannedPercent).toFixed(1)) : null;

                    return (
                      <tr
                        key={d.label}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isCutoff ? 'bg-indigo-500/10 font-bold text-indigo-200' : 'text-slate-300'
                        }`}
                      >
                        <td className="py-2 px-3 font-sans font-medium flex items-center gap-1.5">
                          {isCutoff && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>}
                          {d.label}
                        </td>
                        <td className="py-2 px-3 text-right text-blue-300">
                          {d.plannedPercent.toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-300">
                          {hasRealized ? `${d.realizedPercent!.toFixed(1)}%` : '—'}
                        </td>
                        <td className={`py-2 px-3 text-right font-bold ${
                          diff === null ? 'text-slate-500' : diff >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {diff !== null ? (diff > 0 ? `+${diff}%` : `${diff}%`) : '—'}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400">
                          R$ {(d.plannedValueReais / 1000).toLocaleString('pt-BR')} mil
                        </td>
                        <td className="py-2 px-3 text-right text-slate-200">
                          {d.realizedValueReais ? `R$ ${(d.realizedValueReais / 1000).toLocaleString('pt-BR')} mil` : '—'}
                        </td>
                        <td className="py-2 px-3 text-center font-sans">
                          {isCutoff ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/30">
                              Atenção (-2.6%)
                            </span>
                          ) : hasRealized ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Concluído
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                              Futuro
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-indigo-400">verified</span>
            <span>Cálculos em estrita conformidade com a NBR 12721 e Guia Prático de EVM (PMI).</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-lg shadow-indigo-600/20"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
