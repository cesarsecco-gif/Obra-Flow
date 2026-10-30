import React from 'react';
import { useApp, NavigationTab } from '../context/AppContext';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: string;
  badge?: string | number;
  badgeColor?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, isOffline, pendingOfflineCount, rncList } = useApp();

  const openRncCount = rncList.filter(r => r.status !== 'encerrada').length;

  const navItems: NavItem[] = [
    { id: 'dashboard-gerencial', label: 'Dashboard Gerencial', icon: 'dashboard' },
    { id: 'diario-de-obra-rdo', label: 'Diário de Obra (RDO)', icon: 'menu_book' },
    { id: 'pluviometria', label: 'Pluviometria & Clima', icon: 'rainy' },
    { id: 'painel-de-custos', label: 'Painel de Custos & ERP', icon: 'query_stats', badge: 'R$ 48.5M', badgeColor: 'bg-primary-container text-on-primary-fixed font-mono', highlight: true },
    { id: 'relatorio-fotografico', label: 'Relatório Fotográfico', icon: 'photo_camera' },
    { id: 'auditorias-inspecoes-fvs', label: 'Auditorias & FVS (PBQP-H)', icon: 'verified' },
    { id: 'nao-conformidades-rnc', label: 'Não Conformidades (RNC)', icon: 'report_problem', badge: openRncCount > 0 ? openRncCount : undefined, badgeColor: 'bg-error text-on-error' },
    { id: 'cronograma-gantt', label: 'Cronograma & Gantt', icon: 'calendar_month' },
    { id: 'efetivo-e-equipamentos', label: 'Efetivo & Equipamentos', icon: 'engineering' },
    { id: 'comunicacao-de-campo', label: 'Comunicação de Campo', icon: 'forum', badge: 3, badgeColor: 'bg-primary text-on-primary' },
    { id: 'gestao-de-usuarios', label: 'Gestão de Usuários (RBAC)', icon: 'admin_panel_settings', highlight: true },
    { id: 'integracao-erp-api', label: 'Integração ERP & APIs', icon: 'hub', highlight: true },
    { id: 'logs-auditoria', label: 'Trilha de Auditoria & ICP', icon: 'gavel' },
    { id: 'relatorios-executivos', label: 'Relatórios em PDF', icon: 'assessment' },
    { id: 'configuracoes', label: 'Configurações da Conta', icon: 'settings' }
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-low z-40 flex flex-col justify-between overflow-y-auto border-r border-surface-container-high no-print">
      {/* Navigation List */}
      <div className="py-3">
        <div className="px-4 pb-2 mb-1 flex items-center justify-between">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
            Navegação de Campo & Gestão
          </span>
        </div>

        <nav className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left ${
                  isActive
                    ? 'bg-primary-container text-on-primary-fixed font-semibold border-l-4 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`material-symbols-outlined text-lg ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold leading-none shrink-0 ${item.badgeColor || 'bg-surface-container-high text-on-surface'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Canteiro Connection Card */}
      <div className="p-3.5 bg-surface-container m-3 shadow-sm border border-surface-container-high">
        <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
          <span className="font-semibold text-on-surface flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-error' : 'bg-tertiary'}`}></span>
            Conexão Canteiro
          </span>
          <span className={`text-[11px] font-bold uppercase ${isOffline ? 'text-error' : 'text-tertiary'}`}>
            {isOffline ? 'Offline' : 'Ativa'}
          </span>
        </div>
        <div className="w-full bg-surface-container-highest h-1.5 overflow-hidden">
          <div className={`h-full ${isOffline ? 'bg-error w-1/3' : 'bg-tertiary w-full'} transition-all duration-300`}></div>
        </div>
        <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed font-light">
          {isOffline
            ? `Operando via SQLite/IndexedDB. ${pendingOfflineCount} registros gravados localmente.`
            : 'Sincronismo automático a cada 5 min. Modo offline operacional.'
          }
        </p>
      </div>
    </aside>
  );
};
