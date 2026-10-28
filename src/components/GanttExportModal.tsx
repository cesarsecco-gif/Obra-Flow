import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { parsePeriodDates } from './GanttPhaseEditModal';

interface GanttExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GanttExportModal: React.FC<GanttExportModalProps> = ({ isOpen, onClose }) => {
  const { activeProject, wbsPhases, showToast, addAuditLog } = useApp();
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Gerador de XML compatível com Microsoft Project
  const handleExportMsProjectXml = () => {
    setIsExporting(true);
    try {
      const now = new Date().toISOString();
      const projectStart = '2024-01-01T08:00:00';
      const projectFinish = '2025-12-15T18:00:00';

      const tasksXml = wbsPhases.map((phase, index) => {
        const uid = index + 1;
        const parsed = parsePeriodDates(phase.period);
        let startIso = phase.baselineStart ? `${phase.baselineStart}T08:00:00` : (parsed ? parsed.start.toISOString().split('.')[0] : projectStart);
        let endIso = phase.baselineEnd ? `${phase.baselineEnd}T18:00:00` : (parsed ? parsed.end.toISOString().split('.')[0] : projectFinish);
        const durationHours = phase.weightPercent * 40; // estimativa de horas
        const isCrit = phase.isCritical ? 1 : 0;
        const isMile = phase.milestoneCode ? 1 : 0;

        return `    <Task>
      <UID>${uid}</UID>
      <ID>${uid}</ID>
      <Name>${phase.name.replace(/&/g, '&amp;')}</Name>
      <Type>0</Type>
      <Active>1</Active>
      <CreateDate>${now}</CreateDate>
      <Start>${startIso}</Start>
      <Finish>${endIso}</Finish>
      <Duration>PT${durationHours}H0M0S</Duration>
      <PercentComplete>${Math.round(phase.progressPercent)}</PercentComplete>
      <PercentWorkComplete>${Math.round(phase.progressPercent)}</PercentWorkComplete>
      <Critical>${isCrit}</Critical>
      <Milestone>${isMile}</Milestone>
      <OutlineNumber>${uid}</OutlineNumber>
      <OutlineLevel>1</OutlineLevel>
      <WBS>${uid}</WBS>
      <Contact>${phase.contractor ? phase.contractor.replace(/&/g, '&amp;') : activeProject.engineer}</Contact>
      <Notes>${phase.notes ? phase.notes.replace(/&/g, '&amp;') : ''}</Notes>
    </Task>`;
      }).join('\n');

      const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>${activeProject.name.replace(/&/g, '&amp;')}</Name>
  <Title>Cronograma Físico EAP - ObraSync Enterprise</Title>
  <Company>ObraSync Construtora &amp; Engenharia</Company>
  <Author>${activeProject.engineer}</Author>
  <CreationDate>${now}</CreationDate>
  <LastSaved>${now}</LastSaved>
  <ScheduleFromStart>1</ScheduleFromStart>
  <StartDate>${projectStart}</StartDate>
  <FinishDate>${projectFinish}</FinishDate>
  <FYStartDate>1</FYStartDate>
  <CriticalSlackLimit>0</CriticalSlackLimit>
  <CurrencySymbol>R$</CurrencySymbol>
  <Tasks>
${tasksXml}
  </Tasks>
</Project>`;

      const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Cronograma_MSProject_${activeProject.code}_${new Date().toISOString().slice(0, 10)}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addAuditLog(
        'EXPORTAÇÃO MS-PROJECT XML',
        'RDO',
        `Arquivo XML do cronograma gerado para ${wbsPhases.length} etapas da EAP com compatibilidade MS-Project 2016-2024 e Primavera P6.`
      );
      showToast('Arquivo XML compatível com Microsoft Project baixado com sucesso!', 'success');
      onClose();
    } catch {
      showToast('Erro ao exportar arquivo do MS-Project.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Gerador de CSV da EAP
  const handleExportCsv = () => {
    try {
      const headers = ['Ordem', 'Código', 'Atividade / Fase', 'Período', 'Início Planejado', 'Término Planejado', 'Peso (%)', 'Avanço (%)', 'Desvio (dias)', 'Status', 'Caminho Crítico', 'Marco', 'Responsável'];
      const rows = wbsPhases.map(p => [
        p.order,
        `WBS-${p.order}`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.period}"`,
        p.baselineStart || '',
        p.baselineEnd || '',
        p.weightPercent,
        p.progressPercent,
        p.delayDays || 0,
        p.status,
        p.isCritical ? 'SIM' : 'NÃO',
        p.milestoneCode || '',
        `"${(p.contractor || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `EAP_Cronograma_${activeProject.code}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Planilha EAP (CSV) baixada com sucesso!', 'success');
      onClose();
    } catch {
      showToast('Erro ao exportar planilha.', 'error');
    }
  };

