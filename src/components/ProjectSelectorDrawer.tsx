import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';

export const ProjectSelectorDrawer: React.FC = () => {
  const { 
    isProjectDrawerOpen, 
    setIsProjectDrawerOpen, 
    projects, 
    activeProject, 
    setActiveProject,
    openPdfModal
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'active' | 'planning' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'progress_desc' | 'progress_asc'>('recent');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProjectDrawerOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsProjectDrawerOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsProjectDrawerOpen]);

  if (!isProjectDrawerOpen) return null;

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.engineer.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterCategory === 'all') return true;
    return p.status === filterCategory;
  }).sort((a, b) => {
    if (sortBy === 'progress_desc') return b.progressPercent - a.progressPercent;
    if (sortBy === 'progress_asc') return a.progressPercent - b.progressPercent;
    return 0;
  });

  const activeProjects = filteredProjects.filter(p => p.status === 'active');
  const planningProjects = filteredProjects.filter(p => p.status === 'planning');
  const completedProjects = filteredProjects.filter(p => p.status === 'completed');

  const handleSelect = (p: Project) => {
    setActiveProject(p);
    setIsProjectDrawerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden no-print">
      {/* Backdrop */}
      <div 
        onClick={() => setIsProjectDrawerOpen(false)}
        className="fixed inset-0 bg-on-surface/50 backdrop-blur-[3px] transition-opacity duration-300"
      />

      {/* Flyout Drawer */}
      <aside className="fixed top-0 right-0 bottom-0 w-full sm:w-[620px] lg:w-[680px] bg-surface shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out border-l border-surface-container-high">
        {/* Drawer Header */}
        <div className="flex-none px-6 pt-5 pb-4 bg-surface-container-low shadow-sm border-b border-surface-container-high">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant font-mono">CONSTRUTORA HORIZONTE</span>
              <span className="text-on-surface-variant text-[10px]">•</span>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-primary font-mono">CARTEIRA ATIVA DE OBRAS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex text-[10px] font-mono uppercase bg-surface-container-high text-on-surface-variant px-1.5 py-0.5">ESC</span>
              <button
                onClick={() => setIsProjectDrawerOpen(false)}
                className="p-1 hover:bg-surface-container-high text-on-surface transition-colors"
                title="Fechar gaveta (Esc)"
              >
                <span className="material-symbols-outlined text-xl leading-none">close</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3 mt-1">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-on-surface tracking-tight font-headline">Empreendimentos Atribuídos</h2>
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-primary-container text-on-primary-fixed leading-tight">
                  {projects.length} Obras no Portfólio
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">Selecione uma obra para alternar o contexto operacional do sistema</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="mt-4 pt-3 space-y-2.5 border-t border-surface-container-high">
            <div className="relative flex items-center bg-surface border border-surface-container-high shadow-sm">
              <span className="material-symbols-outlined absolute left-3 text-secondary text-lg">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, código (ex: OBR-2024), município ou cliente..."
                className="w-full bg-surface py-2 pl-9 pr-16 text-xs text-on-surface placeholder:text-outline focus:outline-none"
                autoFocus
              />
              <span className="absolute right-2.5 text-[10px] font-mono bg-surface-container text-on-surface-variant px-1.5 py-0.5">Ctrl + K</span>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
                    filterCategory === 'all'
                      ? 'bg-on-surface text-surface'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  Todos ({projects.length})
                </button>
                <button
                  onClick={() => setFilterCategory('active')}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    filterCategory === 'active'
                      ? 'bg-on-surface text-surface font-semibold'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  Ativas (4)
                </button>
                <button
                  onClick={() => setFilterCategory('planning')}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    filterCategory === 'planning'
                      ? 'bg-on-surface text-surface font-semibold'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  Planejamento (2)
                </button>
                <button
                  onClick={() => setFilterCategory('completed')}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    filterCategory === 'completed'
                      ? 'bg-on-surface text-surface font-semibold'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  Concluídas (2)
                </button>
              </div>

              <div className="flex items-center gap-1.5 ml-auto text-on-surface-variant text-xs">
                <span className="text-[11px] uppercase tracking-wider">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-surface-container text-on-surface text-xs py-1 px-2 focus:outline-none font-medium cursor-pointer"
                >
                  <option value="recent">Recentes primeiro</option>
                  <option value="progress_desc">Maior avanço</option>
                  <option value="progress_asc">Menor avanço</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Project Cards */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Active Works */}
          {activeProjects.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Obras Ativas / Em Andamento</h3>
                  <span className="text-[11px] text-on-surface-variant font-mono">({activeProjects.length})</span>
                </div>
                <span className="text-[11px] text-on-surface-variant font-medium">Sincronismo prioritário diário</span>
              </div>

              {activeProjects.map((p) => {
                const isSelected = activeProject.id === p.id;
                return (
                  <article
                    key={p.id}
                    className={`p-4 bg-surface shadow-sm transition-all border ${
                      isSelected 
                        ? 'border-l-4 border-l-primary border-surface-container-high bg-primary/[0.02]' 
                        : 'border-surface-container-high hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 bg-surface-container text-on-surface">
                            {p.code}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 bg-tertiary-container text-on-tertiary-container">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                            {p.statusLabel} • {p.progressPercent}% Concluído
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5">
                              Em Edição Agora
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-on-surface mt-1.5 tracking-tight truncate">
                          {p.name}
                        </h4>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-sm text-secondary">location_on</span>
                          <span className="truncate">{p.address}</span>
                        </p>
                      </div>

                      {/* Circular Progress SVG */}
                      <div className="flex-none flex flex-col items-center justify-center relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                          <circle className="text-surface-container-highest" cx="24" cy="24" fill="transparent" r="18.5" stroke="currentColor" strokeWidth="3" />
                          <circle 
                            className="text-primary" 
                            cx="24" 
                            cy="24" 
                            fill="transparent" 
                            r="18.5" 
                            stroke="currentColor" 
                            strokeDasharray="116.2" 
                            strokeDashoffset={116.2 - (116.2 * p.progressPercent) / 100} 
                            strokeLinecap="square" 
                            strokeWidth="3.5" 
                          />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-on-surface">{Math.round(p.progressPercent)}%</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 bg-surface-container p-2.5 space-y-1.5 text-xs text-on-surface">
                      <div className="flex items-center justify-between text-on-surface-variant text-[11px]">
                        <span>Resp: <strong className="text-on-surface">{p.engineer}</strong></span>
                        <span>Efetivo: <strong className="text-on-surface">{p.activeWorkers} operários</strong></span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant font-mono">
                          <span className="px-1.5 py-0.5 bg-surface">Orçamento: R$ {(p.contractValue / 1000000).toFixed(1)}M</span>
                          <span className="px-1.5 py-0.5 bg-surface">RDO #{p.rdoNumber}</span>
                        </div>
                        {isSelected ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-tertiary text-on-tertiary text-xs font-semibold">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span>Obra Selecionada</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSelect(p)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-on-primary hover:bg-primary/90 text-xs font-semibold transition-colors shadow-sm"
                          >
                            <span>Alternar para esta Obra</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          {/* Planning Works */}
          {planningProjects.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Em Planejamento / Mobilização</h3>
                  <span className="text-[11px] text-on-surface-variant font-mono">({planningProjects.length})</span>
                </div>
              </div>

              {planningProjects.map(p => (
                <article key={p.id} className="p-4 bg-surface shadow-sm border border-surface-container-high">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono px-1.5 py-0.5 bg-surface-container text-on-surface-variant">{p.code}</span>
                        <span className="text-[11px] px-2 py-0.5 bg-surface-container font-semibold">{p.statusLabel}</span>
                      </div>
                      <h4 className="text-sm font-bold text-on-surface mt-1">{p.name}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">{p.address}</p>
                    </div>
                    <button
                      onClick={() => handleSelect(p)}
                      className="px-3 py-1 bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface text-xs font-semibold transition-colors"
                    >
                      Acessar
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}

          {/* Completed Works */}
          {completedProjects.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Concluídas / Acervo Técnico</h3>
                  <span className="text-[11px] text-on-surface-variant font-mono">({completedProjects.length})</span>
                </div>
              </div>

              {completedProjects.map(p => (
                <article key={p.id} className="p-4 bg-surface shadow-sm border border-surface-container-high">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono px-1.5 py-0.5 bg-surface-container text-on-surface-variant">{p.code}</span>
                        <span className="text-[11px] px-2 py-0.5 bg-tertiary-container text-on-tertiary-container font-semibold">100% Entregue</span>
                      </div>
                      <h4 className="text-sm font-bold text-on-surface mt-1">{p.name}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">{p.address}</p>
                    </div>
                    <button
                      onClick={() => handleSelect(p)}
                      className="px-3 py-1 bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface text-xs font-semibold transition-colors"
                    >
                      Ver Histórico
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="flex-none px-6 py-3.5 bg-surface-container-low border-t border-surface-container-high flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-tertiary">verified_user</span>
            <span className="text-on-surface-variant text-[11px]">
              Exibindo <strong className="text-on-surface">{filteredProjects.length} de {projects.length}</strong> empreendimentos atribuídos
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openPdfModal('executivo')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface text-on-surface hover:bg-surface-container-high font-medium text-xs shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-primary">download</span>
              <span>Exportar Portfólio (PDF)</span>
            </button>
            <button
              onClick={() => setIsProjectDrawerOpen(false)}
              className="px-4 py-2 bg-on-surface text-surface hover:bg-on-surface/90 font-medium text-xs transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
