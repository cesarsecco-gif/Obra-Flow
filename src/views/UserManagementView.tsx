import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../mock/data';
import { UserProfile, UserRole } from '../types';

export const UserManagementView: React.FC = () => {
  const { 
    showToast, 
    addAuditLog, 
    currentUser, 
    login, 
    projects 
  } = useApp();

  const [users, setUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Invite modal fields
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('engenheiro_residente');
  const [inviteCrea, setInviteCrea] = useState('');
  const [inviteCompany, setInviteCompany] = useState('Construtora Horizonte');

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.roleLabel.toLowerCase().includes(q) ||
        (u.crea && u.crea.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleToggleStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        showToast(`Status do usuário ${u.name} alterado para ${nextStatus}.`, 'info');
        addAuditLog(`Alteração de status de usuário`, 'USUARIO', `${u.name} agora está ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      roleLabel: inviteRole === 'admin' ? 'Administrador do Sistema' : inviteRole === 'engenheiro_residente' ? 'Engenheiro Residente (RT)' : inviteRole === 'fiscal_auditor' ? 'Fiscal de Obra & Auditor' : 'Mestre de Obras Geral',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      crea: inviteCrea || undefined,
      phone: '+55 (11) 99999-0000',
      company: inviteCompany,
      unit: 'Regional SP',
      twoFactorEnabled: true,
      tokenIcp: 'ICP-A3-PROVISÓRIO',
      icpExpiry: '10/2026',
      activeProjects: [projects[0].id],
      status: 'active',
      lastAccess: 'Nunca acessou'
    };

    setUsers(prev => [newUser, ...prev]);
    showToast(`Convite corporativo enviado para ${inviteEmail} com credencial e 2FA provisionados.`, 'success');
    addAuditLog('Novo usuário provisionado', 'USUARIO', `Convite enviado para ${inviteEmail} como ${newUser.roleLabel}`);
    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInviteCrea('');
  };

  const handleImpersonate = (user: UserProfile) => {
    login(user);
    showToast(`Sessão alternada para ${user.name} (${user.roleLabel}).`, 'info');
  };

  return (
    <div className="flex flex-col w-full space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
            <span>Governança &amp; Segurança</span>
            <span>/</span>
            <span className="text-primary font-bold">Gestão de Usuários &amp; RBAC</span>
            <span className="px-1.5 py-0.5 bg-primary-container text-on-primary-fixed text-[10px] font-bold">NÍVEIS GRANULARES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mt-1">
            Administração de Acessos &amp; Alçadas de Canteiro
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 max-w-3xl leading-relaxed">
            Controle de usuários, perfis de permissão (Administrador, Engenheiro RT, Fiscal Auditor, Mestre de Obras), habilitação de certificados digitais ICP-Brasil e concessão por canteiro específico.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={() => showToast('Exportando matriz de responsabilidade e alçadas (RACI)...', 'info')}
            className="px-3.5 py-2.5 bg-surface text-on-surface hover:bg-surface-container-high transition-colors text-xs font-semibold border border-surface-container-high shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Exportar Matriz RBAC</span>
          </button>

          <button 
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            <span>+ Convidar Novo Usuário</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface-container-low p-4 shadow-sm border border-surface-container-high flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Usuários Cadastrados</span>
          <div className="text-2xl font-bold text-on-surface font-mono my-1">{users.length}</div>
          <span className="text-[11px] text-tertiary font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">verified</span> 100% com 2FA ativo
          </span>
        </div>

        <div className="bg-surface-container-low p-4 shadow-sm border border-surface-container-high flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Engenheiros RT Habilitados</span>
          <div className="text-2xl font-bold text-primary font-mono my-1">
            {users.filter(u => u.role === 'engenheiro_residente').length}
          </div>
          <span className="text-[11px] text-on-surface-variant">Com visto e ART no CREA-SP</span>
        </div>

        <div className="bg-surface-container-low p-4 shadow-sm border border-surface-container-high flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Fiscais &amp; Auditores Externos</span>
          <div className="text-2xl font-bold text-on-surface font-mono my-1">
            {users.filter(u => u.role === 'fiscal_auditor').length}
          </div>
          <span className="text-[11px] text-on-surface-variant">Alçada para aprovação e RNC</span>
        </div>

        <div className="bg-surface-container-low p-4 shadow-sm border border-surface-container-high flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Tokens ICP-Brasil Válidos</span>
          <div className="text-2xl font-bold text-tertiary font-mono my-1">
            {users.filter(u => u.tokenIcp).length}
          </div>
          <span className="text-[11px] text-tertiary font-semibold">Certificados em Nuvem SERPRO</span>
        </div>
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
              placeholder="Buscar por nome, e-mail, CREA..."
              className="w-full pl-9 pr-3 py-2 bg-surface text-xs text-on-surface border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary h-9"
            />
          </div>

          <select 
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="bg-surface text-xs text-on-surface px-3 py-2 h-9 border border-surface-container-high focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Níveis de Acesso</option>
            <option value="admin">Administrador do Sistema</option>
            <option value="engenheiro_residente">Engenheiro Residente (RT)</option>
            <option value="fiscal_auditor">Fiscal de Obra &amp; Auditor</option>
            <option value="mestre_obras">Mestre de Obras</option>
          </select>
        </div>

        <span className="text-xs text-on-surface-variant font-mono">
          Exibindo {filteredUsers.length} de {users.length} profissionais
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-surface overflow-x-auto shadow-sm border border-surface-container-high">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider border-b border-surface-container-high">
              <th className="py-3 px-4">Profissional &amp; Cargo</th>
              <th className="py-3 px-4">Nível de Acesso (RBAC)</th>
              <th className="py-3 px-4">Registro / CREA</th>
              <th className="py-3 px-4">Empresa / Unidade</th>
              <th className="py-3 px-4">Certificação ICP</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high">
            {filteredUsers.map(user => {
              const isCurrent = currentUser?.id === user.id;

              const roleBadge = {
                admin: 'bg-error-container text-on-error-container font-bold',
                engenheiro_residente: 'bg-primary-container text-on-primary-fixed font-bold',
                fiscal_auditor: 'bg-tertiary-container text-on-tertiary-container font-semibold',
                mestre_obras: 'bg-surface-container text-on-surface font-semibold',
                auditor_externo: 'bg-secondary-container text-on-secondary-container',
              }[user.role];

              return (
                <tr key={user.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-9 h-9 rounded-full object-cover border border-surface-container-high shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-on-surface truncate flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-primary text-on-primary font-mono uppercase">
                              Você
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-on-surface-variant font-mono truncate block">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider ${roleBadge}`}>
                      {user.roleLabel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                    {user.crea ? (
                      <span className="font-semibold text-primary">{user.crea}</span>
                    ) : (
                      <span className="text-on-surface-variant italic">Não aplicável</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-semibold text-on-surface block">{user.company}</span>
                    <span className="text-[10px] text-on-surface-variant">{user.unit}</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-[11px] text-tertiary font-semibold font-mono">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      <span>{user.tokenIcp}</span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-mono block">Val: {user.icpExpiry}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${user.status === 'active' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-error-container text-on-error-container'}`}>
                      {user.status === 'active' ? 'Ativo' : 'Suspenso'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {!isCurrent && (
                        <button 
                          type="button"
                          onClick={() => handleImpersonate(user)}
                          className="px-2.5 py-1 bg-surface text-on-surface hover:bg-surface-container-high transition-colors text-xs font-semibold border border-surface-container-high"
                          title="Alternar para este perfil (Demo)"
                        >
                          Simular
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={() => handleToggleStatus(user.id)}
                        className={`p-1.5 transition-colors ${user.status === 'active' ? 'text-error hover:bg-error-container' : 'text-tertiary hover:bg-tertiary-container'}`}
                        title={user.status === 'active' ? 'Suspender Acesso' : 'Reativar Acesso'}
                      >
                        <span className="material-symbols-outlined text-base">
                          {user.status === 'active' ? 'block' : 'check_circle'}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface max-w-lg w-full p-6 shadow-2xl border border-surface-container-high">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <h3 className="text-base font-bold text-on-surface">Convidar Novo Usuário &amp; Alçada RBAC</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-on-surface mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  required
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder="Ex: Dra. Juliana Menezes"
                  className="w-full p-2.5 bg-surface-container text-on-surface border border-surface-container-high focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">E-mail Corporativo *</label>
                <input 
                  type="email" 
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="juliana.menezes@construtora.com.br"
                  className="w-full p-2.5 bg-surface-container text-on-surface border border-surface-container-high focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Perfil de Permissão</label>
                  <select 
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as UserRole)}
                    className="w-full p-2 bg-surface-container text-on-surface border border-surface-container-high"
                  >
                    <option value="engenheiro_residente">Engenheiro Residente (RT)</option>
                    <option value="fiscal_auditor">Fiscal de Obra / Auditor</option>
                    <option value="mestre_obras">Mestre de Obras</option>
                    <option value="admin">Administrador do Sistema</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">CREA / CAU (se aplicável)</label>
                  <input 
                    type="text"
                    value={inviteCrea}
                    onChange={e => setInviteCrea(e.target.value)}
                    placeholder="Ex: CREA-SP 506.124"
                    className="w-full p-2 bg-surface-container text-on-surface border border-surface-container-high font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Empresa / Empreiteira</label>
                <input 
                  type="text"
                  value={inviteCompany}
                  onChange={e => setInviteCompany(e.target.value)}
                  className="w-full p-2 bg-surface-container text-on-surface border border-surface-container-high"
                />
              </div>

              <div className="p-3 bg-surface-container text-[11px] text-on-surface-variant space-y-1 border border-surface-container-high">
                <span className="font-semibold text-primary block">Segurança de Acesso Corporativo:</span>
                <p>O usuário receberá convite com chave provisória e ativação de 2FA obrigatória no primeiro login.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high">
                <button 
                  type="button" 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary font-bold hover:bg-primary/90"
                >
                  Enviar Convite e Provisionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