  // Impressão / PDF Oficial
  const handlePrintGanttPdf = () => {
    addAuditLog('EXPORTAÇÃO PDF CRONOGRAMA', 'RDO', 'Impressão executiva em PDF da Linha de Base e EAP acionada.');
    window.print();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface max-w-lg w-full p-6 shadow-2xl border border-surface-container-high my-auto animate-fadeIn font-body">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-surface-container-high">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">ios_share</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary font-mono">
                Interoperabilidade &amp; Relatórios
              </span>
            </div>
            <h2 className="text-base font-bold text-on-surface mt-1">Exportar Cronograma &amp; EAP</h2>
            <p className="text-xs text-on-surface-variant">
              Selecione o formato para exportação dos dados do cronograma físico e linha de base.
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

        {/* Options Grid */}
        <div className="py-4 space-y-3 text-xs">
          {/* Opção 1: MS-Project XML */}
          <div 
            onClick={handleExportMsProjectXml}
            className="p-4 bg-surface-container-low border border-surface-container-high hover:border-primary hover:bg-primary/5 cursor-pointer transition-all flex items-start justify-between group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#107c41]/10 text-[#107c41] flex items-center justify-center font-bold font-mono text-sm border border-[#107c41]/20 group-hover:bg-[#107c41] group-hover:text-white transition-colors">
                XML
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-on-surface">Microsoft Project XML (.xml)</h3>
                  <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-mono font-bold">Nativo</span>
                </div>
                <p className="text-on-surface-variant text-[11px] mt-1 leading-relaxed">
                  Compatível com <strong>Microsoft Project (2016-2024)</strong>, <strong>Primavera P6</strong> e <strong>LibreProject</strong>. Exporta todas as tarefas, durações, datas da Linha de Base, caminhos críticos e % medido.
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-2">
              download
            </span>
          </div>

          {/* Opção 2: PDF Executivo */}
          <div 
            onClick={handlePrintGanttPdf}
            className="p-4 bg-surface-container-low border border-surface-container-high hover:border-primary hover:bg-primary/5 cursor-pointer transition-all flex items-start justify-between group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-error/10 text-error flex items-center justify-center font-bold font-mono text-sm border border-error/20 group-hover:bg-error group-hover:text-white transition-colors">
                PDF
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-on-surface">Relatório Executivo PDF (A4 Paisagem)</h3>
                  <span className="px-1.5 py-0.5 bg-tertiary/10 text-tertiary text-[10px] font-mono font-bold">Oficial</span>
                </div>
                <p className="text-on-surface-variant text-[11px] mt-1 leading-relaxed">
                  Layout de impressão em alta resolução contendo carimbo técnico, número de ART/CREA, tabela da EAP, barras de Gantt e resumo dos marcos regulatórios.
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-2">
              print
            </span>
          </div>

          {/* Opção 3: Planilha CSV */}
          <div 
            onClick={handleExportCsv}
            className="p-4 bg-surface-container-low border border-surface-container-high hover:border-primary hover:bg-primary/5 cursor-pointer transition-all flex items-start justify-between group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-surface-container text-on-surface flex items-center justify-center font-bold font-mono text-sm border border-surface-container-high group-hover:bg-on-surface group-hover:text-surface transition-colors">
                CSV
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-on-surface">Planilha de Dados (CSV / Excel)</h3>
                  <span className="px-1.5 py-0.5 bg-surface text-on-surface-variant text-[10px] font-mono border">Tabular</span>
                </div>
                <p className="text-on-surface-variant text-[11px] mt-1 leading-relaxed">
                  Exporta a tabela completa da EAP com delimitador ponto-e-vírgula pronto para Excel, PowerBI ou importação em sistemas ERP (Sienge/Totvs).
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-2">
              table_chart
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-container-high">
          <span className="text-[11px] text-on-surface-variant font-mono">
            {wbsPhases.length} etapas registradas
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
