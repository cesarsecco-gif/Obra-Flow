import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ErpIntegrationView: React.FC = () => {
  const { 
    erpLogs, 
    triggerErpSync, 
    isSyncing, 
    showToast,
    addAuditLog 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'erp' | 'apis' | 'webhooks'>('erp');
  const [apiKey, setApiKey] = useState('obs_live_89f02c9a184b4923e7104b28d');
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyKey = () => {
    setIsCopied(true);
    showToast('Chave de API de faturamento copiada.', 'info');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRotateKey = () => {
    const newK = `obs_live_${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;
    setApiKey(newK);
    showToast('Nova chave de API gerada com AES-256 e hash ICP.', 'success');
    addAuditLog('Chave de API Rotacionada', 'CUSTOS', 'Nova credencial de faturamento e CRM emitida');
  };

  return (
    <div className="flex flex-col w-full space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
            <span>Integrações Corporativas</span>
            <span>/</span>
            <span className="text-primary font-bold">Hub de ERP, Faturamento &amp; CRM</span>
            <span className="px-1.5 py-0.5 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold">API v2.4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mt-1">
            Conectores de ERP &amp; APIs de Faturamento Externo
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 max-w-3xl leading-relaxed">
            Sincronização bidirecional automática de dados financeiros, ordens de compra, medições de empreiteiras e integração com CRM e faturamento via Webhooks seguros.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={() => triggerErpSync('SAP')}
            disabled={isSyncing}
            className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-base ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
            <span>{isSyncing ? 'Sincronizando...' : 'Forçar Sync Geral de ERP'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface-container-low p-1 border border-surface-container-high text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('erp')}
          className={`px-4 py-2.5 border transition-all ${activeTab === 'erp' ? 'bg-surface text-primary border-primary shadow-sm' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          Conectores ERP (SAP, TOTVS, Sienge, Mega)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('apis')}
          className={`px-4 py-2.5 border transition-all ${activeTab === 'apis' ? 'bg-surface text-primary border-primary shadow-sm' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          APIs de Faturamento &amp; CRM
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('webhooks')}
          className={`px-4 py-2.5 border transition-all ${activeTab === 'webhooks' ? 'bg-surface text-primary border-primary shadow-sm' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          Webhooks &amp; Logs de Transmissão ({erpLogs.length})
        </button>
      </div>

      {/* Tab 1: ERP Connectors */}
      {activeTab === 'erp' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* SAP S/4HANA */}
            <div className="bg-surface p-5 shadow-sm border-2 border-primary space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-on-surface">SAP S/4HANA</span>
                  <span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase">
                    Conectado
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Módulos FI/CO e MM. Sincronização de pedidos, contas a pagar e centros de custo a cada 15 min.
                </p>
                <div className="mt-3 bg-surface-container p-2 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span>Host:</span>
                    <span className="text-on-surface font-semibold">sap-prod.horizonte.com.br</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protocolo:</span>
                    <span className="text-primary">OData v4 / RFC</span>
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => triggerErpSync('SAP')}
                className="w-full py-2 bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">sync</span>
                <span>Sincronizar SAP Agora</span>
              </button>
            </div>

            {/* TOTVS Protheus / RM */}
            <div className="bg-surface p-5 shadow-sm border border-surface-container-high space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-on-surface">TOTVS RM / Protheus</span>
                  <span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase">
                    Conectado
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Módulo TOP Obras e Gestão de Contratos de Empreiteiros e Medições Físicas.
                </p>
                <div className="mt-3 bg-surface-container p-2 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span>Host:</span>
                    <span className="text-on-surface font-semibold">totvs.horizonte.cloud</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protocolo:</span>
                    <span className="text-primary">REST API v12</span>
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => triggerErpSync('TOTVS')}
                className="w-full py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 border border-surface-container-high"
              >
                <span className="material-symbols-outlined text-sm text-primary">sync</span>
                <span>Sincronizar TOTVS</span>
              </button>
            </div>

            {/* Sienge Plataforma */}
            <div className="bg-surface p-5 shadow-sm border border-surface-container-high space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-on-surface">Sienge Plataforma</span>
                  <span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase">
                    Conectado
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Orçamento de engenharia, apropriação de insumos e compras integradas com canteiro.
                </p>
                <div className="mt-3 bg-surface-container p-2 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span>Instância:</span>
                    <span className="text-on-surface font-semibold">sienge.api/horizonte</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protocolo:</span>
                    <span className="text-primary">OpenAPI 3.0</span>
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => triggerErpSync('Sienge')}
                className="w-full py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 border border-surface-container-high"
              >
                <span className="material-symbols-outlined text-sm text-primary">sync</span>
                <span>Sincronizar Sienge</span>
              </button>
            </div>

            {/* Mega Sistemas */}
            <div className="bg-surface p-5 shadow-sm border border-surface-container-high space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-on-surface">Mega Construção</span>
                  <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface text-[10px] font-bold uppercase">
                    Standby
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Conector de contingência preparado para projetos em joint-venture e consórcios.
                </p>
                <div className="mt-3 bg-surface-container p-2 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-on-surface-variant">Pronto p/ Ativação</span>
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => showToast('Conector Mega Sistemas habilitado.', 'info')}
                className="w-full py-2 bg-surface hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 border border-surface-container-high"
              >
                Configurar Conector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: APIs de Faturamento & CRM */}
      {activeTab === 'apis' && (
        <div className="space-y-6">
          <div className="bg-surface-container-low p-6 shadow-sm border border-surface-container-high space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container-high">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                  Chave de Autenticação API de Produção
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Utilizada por sistemas externos de CRM (Salesforce, HubSpot) e faturamento (Stripe, Asaas, Bancos) para consulta de medições liberadas.
                </p>
              </div>
              <button 
                type="button"
                onClick={handleRotateKey}
                className="px-3 py-1.5 bg-surface hover:bg-surface-container-high text-xs font-semibold text-error border border-surface-container-high"
              >
                Rotacionar Chave
              </button>
            </div>

            <div className="flex items-center gap-2 bg-surface p-3 border border-surface-container-high">
              <span className="font-mono text-xs font-bold text-primary flex-1 select-all">{apiKey}</span>
              <button 
                type="button" 
                onClick={handleCopyKey}
                className="px-3 py-1.5 bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90"
              >
                {isCopied ? 'Copiada!' : 'Copiar Chave'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3 bg-surface border border-surface-container-high space-y-1">
                <span className="font-mono font-bold text-on-surface block">GET /api/v2/medicoes-aprovadas</span>
                <p className="text-on-surface-variant text-[11px]">Retorna lista de medições físicas homologadas pelo engenheiro RT para liberação de repasse bancário.</p>
              </div>
              <div className="p-3 bg-surface border border-surface-container-high space-y-1">
                <span className="font-mono font-bold text-on-surface block">POST /api/v2/faturamento-erp</span>
                <p className="text-on-surface-variant text-[11px]">Recebe confirmação de emissão de NF-e e quitação financeira para atualização do DRE em tempo real.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Webhooks & Logs */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="bg-surface overflow-x-auto shadow-sm border border-surface-container-high">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider border-b border-surface-container-high">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Sistema ERP</th>
                  <th className="py-3 px-4">Endpoint Conectado</th>
                  <th className="py-3 px-4">Registros</th>
                  <th className="py-3 px-4">Detalhes da Transação</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-mono text-[11px]">
                {erpLogs.map(log => (
                  <tr key={log.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 text-on-surface-variant">{log.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-on-surface">{log.system} S/4HANA</td>
                    <td className="py-3 px-4 text-primary">{log.endpoint}</td>
                    <td className="py-3 px-4 text-on-surface font-semibold">{log.recordsTransferred} recs</td>
                    <td className="py-3 px-4 text-on-surface-variant font-body">{log.details}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container font-bold text-[10px]">
                        200 OK
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
