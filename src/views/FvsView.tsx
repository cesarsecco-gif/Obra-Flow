import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FvsItem } from '../types';

export const FvsView: React.FC = () => {
  const { 
    fvsList, 
    approveFvs, 
    batchApproveFvs, 
    activeProject, 
    showToast,
    addAuditLog 
  } = useApp();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pendente' | 'urgente' | 'aprovado'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewFvs, setPreviewFvs] = useState<FvsItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New FVS modal state
  const [newTitle, setNewTitle] = useState('');
  const [newFront, setNewFront] = useState('Torre A - 14º Pav.');
  const [newContractor, setNewContractor] = useState('Aço & Forma Estruturas');
  const [newTolerance, setNewTolerance] = useState('Cobrim. mín. 3,0 cm (NBR 6118)');

  const filteredItems = fvsList.filter(item => {
    if (activeFilter === 'pendente' && item.status !== 'pendente') return false;
    if (activeFilter === 'aprovado' && !item.status.startsWith('aprovado')) return false;
    if (activeFilter === 'urgente' && item.discipline !== 'estrutural' && item.discipline !== 'impermeabilizacao') return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.front.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    batchApproveFvs(selectedIds);
    setSelectedIds([]);
    addAuditLog(`Aprovação em lote de ${selectedIds.length} FVS realizada`, 'FVS', 'Itens liberados para concretagem');
  };

  const handleApproveSingle = (id: string, reservation = false) => {
    approveFvs(id, reservation);
    addAuditLog(`FVS ${id} aprovada pelo RT`, 'FVS', reservation ? 'Aprovada com ressalva' : 'Aprovada sem ressalvas');
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Nova FVS "${newTitle}" registrada no SiAC Nível A com sucesso!`, 'success');
    addAuditLog('Nova FVS criada', 'FVS', `FVS de ${newFront} adicionada`);
    setIsNewModalOpen(false);
    setNewTitle('');
  };

  return (
    <div className="flex flex-col w-full space-y-6 font-body">
      {/* Top Breadcrumb & Metadata Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2 border-b border-surface-container-high">
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-normal">
          <span>Controle de Qualidade</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span>Auditorias &amp; Inspeções de Obra</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-on-surface font-semibold">FVS PBQP-H / SiAC</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-tertiary-container text-on-tertiary-container text-[11px] font-semibold tracking-wide uppercase">
            <span className="material-symbols-outlined text-xs">verified</span>
            SiAC Nível A Ativo
          </span>
          <span className="text-xs text-on-surface-variant font-mono hidden md:inline">
            Empreendimento: {activeProject.name}
          </span>
        </div>
      </div>

      {/* Primary Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="max-w-4xl">
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
            Auditorias &amp; Fichas de Verificação de Serviço (FVS)
          </h1>
          <p className="mt-1.5 text-xs md:text-sm text-on-surface-variant leading-relaxed">
            Gestão de conformidade técnica, tolerâncias executivas da NBR 15575 e aprovação formal de frentes liberadas para concretagem, alvenaria e instalações prediais.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start xl:self-end">
          <button 
            type="button"
            onClick={() => showToast('Compilando Livro FVS (.PDF) com assinaturas digitais ICP-Brasil...', 'info')}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors shadow-sm border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Exportar Livro FVS (.PDF)</span>
          </button>

          <button 
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-base">add_task</span>
            <span>+ Nova Verificação (FVS)</span>
          </button>
        </div>
      </div>

      {/* Quick KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-4 shadow-sm relative overflow-hidden flex flex-col justify-between h-32 border border-surface-container-high">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Verificações Pendentes</span>
            <span className="material-symbols-outlined text-primary text-xl">pending_actions</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface tracking-tight font-mono">14</span>
              <span className="text-xs text-error font-medium flex items-center">
                <span className="material-symbols-outlined text-xs">priority_high</span> 4 críticas
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Aguardando liberação do residente</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
        </div>

        <div className="bg-surface-container-low p-4 shadow-sm relative overflow-hidden flex flex-col justify-between h-32 border border-surface-container-high">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Conformidade 1ª Inspeção</span>
            <span className="material-symbols-outlined text-tertiary text-xl">verified</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface tracking-tight font-mono">94.2%</span>
              <span className="text-xs text-tertiary font-semibold flex items-center">
                <span className="material-symbols-outlined text-xs">arrow_upward</span> +2.1%
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-full bg-surface-container-high h-1.5 overflow-hidden">
                <div className="bg-tertiary h-full" style={{ width: '94.2%' }}></div>
              </div>
              <span className="text-[10px] text-on-surface-variant font-medium">Meta: 90%</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-tertiary"></div>
        </div>

        <div className="bg-surface-container-low p-4 shadow-sm relative overflow-hidden flex flex-col justify-between h-32 border border-surface-container-high">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">RNCs / Reprovações Ativas</span>
            <span className="material-symbols-outlined text-error text-xl">report_problem</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface tracking-tight font-mono">3</span>
              <span className="text-xs text-error font-medium">em retrabalho</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">2 na Torre A e 1 no Barrilete</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-error"></div>
        </div>

        <div className="bg-surface-container-low p-4 shadow-sm relative overflow-hidden flex flex-col justify-between h-32 border border-surface-container-high">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Planos de Inspeção Ativos</span>
            <span className="material-symbols-outlined text-secondary text-xl">account_tree</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface tracking-tight font-mono">8</span>
              <span className="text-xs text-on-surface-variant font-normal">disciplinas</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">142 itens de controle mapeados</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary"></div>
        </div>
      </div>

      {/* Primary Table Section */}
      <div className="bg-surface shadow-sm border border-surface-container-high">
        {/* Filter Bar Header */}
        <div className="p-4 bg-surface-container flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-container-high">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
            <button 
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-2 text-xs font-semibold border ${activeFilter === 'all' ? 'bg-surface text-primary border-primary shadow-sm' : 'bg-transparent text-on-surface-variant border-transparent hover:bg-surface-container-high'}`}
            >
              Todas as Pendências ({fvsList.length})
            </button>
            <button 
              type="button"
              onClick={() => setActiveFilter('urgente')}
              className={`px-3 py-2 text-xs font-semibold border ${activeFilter === 'urgente' ? 'bg-surface text-primary border-primary shadow-sm' : 'bg-transparent text-on-surface-variant border-transparent hover:bg-surface-container-high'}`}
            >
              Urgentes / Pré-Concretagem (4)
            </button>
            <button 
              type="button"
              onClick={() => setActiveFilter('pendente')}
              className={`px-3 py-2 text-xs font-semibold border ${activeFilter === 'pendente' ? 'bg-surface text-primary border-primary shadow-sm' : 'bg-transparent text-on-surface-variant border-transparent hover:bg-surface-container-high'}`}
            >
              Apenas Pendentes
            </button>
            <button 
              type="button"
              onClick={() => setActiveFilter('aprovado')}
              className={`px-3 py-2 text-xs font-semibold border ${activeFilter === 'aprovado' ? 'bg-surface text-primary border-primary shadow-sm' : 'bg-transparent text-on-surface-variant border-transparent hover:bg-surface-container-high'}`}
            >
              Homologadas &amp; Liberadas
            </button>
          </div>

          {/* Action & Search Strip */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-sm text-on-surface-variant">search</span>
              <input 
                type="text" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar código, item, local..." 
                className="w-full pl-8 pr-3 py-2 bg-surface text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary h-9 border border-surface-container-high"
              />
            </div>
            <button 
              type="button"
              onClick={handleBatchApprove}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-tertiary hover:bg-tertiary/90 text-on-tertiary text-xs font-bold whitespace-nowrap h-9 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">checklist</span>
              <span>Aprovação em Lote ({selectedIds.length})</span>
            </button>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-surface-container-high text-on-surface font-semibold text-[11px] uppercase tracking-wider border-b border-surface-container-high">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                    className="w-3.5 h-3.5 accent-primary cursor-pointer align-middle"
                  />
                </th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Código &amp; Item de Verificação</th>
                <th className="py-3 px-3">Local / Frente</th>
                <th className="py-3 px-3">Responsável / Empreiteira</th>
                <th className="py-3 px-3">Tolerância Normativa</th>
                <th className="py-3 px-3 text-center">Evidência</th>
                <th className="py-3 px-3 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {filteredItems.map(item => {
                const statusInfo = {
                  pendente: { badge: 'bg-[#fff8e1] text-[#b78103]', icon: 'schedule', label: 'Pendente Vistoria' },
                  aprovado: { badge: 'bg-tertiary-container text-on-tertiary-container', icon: 'check_circle', label: 'Aprovado / Liberado' },
                  aprovado_ressalva: { badge: 'bg-primary-container text-on-primary-fixed', icon: 'done_all', label: 'Aprov. c/ Ressalva' },
                  reprovado_rnc: { badge: 'bg-error-container text-on-error-container font-bold', icon: 'report_problem', label: 'Reprovado / RNC' },
                }[item.status];

                const isChecked = selectedIds.includes(item.id);

                return (
                  <tr key={item.id} className="hover:bg-surface-container-low transition-colors bg-surface">
                    <td className="py-3.5 px-3 text-center align-middle">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handleToggleSelect(item.id)}
                        className="w-3.5 h-3.5 accent-primary cursor-pointer align-middle"
                      />
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap align-middle">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold ${statusInfo.badge}`}>
                        <span className="material-symbols-outlined text-xs">{statusInfo.icon}</span>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 align-middle max-w-xs">
                      <div className="font-semibold text-on-surface">[{item.code}] {item.title}</div>
                      <div className="text-[11px] text-on-surface-variant truncate">{item.description}</div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap align-middle">
                      <span className="px-2 py-0.5 bg-surface-container text-on-surface font-medium text-[11px] border border-surface-container-high">
                        {item.front}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap align-middle">
                      <div className="font-medium text-on-surface">{item.responsible}</div>
                      <div className="text-[10px] text-on-surface-variant">{item.contractor}</div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap align-middle font-mono text-[11px] text-on-surface">
                      {item.standardTolerance}
                    </td>
                    <td className="py-3.5 px-3 text-center align-middle whitespace-nowrap">
                      <button 
                        type="button"
                        onClick={() => setPreviewFvs(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                      >
                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                        <span>Foto ({item.evidenceCount})</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap align-middle">
                      <div className="inline-flex items-center gap-1">
                        <button 
                          type="button" 
                          onClick={() => handleApproveSingle(item.id, false)}
                          title="Aprovar Conforme"
                          className="p-1.5 bg-tertiary-container hover:bg-tertiary text-on-tertiary-container hover:text-on-tertiary transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">check</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleApproveSingle(item.id, true)}
                          title="Aprovar com Ressalva"
                          className="p-1.5 bg-primary-container hover:bg-primary text-on-primary-fixed hover:text-on-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">done_all</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setPreviewFvs(item)}
                          title="Checklist e Laudo"
                          className="p-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant border-t border-surface-container-high">
          <span>Mostrando <strong>{filteredItems.length}</strong> itens auditados no PBQP-H</span>
          <div className="flex items-center gap-3 bg-surface px-3 py-2 shadow-sm border border-surface-container-high">
            <span className="material-symbols-outlined text-tertiary text-lg">security</span>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-on-surface leading-tight">
                Responsável Técnico: {activeProject.engineer}
              </span>
              <span className="text-[10px] text-on-surface-variant font-mono">
                {activeProject.crea} • Chave Hash ICP: #a98f-01e4-fvs-siac
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Preview FVS Details */}
      {previewFvs && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface max-w-xl w-full p-6 shadow-2xl relative border border-surface-container-high">
            <div className="flex items-start justify-between pb-3 border-b border-surface-container-high">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono">
                  [{previewFvs.code}] {previewFvs.discipline.toUpperCase()}
                </span>
                <h4 className="text-base font-bold text-on-surface mt-0.5">{previewFvs.title}</h4>
                <span className="text-[11px] font-mono text-tertiary flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-xs">location_on</span>
                  Frente: {previewFvs.front}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setPreviewFvs(null)}
                className="p-1 hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="my-3 aspect-video w-full bg-surface-container relative overflow-hidden flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80"
                alt={previewFvs.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 text-white text-[10px] font-mono">
                TIMESTAMP: 2024-10-24 10:14:22 BRT • GPS: -23.58741° S, -46.68239° W
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              {previewFvs.description}
            </p>

            <div className="mt-4 pt-3 border-t border-surface-container-high flex justify-between items-center text-xs">
              <span className="font-mono text-on-surface-variant font-medium">
                Tolerância: {previewFvs.standardTolerance}
              </span>
              <button 
                type="button"
                onClick={() => setPreviewFvs(null)}
                className="px-4 py-2 bg-primary text-on-primary font-semibold hover:bg-primary/90"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New FVS */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface max-w-lg w-full p-6 shadow-2xl border border-surface-container-high">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <h3 className="text-base font-bold text-on-surface">Iniciar Nova Ficha de Verificação (FVS)</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-on-surface mb-1">Título da Inspeção *</label>
                <input 
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ex: Cobrimento de armadura vigas V-102"
                  className="w-full p-2.5 bg-surface-container text-on-surface border border-surface-container-high focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Frente / Pavimento</label>
                  <input 
                    type="text"
                    value={newFront}
                    onChange={e => setNewFront(e.target.value)}
                    className="w-full p-2 bg-surface-container text-on-surface border border-surface-container-high"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Empreiteira</label>
                  <input 
                    type="text"
                    value={newContractor}
                    onChange={e => setNewContractor(e.target.value)}
                    className="w-full p-2 bg-surface-container text-on-surface border border-surface-container-high"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Tolerância Normativa (ABNT / PBQP-H)</label>
                <input 
                  type="text"
                  value={newTolerance}
                  onChange={e => setNewTolerance(e.target.value)}
                  className="w-full p-2 bg-surface-container text-on-surface border border-surface-container-high font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary font-semibold hover:bg-primary/90"
                >
                  Criar e Abrir Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
