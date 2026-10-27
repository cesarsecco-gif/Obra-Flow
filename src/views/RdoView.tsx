import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const RdoView: React.FC = () => {
  const { 
    activeProject, 
    currentUser, 
    isRdoSigned, 
    signRdo, 
    openPdfModal, 
    showToast,
    addAuditLog
  } = useApp();

  const [notes, setNotes] = useState<string>(
`1. DDS (Diálogo Diário de Segurança) realizado às 07:15 abordando Trabalho em Altura (NR-35) e uso de linha de vida para concretagem periférica.
2. Recebimento de 2 caminhões betoneira da Usina Polimix (NF 89234 e 89235), com ensaios de Slump Test registrados em 12±2cm (Aprovados).
3. Notificação expedida à Subempreiteira HidroVolt para ajuste na vedação acústica das prumadas do 4º pavimento até amanhã às 12h.`
  );

  const [isDraftSaved, setIsDraftSaved] = useState(false);

  const handleSaveDraft = () => {
    setIsDraftSaved(true);
    showToast('Rascunho do RDO nº 184 gravado com sucesso no armazenamento local.', 'success');
    addAuditLog('Rascunho de RDO salvo', 'RDO', 'RDO nº 184 atualizado no canteiro');
    setTimeout(() => setIsDraftSaved(false), 2500);
  };

  const handleSign = () => {
    signRdo();
  };

  return (
    <div className="flex flex-col w-full space-y-6 font-body">
      {/* Top Utility Ribbon / Context Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-low p-4 shadow-sm border border-surface-container-high">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary text-on-primary font-bold text-sm tracking-widest">
            184
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-on-surface tracking-tight">Diário de Obra (RDO) nº 184 / 2024</h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${isRdoSigned ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-[#fff8e1] text-[#b78103]'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isRdoSigned ? 'bg-tertiary' : 'bg-[#b78103]'}`}></span>
                {isRdoSigned ? 'Homologado & Assinado ICP' : 'Em Preenchimento'}
              </span>
              <span className="inline-flex items-center text-[11px] font-medium text-on-surface-variant bg-surface px-2 py-0.5 border border-surface-container-high">
                Pré-Aprovação Técnica
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-normal mt-0.5">
              Quinta-feira, 24 de Outubro • {activeProject.name} • Turnos Diurno / Noturno
            </p>
          </div>
        </div>

        {/* Quick Actions Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface text-on-surface hover:bg-surface-container-high transition-colors text-xs font-semibold shadow-sm border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-base text-primary">
              {isDraftSaved ? 'check' : 'save'}
            </span>
            <span>{isDraftSaved ? 'Rascunho Salvo!' : 'Salvar Rascunho'}</span>
          </button>

          <button 
            type="button"
            onClick={() => showToast('ART vinculada: ART nº 2024.088219-SP homologada no CREA-SP.', 'info')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors text-xs font-medium"
          >
            <span className="material-symbols-outlined text-base text-primary">verified_user</span>
            <span>Validar ART/CREA</span>
          </button>

          <button 
            type="button"
            onClick={() => openPdfModal('rdo')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary hover:bg-primary/90 transition-colors text-xs font-semibold shadow-sm"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            <span>Gerar PDF Oficial</span>
          </button>
        </div>
      </div>

      {/* Operational Metric Chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-container-low p-3.5 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Efetivo Mobilizado</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-on-surface tracking-tight font-mono">67 <span className="text-xs font-normal text-on-surface-variant">operários</span></span>
            <span className="text-xs font-medium text-tertiary flex items-center">
              <span className="material-symbols-outlined text-sm">groups</span> 100% alocados
            </span>
          </div>
        </div>

        <div className="bg-surface-container-low p-3.5 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Horas Trabalhadas</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-on-surface tracking-tight font-mono">148 <span className="text-xs font-normal text-on-surface-variant">Hh calculadas</span></span>
            <span className="text-xs text-on-surface-variant font-mono">Meta: 160 Hh</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-3.5 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Paralisação Climática</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-error tracking-tight font-mono">2.5 <span className="text-xs font-normal text-on-surface-variant">horas</span></span>
            <span className="text-xs font-medium text-error flex items-center">
              <span className="material-symbols-outlined text-sm">warning</span> Laje 14
            </span>
          </div>
        </div>

        <div className="bg-surface-container-low p-3.5 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Equipamentos Ativos</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-on-surface tracking-tight font-mono">3 / 3 <span className="text-xs font-normal text-on-surface-variant">em uso</span></span>
            <span className="text-xs font-medium text-on-surface-variant">1 restrição eólica</span>
          </div>
        </div>
      </div>

      {/* Bloco 1: Condições Climáticas e Pluviometria */}
      <section className="bg-surface-container-low p-5 shadow-sm space-y-4 border border-surface-container-high">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">partly_cloudy_day</span>
            <h2 className="text-base font-semibold text-on-surface uppercase tracking-wide">
              1. Condições Climáticas, Pluviometria &amp; Praticabilidade
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant font-mono">Aferição Estação: EST-HORIZONTE-02</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Manhã */}
          <div className="bg-surface p-4 flex flex-col justify-between space-y-3 shadow-sm border border-surface-container-high">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Turno Manhã (07:00 - 12:00)</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="material-symbols-outlined text-tertiary text-2xl">sunny</span>
                  <span className="text-lg font-semibold text-on-surface">Ensolarado • 24°C</span>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-tertiary-container text-on-tertiary-container uppercase">
                Praticável
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Sem ocorrência pluviométrica. Umidade relativa em 62%. Condição ideal para armação e fôrmas externas.
            </p>
            <div className="text-[11px] text-tertiary font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span> Pleno rendimento de frente de serviço
            </div>
          </div>

          {/* Tarde */}
          <div className="bg-surface p-4 flex flex-col justify-between space-y-3 shadow-sm relative overflow-hidden border border-error/50">
            <div className="absolute top-0 left-0 right-0 h-1 bg-error"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Turno Tarde (13:00 - 17:00)</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="material-symbols-outlined text-error text-2xl">rainy</span>
                  <span className="text-lg font-semibold text-on-surface">Chuva Forte • 18mm</span>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-error-container text-on-error-container uppercase">
                Impraticável
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Precipitação iniciada às 14:45. Pluviômetro de obra registrou 18mm acumulados até as 17:00. Serviços externos paralisados às 15h00.
            </p>
            <div className="text-[11px] text-error font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span> 2h30min de paralisação técnica
            </div>
          </div>

          {/* Noite */}
          <div className="bg-surface p-4 flex flex-col justify-between space-y-3 shadow-sm border border-surface-container-high">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Turno Noite (18:00 - 22:00)</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="material-symbols-outlined text-secondary text-2xl">nights_stay</span>
                  <span className="text-lg font-semibold text-on-surface">Nublado • 21°C</span>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-surface-container-high text-on-surface uppercase">
                Vigilância
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Sem atividades produtivas programadas. Guarda patrimonial ativa e rondas com verificação de bombas de drenagem do subsolo.
            </p>
            <div className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">security</span> Ronda e bombas elétricas operacionais
            </div>
          </div>
        </div>

        {/* Impact banner */}
        <div className="bg-error-container text-on-error-container p-3 flex items-start gap-3 border border-error/30">
          <span className="material-symbols-outlined text-error text-xl shrink-0 mt-0.5">error_outline</span>
          <div className="text-xs leading-relaxed">
            <strong className="font-semibold">Registro Formal de Impacto Crítico no Cronograma:</strong> 
            Devido à intensidade da precipitação e rajadas de vento acima de 42 km/h a partir das 15h, os serviços de concretagem da laje do 14º pavimento foram suspensos para assegurar integridade do traço e segurança da equipe. 
            <span className="font-semibold underline"> Total de 2.5 horas paralisadas registradas para cômputo de prazo contratual.</span>
          </div>
        </div>
      </section>

      {/* Split Grid: Bloco 2 (Mão de Obra) & Bloco 3 (Equipamentos) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Bloco 2: Mão de Obra e Efetivo (7 cols) */}
        <section className="xl:col-span-7 bg-surface-container-low p-5 shadow-sm space-y-4 border border-surface-container-high">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">badge</span>
              <h2 className="text-base font-semibold text-on-surface uppercase tracking-wide">
                2. Mão de Obra &amp; Efetivo Alocado
              </h2>
            </div>
            <span className="text-xs font-semibold bg-surface-container px-2.5 py-1 text-on-surface font-mono">
              148 Homens-Hora
            </span>
          </div>

          <div className="overflow-x-auto bg-surface shadow-sm border border-surface-container-high">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-container text-on-surface uppercase text-[11px] font-semibold tracking-wider border-b border-surface-container-high">
                <tr>
                  <th className="py-2.5 px-3">Empresa / Empreiteira</th>
                  <th className="py-2.5 px-3">Função / Categoria</th>
                  <th className="py-2.5 px-3 text-center">Quant.</th>
                  <th className="py-2.5 px-3 text-right">Status Horas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                <tr className="bg-surface-container-low font-semibold text-on-surface">
                  <td className="py-2 px-3 tracking-wide text-[11px] uppercase bg-surface-container/60" colSpan={4}>
                    Construtora Horizonte Engenharia S/A (Equipe Própria)
                  </td>
                </tr>
                <tr className="bg-surface text-on-surface">
                  <td className="py-2 px-3 text-on-surface-variant font-mono">ENGO-DIR</td>
                  <td className="py-2 px-3">Engenheiro Residente (Fiscalização Geral)</td>
                  <td className="py-2 px-3 text-center font-semibold">1</td>
                  <td className="py-2 px-3 text-right text-tertiary">8h integral</td>
                </tr>
                <tr className="bg-surface text-on-surface">
                  <td className="py-2 px-3 text-on-surface-variant font-mono">SUP-OBRA</td>
                  <td className="py-2 px-3">Mestres de Obra &amp; TST</td>
                  <td className="py-2 px-3 text-center font-semibold">3</td>
                  <td className="py-2 px-3 text-right text-tertiary">24h total</td>
                </tr>
                <tr className="bg-surface text-on-surface">
                  <td className="py-2 px-3 text-on-surface-variant font-mono">LID-FRENTE</td>
                  <td className="py-2 px-3">Encarregados de Campo</td>
                  <td className="py-2 px-3 text-center font-semibold">4</td>
                  <td className="py-2 px-3 text-right text-tertiary">32h total</td>
                </tr>
                <tr className="bg-surface text-on-surface">
                  <td className="py-2 px-3 text-on-surface-variant font-mono">CIV-ALV</td>
                  <td className="py-2 px-3">Pedreiros de Acabamento &amp; Estrutural</td>
                  <td className="py-2 px-3 text-center font-semibold">12</td>
                  <td className="py-2 px-3 text-right text-on-surface">96h total (remanejados)</td>
                </tr>
                <tr className="bg-surface text-on-surface">
                  <td className="py-2 px-3 text-on-surface-variant font-mono">CIV-APOIO</td>
                  <td className="py-2 px-3">Serventes de Obra</td>
                  <td className="py-2 px-3 text-center font-semibold">18</td>
                  <td className="py-2 px-3 text-right text-on-surface">144h total</td>
                </tr>

                <tr className="bg-surface-container-low font-semibold text-on-surface">
                  <td className="py-2 px-3 tracking-wide text-[11px] uppercase bg-surface-container/60" colSpan={4}>
                    Aço &amp; Forma Serviços Estruturais Ltda.
                  </td>
                </tr>
                <tr className="bg-surface text-on-surface">
                  <td className="py-2 px-3 text-on-surface-variant font-mono">SUB-ESTR</td>
                  <td className="py-2 px-3">Encarregado de Armação</td>
                  <td className="py-2 px-3 text-center font-semibold">1</td>
                  <td className="py-2 px-3 text-right text-tertiary">8h integral</td>
                </tr>
                <tr className="bg-surface text-on-surface">
                  <td className="py-2 px-3 text-on-surface-variant font-mono">SUB-ESTR</td>
                  <td className="py-2 px-3">Armadores Especialistas (Laje 14)</td>
                  <td className="py-2 px-3 text-center font-semibold">8</td>
                  <td className="py-2 px-3 text-right text-error font-medium">6h (-2h chuva)</td>
                </tr>
                <tr className="bg-surface text-on-surface">
                  <td className="py-2 px-3 text-on-surface-variant font-mono">SUB-ESTR</td>
                  <td className="py-2 px-3">Carpinteiros de Fôrmas Metálicas</td>
                  <td className="py-2 px-3 text-center font-semibold">6</td>
                  <td className="py-2 px-3 text-right text-error font-medium">6h (-2h chuva)</td>
                </tr>

                <tr className="bg-surface-container-low font-semibold text-on-surface">
                  <td className="py-2 px-3 tracking-wide text-[11px] uppercase bg-surface-container/60" colSpan={4}>
                    HidroVolt Instalações Prediais SPE
                  </td>
                </tr>
                <tr className="bg-surface text-on-surface">
                  <td className="py-2 px-3 text-on-surface-variant font-mono">SUB-MEP</td>
                  <td className="py-2 px-3">Eletricistas e Encanadores Prediais</td>
                  <td className="py-2 px-3 text-center font-semibold">14</td>
                  <td className="py-2 px-3 text-right text-tertiary">8h integral (área coberta)</td>
                </tr>
              </tbody>
              <tfoot className="bg-surface-container-high font-semibold text-on-surface border-t-2 border-surface-container-highest">
                <tr>
                  <td className="py-2.5 px-3 uppercase text-[11px]" colSpan={2}>Total Consolidado de Efetivo Presente</td>
                  <td className="py-2.5 px-3 text-center font-bold text-sm">67 Colaboradores</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-sm text-primary">148 Hh Calculadas</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Bloco 3: Equipamentos em Canteiro (5 cols) */}
        <section className="xl:col-span-5 bg-surface-container-low p-5 shadow-sm flex flex-col justify-between space-y-4 border border-surface-container-high">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">precision_manufacturing</span>
                <h2 className="text-base font-semibold text-on-surface uppercase tracking-wide">
                  3. Maquinário &amp; Equipamentos
                </h2>
              </div>
              <span className="text-xs text-on-surface-variant font-mono">Turno Ativo: 07h-17h</span>
            </div>

            <div className="space-y-3">
              {/* Grua Torre A */}
              <div className="bg-surface p-3.5 shadow-sm space-y-2 border border-surface-container-high">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">cloud_upload</span>
                    <span className="text-xs font-semibold text-on-surface">Grua Principal - Torre A</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-primary-container text-on-primary-container uppercase">
                    Operação Condicionada
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Içamento de barras de aço CA-50 e bandejas. Paralisada por 2 horas durante a tarde devido a ventos de 46 km/h.
                </p>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-on-surface-variant">Horímetro: <strong className="text-on-surface font-mono">1.482,4 h</strong></span>
                  <span className="text-error font-medium">6h operando / 2h paralisada</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              {/* Betoneira 400L */}
              <div className="bg-surface p-3.5 shadow-sm space-y-2 border border-surface-container-high">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-lg">cyclone</span>
                    <span className="text-xs font-semibold text-on-surface">Betoneira 400L Elétrica #02</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-tertiary-container text-on-tertiary-container uppercase">
                    Operação Normal
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Produção de argamassa de assentamento e contrapiso para os pavimentos 6º ao 9º.
                </p>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-on-surface-variant">Ciclos: <strong className="text-on-surface font-mono">38 amassadas</strong></span>
                  <span className="text-tertiary font-medium">8h contínuas</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 overflow-hidden">
                  <div className="bg-tertiary h-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Mini Carregadeira Bobcat */}
              <div className="bg-surface p-3.5 shadow-sm space-y-2 border border-surface-container-high">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-lg">forklift</span>
                    <span className="text-xs font-semibold text-on-surface">Mini Carregadeira Bobcat S650</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-secondary-container text-on-secondary-container uppercase">
                    Terraplenagem
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Movimentação de terra vegetal para talude perimetral e remoção de bota-fora de caçambas.
                </p>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-on-surface-variant">Horímetro: <strong className="text-on-surface font-mono">842,1 h</strong></span>
                  <span className="text-tertiary font-medium">7h operando / 1h manutenção</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: '87.5%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface p-3 text-xs text-on-surface-variant flex items-center justify-between shadow-sm border border-surface-container-high">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">build_circle</span>
              Abastecimento e check-list diário concluídos
            </span>
            <button 
              type="button"
              onClick={() => showToast('Checklist de maquinário verificado conforme NR-18.', 'info')}
              className="text-primary font-semibold hover:underline"
            >
              Ver checklist
            </button>
          </div>
        </section>
      </div>

      {/* Bloco 4: Atividades Executadas, Ocorrências e Assinaturas */}
      <section className="bg-surface-container-low p-5 shadow-sm space-y-6 border border-surface-container-high">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">assignment_turned_in</span>
            <h2 className="text-base font-semibold text-on-surface uppercase tracking-wide">
              4. Frentes de Serviço &amp; Ocorrências Relevantes
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant font-mono">3 frentes produtivas auditadas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Frente 1 */}
          <div className="bg-surface p-4 shadow-sm space-y-3 border border-surface-container-high">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-primary">FRENTE-01 • 14º PAV.</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-error-container text-on-error-container uppercase">75% Concluído</span>
            </div>
            <h3 className="text-sm font-semibold text-on-surface">Concretagem de Vigas e Laje de Transição</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Conferência topográfica e escoramento finalizado. Concretagem interrompida às 15h por intempéries. Retomada programada para as 07h de amanhã.
            </p>
            <div className="relative w-full h-32 bg-surface-container overflow-hidden">
              <img 
                alt="Laje 14" 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=600&auto=format&fit=crop&q=80"
              />
              <span className="absolute bottom-2 left-2 bg-surface/90 text-on-surface px-1.5 py-0.5 text-[10px] font-mono font-medium backdrop-blur">
                Laje 14 - Torre A
              </span>
            </div>
          </div>

          {/* Frente 2 */}
          <div className="bg-surface p-4 shadow-sm space-y-3 border border-surface-container-high">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-primary">FRENTE-02 • 8º PAV.</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-tertiary-container text-on-tertiary-container uppercase">100% Meta Dia</span>
            </div>
            <h3 className="text-sm font-semibold text-on-surface">Alvenaria Estrutural e Vergas</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Execução de 142m² de alvenaria em blocos vazados. Verificação de prumo e nível conforme tolerâncias da NBR 15961 sem desvios.
            </p>
            <div className="relative w-full h-32 bg-surface-container overflow-hidden">
              <img 
                alt="Alvenaria" 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80"
              />
              <span className="absolute bottom-2 left-2 bg-surface/90 text-on-surface px-1.5 py-0.5 text-[10px] font-mono font-medium backdrop-blur">
                Pav. 8 - Apto 801/802
              </span>
            </div>
          </div>

          {/* Frente 3 */}
          <div className="bg-surface p-4 shadow-sm space-y-3 border border-surface-container-high">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-primary">FRENTE-03 • 6º PAV.</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-tertiary-container text-on-tertiary-container uppercase">Em Andamento</span>
            </div>
            <h3 className="text-sm font-semibold text-on-surface">Infraestrutura Elétrica e Hidráulica</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Passagem de dutos corrugados reforçados nas lajes e prumadas de esgoto primário. Teste prévio aprovado no ramal 604.
            </p>
            <div className="relative w-full h-32 bg-surface-container overflow-hidden">
              <img 
                alt="MEP" 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80"
              />
              <span className="absolute bottom-2 left-2 bg-surface/90 text-on-surface px-1.5 py-0.5 text-[10px] font-mono font-medium backdrop-blur">
                Prumada 6º Pavimento
              </span>
            </div>
          </div>
        </div>

        {/* Observações Gerais */}
        <div className="bg-surface p-4 shadow-sm space-y-3 border border-surface-container-high">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">edit_note</span>
              Observações Técnicas, Segurança do Trabalho &amp; Diligências
            </label>
            <span className="text-[11px] text-on-surface-variant font-mono">
              Editado por {activeProject.engineer} hoje às 17:42
            </span>
          </div>

          <textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            className="w-full bg-surface-container-low text-xs text-on-surface p-3 outline-none focus:bg-surface-container transition-colors leading-relaxed resize-none border border-surface-container-high"
          />
        </div>

        {/* Seção de Assinaturas Digitais e Validação Técnica */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-base">history_edu</span>
            Validação e Assinaturas Digitais Regulamentares
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assinatura Engenheiro Responsável */}
            <div className="bg-surface p-4 shadow-sm flex flex-col justify-between space-y-4 border border-surface-container-high">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] text-on-surface-variant uppercase font-semibold">Responsável Técnico pela Execução</span>
                  <h4 className="text-sm font-semibold text-on-surface mt-0.5">{activeProject.engineer}</h4>
                  <p className="text-xs text-on-surface-variant font-mono">{activeProject.crea} • ART nº 2024.088219-SP</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase ${isRdoSigned ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-[#fff8e1] text-[#b78103]'}`}>
                  <span className="material-symbols-outlined text-xs">
                    {isRdoSigned ? 'verified' : 'pending'}
                  </span>
                  {isRdoSigned ? 'Assinado Digitalmente' : 'Pendente de Assinatura'}
                </span>
              </div>

              <div className="bg-surface-container-low p-2.5 flex items-center justify-between text-[11px] font-mono border border-surface-container-high">
                <div className="flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-tertiary text-base">key</span>
                  <span>{isRdoSigned ? 'SHA-256: 4b29ef81a029c7d4e3391' : 'Certificado ICP-A3 pronto'}</span>
                </div>
                <span className="text-on-surface-variant">24/10/2024 às 17:50:12</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-on-surface-variant">Certificado ICP-Brasil A3 (Nuvem)</span>
                {!isRdoSigned ? (
                  <button 
                    type="button"
                    onClick={handleSign}
                    className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">draw</span>
                    <span>Assinar com Token ICP</span>
                  </button>
                ) : (
                  <span className="text-xs text-tertiary font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">task_alt</span>
                    Assinatura Homologada
                  </span>
                )}
              </div>
            </div>

            {/* Assinatura Fiscal do Cliente */}
            <div className="bg-surface p-4 shadow-sm flex flex-col justify-between space-y-4 border border-surface-container-high">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] text-on-surface-variant uppercase font-semibold">Fiscalização do Proprietário / Auditoria</span>
                  <h4 className="text-sm font-semibold text-on-surface mt-0.5">Arqª. Mariana Castanho</h4>
                  <p className="text-xs text-on-surface-variant font-mono">CAU A89214-0 • Alpha Gestão Patrimonial</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-secondary-container text-on-secondary-container uppercase">
                  <span className="material-symbols-outlined text-xs">pending</span> Aguardando Assinatura
                </span>
              </div>

              <div className="bg-surface-container-low p-2.5 flex items-center justify-between border border-surface-container-high">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-secondary text-base">draw</span>
                  <span>Notificação enviada por e-mail e app</span>
                </div>
                <button 
                  type="button"
                  onClick={() => showToast('Notificação com link seguro de assinatura reenviada ao fiscal.', 'info')}
                  className="px-3 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors border border-surface-container-high"
                >
                  Reenviar Token
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-on-surface-variant">Prazo legal de aceite: 24 horas</span>
                <span className="text-xs text-primary font-medium">Link válido até amanhã 18:00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Summary Bar */}
      <div className="bg-surface-container-low p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-on-surface-variant shadow-sm border border-surface-container-high">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary text-base">cloud_done</span>
          <span>RDO sincronizado na nuvem corporativa às 18:02. Versão preliminar pronta para exportação.</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => showToast('Abrindo histórico imutável das revisões deste RDO...', 'info')}
            className="hover:text-on-surface transition-colors font-medium"
          >
            Histórico de Alterações
          </button>
          <span>•</span>
          <button 
            type="button"
            onClick={() => openPdfModal('rdo')}
            className="text-primary font-semibold hover:underline"
          >
            Exportar Caderno RDO &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
