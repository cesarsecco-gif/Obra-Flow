import React from 'react';
import { useApp } from '../context/AppContext';

export const DashboardView: React.FC = () => {
  const { 
    activeProject, 
    setActiveTab, 
    openPdfModal, 
    showToast,
    rncList,
    costItems
  } = useApp();

  const openRncCount = rncList.filter(r => r.status !== 'encerrada').length;
  const criticalRncCount = rncList.filter(r => r.severity === 'critica' && r.status !== 'encerrada').length;

  return (
    <div className="flex flex-col w-full space-y-6 font-body">
      {/* Control & Filter Bar */}
      <section className="bg-surface-container-low p-4 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface px-3 py-2 shadow-sm min-w-[240px]">
            <span className="material-symbols-outlined text-primary text-xl">location_city</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold leading-none tracking-wider">
                Empreendimento Ativo
              </span>
              <span className="text-xs font-semibold text-on-surface">
                {activeProject.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-surface px-3 py-2 shadow-sm">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">calendar_month</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold leading-none tracking-wider">
                Período de Análise
              </span>
              <select className="bg-transparent text-xs font-medium text-on-surface focus:outline-none cursor-pointer">
                <option>Hoje (Tempo Real)</option>
                <option>Últimos 7 dias</option>
                <option selected>Últimos 30 dias</option>
                <option>Mês Vigente (Maio/2025)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-surface px-3 py-2 shadow-sm">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">schedule</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold leading-none tracking-wider">
                Turno Operacional
              </span>
              <select className="bg-transparent text-xs font-medium text-on-surface focus:outline-none cursor-pointer">
                <option selected>Integral (07:00 - 17:00)</option>
                <option>Manhã (07:00 - 12:00)</option>
                <option>Tarde (13:00 - 17:00)</option>
                <option>Hora Extra / Noturno</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end xl:self-auto">
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-[11px] text-on-surface-variant">Último fechamento de campo:</span>
            <span className="text-xs font-medium text-on-surface">Hoje às 11:45 • {activeProject.engineer}</span>
          </div>

          <button 
            type="button"
            onClick={() => openPdfModal('executivo')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 shadow-sm transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            <span>Exportar Resumo Executivo PDF</span>
          </button>
        </div>
      </section>

      {/* Metric / KPI Cards Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* KPI 1: Avanço Físico */}
        <div className="bg-surface-container-low p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Avanço Físico</span>
              <span className="text-[11px] text-on-surface-variant">Real vs. Linha Base</span>
            </div>
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-error-container text-on-error-container">
              -2.6% Desvio
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-on-surface">{activeProject.progressPercent}%</span>
              <span className="text-xs text-on-surface-variant">/ {activeProject.plannedPercent}% meta</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 mt-2 overflow-hidden flex">
              <div className="bg-primary h-1.5" style={{ width: `${activeProject.progressPercent}%` }}></div>
              <div className="bg-error/70 h-1.5" style={{ width: '2.6%' }}></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-surface-container-high">
            <span className="flex items-center gap-1 text-error font-medium">
              <span className="material-symbols-outlined text-xs">trending_down</span>
              Atenção Cronograma
            </span>
            <span className="font-mono">TORRE A: 78%</span>
          </div>
        </div>

        {/* KPI 2: Efetivo Total Presente */}
        <div className="bg-surface-container-low p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Efetivo de Campo</span>
              <span className="text-[11px] text-on-surface-variant">Canteiro &amp; Subcontratos</span>
            </div>
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-tertiary-container text-on-tertiary-container">
              98% Presença
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-on-surface">{activeProject.activeWorkers}</span>
              <span className="text-xs text-on-surface-variant font-medium">trabalhadores</span>
            </div>
            <div className="flex items-center gap-3 text-xs mt-2 text-on-surface-variant">
              <span className="flex items-center gap-1 font-medium text-on-surface"><span className="w-2 h-2 bg-primary"></span> 42 Próprios</span>
              <span className="flex items-center gap-1 font-medium text-on-surface"><span className="w-2 h-2 bg-secondary"></span> 106 Terceirizados</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-surface-container-high">
            <span className="flex items-center gap-1 text-tertiary font-medium">
              <span className="material-symbols-outlined text-xs">check_circle</span>
              3 faltas registradas
            </span>
            <span className="text-xs font-semibold">12 Equipes</span>
          </div>
        </div>

        {/* KPI 3: Pluviometria */}
        <div className="bg-surface-container-low p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Pluviometria Acumulada</span>
              <span className="text-[11px] text-on-surface-variant">Estação Meteorológica Local</span>
            </div>
            <span className="p-1 bg-surface-container text-primary">
              <span className="material-symbols-outlined text-base">cloud</span>
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-on-surface">{activeProject.pluviometryMm}<span className="text-lg font-normal">mm</span></span>
              <span className="text-xs text-on-surface-variant">no mês atual</span>
            </div>
            <p className="text-[11px] text-error font-medium mt-1">3 dias de paralisação total</p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-surface-container-high">
            <span className="text-on-surface font-medium">Solo: Tratável</span>
            <span className="text-error font-semibold">Impacto: -14h</span>
          </div>
        </div>

        {/* KPI 4: RDOs Emitidos */}
        <div className="bg-surface-container-low p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Conformidade RDO</span>
              <span className="text-[11px] text-on-surface-variant">Diário Digital Auditado</span>
            </div>
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-tertiary-container text-on-tertiary-container">
              100% OK
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-on-surface">26/26</span>
              <span className="text-xs text-on-surface-variant">dias úteis</span>
            </div>
            <p className="text-[11px] text-tertiary font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified</span>
              Todos assinados e validados
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-surface-container-high">
            <span className="text-on-surface-variant">Último aprovado:</span>
            <span className="text-on-surface font-semibold">Ontem 18:20</span>
          </div>
        </div>

        {/* KPI 5: Maquinário */}
        <div className="bg-surface-container-low p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Maquinário Ativo</span>
              <span className="text-[11px] text-on-surface-variant">Disponibilidade Operacional</span>
            </div>
            <span className="p-1 bg-surface-container text-on-surface-variant">
              <span className="material-symbols-outlined text-base">precision_manufacturing</span>
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-on-surface">18</span>
              <span className="text-xs text-on-surface-variant">/ 20 frota total</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 mt-2 overflow-hidden flex">
              <div className="bg-tertiary h-1.5" style={{ width: '90%' }}></div>
              <div className="bg-surface-container-highest h-1.5" style={{ width: '10%' }}></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-surface-container-high">
            <span className="text-on-surface-variant">Manutenção prev.:</span>
            <span className="text-primary font-semibold">2 em oficina</span>
          </div>
        </div>
      </section>

      {/* Central Analytical Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Curva S Analítica (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-low p-5 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-surface-container-high">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-on-surface">Curva S de Avanço Físico Ponderado</h2>
                <span className="px-2 py-0.5 text-[10px] bg-primary-container text-on-primary-container font-semibold">
                  Acumulado
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">Comparativo cronograma base x execução registrada em campo</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-outline"></span>
                <span className="text-on-surface-variant">Planejado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-primary"></span>
                <span className="text-on-surface font-medium">Realizado</span>
              </div>
            </div>
          </div>

          {/* SVG Chart Canvas */}
          <div className="w-full h-64 bg-surface p-4 relative flex flex-col justify-between border border-surface-container-high">
            <div className="absolute inset-0 p-4 pointer-events-none flex flex-col justify-between">
              <div className="w-full border-b border-surface-container-high/60 flex justify-end text-[10px] text-on-surface-variant">100%</div>
              <div className="w-full border-b border-surface-container-high/60 flex justify-end text-[10px] text-on-surface-variant">75%</div>
              <div className="w-full border-b border-surface-container-high/60 flex justify-end text-[10px] text-on-surface-variant">50%</div>
              <div className="w-full border-b border-surface-container-high/60 flex justify-end text-[10px] text-on-surface-variant">25%</div>
              <div className="w-full border-b border-surface-container-high/60 flex justify-end text-[10px] text-on-surface-variant">0%</div>
            </div>

            <svg className="w-full h-full relative z-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 200">
              <path d="M 0 190 Q 150 170 300 110 T 600 20" fill="none" stroke="#8d8d8d" strokeDasharray="4 3" strokeWidth="2" />
              <path d="M 0 190 Q 150 175 300 120 L 440 85 L 440 200 L 0 200 Z" fill="rgba(15, 98, 254, 0.08)" />
              <path d="M 0 190 Q 150 175 300 120 L 440 85" fill="none" stroke="#0f62fe" strokeLinecap="round" strokeWidth="3" />
              <circle cx="440" cy="85" fill="#0f62fe" r="5" stroke="#ffffff" strokeWidth="2" />
              <line stroke="#da1e28" strokeDasharray="3 3" strokeWidth="1.5" x1="440" x2="440" y1="20" y2="195" />
              <text fill="#da1e28" fontFamily="IBM Plex Sans" fontSize="10" fontWeight="600" x="445" y="32">Hoje (Semana 18)</text>
              <g transform="translate(130, 155)">
                <rect fill="#161616" height="8" transform="rotate(45)" width="8" x="-4" y="-4" />
                <text fill="#525252" fontFamily="IBM Plex Sans" fontSize="9" x="-15" y="-10">M1: Fundação</text>
              </g>
              <g transform="translate(290, 105)">
                <rect fill="#161616" height="8" transform="rotate(45)" width="8" x="-4" y="-4" />
                <text fill="#525252" fontFamily="IBM Plex Sans" fontSize="9" x="-20" y="-10">M2: Estrutura T.A</text>
              </g>
            </svg>

            <div className="flex justify-between items-center text-[10px] text-on-surface-variant pt-2 border-t border-surface-container-high relative z-10 font-mono">
              <span>Semana 01 (Jan)</span>
              <span>Semana 06 (Fev)</span>
              <span>Semana 12 (Mar)</span>
              <span className="text-primary font-bold">Semana 18 (Atual)</span>
              <span>Semana 24 (Jul)</span>
            </div>
          </div>

          {/* Milestone Stage Progress Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-surface-container-high text-xs">
            <div className="p-2 bg-surface border border-surface-container-high">
              <div className="text-[10px] text-on-surface-variant uppercase font-semibold">1. Fundações</div>
              <div className="text-xs font-semibold text-tertiary mt-0.5 flex items-center justify-between">
                <span>100% Concluído</span>
                <span className="material-symbols-outlined text-xs">done_all</span>
              </div>
            </div>
            <div className="p-2 bg-surface border border-surface-container-high">
              <div className="text-[10px] text-on-surface-variant uppercase font-semibold">2. Estrutura R.C.</div>
              <div className="text-xs font-semibold text-on-surface mt-0.5 flex items-center justify-between">
                <span>89.2% Executado</span>
                <span className="text-[10px] text-error font-normal">-1 pav</span>
              </div>
            </div>
            <div className="p-2 bg-surface border border-surface-container-high">
              <div className="text-[10px] text-on-surface-variant uppercase font-semibold">3. Alvenaria/Vedação</div>
              <div className="text-xs font-semibold text-on-surface mt-0.5 flex items-center justify-between">
                <span>64.0% Executado</span>
                <span className="text-[10px] text-tertiary font-normal">Em dia</span>
              </div>
            </div>
            <div className="p-2 bg-surface border border-surface-container-high">
              <div className="text-[10px] text-on-surface-variant uppercase font-semibold">4. Instalações MEP</div>
              <div className="text-xs font-semibold text-on-surface mt-0.5 flex items-center justify-between">
                <span>38.5% Executado</span>
                <span className="text-[10px] text-on-surface-variant font-normal">Previsto</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Frentes de Serviço Ativas (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-low p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-surface-container-high">
              <div>
                <h2 className="text-base font-semibold text-on-surface">Frentes de Serviço Ativas</h2>
                <span className="text-xs text-on-surface-variant">Monitoramento setorial das equipes</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-surface text-on-surface border border-surface-container-high">
                4 Frentes
              </span>
            </div>

            <div className="space-y-3">
              {/* Frente 1 */}
              <div className="bg-surface p-3 transition-colors hover:bg-surface-bright shadow-sm border border-surface-container-high">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-on-surface">Concretagem Laje 14º Pav. - Torre A</span>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">Encarregado: Mestre Valdir • 22 Operários</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-tertiary bg-tertiary-container/40 px-1.5 py-0.5">
                    <span className="w-1.5 h-1.5 bg-tertiary rounded-full"></span>
                    Em Dia
                  </span>
                </div>
                <div className="mt-2.5">
                  <div className="flex justify-between text-[11px] font-medium text-on-surface-variant mb-1">
                    <span>Volume previsto: 90 m³</span>
                    <span className="text-on-surface font-semibold font-mono">82%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5">
                    <div className="bg-tertiary h-1.5" style={{ width: '82%' }}></div>
                  </div>
                </div>
              </div>

              {/* Frente 2 */}
              <div className="bg-surface p-3 transition-colors hover:bg-surface-bright shadow-sm border border-surface-container-high">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-on-surface">Alvenaria Estrutural 8º Pav. - Torre B</span>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">Encarregado: Marcílio Dias • 18 Alvenaristas</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-error bg-error-container px-1.5 py-0.5">
                    <span className="w-1.5 h-1.5 bg-error rounded-full"></span>
                    Em Atraso (-3 dias)
                  </span>
                </div>
                <div className="mt-2.5">
                  <div className="flex justify-between text-[11px] font-medium text-on-surface-variant mb-1">
                    <span>Blocagem e prumada</span>
                    <span className="text-on-surface font-semibold font-mono">54%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5">
                    <div className="bg-error h-1.5" style={{ width: '54%' }}></div>
                  </div>
                </div>
              </div>

              {/* Frente 3 */}
              <div className="bg-surface p-3 transition-colors hover:bg-surface-bright shadow-sm border border-surface-container-high">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-on-surface">Drenagem &amp; Terraplenagem Acesso Norte</span>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">Encarregado: Carlos Alberto • 2 Escavadeiras</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-on-surface-variant bg-surface-container-highest px-1.5 py-0.5">
                    <span className="material-symbols-outlined text-[10px]">rainy</span>
                    Paralisação Chuva
                  </span>
                </div>
                <div className="mt-2.5">
                  <div className="flex justify-between text-[11px] font-medium text-on-surface-variant mb-1">
                    <span>Aguardando secagem de base</span>
                    <span className="text-on-surface font-semibold font-mono">40%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5">
                    <div className="bg-secondary h-1.5" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>

              {/* Frente 4 */}
              <div className="bg-surface p-3 transition-colors hover:bg-surface-bright shadow-sm border border-surface-container-high">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-on-surface">Passagem de Prumadas Hidráulicas - T.A</span>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">Subempreiteira: HidroTech • 10 Encanadores</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-tertiary bg-tertiary-container/40 px-1.5 py-0.5">
                    <span className="w-1.5 h-1.5 bg-tertiary rounded-full"></span>
                    Em Dia
                  </span>
                </div>
                <div className="mt-2.5">
                  <div className="flex justify-between text-[11px] font-medium text-on-surface-variant mb-1">
                    <span>Pavimentos 04 ao 11</span>
                    <span className="text-on-surface font-semibold font-mono">91%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5">
                    <div className="bg-tertiary h-1.5" style={{ width: '91%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => setActiveTab('cronograma-gantt')}
            className="mt-3 block text-center py-2 text-xs font-semibold text-primary hover:bg-surface transition-colors border border-surface-container-high"
          >
            Ver todas as frentes no Cronograma Gantt &rarr;
          </button>
        </div>
      </section>

      {/* Bottom Section: Alertas Críticos & Últimas Ocorrências com Fotos */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Critical Alerts (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-low p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error">warning</span>
                <h2 className="text-base font-semibold text-on-surface">Alertas Críticos de Canteiro</h2>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-error text-on-error">
                {criticalRncCount + 1} Prioridades
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Alert 1: Weather */}
              <div className="bg-surface p-3.5 border-l-4 border-error flex items-start gap-3 shadow-sm border border-surface-container-high">
                <span className="material-symbols-outlined text-error text-xl shrink-0 mt-0.5">thunderstorm</span>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-on-surface truncate">Risco Climático: Tempestade Prevista</span>
                    <span className="text-[10px] text-error font-semibold uppercase shrink-0">15:00 - 18:00</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Previsão de 25mm de precipitação com ventos fortes. Recomenda-se adiar concretagem e ancorar cremalheira.
                  </p>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-surface-container">
                    <button 
                      type="button" 
                      onClick={() => showToast('Notificação meteorológica enviada para os mestres de obra.', 'info')}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      Notificar Encarregados
                    </button>
                    <span className="text-outline-variant text-[10px]">•</span>
                    <button 
                      type="button" 
                      onClick={() => showToast('Alerta enviado à central de betoneiras.', 'info')}
                      className="text-[11px] text-on-surface-variant hover:text-on-surface"
                    >
                      Reprogramar Caminhões Betoneira
                    </button>
                  </div>
                </div>
              </div>

              {/* Alert 2: Logistics */}
              <div className="bg-surface p-3.5 border-l-4 border-primary flex items-start gap-3 shadow-sm border border-surface-container-high">
                <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">local_shipping</span>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-on-surface truncate">Logística: Carga de Aço CA-50</span>
                    <span className="text-[10px] text-primary font-semibold uppercase shrink-0">Hoje 14:00</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Entrega de 16 toneladas (Gerdau) com carreta bitrem. Portão 2 deve ser liberado pelo almoxarifado para descarga via grua.
                  </p>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-surface-container">
                    <span className="text-[11px] text-tertiary font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">done</span> Espaço demarcado no pátio
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-container-high flex items-center justify-between text-xs text-on-surface-variant">
            <span>Histórico de 28 alertas resolvidos este mês</span>
            <button 
              type="button" 
              onClick={() => setActiveTab('nao-conformidades-rnc')}
              className="font-medium text-primary hover:underline"
            >
              Ver RNCs Abertas ({openRncCount}) &rarr;
            </button>
          </div>
        </div>

        {/* Live Photo Field Reports (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-low p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-container-high">
              <div>
                <h2 className="text-base font-semibold text-on-surface">Registros Fotográficos de Hoje</h2>
                <span className="text-xs text-on-surface-variant">Evidências vinculadas aos RDOs e medições periciais</span>
              </div>
              <button 
                type="button"
                onClick={() => setActiveTab('relatorio-fotografico')}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Galeria Completa (48 fotos)
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Photo Card 1 */}
              <div 
                onClick={() => setActiveTab('relatorio-fotografico')}
                className="bg-surface overflow-hidden shadow-sm flex flex-col group border border-surface-container-high cursor-pointer"
              >
                <div className="relative h-32 w-full overflow-hidden bg-surface-container-high">
                  <img 
                    alt="Concretagem Laje 14" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src="https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80"
                  />
                  <span className="absolute top-2 left-2 bg-inverse-surface/85 text-inverse-on-surface text-[10px] px-1.5 py-0.5 font-medium tracking-wide">
                    11:15 • Torre A
                  </span>
                </div>
                <div className="p-2.5 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-xs font-semibold text-on-surface line-clamp-1">Armação Laje Pav. 14</span>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2 leading-relaxed">
                      Conferência de cobrimento das armaduras e ensaio slump test (12cm).
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-surface-container flex items-center justify-between text-[10px] text-on-surface-variant">
                    <span>RDO #184/2024</span>
                    <span className="text-tertiary font-semibold">Auditado</span>
                  </div>
                </div>
              </div>

              {/* Photo Card 2 */}
              <div 
                onClick={() => setActiveTab('relatorio-fotografico')}
                className="bg-surface overflow-hidden shadow-sm flex flex-col group border border-surface-container-high cursor-pointer"
              >
                <div className="relative h-32 w-full overflow-hidden bg-surface-container-high">
                  <img 
                    alt="Alvenaria Torre B" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80"
                  />
                  <span className="absolute top-2 left-2 bg-inverse-surface/85 text-inverse-on-surface text-[10px] px-1.5 py-0.5 font-medium tracking-wide">
                    09:40 • Torre B
                  </span>
                </div>
                <div className="p-2.5 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-xs font-semibold text-on-surface line-clamp-1">Alvenaria 8º Pavimento</span>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2 leading-relaxed">
                      Inspeção de prumo e amarração em blocos estruturais aptos 801/802.
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-surface-container flex items-center justify-between text-[10px] text-on-surface-variant">
                    <span>RDO #184/2024</span>
                    <span className="text-tertiary font-semibold">Auditado</span>
                  </div>
                </div>
              </div>

              {/* Photo Card 3 */}
              <div 
                onClick={() => setActiveTab('relatorio-fotografico')}
                className="bg-surface overflow-hidden shadow-sm flex flex-col group border border-surface-container-high cursor-pointer"
              >
                <div className="relative h-32 w-full overflow-hidden bg-surface-container-high">
                  <img 
                    alt="Inspeção Grua" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src="https://images.unsplash.com/photo-1590496793929-36417d3117de?w=800&auto=format&fit=crop&q=80"
                  />
                  <span className="absolute top-2 left-2 bg-inverse-surface/85 text-inverse-on-surface text-[10px] px-1.5 py-0.5 font-medium tracking-wide">
                    08:10 • Pátio Central
                  </span>
                </div>
                <div className="p-2.5 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-xs font-semibold text-on-surface line-clamp-1">Checklist Preventivo Grua 01</span>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2 leading-relaxed">
                      Verificação de cabos de sustentação, guincho de tração e freios.
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-surface-container flex items-center justify-between text-[10px] text-on-surface-variant">
                    <span>NR-18 Conformidade</span>
                    <span className="text-primary font-semibold">Liberado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-container-high flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-on-surface-variant">Todas as fotos são criptografadas com coordenadas GPS e carimbo digital indelével.</span>
            <button 
              type="button" 
              onClick={() => setActiveTab('relatorio-fotografico')}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface text-on-surface hover:bg-surface-container-high font-medium transition-colors border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-sm text-primary">cloud_upload</span>
              Subir mais fotos
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
