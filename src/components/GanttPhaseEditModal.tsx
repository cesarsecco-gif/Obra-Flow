import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { WbsPhase } from '../types';

interface GanttPhaseEditModalProps {
  phase: WbsPhase | null;
  onClose: () => void;
}

const MONTH_MAP: Record<string, number> = {
  jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
  jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11
};

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export interface EvmMetrics {
  expectedPercent: number;
  totalDays: number;
  elapsedDays: number;
  deviationDays: number;
  deviationPercent: number;
  recommendedStatus: WbsPhase['status'];
  statusLabel: string;
}

export function parsePeriodDates(periodStr: string): { start: Date; end: Date } | null {
  try {
    const cleaned = periodStr.split('(')[0].trim();
    const parts = cleaned.split('-').map(s => s.trim());
    if (parts.length < 2) return null;

    const parsePtDate = (str: string): Date | null => {
      const match = str.match(/(\d{1,2})\/([A-Za-zç]{3})\/(\d{2,4})/);
      if (!match) return null;
      const day = parseInt(match[1], 10);
      const monthKey = match[2].toLowerCase();
      let year = parseInt(match[3], 10);
      if (year < 100) year += 2000;
      const month = MONTH_MAP[monthKey] ?? 0;
      return new Date(year, month, day);
    };

    const start = parsePtDate(parts[0]);
    const end = parsePtDate(parts[1]);
    if (start && end) return { start, end };
    return null;
  } catch {
    return null;
  }
}

function dateToIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function calculateEvmMetrics(
  periodStr: string, 
  currentProgress: number,
  refDate: Date = new Date(2024, 9, 24) // 24 de Outubro de 2024 (Data de corte atual da obra)
): EvmMetrics {
  const dates = parsePeriodDates(periodStr);
  
  if (!dates || dates.end <= dates.start) {
    const totalDays = 180;
    const expectedPercent = 70.0;
    const deviationPercent = Number((currentProgress - expectedPercent).toFixed(1));
    const deviationDays = Math.round((deviationPercent / 100) * totalDays);
    const recommendedStatus: WbsPhase['status'] = currentProgress >= 100 
      ? 'concluido' 
      : deviationDays < -3 
        ? 'atrasado' 
        : currentProgress === 0 
          ? 'nao_iniciado' 
          : 'em_andamento';

    return {
      expectedPercent,
      totalDays,
      elapsedDays: 120,
      deviationDays,
      deviationPercent,
      recommendedStatus,
      statusLabel: recommendedStatus === 'atrasado' ? 'Atrasado (Caminho Crítico)' : recommendedStatus === 'concluido' ? 'Concluído' : 'No Prazo'
    };
  }

  const { start, end } = dates;
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / msPerDay));
  
  let elapsedDays = Math.round((refDate.getTime() - start.getTime()) / msPerDay);
  if (elapsedDays < 0) elapsedDays = 0;
  if (elapsedDays > totalDays) elapsedDays = totalDays;

  let expectedPercent = Number(((elapsedDays / totalDays) * 100).toFixed(1));
  if (refDate > end) expectedPercent = 100;
  if (refDate < start) expectedPercent = 0;

  const deviationPercent = Number((currentProgress - expectedPercent).toFixed(1));
  let deviationDays = Math.round((deviationPercent / 100) * totalDays);

  let recommendedStatus: WbsPhase['status'] = 'em_andamento';
  if (currentProgress >= 100) {
    recommendedStatus = 'concluido';
    deviationDays = Math.max(0, deviationDays);
  } else if (currentProgress <= 0 && refDate <= start) {
    recommendedStatus = 'nao_iniciado';
    deviationDays = 0;
  } else if (deviationDays < -3) {
    recommendedStatus = 'atrasado';
  } else {
    recommendedStatus = 'em_andamento';
  }

  return {
    expectedPercent,
    totalDays,
    elapsedDays,
    deviationDays,
    deviationPercent,
    recommendedStatus,
    statusLabel: recommendedStatus === 'atrasado' 
      ? 'Atrasado (Caminho Crítico)' 
      : recommendedStatus === 'concluido' 
        ? 'Concluído (100%)' 
        : recommendedStatus === 'nao_iniciado'
          ? 'Não Iniciado'
          : 'Em Andamento (No Prazo)'
  };
}

