import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const { 
    currentUser, 
    activeProject, 
    isOffline, 
    toggleOffline, 
    showToast,
    addAuditLog 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'perfil' | 'notificacoes' | 'offline' | 'seguranca'>('perfil');
  const [compressPhotos, setCompressPhotos] = useState(true);
  const [faradayMode, setFaradayMode] = useState(true);
  const [syncInterval, setSyncInterval] = useState('5');

  // Profile Form State
  const [userName, setUserName] = useState(currentUser?.name || 'Ricardo Alcantara Souza');
  const [userEmail, setUserEmail] = useState(currentUser?.email || 'ricardo.souza@construtora.com.br');
  const [userPhone, setUserPhone] = useState(currentUser?.phone || '+55 (11) 98765-4321');
  const [userCrea, setUserCrea] = useState(currentUser?.crea || 'CREA-SP 506.924.810-D');

  const handleSave = () => {
    showToast('Configurações da conta e parâmetros de canteiro salvos com sucesso.', 'success');
    addAuditLog('Configurações Salvas', 'USUARIO', 'Parâmetros de canteiro e sincronismo offline atualizados');
  };

  return (
    <div className="flex flex-col w-full space-y-6 font-body">
      {/* Top Header */}
      <div className="bg-surface-container-low px-6 py-5 border border-surface-container-high shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              SISTEMA &amp; PREFERÊNCIAS
            </span>
            <span className="text-on-surface-variant text-xs">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary font-mono">
              GESTÃO OPERACIONAL
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Configurações da Conta &amp; Canteiro</h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface text-on-surface text-xs font-mono border border-surface-container-high">
              <span className="material-symbols-outlined text-sm text-tertiary">verified_user</span>
              <span>Ambiente Criptografado &amp; Certificado CREA/CONFEA</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">check</span>
            <span>Salvar Configurações</span>
          </button>
        </div>
      </div>

      {/* Tabs Strip */}
      <div className="bg-surface-container-low px-4 flex items-center gap-1 overflow-x-auto border border-surface-container-high text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('perfil')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all ${activeTab === 'perfil' ? 'bg-surface text-primary border-primary shadow-sm' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          <span className="material-symbols-outlined text-base">badge</span>
          <span>Perfil Profissional &amp; CREA</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notificacoes')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all ${activeTab === 'notificacoes' ? 'bg-surface text-primary border-primary shadow-sm' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          <span className="material-symbols-outlined text-base">notifications_active</span>
          <span>Notificações &amp; Alertas de Risco</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('offline')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all ${activeTab === 'offline' ? 'bg-surface text-primary border-primary shadow-sm' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          <span className="material-symbols-outlined text-base">cloud_sync</span>
          <span>Sincronização Offline &amp; Armazenamento</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seguranca')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all ${activeTab === 'seguranca' ? 'bg-surface text-primary border-primary shadow-sm' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          <span className="material-symbols-outlined text-base">shield</span>
          <span>Segurança &amp; Assinatura Digital ICP</span>
        </button>
      </div>

      {/* Tab 1: Perfil */}
      {activeTab === 'perfil' && (
        <section className="bg-surface-container-low p-6 space-y-6 border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">assignment_ind</span>
              <div>
                <h2 className="text-sm font-bold text-on-surface uppercase tracking-wide">01. Identificação Técnica &amp; Vínculo Funcional</h2>
                <p className="text-xs text-on-surface-variant">Dados cadastrais associados aos relatórios técnicos, diários de obra e validações perante órgãos fiscalizadores.</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-on-surface-variant bg-surface px-2 py-1 border border-surface-container-high">
              ID: #ENG-99824-HORIZONTE
            </span>
          </div>

          {/* Profile Card */}
          <div className="bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-surface-container-high shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 bg-surface-container-high shrink-0 overflow-hidden">
                <img 
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
                  alt={userName}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-tertiary shadow-sm"></span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-on-surface">{userName}</span>
                  <span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase tracking-wider font-mono">
                    CREA REGULAR
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">Engenheiro Residente Titular • Gestão Executiva {activeProject.name}</p>
                <div className="flex items-center gap-3 text-[11px] text-secondary font-mono">
                  <span>Último Acesso: Hoje, 07:14</span>
                  <span>•</span>
                  <span>Token ICP-A3 Ativo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="bg-surface p-3 space-y-1.5 border border-surface-container-high">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Nome Completo</label>
              <input 
                type="text" 
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full h-9 px-3 bg-surface-container text-xs text-on-surface focus:outline-none font-medium"
              />
              <span className="text-[10px] text-on-surface-variant">Conforme registro oficial no CREA-SP.</span>
            </div>

            <div className="bg-surface p-3 space-y-1.5 border border-surface-container-high">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">E-mail Corporativo</label>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-tertiary">
                  <span className="material-symbols-outlined text-xs">verified</span> Verificado
                </span>
              </div>
              <input 
                type="email" 
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                className="w-full h-9 px-3 bg-surface-container text-xs text-on-surface focus:outline-none font-mono font-medium"
              />
              <span className="text-[10px] text-on-surface-variant">Utilizado para notificações e assinatura de relatórios.</span>
            </div>

            <div className="bg-surface p-3 space-y-1.5 border border-surface-container-high">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Telefone / WhatsApp</label>
              <input 
                type="text" 
                value={userPhone}
                onChange={e => setUserPhone(e.target.value)}
                className="w-full h-9 px-3 bg-surface-container text-xs text-on-surface focus:outline-none font-mono"
              />
              <span className="text-[10px] text-on-surface-variant">Canal prioritário para alertas operacionais.</span>
            </div>

            <div className="bg-surface p-3 space-y-1.5 border border-surface-container-high">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Registro CREA / CAU</label>
              <input 
                type="text" 
                value={userCrea}
                onChange={e => setUserCrea(e.target.value)}
                className="w-full h-9 px-3 bg-surface-container text-xs text-on-surface focus:outline-none font-bold font-mono text-primary"
              />
              <span className="text-[10px] text-on-surface-variant">Homologado perante o conselho regional.</span>
            </div>

            <div className="bg-surface p-3 space-y-1.5 border border-surface-container-high">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">ART Principal Vinculada</label>
              <input 
                type="text" 
                defaultValue="ART nº 2024.088219-SP — Execução Residencial Horizonte"
                className="w-full h-9 px-3 bg-surface-container text-xs text-on-surface focus:outline-none font-mono text-[11px]"
              />
              <span className="text-[10px] text-on-surface-variant">Anotação de Responsabilidade Técnica de Execução Civil.</span>
            </div>

            <div className="bg-surface p-3 space-y-1.5 border border-surface-container-high">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Empreendimento Padrão</label>
              <input 
                type="text" 
                value={activeProject.name}
                readOnly
                className="w-full h-9 px-3 bg-surface-container text-xs text-on-surface focus:outline-none font-semibold"
              />
              <span className="text-[10px] text-on-surface-variant">Canteiro ativo carregado por padrão.</span>
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: Notificações */}
      {activeTab === 'notificacoes' && (
        <section className="bg-surface-container-low p-6 space-y-4 border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
              <div>
                <h2 className="text-sm font-bold text-on-surface uppercase tracking-wide">02. Alertas Críticos de Canteiro &amp; Push</h2>
                <p className="text-xs text-on-surface-variant">Configuração de disparo automático para eventos de risco, chuva e logística de concreto.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-surface p-4 flex items-center justify-between border border-surface-container-high">
              <div className="space-y-1 max-w-xl">
                <span className="font-bold text-on-surface block">Alertas Meteorológicos Críticos (Tempestade / Vento &gt; 40 km/h)</span>
                <p className="text-on-surface-variant text-[11px]">Disparo sonoro imediato para paralisação compulsória de gruas e andaimes.</p>
              </div>
              <input type="checkbox" defaultChecked className="accent-primary w-5 h-5 cursor-pointer" />
            </div>

            <div className="bg-surface p-4 flex items-center justify-between border border-surface-container-high">
              <div className="space-y-1 max-w-xl">
                <span className="font-bold text-on-surface block">Abertura de RNC Técnica (Não Conformidade Estrutural)</span>
                <p className="text-on-surface-variant text-[11px]">Notifica o calculista estrutural e o engenheiro residente assim que registrado em campo.</p>
              </div>
              <input type="checkbox" defaultChecked className="accent-primary w-5 h-5 cursor-pointer" />
            </div>

            <div className="bg-surface p-4 flex items-center justify-between border border-surface-container-high">
              <div className="space-y-1 max-w-xl">
                <span className="font-bold text-on-surface block">Lembrete de Fechamento Diário do RDO (às 17h30)</span>
                <p className="text-on-surface-variant text-[11px]">Aviso push para consolidação do contingente de campo antes da saída.</p>
              </div>
              <input type="checkbox" defaultChecked className="accent-primary w-5 h-5 cursor-pointer" />
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Offline & Armazenamento */}
      {activeTab === 'offline' && (
        <section className="bg-surface-container-low p-6 space-y-5 border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">offline_pin</span>
              <div>
                <h2 className="text-sm font-bold text-on-surface uppercase tracking-wide">03. Modo Subsolo &amp; Armazenamento Local</h2>
                <p className="text-xs text-on-surface-variant">Operacionalidade em garagens subterrâneas, poços de elevadores e áreas de sombra 4G.</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={toggleOffline}
              className={`px-3 py-1.5 text-xs font-bold border transition-colors ${isOffline ? 'bg-error text-on-error border-error' : 'bg-surface text-on-surface border-surface-container-high'}`}
            >
              {isOffline ? 'Modo Offline Forçado (Ativo)' : 'Simular Modo Offline (Subsolo)'}
            </button>
          </div>

          <div className="bg-surface p-4 space-y-2 border border-surface-container-high">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isOffline ? 'bg-error' : 'bg-tertiary'}`}></span>
                <span className="font-bold text-on-surface">Motor Offline PWA + IndexedDB</span>
              </div>
              <span className="font-mono text-tertiary font-bold text-[11px]">100% Saudável</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Todas as fotos com GPS, notas de campo e registros climáticos são gravados localmente em SQLite/IndexedDB e sincronizados automaticamente na nuvem quando a conexão é restabelecida.
            </p>
          </div>

          <div className="bg-surface p-4 space-y-4 border border-surface-container-high text-xs">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-on-surface block">Compressão Inteligente de Fotos de Campo</span>
                <p className="text-on-surface-variant text-[11px]">Reduz arquivos para 1600px preservando intactos metadados EXIF, GPS e carimbo.</p>
              </div>
              <input 
                type="checkbox" 
                checked={compressPhotos} 
                onChange={e => setCompressPhotos(e.target.checked)}
                className="accent-primary w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t border-surface-container-high pt-3">
              <div className="space-y-0.5">
                <span className="font-bold text-on-surface block">Modo Subsolo / Gaiola de Faraday Forçado</span>
                <p className="text-on-surface-variant text-[11px]">Evita tentativas repetidas de conexão por timeouts curtos, poupando a bateria de coletores móveis.</p>
              </div>
              <input 
                type="checkbox" 
                checked={faradayMode} 
                onChange={e => setFaradayMode(e.target.checked)}
                className="accent-primary w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="border-t border-surface-container-high pt-3 space-y-1.5">
              <label className="font-semibold text-on-surface block">Frequência de Sincronização Automática</label>
              <select 
                value={syncInterval}
                onChange={e => setSyncInterval(e.target.value)}
                className="w-full h-9 px-3 bg-surface-container text-xs text-on-surface focus:outline-none border border-surface-container-high"
              >
                <option value="2">A cada 2 minutos (Consumo intensivo de bateria)</option>
                <option value="5">A cada 5 minutos (Recomendado para 4G de canteiro)</option>
                <option value="15">A cada 15 minutos (Modo econômico)</option>
                <option value="manual">Sob demanda manual ou via Wi-Fi do barracão</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* Tab 4: Segurança ICP */}
      {activeTab === 'seguranca' && (
        <section className="bg-surface-container-low p-6 space-y-5 border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">gavel</span>
              <div>
                <h2 className="text-sm font-bold text-on-surface uppercase tracking-wide">04. Segurança &amp; Validação Jurídica ICP-Brasil</h2>
                <p className="text-xs text-on-surface-variant">Conformidade com a MP 2.200-2/2001 e normas de valor probatório do RDO e FVS.</p>
              </div>
            </div>
          </div>

          <div className="bg-surface p-4 space-y-3 border border-surface-container-high">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-lg">verified</span>
                <span className="text-xs font-bold text-on-surface">Certificado Digital ICP-Brasil A3 em Nuvem</span>
              </div>
              <span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold font-mono">CONECTADO</span>
            </div>

            <div className="bg-surface-container p-3 space-y-1 font-mono text-[11px] border border-surface-container-high">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Titular do Certificado:</span>
                <span className="font-bold text-on-surface">{userName}:506924810</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Autoridade Certificadora:</span>
                <span className="text-on-surface">AC SERPRO RFB v5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Validade Jurídica Até:</span>
                <span className="text-tertiary font-bold">18/11/2026 (634 dias restantes)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Chave Criptográfica:</span>
                <span className="text-on-surface">RSA 2048 bits / SHA-256</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[11px] text-on-surface-variant">Assinatura automática ao homologar Diário de Obra</span>
              <button 
                type="button" 
                onClick={() => showToast('Certificado ICP testado e validado com sucesso no servidor de chaves.', 'success')}
                className="text-primary font-bold hover:underline flex items-center gap-1"
              >
                <span>Testar Assinatura Digital</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
