import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProjectSelectorDrawer } from './components/ProjectSelectorDrawer';
import { PdfExportModal } from './components/PdfExportModal';
import { Toast } from './components/Toast';
import { FieldQuickCaptureModal } from './components/FieldQuickCaptureModal';
import { AiEngineeringAssistant } from './components/AiEngineeringAssistant';

// Views
import { DashboardView } from './views/DashboardView';
import { RdoView } from './views/RdoView';
import { PluviometriaView } from './views/PluviometriaView';
import { CostIndicatorsView } from './views/CostIndicatorsView';
import { EvidenceView } from './views/EvidenceView';
import { FvsView } from './views/FvsView';
import { RncView } from './views/RncView';
import { GanttView } from './views/GanttView';
import { StaffView } from './views/StaffView';
import { CommunicationView } from './views/CommunicationView';
import { UserManagementView } from './views/UserManagementView';
import { ErpIntegrationView } from './views/ErpIntegrationView';
import { AuditLogsView } from './views/AuditLogsView';
import { SettingsView } from './views/SettingsView';
import { LoginView } from './views/LoginView';

const MainLayout: React.FC = () => {
  const { currentUser, activeTab, activeProject } = useApp();

  if (!currentUser) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard-gerencial':
        return <DashboardView />;
      case 'diario-de-obra-rdo':
        return <RdoView />;
      case 'pluviometria':
        return <PluviometriaView />;
      case 'painel-de-custos':
        return <CostIndicatorsView />;
      case 'relatorio-fotografico':
        return <EvidenceView />;
      case 'auditorias-inspecoes-fvs':
        return <FvsView />;
      case 'nao-conformidades-rnc':
        return <RncView />;
      case 'cronograma-gantt':
        return <GanttView />;
      case 'efetivo-e-equipamentos':
        return <StaffView />;
      case 'comunicacao-de-campo':
        return <CommunicationView />;
      case 'gestao-de-usuarios':
        return <UserManagementView />;
      case 'integracao-erp-api':
        return <ErpIntegrationView />;
      case 'logs-auditoria':
        return <AuditLogsView />;
      case 'relatorios-executivos':
        return <CostIndicatorsView />;
      case 'configuracoes':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface antialiased flex flex-col">
      {/* Top Header */}
      <Header />

      {/* Main Body */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Viewport */}
        <div className="flex-1 lg:pl-64 flex flex-col min-h-[calc(100vh-4rem)]">
          <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 max-w-[1680px] mx-auto">
            {renderActiveView()}
          </main>

          {/* Footer in Carbon style */}
          <footer className="h-12 w-full bg-surface-container-low px-6 lg:px-8 flex items-center justify-between text-xs text-on-surface-variant border-t border-surface-container-high">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-on-surface">ObraSync Enterprise v2.4.0</span>
              <span className="hidden sm:inline text-secondary">•</span>
              <span className="hidden sm:inline flex items-center gap-1 text-tertiary font-medium">
                <span className="material-symbols-outlined text-sm">verified</span>
                Integridade de Dados &amp; Assinaturas Auditadas
              </span>
            </div>
            <div className="flex items-center gap-4 text-on-surface-variant">
              <span className="hidden md:inline font-mono">Cluster: Prod-SP01 (AES-256)</span>
              <span className="font-medium text-on-surface">{activeProject.name}</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Slide-over Project Selector Drawer */}
      <ProjectSelectorDrawer />

      {/* Customizable PDF Export Modal */}
      <PdfExportModal />

      {/* Field Quick Capture Modal */}
      <FieldQuickCaptureModal />

      {/* AI Civil Engineering Assistant Drawer */}
      <AiEngineeringAssistant />

      {/* Global Interactive Toast Notification */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
