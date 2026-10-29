import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WbsPhase } from '../types';

interface GanttNewPhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const GanttNewPhaseModal: React.FC<GanttNewPhaseModalProps> = ({ isOpen, onClose }) => {
  const { addWbsPhase, wbsPhases, activeProject } = useApp();

  const nextOrderNumber = wbsPhases.length + 1;
  const [name, setName] = useState<string>(`${nextOrderNumber}. `);
  const [startDate, setStartDate] = useState<string>('2024-11-01');
  const [endDate, setEndDate] = useState<string>('2025-03-31');
  const [weightPercent, setWeightPercent] = useState<number>(10);
  const [contractor, setContractor] = useState<string>('Construtora Principal');
  const [isCritical, setIsCritical] = useState<boolean>(false);
  const [milestoneCode, setMilestoneCode] = useState<string>('');
  const [initialProgress, setInitialProgress] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Formata o período de visualização
    const sParts = startDate.split('-');
    const eParts = endDate.split('-');
    let periodFormatted = `${startDate} - ${endDate}`;
    if (sParts.length === 3 && eParts.length === 3) {
      const sDay = sParts[2];
      const sMon = MONTH_NAMES[parseInt(sParts[1], 10) - 1] || 'Jan';
      const sYr = sParts[0].slice(2);
      const eDay = eParts[2];
      const eMon = MONTH_NAMES[parseInt(eParts[1], 10) - 1] || 'Jan';
      const eYr = eParts[0].slice(2);
      periodFormatted = `${sDay}/${sMon}/${sYr} - ${eDay}/${eMon}/${eYr}`;
    }

    const newPhase: Omit<WbsPhase, 'id' | 'order'> = {
      name: name.trim(),
      period: periodFormatted,
      progressPercent: Number(initialProgress),
      weightPercent: Number(weightPercent),
      status: initialProgress >= 100 ? 'concluido' : initialProgress > 0 ? 'em_andamento' : 'nao_iniciado',
      isCritical,
      milestoneCode: milestoneCode.trim() ? milestoneCode.trim().toUpperCase() : undefined,
      contractor: contractor.trim() || undefined,
      notes: notes.trim() || undefined,
      baselineStart: startDate,
      baselineEnd: endDate
    };

    addWbsPhase(newPhase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface max-w-lg w-full p-6 shadow-2xl border border-surface-container-high my-auto animate-fadeIn font-body">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-surface-container-high">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">add_task</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary font-mono">
                Estrutura Analítica do Projeto (EAP)
              </span>
            </div>
            <h2 className="text-base font-bold text-on-surface mt-1">Adicionar Nova Atividade / Fase</h2>
            <p className="text-xs text-on-surface-variant">
              Defina o nome, cronograma planejado (Linha de Base) e peso ponderado da atividade.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 py-4 text-xs">
          {/* Nome da Atividade */}
          <div className="space-y-1">
            <label className="font-semibold text-on-surface flex items-center justify-between">
              <span>Nome da Atividade / Fase da EAP *</span>
              <span className="text-[10px] text-on-surface-variant font-mono">Item #{nextOrderNumber}</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: 9. Instalação de Elevadores &amp; Escadas Rolantes"
              className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface font-semibold focus:outline-hidden"
            />
          </div>

          {/* Linha de Base (Datas Início e Fim) */}
          <div className="p-3 bg-surface-container-low border border-surface-container-high space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">calendar_month</span>
              Linha de Base Contratual (Datas Planejadas)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-on-surface-variant">Data de Início Planejada *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-highest text-on-surface font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-on-surface-variant">Data de Término Planejada *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-highest text-on-surface font-mono"
                />
              </div>
            </div>
          </div>

          {/* Peso Ponderado e % Inicial */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-on-surface">Peso na EAP (%) *</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  required
                  min="0.5"
                  max="100"
                  step="0.5"
                  value={weightPercent}
                  onChange={e => setWeightPercent(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-surface-container border border-surface-container-high text-on-surface font-mono font-bold"
                />
                <span className="text-on-surface-variant font-mono font-bold">%</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-on-surface">Avanço Inicial (%)</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={initialProgress}
                  onChange={e => setInitialProgress(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-surface-container border border-surface-container-high text-on-surface font-mono font-bold"
                />
                <span className="text-on-surface-variant font-mono font-bold">%</span>
              </div>
            </div>
          </div>

          {/* Empreiteira e Marco Construtivo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-on-surface">Empreiteira / Encarregado</label>
              <input
                type="text"
                value={contractor}
                onChange={e => setContractor(e.target.value)}
                placeholder="Ex: Atlas Schindler / Eng. Carlos"
                className="w-full px-2.5 py-2 bg-surface-container border border-surface-container-high text-on-surface"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-on-surface">Código do Marco (Opcional)</label>
              <input
                type="text"
                value={milestoneCode}
                onChange={e => setMilestoneCode(e.target.value)}
                placeholder="Ex: M6, M7..."
                maxLength={4}
                className="w-full px-2.5 py-2 bg-surface-container border border-surface-container-high text-on-surface uppercase font-mono"
              />
            </div>
          </div>

          {/* Caminho Crítico CPM */}
          <div className="p-3 bg-surface-container border border-surface-container-high flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-lg ${isCritical ? 'text-error' : 'text-on-surface-variant'}`}>
                account_tree
              </span>
              <div>
                <span className="font-semibold text-on-surface block">Atividade do Caminho Crítico (CPM)</span>
                <span className="text-[10px] text-on-surface-variant">
                  Qualquer atraso nesta etapa postergará a data de entrega final da obra.
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

          {/* Observações */}
          <div className="space-y-1">
            <label className="font-semibold text-on-surface">Notas Técnicas / Pré-requisitos</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Depende da liberação do poço de elevador pela equipe de concreto..."
              className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface text-[11px] font-mono focus:outline-hidden"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-surface-container-high">
            <span className="text-[11px] text-on-surface-variant font-mono">
              Obra: {activeProject.code}
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
                type="submit"
                className="px-5 py-2 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Inserir na EAP</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
