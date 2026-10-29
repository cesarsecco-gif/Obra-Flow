import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GeminiService } from '../services/geminiService';
import { PhotoEvidence } from '../types';

const SAMPLE_PHOTO_PRESETS = [
  {
    label: 'Armação de Laje (Conforme)',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80',
    hint: 'Armação positiva e espaçadores pastilha plástica de 3cm'
  },
  {
    label: 'Interferência / Tubulação Cortada (RNC)',
    url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80',
    hint: 'Tubulação cortando armadura estrutural sem mangote de reforço'
  },
  {
    label: 'Estanqueidade Barrilete (Em Andamento)',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
    hint: 'Lâmina de água 72h teste de estanqueidade barrilete'
  }
];

export const FieldQuickCaptureModal: React.FC = () => {
  const { 
    isQuickCaptureOpen, 
    setIsQuickCaptureOpen, 
    addPhotoEvidence, 
    addRnc, 
    activeProject, 
    currentUser, 
    showToast 
  } = useApp();

  const [imageUrl, setImageUrl] = useState<string>(SAMPLE_PHOTO_PRESETS[0].url);
  const [title, setTitle] = useState<string>('Inspeção de Armadura e Cobrimento');
  const [description, setDescription] = useState<string>('Conferência in loco de cobrimento de armadura com espaçadores plásticos.');
  const [front, setFront] = useState<string>('Torre A - 14º Pavimento');
  const [discipline, setDiscipline] = useState<string>('Estrutura de Concreto');
  const [status, setStatus] = useState<'conforme' | 'rnc' | 'em_andamento'>('conforme');
  const [tags, setTags] = useState<string>('Armação, PBQP-H, Laje 14');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  if (!isQuickCaptureOpen) return null;

  const handleAiAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAnalysisResult(null);
    try {
      const result = await GeminiService.analyzeConstructionPhoto(imageUrl, `${title} - ${front}`);
      setTitle(result.title);
      setDescription(result.description);
      setDiscipline(result.discipline);
      setStatus(result.status);
      setTags(result.detectedItems.join(', '));
      setAiAnalysisResult(`Análise Gemini concluída: ${result.recommendation} | Itens: ${result.detectedItems.join(', ')}`);
      showToast('Análise de IA (Gemini) aplicada aos campos!', 'success');
    } catch (e) {
      showToast('Não foi possível concluir a análise de IA.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      showToast('Por favor, informe o título da evidência.', 'warning');
      return;
    }

    const newEvidence: Omit<PhotoEvidence, 'id'> = {
      title,
      description,
      discipline,
      status,
      statusLabel: status === 'conforme' ? 'Conforme PBQP-H' : status === 'rnc' ? 'RNC Registrada' : 'Em Andamento',
      rdoNumber: activeProject.rdoNumber || '184',
      author: currentUser?.name || 'Engenharia de Campo',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('pt-BR'),
      location: `${activeProject.name} • ${front}`,
      coords: '-23.5874° S, -46.6824° W',
      altitude: '782.4m',
      imageUrl,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    addPhotoEvidence(newEvidence);

    // Se marcado como RNC, oferece criação automática no módulo RNC
    if (status === 'rnc') {
      addRnc({
        front,
        severity: 'critica',
        severityLabel: 'Severidade Alta / Crítica',
        status: 'aberta',
        description,
        rootCause: 'Identificado desvio de execução durante registro fotográfico de fiscalização.',
        actionPlan: 'Paralisação do trecho, notificação da equipe de montagem e reinspeção formal.',
        contractor: 'Empreiteira Responsável da Frente',
        inspector: currentUser?.name || 'Fiscal de Campo',
        deadline: new Date(Date.now() + 48 * 3600 * 1000).toLocaleDateString('pt-BR'),
        blocksWork: true,
        photos: [imageUrl],
        technicalBase: 'NBR 6118 / PBQP-H Nível A',
        fvsOrigin: 'FVS-042'
      });
      showToast('RNC correspondente aberta automaticamente!', 'error');
    }

    setIsQuickCaptureOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
          showToast('Foto do canteiro carregada!', 'info');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface max-w-2xl w-full p-6 shadow-2xl border border-surface-container-high my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">add_a_photo</span>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Captura Rápida de Campo</h2>
              <p className="text-xs text-on-surface-variant">Registro ágil de evidências e auditoria por IA</p>
            </div>
          </div>
          <button 
            onClick={() => setIsQuickCaptureOpen(false)}
            className="p-1 hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4 py-4 max-h-[75vh] overflow-y-auto">
          {/* Foto preview e seletor */}
          <div className="space-y-2">
            <div className="relative aspect-video w-full bg-surface-container-high overflow-hidden border border-surface-container-highest">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-primary/40 backdrop-blur-xs flex flex-col items-center justify-center text-white font-medium gap-2">
                  <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                  <span className="text-sm">Gemini Vision analisando armaduras, EPIs e anomalias...</span>
                </div>
              )}
            </div>

            {/* Presets rápidos ou upload */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-surface-container-highest hover:bg-surface-container-high cursor-pointer font-medium text-on-surface">
                <span className="material-symbols-outlined text-sm">photo_camera</span>
                Tirar Foto / Carregar Arquivo
                <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
              </label>

              <div className="flex items-center gap-1">
                <span className="text-[11px] text-on-surface-variant">Modelos:</span>
                {SAMPLE_PHOTO_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImageUrl(p.url);
                      setTitle(p.label);
                    }}
                    className={`px-2 py-1 text-[10px] border ${imageUrl === p.url ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-surface-container-high text-on-surface hover:bg-surface-container'}`}
                  >
                    Ex. {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botão de Análise com Gemini */}
          <div className="bg-primary/5 border border-primary/20 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
              <div>
                <p className="text-xs font-bold text-on-surface">Análise Automática por Visão Computacional</p>
                <p className="text-[11px] text-on-surface-variant">Classifica conformidade, preenche descrição e detecta riscos de SST</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAiAnalyze}
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-4 py-2 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">psychology</span>
              {isAnalyzing ? 'Analisando...' : 'Analisar com IA'}
            </button>
          </div>

          {aiAnalysisResult && (
            <div className="p-2.5 bg-secondary-container/40 border-l-4 border-secondary text-xs text-on-secondary-container">
              {aiAnalysisResult}
            </div>
          )}

          {/* Formulário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-on-surface">Título da Evidência</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-on-surface">Frente de Obra / Pavimento</label>
              <input
                type="text"
                value={front}
                onChange={e => setFront(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-on-surface">Disciplina Técnica</label>
              <select
                value={discipline}
                onChange={e => setDiscipline(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface focus:outline-hidden focus:border-primary"
              >
                <option value="Estrutura de Concreto">Estrutura de Concreto</option>
                <option value="Alvenaria e Vedação">Alvenaria e Vedação</option>
                <option value="Hidráulica x Estrutural">Hidráulica x Estrutural</option>
                <option value="Instalações Elétricas">Instalações Elétricas</option>
                <option value="Impermeabilização">Impermeabilização</option>
                <option value="Acabamentos e Revestimentos">Acabamentos e Revestimentos</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-on-surface">Status de Qualidade</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className={`w-full px-3 py-2 border font-bold ${status === 'conforme' ? 'bg-tertiary-container/30 text-tertiary border-tertiary/40' : status === 'rnc' ? 'bg-error-container/30 text-error border-error/40' : 'bg-surface-container border-surface-container-high'}`}
              >
                <option value="conforme">Conforme PBQP-H</option>
                <option value="rnc">RNC - Não Conforme (Abrir Notificação)</option>
                <option value="em_andamento">Em Andamento / Verificação</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="font-semibold text-on-surface">Descrição Técnica</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="font-semibold text-on-surface">Tags de Busca (separadas por vírgula)</label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Armação, Laje 14, FVS"
                className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-surface-container-high">
          <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">lock</span>
            Sincronização offline-first ativa
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsQuickCaptureOpen(false)}
              className="px-4 py-2 border border-surface-container-highest text-xs font-semibold text-on-surface hover:bg-surface-container"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors shadow-sm"
            >
              Gravar Evidência
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
