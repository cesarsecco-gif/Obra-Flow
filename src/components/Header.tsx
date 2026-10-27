import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../mock/data';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    activeProject, 
    setIsProjectDrawerOpen, 
    isOffline, 
    toggleOffline, 
    pendingOfflineCount,
    syncOfflineData,
    isSyncing,
    setActiveTab,
    openPdfModal,
    login,
    logout
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface z-50 flex items-center justify-between px-4 lg:px-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high no-print">
      {/* Left side: Brand + Active Work Context Switcher */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('dashboard-gerencial')}
          className="flex items-center gap-2.5 pr-2 md:pr-4 cursor-pointer select-none"
        >
          <div className="w-8 h-8 bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm">
            <span className="material-symbols-outlined text-xl">apartment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-headline font-semibold text-lg text-on-surface tracking-tight">ObraSync</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-semibold bg-primary-container text-on-primary-fixed uppercase tracking-wider">Enterprise</span>
          </div>
        </div>

        {/* Active Work Context Switcher Pill */}
        <button
          onClick={() => setIsProjectDrawerOpen(true)}
          className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-high px-3 py-1.5 transition-colors cursor-pointer text-left"
          title="Clique para alternar o empreendimento ativo (Atalho: Ctrl+K)"
        >
          <span className="material-symbols-outlined text-primary text-xl">domain</span>
          <div className="flex flex-col min-w-0 max-w-[180px] sm:max-w-[260px] md:max-w-[320px]">
            <span className="text-[10px] text-on-surface-variant leading-none uppercase font-semibold tracking-wider flex items-center gap-1">
              <span>Obra Ativa</span>
              <span className="text-primary font-mono text-[9px] bg-primary/10 px-1 py-0.2">{activeProject.code}</span>
            </span>
            <span className="text-xs font-semibold text-on-surface leading-tight truncate mt-0.5">
              {activeProject.name}
            </span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-base ml-1">expand_more</span>
        </button>
      </div>

      {/* Right side: Status, Actions, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
        {/* Connection & Offline Status Pill (Interactive toggle) */}
        <div className="relative group">
          <button
            onClick={toggleOffline}
            className={`hidden md:flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium transition-all ${
              isOffline
                ? 'bg-error-container text-on-error-container border border-error/30'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
            title="Clique para simular modo offline/subsolo ou reconectar"
          >
            <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-error animate-pulse' : 'bg-tertiary'}`}></span>
            <span className="font-semibold">{isOffline ? 'Modo Subsolo (Offline)' : 'Online'}</span>
            <span className="text-[11px] text-on-surface-variant">
              {isOffline 
                ? `• ${pendingOfflineCount} no buffer SQLite` 
                : isSyncing 
                  ? '• Sincronizando...' 
                  : '• 14 itens auditados'
              }
            </span>
          </button>
        </div>

        {/* Action Shortcuts */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => setActiveTab('diario-de-obra-rdo')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">post_add</span>
            <span>+ Novo RDO</span>
          </button>
          <button
            onClick={() => setActiveTab('relatorio-fotografico')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container text-on-surface text-xs font-medium hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add_a_photo</span>
            <span>+ Subir Fotos</span>
          </button>
          <button
            onClick={() => openPdfModal('executivo')}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container text-on-surface text-xs font-medium hover:bg-surface-container-high transition-colors"
            title="Gerar e personalizar relatório executivo em PDF"
          >
            <span className="material-symbols-outlined text-sm text-primary">picture_as_pdf</span>
            <span>PDF</span>
          </button>
        </div>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 hover:bg-surface-container transition-colors relative text-on-surface"
            aria-label="Notificações de Canteiro"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface shadow-xl border border-surface-container-high p-4 z-50 text-xs animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
                <span className="font-semibold text-on-surface uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-sm">notifications</span>
                  Alertas Críticos de Canteiro
                </span>
                <span className="text-[10px] bg-error-container text-on-error-container font-semibold px-1.5 py-0.5">2 Pendentes</span>
              </div>
              <div className="divide-y divide-surface-container-high max-h-72 overflow-y-auto">
                <div 
                  onClick={() => { setActiveTab('nao-conformidades-rnc'); setIsNotificationsOpen(false); }}
                  className="py-2.5 hover:bg-surface-container-low cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-error flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">block</span> RNC #089 Bloqueio
                    </span>
                    <span className="text-on-surface-variant font-mono">14:32</span>
                  </div>
                  <p className="text-on-surface text-xs mt-0.5">Cobrimento insuficiente de armadura na Laje 14. Concretagem suspensa.</p>
                </div>
                <div 
                  onClick={() => { setActiveTab('diario-de-obra-rdo'); setIsNotificationsOpen(false); }}
                  className="py-2.5 hover:bg-surface-container-low cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">rainy</span> Alerta Climático
                    </span>
                    <span className="text-on-surface-variant font-mono">11:15</span>
                  </div>
                  <p className="text-on-surface text-xs mt-0.5">Previsão de precipitação de 18mm com rajadas de vento às 15h. Ancorar grua.</p>
                </div>
                <div 
                  onClick={() => { setActiveTab('painel-de-custos'); setIsNotificationsOpen(false); }}
                  className="py-2.5 hover:bg-surface-container-low cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-tertiary flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">sync</span> ERP Sync Sucesso
                    </span>
                    <span className="text-on-surface-variant font-mono">09:30</span>
                  </div>
                  <p className="text-on-surface text-xs mt-0.5">142 lançamentos de suprimentos SAP conciliados com a curva S física.</p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-surface-container-high text-center">
                <button 
                  onClick={() => { setActiveTab('nao-conformidades-rnc'); setIsNotificationsOpen(false); }}
                  className="text-primary hover:underline text-xs font-semibold"
                >
                  Ver central completa de pendências →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info & Fast Switcher */}
        <div className="relative">
          <div 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-surface-container-high cursor-pointer select-none"
          >
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-semibold text-on-surface leading-tight truncate max-w-[160px]">
                {currentUser ? currentUser.name : 'Visitante'}
              </span>
              <span className="text-[11px] text-on-surface-variant leading-none truncate max-w-[160px]">
                {currentUser ? currentUser.roleLabel.split(' ')[0] : 'Desconectado'}
              </span>
            </div>
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-surface-container-high"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                {currentUser?.name?.[0] || 'U'}
              </div>
            )}
            <span className="material-symbols-outlined text-on-surface-variant text-sm">expand_more</span>
          </div>

          {/* User Profile Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-surface shadow-2xl border border-surface-container-high p-4 z-50 text-xs animate-fadeIn">
              <div className="pb-3 border-b border-surface-container-high">
                <p className="font-semibold text-sm text-on-surface">{currentUser?.name}</p>
                <p className="text-[11px] text-on-surface-variant font-mono">{currentUser?.email}</p>
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <span className="px-1.5 py-0.5 bg-primary-container text-on-primary-fixed text-[10px] font-mono font-semibold">
                    {currentUser?.role.toUpperCase()}
                  </span>
                  {currentUser?.crea && (
                    <span className="px-1.5 py-0.5 bg-surface-container text-on-surface text-[10px] font-mono">
                      {currentUser.crea}
                    </span>
                  )}
                </div>
              </div>

              {/* Fast switch to another demo profile for easy testing */}
              <div className="py-2.5 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider block">
                  Alternar Perfil Demo de Teste:
                </span>
                {DEMO_USERS.map(u => (
                  <button
                    key={u.id}
                    onClick={() => { login(u); setIsUserMenuOpen(false); }}
                    className={`w-full text-left p-1.5 flex items-center justify-between text-xs hover:bg-surface-container transition-colors ${
                      currentUser?.id === u.id ? 'bg-primary/10 font-semibold text-primary' : 'text-on-surface'
                    }`}
                  >
                    <span className="truncate">{u.name}</span>
                    <span className="text-[10px] text-on-surface-variant">{u.role === 'admin' ? 'Admin' : u.role === 'fiscal_auditor' ? 'Fiscal' : 'RT'}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-surface-container-high space-y-1">
                <button
                  onClick={() => { setActiveTab('configuracoes'); setIsUserMenuOpen(false); }}
                  className="w-full text-left py-1.5 px-2 hover:bg-surface-container flex items-center gap-2 text-on-surface"
                >
                  <span className="material-symbols-outlined text-sm">settings</span>
                  <span>Configurações & CREA</span>
                </button>
                <button
                  onClick={() => { setActiveTab('gestao-de-usuarios'); setIsUserMenuOpen(false); }}
                  className="w-full text-left py-1.5 px-2 hover:bg-surface-container flex items-center gap-2 text-on-surface"
                >
                  <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                  <span>Gestão de Usuários (RBAC)</span>
                </button>
                <button
                  onClick={() => { logout(); setIsUserMenuOpen(false); }}
                  className="w-full text-left py-1.5 px-2 hover:bg-error-container text-error flex items-center gap-2 font-medium"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>Sair da Conta Corporativa</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
