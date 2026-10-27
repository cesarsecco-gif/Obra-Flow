import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RncItem } from '../types';

export const RncView: React.FC = () => {
  const { 
    rncList, 
    addRnc, 
    resolveRnc, 
    showToast, 
    addAuditLog 
  } = useApp();

  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Form state
  const [fvsOrigin, setFvsOrigin] = useState('[FVS-EST-042] Espaçamento e cobrimento de armadura negativa');
  const [front, setFront] = useState('Torre A - Pavimento 14 - Laje e Vigas de Borda');
  const [severity, setSeverity] = useState<'critica' | 'media' | 'leve'>('critica');
  const [description, setDescription] = useState('Verificado cobrimento inferior a 15mm em armaduras negativas próximas aos pilares P-12 e P-14.');
  const [rootCause, setRootCause] = useState('Afastadores plásticos rompidos pela circulação excessiva da equipe de formas.');
  const [actionPlan, setActionPlan] = useState('Substituição imediata por pastilhas plásticas 30mm e colocação de cavaletes metálicos adicionais.');
  const [contractor, setContractor] = useState('Aço & Forma Estruturas Ltda.');
  const [deadline, setDeadline] = useState('Hoje às 16:30 (Antes da concretagem)');
  const [technicalBase, setTechnicalBase] = useState('NBR 6118:2023 Item 7.4.7');

  const filteredRncs = rncList.filter(item => {
    if (filterSeverity !== 'all' && item.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  const handleCreateRnc = (e: React.FormEvent) => {
    e.preventDefault();
    const severityLabel = severity === 'critica' ? 'Crítica (Bloqueio)' : severity === 'media' ? 'Média Severidade' : 'Leve / Ajuste';
    addRnc({
      fvsOrigin,
      front,
      severity,
      severityLabel,
      status: 'aberta',
      description,
      rootCause,
      actionPlan,
      contractor,
      inspector: 'Eng. Ricardo Souza (CREA-SP)',
      deadline,
      blocksWork: severity === 'critica',
      photos: ['https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80'],
      technicalBase
    });

    setIsFormVisible(false);
  };

  const handleResolve = (id: string, code: string) => {
    resolveRnc(id);
    addAuditLog(`RNC ${code} baixada após reinspeção técnica`, 'RNC', 'Frente liberada para continuidade de concretagem');
  };

  return (
    <div className="flex flex-col w-full space-y-6 font-body">
      {/* Top Header */}
      <section className="flex flex-col gap-4 pb-4 border-b border-surface-container-high">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <span>Controle de Qualidade</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span>Gestão de RNCs</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-on-surface font-semibold">Matriz GUT &amp; Tolerâncias Construtivas</span>
          </nav>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-on-surface-variant bg-surface-container px-2.5 py-1 border border-surface-container-high">
            <span className="w-1.5 h-1.5 bg-error rounded-full animate-ping"></span>
            <span>Normas Auditadas: NBR 15575 / PBQP-H SiAC Nível A</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
              Gestão de Não Conformidades de Obra (RNC — FVS)
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
              Identificação, segregação pericial de risco construtivo, carimbo fotográfico georreferenciado e plano de ação corretiva compulsório com bloqueio automático de avanço executivo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button 
              type="button" 
              onClick={() => showToast('Matriz de Severidade GUT calculada com base na criticidade das frentes.', 'info')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold tracking-wide transition-colors border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Matriz GUT &amp; Risco</span>
            </button>
            <button 
              type="button"
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold tracking-wide shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-base">notification_important</span>
              <span>{isFormVisible ? 'Recolher Formulário' : '+ Abrir Nova RNC'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* KPI Ribbon */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
            <span>Total de RNCs Ativas</span>
            <span className="material-symbols-outlined text-base text-primary">pending_actions</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface font-mono">{rncList.length}</span>
            <span className="text-xs text-on-surface-variant">registros mapeados</span>
          </div>
          <div className="text-[11px] bg-surface px-2 py-1 flex items-center justify-between border border-surface-container-high">
            <span>Em validação técnica:</span>
            <span className="font-semibold text-primary">3 fichas</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-error/40">
          <div className="flex items-center justify-between text-xs font-medium text-error">
            <span className="flex items-center gap-1 font-bold uppercase tracking-wider text-[11px]">
              <span className="material-symbols-outlined text-sm">dangerous</span> Bloqueio Crítico
            </span>
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-error font-mono">03</span>
            <span className="text-xs text-error font-medium">Frentes Retidas</span>
          </div>
          <div className="text-[11px] bg-error-container text-on-error-container px-2 py-1 flex items-center justify-between font-medium">
            <span>Concretagem impedida</span>
            <span className="font-mono text-[10px]">T-A Pav.14</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
            <span>Média Severidade</span>
            <span className="material-symbols-outlined text-base text-[#b25e09]">warning</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface font-mono">06</span>
            <span className="text-xs text-on-surface-variant">Retrabalhos 48h</span>
          </div>
          <div className="text-[11px] bg-[#fef3c7] text-[#92400e] px-2 py-1 font-medium flex items-center justify-between">
            <span>Sem paralisação geral</span>
            <span className="font-semibold">6 frentes</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
            <span>Leve / Observação</span>
            <span className="material-symbols-outlined text-base text-primary">visibility</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface font-mono">03</span>
            <span className="text-xs text-on-surface-variant">Ajustes Finos</span>
          </div>
          <div className="text-[11px] bg-primary-container text-on-primary-fixed px-2 py-1 font-medium flex items-center justify-between">
            <span>Arremates estéticos</span>
            <span className="font-semibold">Baixo Risco</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
            <span>Resolução no Prazo</span>
            <span className="material-symbols-outlined text-base text-tertiary">check_circle</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-tertiary font-mono">89.4%</span>
            <span className="text-xs text-on-surface-variant">Meta: &gt;85%</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 overflow-hidden">
            <div className="bg-tertiary h-full" style={{ width: '89.4%' }}></div>
          </div>
        </div>
      </section>

      {/* Registration Form (Collapsible) */}
      {isFormVisible && (
        <section className="bg-surface-container-low p-6 shadow-sm border border-surface-container-high animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-surface-container-high mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-error text-on-error">
                <span className="material-symbols-outlined text-xl">report_problem</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-on-surface">
                  Formulário de Abertura / Detalhamento de RNC Técnica
                </h2>
                <span className="text-xs text-on-surface-variant">
                  Registro compulsório com bloqueio de concretagem e notificação automática de subempreiteiro.
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-surface font-mono text-xs font-bold text-primary border border-surface-container-high">
              AUTO-ID: RNC-2024-090
            </span>
          </div>

          <form onSubmit={handleCreateRnc} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-on-surface mb-1">FVS de Origem *</label>
                <select 
                  value={fvsOrigin} 
                  onChange={e => setFvsOrigin(e.target.value)}
                  className="w-full bg-surface p-2.5 text-xs text-on-surface border border-surface-container-high"
                >
                  <option>[FVS-EST-042] Espaçamento e cobrimento de armadura negativa</option>
                  <option>[FVS-IMP-029] Teste de estanqueidade 72h em jardineiras</option>
                  <option>[FVS-ALV-118] Controle de prumo e espessura de junta bloco cerâmico</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Frente / Local Físico *</label>
                <input 
                  type="text"
                  value={front}
                  onChange={e => setFront(e.target.value)}
                  className="w-full bg-surface p-2.5 text-xs text-on-surface border border-surface-container-high"
                />
              </div>
            </div>

            {/* Severidade */}
            <div>
              <label className="block font-semibold text-on-surface mb-2">Grau de Severidade &amp; Impacto *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSeverity('critica')}
                  className={`p-3 text-left border ${severity === 'critica' ? 'bg-error text-on-error border-error shadow-sm' : 'bg-surface text-on-surface border-surface-container-high'}`}
                >
                  <div className="font-bold uppercase text-[11px] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">block</span>
                    Crítica (Bloqueio)
                  </div>
                  <span className="text-[10px] block mt-0.5 opacity-80">Impede concretagem/fechamento</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSeverity('media')}
                  className={`p-3 text-left border ${severity === 'media' ? 'bg-[#b25e09] text-white border-[#b25e09] shadow-sm' : 'bg-surface text-on-surface border-surface-container-high'}`}
                >
                  <div className="font-bold uppercase text-[11px] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">error_outline</span>
                    Média Severidade
                  </div>
                  <span className="text-[10px] block mt-0.5 opacity-80">Prazo 48h sem travar obra</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSeverity('leve')}
                  className={`p-3 text-left border ${severity === 'leve' ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-surface text-on-surface border-surface-container-high'}`}
                >
                  <div className="font-bold uppercase text-[11px] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Leve / Ajuste
                  </div>
                  <span className="text-[10px] block mt-0.5 opacity-80">Desvios estéticos ou pontuais</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-on-surface mb-1">Descrição Pericial do Desvio *</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-surface p-2.5 text-xs text-on-surface border border-surface-container-high leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Plano de Ação Corretiva Imediato *</label>
                <textarea 
                  value={actionPlan}
                  onChange={e => setActionPlan(e.target.value)}
                  rows={3}
                  className="w-full bg-surface p-2.5 text-xs text-on-surface border border-surface-container-high leading-relaxed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-on-surface mb-1">Empreiteira Notificada</label>
                <input 
                  type="text"
                  value={contractor}
                  onChange={e => setContractor(e.target.value)}
                  className="w-full bg-surface p-2 text-xs text-on-surface border border-surface-container-high"
                />
              </div>
              <div>
                <label className="block font-semibold text-on-surface mb-1">Prazo Fatal de Reinspeção</label>
                <input 
                  type="text"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full bg-surface p-2 text-xs text-on-surface border border-surface-container-high font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-on-surface mb-1">Base Técnica / Norma</label>
                <input 
                  type="text"
                  value={technicalBase}
                  onChange={e => setTechnicalBase(e.target.value)}
                  className="w-full bg-surface p-2 text-xs text-on-surface border border-surface-container-high font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high">
              <button 
                type="button" 
                onClick={() => setIsFormVisible(false)}
                className="px-4 py-2 bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-error text-on-error font-bold hover:bg-error/90 flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">gavel</span>
                <span>Formalizar RNC &amp; Bloquear Frente</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Filter Tabs Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-surface-container p-2.5 border border-surface-container-high">
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <button 
            type="button"
            onClick={() => { setFilterSeverity('all'); setFilterStatus('all'); }}
            className={`px-3.5 py-2 font-semibold border ${filterSeverity === 'all' && filterStatus === 'all' ? 'bg-surface text-on-surface shadow-sm border-surface-container-high' : 'bg-transparent text-on-surface-variant border-transparent'}`}
          >
            Todas as RNCs ({rncList.length})
          </button>
          <button 
            type="button"
            onClick={() => setFilterSeverity('critica')}
            className={`px-3.5 py-2 font-medium border flex items-center gap-1.5 ${filterSeverity === 'critica' ? 'bg-error text-on-error border-error shadow-sm' : 'text-error border-transparent hover:bg-surface'}`}
          >
            <span className="w-2 h-2 rounded-full bg-error"></span>
            Críticas / Bloqueadas (3)
          </button>
          <button 
            type="button"
            onClick={() => setFilterSeverity('media')}
            className={`px-3.5 py-2 font-medium border ${filterSeverity === 'media' ? 'bg-[#b25e09] text-white border-[#b25e09] shadow-sm' : 'text-on-surface-variant border-transparent hover:bg-surface'}`}
          >
            Média Severidade (6)
          </button>
          <button 
            type="button"
            onClick={() => setFilterStatus('aberta')}
            className={`px-3.5 py-2 font-medium border ${filterStatus === 'aberta' ? 'bg-surface text-on-surface shadow-sm border-surface-container-high' : 'text-on-surface-variant border-transparent hover:bg-surface'}`}
          >
            Em Aberto
          </button>
        </div>

        <span className="text-xs text-on-surface-variant font-mono pr-2">
          Exibindo {filteredRncs.length} de {rncList.length} ocorrências
        </span>
      </div>

      {/* Active RNC Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRncs.map(rnc => {
          const isCritical = rnc.severity === 'critica';
          const isResolved = rnc.status === 'encerrada';

          return (
            <div 
              key={rnc.id} 
              className={`bg-surface-container-low flex flex-col justify-between shadow-sm border ${isCritical ? 'border-error/50' : 'border-surface-container-high'}`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between p-3.5 bg-surface-container-high border-b border-surface-container-high">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold font-mono tracking-wider ${isCritical ? 'bg-error text-on-error' : rnc.severity === 'media' ? 'bg-[#b25e09] text-white' : 'bg-primary-container text-on-primary-fixed'}`}>
                      {rnc.severity.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono font-bold text-on-surface">{rnc.code}</span>
                    <span className="text-[11px] font-mono text-on-surface-variant bg-surface px-1.5 py-0.5 border border-surface-container-high">
                      {rnc.fvsOrigin.split(' ')[0]}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 ${isCritical ? 'text-error bg-error-container' : 'text-on-surface-variant bg-surface'}`}>
                    <span className="material-symbols-outlined text-xs">timer</span>
                    <span>Prazo: {rnc.deadline}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col sm:flex-row gap-4">
                  {/* Photo with GPS stamp */}
                  <div className="w-full sm:w-44 h-36 shrink-0 relative bg-surface-container-highest overflow-hidden border border-surface-container-high">
                    <img 
                      src={rnc.photos[0] || 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80'} 
                      alt={rnc.description} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/75 text-white font-mono text-[9px] px-1.5 py-0.5 flex justify-between">
                      <span>GPS -23.5874°</span>
                      <span>{rnc.technicalBase.split(' ')[0]}</span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant font-medium">
                        <span className="material-symbols-outlined text-xs text-primary">location_on</span>
                        <span className="truncate">{rnc.front}</span>
                      </div>
                      <h3 className="text-sm font-bold text-on-surface mt-1 leading-snug">
                        {rnc.description}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1.5 line-clamp-2 leading-relaxed">
                        <strong className="text-on-surface font-medium">Causa Raiz:</strong> {rnc.rootCause}
                      </p>
                      <div className="mt-2 text-xs bg-surface p-2 text-on-surface leading-tight border border-surface-container-high">
                        <strong className="text-primary font-semibold">Plano Corretivo:</strong> {rnc.actionPlan}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personnel */}
                <div className="px-4 py-2 bg-surface text-xs text-on-surface-variant flex flex-wrap items-center justify-between gap-2 border-t border-surface-container-high">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs">engineering</span>
                    <span>Empreiteira: <strong className="text-on-surface">{rnc.contractor}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-tertiary">how_to_reg</span>
                    <span>Fiscal: <strong className="text-on-surface">{rnc.inspector}</strong></span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-surface-container flex items-center justify-between border-t border-surface-container-high">
                <div className="flex items-center gap-2">
                  {rnc.blocksWork && !isResolved && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-error-container text-on-error-container text-[11px] font-bold">
                      <span className="material-symbols-outlined text-xs text-error">lock</span>
                      Frente Bloqueada
                    </span>
                  )}
                  {isResolved && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-tertiary-container text-on-tertiary-container text-[11px] font-bold">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      Baixada / Liberada
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isResolved ? (
                    <button 
                      type="button"
                      onClick={() => handleResolve(rnc.id, rnc.code)}
                      className="px-3 py-1.5 bg-tertiary hover:bg-tertiary/90 text-on-tertiary text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-xs">check</span>
                      <span>Baixar RNC (Reinspecionado)</span>
                    </button>
                  ) : (
                    <span className="text-xs text-tertiary font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">task_alt</span>
                      Auditoria Encerrada
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
