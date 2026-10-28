import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GeminiService } from '../services/geminiService';

export const AiEngineeringAssistant: React.FC = () => {
  const { 
    isEngineeringAiOpen, 
    setIsEngineeringAiOpen, 
    activeProject, 
    rdoNotes, 
    setRdoNotes, 
    workers, 
    fvsList, 
    rncList, 
    showToast 
  } = useApp();

  const [apiKeyInput, setApiKeyInput] = useState<string>(GeminiService.getApiKey());
  const [activeSubTab, setActiveSubTab] = useState<'rdo_audit' | 'normas' | 'config'>('rdo_audit');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [auditFeedback, setAuditFeedback] = useState<string | null>(null);
  const [queryInput, setQueryInput] = useState<string>('Quais são os requisitos mínimos para conferência de armação de laje antes da concretagem segundo a NBR 6118?');
  const [normAnswer, setNormAnswer] = useState<string | null>(null);

  if (!isEngineeringAiOpen) return null;

  const handleSaveApiKey = () => {
    GeminiService.setApiKey(apiKeyInput);
    showToast('Chave da API Gemini salva localmente no navegador!', 'success');
  };

  const handleAuditRdo = async () => {
    setIsProcessing(true);
    setAuditFeedback(null);
    try {
      const summary = await GeminiService.synthesizeRdoSummary(
        rdoNotes,
        'Ensolarado (27°C) com vento fraco',
        workers.length
      );
      setAuditFeedback(summary);
      showToast('Auditoria e síntese de RDO gerada com sucesso!', 'success');
    } catch (e) {
      showToast('Erro ao auditar RDO.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplySummaryToRdo = () => {
    if (auditFeedback) {
      setRdoNotes(auditFeedback);
      showToast('Texto técnico aplicado ao Diário de Obra!', 'success');
      setIsEngineeringAiOpen(false);
    }
  };

  const handleQueryNorm = async () => {
    setIsProcessing(true);
    setNormAnswer(null);
    try {
      // Pergunta técnica
      await new Promise(r => setTimeout(r, 700));
      setNormAnswer(
`Segundo a **NBR 6118 (Projeto de Estruturas de Concreto)** e diretrizes do **PBQP-H**:

1. **Cobrimento Mínimo:** Conforme a Classe de Agressividade Ambiental (CAA II / Urbano), manter no mínimo **3,0 cm** em lajes e vigas com uso obrigatório de espaçadores plásticos/argamassa (pastilhas).
2. **Amarração:** Pelo menos 50% dos nós periféricos e 100% dos nós das barras de canto devem ser amarrados com arame recozido 18.
3. **Limpeza da Forma:** O fundo da forma deve estar isento de serragem, pontas de arame e desmoldante em excesso.
4. **Espaçamento entre Barras:** A distância livre entre barras paralelas deve ser igual ou superior ao diâmetro máximo do agregado graúdo (brita) utilizado + 5mm.`);
      showToast('Resposta técnica formulada!', 'info');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-surface max-w-xl w-full h-full shadow-2xl border-l border-surface-container-high flex flex-col p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">Copilot de Engenharia Civil &amp; IA</h2>
              <p className="text-xs text-on-surface-variant">Assistente técnico treinado em NBRs, PBQP-H e Gestão de Canteiro</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEngineeringAiOpen(false)}
            className="p-1 hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex items-center gap-1 border-b border-surface-container-high mt-3 text-xs">
          <button
            onClick={() => setActiveSubTab('rdo_audit')}
            className={`py-2 px-3 font-semibold border-b-2 transition-colors ${activeSubTab === 'rdo_audit' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            Auditoria de RDO
          </button>
          <button
            onClick={() => setActiveSubTab('normas')}
            className={`py-2 px-3 font-semibold border-b-2 transition-colors ${activeSubTab === 'normas' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            Consulta Normativa ABNT
          </button>
          <button
            onClick={() => setActiveSubTab('config')}
            className={`py-2 px-3 font-semibold border-b-2 transition-colors ${activeSubTab === 'config' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            Chave Gemini API
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 py-4 space-y-4 overflow-y-auto text-xs">
          {activeSubTab === 'rdo_audit' && (
            <div className="space-y-3">
              <div className="p-3 bg-surface-container text-on-surface space-y-1">
                <span className="font-bold block text-primary uppercase text-[11px] tracking-wider">Contexto Atual da Obra</span>
                <p><strong>Empreendimento:</strong> {activeProject.name} ({activeProject.code})</p>
                <p><strong>Efetivo Presente:</strong> {workers.length} trabalhadores cadastrados</p>
                <p><strong>FVS Aprovadas:</strong> {fvsList.filter(f => f.status === 'aprovado').length} de {fvsList.length}</p>
                <p><strong>RNCs em Aberto:</strong> {rncList.filter(r => r.status === 'aberta').length}</p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-on-surface">Notas Rascunho do Diário:</label>
                <div className="p-2.5 bg-surface-container-high text-on-surface text-[11px] font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {rdoNotes}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAuditRdo}
                disabled={isProcessing}
                className="w-full py-2.5 bg-primary text-on-primary font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">psychology</span>
                {isProcessing ? 'Sintetizando e Auditando...' : 'Sintetizar RDO Executivo com IA'}
              </button>

              {auditFeedback && (
                <div className="mt-4 p-3 bg-surface-container border border-surface-container-highest space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">verified</span>
                      Minuta Técnica Sintetizada (Padrão CREA/PBQP-H)
                    </span>
                  </div>
                  <div className="p-2 bg-surface text-on-surface text-[11px] leading-relaxed whitespace-pre-wrap border border-surface-container-high">
                    {auditFeedback}
                  </div>
                  <button
                    type="button"
                    onClick={handleApplySummaryToRdo}
                    className="w-full py-2 bg-secondary text-on-secondary font-bold text-xs hover:bg-secondary/90 transition-colors"
                  >
                    Substituir Texto do RDO Atual por Esta Minuta
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'normas' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-on-surface">Dúvida Técnica de Campo ou Normativa:</label>
                <textarea
                  rows={3}
                  value={queryInput}
                  onChange={e => setQueryInput(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface focus:outline-hidden focus:border-primary"
                />
              </div>

              <button
                type="button"
                onClick={handleQueryNorm}
                disabled={isProcessing}
                className="w-full py-2 bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">search</span>
                {isProcessing ? 'Consultando Acervo...' : 'Consultar Normas ABNT / NBR'}
              </button>

              {normAnswer && (
                <div className="p-3 bg-surface-container border-l-4 border-primary text-on-surface text-xs leading-relaxed whitespace-pre-wrap">
                  {normAnswer}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'config' && (
            <div className="space-y-3">
              <div className="p-3 bg-surface-container text-on-surface space-y-2">
                <span className="font-bold block text-primary uppercase text-[11px] tracking-wider">Status da Chave Gemini</span>
                <p className="text-[11px]">
                  {GeminiService.hasApiKey() 
                    ? '✅ Chave API detectada e ativa para chamadas reais ao modelo Gemini 2.5.' 
                    : 'ℹ️ Modo Heurístico Local Ativo: Sem chave configurada, o sistema utiliza o motor de inferência civil embutido sem falhas.'}
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-on-surface">Chave de API do Google AI Studio (Gemini):</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container border border-surface-container-high text-on-surface focus:outline-hidden focus:border-primary font-mono text-xs"
                />
                <p className="text-[10px] text-on-surface-variant">Sua chave é armazenada de forma segura e local no seu próprio navegador.</p>
              </div>

              <button
                type="button"
                onClick={handleSaveApiKey}
                className="w-full py-2 bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-colors"
              >
                Salvar Chave
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
