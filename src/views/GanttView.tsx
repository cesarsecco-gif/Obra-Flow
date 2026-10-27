import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const GanttView: React.FC = () => {
  const { 
    activeProject, 
    showToast, 
    setActiveTab, 
    addAuditLog 
  } = useApp();

  const [timeScale, setTimeScale] = useState<'mensal' | 'semanal' | 'diario'>('mensal');
  const [showBaseline, setShowBaseline] = useState<boolean>(true);
  const [selectedMilestone, setSelectedMilestone] = useState<string>('m3');

  const handleApproveMitigation = () => {
    showToast('Plano de aceleração e remanejamento de 6 pedreiros aprovado na Linha de Base.', 'success');
    addAuditLog('Replanejamento de Cronograma Aprovado', 'RDO', 'Marco M3 reprogramado para 29/Nov com acréscimo de efetivo');
  };

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
          {/* Time scale */}
          <div className="inline-flex bg-surface-container p-0.5 border border-surface-container-high">
            <button 
              type="button" 
              onClick={() => setTimeScale('mensal')}
              className={`px-3 py-1.5 text-xs font-semibold ${timeScale === 'mensal' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Mensal
            </button>
            <button 
              type="button" 
              onClick={() => setTimeScale('semanal')}
              className={`px-3 py-1.5 text-xs font-semibold ${timeScale === 'semanal' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Semanal
            </button>
            <button 
              type="button" 
              onClick={() => setTimeScale('diario')}
              className={`px-3 py-1.5 text-xs font-semibold ${timeScale === 'diario' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Diário
            </button>
          </div>

          {/* Baseline Toggle */}
          <button 
            type="button"
            onClick={() => {
              setShowBaseline(!showBaseline);
              showToast(showBaseline ? 'Baseline ocultada.' : 'Linha de Base contratual v1.2 visível.', 'info');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border transition-colors ${showBaseline ? 'bg-surface-container text-primary border-primary' : 'bg-surface text-on-surface border-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-sm text-primary">difference</span>
            <span>Comparar Baseline (v1.2)</span>
          </button>

          {/* Export */}
          <button 
            type="button"
            onClick={() => showToast('Exportando arquivo compatível com MS-Project e PDF Executivo...', 'info')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface-container text-on-surface text-xs font-medium hover:bg-surface-container-high transition-colors border border-surface-container-high"
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
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-[#fff1f1] text-error font-mono">
              Desvio -2.6%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface font-mono">{activeProject.progressPercent}%</span>
            <span className="text-xs text-on-surface-variant font-light">Previsto: {activeProject.plannedPercent}%</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 mt-3 relative">
            <div className="bg-primary h-1.5" style={{ width: `${activeProject.progressPercent}%` }}></div>
            <div className="absolute top-0 bottom-0 w-0.5 bg-on-surface z-10" style={{ left: '75%' }} title="Baseline 75%"></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant mt-2 font-mono">
            <span>Status: Em Atenção</span>
            <span className="text-on-surface font-medium">Torre A &amp; B</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
            <span className="font-medium uppercase tracking-wide text-[11px]">Marcos Regulatórios</span>
            <span className="material-symbols-outlined text-tertiary text-base">verified</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface font-mono">18 <span className="text-sm font-normal text-on-surface-variant">/ 24</span></span>
            <span className="text-xs text-tertiary font-semibold">75% Concluídos</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 mt-3">
            <div className="bg-tertiary h-1.5" style={{ width: '75%' }}></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant mt-2">
            <span>Próximo: AVCB Bombeiros</span>
            <span className="font-mono text-on-surface">Jun/25</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
            <span className="font-medium uppercase tracking-wide text-[11px]">Caminho Crítico (CPM)</span>
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-[#fff1f1] text-error font-mono">
              2 em Risco
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-error font-mono">5</span>
            <span className="text-xs text-on-surface-variant">frentes ativas na rota</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-on-surface truncate">
            <span className="w-2.5 h-2.5 bg-error inline-block"></span>
            <span>Alvenaria Estrutural Torre B</span>
          </div>
          <div className="text-[11px] text-on-surface-variant mt-2 font-mono truncate">Impacta: MEP &amp; Gesso</div>
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

      {/* Main Split: WBS Tree & Gantt Canvas */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-0 bg-surface shadow-sm border border-surface-container-high">
        {/* WBS Left Column (4 cols) */}
        <div className="xl:col-span-4 bg-surface flex flex-col border-r border-surface-container-high">
          <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                Estrutura Analítica (EAP / WBS)
              </span>
              <span className="text-[11px] px-2 py-0.5 bg-surface-container font-mono text-on-surface-variant border border-surface-container-high">
                8 Fases
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="px-2 py-0.5 bg-primary text-on-primary font-bold text-[10px]">TODAS</span>
              <span className="px-2 py-0.5 bg-surface text-error font-medium text-[10px] border border-surface-container-high">CAMINHO CRÍTICO</span>
            </div>
          </div>

          <div className="divide-y divide-surface-container-high overflow-y-auto">
            {/* Item 1 */}
            <div className="p-3.5 hover:bg-surface-container-low transition-colors flex items-center justify-between">
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <span className="material-symbols-outlined text-tertiary text-base mt-0.5 shrink-0">check_circle</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-on-surface truncate">1. Serviços Preliminares &amp; Canteiro</span>
                  <span className="text-[11px] text-on-surface-variant font-mono">01/Jan/24 - 28/Fev/24</span>
                </div>
              </div>
              <span className="text-xs font-bold text-tertiary font-mono">100%</span>
            </div>

            {/* Item 2 */}
            <div className="p-3.5 hover:bg-surface-container-low transition-colors flex items-center justify-between">
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <span className="material-symbols-outlined text-tertiary text-base mt-0.5 shrink-0">check_circle</span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-on-surface truncate">2. Fundação &amp; Contenções</span>
                    <span className="inline-block w-2 h-2 rotate-45 bg-tertiary" title="Marco M1"></span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant font-mono">01/Mar/24 - 15/Mai/24</span>
                </div>
              </div>
              <span className="text-xs font-bold text-tertiary font-mono">100% (M1)</span>
            </div>

            {/* Item 3 */}
            <div className="p-3.5 hover:bg-surface-container-low transition-colors flex items-center justify-between bg-surface">
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">pending</span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-on-surface truncate">3. Estrutura Concreto Armado</span>
                    <span className="inline-block w-2 h-2 rotate-45 bg-primary" title="Marco M2"></span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant font-mono">16/Mai/24 - 30/Nov/24 (Pav. 14)</span>
                </div>
              </div>
              <span className="text-xs font-bold text-on-surface font-mono">89.2%</span>
            </div>

            {/* Item 4 */}
            <div 
              onClick={() => setSelectedMilestone('m3')}
              className="p-3.5 bg-error-container/40 hover:bg-error-container/60 transition-colors flex items-center justify-between cursor-pointer border-l-4 border-error"
            >
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <span className="material-symbols-outlined text-error text-base mt-0.5 shrink-0">error</span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-error truncate">4. Alvenaria Estrutural &amp; Vedação</span>
                    <span className="inline-block w-2 h-2 rotate-45 bg-error" title="Marco M3 Atrasado"></span>
                  </div>
                  <span className="text-[11px] text-on-error-container font-mono">01/Jul/24 - 15/Jan/25 (-14d atraso)</span>
                </div>
              </div>
              <span className="text-xs font-bold text-error font-mono">64.0%</span>
            </div>

            {/* Item 5 */}
            <div className="p-3.5 hover:bg-surface-container-low transition-colors flex items-center justify-between">
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">water_drop</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-on-surface truncate">5. Instalações Prediais MEP</span>
                  <span className="text-[11px] text-on-surface-variant font-mono">01/Ago/24 - 30/Abr/25</span>
                </div>
              </div>
              <span className="text-xs font-bold text-on-surface font-mono">38.5%</span>
            </div>

            {/* Item 6 */}
            <div className="p-3.5 hover:bg-surface-container-low transition-colors flex items-center justify-between">
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <span className="material-symbols-outlined text-[#b28600] text-base mt-0.5 shrink-0">window</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-on-surface truncate">6. Fachada, Pele de Vidro &amp; Caixilhos</span>
                  <span className="text-[11px] text-on-surface-variant font-mono">15/Set/24 - 30/Mai/25</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#b28600] font-mono">22.0%</span>
            </div>

            {/* Item 7 */}
            <div className="p-3.5 hover:bg-surface-container-low transition-colors flex items-center justify-between">
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <span className="material-symbols-outlined text-outline text-base mt-0.5 shrink-0">format_paint</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-on-surface truncate">7. Revestimentos e Acabamentos</span>
                  <span className="text-[11px] text-on-surface-variant font-mono">01/Out/24 - 30/Jul/25</span>
                </div>
              </div>
              <span className="text-xs font-bold text-on-surface font-mono">15.2%</span>
            </div>

            {/* Item 8 */}
            <div className="p-3.5 hover:bg-surface-container-low transition-colors flex items-center justify-between">
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <span className="material-symbols-outlined text-outline text-base mt-0.5 shrink-0">vpn_key</span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-on-surface-variant truncate">8. Vistoria Final, AVCB &amp; Chaves</span>
                    <span className="inline-block w-2 h-2 rotate-45 bg-[#b28600]" title="Marco M5"></span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant font-mono">01/Jun/25 - 15/Dez/25</span>
                </div>
              </div>
              <span className="text-xs font-bold text-on-surface-variant font-mono">0.0%</span>
            </div>
          </div>
        </div>

        {/* Gantt Timeline Right Column (8 cols) */}
        <div className="xl:col-span-8 flex flex-col overflow-x-auto relative bg-surface">
          {/* Header Month Ruler */}
          <div className="min-w-[760px] border-b border-surface-container-high bg-surface-container-low select-none">
            <div className="grid grid-cols-12 text-center text-[11px] font-semibold text-on-surface py-2 border-b border-surface-container-high">
              <div>Ago/24</div>
              <div>Set/24</div>
              <div className="bg-primary/5 text-primary font-bold">Out/24 (Hoje)</div>
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
            <div className="grid grid-cols-12 text-center text-[10px] text-on-surface-variant font-mono py-1">
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
          </div>

          {/* Canvas Rows */}
          <div className="min-w-[760px] relative divide-y divide-surface-container-high">
            {/* Cutline Hoje */}
            <div className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center" style={{ left: '21.5%' }}>
              <div className="bg-error text-on-error text-[10px] font-bold px-1.5 py-0.5 shadow-sm uppercase tracking-wider font-mono">
                Hoje (24/Out)
              </div>
              <div className="w-px h-full bg-error border-r border-dashed border-error"></div>
            </div>

            {/* Vertical grid lines */}
            <div className="absolute inset-0 grid grid-cols-12 pointer-events-none z-0">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} className="border-r border-surface-container-high/60"></div>
              ))}
            </div>

            {/* Row 1 */}
            <div className="h-14 relative flex items-center px-2 z-10">
              {showBaseline && (
                <div className="absolute h-2 bg-surface-container-highest top-7 opacity-60" style={{ left: '0%', width: '14%' }}></div>
              )}
              <div className="h-5 bg-tertiary flex items-center justify-between px-2 text-[10px] text-on-tertiary font-semibold shadow-sm" style={{ width: '14%' }}>
                <span>Concluído</span>
                <span className="font-mono">100%</span>
              </div>
            </div>

            {/* Row 2: M1 */}
            <div className="h-14 relative flex items-center px-2 z-10">
              {showBaseline && (
                <div className="absolute h-2 bg-surface-container-highest top-7 opacity-60" style={{ left: '0%', width: '18%' }}></div>
              )}
              <div className="h-5 bg-tertiary flex items-center justify-between px-2 text-[10px] text-on-tertiary font-semibold shadow-sm" style={{ width: '18%' }}>
                <span>Fundações Torre A/B</span>
                <span className="font-mono">100%</span>
              </div>
              <div className="absolute z-20 flex items-center gap-1" style={{ left: '17.5%' }}>
                <span className="w-3.5 h-3.5 rotate-45 bg-tertiary border border-surface shadow flex items-center justify-center">
                  <span className="material-symbols-outlined -rotate-45 text-[10px] text-on-tertiary font-bold">check</span>
                </span>
                <span className="text-[10px] font-semibold text-tertiary bg-surface px-1 shadow-sm border border-surface-container-high">M1</span>
              </div>
            </div>

            {/* Row 3: M2 */}
            <div className="h-14 relative flex items-center px-2 z-10">
              {showBaseline && (
                <div className="absolute h-2 bg-surface-container-highest top-7 opacity-60" style={{ left: '0%', width: '33%' }}></div>
              )}
              <div className="h-5 bg-tertiary flex items-center justify-between px-2 text-[10px] text-on-tertiary font-semibold shadow-sm" style={{ width: '20%' }}>
                <span className="truncate">Torre A (14º Pav.)</span>
                <span className="font-mono">89.2%</span>
              </div>
              <div className="h-5 bg-primary-fixed-dim flex items-center px-2 text-[9px] text-on-primary-fixed font-mono" style={{ width: '11%' }}>
                prev. 30/Nov
              </div>
              <div className="absolute z-20 flex items-center gap-1" style={{ left: '23%' }}>
                <span className="w-3.5 h-3.5 rotate-45 bg-primary border border-surface shadow flex items-center justify-center animate-pulse"></span>
                <span className="text-[10px] font-semibold text-primary bg-surface px-1 shadow-sm border border-surface-container-high">M2</span>
              </div>
            </div>

            {/* Row 4: M3 Atrasado */}
            <div className="h-14 relative flex items-center px-2 z-10 bg-error-container/10">
              {showBaseline && (
                <div className="absolute h-2 bg-surface-container-highest top-7 opacity-70" style={{ left: '0%', width: '42%' }}></div>
              )}
              <div className="h-6 bg-error flex items-center justify-between px-2 text-[10px] text-on-error font-bold shadow-sm" style={{ width: '17%' }}>
                <span className="truncate">Torre B Pav. 8º-12º</span>
                <span className="font-mono">64%</span>
              </div>
              <div className="h-6 bg-error-container text-on-error-container flex items-center px-2 text-[10px] font-bold gap-1 border-r-2 border-error" style={{ width: '8%' }}>
                <span className="material-symbols-outlined text-xs text-error">priority_high</span>
                <span>-14d</span>
              </div>
              <div className="h-6 bg-surface-container-high/80 flex items-center px-2 text-[10px] text-on-surface-variant font-mono" style={{ width: '25%' }}>
                <span>Reprog. Jan/25</span>
              </div>
              <div className="absolute z-20 flex items-center gap-1" style={{ left: '31%' }}>
                <span className="w-3.5 h-3.5 rotate-45 bg-error border border-surface shadow flex items-center justify-center">
                  <span className="material-symbols-outlined -rotate-45 text-[10px] text-on-error">warning</span>
                </span>
                <span className="text-[10px] font-bold text-error bg-surface px-1 shadow-sm border border-surface-container-high">M3</span>
              </div>
            </div>

            {/* Row 5: MEP */}
            <div className="h-14 relative flex items-center px-2 z-10">
              {showBaseline && (
                <div className="absolute h-2 bg-surface-container-highest top-7 opacity-60" style={{ left: '3%', width: '68%' }}></div>
              )}
              <div className="h-5 bg-tertiary flex items-center justify-between px-2 text-[10px] text-on-tertiary font-semibold shadow-sm ml-[3%]" style={{ width: '17%' }}>
                <span className="truncate">Hidráulica</span>
                <span className="font-mono">38.5%</span>
              </div>
              <div className="h-5 bg-surface-container-high flex items-center px-2 text-[10px] text-on-surface-variant font-mono" style={{ width: '48%' }}>
                <span>Em andamento</span>
              </div>
            </div>

            {/* Row 6: Fachada */}
            <div className="h-14 relative flex items-center px-2 z-10">
              {showBaseline && (
                <div className="absolute h-2 bg-surface-container-highest top-7 opacity-60" style={{ left: '8%', width: '65%' }}></div>
              )}
              <div className="h-5 bg-[#b28600] flex items-center justify-between px-2 text-[10px] text-white font-semibold shadow-sm ml-[8%]" style={{ width: '12%' }}>
                <span className="truncate">Ancoragem</span>
                <span className="font-mono">22%</span>
              </div>
              <div className="h-5 bg-surface-container-high flex items-center px-2 text-[10px] text-on-surface-variant font-mono" style={{ width: '53%' }}>
                <span>Montagem Caixilhos</span>
              </div>
            </div>

            {/* Row 7: Acabamentos */}
            <div className="h-14 relative flex items-center px-2 z-10">
              {showBaseline && (
                <div className="absolute h-2 bg-surface-container-highest top-7 opacity-60" style={{ left: '17%', width: '75%' }}></div>
              )}
              <div className="h-5 bg-primary flex items-center justify-between px-2 text-[10px] text-on-primary font-semibold shadow-sm ml-[17%]" style={{ width: '8%' }}>
                <span className="truncate">Gesso</span>
                <span className="font-mono">15%</span>
              </div>
              <div className="h-5 bg-surface-container-high flex items-center px-2 text-[10px] text-on-surface-variant font-mono" style={{ width: '67%' }}>
                <span>Porcelanato / Pintura</span>
              </div>
            </div>

            {/* Row 8: M4 / M5 */}
            <div className="h-14 relative flex items-center px-2 z-10">
              {showBaseline && (
                <div className="absolute h-2 bg-surface-container-highest top-7 opacity-60" style={{ left: '70%', width: '30%' }}></div>
              )}
              <div className="h-5 bg-surface-container-high flex items-center px-3 text-[10px] text-on-surface-variant font-mono ml-[70%]" style={{ width: '30%' }}>
                <span>Testes Finais &amp; Vistoria</span>
              </div>
              <div className="absolute z-20 flex items-center gap-1" style={{ left: '72%' }}>
                <span className="w-3.5 h-3.5 rotate-45 bg-surface border-2 border-primary flex items-center justify-center"></span>
                <span className="text-[10px] font-semibold text-on-surface bg-surface px-1 shadow-sm border border-surface-container-high">M4: AVCB</span>
              </div>
              <div className="absolute z-20 flex items-center gap-1" style={{ left: '92%' }}>
                <span className="w-4 h-4 rotate-45 bg-[#b28600] border-2 border-surface shadow flex items-center justify-center">
                  <span className="material-symbols-outlined -rotate-45 text-[10px] text-white font-bold">star</span>
                </span>
                <span className="text-[10px] font-bold text-[#b28600] bg-surface px-1 shadow-sm border border-surface-container-high">M5: Chaves</span>
              </div>
            </div>
          </div>

          {/* Timeline legend */}
          <div className="p-3 bg-surface-container-low border-t border-surface-container-high flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-on-surface-variant text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-tertiary inline-block"></span>
                <span>Realizado (On Track)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-error inline-block"></span>
                <span>Atrasado (Caminho Crítico)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 bg-surface-container-highest inline-block"></span>
                <span>Baseline Planejada</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rotate-45 bg-[#b28600] inline-block"></span>
                <span>Marco (Milestone)</span>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-on-surface">Ago 2024 - Dez 2025</span>
          </div>
        </div>
      </div>

      {/* Bottom Mitigation Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-low p-5 shadow-sm border border-surface-container-high flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-container-high pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rotate-45 bg-error flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined -rotate-45 text-[10px] text-on-error">priority_high</span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-error">Marco Crítico Selecionado: Marco M3</span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-error text-on-error uppercase font-mono">Impacto Alto</span>
                  </div>
                  <h2 className="text-base font-bold text-on-surface">Fechamento de Alvenaria Pav. 8º ao 12º — Torre B</h2>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-on-surface-variant uppercase font-semibold">Data Base Original</span>
                <p className="text-xs font-bold text-on-surface font-mono">15/Nov/2024 &rarr; <span className="text-error">Reprog: 29/Nov/2024</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-surface p-3 border border-surface-container-high">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Responsável Técnico</span>
                <p className="font-bold text-on-surface mt-1">{activeProject.engineer}</p>
                <p className="text-[11px] text-on-surface-variant">Arte &amp; Bloco Ltda.</p>
              </div>
              <div className="bg-surface p-3 border border-surface-container-high">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Gargalo / Causa Raiz</span>
                <p className="font-bold text-error mt-1">Desabastecimento Cerâmico</p>
                <p className="text-[11px] text-on-surface-variant">Atraso de 14 dias pelo fornecedor</p>
              </div>
              <div className="bg-surface p-3 border border-surface-container-high">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Cadeia de Impacto</span>
                <p className="font-bold text-on-surface mt-1">MEP Prumadas Torre B</p>
                <p className="text-[11px] text-on-surface-variant">Substituição de eletrodutos travada</p>
              </div>
            </div>

            <div className="bg-surface p-4 border border-surface-container-high space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">task_alt</span>
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Plano de Mitigação &amp; Reprogramação Homologado
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Mobilização de 4 oficiais pedreiros e 2 serventes adicionais remanejados da Torre A para compensação de ritmo em dois turnos (início em 28/Out). Remessa extra de 12.000 blocos estruturais confirmada para entrega no canteiro em 25/Out (registrado e validado no <strong className="text-on-surface">RDO #{activeProject.rdoNumber}</strong>).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-container-high">
            <span className="text-xs text-on-surface-variant font-mono">Replanejamento auditado pela diretoria técnica</span>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setActiveTab('diario-de-obra-rdo')}
                className="px-3 py-1.5 bg-surface text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors border border-surface-container-high"
              >
                Abrir RDO #{activeProject.rdoNumber}
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

        {/* Regulatory Milestones Checklist */}
        <div className="bg-surface-container-low p-5 shadow-sm border border-surface-container-high flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface">Marcos Regulatórios &amp; Contratuais</span>
              <span className="text-xs font-mono font-bold text-tertiary">75% Concluídos</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-surface flex items-center justify-between border border-surface-container-high">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rotate-45 bg-tertiary"></span>
                  <div>
                    <span className="font-semibold text-on-surface block">M1: Fundação &amp; Contenções</span>
                    <span className="text-[10px] text-tertiary font-mono">Concluído 14/Mai/24</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-tertiary text-base">check_circle</span>
              </div>

              <div className="p-2.5 bg-surface flex items-center justify-between border border-surface-container-high">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rotate-45 bg-primary"></span>
                  <div>
                    <span className="font-semibold text-on-surface block">M2: Concreto 14º Pav. Torre A</span>
                    <span className="text-[10px] text-primary font-mono">Meta: 30/Out/24 (89.2%)</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-primary uppercase font-mono">Em Dia</span>
              </div>

              <div className="p-2.5 bg-surface flex items-center justify-between border border-error/40">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rotate-45 bg-error"></span>
                  <div>
                    <span className="font-semibold text-error block">M3: Alvenaria Torre B</span>
                    <span className="text-[10px] text-error font-mono">Atraso: +14 dias corridos</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-error text-base">warning</span>
              </div>

              <div className="p-2.5 bg-surface flex items-center justify-between border border-surface-container-high opacity-80">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rotate-45 bg-surface-container-highest"></span>
                  <div>
                    <span className="font-semibold text-on-surface block">M4: Vistoria Bombeiros (AVCB)</span>
                    <span className="text-[10px] text-on-surface-variant font-mono">Previsto: 18/Jun/25</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant">Pendente</span>
              </div>

              <div className="p-2.5 bg-surface flex items-center justify-between border border-surface-container-high opacity-80">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rotate-45 bg-[#b28600]"></span>
                  <div>
                    <span className="font-semibold text-on-surface block">M5: Habite-se &amp; Entrega Chaves</span>
                    <span className="text-[10px] text-on-surface-variant font-mono">Contratual: 15/Dez/25</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#b28600] font-mono">Final</span>
              </div>
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
    </div>
  );
};
