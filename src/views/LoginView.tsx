import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../mock/data';

export const LoginView: React.FC = () => {
  const { login, showToast } = useApp();
  const [authMode, setAuthMode] = useState<'credentials' | 'sso'>('credentials');
  const [email, setEmail] = useState('ricardo.souza@construtora.com.br');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    showToast('Validando credenciais e token 2FA corporativo...', 'info');

    setTimeout(() => {
      const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || DEMO_USERS[0];
      login(user);
      setIsLoading(false);
      showToast(`Bem-vindo ao ObraSync, ${user.name}!`, 'success');
    }, 800);
  };

  const handleQuickLogin = (index: number) => {
    const user = DEMO_USERS[index] || DEMO_USERS[0];
    login(user);
    showToast(`Conectado como ${user.name} (${user.roleLabel}).`, 'success');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-surface font-body text-on-surface">
      {/* LEFT PANEL: Brand Showcase, Trust & Field Metrics */}
      <div className="relative w-full lg:w-7/12 bg-surface-container flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden border-r border-surface-container-high">
        {/* Background architectural overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-multiply pointer-events-none" 
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=1600&auto=format&fit=crop&q=80')` }}
        ></div>

        {/* Top Branding */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center text-on-primary font-bold text-lg shadow-sm">
              <span className="material-symbols-outlined text-2xl">apartment</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-headline font-bold text-2xl tracking-tight text-on-surface">
                  Obra<span className="text-primary font-light">Sync</span>
                </span>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider font-mono">
                  Enterprise v4.2
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-medium tracking-wide uppercase">
                Field &amp; Construction Operations Platform
              </p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="mt-12 lg:mt-16 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-surface px-3 py-1 text-xs text-primary font-semibold mb-4 shadow-sm border border-surface-container-high">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              Operação de Canteiro Conectada
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-on-surface leading-tight">
              Precisão executiva do projeto ao canteiro de obras.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-on-surface-variant font-normal leading-relaxed">
              Plataforma robusta para gestão de diários de obra (RDO), controle pericial de evidências fotográficas, rastreamento físico-financeiro em tempo real e conformidade integral com PBQP-H e SiAC Nível A.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface p-4 shadow-sm border border-surface-container-high">
              <div className="w-8 h-8 bg-surface-container flex items-center justify-center text-primary mb-3">
                <span className="material-symbols-outlined text-xl">analytics</span>
              </div>
              <h3 className="text-sm font-bold text-on-surface">RDO em Tempo Real</h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                Relatórios diários homologados com carimbo climático e assinaturas ICP-Brasil.
              </p>
            </div>

            <div className="bg-surface p-4 shadow-sm border border-surface-container-high">
              <div className="w-8 h-8 bg-surface-container flex items-center justify-center text-primary mb-3">
                <span className="material-symbols-outlined text-xl">add_a_photo</span>
              </div>
              <h3 className="text-sm font-bold text-on-surface">Auditoria com GPS</h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                Evidências visuais periciais, comparador Antes x Depois e bloqueio de concretagem.
              </p>
            </div>

            <div className="bg-surface p-4 shadow-sm border border-surface-container-high">
              <div className="w-8 h-8 bg-surface-container flex items-center justify-center text-primary mb-3">
                <span className="material-symbols-outlined text-xl">cloud_sync</span>
              </div>
              <h3 className="text-sm font-bold text-on-surface">Offline-First Nativo</h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                Continuidade total sem sinal no subsolo. Sincronização automática na reconexão.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Metrics & Testimonial */}
        <div className="relative z-10 mt-12 pt-6 border-t border-surface-container-high">
          <div className="grid grid-cols-3 gap-4 bg-surface p-4 shadow-sm mb-6 border border-surface-container-high">
            <div>
              <div className="text-2xl font-bold text-on-surface font-mono flex items-baseline gap-1">
                <span>+450</span>
                <span className="text-xs font-semibold text-tertiary">obras</span>
              </div>
              <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">Em execução ativa</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-on-surface font-mono">99.98%</div>
              <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">Disponibilidade SLA</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-on-surface font-mono">ISO 9001</div>
              <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">Nível SiAC / PBQP-H</p>
            </div>
          </div>

          <div className="bg-surface p-5 shadow-sm flex items-start gap-4 border border-surface-container-high">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
              alt="Roberto Vasconcellos"
              className="w-12 h-12 shrink-0 object-cover rounded-full border border-surface-container-high"
            />
            <div className="min-w-0">
              <p className="text-xs text-on-surface italic font-normal leading-relaxed">
                “A transição para o ObraSync eliminou mais de 14 horas semanais de retrabalho com planilhas de apontamento em nossos 18 canteiros. A rastreabilidade de conformidade tornou-se instantânea.”
              </p>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-on-surface block">Eng. Roberto C. Vasconcellos</span>
                  <span className="text-[11px] text-on-surface-variant">Diretor de Operações e Engenharia • Horizonte Brasil S/A</span>
                </div>
                <span className="material-symbols-outlined text-primary text-xl">verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Enterprise Login & Verification */}
      <div className="w-full lg:w-5/12 bg-surface flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        {/* Top Environment Notice */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="text-xs font-semibold text-on-surface-variant font-mono">Cluster Prod-SP01 (Online)</span>
          </div>
          <span className="text-xs text-on-surface-variant font-mono">Ambiente Corporativo Seguro</span>
        </div>

        {/* Main Login Form Container */}
        <div className="my-auto py-6 max-w-md w-full mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-on-surface">Acesso ao Sistema</h2>
            <p className="text-xs text-on-surface-variant mt-1">Informe suas credenciais corporativas autorizadas.</p>
          </div>

          {/* Unit selector */}
          <div className="bg-surface-container p-3 border border-surface-container-high">
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Unidade Organizacional / Empresa
            </label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-primary text-lg">domain</span>
                <span className="text-xs font-bold text-on-surface truncate">Construtora Horizonte Brasil S/A</span>
              </div>
              <span className="text-[10px] font-bold bg-surface text-on-surface-variant px-1.5 py-0.5 uppercase tracking-wide border border-surface-container-high">
                Matriz SP
              </span>
            </div>
          </div>

          {/* Auth Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 bg-surface-container p-1 border border-surface-container-high">
            <button
              type="button"
              onClick={() => setAuthMode('credentials')}
              className={`text-xs font-semibold py-2 px-3 text-center transition-colors ${authMode === 'credentials' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Credenciais Diretas
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('sso')}
              className={`text-xs font-semibold py-2 px-3 text-center transition-colors ${authMode === 'sso' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              SSO Corporativo
            </button>
          </div>

          {/* Standard Credentials Form */}
          {authMode === 'credentials' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                  E-mail Corporativo
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    alternate_email
                  </span>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-11 bg-surface-container pl-10 pr-3 text-xs text-on-surface font-mono border border-surface-container-high focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider">
                    Senha de Acesso
                  </label>
                  <button 
                    type="button"
                    onClick={() => showToast('Link de recuperação enviado para o e-mail corporativo cadastrado.', 'info')}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    lock
                  </span>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-11 bg-surface-container pl-10 pr-10 text-xs text-on-surface font-mono border border-surface-container-high focus:outline-none focus:border-primary"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant p-1"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
                  <span className="text-xs text-on-surface-variant font-medium">Lembrar neste dispositivo de canteiro</span>
                </label>
                <div className="text-[11px] text-tertiary flex items-center gap-1 font-semibold font-mono">
                  <span className="material-symbols-outlined text-sm">security</span> 2FA Ativo
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>{isLoading ? 'Autenticando...' : 'Entrar na Plataforma'}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <button 
                type="button"
                onClick={() => handleQuickLogin(0)}
                className="w-full h-11 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold px-4 flex items-center justify-between transition-colors border border-surface-container-high shadow-sm"
              >
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">corporate_fare</span>
                  <span>Microsoft Azure Entra ID</span>
                </span>
                <span className="text-[10px] text-on-surface-variant uppercase font-mono">SSO Conectado</span>
              </button>

              <button 
                type="button"
                onClick={() => handleQuickLogin(0)}
                className="w-full h-11 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold px-4 flex items-center justify-between transition-colors border border-surface-container-high shadow-sm"
              >
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary text-xl">hub</span>
                  <span>Google Workspace Enterprise</span>
                </span>
                <span className="text-[10px] text-on-surface-variant uppercase font-mono">OAuth 2.0</span>
              </button>

              <button 
                type="button"
                onClick={() => handleQuickLogin(0)}
                className="w-full h-11 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold px-4 flex items-center justify-between transition-colors border border-surface-container-high shadow-sm"
              >
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl">integration_instructions</span>
                  <span>Procore Connect Bridge</span>
                </span>
                <span className="text-[10px] text-on-surface-variant uppercase font-mono">Sync Ativo</span>
              </button>
            </div>
          )}

          {/* Quick Demo Login Switcher */}
          <div className="bg-surface-container-low p-3.5 border border-surface-container-high space-y-2">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Acesso Rápido para Avaliação (Demo):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin(0)}
                className="p-2 bg-surface hover:bg-surface-container border border-surface-container-high text-left transition-colors"
              >
                <strong className="text-on-surface block text-[11px]">Eng. Ricardo Souza</strong>
                <span className="text-[10px] text-primary">Engenheiro RT</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin(1)}
                className="p-2 bg-surface hover:bg-surface-container border border-surface-container-high text-left transition-colors"
              >
                <strong className="text-on-surface block text-[11px]">Dra. Camila Nogueira</strong>
                <span className="text-[10px] text-tertiary">Fiscal &amp; Auditora</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin(2)}
                className="p-2 bg-surface hover:bg-surface-container border border-surface-container-high text-left transition-colors"
              >
                <strong className="text-on-surface block text-[11px]">Mestre Valdir</strong>
                <span className="text-[10px] text-secondary">Mestre de Obras</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin(3)}
                className="p-2 bg-surface hover:bg-surface-container border border-surface-container-high text-left transition-colors"
              >
                <strong className="text-on-surface block text-[11px]">Roberto Vasconcellos</strong>
                <span className="text-[10px] text-error">Administrador / Diretor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Support Info */}
        <div className="pt-4 border-t border-surface-container-high text-[11px] text-on-surface-variant flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-tertiary">lock</span>
            <span>Criptografia AES-256 Ponta a Ponta</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Suporte: 0800 720 6272</span>
            <span>•</span>
            <span className="font-mono">© 2025 ObraSync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
