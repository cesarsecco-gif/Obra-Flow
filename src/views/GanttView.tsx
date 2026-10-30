import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GanttPhaseEditModal, parsePeriodDates } from '../components/GanttPhaseEditModal';
import { GanttNewPhaseModal } from '../components/GanttNewPhaseModal';
import { GanttExportModal } from '../components/GanttExportModal';
import { GanttBaselineModal } from '../components/GanttBaselineModal';
import { GanttCurvaSModal } from '../components/GanttCurvaSModal';
import { GanttLookaheadModal } from '../components/GanttLookaheadModal';
import { GanttPhaseEvidenceModal } from '../components/GanttPhaseEvidenceModal';
import { WbsPhase } from '../types';

function computeReprogrammedDate(periodStr: string, delayDays: number = 0): { originalEnd: string; reprogEnd: string } {
  const dates = parsePeriodDates(periodStr);
  if (!dates) {
    return { originalEnd: '30/Nov/2024', reprogEnd: '14/Dez/2024' };
  }
  const formatPt = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const mon = months[d.getMonth()];
    const yr = d.getFullYear();
    return `${day}/${mon}/${yr}`;
  };

  const originalEnd = formatPt(dates.end);
  if (!delayDays || delayDays === 0) {
    return { originalEnd, reprogEnd: originalEnd };
  }

  // Se delayDays < 0 (atraso de X dias), a data reprogramada é adiada em |delayDays|
  const daysShift = delayDays < 0 ? Math.abs(delayDays) : -delayDays;
  const reprogDate = new Date(dates.end.getTime() + daysShift * 24 * 60 * 60 * 1000);
  return { originalEnd, reprogEnd: formatPt(reprogDate) };
}

