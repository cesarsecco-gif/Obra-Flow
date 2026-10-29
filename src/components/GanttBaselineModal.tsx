import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface GanttBaselineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GanttBaselineModal: React.FC<GanttBaselineModalProps> = ({ isOpen, onClose }) => {
  const { 
    activeProject, 
    wbsPhases, 
    savedBaselines, 
    activeBaselineId, 
    comparisonBaselineId, 
    setComparisonBaselineId, 
    createBaselineSnapshot, 
    activateBaseline, 
    deleteBaselineSnapshot 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'historico' | 'congelar'>('historico');
  const [versionName, setVersionName] = useState<string>('v1.3');
  const [justification, setJustification] = useState<string>('Replanejamento do Marco M3 de Alvenaria e remanejamento de mão de obra.');
  const [cutoffDate, setCutoffDate] = useState<string>('2024-10-24');
  const [expandedBaselineId, setExpandedBaselineId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFreeze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionName.trim()) return;

    createBaselineSnapshot(versionName, justification, cutoffDate);
    setActiveTab('historico');
  };

  const totalWeight = wbsPhases.reduce((acc, p) => acc + p.weightPercent, 0);
  const activeBaseline = savedBaselines.find(b => b.id === activeBaselineId) || savedBaselines[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface max-w-3xl w-full p-6 shadow-2xl border border-surface-container-high my-auto animate-fadeIn font-body">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-surface-container-high">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">difference</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary font-mono">
                Gestão de Linha de Base (Baseline)
              </span>
            </div>
            <h2 className="text-base font-bold text-on-surface mt-1">Gerenciador de Linhas de Base Salvas</h2>
            <p className="text-xs text-on-surface-variant">
              Empreendimento: <strong>{activeProject.name}</strong> • Linha Vigente: <strong className="text-primary">{activeBaseline?.versionName || 'v1.2'}</strong>
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
            onClick={() => setActiveTab('historico')}
            className={`px-3 py-1.5 font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'historico' 
                ? 'bg-primary text-on-primary shadow-xs' 
                : 'text-on-surface-variant hover:text-on-surface bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-sm">history</span>
            <span>1. Linhas de Base Salvas ({savedBaselines.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('congelar')}
            className={`px-3 py-1.5 font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'congelar' 
                ? 'bg-primary text-on-primary shadow-xs' 
                : 'text-on-surface-variant hover:text-on-surface bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-sm">lock_clock</span>
            <span>2. Congelar Nova Linha de Base (Salvar Snapshot)</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'historico' && (
          <div className="py-4 space-y-4 text-xs">
            {/* KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-surface-container border border-surface-container-high">
                <span className="text-[10px] text-on-surface-variant block uppercase font-mono">Linha de Base Ativa</span>
                <span className="text-sm font-bold text-primary font-mono mt-0.5 block">
                  {activeBaseline?.versionName} — {activeBaseline?.name}
                </span>
                <span className="text-[10px] text-on-surface-variant">{activeBaseline?.createdFormatted}</span>
              </div>

              <div className="p-3 bg-surface-container border border-surface-container-high">
                <span className="text-[10px] text-on-surface-variant block uppercase font-mono">Em Comparação no Gantt</span>
                <span className="text-sm font-bold text-tertiary font-mono mt-0.5 block">
                  {savedBaselines.find(b => b.id === comparisonBaselineId)?.versionName || 'Nenhuma'}
                </span>
                <span className="text-[10px] text-on-surface-variant">Barras cinzas de fundo no gráfico</span>
              </div>

              <div className="p-3 bg-surface-container border border-surface-container-high">
                <span className="text-[10px] text-on-surface-variant block uppercase font-mono">Soma dos Pesos EAP</span>
                <span className={`text-sm font-bold font-mono mt-0.5 block ${totalWeight === 100 ? 'text-tertiary' : 'text-error'}`}>
                  {totalWeight}%
                </span>
                <span className="text-[10px] text-on-surface-variant">
                  {totalWeight === 100 ? 'Ponderação calibrada em 100%' : 'Atenção: soma dos pesos difere de 100%'}
                </span>
              </div>
            </div>

            {/* Lista Interativa de Linhas de Base Salvas */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {savedBaselines.map((baseline) => {
                const isCurrentActive = baseline.id === activeBaselineId;
                const isComparing = baseline.id === comparisonBaselineId;
                const isExpanded = expandedBaselineId === baseline.id;

                return (
                  <div 
                    key={baseline.id} 
                    className={`border transition-all ${
                      isCurrentActive 
                        ? 'border-primary bg-primary/5' 
                        : isComparing 
                          ? 'border-tertiary bg-tertiary/5' 
                          : 'border-surface-container-high bg-surface-container-low hover:border-outline'
                    }`}
                  >
                    <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 font-bold font-mono text-xs bg-surface text-on-surface border border-surface-container-highest">
                            {baseline.versionName}
                          </span>
                          <span className="font-bold text-on-surface text-sm">{baseline.name}</span>
                          {isCurrentActive && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-primary text-on-primary font-mono uppercase">
                              Vigente
                            </span>
                          )}
                          {isComparing && !isCurrentActive && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-tertiary text-on-tertiary font-mono uppercase">
                              Comparando no Gantt
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">
                          {baseline.justification || 'Sem justificativa informada.'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-on-surface-variant font-mono pt-0.5">
                          <span>Criado em: <strong>{baseline.createdFormatted}</strong></span>
                          <span>•</span>
                          <span>Autor: <strong>{baseline.author}</strong></span>
                          <span>•</span>
                          <span>Fases: <strong>{baseline.phasesCount || baseline.phases?.length || 8}</strong></span>
                        </div>
                      </div>

                      {/* Ações da Linha de Base */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setExpandedBaselineId(isExpanded ? null : baseline.id)}
                          className="px-2.5 py-1.5 bg-surface text-on-surface hover:bg-surface-container border border-surface-container-high text-xs font-semibold flex items-center gap-1"
                          title="Visualizar fases salvas nesta baseline"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isExpanded ? 'expand_less' : 'visibility'}
                          </span>
                          <span>{isExpanded ? 'Recolher' : 'Ver Fases'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setComparisonBaselineId(baseline.id)}
                          className={`px-2.5 py-1.5 border text-xs font-semibold flex items-center gap-1 transition-colors ${
                            isComparing 
                              ? 'bg-tertiary text-on-tertiary border-tertiary' 
                              : 'bg-surface text-tertiary border-tertiary/40 hover:bg-tertiary/10'
                          }`}
                          title="Exibir esta baseline como barra cinza no gráfico de Gantt"
                        >
                          <span className="material-symbols-outlined text-sm">difference</span>
                          <span>{isComparing ? 'Comparando' : 'Comparar no Gantt'}</span>
                        </button>

                        {!isCurrentActive && (
                          <button
                            type="button"
                            onClick={() => activateBaseline(baseline.id)}
                            className="px-2.5 py-1.5 bg-primary text-on-primary hover:bg-primary/90 text-xs font-bold transition-colors shadow-xs"
                            title="Tornar esta versão a Linha de Base oficial do projeto"
                          >
                            Ativar Vigente
                          </button>
                        )}

                        {baseline.versionName !== 'v1.0' && baseline.versionName !== 'v1.2' && (
                          <button
                            type="button"
                            onClick={() => deleteBaselineSnapshot(baseline.id)}
                            className="p-1.5 text-error hover:bg-error-container/20 border border-error/30"
                            title="Excluir este snapshot de baseline"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Fases Detalhadas se Expandido */}
                    {isExpanded && baseline.phases && (
                      <div className="border-t border-surface-container-high bg-surface p-3 space-y-1.5 text-[11px] font-mono">
                        <div className="font-bold text-on-surface uppercase text-[10px] pb-1 border-b border-surface-container-high flex justify-between">
                          <span>Fases Congeladas nesta Versão</span>
                          <span>Período Planejado • Peso</span>
                        </div>
                        <div className="divide-y divide-surface-container-high/60 max-h-36 overflow-y-auto">
                          {baseline.phases.map(p => (
                            <div key={p.phaseId || p.order} className="py-1 flex items-center justify-between">
                              <span className="text-on-surface truncate pr-2">#{p.order} {p.name}</span>
                              <span className="text-on-surface-variant shrink-0">{p.period} ({p.weightPercent}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Congelar Nova Linha de Base */}
        {activeTab === 'congelar' && (
          <form onSubmit={handleFreeze} className="py-4 space-y-4 text-xs">
            <div className="p-3.5 bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">lock_clock</span>
                <span className="font-bold text-on-surface text-xs uppercase tracking-wider">
                  Congelar Nova Linha de Base (Rebaseline Oficial)
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Ao congelar, o estado atual de todas as <strong>{wbsPhases.length} atividades da EAP</strong> (datas de início/fim da Linha de Base e pesos ponderados) será salvo como um snapshot permanente e homologado.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-on-surface">Identificador da Versão *</label>
                <input
                  type="text"
                  required
                  value={versionName}
                  onChange={e => setVersionName(e.target.value)}
                  placeholder="Ex: v1.3"
                  className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-on-surface">Data de Corte de Referência *</label>
                <input
                  type="date"
                  required
                  value={cutoffDate}
                  onChange={e => setCutoffDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-on-surface">Justificativa Técnica / Motivo do Replanejamento *</label>
              <textarea
                required
                rows={3}
                value={justification}
                onChange={e => setJustification(e.target.value)}
                placeholder="Ex: Aditivo Contratual nº 02 - Reprogramação de Alvenaria e remanejamento de 6 pedreiros para compensação de ritmo..."
                className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface text-[11px] focus:outline-hidden"
              />
            </div>

            <div className="p-3 bg-surface-container border border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-tertiary">check_circle</span>
                <span className="text-[11px]">Snapshot capturará <strong>{wbsPhases.length} fases ativas</strong> com soma de pesos de <strong>{totalWeight}%</strong>.</span>
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-primary text-on-primary font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Congelar e Salvar Agora</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-container-high">
          <span className="text-[11px] text-on-surface-variant font-mono">
            Rastreabilidade e auditoria SGQ / PBQP-H
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-surface-container-highest text-xs font-semibold text-on-surface hover:bg-surface-container"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
