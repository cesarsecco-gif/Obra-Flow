import React, { useState } from 'react';
import { LookaheadRestriction, WbsPhase } from '../types';

interface GanttLookaheadModalProps {
  isOpen: boolean;
  onClose: () => void;
  wbsPhases: WbsPhase[];
  restrictions: LookaheadRestriction[];
  onAddRestriction: (r: Omit<LookaheadRestriction, 'id'>) => void;
  onUpdateStatus: (id: string, status: LookaheadRestriction['status']) => void;
  onDeleteRestriction: (id: string) => void;
}

export const GanttLookaheadModal: React.FC<GanttLookaheadModalProps> = ({
  isOpen,
  onClose,
  wbsPhases,
  restrictions,
  onAddRestriction,
  onUpdateStatus,
  onDeleteRestriction
}) => {
  const [selectedWeek, setSelectedWeek] = useState<string>('todas');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [newPhaseId, setNewPhaseId] = useState<string>(wbsPhases[0]?.id || 'phase-4');
  const [newCategory, setNewCategory] = useState<LookaheadRestriction['category']>('suprimentos');
  const [newDescription, setNewDescription] = useState('');
  const [newResponsible, setNewResponsible] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newWeekLabel, setNewWeekLabel] = useState('Semana 44 (28/Out - 01/Nov)');

  if (!isOpen) return null;

  // Semanas disponíveis
  const weeks = [
    'Semana 43 (21/Out - 25/Out)',
    'Semana 44 (28/Out - 01/Nov)',
    'Semana 45 (04/Nov - 08/Nov)',
    'Semana 46 (11/Nov - 15/Nov)',
    'Semana 47 (18/Nov - 22/Nov)',
    'Semana 48 (25/Nov - 29/Nov)'
  ];

  // Cálculo de PPC (Percentual de Planos Concluídos)
  const totalCount = restrictions.length;
  const liberatedCount = restrictions.filter(r => r.status === 'liberado').length;
  const inProgressCount = restrictions.filter(r => r.status === 'em_tratativa').length;
  const pendingCount = restrictions.filter(r => r.status === 'pendente').length;
  const ppcPercent = totalCount > 0 ? Math.round((liberatedCount / totalCount) * 100) : 100;

  // Filtragem
  const filteredRestrictions = restrictions.filter(r => {
    if (selectedWeek !== 'todas' && r.weekLabel !== selectedWeek) return false;
    if (selectedCategory !== 'todas' && r.category !== selectedCategory) return false;
    return true;
  });

  const categoryConfig: Record<LookaheadRestriction['category'], { label: string; icon: string; color: string }> = {
    projetos: { label: 'Projetos', icon: 'architecture', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
    suprimentos: { label: 'Suprimentos', icon: 'local_shipping', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    mao_de_obra: { label: 'Mão de Obra', icon: 'engineering', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    equipamentos: { label: 'Equipamentos', icon: 'precision_manufacturing', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    liberacao: { label: 'Liberação de Frente', icon: 'fact_check', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim() || !newResponsible.trim()) return;

    const phase = wbsPhases.find(p => p.id === newPhaseId);
    onAddRestriction({
      phaseId: newPhaseId,
      phaseName: phase ? phase.name : 'Etapa Geral',
      category: newCategory,
      categoryLabel: categoryConfig[newCategory].label,
      description: newDescription.trim(),
      responsible: newResponsible.trim(),
      dueDate: newDueDate.trim() || 'A definir',
      status: 'pendente',
      weekLabel: newWeekLabel
    });

    setNewDescription('');
    setNewResponsible('');
    setNewDueDate('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-[24px]">view_timeline</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white tracking-wide">
                  Lookahead Planning & Gestão de Restrições
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Lean Construction / Last Planner
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Janela de Médio Prazo (6 Semanas) • Remoção Antecipada de Bloqueios • Estabilidade do Ritmo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-300 font-medium flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">{isAdding ? 'close' : 'add'}</span>
              {isAdding ? 'Cancelar' : '+ Nova Restrição'}
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
          {/* Top Lean Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* PPC */}
            <div className={`p-4 rounded-xl border ${ppcPercent >= 80 ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-amber-950/20 border-amber-500/30'} flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">PPC (Planos Concluídos)</span>
                <span className={`material-symbols-outlined text-base ${ppcPercent >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {ppcPercent >= 80 ? 'task_alt' : 'schedule'}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className={`text-3xl font-bold font-mono ${ppcPercent >= 80 ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {ppcPercent}%
                </div>
                <span className="text-xs text-slate-400">meta: &ge; 80%</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {liberatedCount} de {totalCount} restrições resolvidas
              </div>
            </div>

            {/* Liberadas */}
            <div className="p-4 rounded-xl border bg-slate-800/60 border-slate-700/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Liberadas</span>
                <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
                {liberatedCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Frentes liberadas para produção
              </div>
            </div>

            {/* Em Tratativa */}
            <div className="p-4 rounded-xl border bg-slate-800/60 border-slate-700/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Em Tratativa</span>
                <span className="material-symbols-outlined text-base text-amber-400">pending</span>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
                {inProgressCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Ações em andamento com fornecedores
              </div>
            </div>

            {/* Pendentes / Críticas */}
            <div className="p-4 rounded-xl border bg-slate-800/60 border-slate-700/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Pendentes (Risco)</span>
                <span className="material-symbols-outlined text-base text-red-400">warning</span>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-red-400">
                {pendingCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Podem paralisar frentes críticas
              </div>
            </div>
          </div>

          {/* New Restriction Inline Form */}
          {isAdding && (
            <form onSubmit={handleCreate} className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/10 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  Cadastrar Nova Restrição de Produção
                </h4>
                <span className="text-[11px] text-slate-400">Identificação antecipada de impedimentos</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">Etapa Vinculada (EAP)</label>
                  <select
                    value={newPhaseId}
                    onChange={(e) => setNewPhaseId(e.target.value)}
                    className="w-full text-xs rounded-lg bg-slate-900 border border-slate-700 text-white px-3 py-2 focus:border-amber-500 outline-none"
                  >
                    {wbsPhases.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">Categoria da Restrição</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as LookaheadRestriction['category'])}
                    className="w-full text-xs rounded-lg bg-slate-900 border border-slate-700 text-white px-3 py-2 focus:border-amber-500 outline-none"
                  >
                    <option value="suprimentos">Suprimentos & Materiais</option>
                    <option value="mao_de_obra">Mão de Obra</option>
                    <option value="projetos">Projetos & Compatibilização</option>
                    <option value="equipamentos">Equipamentos & Logística</option>
                    <option value="liberacao">Liberação de Frente & Qualidade</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">Janela Lookahead (Semana)</label>
                  <select
                    value={newWeekLabel}
                    onChange={(e) => setNewWeekLabel(e.target.value)}
                    className="w-full text-xs rounded-lg bg-slate-900 border border-slate-700 text-white px-3 py-2 focus:border-amber-500 outline-none"
                  >
                    {weeks.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">Descrição do Impedimento / Ação Necessária</label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Ex: Entrega de lote de blocos cerâmicos pela Cerâmica União..."
                    className="w-full text-xs rounded-lg bg-slate-900 border border-slate-700 text-white px-3 py-2 focus:border-amber-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">Responsável / Data Limite</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newResponsible}
                      onChange={(e) => setNewResponsible(e.target.value)}
                      placeholder="Ex: Suprimentos"
                      className="w-full text-xs rounded-lg bg-slate-900 border border-slate-700 text-white px-3 py-2 focus:border-amber-500 outline-none"
                      required
                    />
                    <input
                      type="text"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      placeholder="Ex: 30/Out/2024"
                      className="w-full text-xs rounded-lg bg-slate-900 border border-slate-700 text-white px-3 py-2 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-md shadow-amber-500/20"
                >
                  Salvar Restrição
                </button>
              </div>
            </form>
          )}

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-sm">filter_alt</span>
              <span className="text-xs font-medium text-slate-300">Filtrar por:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="text-xs rounded-lg bg-slate-900 border border-slate-700 text-white px-2.5 py-1.5 outline-none"
              >
                <option value="todas">Todas as Semanas (Lookahead 6 sem)</option>
                {weeks.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs rounded-lg bg-slate-900 border border-slate-700 text-white px-2.5 py-1.5 outline-none"
              >
                <option value="todas">Todas as Categorias</option>
                <option value="suprimentos">Suprimentos</option>
                <option value="mao_de_obra">Mão de Obra</option>
                <option value="projetos">Projetos</option>
                <option value="equipamentos">Equipamentos</option>
                <option value="liberacao">Liberação de Frente</option>
              </select>
            </div>
          </div>

          {/* List of Restrictions */}
          <div className="space-y-3">
            {filteredRestrictions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
                <span className="material-symbols-outlined text-slate-600 text-3xl">task_alt</span>
                <p className="text-xs text-slate-400 mt-2">Nenhuma restrição encontrada para os filtros selecionados.</p>
              </div>
            ) : (
              filteredRestrictions.map(r => {
                const cat = categoryConfig[r.category] || categoryConfig.suprimentos;
                const isLiberated = r.status === 'liberado';
                const isInProgress = r.status === 'em_tratativa';

                return (
                  <div
                    key={r.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isLiberated
                        ? 'bg-emerald-950/10 border-emerald-500/20'
                        : isInProgress
                        ? 'bg-amber-950/10 border-amber-500/20'
                        : 'bg-red-950/10 border-red-500/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${cat.color}`}>
                          <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-white">{r.phaseName}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${cat.color}`}>
                              {cat.label}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {r.weekLabel}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 mt-1 font-medium">{r.description}</p>
                          {r.notes && (
                            <p className="text-[11px] text-slate-400 mt-1 italic">
                              Nota de campo: {r.notes}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs text-slate-500">person</span>
                              Resp: <strong className="text-slate-300">{r.responsible}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs text-slate-500">event</span>
                              Limite: <strong className="text-slate-300">{r.dueDate}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Status Button Toggle */}
                        <div className="flex items-center rounded-lg bg-slate-900 border border-slate-700 p-0.5">
                          <button
                            onClick={() => onUpdateStatus(r.id, 'pendente')}
                            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                              r.status === 'pendente'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Pendente
                          </button>
                          <button
                            onClick={() => onUpdateStatus(r.id, 'em_tratativa')}
                            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                              r.status === 'em_tratativa'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Tratando
                          </button>
                          <button
                            onClick={() => onUpdateStatus(r.id, 'liberado')}
                            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                              r.status === 'liberado'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Liberado
                          </button>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => onDeleteRestriction(r.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                          title="Remover restrição"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-amber-400">psychology</span>
            <span>Last Planner System: frentes só devem ser iniciadas após 100% das restrições liberadas.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Fechar Lookahead
          </button>
        </div>
      </div>
    </div>
  );
};
