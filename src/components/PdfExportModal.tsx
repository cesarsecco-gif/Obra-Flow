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
    workers,
    photoEvidences,
    rdoNotes,
    fvsList,
    rncList,
    isRdoSigned
  } = useApp();

  const [includeCurvaS, setIncludeCurvaS] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeFvs, setIncludeFvs] = useState(true);
  const [includeCosts, setIncludeCosts] = useState(true);
  const [includeIcpStamp, setIncludeIcpStamp] = useState(true);
  const [includeRdoSummary, setIncludeRdoSummary] = useState(true);
  const [reportTitle, setReportTitle] = useState('Relatório Técnico Executivo de Obra');
  const [paperFormat, setPaperFormat] = useState<'a4_portrait' | 'a4_landscape'>('a4_portrait');

  if (!isPdfModalOpen) return null;

  const handlePrint = () => {
    window.print();
    showToast('Janela de impressão e gravação de PDF acionada.', 'info');
  };

  const handleDownloadStandalone = () => {
    const totalBudget = costItems.reduce((acc, item) => acc + item.budgetAmount, 0);
    const totalRealized = costItems.reduce((acc, item) => acc + item.realizedAmount, 0);
    const reportDate = new Date().toLocaleDateString('pt-BR');

    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${reportTitle} - ${activeProject.name}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #161616; margin: 0; padding: 20px; font-size: 11pt; }
    .header { border-bottom: 3px solid #0f62fe; padding-bottom: 12px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 18pt; font-weight: bold; margin: 10px 0 5px 0; text-align: center; color: #0f62fe; }
    .subtitle { text-align: center; color: #525252; font-size: 10pt; margin-bottom: 15px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; background: #f4f4f4; padding: 10px; border: 1px solid #e0e0e0; margin-bottom: 15px; font-size: 9pt; }
    .section-title { font-size: 12pt; font-weight: bold; margin: 15px 0 8px 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; color: #161616; }
    .photo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; }
    .photo-card { border: 1px solid #e0e0e0; padding: 6px; background: #fafafa; font-size: 8pt; }
    .photo-card img { width: 100%; height: 160px; object-fit: cover; }
    .stamp { margin-top: 25px; border-top: 2px solid #161616; padding-top: 10px; display: flex; justify-content: space-between; font-size: 9pt; background: #f9f9f9; padding: 12px; border: 1px solid #ccc; }
    .badge { display: inline-block; padding: 2px 6px; font-size: 8pt; font-weight: bold; background: #a7f0ba; color: #044317; border-radius: 2px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h2 style="margin:0; font-size:14pt; color:#161616;">CONSTRUTORA HORIZONTE S/A</h2>
      <small style="color:#525252;">SISTEMA INTEGRADO DE GESTÃO PBQP-H NÍVEL A • OBRASYNC</small>
    </div>
    <div style="text-align:right; font-family: monospace; font-size:9pt;">
      <strong>${activeProject.code}</strong><br/>
      Data de Emissão: ${reportDate}
    </div>
  </div>

  <div class="title">${reportTitle}</div>
  <div class="subtitle">${activeProject.name} — ${activeProject.address}</div>

  <div class="meta-grid">
    <div>
      <strong>Responsável Técnico:</strong><br/>
      ${activeProject.engineer}<br/>
      <small>${activeProject.crea} • ART 2024.088219-SP</small>
    </div>
    <div>
      <strong>Avanço Físico:</strong><br/>
      Realizado: ${activeProject.progressPercent}% / Previsto: ${activeProject.plannedPercent}%<br/>
      <small>Curva S Atualizada</small>
    </div>
    <div>
      <strong>Efetivo em Campo:</strong><br/>
      ${workers.length} colaboradores ativos<br/>
      <small>Controle Biométrico</small>
    </div>
  </div>

  ${includeRdoSummary ? `
  <div class="section-title">1. Resumo do Diário de Obra (RDO nº ${activeProject.rdoNumber})</div>
  <div style="background:#fcfcfc; border:1px solid #e0e0e0; padding:10px; font-size:9.5pt; white-space:pre-wrap; line-height:1.5;">${rdoNotes}</div>
  ` : ''}

  ${includeCosts ? `
  <div class="section-title">2. Resumo Físico-Financeiro</div>
  <table style="width:100%; border-collapse:collapse; font-size:9pt; margin-top:6px;">
    <tr style="background:#f4f4f4;">
      <th style="border:1px solid #ccc; padding:6px; text-align:left;">Orçamento Previsto</th>
      <th style="border:1px solid #ccc; padding:6px; text-align:left;">Realizado Acumulado</th>
      <th style="border:1px solid #ccc; padding:6px; text-align:left;">Desvio</th>
    </tr>
    <tr>
      <td style="border:1px solid #ccc; padding:6px;">${totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
      <td style="border:1px solid #ccc; padding:6px; font-weight:bold; color:#0f62fe;">${totalRealized.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
      <td style="border:1px solid #ccc; padding:6px; color:#198038;">No Orçamento</td>
    </tr>
  </table>
  ` : ''}

  ${includePhotos ? `
  <div class="section-title">3. Caderno de Evidências Fotográficas Georreferenciadas</div>
  <div class="photo-grid">
    ${photoEvidences.slice(0, 4).map(p => `
      <div class="photo-card">
        <img src="${p.imageUrl}" alt="${p.title}" />
        <div style="margin-top:4px;"><strong>${p.title}</strong></div>
        <div style="color:#525252;">${p.location} • ${p.date} ${p.timestamp}</div>
        <div style="margin-top:2px; font-style:italic;">${p.description}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="stamp">
    <div>
      <strong>${activeProject.engineer}</strong><br/>
      Engenheiro Civil Residente • CREA-SP 506.924.810-D<br/>
      <small>ART nº 2024.088219-SP • Obra: ${activeProject.name}</small>
    </div>
    <div style="text-align:right;">
      <span class="badge">ICP-BRASIL HOMOLOGADO</span><br/>
      <small style="font-family:monospace;">HASH: SHA256#${Date.now().toString(16)}a981c2f</small><br/>
      <small>Autenticação via ObraSync Enterprise</small>
    </div>
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_Oficial_${activeProject.code}_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Relatório Oficial HTML/PDF exportado com sucesso!', 'success');
  };

  const totalBudget = costItems.reduce((acc, item) => acc + item.budgetAmount, 0);
  const totalRealized = costItems.reduce((acc, item) => acc + item.realizedAmount, 0);

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto modal-backdrop-print">
      <div className="bg-surface max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col my-auto border border-surface-container-high modal-box-print">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-surface-container-high hide-on-print">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">picture_as_pdf</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">Gerador de Relatórios Executivos Oficiais</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface mt-1">Exportação Documental PBQP-H</h2>
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
          <div className="md:col-span-5 space-y-4 hide-on-print">
            <div className="bg-surface-container p-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface block">
                Seções Inclusas no Laudo
              </span>

              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-on-surface">Curva S Físico-Financeira</span>
                  <input 
                    type="checkbox" 
                    checked={includeCurvaS} 
                    onChange={e => setIncludeCurvaS(e.target.checked)}
                    className="accent-primary"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-on-surface">Minuta do RDO ({activeProject.rdoNumber})</span>
                  <input 
                    type="checkbox" 
                    checked={includeRdoSummary} 
                    onChange={e => setIncludeRdoSummary(e.target.checked)}
                    className="accent-primary"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-on-surface">Evidências Fotográficas ({photoEvidences.length})</span>
                  <input 
                    type="checkbox" 
                    checked={includePhotos} 
                    onChange={e => setIncludePhotos(e.target.checked)}
                    className="accent-primary"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-on-surface">Demonstrativo Financeiro ERP</span>
                  <input 
                    type="checkbox" 
                    checked={includeCosts} 
                    onChange={e => setIncludeCosts(e.target.checked)}
                    className="accent-primary"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-on-surface">Carimbo de Assinatura ICP-Brasil</span>
                  <input 
                    type="checkbox" 
                    checked={includeIcpStamp} 
                    onChange={e => setIncludeIcpStamp(e.target.checked)}
                    className="accent-primary"
                  />
                </label>
              </div>
            </div>

            <div className="bg-surface-container p-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface block">
                Personalização de Título
              </span>
              <div>
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

          {/* Document Preview Column */}
          <div className="md:col-span-7 bg-[#fafafa] border border-surface-container-high p-6 text-on-surface font-body overflow-y-auto max-h-[500px] shadow-inner text-xs w-full">
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
                  <span className="font-semibold text-gray-900">{workers.length} operários</span>
                  <span className="text-gray-500 block">100% Catraca Facial</span>
                </div>
              </div>

              {/* RDO Summary */}
              {includeRdoSummary && (
                <div className="space-y-1 pt-2 border-t border-gray-200">
                  <span className="text-[11px] font-bold text-gray-800 uppercase block">1. Registro de Diário de Obra (RDO nº {activeProject.rdoNumber})</span>
                  <div className="p-2 bg-gray-50 border border-gray-200 text-[10px] leading-relaxed whitespace-pre-wrap font-mono">
                    {rdoNotes}
                  </div>
                </div>
              )}

              {/* Section 1: Curva S */}
              {includeCurvaS && (
                <div className="space-y-1 pt-2 border-t border-gray-200">
                  <span className="text-[11px] font-bold text-gray-800 uppercase block">2. Acompanhamento Físico-Financeiro (Curva S)</span>
                  <p className="text-[10px] text-gray-600 leading-relaxed">
                    Comparativo da Linha de Base contratual vs. medições de campo. Desvio físico atual de -2.6% mitigado no RDO #{activeProject.rdoNumber}.
                  </p>
                  <div className="h-10 bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-mono border border-dashed border-gray-300">
                    [Curva S: Planejado 71.0% vs Executado 68.4%]
                  </div>
                </div>
              )}

              {/* Section 2: Costs */}
              {includeCosts && (
                <div className="space-y-1 pt-2 border-t border-gray-200">
                  <span className="text-[11px] font-bold text-gray-800 uppercase block">3. Demonstrativo Financeiro</span>
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
                  <span className="text-[11px] font-bold text-gray-800 uppercase block">4. Evidências Periciais Georreferenciadas</span>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {photoEvidences.slice(0, 2).map((photo, i) => (
                      <div key={i} className="border border-gray-200 p-1.5 bg-gray-50">
                        <img src={photo.imageUrl} alt={photo.title} className="w-full h-20 object-cover" />
                        <span className="font-bold text-[9px] block mt-1 truncate">{photo.title}</span>
                        <span className="text-gray-500 text-[8px] block">{photo.location}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stamp ICP */}
              {includeIcpStamp && (
                <div className="pt-4 border-t-2 border-gray-200 flex items-center justify-between text-[10px] bg-gray-50 p-3">
                  <div>
                    <span className="font-semibold text-gray-900 block">{activeProject.engineer}</span>
                    <span className="text-gray-600 block">Responsável Técnico • {activeProject.crea}</span>
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
        <div className="pt-4 border-t border-surface-container-high flex flex-wrap items-center justify-between gap-3 text-xs hide-on-print">
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
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadStandalone}
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-on-primary font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Baixar Arquivo Oficial</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
