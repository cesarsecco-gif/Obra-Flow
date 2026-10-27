import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const StaffView: React.FC = () => {
  const { 
    workers, 
    addWorker, 
    reallocateWorkers, 
    showToast,
    addAuditLog 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reallocation panel state
  const [reallocateFrom, setReallocateFrom] = useState('Torre B — 8º Pav. Alvenaria');
  const [reallocateTo, setReallocateTo] = useState('Torre A — 14º Pav. Laje (Concretagem)');
  const [reallocateCount, setReallocateCount] = useState(6);
  const [reallocateReason, setReallocateReason] = useState('Aceleração de Concretagem');

  // New worker modal state
  const [newName, setNewName] = useState('');
  const [newMatricula, setNewMatricula] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('Construtora Horizonte (CLT)');
  const [newFront, setNewFront] = useState('Torre A — 14º Pav. Laje');

  const filteredWorkers = workers.filter(w => {
    if (selectedContract !== 'all' && w.contractType !== selectedContract) return false;
    if (selectedCompany !== 'all' && !w.company.toLowerCase().includes(selectedCompany.toLowerCase())) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        w.name.toLowerCase().includes(q) ||
        w.role.toLowerCase().includes(q) ||
        w.matricula.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredWorkers.map(w => w.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleWorker = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleReallocate = () => {
    reallocateWorkers(reallocateFrom, reallocateTo, reallocateCount, reallocateReason);
    addAuditLog(
      `Remanejamento de ${reallocateCount} operários`,
      'RDO',
      `De ${reallocateFrom} para ${reallocateTo} por motivo: ${reallocateReason}`
    );
  };

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = newName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    addWorker({
      name: newName,
      role: newRole,
      contractType: newCompany.includes('CLT') ? 'clt' : 'sub',
      company: newCompany,
      status: 'presente',
      entryTime: '07:00',
      front: newFront,
      workHours: 8.8,
      extraHours: 0,
      sstCompliance: ['ASO OK', 'NR-18'],
      catracaPoint: 'Catraca Facial #01 (Manual)',
      matricula: newMatricula || `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
      avatarInitials: initials || 'TR'
    });

    setIsModalOpen(false);
    setNewName('');
    setNewRole('');
    setNewMatricula('');
  };

  return (
    <div className="flex flex-col w-full space-y-6 font-body">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
          <span>CANTEIRO &amp; OPERAÇÃO</span>
          <span className="text-surface-container-highest">/</span>
          <span className="text-on-surface uppercase tracking-wider font-semibold">CONTROLE DE EFETIVO &amp; MÃO DE OBRA</span>
          <span className="px-2 py-0.5 bg-primary-container text-on-primary-fixed text-[11px] font-semibold">NR-18 AUDITADO</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-surface-container text-xs text-on-surface-variant border border-surface-container-high">
          <span className="material-symbols-outlined text-sm text-tertiary">fingerprint</span>
          <span className="font-semibold text-on-surface">Catraca Facial #01 &amp; #02 Ativas</span>
          <span className="text-surface-container-highest">•</span>
          <span className="text-[11px] font-mono">Sync: há 3 min</span>
        </div>
      </div>

      {/* Header & Primary Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface">
            Gestão &amp; Apontamento de Efetivo de Campo
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
            Controle biométrico facial, consolidação homem-hora (HH), alocação dinâmica por frente de serviço e conformidade trabalhista (NR-18 / eSocial).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            type="button"
            onClick={() => showToast('Importando dados da catraca biométrica (Arquivo AFD/CSV)...', 'info')}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-surface hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors border border-surface-container-high shadow-sm"
          >
            <span className="material-symbols-outlined text-base text-primary">upload_file</span>
            <span>Importar Catraca (AFD)</span>
          </button>

          <button 
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            <span>+ Novo Apontamento Manual</span>
          </button>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1 font-medium">
            <span className="uppercase tracking-wider text-[11px]">Total Presentes Hoje</span>
            <span className="inline-flex items-center px-1.5 py-0.5 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold">
              98.0% META
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-on-surface tracking-tight font-mono">148</span>
            <span className="text-xs text-on-surface-variant">de 151 previstos</span>
          </div>
          <div className="mt-3 w-full bg-surface-container-high h-1.5 overflow-hidden">
            <div className="bg-tertiary h-full" style={{ width: '98%' }}></div>
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-on-surface-variant">
            <span>Catraca facial: 142</span>
            <span className="text-tertiary font-semibold">Manual: 6</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1 font-medium">
            <span className="uppercase tracking-wider text-[11px]">Vínculo Contratual</span>
            <span className="material-symbols-outlined text-sm text-primary">groups</span>
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <div>
              <span className="text-2xl font-bold text-on-surface font-mono">42</span>
              <span className="text-[11px] text-on-surface-variant block font-medium">Próprios (28%)</span>
            </div>
            <div className="h-6 w-px bg-surface-container-high"></div>
            <div>
              <span className="text-2xl font-bold text-on-surface font-mono">106</span>
              <span className="text-[11px] text-on-surface-variant block font-medium">Terceiros (72%)</span>
            </div>
          </div>
          <div className="mt-3 flex gap-1 h-1.5">
            <div className="bg-primary h-full" style={{ width: '28%' }}></div>
            <div className="bg-surface-container-highest h-full" style={{ width: '72%' }}></div>
          </div>
          <span className="text-[11px] text-on-surface-variant mt-2">4 subempreiteiras ativas</span>
        </div>

        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1 font-medium">
            <span className="uppercase tracking-wider text-[11px]">Faltas &amp; Afastamentos</span>
            <span className="px-1.5 py-0.5 bg-error-container text-on-error-container text-[10px] font-bold">3 AUSÊNCIAS</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-error tracking-tight font-mono">03</span>
            <span className="text-xs text-on-surface-variant">impacto de 2.0%</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>2 Atestados</span>
            <span className="text-error font-semibold">1 Injustificada</span>
          </div>
          <span className="text-[10px] text-on-surface-variant mt-2">Substitutos alocados</span>
        </div>

        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1 font-medium">
            <span className="uppercase tracking-wider text-[11px]">Consolidado HH do Dia</span>
            <span className="material-symbols-outlined text-sm text-primary">schedule</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-on-surface tracking-tight font-mono">1.184</span>
            <span className="text-xs text-on-surface-variant">Hh normais</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-on-surface-variant">Média: 8.0h / operário</span>
            <span className="text-primary font-bold">+18.0 Hh Extras</span>
          </div>
          <span className="text-[10px] text-on-surface-variant mt-2">Autorizadas: Concretagem T.A</span>
        </div>

        <div className="bg-surface-container-low p-4 flex flex-col justify-between shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1 font-medium">
            <span className="uppercase tracking-wider text-[11px]">Conformidade SST / eSocial</span>
            <span className="material-symbols-outlined text-sm text-tertiary">verified_user</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-on-surface tracking-tight font-mono">99.3%</span>
            <span className="text-xs text-tertiary font-bold">Aprovado</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-on-surface-variant">ASO &amp; EPI 100%</span>
            <span className="text-error font-medium">1 Pendência</span>
          </div>
          <span className="text-[10px] text-error flex items-center gap-1 font-medium mt-2">
            <span className="material-symbols-outlined text-[12px]">warning</span>
            Reciclagem NR-35 (Torre B)
          </span>
        </div>
      </div>

      {/* Filter and Bulk Action Bar */}
      <div className="bg-surface-container-low p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border border-surface-container-high">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-on-surface-variant text-base">search</span>
            <input 
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, matrícula ou função..."
              className="w-full pl-9 pr-3 py-2 bg-surface text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary h-9 border border-surface-container-high"
            />
          </div>

          <select 
            value={selectedContract}
            onChange={e => setSelectedContract(e.target.value)}
            className="bg-surface text-xs text-on-surface px-3 py-2 h-9 border border-surface-container-high focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Vínculos</option>
            <option value="clt">Próprio (CLT Construtora)</option>
            <option value="sub">Terceirizado (Subempreiteiras)</option>
          </select>

          <select 
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
            className="bg-surface text-xs text-on-surface px-3 py-2 h-9 border border-surface-container-high focus:outline-none cursor-pointer"
          >
            <option value="all">Todas as Empresas</option>
            <option value="Horizonte">Construtora Horizonte (42)</option>
            <option value="Aço & Forma">Aço &amp; Forma Ltda. (38)</option>
            <option value="HidroVolt">HidroVolt Instalações (28)</option>
            <option value="Arte & Bloco">Arte &amp; Bloco Alvenaria (40)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto text-xs">
          <span>Exibindo <strong>{filteredWorkers.length}</strong> operários apontados</span>
        </div>
      </div>

      {/* Bulk Action Notification Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-on-surface text-surface px-4 py-2.5 flex items-center justify-between text-xs animate-fadeIn shadow-md">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-base text-primary-fixed">checklist</span>
            <span><strong>{selectedIds.length}</strong> trabalhadores selecionados</span>
            <span className="text-on-surface-variant">|</span>
            <span>Ações em lote para o contingente:</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => showToast(`${selectedIds.length} operários com hora extra (+2.0h) autorizada.`, 'success')}
              className="px-2.5 py-1 bg-primary text-on-primary text-xs font-semibold"
            >
              Autorizar Hora Extra (+2.0h)
            </button>
            <button 
              type="button" 
              onClick={() => showToast('DDS registrado para operários selecionados.', 'info')}
              className="px-2.5 py-1 bg-surface/20 text-surface text-xs font-medium hover:bg-surface/30"
            >
              Registrar DDS Realizado
            </button>
            <button 
              type="button" 
              onClick={() => setSelectedIds([])}
              className="text-surface hover:text-error text-xs ml-2 font-medium"
            >
              Limpar Seleção
            </button>
          </div>
        </div>
      )}

      {/* Workers Table */}
      <div className="bg-surface overflow-x-auto shadow-sm border border-surface-container-high">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider border-b border-surface-container-high">
              <th className="py-3 px-4 w-10 text-center">
                <input 
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedIds.length === filteredWorkers.length && filteredWorkers.length > 0}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
              </th>
              <th className="py-3 px-4 min-w-[220px]">Trabalhador &amp; Função</th>
              <th className="py-3 px-4 min-w-[150px]">Empresa / Contrato</th>
              <th className="py-3 px-4 min-w-[170px]">Status Presença &amp; Registro</th>
              <th className="py-3 px-4 min-w-[200px]">Alocação / Frente de Obra</th>
              <th className="py-3 px-4 min-w-[150px]">Jornada &amp; HH Hoje</th>
              <th className="py-3 px-4 min-w-[160px]">Conformidade SST</th>
              <th className="py-3 px-4 w-12 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high">
            {filteredWorkers.map(w => {
              const isAbsent = w.status.startsWith('falta');
              const isChecked = selectedIds.includes(w.id);

              return (
                <tr key={w.id} className={`hover:bg-surface-container-low transition-colors ${isAbsent ? 'bg-error-container/20' : ''}`}>
                  <td className="py-3 px-4 text-center">
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleWorker(w.id)}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-xs shrink-0">
                        {w.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-on-surface truncate flex items-center gap-1.5">
                          <span>{w.name}</span>
                          <span className="material-symbols-outlined text-[14px] text-tertiary">verified</span>
                        </div>
                        <div className="text-[11px] text-on-surface-variant font-mono">
                          Mat: {w.matricula} • {w.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold ${w.contractType === 'clt' ? 'bg-primary-container text-on-primary-fixed' : 'bg-surface-container text-on-surface'}`}>
                      {w.company}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${w.status === 'presente' ? 'bg-tertiary' : 'bg-error'}`}></span>
                      <span className="font-semibold text-on-surface">
                        {w.status === 'presente' ? `Presente (${w.entryTime})` : 'Falta Registrada'}
                      </span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-mono block mt-0.5">
                      {w.catracaPoint}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-on-surface">
                    {w.front}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono font-semibold text-on-surface">{w.workHours}h normais</div>
                    {w.extraHours > 0 && (
                      <div className="text-[11px] text-primary font-bold font-mono">+{w.extraHours}h extras aut.</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {w.sstCompliance.map(sst => (
                        <span key={sst} className="px-1.5 py-0.2 bg-tertiary-container text-on-tertiary-container text-[10px] font-semibold">
                          {sst}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      type="button"
                      onClick={() => showToast(`Espelho de ponto e crachá de ${w.name} verificado.`, 'info')}
                      className="p-1 hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
                      title="Opções do Operário"
                    >
                      <span className="material-symbols-outlined text-base">more_vert</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Operational Bottom Panels: Fast Reallocation & Validation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Panel 1: Fast Contingency Dispatcher */}
        <div className="bg-surface-container-low p-5 lg:col-span-2 flex flex-col justify-between shadow-sm border border-surface-container-high space-y-4">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">sync_alt</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    Remanejamento Rápido de Contingente
                  </h3>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Ajuste dinâmico de operários entre frentes por motivo de chuva iminente, liberação de fôrma ou prioridade de concretagem.
                </p>
              </div>
              <span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container text-[11px] font-semibold font-mono">
                AGILIDADE DE CAMPO
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
              <div className="bg-surface p-3 border border-surface-container-high">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold block mb-1">1. Frente de Origem</span>
                <select 
                  value={reallocateFrom}
                  onChange={e => setReallocateFrom(e.target.value)}
                  className="w-full text-xs text-on-surface bg-surface-container p-2 focus:outline-none"
                >
                  <option>Torre B — 8º Pav. Alvenaria</option>
                  <option>Central de Betoneiras / Pátio</option>
                  <option>Instalações Hidráulicas</option>
                </select>
                <div className="mt-2 text-[11px] text-on-surface-variant font-light">Disponibilidade: 6 pedreiros</div>
              </div>

              <div className="bg-surface p-3 border border-surface-container-high">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold block mb-1">2. Frente de Destino</span>
                <select 
                  value={reallocateTo}
                  onChange={e => setReallocateTo(e.target.value)}
                  className="w-full text-xs text-on-surface bg-surface-container p-2 focus:outline-none"
                >
                  <option>Torre A — 14º Pav. Laje (Concretagem)</option>
                  <option>Contenção Subsolo 2</option>
                  <option>Descarga Caminhão de Aço</option>
                </select>
                <div className="mt-2 text-[11px] text-primary font-semibold">Prioridade Alta: Concreto às 14:00</div>
              </div>

              <div className="bg-surface p-3 border border-surface-container-high">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold block mb-1">3. Contingente &amp; Motivo</span>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    min={1} 
                    max={20}
                    value={reallocateCount}
                    onChange={e => setReallocateCount(Number(e.target.value))}
                    className="w-14 text-xs text-on-surface bg-surface-container p-2 text-center font-bold font-mono focus:outline-none"
                  />
                  <select 
                    value={reallocateReason}
                    onChange={e => setReallocateReason(e.target.value)}
                    className="flex-1 text-xs text-on-surface bg-surface-container p-2 focus:outline-none"
                  >
                    <option>Aceleração de Concretagem</option>
                    <option>Chuva / Remanejamento Interno</option>
                    <option>Gargalo Estrutural</option>
                  </select>
                </div>
                <div className="mt-2 text-[11px] text-tertiary font-semibold">Impacto no HH automático no RDO</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between pt-3 border-t border-surface-container-high bg-surface px-3 py-2 gap-2">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-base text-tertiary">check_circle</span>
              <span>Notifica mestres via tablet em campo e atualiza o RDO do dia.</span>
            </div>
            <button 
              type="button"
              onClick={handleReallocate}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition-colors shadow-sm"
            >
              Confirmar e Aplicar Remanejamento
            </button>
          </div>
        </div>

        {/* Panel 2: Legal Sign-off */}
        <div className="bg-surface-container-low p-5 shadow-sm border border-surface-container-high flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">draw</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">Validação do RT &amp; SESMT</h3>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Fechamento formal do efetivo diário com certificação digital e guarda probatória de folha de ponto eSocial.
            </p>

            <div className="bg-surface p-3 mt-4 space-y-2 text-xs border border-surface-container-high">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Responsável Técnico:</span>
                <span className="font-semibold text-on-surface">Eng. Ricardo Souza (CREA-SP)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Técnica SST Responsável:</span>
                <span className="font-semibold text-on-surface">Fernanda Alencar (MTE)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Status da Folha de Hoje:</span>
                <span className="text-tertiary font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  Pronta para Homologação
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-surface-container font-mono text-[11px]">
                <span className="text-on-surface-variant">Assinatura Digital ICP:</span>
                <span className="text-primary font-bold">SHA-256 #9F82A</span>
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => showToast('Boletim de Efetivo homologado e assinado digitalmente com hash ICP-Brasil.', 'success')}
            className="w-full py-2.5 bg-surface hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-surface-container-high shadow-sm"
          >
            <span className="material-symbols-outlined text-base text-primary">verified</span>
            <span>Homologar e Assinar Boletim de Efetivo</span>
          </button>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface max-w-lg w-full p-6 shadow-2xl border border-surface-container-high">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div>
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Apontamento Manual Provisório</span>
                <h3 className="text-base font-bold text-on-surface">Registrar Trabalhador em Campo</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Nome Completo *</label>
                  <input 
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Ex: Sebastião Moreira"
                    className="w-full p-2.5 bg-surface-container text-on-surface border border-surface-container-high focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-1">CPF ou Matrícula</label>
                  <input 
                    type="text"
                    value={newMatricula}
                    onChange={e => setNewMatricula(e.target.value)}
                    placeholder="Ex: 1092"
                    className="w-full p-2.5 bg-surface-container text-on-surface border border-surface-container-high font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Função / Cargo *</label>
                  <input 
                    type="text"
                    required
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    placeholder="Ex: Carpinteiro de Formas"
                    className="w-full p-2.5 bg-surface-container text-on-surface border border-surface-container-high"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Empresa Contratante</label>
                  <select 
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    className="w-full p-2.5 bg-surface-container text-on-surface border border-surface-container-high"
                  >
                    <option>Construtora Horizonte (CLT)</option>
                    <option>Aço &amp; Forma Estruturas</option>
                    <option>HidroVolt Instalações</option>
                    <option>Arte &amp; Bloco Alvenaria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Frente de Obra Alocada</label>
                <select 
                  value={newFront}
                  onChange={e => setNewFront(e.target.value)}
                  className="w-full p-2.5 bg-surface-container text-on-surface border border-surface-container-high"
                >
                  <option>Torre A — 14º Pav. Laje</option>
                  <option>Torre B — 8º Pav. Alvenaria</option>
                  <option>Prumadas Elétrica/Hidráulica</option>
                  <option>Canteiro Geral &amp; Logística</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary font-bold hover:bg-primary/90"
                >
                  Confirmar Apontamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