export const GanttView: React.FC = () => {
  const { 
    activeProject, 
    showToast, 
    setActiveTab, 
    addAuditLog,
    wbsPhases,
    savedBaselines,
    activeBaselineId,
    comparisonBaselineId,
    setComparisonBaselineId,
    restrictions,
    addRestriction,
    updateRestrictionStatus,
    deleteRestriction,
    photoEvidences,
    rdoNotes,
    setIsQuickCaptureOpen
  } = useApp();

  const [timeScale, setTimeScale] = useState<'mensal' | 'semanal' | 'diario'>('mensal');
  const [showBaseline, setShowBaseline] = useState<boolean>(true);
  const [showDependencies, setShowDependencies] = useState<boolean>(true);
  const [isXrayDiffMode, setIsXrayDiffMode] = useState<boolean>(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string>('m3');
  const [editingPhase, setEditingPhase] = useState<WbsPhase | null>(null);
  const [filterCriticalOnly, setFilterCriticalOnly] = useState<boolean>(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [mitigationPlanText, setMitigationPlanText] = useState<string>('');

  // Estados dos Modais
  const [isNewPhaseOpen, setIsNewPhaseOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isBaselineOpen, setIsBaselineOpen] = useState<boolean>(false);
  const [isCurvaSOpen, setIsCurvaSOpen] = useState<boolean>(false);
  const [isLookaheadOpen, setIsLookaheadOpen] = useState<boolean>(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState<boolean>(false);


  // Linha de Base selecionada para comparação
  const comparisonBaseline = useMemo(() => {
    return savedBaselines.find(b => b.id === comparisonBaselineId) || savedBaselines[0];
  }, [savedBaselines, comparisonBaselineId]);

  const activeBaseline = useMemo(() => {
    return savedBaselines.find(b => b.id === activeBaselineId) || savedBaselines[0];
  }, [savedBaselines, activeBaselineId]);

  // Lista dinâmica de marcos do projeto
  const milestonesList = useMemo(() => {
    const withCode = wbsPhases.filter(p => p.milestoneCode);
    if (withCode.length > 0) return withCode;
    return wbsPhases.slice(0, 5);
  }, [wbsPhases]);

  // Fase selecionada dinamicamente pelo marco clicado
  const selectedPhase = useMemo(() => {
    const foundByMilestone = wbsPhases.find(p => 
      p.milestoneCode?.toLowerCase() === selectedMilestone.toLowerCase()
    );
    if (foundByMilestone) return foundByMilestone;

    const foundByOrder = wbsPhases.find(p => 
      `phase-${p.order}` === selectedMilestone.toLowerCase() || p.id === selectedMilestone
    );
    if (foundByOrder) return foundByOrder;

    return wbsPhases.find(p => p.status === 'atrasado') || wbsPhases[3] || wbsPhases[0];
  }, [wbsPhases, selectedMilestone]);

  // Próxima etapa na cadeia de precedência
  const nextPhase = useMemo(() => {
    if (!selectedPhase) return null;
    return wbsPhases.find(p => p.order === selectedPhase.order + 1) || null;
  }, [wbsPhases, selectedPhase]);

  // Datas reprogramadas da fase selecionada
  const selectedPhaseDates = useMemo(() => {
    if (!selectedPhase) return { originalEnd: '30/Nov/2024', reprogEnd: '29/Nov/2024' };
    return computeReprogrammedDate(selectedPhase.period, selectedPhase.delayDays || 0);
  }, [selectedPhase]);

  // Atualiza o plano de mitigação dinamicamente sempre que a fase selecionada muda
  useEffect(() => {
    if (selectedPhase) {
      if (selectedPhase.status === 'atrasado' || (selectedPhase.delayDays && selectedPhase.delayDays < 0)) {
        setMitigationPlanText(
          selectedPhase.notes || 
          `Mobilização de 4 oficiais e 2 serventes adicionais remanejados da frente de revestimentos (${selectedPhase.contractor || 'empreiteira principal'}) para compensação de ritmo em dois turnos (início em 28/Out). Remessa extra de insumos confirmada para entrega no canteiro em 25/Out para recuperação dos ${Math.abs(selectedPhase.delayDays || 14)} dias corridos de desvio (registrado e validado no RDO #${activeProject.rdoNumber}).`
        );
      } else if (selectedPhase.progressPercent >= 100) {
        setMitigationPlanText(
          `Marco construtivo 100% concluído e aprovado pela fiscalização técnica da ObraSync. Ficha de Verificação de Serviço (FVS) devidamente assinada e documentação arquivada para comprovação no PBQP-H e auditoria da CEF.`
        );
      } else {
        setMitigationPlanText(
          `Atividade transcorrendo em conformidade com o cronograma planejado na Linha de Base (${comparisonBaseline?.versionName || 'v1.2'}). Acompanhamento diário dos efetivos e boletins de serviço garantem o cumprimento da entrega na data contratual de ${selectedPhaseDates.originalEnd}.`
        );
      }
    }
  }, [selectedPhase, comparisonBaseline, selectedPhaseDates, activeProject.rdoNumber]);

  const handleApproveMitigation = () => {
    if (!selectedPhase) return;
    showToast(`Plano de aceleração e replanejamento do Marco ${selectedPhase.milestoneCode || selectedPhase.order} homologado na Linha de Base.`, 'success');
    addAuditLog(
      'REPLANEJAMENTO DE MARCO HOMOLOGADO',
      'RDO',
      `Marco ${selectedPhase.milestoneCode || selectedPhase.order} (${selectedPhase.name}) reprogramado para ${selectedPhaseDates.reprogEnd}. Mitigação homologada: ${mitigationPlanText.slice(0, 90)}...`
    );
  };

  const handleGenerateAiMitigation = () => {
    if (!selectedPhase) return;
    setIsGeneratingAi(true);
    showToast('Copilot IA gerando plano de mitigação e recuperação 5W2H...', 'info');

    setTimeout(() => {
      const generated = `[PLANO DE AÇÃO 5W2H SINTETIZADO COM IA]
• O QUE: Aceleração da produtividade na etapa "${selectedPhase.name}".
• POR QUE: Neutralizar o desvio de ${Math.abs(selectedPhase.delayDays || 14)} dias e proteger o caminho crítico da frente subsequente (${nextPhase ? nextPhase.name : 'Habite-se / Vistoria'}).
• QUEM: Responsável técnico ${selectedPhase.contractor || activeProject.engineer}.
• QUANDO: Mobilização a partir do próximo turno com jornada estendida (07:00 às 19:00).
• ONDE: ${activeProject.name} — Canteiro Central.
• COMO: Remanejamento de 4 oficiais da Torre A e remessa complementar com entrega expressa (validado no RDO #${activeProject.rdoNumber}).`;
      setMitigationPlanText(generated);
      setIsGeneratingAi(false);
      showToast('Plano de mitigação sintetizado com IA com sucesso!', 'success');
    }, 850);
  };

  // Filtragem de fases da EAP
  const displayedPhases = useMemo(() => {
    if (!filterCriticalOnly) return wbsPhases;
    return wbsPhases.filter(p => p.isCritical || (p.delayDays && p.delayDays < 0) || p.milestoneCode);
  }, [wbsPhases, filterCriticalOnly]);

  // Contagem de marcos concluídos
  const milestoneCount = useMemo(() => {
    const total = milestonesList.length;
    const completed = milestonesList.filter(p => p.progressPercent >= 100).length;
    return {
      total,
      completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [milestonesList]);

  // Contagem de frentes críticas
  const criticalCount = useMemo(() => {
    return wbsPhases.filter(p => p.isCritical).length;
  }, [wbsPhases]);

  const atRiskCount = useMemo(() => {
    return wbsPhases.filter(p => p.status === 'atrasado' || (p.delayDays && p.delayDays < 0)).length;
  }, [wbsPhases]);

  const pendingRestrictionsCount = useMemo(() => {
    return restrictions.filter(r => r.status === 'pendente' || r.status === 'em_tratativa').length;
  }, [restrictions]);


  // Cálculo da posição geométrica das barras de acordo com a escala temporal
  const computeGeometry = (periodStr: string, order: number) => {
    const dates = parsePeriodDates(periodStr);

    if (timeScale === 'mensal') {
      const timelineStart = new Date(2024, 7, 1).getTime(); // 01/Ago/2024
      const timelineEnd = new Date(2025, 11, 31).getTime(); // 31/Dez/2025
      const totalSpan = timelineEnd - timelineStart;

      if (!dates) {
        const left = Math.min(80, (order - 1) * 11);
        return { left: `${left}%`, width: '18%' };
      }

      const pStart = dates.start.getTime();
      const pEnd = dates.end.getTime();
      const left = Math.max(0, Math.min(90, ((pStart - timelineStart) / totalSpan) * 100));
      const width = Math.max(6, Math.min(100 - left, ((pEnd - pStart) / totalSpan) * 100));
      return { left: `${left.toFixed(1)}%`, width: `${width.toFixed(1)}%` };
    }

    if (timeScale === 'semanal') {
      const timelineStart = new Date(2024, 9, 1).getTime();
      const timelineEnd = new Date(2024, 11, 24).getTime();
      const totalSpan = timelineEnd - timelineStart;

      if (!dates) {
        const left = ((order % 4) * 20);
        return { left: `${left}%`, width: '30%' };
      }

      const pStart = dates.start.getTime();
      const pEnd = dates.end.getTime();
      const left = Math.max(0, Math.min(85, ((pStart - timelineStart) / totalSpan) * 100));
      const width = Math.max(8, Math.min(100 - left, ((pEnd - pStart) / totalSpan) * 100));
      return { left: `${left.toFixed(1)}%`, width: `${width.toFixed(1)}%` };
    }

    // Horizonte Diário: Janela de 14 dias (18/Out a 31/Out/2024 = 14 dias)
    const dayWidthPercent = 100 / 14;
    if (order <= 2) {
      return { left: '0%', width: '100%' };
    }
    if (order === 3) {
      return { left: '0%', width: `${dayWidthPercent * 10}%` };
    }
    if (order === 4) {
      return { left: `${dayWidthPercent * 3}%`, width: `${dayWidthPercent * 9}%` };
    }
    if (order === 5) {
      return { left: `${dayWidthPercent * 5}%`, width: `${dayWidthPercent * 8}%` };
    }
    return { left: `${dayWidthPercent * 6}%`, width: `${dayWidthPercent * 7}%` };
  };

  const isSelectedDelayed = selectedPhase ? (selectedPhase.status === 'atrasado' || (selectedPhase.delayDays && selectedPhase.delayDays < 0)) : false;
  const isSelectedComplete = selectedPhase ? selectedPhase.progressPercent >= 100 : false;

  return (
    <div className="flex flex-col w-full space-y-6 font-body">
      {/* Sub-Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
            <span>Planejamento &amp; Cronograma Físico</span>
            <span>/</span>
            <span className="text-primary font-bold">Gantt Executivo &amp; Linha de Base</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Cronograma Físico &amp; Marcos Construtivos</h1>
          <p className="text-xs text-on-surface-variant">
            Acompanhamento da linha de base contratual vs. avanço medido em campo, caminho crítico (CPM) e marcos regulatórios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor Dinâmico de Escala de Tempo */}
          <div className="inline-flex bg-surface-container p-0.5 border border-surface-container-high">
            <button 
              type="button" 
              onClick={() => {
                setTimeScale('mensal');
                showToast('Escala temporal: Visão Mensal (Agosto 2024 a Dezembro 2025)', 'info');
              }}
              className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                timeScale === 'mensal' 
                  ? 'bg-surface text-primary shadow-xs font-bold border border-surface-container-highest' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Mensal
            </button>
            <button 
              type="button" 
              onClick={() => {
                setTimeScale('semanal');
                showToast('Escala temporal: Visão Semanal (12 Semanas do Trimestre Out-Dez)', 'info');
              }}
              className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                timeScale === 'semanal' 
                  ? 'bg-surface text-primary shadow-xs font-bold border border-surface-container-highest' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Semanal
            </button>
            <button 
              type="button" 
              onClick={() => {
                setTimeScale('diario');
                showToast('Escala temporal: Visão Diária Lookahead (18 a 31 de Outubro)', 'info');
              }}
              className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                timeScale === 'diario' 
                  ? 'bg-surface text-primary shadow-xs font-bold border border-surface-container-highest' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Diário
            </button>
          </div>

          {/* Comparar Baseline (Toggle + Dropdown seletor da versão) */}
          <div className="inline-flex items-center border border-surface-container-high bg-surface divide-x divide-surface-container-high">
            <button 
              type="button"
              onClick={() => {
                setShowBaseline(!showBaseline);
                showToast(showBaseline ? 'Linha de Base ocultada do Gantt.' : `Exibindo Linha de Base ${comparisonBaseline.versionName} no gráfico.`, 'info');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${
                showBaseline ? 'bg-surface-container text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Alternar visibilidade das barras de Linha de Base no gráfico"
            >
              <span className="material-symbols-outlined text-sm text-primary">difference</span>
              <span>Comparar Baseline:</span>
            </button>
            <select
              value={comparisonBaselineId}
              onChange={e => setComparisonBaselineId(e.target.value)}
              className="bg-transparent px-2.5 py-2 text-xs font-mono font-bold text-primary focus:outline-hidden cursor-pointer"
              title="Selecione qual snapshot de Linha de Base deseja comparar"
            >
              {savedBaselines.map(b => (
                <option key={b.id} value={b.id}>
                  {b.versionName} ({b.name}) {b.id === activeBaselineId ? '★ Ativa' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Gerenciar / Congelar Baseline */}
          <button 
            type="button"
            onClick={() => setIsBaselineOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors border border-surface-container-high"
            title="Histórico, seleção e congelamento de Linhas de Base"
          >
            <span className="material-symbols-outlined text-sm text-primary">settings_suggest</span>
            <span>Gerenciar Baseline ({activeBaseline.versionName})</span>
          </button>

          {/* Curva S Físico-Financeira & EVM */}
          <button 
            type="button"
            onClick={() => setIsCurvaSOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-bold hover:from-indigo-500 hover:to-blue-500 transition-all shadow-xs"
            title="Abrir Curva S Físico-Financeira com SPI, CPI, EAC e gráficos"
          >
            <span className="material-symbols-outlined text-sm">show_chart</span>
            <span>Curva S (EVM)</span>
          </button>

          {/* Lookahead Planning (Lean) */}
          <button 
            type="button"
            onClick={() => setIsLookaheadOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors border border-surface-container-high relative"
            title="Quadro de Restrições e Lookahead Planning (Lean Construction)"
          >
            <span className="material-symbols-outlined text-sm text-amber-500">view_timeline</span>
            <span>Lookahead &amp; Restrições</span>
            {pendingRestrictionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                {pendingRestrictionsCount}
              </span>
            )}
          </button>

          {/* Alternar Vínculos de Precedência CPM */}
          <button 
            type="button"
            onClick={() => {
              setShowDependencies(!showDependencies);
              showToast(showDependencies ? 'Vínculos de precedência ocultados.' : 'Exibindo setas de precedência e caminho crítico.', 'info');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors border border-surface-container-high ${
              showDependencies ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 font-bold' : 'bg-surface text-on-surface-variant hover:text-on-surface'
            }`}
            title="Exibir ou ocultar setas de dependência entre tarefas"
          >
            <span className="material-symbols-outlined text-sm">timeline</span>
            <span>{showDependencies ? 'Vínculos CPM (Ativos)' : 'Vínculos CPM'}</span>
          </button>

          {/* Modo Raio-X (Comparador Diff entre Baselines) */}
          <button 
            type="button"
            onClick={() => {
              setIsXrayDiffMode(!isXrayDiffMode);
              showToast(!isXrayDiffMode ? `Modo Raio-X ativado: comparando com ${comparisonBaseline.versionName}.` : 'Modo Raio-X desativado.', 'info');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all border ${
              isXrayDiffMode 
                ? 'bg-purple-600 text-white font-bold border-purple-400 shadow-md shadow-purple-600/20' 
                : 'bg-surface text-on-surface-variant hover:text-on-surface border-surface-container-high'
            }`}
            title="Comparador visual detalhado de desvios e alterações de prazo entre linhas de base"
          >
            <span className="material-symbols-outlined text-sm">{isXrayDiffMode ? 'biotech' : 'visibility'}</span>
            <span>{isXrayDiffMode ? 'Raio-X Ativo' : 'Modo Raio-X (Diff)'}</span>
          </button>

          {/* Exportar MS-Project / PDF */}
          <button 
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
            title="Exportar arquivo MS-Project XML ou gerar PDF executivo"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>MS-Project / PDF</span>
          </button>
        </div>
      </div>


      {/* KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
            <span className="font-medium uppercase tracking-wide text-[11px]">Avanço Geral</span>
            <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold font-mono ${
              activeProject.progressPercent >= activeProject.plannedPercent
                ? 'bg-tertiary-container/40 text-tertiary'
                : 'bg-error-container/40 text-error'
            }`}>
              Desvio {(activeProject.progressPercent - activeProject.plannedPercent).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface font-mono">{activeProject.progressPercent}%</span>
            <span className="text-xs text-on-surface-variant font-light">Previsto: {activeProject.plannedPercent}%</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 mt-3 relative">
            <div 
              className={`h-1.5 ${activeProject.progressPercent >= activeProject.plannedPercent ? 'bg-tertiary' : 'bg-primary'}`} 
              style={{ width: `${Math.min(100, activeProject.progressPercent)}%` }}
            ></div>
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-on-surface z-10" 
              style={{ left: `${Math.min(100, activeProject.plannedPercent)}%` }} 
              title={`Meta Planejada: ${activeProject.plannedPercent}%`}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant mt-2 font-mono">
            <span>Status: {activeProject.progressPercent >= activeProject.plannedPercent ? 'No Prazo' : 'Em Atenção'}</span>
            <span className="text-on-surface font-medium">{activeProject.name}</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
            <span className="font-medium uppercase tracking-wide text-[11px]">Marcos Regulatórios</span>
            <span className="material-symbols-outlined text-tertiary text-base">verified</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface font-mono">
              {milestoneCount.completed} <span className="text-sm font-normal text-on-surface-variant">/ {milestoneCount.total}</span>
            </span>
            <span className="text-xs text-tertiary font-semibold">
              {milestoneCount.percent}% Concluídos
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 mt-3">
            <div 
              className="bg-tertiary h-1.5" 
              style={{ width: `${Math.min(100, milestoneCount.percent)}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant mt-2">
            <span>Próximo Marco:</span>
            <span className="font-mono text-on-surface font-bold truncate max-w-[120px]">
              {milestonesList.find(p => p.progressPercent < 100)?.name || 'Todos Concluídos'}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
            <span className="font-medium uppercase tracking-wide text-[11px]">Caminho Crítico (CPM)</span>
            <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold font-mono ${
              atRiskCount > 0 ? 'bg-error-container/40 text-error' : 'bg-tertiary-container/40 text-tertiary'
            }`}>
              {atRiskCount > 0 ? `${atRiskCount} em Risco` : 'Normal'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-error font-mono">{criticalCount}</span>
            <span className="text-xs text-on-surface-variant">frentes ativas na rota</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-on-surface truncate">
            <span className="w-2.5 h-2.5 bg-error inline-block shrink-0"></span>
            <span className="truncate">{wbsPhases.find(p => p.isCritical && (p.delayDays || 0) < 0)?.name || 'Alvenaria Torre B'}</span>
          </div>
          <div className="text-[11px] text-on-surface-variant mt-2 font-mono truncate">
            {atRiskCount > 0 ? 'Requer aceleração com equipe extra' : 'Sem atrasos no caminho crítico'}
          </div>
        </div>

        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
            <span className="font-medium uppercase tracking-wide text-[11px]">Previsão de Entrega</span>
            <span className="material-symbols-outlined text-outline text-base">calendar_clock</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-on-surface font-mono">15/Dez/2025</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-[#b28600] font-medium">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>Desvio: +12 dias corridos</span>
          </div>
          <div className="text-[11px] text-on-surface-variant mt-2 font-mono">Habite-se / Chaves</div>
        </div>

        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
            <span className="font-medium uppercase tracking-wide text-[11px]">Impacto Climático</span>
            <span className="material-symbols-outlined text-primary text-base">rainy</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface font-mono">-18</span>
            <span className="text-xs text-on-surface-variant">dias abonados</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 mt-3">
            <div className="bg-primary-fixed-dim h-1.5" style={{ width: '60%' }}></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant mt-2">
            <span>RDOs Sincronizados</span>
            <span className="font-semibold text-tertiary">Auditado</span>
          </div>
        </div>
      </div>

      {/* UNIFIED GANTT CONTAINER: 100% PERFECT ROW ALIGNMENT & SYNCHRONIZED SCROLL */}
      <div className="border border-surface-container-high shadow-sm bg-surface overflow-x-auto">
        <div className="min-w-[1240px] flex flex-col">
          {/* Header Row: Left EAP Controls (h-[88px]) & Right Timeline Ruler (h-[88px]) */}
          <div className="flex border-b border-surface-container-high bg-surface-container-low sticky top-0 z-30">
            {/* Sticky Left Header */}
            <div className="w-[390px] shrink-0 border-r border-surface-container-high p-3 flex flex-col justify-between h-[88px] sticky left-0 bg-surface-container-low z-40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Estrutura Analítica (EAP / WBS)
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 bg-surface-container font-mono text-on-surface-variant border border-surface-container-high">
                    {wbsPhases.length} Fases
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsNewPhaseOpen(true)}
                    className="px-2 py-0.5 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider hover:bg-primary/90 flex items-center gap-0.5 shadow-xs"
                    title="Cadastrar nova atividade na EAP"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                    <span>Nova Atividade</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterCriticalOnly(false)}
                  className={`px-2 py-0.5 text-[10px] font-bold transition-colors ${
                    !filterCriticalOnly 
                      ? 'bg-primary text-on-primary' 
                      : 'bg-surface text-on-surface-variant border border-surface-container-high hover:text-on-surface'
                  }`}
                >
                  TODAS ({wbsPhases.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCriticalOnly(true)}
                  className={`px-2 py-0.5 text-[10px] font-bold transition-colors border ${
                    filterCriticalOnly 
                      ? 'bg-error text-on-error border-error' 
                      : 'bg-surface text-error border-surface-container-high hover:bg-error-container/20'
                  }`}
                >
                  CAMINHO CRÍTICO ({criticalCount})
                </button>
              </div>
            </div>

            {/* Right Timeline Ruler (h-[88px]) */}
            <div className="flex-1 flex flex-col justify-between h-[88px] min-w-[850px] select-none bg-surface-container-low border-b border-surface-container-high">
              {timeScale === 'mensal' && (
                <>
                  <div className="grid grid-cols-12 text-center text-[11px] font-semibold text-on-surface py-2.5 border-b border-surface-container-high">
                    <div>Ago/24</div>
                    <div>Set/24</div>
                    <div className="bg-primary/10 text-primary font-bold">Out/24 (Hoje)</div>
                    <div>Nov/24</div>
                    <div>Dez/24</div>
                    <div>Jan/25</div>
                    <div>Fev/25</div>
                    <div>Mar/25</div>
                    <div>Abr/25</div>
                    <div>Mai/25</div>
                    <div>Jun/25</div>
                    <div>Dez/25</div>
                  </div>
                  <div className="grid grid-cols-12 text-center text-[10px] text-on-surface-variant font-mono py-2">
                    <span>Sem 32-35</span>
                    <span>Sem 36-39</span>
                    <span className="text-primary font-bold">Sem 40-43</span>
                    <span>Sem 44-48</span>
                    <span>Sem 49-52</span>
                    <span>Sem 01-04</span>
                    <span>Sem 05-08</span>
                    <span>Sem 09-12</span>
                    <span>Sem 13-17</span>
                    <span>Sem 18-21</span>
                    <span>Sem 22-26</span>
                    <span>Sem 48-50</span>
                  </div>
                </>
              )}

              {timeScale === 'semanal' && (
                <>
                  <div className="grid grid-cols-3 text-center text-[11px] font-bold text-on-surface py-2.5 border-b border-surface-container-high">
                    <div className="border-r border-surface-container-high bg-primary/5 text-primary">Outubro 2024 (Ciclo Corrente)</div>
                    <div className="border-r border-surface-container-high">Novembro 2024</div>
                    <div>Dezembro 2024</div>
                  </div>
                  <div className="grid grid-cols-12 text-center text-[10px] text-on-surface-variant font-mono py-2">
                    <span>Sem 40</span>
                    <span>Sem 41</span>
                    <span>Sem 42</span>
                    <span className="bg-primary text-on-primary font-bold px-0.5">Sem 43 (Hoje)</span>
                    <span>Sem 44</span>
                    <span>Sem 45</span>
                    <span>Sem 46</span>
                    <span>Sem 47</span>
                    <span>Sem 48</span>
                    <span>Sem 49</span>
                    <span>Sem 50</span>
                    <span>Sem 51</span>
                  </div>
                </>
              )}

              {timeScale === 'diario' && (
                <>
                  <div className="bg-surface-container-high/40 text-center text-[11px] font-bold text-on-surface py-2 border-b border-surface-container-high">
                    Lookahead Diário de 14 Dias — Frente de Trabalho Ativa (Outubro 2024)
                  </div>
                  <div className="grid grid-cols-14 text-center text-[10px] text-on-surface-variant font-mono py-2 divide-x divide-surface-container-high">
                    <span>Sex 18</span>
                    <span>Sáb 19</span>
                    <span className="text-on-surface-variant/60">Dom 20</span>
                    <span>Seg 21</span>
                    <span>Ter 22</span>
                    <span>Qua 23</span>
                    <span className="bg-error text-on-error font-bold px-0.5">Qui 24 (HOJE)</span>
                    <span>Sex 25</span>
                    <span>Sáb 26</span>
                    <span className="text-on-surface-variant/60">Dom 27</span>
                    <span>Seg 28</span>
                    <span>Ter 29</span>
                    <span>Qua 30</span>
                    <span>Qui 31</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Banner Informativo do Modo Raio-X */}
          {isXrayDiffMode && (
            <div className="bg-purple-950/60 border-b border-purple-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-purple-200 sticky top-0 z-35 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-base animate-pulse">biotech</span>
                <span>
                  <strong>Modo Raio-X (Visual Diff Ativo):</strong> Comparando cronograma executivo com{' '}
                  <strong className="underline text-white">{comparisonBaseline.name} ({comparisonBaseline.versionName})</strong>.
                  Barras destacam desvios críticos e acelerações de caminho crítico.
                </span>
              </div>
              <button 
                onClick={() => setIsXrayDiffMode(false)}
                className="text-[11px] underline text-purple-300 hover:text-white px-2 py-0.5 rounded bg-purple-900/50"
              >
                Encerrar Modo Raio-X
              </button>
            </div>
          )}

          {/* Unified Body with Vertical Scrollbar: Every single row has EXACTLY h-[60px] */}
          <div className="overflow-y-auto max-h-[560px] divide-y divide-surface-container-high relative">
            {/* Cutline de Hoje posicionada precisamente no canvas */}
            <div 
              className="absolute top-0 bottom-0 z-25 pointer-events-none flex flex-col items-center transition-all" 
              style={{ 
                left: timeScale === 'mensal' 
                  ? 'calc(390px + (100% - 390px) * 0.215)' 
                  : timeScale === 'semanal' 
                    ? 'calc(390px + (100% - 390px) * 0.292)' 
                    : 'calc(390px + (100% - 390px) * 0.464)' 
              }}
            >
              <div className="bg-error text-on-error text-[10px] font-bold px-1.5 py-0.5 shadow-sm uppercase tracking-wider font-mono">
                Hoje (24/Out)
              </div>
              <div className="w-px h-full bg-error border-r border-dashed border-error"></div>
            </div>

            {/* Camada Vetorial SVG: Vínculos de Precedência e Setas CPM */}
            {showDependencies && (
              <svg 
                className="absolute inset-0 pointer-events-none z-15 select-none"
                style={{
                  left: '390px',
                  width: 'calc(100% - 390px)',
                  height: `${displayedPhases.length * 60}px`
                }}
                viewBox={`0 0 1000 ${displayedPhases.length * 60}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <marker
                    id="arrow-cyan"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#06b6d4" />
                  </marker>
                  <marker
                    id="arrow-red"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                  </marker>
                </defs>

                {displayedPhases.map((succPhase, succIdx) => {
                  const deps = succPhase.dependencies || [];
                  const succGeom = computeGeometry(succPhase.period, succPhase.order);
                  const x2 = parseFloat(succGeom.left) * 10;
                  const y2 = succIdx * 60 + 30;

                  return deps.map((predId) => {
                    const predIdx = displayedPhases.findIndex(p => p.id === predId);
                    if (predIdx === -1) return null;
                    const predPhase = displayedPhases[predIdx];
                    const predGeom = computeGeometry(predPhase.period, predPhase.order);
                    const x1 = (parseFloat(predGeom.left) + parseFloat(predGeom.width)) * 10;
                    const y1 = predIdx * 60 + 30;

                    const isPredDelayed = predPhase.status === 'atrasado' || (predPhase.delayDays && predPhase.delayDays < 0);
                    const strokeColor = isPredDelayed ? '#ef4444' : '#06b6d4';
                    const markerId = isPredDelayed ? 'url(#arrow-red)' : 'url(#arrow-cyan)';
                    const midX = x2 > x1 + 15 ? (x1 + x2) / 2 : x1 + 15;

                    const pathD = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;

                    return (
                      <g key={`${predId}-${succPhase.id}`}>
                        <path
                          d={pathD}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={isPredDelayed ? "2.5" : "1.8"}
                          strokeDasharray={isPredDelayed ? "5 3" : "none"}
                          strokeOpacity={isPredDelayed ? "0.95" : "0.75"}
                          markerEnd={markerId}
                        />
                      </g>
                    );
                  });
                })}
              </svg>
            )}

            {displayedPhases.map((phase) => {

              const isSelected = selectedMilestone === (phase.milestoneCode?.toLowerCase() || `phase-${phase.order}`);
              const isDelay = phase.status === 'atrasado' || (phase.delayDays && phase.delayDays < 0);
              const isComplete = phase.progressPercent >= 100;

              // Dados da Linha de Base em comparação
              const baselinePhaseData = comparisonBaseline?.phases?.find(p => p.order === phase.order || p.phaseId === phase.id);
              const baselinePeriodStr = baselinePhaseData?.period || phase.period;

              const geomRealized = computeGeometry(phase.period, phase.order);
              const geomBaseline = computeGeometry(baselinePeriodStr, phase.order);

              return (
                <div 
                  key={phase.id}
                  onClick={() => {
                    if (phase.milestoneCode) setSelectedMilestone(phase.milestoneCode.toLowerCase());
                    else setSelectedMilestone(`phase-${phase.order}`);
                  }}
                  className={`flex h-[60px] min-h-[60px] max-h-[60px] hover:bg-surface-container-low transition-colors group cursor-pointer ${
                    isDelay ? 'bg-error-container/5' : ''
                  }`}
                  title="Clique para selecionar e visualizar detalhes deste marco"
                >
                  {/* Left Column Cell: Sticky left, exactly h-[60px] and w-[390px] */}
                  <div 
                    className={`w-[390px] shrink-0 border-r border-surface-container-high px-3.5 flex items-center justify-between sticky left-0 z-20 transition-colors ${
                      isDelay 
                        ? 'bg-[#fff5f5] group-hover:bg-[#ffeded] border-l-4 border-l-error' 
                        : isSelected 
                          ? 'bg-primary/5 group-hover:bg-primary/10 border-l-4 border-l-primary' 
                          : 'bg-surface group-hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className={`material-symbols-outlined text-base shrink-0 ${
                        isComplete ? 'text-tertiary' : isDelay ? 'text-error' : 'text-primary'
                      }`}>
                        {isComplete ? 'check_circle' : isDelay ? 'error' : 'pending'}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold truncate ${isDelay ? 'text-error font-bold' : isSelected ? 'text-primary font-bold' : 'text-on-surface'}`}>
                            {phase.name}
                          </span>
                          {phase.isCritical && (
                            <span className="px-1 py-0.2 bg-error/15 text-error font-mono text-[9px] font-bold shrink-0">
                              CPM
                            </span>
                          )}
                          {phase.milestoneCode && (
                            <span 
                              className={`inline-block w-2 h-2 rotate-45 shrink-0 ${isDelay ? 'bg-error' : isComplete ? 'bg-tertiary' : 'bg-primary'}`} 
                              title={`Marco ${phase.milestoneCode}`}
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-on-surface-variant font-mono truncate">
                          {phase.period} • Peso: {phase.weightPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPhase(phase);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-surface text-primary transition-opacity"
                        title="Editar medição física"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <span className={`text-xs font-bold font-mono ${isDelay ? 'text-error' : isComplete ? 'text-tertiary' : 'text-on-surface'}`}>
                        {phase.progressPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Right Column Cell: Timeline Bar Row, exactly h-[60px] */}
                  <div className="flex-1 relative min-w-[850px] h-[60px] flex items-center px-2 z-10">
                    {/* Vertical grid lines de fundo */}
                    <div className={`absolute inset-0 pointer-events-none z-0 grid ${timeScale === 'diario' ? 'grid-cols-14' : 'grid-cols-12'}`}>
                      {Array.from({ length: timeScale === 'diario' ? 14 : 12 }).map((_, idx) => (
                        <div key={idx} className="border-r border-surface-container-high/60"></div>
                      ))}
                    </div>

                    {/* Barra da Linha de Base (Baseline em Comparação), logo abaixo da barra programada para não ficar escondida */}
                    {showBaseline && (
                      <div 
                        className="absolute h-2 bg-on-surface-variant/45 top-[44px] rounded-xs z-0 pointer-events-auto" 
                        style={{ left: geomBaseline.left, width: geomBaseline.width }}
                        title={`Linha de Base (${comparisonBaseline.versionName}): ${baselinePeriodStr}`}
                      ></div>
                    )}

                    {/* Barra de Progresso Realizado (com suporte ao Modo Raio-X Diff) */}
                    <div 
                      className={`relative h-6 flex items-center justify-between px-2 text-[10px] font-bold shadow-xs transition-all rounded-xs z-10 ${
                        isXrayDiffMode
                          ? isDelay
                            ? 'bg-red-600 text-white ring-2 ring-red-400 shadow-md shadow-red-500/30'
                            : isComplete
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                              : 'bg-purple-600 text-white ring-1 ring-purple-300'
                          : isComplete 
                            ? 'bg-tertiary text-on-tertiary' 
                            : isDelay 
                              ? 'bg-error text-on-error' 
                              : 'bg-primary text-on-primary'
                      }`}
                      style={{ 
                        marginLeft: geomRealized.left, 
                        width: geomRealized.width 
                      }}
                    >
                      {/* Marca de avanço: traço vertical na posição proporcional ao % realizado */}
                      {phase.progressPercent > 0 && phase.progressPercent < 100 && (
                        <span
                          className="absolute -top-1 -bottom-1 w-[3px] -translate-x-1/2 bg-on-surface ring-1 ring-surface pointer-events-none z-20"
                          style={{ left: `${phase.progressPercent}%` }}
                          title={`Avanço: ${phase.progressPercent.toFixed(1)}%`}
                        />
                      )}
                      <span className="truncate pr-1">
                        {isXrayDiffMode ? `[Raio-X] ${phase.name}` : phase.name}
                      </span>
                      <span className="font-mono shrink-0">
                        {isXrayDiffMode && isDelay ? `${phase.delayDays}d` : `${phase.progressPercent.toFixed(1)}%`}
                      </span>
                    </div>


                    {/* Badge de Atraso em Dias */}
                    {phase.delayDays && phase.delayDays !== 0 && (
                      <div className="h-6 bg-error-container text-on-error-container flex items-center px-1.5 text-[10px] font-bold gap-1 border-r-2 border-error shrink-0 z-15 ml-1">
                        <span className="material-symbols-outlined text-xs text-error">priority_high</span>
                        <span>{phase.delayDays}d</span>
                      </div>
                    )}

                    {/* Marcador de Marco Construtivo */}
                    {phase.milestoneCode && (
                      <div className="absolute z-20 flex items-center gap-1" style={{ left: `calc(${geomRealized.left} + ${geomRealized.width} - 10px)` }}>
                        <span className={`w-3.5 h-3.5 rotate-45 border border-surface shadow-xs flex items-center justify-center ${
                          isComplete ? 'bg-tertiary' : isDelay ? 'bg-error' : 'bg-[#b28600]'
                        }`}>
                          {isComplete && (
                            <span className="material-symbols-outlined -rotate-45 text-[9px] text-white font-bold">check</span>
                          )}
                        </span>
                        <span className={`text-[10px] font-bold bg-surface px-1 shadow-xs border border-surface-container-high ${
                          isComplete ? 'text-tertiary' : isDelay ? 'text-error' : 'text-[#b28600]'
                        }`}>
                          {phase.milestoneCode}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Footer Legend */}
          <div className="p-3 bg-surface-container-low border-t border-surface-container-high flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-on-surface-variant text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-tertiary inline-block"></span>
                <span>Realizado (On Track)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-primary inline-block"></span>
                <span>Em Andamento</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-error inline-block"></span>
                <span>Atrasado (Caminho Crítico)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-on-surface-variant/45 inline-block"></span>
                <span>Baseline ({comparisonBaseline.versionName})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-[3px] h-3.5 bg-on-surface inline-block"></span>
                <span>Marca de Avanço (%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rotate-45 bg-[#b28600] inline-block"></span>
                <span>Marco (Milestone)</span>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-on-surface">
              {timeScale === 'mensal' ? 'Escala Mensal: Ago 2024 - Dez 2025' : timeScale === 'semanal' ? 'Escala Semanal: W40 - W51' : 'Lookahead Diário: 14 Dias'}
            </span>
          </div>
        </div>
      </div>

      {/* ÁREA INFERIOR AUTOMATIZADA: CARD DE MITIGAÇÃO DINÂMICO & CHECKLIST DE MARCOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Detalhamento Dinâmico do Marco Selecionado */}
        <div className="lg:col-span-2 bg-surface-container-low p-5 shadow-sm border border-surface-container-high flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-container-high pb-3">
              <div className="flex items-center gap-2.5">
                <span className={`w-5 h-5 rotate-45 flex items-center justify-center shrink-0 ${
                  isSelectedDelayed ? 'bg-error' : isSelectedComplete ? 'bg-tertiary' : 'bg-primary'
                }`}>
                  <span className="material-symbols-outlined -rotate-45 text-xs text-white">
                    {isSelectedComplete ? 'check' : isSelectedDelayed ? 'priority_high' : 'flag'}
                  </span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      isSelectedDelayed ? 'text-error' : isSelectedComplete ? 'text-tertiary' : 'text-primary'
                    }`}>
                      Marco Selecionado: {selectedPhase?.milestoneCode || `Fase #${selectedPhase?.order}`}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase font-mono ${
                      isSelectedDelayed 
                        ? 'bg-error text-on-error' 
                        : isSelectedComplete 
                          ? 'bg-tertiary text-on-tertiary' 
                          : 'bg-primary text-on-primary'
                    }`}>
                      {isSelectedDelayed ? 'Impacto Alto' : isSelectedComplete ? '100% Concluído' : 'No Prazo'}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-on-surface">{selectedPhase?.name}</h2>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-on-surface-variant uppercase font-semibold">Data Base Original</span>
                <p className="text-xs font-bold text-on-surface font-mono">
                  {selectedPhaseDates.originalEnd} &rarr;{' '}
                  <span className={isSelectedDelayed ? 'text-error' : 'text-tertiary'}>
                    {isSelectedDelayed ? `Reprog: ${selectedPhaseDates.reprogEnd}` : 'No Prazo'}
                  </span>
                </p>
              </div>
            </div>

            {/* 3 Caixas de Diagnóstico Dinâmicas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-surface p-3 border border-surface-container-high">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Responsável Técnico</span>
                <p className="font-bold text-on-surface mt-1 truncate">{selectedPhase?.contractor || activeProject.engineer}</p>
                <p className="text-[11px] text-on-surface-variant">Homologação Técnica PBQP-H</p>
              </div>

              <div className="bg-surface p-3 border border-surface-container-high">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Gargalo / Causa Raiz</span>
                <p className={`font-bold mt-1 truncate ${isSelectedDelayed ? 'text-error' : 'text-on-surface'}`}>
                  {selectedPhase?.notes 
                    ? selectedPhase.notes.split('.')[0] 
                    : isSelectedDelayed 
                      ? `Desvio de ${Math.abs(selectedPhase?.delayDays || 14)}d da meta EVM` 
                      : isSelectedComplete 
                        ? 'Etapa finalizada com sucesso' 
                        : 'Ritmo produtivo em conformidade'}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  {isSelectedDelayed ? 'Requer aceleração de equipe' : 'Sem desvios cadastrados'}
                </p>
              </div>

              <div className="bg-surface p-3 border border-surface-container-high">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Cadeia de Impacto</span>
                <p className="font-bold text-on-surface mt-1 truncate">
                  {nextPhase ? nextPhase.name : 'Vistoria Final & Habite-se'}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  {nextPhase ? `Subordinação direta EAP #${nextPhase.order}` : 'Entrega das chaves aos clientes'}
                </p>
              </div>
            </div>

            {/* Caixa do Plano de Mitigação Automatizado */}
            <div className="bg-surface p-4 border border-surface-container-high space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">task_alt</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                    {isSelectedDelayed ? 'Plano de Mitigação & Reprogramação Homologado' : 'Diretriz de Execução do Marco'}
                  </span>
                </div>
                {isSelectedDelayed && (
                  <button
                    type="button"
                    disabled={isGeneratingAi}
                    onClick={handleGenerateAiMitigation}
                    className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[10px] flex items-center gap-1 transition-colors border border-primary/20 cursor-pointer"
                    title="Pedir para a IA sugerir plano de recuperação 5W2H"
                  >
                    <span className="material-symbols-outlined text-xs">auto_awesome</span>
                    <span>{isGeneratingAi ? 'Gerando...' : 'Sugerir com IA'}</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line font-mono text-[11px]">
                {mitigationPlanText}
              </p>
            </div>
          </div>

          {/* Footer de Ações do Marco */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-container-high">
            <span className="text-xs text-on-surface-variant font-mono">
              Auditoria: Marco {selectedPhase?.milestoneCode || selectedPhase?.order} vinculado à Obra {activeProject.code}
            </span>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setIsEvidenceModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-xs font-semibold transition-colors border border-emerald-500/30 flex items-center gap-1.5"
                title="Visualizar galeria de fotos auditadas e notas de RDO associadas a este marco"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
                <span>Fotos &amp; RDOs</span>
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('diario-de-obra-rdo')}
                className="px-3 py-1.5 bg-surface text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors border border-surface-container-high"
              >
                Abrir RDO #{activeProject.rdoNumber}
              </button>

              <button 
                type="button"
                onClick={() => selectedPhase && setEditingPhase(selectedPhase)}
                className="px-3 py-1.5 bg-surface-container text-primary text-xs font-bold hover:bg-surface-container-high transition-colors border border-surface-container-high"
              >
                Editar Medição
              </button>
              <button 
                type="button"
                onClick={handleApproveMitigation}
                className="px-3 py-1.5 bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
              >
                Aprovar Linha Reprogramada
              </button>
            </div>
          </div>
        </div>

        {/* Right Card: Marcos Regulatórios & Contratuais 100% Dinâmico */}
        <div className="bg-surface-container-low p-5 shadow-sm border border-surface-container-high flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                Marcos Regulatórios &amp; Contratuais
              </span>
              <span className="text-xs font-mono font-bold text-tertiary">
                {milestoneCount.percent}% Concluídos
              </span>
            </div>

            {/* Lista Interativa de Marcos */}
            <div className="space-y-2 text-xs">
              {milestonesList.map((mPhase) => {
                const isSelected = selectedMilestone.toLowerCase() === (mPhase.milestoneCode?.toLowerCase() || `phase-${mPhase.order}`);
                const isComplete = mPhase.progressPercent >= 100;
                const isDelay = mPhase.status === 'atrasado' || (mPhase.delayDays && mPhase.delayDays < 0);
                const isPending = mPhase.progressPercent === 0;

                return (
                  <div 
                    key={mPhase.id}
                    onClick={() => {
                      if (mPhase.milestoneCode) setSelectedMilestone(mPhase.milestoneCode.toLowerCase());
                      else setSelectedMilestone(`phase-${mPhase.order}`);
                    }}
                    className={`p-2.5 flex items-center justify-between border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary' 
                        : isDelay 
                          ? 'border-error/40 bg-surface hover:bg-error-container/10' 
                          : 'border-surface-container-high bg-surface hover:bg-surface-container-low'
                    }`}
                    title={`Clique para visualizar o plano de ação de ${mPhase.name}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      <span className={`w-3.5 h-3.5 rotate-45 shrink-0 flex items-center justify-center ${
                        isComplete ? 'bg-tertiary' : isDelay ? 'bg-error' : isPending ? 'bg-surface-container-highest' : 'bg-primary'
                      }`}>
                        {isComplete && <span className="material-symbols-outlined -rotate-45 text-[9px] text-white font-bold">check</span>}
                      </span>
                      <div className="min-w-0">
                        <span className={`font-semibold block truncate text-xs ${
                          isSelected ? 'text-primary font-bold' : isDelay ? 'text-error font-bold' : 'text-on-surface'
                        }`}>
                          {mPhase.milestoneCode ? `${mPhase.milestoneCode}: ` : ''}{mPhase.name.replace(/^\d+\.\s*/, '')}
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-mono">
                          {isComplete 
                            ? `Concluído (${mPhase.period.split('-')[1]?.trim() || '100%'})`
                            : isDelay 
                              ? `Atraso: ${Math.abs(mPhase.delayDays || 14)} dias corridos` 
                              : isPending 
                                ? `Previsto: ${mPhase.period.split('-')[1]?.trim() || 'Pendente'}` 
                                : `Meta: ${mPhase.period.split('-')[1]?.trim() || 'Em Dia'} (${mPhase.progressPercent.toFixed(1)}%)`
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isComplete ? (
                        <span className="material-symbols-outlined text-tertiary text-base">check_circle</span>
                      ) : isDelay ? (
                        <span className="material-symbols-outlined text-error text-base">warning</span>
                      ) : isPending ? (
                        <span className="text-[10px] font-mono text-on-surface-variant font-semibold">Pendente</span>
                      ) : (
                        <span className="text-[10px] font-bold text-primary uppercase font-mono">Em Dia</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-surface-container-high">
            <button 
              type="button"
              onClick={() => showToast('Abrindo livro de licenças e alvarás municipais...', 'info')}
              className="text-xs font-semibold text-primary hover:underline flex items-center justify-between w-full"
            >
              <span>Ver Livro de Ocorrências &amp; Licenças</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Lançamento de Medição / Linha de Base */}
      <GanttPhaseEditModal 
        phase={editingPhase} 
        onClose={() => setEditingPhase(null)} 
      />

      {/* Modal para Adicionar Nova Atividade na EAP */}
      <GanttNewPhaseModal
        isOpen={isNewPhaseOpen}
        onClose={() => setIsNewPhaseOpen(false)}
      />

      {/* Modal para Exportação MS-Project XML e PDF Executivo */}
      <GanttExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Modal de Gestão e Congelamento da Linha de Base */}
      <GanttBaselineModal
        isOpen={isBaselineOpen}
        onClose={() => setIsBaselineOpen(false)}
      />

      {/* Modal da Curva S Físico-Financeira & EVM */}
      <GanttCurvaSModal
        isOpen={isCurvaSOpen}
        onClose={() => setIsCurvaSOpen(false)}
        project={activeProject}
        wbsPhases={wbsPhases}
        activeBaselineName={activeBaseline.versionName}
      />

      {/* Modal de Lookahead Planning & Gestão de Restrições (Lean) */}
      <GanttLookaheadModal
        isOpen={isLookaheadOpen}
        onClose={() => setIsLookaheadOpen(false)}
        wbsPhases={wbsPhases}
        restrictions={restrictions}
        onAddRestriction={addRestriction}
        onUpdateStatus={updateRestrictionStatus}
        onDeleteRestriction={deleteRestriction}
      />

      {/* Modal de Evidências Fotográficas e Conexão RDO por Etapa */}
      <GanttPhaseEvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        phase={selectedPhase}
        photoEvidences={photoEvidences}
        rdoNotes={rdoNotes}
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
      />
    </div>
  );
};