export const GanttPhaseEditModal: React.FC<GanttPhaseEditModalProps> = ({ phase, onClose }) => {
  const { updateWbsPhase, deleteWbsPhase, activeProject, wbsPhases } = useApp();

  const [activeTab, setActiveTab] = useState<'medicao' | 'linha_base'>('medicao');

  // Estado de Medição & EVM
  const [progress, setProgress] = useState<number>(phase?.progressPercent || 0);
  const [isAutoEvm, setIsAutoEvm] = useState<boolean>(true);
  const [status, setStatus] = useState<WbsPhase['status']>(phase?.status || 'em_andamento');
  const [delayDays, setDelayDays] = useState<number>(phase?.delayDays || 0);
  const [notes, setNotes] = useState<string>(phase?.notes || '');

  // Estado de Linha de Base (Baseline & EAP)
  const [phaseName, setPhaseName] = useState<string>(phase?.name || '');
  const [weightPercent, setWeightPercent] = useState<number>(phase?.weightPercent || 10);
  const [isCritical, setIsCritical] = useState<boolean>(phase?.isCritical || false);
  const [milestoneCode, setMilestoneCode] = useState<string>(phase?.milestoneCode || '');
  const [contractor, setContractor] = useState<string>(phase?.contractor || '');
  const [startDateIso, setStartDateIso] = useState<string>('2024-07-01');
  const [endDateIso, setEndDateIso] = useState<string>('2025-01-15');
  const [dependencies, setDependencies] = useState<string[]>(phase?.dependencies || []);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Sincroniza estado quando a etapa muda
  useEffect(() => {
    if (phase) {
      setProgress(phase.progressPercent);
      setNotes(phase.notes || '');
      setIsAutoEvm(true);
      setPhaseName(phase.name);
      setWeightPercent(phase.weightPercent);
      setIsCritical(phase.isCritical);
      setMilestoneCode(phase.milestoneCode || '');
      setContractor(phase.contractor || '');
      setDependencies(phase.dependencies || []);
      setIsDeleting(false);


      const parsedDates = parsePeriodDates(phase.period);
      if (parsedDates) {
        setStartDateIso(dateToIso(parsedDates.start));
        setEndDateIso(dateToIso(parsedDates.end));
      } else if (phase.baselineStart && phase.baselineEnd) {
        setStartDateIso(phase.baselineStart);
        setEndDateIso(phase.baselineEnd);
      }

      const metrics = calculateEvmMetrics(phase.period, phase.progressPercent);
      setStatus(metrics.recommendedStatus);
      setDelayDays(metrics.deviationDays);
    }
  }, [phase]);

  // Período formatado dinamicamente caso as datas de início e fim sejam alteradas
  const computedPeriod = useMemo(() => {
    const sParts = startDateIso.split('-');
    const eParts = endDateIso.split('-');
    if (sParts.length === 3 && eParts.length === 3) {
      const sDay = sParts[2];
      const sMon = MONTH_NAMES[parseInt(sParts[1], 10) - 1] || 'Jan';
      const sYr = sParts[0].slice(2);
      const eDay = eParts[2];
      const eMon = MONTH_NAMES[parseInt(eParts[1], 10) - 1] || 'Jan';
      const eYr = eParts[0].slice(2);
      return `${sDay}/${sMon}/${sYr} - ${eDay}/${eMon}/${eYr}`;
    }
    return phase?.period || '';
  }, [startDateIso, endDateIso, phase]);

  // Métricas calculadas pelo motor EVM usando o período atualizado
  const evm = useMemo(() => {
    if (!phase) return null;
    return calculateEvmMetrics(computedPeriod, progress);
  }, [phase, computedPeriod, progress]);

  // Quando o slider se move no modo automático, recalcula Status e Desvio em Dias sozinho
  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    if (isAutoEvm && phase) {
      const metrics = calculateEvmMetrics(computedPeriod, newProgress);
      setStatus(metrics.recommendedStatus);
      setDelayDays(metrics.deviationDays);
    }
  };

  if (!phase) return null;

  const handleSave = () => {
    const finalDelay = isAutoEvm && evm ? evm.deviationDays : Number(delayDays);
    const delaySuffix = finalDelay !== 0 ? ` (${finalDelay > 0 ? `+${finalDelay}d adiantado` : `${finalDelay}d atraso`})` : '';
    const finalPeriod = `${computedPeriod}${delaySuffix}`;

    updateWbsPhase(phase.id, {
      name: phaseName.trim() || phase.name,
      progressPercent: Number(progress),
      weightPercent: Number(weightPercent),
      isCritical,
      milestoneCode: milestoneCode.trim() ? milestoneCode.trim().toUpperCase() : undefined,
      contractor: contractor.trim() || undefined,
      period: finalPeriod,
      baselineStart: startDateIso,
      baselineEnd: endDateIso,
      status: isAutoEvm && evm ? evm.recommendedStatus : (progress >= 100 ? 'concluido' : status),
      delayDays: finalDelay,
      dependencies,
      notes
    });
    onClose();
  };


  const handleDelete = () => {
    deleteWbsPhase(phase.id);
    onClose();
  };

  const isDelay = delayDays < -3;
  const isAhead = delayDays > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface max-w-xl w-full p-6 shadow-2xl border border-surface-container-high my-auto animate-fadeIn font-body">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-surface-container-high">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">
                {activeTab === 'medicao' ? 'speed' : 'tune'}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary font-mono">
                {activeTab === 'medicao' ? 'Lançamento de Medição & EVM' : 'Configuração de Linha de Base (Baseline)'}
              </span>
            </div>
            <h2 className="text-base font-bold text-on-surface mt-1">{phaseName || phase.name}</h2>
            <p className="text-xs text-on-surface-variant font-mono">
              Empreendimento: {activeProject.name} • Peso EAP: <strong>{weightPercent}%</strong>
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-surface-container-high pt-3 pb-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('medicao')}
            className={`px-3 py-1.5 font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'medicao' 
                ? 'bg-primary text-on-primary shadow-xs' 
                : 'text-on-surface-variant hover:text-on-surface bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-sm">speed</span>
            <span>1. Medição &amp; EVM em Tempo Real</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('linha_base')}
            className={`px-3 py-1.5 font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'linha_base' 
                ? 'bg-primary text-on-primary shadow-xs' 
                : 'text-on-surface-variant hover:text-on-surface bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-sm">settings_suggest</span>
            <span>2. Configurar Linha de Base</span>
          </button>
        </div>

        {/* Tab Content: 1. Medição & EVM */}
        {activeTab === 'medicao' && (
          <div className="space-y-4 py-4 text-xs">
            {/* Card de Inteligência EVM / Linha de Base */}
            {evm && (
              <div className="p-3 bg-surface-container-low border border-surface-container-high space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">analytics</span>
                    Linha de Base &amp; Cronograma Planejado
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-semibold text-primary">
                    <input
                      type="checkbox"
                      checked={isAutoEvm}
                      onChange={e => {
                        setIsAutoEvm(e.target.checked);
                        if (e.target.checked && evm) {
                          setStatus(evm.recommendedStatus);
                          setDelayDays(evm.deviationDays);
                        }
                      }}
                      className="accent-primary"
                    />
                    <span>Automação EVM Ativa</span>
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="bg-surface p-2 border border-surface-container-high">
                    <span className="text-[10px] text-on-surface-variant block uppercase">Esperado Hoje</span>
                    <span className="font-bold text-xs text-on-surface">{evm.expectedPercent}%</span>
                  </div>
                  <div className="bg-surface p-2 border border-surface-container-high">
                    <span className="text-[10px] text-on-surface-variant block uppercase">Duração Total</span>
                    <span className="font-bold text-xs text-on-surface">{evm.totalDays} dias</span>
                  </div>
                  <div className={`p-2 border ${isDelay ? 'bg-error-container/40 border-error/30 text-error' : isAhead ? 'bg-tertiary-container/40 border-tertiary/30 text-tertiary' : 'bg-surface border-surface-container-high text-on-surface'}`}>
                    <span className="text-[10px] block uppercase font-medium">Desvio Calculado</span>
                    <span className="font-bold text-xs">
                      {delayDays > 0 ? `+${delayDays}d` : `${delayDays}d`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Slider & Input do Avanço Físico */}
            <div className="p-3 bg-surface-container border border-surface-container-high space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-bold text-on-surface uppercase text-[11px] tracking-wider block">
                    % Avanço Físico Medido
                  </label>
                  <span className="text-[10px] text-on-surface-variant">Arraste para ver o desvio e status calculados em tempo real</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={progress}
                    onChange={e => handleProgressChange(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-20 px-2 py-1 bg-surface border border-surface-container-highest text-right font-mono font-bold text-base text-primary"
                  />
                  <span className="font-bold text-primary">%</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={progress}
                onChange={e => handleProgressChange(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-surface-container-highest cursor-pointer"
              />

              <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-mono">
                <span>0% (Início)</span>
                <span className="font-semibold text-primary">Esperado p/ Hoje: {evm?.expectedPercent}%</span>
                <span>100% (Concluído)</span>
              </div>
            </div>

            {/* Status & Dias de Desvio (Campos Automatizados) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-on-surface">Status da Etapa</label>
                  {isAutoEvm && (
                    <span className="text-[9px] bg-primary/10 text-primary font-mono px-1 py-0.2 font-semibold">
                      AUTO
                    </span>
                  )}
                </div>
                <select
                  value={status}
                  disabled={isAutoEvm}
                  onChange={e => setStatus(e.target.value as any)}
                  className={`w-full px-2.5 py-2 border text-on-surface font-semibold ${
                    status === 'atrasado' 
                      ? 'bg-error-container/30 border-error/40 text-error' 
                      : status === 'concluido' 
                        ? 'bg-tertiary-container/30 border-tertiary/40 text-tertiary' 
                        : 'bg-surface-container border-surface-container-high'
                  } ${isAutoEvm ? 'cursor-not-allowed opacity-90' : 'focus:outline-hidden'}`}
                >
                  <option value="em_andamento">Em Andamento (No Prazo)</option>
                  <option value="atrasado">Atrasado (Caminho Crítico)</option>
                  <option value="concluido">Concluído (100%)</option>
                  <option value="nao_iniciado">Não Iniciado</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-on-surface">Desvio do Cronograma</label>
                  {isAutoEvm && (
                    <span className="text-[9px] bg-primary/10 text-primary font-mono px-1 py-0.2 font-semibold">
                      AUTO
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={delayDays}
                    disabled={isAutoEvm}
                    onChange={e => setDelayDays(Number(e.target.value))}
                    placeholder="0"
                    className={`w-full px-2.5 py-2 border font-mono font-bold ${
                      delayDays < -3 
                        ? 'bg-error-container/30 border-error/40 text-error' 
                        : delayDays > 0 
                          ? 'bg-tertiary-container/30 border-tertiary/40 text-tertiary' 
                          : 'bg-surface-container border-surface-container-high text-on-surface'
                    } ${isAutoEvm ? 'cursor-not-allowed opacity-90' : ''}`}
                  />
                  <span className="text-on-surface-variant font-mono">dias</span>
                </div>
              </div>
            </div>

            {/* Anotações de Campo */}
            <div className="space-y-1">
              <label className="font-semibold text-on-surface">Anotações da Medição / Motivo do Ritmo</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Ritmo afetado por fornecimento cerâmico. Remanejamento executado..."
                className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface focus:outline-hidden font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {/* Tab Content: 2. Configurar Linha de Base */}
        {activeTab === 'linha_base' && (
          <div className="space-y-4 py-4 text-xs">
            <div className="p-3 bg-primary/5 border border-primary/20 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-lg shrink-0 mt-0.5">info</span>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                A <strong>Linha de Base Contratual (Baseline)</strong> representa o plano original aprovado. 
                Alterar as datas ou pesos aqui recalcula os prazos de referência, a Curva S e a meta diária esperada (EVM).
              </p>
            </div>

            {/* Nome da Etapa */}
            <div className="space-y-1">
              <label className="font-semibold text-on-surface">Nome da Atividade / Fase</label>
              <input
                type="text"
                value={phaseName}
                onChange={e => setPhaseName(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface font-semibold focus:outline-hidden"
              />
            </div>

            {/* Datas da Linha de Base */}
            <div className="p-3 bg-surface-container-low border border-surface-container-high space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">date_range</span>
                Datas Contratuais da Linha de Base
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-on-surface-variant">Início Planejado (Baseline)</label>
                  <input
                    type="date"
                    value={startDateIso}
                    onChange={e => setStartDateIso(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-highest text-on-surface font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-on-surface-variant">Término Planejado (Baseline)</label>
                  <input
                    type="date"
                    value={endDateIso}
                    onChange={e => setEndDateIso(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-highest text-on-surface font-mono"
                  />
                </div>
              </div>
              <div className="text-[10px] text-on-surface-variant font-mono">
                Período Sintético: <strong>{computedPeriod}</strong>
              </div>
            </div>

            {/* Peso Ponderado e Marco */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-on-surface">Peso Ponderado na EAP (%)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.5"
                    value={weightPercent}
                    onChange={e => setWeightPercent(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-surface-container border border-surface-container-high text-on-surface font-mono font-bold"
                  />
                  <span className="font-mono font-bold text-on-surface-variant">%</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-on-surface">Marco Construtivo (Milestone)</label>
                <input
                  type="text"
                  value={milestoneCode}
                  onChange={e => setMilestoneCode(e.target.value)}
                  placeholder="Ex: M1, M2, M3..."
                  maxLength={4}
                  className="w-full px-2.5 py-2 bg-surface-container border border-surface-container-high text-on-surface uppercase font-mono"
                />
              </div>
            </div>

            {/* Empreiteira e Caminho Crítico */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-on-surface">Empreiteira / Encarregado Responsável</label>
                <input
                  type="text"
                  value={contractor}
                  onChange={e => setContractor(e.target.value)}
                  placeholder="Ex: Arte &amp; Bloco Ltda."
                  className="w-full px-2.5 py-2 bg-surface-container border border-surface-container-high text-on-surface"
                />
              </div>

              <div className="p-3 bg-surface-container border border-surface-container-high flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-lg ${isCritical ? 'text-error' : 'text-on-surface-variant'}`}>
                    account_tree
                  </span>
                  <div>
                    <span className="font-semibold text-on-surface block">Atividade do Caminho Crítico (CPM)</span>
                    <span className="text-[10px] text-on-surface-variant">
                      Destaque em vermelho e impacto direto na data final da obra.
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCritical}
                    onChange={e => setIsCritical(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-error"></div>
                </label>
              </div>

              {/* Vínculos de Precedência (Dependências CPM) */}
              <div className="space-y-1.5 p-3 bg-surface-container border border-surface-container-high">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-cyan-500">timeline</span>
                    <span>Atividades Predecessoras (Vínculos CPM)</span>
                  </label>
                  <span className="text-[10px] text-on-surface-variant font-mono">
                    {dependencies.length} vinculada(s)
                  </span>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1 border border-surface-container-highest p-1.5 bg-surface">
                  {wbsPhases
                    .filter(p => p.id !== phase.id)
                    .map(other => {
                      const isChecked = dependencies.includes(other.id);
                      return (
                        <label
                          key={other.id}
                          className="flex items-center gap-2 p-1 hover:bg-surface-container cursor-pointer text-[11px] select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDependencies([...dependencies, other.id]);
                              } else {
                                setDependencies(dependencies.filter(id => id !== other.id));
                              }
                            }}
                            className="rounded border-slate-600 text-cyan-600 focus:ring-0"
                          />
                          <span className="truncate text-on-surface font-medium">
                            {other.name}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-mono ml-auto shrink-0">
                            {other.period.split('-')[0]?.trim()}
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>
            </div>


            {/* Danger Zone: Excluir Fase */}
            <div className="pt-2 border-t border-surface-container-high flex items-center justify-between">
              {isDeleting ? (
                <div className="flex items-center gap-2 w-full justify-between bg-error-container/20 p-2 border border-error/30">
                  <span className="text-error font-semibold text-[11px]">Tem certeza que deseja remover esta etapa da EAP?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDeleting(false)}
                      className="px-2 py-1 text-[11px] font-semibold text-on-surface bg-surface border border-surface-container-high"
                    >
                      Não
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-2 py-1 text-[11px] font-bold text-on-error bg-error"
                    >
                      Sim, Excluir
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsDeleting(true)}
                  className="text-error hover:underline text-[11px] font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  <span>Excluir Atividade da EAP</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-container-high">
          <span className="text-[11px] text-on-surface-variant font-mono">
            {activeTab === 'medicao' ? (isAutoEvm ? '🤖 Modo Automático EVM' : '✏️ Modo Manual') : '⚙️ Configuração da Linha de Base'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-surface-container-highest text-xs font-semibold text-on-surface hover:bg-surface-container"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors shadow-sm"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
