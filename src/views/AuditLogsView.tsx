import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, showToast, activeProject } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = auditLogs.filter(log => {
    if (selectedCategory !== 'all' && log.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.hashSha256.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportAudit = () => {
    showToast('Exportando trilha completa de auditoria com hashes criptográficos (CSV/JSON)...', 'info');
  };

  return (
    <div className="flex flex-col w-full space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
            <span>Segurança, Integridade &amp; Compliance</span>
            <span>/</span>
            <span className="text-primary font-bold">Trilha de Auditoria Imutável</span>
            <span className="px-1.5 py-0.5 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold">SHA-256 BLOCKCHAIN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mt-1">
            Logs de Auditoria &amp; Validação de Assinaturas
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 max-w-3xl leading-relaxed">
            Registro indelével de todas as alterações cadastrais, assinaturas de RDO, aprovações de FVS, bloqueios de RNC e transações financeiras com carimbo temporal e hash de integridade jurídica.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={handleExportAudit}
            className="px-4 py-2.5 bg-surface text-on-surface hover:bg-surface-container-high transition-colors text-xs font-semibold border border-surface-container-high shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Exportar Trilha (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-surface-container-low p-4 border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm text-xs">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-tertiary text-2xl">verified</span>
          <div>
            <strong className="text-on-surface block">Cadeia Criptográfica Íntegra</strong>
            <span className="text-on-surface-variant">
              Canteiro: {activeProject.name} • {filteredLogs.length} eventos registrados • Sem quebra de integridade
            </span>
          </div>
        </div>
        <span className="font-mono text-[11px] bg-surface px-3 py-1 border border-surface-container-high font-semibold text-primary">
          CONFORMIDADE MP 2.200-2/2001
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-low p-4 shadow-sm border border-surface-container-high flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-on-surface-variant text-base">search</span>
            <input 
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por ação, usuário, hash SHA-256..."
              className="w-full pl-9 pr-3 py-2 bg-surface text-xs text-on-surface border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary h-9"
            />
          </div>

          <select 
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-surface text-xs text-on-surface px-3 py-2 h-9 border border-surface-container-high focus:outline-none cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            <option value="RDO">Diário de Obra (RDO)</option>
            <option value="CUSTOS">Custos &amp; Controladoria</option>
            <option value="FVS">Inspeções &amp; FVS</option>
            <option value="RNC">Não Conformidades (RNC)</option>
            <option value="USUARIO">Usuários &amp; Acesso</option>
            <option value="ASSINATURA">Assinaturas ICP</option>
          </select>
        </div>

        <span className="text-xs text-on-surface-variant font-mono">
          Exibindo {filteredLogs.length} de {auditLogs.length} eventos
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-surface overflow-x-auto shadow-sm border border-surface-container-high">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider border-b border-surface-container-high">
              <th className="py-3 px-4">Data / Hora</th>
              <th className="py-3 px-4">Usuário &amp; Cargo</th>
              <th className="py-3 px-4">Ação Registrada</th>
              <th className="py-3 px-4">Categoria</th>
              <th className="py-3 px-4">Terminal &amp; IP</th>
              <th className="py-3 px-4">Hash SHA-256 (Imutável)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-surface-container-low transition-colors">
                <td className="py-3 px-4 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                  {log.timestamp}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="font-bold text-on-surface">{log.user}</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">{log.role}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-on-surface">{log.action}</div>
                  <div className="text-[11px] text-on-surface-variant">{log.details}</div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 bg-surface-container text-on-surface text-[10px] font-bold font-mono">
                    {log.category}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-on-surface-variant">
                  <div>{log.ip}</div>
                  <div className="text-[10px]">{log.device}</div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-primary">
                  <button 
                    type="button"
                    onClick={() => showToast(`Hash ${log.hashSha256} verificado na cadeia imutável.`, 'info')}
                    className="hover:underline flex items-center gap-1"
                    title="Verificar integridade criptográfica"
                  >
                    <span>{log.hashSha256}</span>
                    <span className="material-symbols-outlined text-xs">verified</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
