import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const CostIndicatorsView: React.FC = () => {
  const { 
    activeProject, 
    costItems, 
    triggerErpSync, 
    erpLogs, 
    isSyncing, 
    openPdfModal,
    showToast,
    addAuditLog
  } = useApp();

  const [selectedCostCenter, setSelectedCostCenter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Calculations
  const totalBudget = costItems.reduce((acc, item) => acc + item.budgetAmount, 0);
  const totalCommitted = costItems.reduce((acc, item) => acc + item.committedAmount, 0);
  const totalRealized = costItems.reduce((acc, item) => acc + item.realizedAmount, 0);
  const totalProjected = costItems.reduce((acc, item) => acc + item.projectedAmount, 0);
  const overallDeviation = ((totalProjected - totalBudget) / totalBudget) * 100;
  const executionPercent = Math.round((totalRealized / totalBudget) * 100);

  // Filter items
  const filteredItems = costItems.filter(item => {
    if (selectedCostCenter !== 'all' && item.costCenter !== selectedCostCenter) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.description.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.erpRef.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const costCenters = Array.from(new Set(costItems.map(i => i.costCenter)));
  const categories = Array.from(new Set(costItems.map(i => i.category)));

  const handleSyncErp = async () => {
    await triggerErpSync('SAP');
    addAuditLog('Sincronização manual com ERP disparada', 'CUSTOS', 'Integração SAP S/4HANA atualizou 8 itens de custo e 14 faturas');
  };

  const handleSimulateInvoice = (code: string) => {
    showToast(`Ordem de Faturamento liberada para ${code} via conector ERP.`, 'success');
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
            <span>Controladoria &amp; Gestão Financeira</span>
            <span>/</span>
            <span className="text-primary font-bold">Painel de Custos em Tempo Real</span>
            <span className="px-1.5 py-0.5 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold">ERP SYNC ATIVO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mt-1">
            Indicadores de Custos &amp; Curva S Físico-Financeira
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 max-w-3xl leading-relaxed">
            Monitoramento em tempo real de orçado vs. realizado, ordens de compra comprometidas, desvios por centro de custo e sincronização contábil direta com SAP S/4HANA e TOTVS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button 
            type="button"
            onClick={handleSyncErp}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-surface text-on-surface hover:bg-surface-container-high transition-colors text-xs font-semibold shadow-sm border border-surface-container-high disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-base text-primary ${isSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isSyncing ? 'Sincronizando ERP...' : 'Sincronizar SAP/TOTVS'}</span>
          </button>

          <button 
            type="button"
            onClick={() => openPdfModal('custos')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            <span>Exportar DRE &amp; Custos (PDF)</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Ribbon - Carbon Monochromatic Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* KPI 1: Orçamento Global */}
        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1 font-medium">
            <span className="uppercase tracking-wider text-[11px]">Orçamento Total Aprovado</span>
            <span className="material-symbols-outlined text-sm text-primary">account_balance_wallet</span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold text-on-surface tracking-tight font-mono">
              {totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </span>
            <span className="text-[11px] text-on-surface-variant block mt-0.5">Base contratual homologada</span>
          </div>
          <div className="text-[11px] text-on-surface-variant flex items-center justify-between border-t border-surface-container-high pt-1.5 mt-1 font-mono">
            <span>Contrato: OBR-2024-08</span>
            <span className="text-tertiary font-medium">100% Validado</span>
          </div>
        </div>

        {/* KPI 2: Realizado */}
        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1 font-medium">
            <span className="uppercase tracking-wider text-[11px]">Realizado Acumulado (Medido)</span>
            <span className="material-symbols-outlined text-sm text-tertiary">check_circle</span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold text-on-surface tracking-tight font-mono">
              {totalRealized.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-full bg-surface-container-high h-1.5 overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${executionPercent}%` }}></div>
              </div>
              <span className="text-xs font-bold text-primary">{executionPercent}%</span>
            </div>
          </div>
          <div className="text-[11px] text-on-surface-variant flex items-center justify-between border-t border-surface-container-high pt-1.5 mt-1">
            <span>Medições aprovadas em campo</span>
            <span className="font-semibold text-on-surface font-mono">24 lotes</span>
          </div>
        </div>

        {/* KPI 3: Comprometido */}
        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1 font-medium">
            <span className="uppercase tracking-wider text-[11px]">Comprometido (Pedidos / OC)</span>
            <span className="material-symbols-outlined text-sm text-on-surface-variant">shopping_cart_checkout</span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold text-on-surface tracking-tight font-mono">
              {totalCommitted.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </span>
            <span className="text-[11px] text-on-surface-variant block mt-0.5">Contratos e OCs emitidas no SAP</span>
          </div>
          <div className="text-[11px] text-on-surface-variant flex items-center justify-between border-t border-surface-container-high pt-1.5 mt-1">
            <span>A pagar em 30-90 dias</span>
            <span className="font-mono text-on-surface">94.8% alocado</span>
          </div>
        </div>

        {/* KPI 4: Projeção no Término */}
        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1 font-medium">
            <span className="uppercase tracking-wider text-[11px]">Projeção Final no Término</span>
            <span className="material-symbols-outlined text-sm text-primary">trending_up</span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold text-on-surface tracking-tight font-mono">
              {totalProjected.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </span>
            <span className="text-[11px] text-error font-medium block mt-0.5">
              Desvio projetado: +{overallDeviation.toFixed(1)}%
            </span>
          </div>
          <div className="text-[11px] text-on-surface-variant flex items-center justify-between border-t border-surface-container-high pt-1.5 mt-1">
            <span>Delta nominal:</span>
            <span className="text-error font-mono font-semibold">
              +{(totalProjected - totalBudget).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* KPI 5: Status ERP */}
        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1 font-medium">
            <span className="uppercase tracking-wider text-[11px]">Conector ERP Integrado</span>
            <span className="material-symbols-outlined text-sm text-tertiary">hub</span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-on-surface">SAP S/4HANA</span>
            <div className="flex items-center gap-1.5 text-xs text-tertiary font-semibold mt-1">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              <span>Online • Sincronizado</span>
            </div>
          </div>
          <div className="text-[10px] text-on-surface-variant border-t border-surface-container-high pt-1.5 mt-1 font-mono">
            Última sync: há 3 min (81 registros)
          </div>
        </div>
      </div>

      {/* Main Analytical Section: Curva S Físico-Financeira (Interactive SVG) */}
      <section className="bg-surface-container-low p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-container-high">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-on-surface">Curva S Físico-Financeira Acumulada</h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-primary-container text-on-primary-fixed uppercase">
                Metodologia Valor Agregado (EVA)
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Comparativo temporal entre Orçado Planejado (PV), Custo Real (AC) e Valor Agregado (EV) mês a mês.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-[#8d8d8d] border border-dashed border-[#8d8d8d]"></span>
              <span className="text-on-surface-variant">Orçado (PV)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-primary"></span>
              <span className="text-on-surface">Realizado (AC)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-tertiary"></span>
              <span className="text-tertiary">Agregado (EV)</span>
            </div>
          </div>
        </div>

        {/* SVG Graphic Canvas */}
        <div className="w-full h-72 bg-surface p-4 relative flex flex-col justify-between border border-surface-container-high">
          {/* Horizontal Gridlines */}
          <div className="absolute inset-0 p-4 pointer-events-none flex flex-col justify-between">
            <div className="w-full border-b border-surface-container-high/60 flex justify-between text-[10px] text-on-surface-variant">
              <span>R$ 48M</span>
              <span>100%</span>
            </div>
            <div className="w-full border-b border-surface-container-high/60 flex justify-between text-[10px] text-on-surface-variant">
              <span>R$ 36M</span>
              <span>75%</span>
            </div>
            <div className="w-full border-b border-surface-container-high/60 flex justify-between text-[10px] text-on-surface-variant">
              <span>R$ 24M</span>
              <span>50%</span>
            </div>
            <div className="w-full border-b border-surface-container-high/60 flex justify-between text-[10px] text-on-surface-variant">
              <span>R$ 12M</span>
              <span>25%</span>
            </div>
            <div className="w-full border-b border-surface-container-high/60 flex justify-between text-[10px] text-on-surface-variant">
              <span>R$ 0M</span>
              <span>0%</span>
            </div>
          </div>

          {/* SVG Curves */}
          <svg className="w-full h-full relative z-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 220">
            {/* Planned Line (PV - Dashed gray) */}
            <path
              d="M 20 200 Q 180 180 350 110 T 680 18"
              fill="none"
              stroke="#8d8d8d"
              strokeDasharray="4 4"
              strokeWidth="2.5"
            />

            {/* Actual Realized Area (AC - Blue Fill) */}
            <path
              d="M 20 200 Q 180 185 350 125 L 480 88 L 480 200 L 20 200 Z"
              fill="rgba(15, 98, 254, 0.08)"
            />

            {/* Actual Realized Line (AC - Blue) */}
            <path
              d="M 20 200 Q 180 185 350 125 L 480 88"
              fill="none"
              stroke="#0f62fe"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Earned Value Line (EV - Green) */}
            <path
              d="M 20 200 Q 180 190 350 132 L 480 96"
              fill="none"
              stroke="#198038"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Current Position Marker (Date of Cut: Mês 10) */}
            <line x1="480" y1="10" x2="480" y2="205" stroke="#da1e28" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="480" cy="88" r="5" fill="#0f62fe" stroke="#ffffff" strokeWidth="2" />
            <circle cx="480" cy="96" r="4" fill="#198038" stroke="#ffffff" strokeWidth="2" />

            <text x="485" y="24" fill="#da1e28" fontSize="10" fontFamily="IBM Plex Sans" fontWeight="700">
              Corte Atual: Out/2024 (R$ 34.9M)
            </text>
          </svg>

          {/* Month labels */}
          <div className="flex justify-between items-center text-[10px] text-on-surface-variant pt-2 border-t border-surface-container-high relative z-10 font-mono">
            <span>Jan/24</span>
            <span>Mar/24</span>
            <span>Mai/24</span>
            <span>Jul/24</span>
            <span className="text-primary font-bold">Out/24 (Hoje)</span>
            <span>Dez/24</span>
            <span>Mar/25</span>
            <span>Jun/25</span>
            <span>Dez/25 (Fim)</span>
          </div>
        </div>

        {/* EVA Indices Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 bg-surface border border-surface-container-high">
            <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">IDP (Desempenho de Prazo)</span>
            <div className="text-lg font-bold text-[#b28600] mt-0.5 flex items-center justify-between">
              <span>0.96</span>
              <span className="text-[11px] font-normal text-on-surface-variant">Meta: 1.00</span>
            </div>
            <span className="text-[10px] text-on-surface-variant">Ligeiro atraso físico (-2.6%)</span>
          </div>

          <div className="p-3 bg-surface border border-surface-container-high">
            <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">IDC (Desempenho de Custo)</span>
            <div className="text-lg font-bold text-tertiary mt-0.5 flex items-center justify-between">
              <span>0.98</span>
              <span className="text-[11px] font-normal text-on-surface-variant">Tolerância: ±5%</span>
            </div>
            <span className="text-[10px] text-tertiary">Dentro da banda orçamentária</span>
          </div>

          <div className="p-3 bg-surface border border-surface-container-high">
            <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">Variação de Custo (CV)</span>
            <div className="text-lg font-bold text-error mt-0.5 flex items-center justify-between">
              <span>-R$ 680 mil</span>
              <span className="material-symbols-outlined text-sm text-error">trending_down</span>
            </div>
            <span className="text-[10px] text-on-surface-variant">Impacto: Aço CA-50 e Concreto</span>
          </div>

          <div className="p-3 bg-surface border border-surface-container-high">
            <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">Saldo a Realizar</span>
            <div className="text-lg font-bold text-primary mt-0.5 flex items-center justify-between font-mono">
              <span>R$ 13.5M</span>
              <span className="text-[11px] font-normal text-on-surface-variant">28% saldo</span>
            </div>
            <span className="text-[10px] text-on-surface-variant">Acabamentos &amp; Vistoria</span>
          </div>
        </div>
      </section>

      {/* Filter and Table Toolbar */}
      <div className="bg-surface-container-low p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-on-surface-variant text-base">search</span>
            <input 
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por descrição, código ou referência ERP..."
              className="w-full pl-9 pr-3 py-2 bg-surface text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary h-9 border border-surface-container-high"
            />
          </div>

          {/* Centro de Custo */}
          <select 
            value={selectedCostCenter}
            onChange={e => setSelectedCostCenter(e.target.value)}
            className="bg-surface text-xs text-on-surface px-3 py-2 h-9 border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">Todos os Centros de Custo ({costCenters.length})</option>
            {costCenters.map(cc => (
              <option key={cc} value={cc}>{cc}</option>
            ))}
          </select>

          {/* Categoria */}
          <select 
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-surface text-xs text-on-surface px-3 py-2 h-9 border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">Todas as Categorias ({categories.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-on-surface-variant flex items-center gap-2">
          <span>Exibindo <strong>{filteredItems.length}</strong> de <strong>{costItems.length}</strong> itens de custo</span>
        </div>
      </div>

      {/* High-Density Carbon Data Table: Cost Breakdown */}
      <div className="bg-surface overflow-x-auto shadow-sm border border-surface-container-high">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider border-b border-surface-container-high">
              <th className="py-3 px-3">Código &amp; Item</th>
              <th className="py-3 px-3">Centro de Custo</th>
              <th className="py-3 px-3">Ref. ERP / Pedido</th>
              <th className="py-3 px-3 text-right">Orçado (BRL)</th>
              <th className="py-3 px-3 text-right">Comprometido</th>
              <th className="py-3 px-3 text-right">Realizado</th>
              <th className="py-3 px-3 text-right">Projetado Término</th>
              <th className="py-3 px-3 text-center">Desvio %</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high">
            {filteredItems.map(item => {
              const statusBadges = {
                no_orcamento: 'bg-tertiary-container text-on-tertiary-container',
                atencao: 'bg-[#fff8e1] text-[#b78103]',
                estouro: 'bg-error-container text-on-error-container font-bold',
              }[item.status];

              const statusLabels = {
                no_orcamento: 'No Orçamento',
                atencao: 'Atenção (+)',
                estouro: 'Estouro',
              }[item.status];

              return (
                <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-on-surface">{item.description}</div>
                    <div className="text-[11px] text-on-surface-variant font-mono">{item.code} • {item.category}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-surface-container text-on-surface font-mono text-[11px]">
                      {item.costCenter}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-primary">
                    {item.erpRef}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-on-surface">
                    {item.budgetAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-on-surface-variant">
                    {item.committedAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-on-surface">
                    {item.realizedAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-on-surface">
                    {item.projectedAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span className={`px-1.5 py-0.5 text-[11px] font-bold ${item.deviationPercent > 0 ? 'text-error' : 'text-tertiary'}`}>
                      {item.deviationPercent > 0 ? `+${item.deviationPercent}%` : `${item.deviationPercent}%`}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase ${statusBadges}`}>
                      {statusLabels}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleSimulateInvoice(item.code)}
                      className="p-1 hover:bg-surface-container text-primary hover:text-primary/80 transition-colors"
                      title="Liberar Ordem de Faturamento ERP"
                    >
                      <span className="material-symbols-outlined text-base">receipt_long</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-surface-container-high font-semibold text-on-surface border-t-2 border-surface-container-highest">
            <tr>
              <td className="py-3 px-3 uppercase text-[11px]" colSpan={3}>Totais Consolidados da Obra</td>
              <td className="py-3 px-3 text-right font-mono font-bold text-sm">
                {totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </td>
              <td className="py-3 px-3 text-right font-mono font-semibold text-xs text-on-surface-variant">
                {totalCommitted.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </td>
              <td className="py-3 px-3 text-right font-mono font-bold text-sm text-primary">
                {totalRealized.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </td>
              <td className="py-3 px-3 text-right font-mono font-bold text-sm">
                {totalProjected.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </td>
              <td className="py-3 px-3 text-center font-mono font-bold text-error">
                +{overallDeviation.toFixed(1)}%
              </td>
              <td className="py-3 px-3 text-center text-[10px] text-on-surface-variant uppercase">Auditado</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Bottom Side Panels: ERP Live Sync Logs & CRM/Billing API Bridge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Panel 1: ERP Sync Logs */}
        <div className="bg-surface-container-low p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">sync_alt</span>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface">
                Trilha de Sincronismo ERP em Tempo Real
              </h3>
            </div>
            <span className="text-[11px] font-mono text-tertiary font-semibold">Webhooks Ativos</span>
          </div>

          <div className="space-y-2 text-xs">
            {erpLogs.map(log => (
              <div key={log.id} className="p-3 bg-surface border border-surface-container-high flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface">{log.system} S/4HANA</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-tertiary-container text-on-tertiary-container font-mono font-semibold">
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-[11px]">{log.details}</p>
                  <span className="font-mono text-[10px] text-secondary block">{log.endpoint}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-[11px] text-on-surface-variant block">{log.timestamp}</span>
                  <span className="text-[10px] font-semibold text-primary">{log.recordsTransferred} registros</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: External Billing & CRM Integration */}
        <div className="bg-surface-container-low p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">api</span>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface">
                  Conectores de Faturamento Externo &amp; CRM
                </h3>
              </div>
              <span className="text-[11px] font-mono text-on-surface-variant">REST / GraphQL v2</span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="p-3 bg-surface border border-surface-container-high flex items-center justify-between">
                <div>
                  <strong className="text-on-surface block">Salesforce &amp; HubSpot CRM</strong>
                  <span className="text-[11px] text-on-surface-variant">Disparo automático de medições para liberação de parcelas a compradores.</span>
                </div>
                <span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold">CONECTADO</span>
              </div>

              <div className="p-3 bg-surface border border-surface-container-high flex items-center justify-between">
                <div>
                  <strong className="text-on-surface block">Stripe / Asaas / Gateway Bancário</strong>
                  <span className="text-[11px] text-on-surface-variant">Emissão de boletos registrados e split de pagamento de subempreiteiras.</span>
                </div>
                <span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold">OPERACIONAL</span>
              </div>

              <div className="p-3 bg-surface border border-surface-container-high flex items-center justify-between">
                <div>
                  <strong className="text-on-surface block">Receita Federal / NF-e Automática</strong>
                  <span className="text-[11px] text-on-surface-variant">Conferência de XML de Notas Fiscais vinculadas às OCs de canteiro.</span>
                </div>
                <span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold">HOMOLOGADO</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-container-high flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Chaves de API rotacionadas a cada 90 dias com AES-256.</span>
            <button 
              type="button"
              onClick={() => showToast('Chaves e Webhooks exportados para console seguro.', 'info')}
              className="text-primary font-semibold hover:underline"
            >
              Gerenciar Chaves API &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
