import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const PdfExportModal: React.FC = () => {
  const { 
    isPdfModalOpen, 
    setIsPdfModalOpen, 
    pdfReportType, 
    activeProject, 
    currentUser, 
    showToast,
    costItems,
    isRdoSigned
  } = useApp();

  const [includeCurvaS, setIncludeCurvaS] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeFvs, setIncludeFvs] = useState(true);
  const [includeCosts, setIncludeCosts] = useState(true);
  const [includeIcpStamp, setIncludeIcpStamp] = useState(true);
  const [includeWorkforce, setIncludeWorkforce] = useState(true);
  const [reportTitle, setReportTitle] = useState('Relatório Técnico Executivo de Obra');
  const [paperFormat, setPaperFormat] = useState<'a4_portrait' | 'a4_landscape'>('a4_portrait');

  if (!isPdfModalOpen) return null;

  const handlePrint = () => {
    window.print();
    showToast('Documento enviado para a fila de impressão do navegador.', 'info');
  };

  const handleSimulateDownload = () => {
    showToast('Gerando PDF assinado digitalmente com hash ICP-Brasil...', 'info');
    setTimeout(() => {
      showToast('Download do PDF concluído: Relatorio_ObraSync_Assinado.pdf', 'success');
      setIsPdfModalOpen(false);
    }, 1200);
  };

  const totalBudget = costItems.reduce((acc, item) => acc + item.budgetAmount, 0);
  const totalRealized = costItems.reduce((acc, item) => acc + item.realizedAmount, 0);

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col my-auto border border-surface-container-high">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-surface-container-high">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">picture_as_pdf</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">Gerador de Relatórios Executivos Personalizados</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface mt-1">Exportação Documental Oficial</h2>
            <p className="text-xs text-on-surface-variant">
              Empreendimento: <strong className="text-on-surface">{activeProject.name}</strong> • Código: <span className="font-mono">{activeProject.code}</span>
            </p>
          </div>
          <button 
            onClick={() => setIsPdfModalOpen(false)}
            className="p-1 hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            title="Fechar"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-4 flex-1 overflow-y-auto">
          {/* Controls Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-surface-container p-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface block">
                Opções &amp; Seções Inclusas
              </span>

              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-on-surface">Curva S Físico-Financeira</span>
                  <input 
                    type="checkbox" 
                    checked={includeCurvaS} 
                    onChange={e => setIncludeCurvaS(e.target.checked)}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-on-surface">Evidências Fotográficas com GPS</span>
                  <input 
                    type="checkbox" 
                    checked={includePhotos} 
                    onChange={e => setIncludePhotos(e.target.checked)}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-on-surface">Auditoria FVS &amp; Não Conformidades</span>
                  <input 
                    type="checkbox" 
                    checked={includeFvs} 
                    onChange={e => setIncludeFvs(e.target.checked)}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-on-surface">Demonstrativo de Custos &amp; ERP</span>
                  <input 
                    type="checkbox" 
                    checked={includeCosts} 
                    onChange={e => setIncludeCosts(e.target.checked)}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-on-surface">Consolidação Homem-Hora e Efetivo</span>
                  <input 
                    type="checkbox" 
                    checked={includeWorkforce} 
                    onChange={e => setIncludeWorkforce(e.target.checked)}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1 border-t border-surface-container-high pt-2">
                  <span className="text-on-surface font-semibold text-tertiary flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Carimbo de Assinatura ICP-Brasil
                  </span>
                  <input 
                    type="checkbox" 
                    checked={includeIcpStamp} 
                    onChange={e => setIncludeIcpStamp(e.target.checked)}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="bg-surface-container p-4 space-y-3 text-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface block">
                Formatação do Relatório
              </span>
              <div>
                <label className="text-[11px] text-on-surface-variant font-medium block mb-1">Título Personalizado</label>
                <input 
                  type="text" 
                  value={reportTitle}
                  onChange={e => setReportTitle(e.target.value)}
                  className="w-full bg-surface p-2 text-xs text-on-surface border border-surface-container-high focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaperFormat('a4_portrait')}
                  className={`p-2 text-center text-xs font-medium border ${paperFormat === 'a4_portrait' ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface border-surface-container-high'}`}
                >
                  A4 Retrato
                </button>
                <button
                  type="button"
                  onClick={() => setPaperFormat('a4_landscape')}
                  className={`p-2 text-center text-xs font-medium border ${paperFormat === 'a4_landscape' ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface border-surface-container-high'}`}
                >
                  A4 Paisagem
                </button>
              </div>
            </div>
          </div>

          {/* Document Preview Column (Print-ready look) */}
          <div className="md:col-span-7 bg-[#fafafa] border border-surface-container-high p-6 text-on-surface font-body overflow-y-auto max-h-[500px] shadow-inner text-xs">
            <div className="bg-white p-6 shadow-sm border border-gray-200 space-y-4">
              {/* Header Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-primary pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary text-on-primary font-bold flex items-center justify-center text-xs">
                    OS
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-on-surface">CONSTRUTORA HORIZONTE S/A</h3>
                    <p className="text-[10px] text-on-surface-variant">SISTEMA INTEGRADO DE GESTÃO TÉCNICA E OPERACIONAL • OBRASYNC</p>
                  </div>
                </div>
                <div className="text-right text-[10px] font-mono">
                  <span className="font-bold text-primary block">{activeProject.code}</span>
                  <span>{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-2">
                <h4 className="text-base font-bold uppercase tracking-wide text-on-surface">{reportTitle}</h4>
                <p className="text-[11px] text-on-surface-variant">
                  {activeProject.name} — {activeProject.address}
                </p>
              </div>

              {/* General Project Meta */}
              <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 text-[10px] border border-gray-200">
                <div>
                  <span className="text-gray-500 block uppercase font-medium">Responsável Técnico</span>
                  <span className="font-semibold text-gray-900">{activeProject.engineer}</span>
                  <span className="text-gray-500 block font-mono">{activeProject.crea}</span>
                </div>
                <div>
                  <span className="text-gray-500 block uppercase font-medium">Avanço Físico Global</span>
                  <span className="font-bold text-primary text-xs">{activeProject.progressPercent}%</span>
                  <span className="text-gray-500 block">Previsto: {activeProject.plannedPercent}%</span>
                </div>
                <div>
                  <span className="text-gray-500 block uppercase font-medium">Efetivo de Campo</span>
                  <span className="font-semibold text-gray-900">{activeProject.activeWorkers} operários</span>
                  <span className="text-gray-500 block">100% Catraca Facial</span>
                </div>
              </div>

              {/* Section 1: Curva S summary */}
              {includeCurvaS && (
                <div className="space-y-1 pt-2 border-t border-gray-200">
                  <span className="text-[11px] font-bold text-gray-800 uppercase block">1. Acompanhamento Físico-Financeiro</span>
                  <p className="text-[10px] text-gray-600 leading-relaxed">
                    Comparativo da Linha de Base contratual vs. medições de campo. Desvio físico atual de -2.6% com plano de mitigação aprovado no RDO #{activeProject.rdoNumber}.
                  </p>
                  <div className="h-14 bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-mono border border-dashed border-gray-300">
                    [Gráfico Curva S Físico-Financeira Acumulada Mês a Mês]
                  </div>
                </div>
              )}

              {/* Section 2: Costs */}
              {includeCosts && (
                <div className="space-y-1 pt-2 border-t border-gray-200">
                  <span className="text-[11px] font-bold text-gray-800 uppercase block">2. Demonstrativo Financeiro &amp; ERP S/4HANA</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-1.5 bg-gray-50 border border-gray-200">
                      <span className="text-gray-500 block">Orçamento Aprovado:</span>
                      <strong className="text-gray-900 font-mono">
                        {totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </strong>
                    </div>
                    <div className="p-1.5 bg-gray-50 border border-gray-200">
                      <span className="text-gray-500 block">Realizado Acumulado:</span>
                      <strong className="text-primary font-mono">
                        {totalRealized.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: Evidence */}
              {includePhotos && (
                <div className="space-y-1 pt-2 border-t border-gray-200">
                  <span className="text-[11px] font-bold text-gray-800 uppercase block">3. Evidências Periciais &amp; Georreferenciamento</span>
                  <p className="text-[10px] text-gray-600">
                    48 fotografias criptografadas com coordenadas GPS (-23.58741° S, -46.68239° W) e carimbo de tempo indelével.
                  </p>
                </div>
              )}

              {/* Stamp ICP */}
              {includeIcpStamp && (
                <div className="pt-4 border-t-2 border-gray-200 flex items-center justify-between text-[10px] bg-gray-50 p-3">
                  <div>
                    <span className="font-semibold text-gray-900 block">Eng. Ricardo Alcantara Souza</span>
                    <span className="text-gray-600 block">Responsável Técnico • CREA-SP 506.924.810-D</span>
                    <span className="text-gray-500 font-mono text-[9px]">ART nº 2024.088219-SP</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-green-700 font-bold uppercase">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      {isRdoSigned ? 'Assinado Digitalmente ICP-Brasil' : 'Certificado ICP A3 Validado'}
                    </span>
                    <span className="text-gray-500 block font-mono text-[9px]">HASH: SHA256#98fa7e2b10a45</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-surface-container-high flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-on-surface-variant text-[11px]">
            <span className="material-symbols-outlined text-tertiary text-base">verified_user</span>
            <span>Documento em conformidade com as diretrizes do PBQP-H e SiAC Nível A</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(false)}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-surface text-on-surface border border-surface-container-high hover:bg-surface-container transition-colors font-medium flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Imprimir Nativo</span>
            </button>
            <button
              type="button"
              onClick={handleSimulateDownload}
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-on-primary font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Baixar Pacote PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
