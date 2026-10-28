import React from 'react';
import { PhotoEvidence, WbsPhase } from '../types';

interface GanttPhaseEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: WbsPhase | null;
  photoEvidences: PhotoEvidence[];
  rdoNotes: string;
  onOpenQuickCapture?: () => void;
}

export const GanttPhaseEvidenceModal: React.FC<GanttPhaseEvidenceModalProps> = ({
  isOpen,
  onClose,
  phase,
  photoEvidences,
  rdoNotes,
  onOpenQuickCapture
}) => {
  if (!isOpen || !phase) return null;

  // Filtrar fotos relacionadas a esta etapa da EAP
  // Heurística de matching por nome / id / palavras-chave da etapa
  const lowerName = phase.name.toLowerCase();
  const matchedPhotos = photoEvidences.filter(photo => {
    const t = photo.title.toLowerCase();
    const l = (photo.location || '').toLowerCase();
    const a = (photo.altitude || '').toLowerCase();


    if (lowerName.includes('alvenaria') && (t.includes('alvenaria') || t.includes('bloco') || l.includes('alvenaria'))) return true;
    if (lowerName.includes('estrutura') && (t.includes('concreto') || t.includes('armadura') || t.includes('laje') || t.includes('pilar') || t.includes('ferragem'))) return true;
    if (lowerName.includes('funda') && (t.includes('estaca') || t.includes('sapata') || t.includes('bloco') || t.includes('escavação'))) return true;
    if (lowerName.includes('instala') && (t.includes('hidráulica') || t.includes('tubo') || t.includes('elétrica') || t.includes('shaft'))) return true;
    if (lowerName.includes('fachada') && (t.includes('fachada') || t.includes('vidro') || t.includes('caixilho') || t.includes('balancim'))) return true;
    if (lowerName.includes('revestimento') && (t.includes('gesso') || t.includes('porcelanato') || t.includes('piso') || t.includes('cerâmica'))) return true;
    
    // Fallback se não encontrar específico: exibir fotos mais recentes
    return false;
  });

  const displayPhotos = matchedPhotos.length > 0 ? matchedPhotos : photoEvidences.slice(0, 3);

  // Filtrar trechos do RDO pertinentes
  const rdoLines = rdoNotes.split('\n').filter(line => line.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-[24px]">photo_camera</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white tracking-wide">
                  Evidências Fotográficas & Histórico de RDO
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  {phase.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprovações Visuais do Avanço Físico ({phase.progressPercent}%) • Auditoria SGQ & CREA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenQuickCapture && (
              <button
                onClick={() => {
                  onClose();
                  onOpenQuickCapture();
                }}
                className="px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs text-emerald-300 font-medium flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">add_a_photo</span>
                Adicionar Foto no Canteiro
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Phase Summary Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Período Programado: <strong className="text-white">{phase.period}</strong></span>
                <span>•</span>
                <span>Peso EAP: <strong className="text-indigo-300">{phase.weightPercent}%</strong></span>
                {phase.contractor && (
                  <>
                    <span>•</span>
                    <span>Empreiteira: <strong className="text-cyan-300">{phase.contractor}</strong></span>
                  </>
                )}
              </div>
              {phase.notes && (
                <p className="text-xs text-amber-300/90 mt-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                  <span className="font-semibold">Nota da Etapa:</span> {phase.notes}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400 uppercase font-mono">Avanço Físico</div>
                <div className="text-xl font-bold font-mono text-emerald-400">{phase.progressPercent}%</div>
              </div>
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${phase.progressPercent}%` }}></div>
              </div>
            </div>
          </div>

          {/* Photographic Evidence Gallery */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-sm">collections</span>
                Fotos Auditadas da Frente de Trabalho ({displayPhotos.length})
              </h4>
              <span className="text-[11px] text-slate-400">Georreferenciadas & Verificadas por IA</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {displayPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-lg group hover:border-slate-700 transition-all flex flex-col"
                >
                  <div className="relative aspect-video bg-slate-800 overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/75 text-emerald-300 backdrop-blur-sm border border-emerald-500/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      IA Conforme
                    </div>
                    {photo.location && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/75 text-white backdrop-blur-sm">
                        {photo.location}
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h5 className="text-xs font-semibold text-white leading-tight">{photo.title}</h5>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{photo.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        {photo.timestamp}
                      </span>
                      {photo.coords && (
                        <span className="flex items-center gap-1 text-slate-500 font-mono">
                          <span className="material-symbols-outlined text-xs">pin_drop</span>
                          GPS: {photo.coords}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* Excerpts from RDO (Diário de Obra) */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-sm">history_edu</span>
                Apontamentos do Diário de Obra (RDO)
              </h4>
              <span className="text-[11px] text-slate-400">Rastreabilidade Oficial</span>
            </div>

            <div className="space-y-2 text-xs">
              {rdoLines.map((line, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-start gap-2.5"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-emerald-400">verified</span>
            <span>Evidências aceitas para prestação de contas na Caixa Econômica e auditorias ISO 9001.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Fechar Evidências
          </button>
        </div>
      </div>
    </div>
  );
};
