import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { StorageService } from '../services/storageService';
import { listarDiarios, salvarDiario, excluirDiario } from '../services/storage';
import { comprimirImagem } from '../services/imageUtils';
import { resumir, SOLO_LABEL, formatarMm, hojeIso, LIMITE_PRATICABILIDADE_MM } from '../services/pluviometria';
import { criarRdoExemplo } from '../mock/data';
import { EfetivoStorage, colaboradoresDaObra } from '../services/efetivo';
import {
  RdoDiario,
  CondicaoClimatica,
  TurnoTrabalho,
  EfetivoAlocado,
  EquipamentoAlocado,
  OcorrenciaFrente,
} from '../types/rdo';

const CLIMA_LABEL: Record<CondicaoClimatica, string> = {
  bom: 'Bom (ensolarado)',
  nublado: 'Nublado',
  chuva_leve: 'Chuva leve',
  chuva_forte: 'Chuva forte',
  impraticavel: 'Impraticável',
};

const CLIMA_ICONE: Record<CondicaoClimatica, string> = {
  bom: 'sunny',
  nublado: 'cloud',
  chuva_leve: 'rainy_light',
  chuva_forte: 'rainy_heavy',
  impraticavel: 'thunderstorm',
};

const TURNO_LABEL: Record<TurnoTrabalho, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  integral: 'Integral',
  noite: 'Noite',
};

const TRECHO_LABEL: Record<RdoDiario['condicaoTrecho'], string> = {
  praticavel: 'Praticável',
  parcial: 'Parcialmente praticável',
  impraticavel: 'Impraticável',
};

const STATUS_SERVICO_LABEL: Record<OcorrenciaFrente['status'], string> = {
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  interrompido: 'Interrompido',
};

const UNIDADES = ['m³', 'm²', 'm', 't', 'un', 'vb'];

function dataPorExtenso(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  const txt = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

function dataCurta(iso: string): string {
  return iso.split('-').reverse().join('/');
}

function num(v: string): number {
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function blobParaDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result as string);
    leitor.onerror = () => reject(leitor.error);
    leitor.readAsDataURL(blob);
  });
}

export const RdoView: React.FC = () => {
  const {
    activeProject,
    currentUser,
    showToast,
    addAuditLog,
    rdoNotes,
    setRdoNotes,
    setIsEngineeringAiOpen,
    setActiveTab,
    workers,
  } = useApp();

  const [diarios, setDiarios] = useState<RdoDiario[]>([]);
  const [rdo, setRdo] = useState<RdoDiario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvoEm, setSalvoEm] = useState<string | null>(null);
  const [pendenteSalvar, setPendenteSalvar] = useState(false);
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const [fotoAberta, setFotoAberta] = useState<string | null>(null);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const bloqueado = rdo?.status === 'assinado';

  // Carrega os RDOs da obra (cria o de exemplo na primeira vez)
  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    (async () => {
      try {
        let lista = await listarDiarios(activeProject.id);
        if (lista.length === 0) {
          const exemplo = criarRdoExemplo(activeProject.id);
          await salvarDiario(exemplo);
          lista = [exemplo];
        }
        if (!ativo) return;
        setDiarios(lista);
        setRdo(lista[0]);
        setRdoNotes(lista[0].observacoes);
      } catch (err) {
        console.error('[RDO] Falha ao abrir o banco local:', err);
        if (ativo) showToast('Não foi possível abrir o armazenamento local do navegador.', 'error');
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => { ativo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject.id]);

  // Salvamento automático (rascunho) com pequeno atraso após a última alteração
  useEffect(() => {
    if (!rdo || !pendenteSalvar) return;
    const t = setTimeout(async () => {
      try {
        await salvarDiario(rdo);
        setDiarios(prev => prev.map(d => (d.id === rdo.id ? rdo : d)));
        setSalvoEm(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        setPendenteSalvar(false);
      } catch (err) {
        console.error('[RDO] Falha ao salvar:', err);
        showToast('Falha ao salvar o RDO no aparelho. Verifique o espaço disponível.', 'error');
      }
    }, 600);
    return () => clearTimeout(t);
  }, [rdo, pendenteSalvar, showToast]);

  // Texto gerado pelo Copilot IA chega pelo rdoNotes global
  useEffect(() => {
    if (rdo && !bloqueado && rdoNotes !== rdo.observacoes) {
      atualizar({ observacoes: rdoNotes });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rdoNotes]);

  const atualizar = (parcial: Partial<RdoDiario>) => {
    if (!rdo || bloqueado) return;
    setRdo({ ...rdo, ...parcial, atualizadoEm: new Date().toISOString() });
    setPendenteSalvar(true);
  };

  const selecionar = async (id: string) => {
    if (rdo && pendenteSalvar) await salvarDiario(rdo);
    const alvo = diarios.find(d => d.id === id);
    if (!alvo) return;
    setRdo(alvo);
    setRdoNotes(alvo.observacoes);
    setPendenteSalvar(false);
    setSalvoEm(null);
  };

  const novoRdo = async () => {
    if (rdo && pendenteSalvar) await salvarDiario(rdo);
    const hoje = hojeIso();
    const anterior = diarios[0];
    const agora = new Date().toISOString();
    const novo: RdoDiario = {
      id: crypto.randomUUID(),
      projectId: activeProject.id,
      numero: Math.max(0, ...diarios.map(d => d.numero)) + 1,
      data: hoje,
      turno: anterior?.turno || 'integral',
      climaManha: 'bom',
      climaTarde: 'bom',
      condicaoTrecho: 'praticavel',
      // Efetivo e equipamentos costumam se repetir: copia do RDO anterior zerando paradas
      efetivo: anterior ? anterior.efetivo.map(e => ({ ...e })) : [],
      equipamentos: anterior ? anterior.equipamentos.map(e => ({ ...e, horasParadas: 0, motivoParada: '' })) : [],
      servicos: [],
      fotos: [],
      observacoes: '',
      status: 'rascunho',
      criadoEm: agora,
      atualizadoEm: agora,
    };
    try {
      await salvarDiario(novo);
      setDiarios(prev => [novo, ...prev]);
      setRdo(novo);
      setRdoNotes('');
      setPendenteSalvar(false);
      setSalvoEm(null);
      addAuditLog('RDO criado', 'RDO', `RDO nº ${novo.numero} aberto para ${dataCurta(hoje)}`);
      showToast(anterior
        ? `RDO nº ${novo.numero} criado. Efetivo e equipamentos copiados do RDO nº ${anterior.numero}.`
        : `RDO nº ${novo.numero} criado.`, 'success');
    } catch {
      showToast('Não foi possível criar o RDO.', 'error');
    }
  };

  const excluirRascunho = async () => {
    if (!rdo || bloqueado) return;
    if (!window.confirm(`Excluir o rascunho do RDO nº ${rdo.numero}? Esta ação não pode ser desfeita.`)) return;
    await excluirDiario(rdo.id);
    const resto = diarios.filter(d => d.id !== rdo.id);
    setDiarios(resto);
    setRdo(resto[0] || null);
    setRdoNotes(resto[0]?.observacoes || '');
    setPendenteSalvar(false);
    addAuditLog('Rascunho de RDO excluído', 'RDO', `RDO nº ${rdo.numero} excluído`);
    showToast(`Rascunho do RDO nº ${rdo.numero} excluído.`, 'info');
  };

  const assinar = async () => {
    if (!rdo || bloqueado) return;
    const faltando: string[] = [];
    if (rdo.efetivo.length === 0) faltando.push('efetivo');
    if (rdo.servicos.length === 0) faltando.push('serviços executados');
    if (faltando.length && !window.confirm(`O RDO está sem ${faltando.join(' e ')}. Assinar mesmo assim?`)) return;
    if (!window.confirm(`Assinar e fechar o RDO nº ${rdo.numero}? Depois de assinado ele não pode mais ser editado.`)) return;
    const assinado: RdoDiario = {
      ...rdo,
      status: 'assinado',
      assinadoPor: currentUser?.name || activeProject.engineer,
      assinadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    try {
      await salvarDiario(assinado);
      setRdo(assinado);
      setDiarios(prev => prev.map(d => (d.id === assinado.id ? assinado : d)));
      setPendenteSalvar(false);
      addAuditLog('RDO assinado', 'RDO', `RDO nº ${assinado.numero} de ${dataCurta(assinado.data)} assinado por ${assinado.assinadoPor}`);
      showToast(`RDO nº ${assinado.numero} assinado e fechado.`, 'success');
    } catch {
      showToast('Falha ao assinar o RDO.', 'error');
    }
  };

  // ---- Edição de listas ----
  const editarEfetivo = (i: number, p: Partial<EfetivoAlocado>) =>
    rdo && atualizar({ efetivo: rdo.efetivo.map((e, idx) => (idx === i ? { ...e, ...p } : e)) });
  const editarEquip = (i: number, p: Partial<EquipamentoAlocado>) =>
    rdo && atualizar({ equipamentos: rdo.equipamentos.map((e, idx) => (idx === i ? { ...e, ...p } : e)) });
  const editarServico = (i: number, p: Partial<OcorrenciaFrente>) =>
    rdo && atualizar({ servicos: rdo.servicos.map((e, idx) => (idx === i ? { ...e, ...p } : e)) });

  // Importa o apontamento do dia feito em "Efetivo & Equipamentos"
  const importarEfetivo = () => {
    if (!rdo) return;
    const dia = EfetivoStorage.getApontamentos(activeProject.id)?.[rdo.data] || {};
    const presentes = colaboradoresDaObra(workers, activeProject.id).filter(w => dia[w.id]?.status === 'presente');
    if (presentes.length === 0) {
      return showToast(`Não há presença apontada em ${dataCurta(rdo.data)}. Faça o apontamento em Efetivo & Equipamentos.`, 'warning');
    }
    const grupos = new Map<string, EfetivoAlocado & { hh: number }>();
    presentes.forEach(w => {
      const h = dia[w.id].horasNormais + dia[w.id].horasExtras;
      const chave = `${w.company}|${w.role}`;
      const g = grupos.get(chave);
      if (g) { g.quantidade += 1; g.hh += h; }
      else grupos.set(chave, { empresa: w.company, funcao: w.role, quantidade: 1, hh: h, proprio: w.contractType === 'clt' });
    });
    const lista: EfetivoAlocado[] = [...grupos.values()].map(({ hh, ...g }) => ({ ...g, horasPorPessoa: Math.round((hh / g.quantidade) * 10) / 10 }));
    if (rdo.efetivo.length && !window.confirm(`Substituir o efetivo do RDO pelo apontamento de ${dataCurta(rdo.data)}?`)) return;
    atualizar({ efetivo: lista });
    showToast(`${presentes.length} presentes importados em ${lista.length} funções.`, 'success');
  };

  const importarEquipamentos = () => {
    if (!rdo) return;
    const cadastro = EfetivoStorage.getEquipamentos(activeProject.id) || [];
    const dia = EfetivoStorage.getApontEquip(activeProject.id)[rdo.data] || {};
    const lista: EquipamentoAlocado[] = cadastro
      .filter(eq => dia[eq.id])
      .map(eq => ({
        tipo: eq.tipo,
        identificacao: eq.prefixo,
        horasOperativas: dia[eq.id].horasOperando,
        horasParadas: dia[eq.id].horasParadas,
        motivoParada: dia[eq.id].motivoParada || '',
      }));
    if (lista.length === 0) {
      return showToast(`Não há equipamentos apontados em ${dataCurta(rdo.data)}. Faça o apontamento em Efetivo & Equipamentos.`, 'warning');
    }
    if (rdo.equipamentos.length && !window.confirm(`Substituir os equipamentos do RDO pelo apontamento de ${dataCurta(rdo.data)}?`)) return;
    atualizar({ equipamentos: lista });
    showToast(`${lista.length} equipamentos importados.`, 'success');
  };

  const adicionarFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivos = Array.from(e.target.files || []);
    e.target.value = '';
    if (!rdo || arquivos.length === 0) return;
    setProcessandoFoto(true);
    try {
      const novas = await Promise.all(arquivos.map(async arq => ({
        id: crypto.randomUUID(),
        urlBlob: await blobParaDataUrl(await comprimirImagem(arq, 1280, 0.7)),
        descricao: '',
        estaca: '',
        timestamp: new Date().toISOString(),
      })));
      atualizar({ fotos: [...rdo.fotos, ...novas] });
    } catch {
      showToast('Não foi possível processar uma das fotos.', 'error');
    } finally {
      setProcessandoFoto(false);
    }
  };

  // ---- Totais e integração com a Pluviometria ----
  const totais = useMemo(() => {
    if (!rdo) return { pessoas: 0, hh: 0, proprio: 0, eqOperando: 0, eqParadas: 0 };
    return {
      pessoas: rdo.efetivo.reduce((s, e) => s + e.quantidade, 0),
      hh: rdo.efetivo.reduce((s, e) => s + e.quantidade * (e.horasPorPessoa || 0), 0),
      proprio: rdo.efetivo.filter(e => e.proprio).reduce((s, e) => s + e.quantidade, 0),
      eqOperando: rdo.equipamentos.filter(e => e.horasOperativas > 0).length,
      eqParadas: rdo.equipamentos.reduce((s, e) => s + e.horasParadas, 0),
    };
  }, [rdo]);

  const chuvaDoDia = useMemo(() => {
    if (!rdo) return null;
    const registros = StorageService.getRainRecords(activeProject.id).filter(r => r.data === rdo.data);
    return { registros, resumo: resumir(registros) };
  }, [rdo?.data, activeProject.id]);

  if (carregando) {
    return <div className="p-10 text-center text-sm text-on-surface-variant">Carregando diários de obra…</div>;
  }

  if (!rdo) {
    return (
      <div className="bg-surface-container-low p-10 text-center space-y-4">
        <p className="text-sm text-on-surface-variant">Nenhum RDO registrado para esta obra.</p>
        <button type="button" onClick={novoRdo} className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold">Criar primeiro RDO</button>
      </div>
    );
  }

  const outroNoMesmoDia = diarios.find(d => d.id !== rdo.id && d.data === rdo.data);
  const inputCls = 'w-full bg-surface px-2 py-1.5 text-xs border-b-2 border-surface-container-highest focus:border-primary focus:outline-none disabled:bg-surface-container-low disabled:border-transparent';
  const labelCls = 'block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1';
  const tituloBloco = (icone: string, titulo: string, extra?: React.ReactNode) => (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-xl">{icone}</span>
        <h2 className="text-base font-semibold text-on-surface uppercase tracking-wide">{titulo}</h2>
      </div>
      {extra}
    </div>
  );
  const botaoAdicionar = (rotulo: string, onClick: () => void) => (
    <button type="button" onClick={onClick} className="no-print inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary bg-surface hover:bg-primary-container border border-surface-container-high">
      <span className="material-symbols-outlined text-sm">add</span>{rotulo}
    </button>
  );
  const botaoRemover = (onClick: () => void, titulo: string) => (
    <button type="button" onClick={onClick} title={titulo} className="no-print p-1 text-on-surface-variant hover:text-error">
      <span className="material-symbols-outlined text-base align-middle">delete</span>
    </button>
  );

  return (
    <div className="flex flex-col w-full space-y-6 font-body">
      {/* Barra superior */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-low p-4 shadow-sm border border-surface-container-high">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center min-w-10 h-10 px-1.5 bg-primary text-on-primary font-bold text-sm tracking-widest">
            {rdo.numero}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-on-surface tracking-tight">Diário de Obra (RDO) nº {rdo.numero} / {rdo.data.slice(0, 4)}</h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${bloqueado ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-[#fff8e1] text-[#b78103]'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${bloqueado ? 'bg-tertiary' : 'bg-[#b78103]'}`}></span>
                {bloqueado ? 'Assinado e fechado' : 'Em preenchimento'}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {dataPorExtenso(rdo.data)} • {activeProject.name} • Turno {TURNO_LABEL[rdo.turno]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap no-print">
          <select
            value={rdo.id}
            onChange={e => selecionar(e.target.value)}
            className="bg-surface px-3 py-2 text-xs border border-surface-container-high min-w-[220px]"
            title="RDOs desta obra"
          >
            {diarios.map(d => (
              <option key={d.id} value={d.id}>
                nº {d.numero} • {dataCurta(d.data)} • {d.status === 'assinado' ? 'Assinado' : 'Rascunho'}
              </option>
            ))}
          </select>
          <button type="button" onClick={novoRdo} className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface text-on-surface hover:bg-surface-container-high text-xs font-semibold border border-surface-container-high">
            <span className="material-symbols-outlined text-base text-primary">add</span> Novo RDO
          </button>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary hover:bg-primary/90 text-xs font-semibold shadow-sm">
            <span className="material-symbols-outlined text-base">print</span> Imprimir / PDF
          </button>
        </div>
      </div>

      {outroNoMesmoDia && (
        <div className="bg-[#fff8e1] text-[#7a5600] p-3 text-xs flex items-center gap-2 border border-[#f1c21b]/50 no-print">
          <span className="material-symbols-outlined text-base">warning</span>
          Já existe o RDO nº {outroNoMesmoDia.numero} com a data {dataCurta(rdo.data)}. Confira se a data está correta.
        </div>
      )}

      {/* Indicadores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Efetivo Mobilizado', valor: `${totais.pessoas}`, un: 'pessoas', extra: `${totais.proprio} próprios • ${totais.pessoas - totais.proprio} terceiros`, erro: false },
          { label: 'Horas Trabalhadas', valor: formatarMm(Math.round(totais.hh * 10) / 10), un: 'Hh', extra: `${rdo.efetivo.length} funções`, erro: false },
          { label: 'Paralisação Climática', valor: formatarMm(chuvaDoDia?.resumo.horasParadas || 0), un: 'horas', extra: chuvaDoDia?.registros.length ? `${formatarMm(chuvaDoDia.resumo.acumuladoMm)} mm no dia` : 'Sem chuva registrada', erro: (chuvaDoDia?.resumo.horasParadas || 0) > 0 },
          { label: 'Equipamentos', valor: `${totais.eqOperando} / ${rdo.equipamentos.length}`, un: 'operando', extra: totais.eqParadas ? `${formatarMm(totais.eqParadas)} h paradas` : 'Sem paradas', erro: totais.eqParadas > 0 },
        ].map(k => (
          <div key={k.label} className="bg-surface-container-low p-3.5 flex flex-col justify-between shadow-sm border border-surface-container-high">
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">{k.label}</span>
            <div className="flex items-baseline justify-between mt-1 gap-2">
              <span className={`text-2xl font-bold tracking-tight font-mono ${k.erro ? 'text-error' : 'text-on-surface'}`}>
                {k.valor} <span className="text-xs font-normal text-on-surface-variant">{k.un}</span>
              </span>
              <span className={`text-[11px] font-medium text-right ${k.erro ? 'text-error' : 'text-on-surface-variant'}`}>{k.extra}</span>
            </div>
          </div>
        ))}
      </div>

      <fieldset disabled={bloqueado} className="space-y-6 min-w-0">
        {/* Bloco 1: Clima e pluviometria */}
        <section className="bg-surface-container-low p-5 shadow-sm space-y-4 border border-surface-container-high">
          {tituloBloco('partly_cloudy_day', '1. Data, Clima & Praticabilidade')}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className={labelCls}>Data do RDO</label>
              <input type="date" max={hojeIso()} value={rdo.data} onChange={e => e.target.value && atualizar({ data: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Turno</label>
              <select value={rdo.turno} onChange={e => atualizar({ turno: e.target.value as TurnoTrabalho })} className={inputCls}>
                {(Object.keys(TURNO_LABEL) as TurnoTrabalho[]).map(t => <option key={t} value={t}>{TURNO_LABEL[t]}</option>)}
              </select>
            </div>
            {(['climaManha', 'climaTarde'] as const).map(campo => (
              <div key={campo}>
                <label className={labelCls}>Clima ({campo === 'climaManha' ? 'manhã' : 'tarde'})</label>
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-lg ${rdo[campo].startsWith('chuva') || rdo[campo] === 'impraticavel' ? 'text-error' : 'text-primary'}`}>{CLIMA_ICONE[rdo[campo]]}</span>
                  <select value={rdo[campo]} onChange={e => atualizar({ [campo]: e.target.value as CondicaoClimatica })} className={inputCls}>
                    {(Object.keys(CLIMA_LABEL) as CondicaoClimatica[]).map(c => <option key={c} value={c}>{CLIMA_LABEL[c]}</option>)}
                  </select>
                </div>
              </div>
            ))}
            <div>
              <label className={labelCls}>Condição do trecho</label>
              <select value={rdo.condicaoTrecho} onChange={e => atualizar({ condicaoTrecho: e.target.value as RdoDiario['condicaoTrecho'] })}
                className={`${inputCls} ${rdo.condicaoTrecho === 'impraticavel' ? 'text-error font-semibold' : ''}`}>
                {(Object.keys(TRECHO_LABEL) as RdoDiario['condicaoTrecho'][]).map(c => <option key={c} value={c}>{TRECHO_LABEL[c]}</option>)}
              </select>
            </div>
          </div>

          {/* Pluviometria do dia (vem da tela de Pluviometria) */}
          <div className={`p-3 flex flex-wrap items-start gap-3 border ${chuvaDoDia?.resumo.diasParalisacaoTotal ? 'bg-error-container text-on-error-container border-error/30' : 'bg-surface border-surface-container-high'}`}>
            <span className={`material-symbols-outlined text-xl shrink-0 ${chuvaDoDia?.registros.length ? 'text-error' : 'text-primary'}`}>water_drop</span>
            <div className="text-xs leading-relaxed flex-1 min-w-[240px]">
              <strong className="font-semibold">Pluviometria do dia {dataCurta(rdo.data)}: </strong>
              {chuvaDoDia && chuvaDoDia.registros.length > 0 ? (
                <>
                  {formatarMm(chuvaDoDia.resumo.acumuladoMm)} mm em {chuvaDoDia.registros.length} {chuvaDoDia.registros.length === 1 ? 'leitura' : 'leituras'}
                  {' '}({chuvaDoDia.registros.map(r => `${r.inicio || '—'}${r.fim ? `–${r.fim}` : ''}: ${formatarMm(r.mm)} mm`).join('; ')}).
                  {' '}Solo {chuvaDoDia.resumo.soloAtual ? SOLO_LABEL[chuvaDoDia.resumo.soloAtual].toLowerCase() : '—'}.
                  {chuvaDoDia.resumo.horasParadas > 0 && <> <span className="font-semibold">{formatarMm(chuvaDoDia.resumo.horasParadas)} h paralisadas</span>.</>}
                  {chuvaDoDia.resumo.diasParalisacaoTotal > 0 && <> <span className="font-semibold underline">Paralisação total registrada para cômputo de prazo.</span></>}
                  {chuvaDoDia.resumo.maiorChuvaDiaMm > LIMITE_PRATICABILIDADE_MM && <> Acima do limite de {LIMITE_PRATICABILIDADE_MM} mm.</>}
                </>
              ) : (
                <>nenhuma leitura registrada.</>
              )}
            </div>
            <span role="link" tabIndex={0} onClick={() => setActiveTab('pluviometria')} onKeyDown={e => e.key === 'Enter' && setActiveTab('pluviometria')}
              className="no-print text-xs font-semibold text-primary hover:underline shrink-0 cursor-pointer">
              {chuvaDoDia?.registros.length ? 'Ver na Pluviometria →' : 'Registrar chuva →'}
            </span>
          </div>
        </section>

        {/* Bloco 2: Efetivo */}
        <section className="bg-surface-container-low p-5 shadow-sm space-y-4 border border-surface-container-high">
          {tituloBloco('badge', '2. Mão de Obra & Efetivo', (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-surface-container px-2.5 py-1 text-on-surface font-mono">{formatarMm(Math.round(totais.hh * 10) / 10)} Hh</span>
              <button type="button" onClick={importarEfetivo} className="no-print inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-surface hover:bg-surface-container-high border border-surface-container-high">
                <span className="material-symbols-outlined text-sm text-primary">download</span>Importar apontamento do dia
              </button>
              {botaoAdicionar('Função', () => atualizar({ efetivo: [...rdo.efetivo, { empresa: rdo.efetivo[rdo.efetivo.length - 1]?.empresa || '', funcao: '', quantidade: 1, horasPorPessoa: 8, proprio: true }] }))}
            </div>
          ))}
          <div className="overflow-x-auto bg-surface border border-surface-container-high">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-container text-on-surface uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-2 px-3">Empresa</th>
                  <th className="py-2 px-3">Função</th>
                  <th className="py-2 px-3 w-20 text-center">Qtd.</th>
                  <th className="py-2 px-3 w-24 text-center">h/pessoa</th>
                  <th className="py-2 px-3 w-20 text-right">Hh</th>
                  <th className="py-2 px-3 w-20 text-center">Próprio</th>
                  <th className="py-2 px-1 w-8 no-print"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {rdo.efetivo.length === 0 && (
                  <tr><td colSpan={7} className="py-6 text-center text-on-surface-variant">Nenhuma função lançada. Importe do controle de efetivo ou adicione manualmente.</td></tr>
                )}
                {rdo.efetivo.map((e, i) => (
                  <tr key={i}>
                    <td className="py-1 px-2"><input value={e.empresa || ''} onChange={ev => editarEfetivo(i, { empresa: ev.target.value })} placeholder="Empresa" className={inputCls} /></td>
                    <td className="py-1 px-2"><input value={e.funcao} onChange={ev => editarEfetivo(i, { funcao: ev.target.value })} placeholder="Ex: Operador de motoniveladora" className={inputCls} /></td>
                    <td className="py-1 px-2"><input inputMode="numeric" value={e.quantidade} onChange={ev => editarEfetivo(i, { quantidade: Math.round(num(ev.target.value)) })} className={`${inputCls} text-center font-mono`} /></td>
                    <td className="py-1 px-2"><input inputMode="decimal" value={e.horasPorPessoa ?? ''} onChange={ev => editarEfetivo(i, { horasPorPessoa: Math.min(24, num(ev.target.value)) })} className={`${inputCls} text-center font-mono`} /></td>
                    <td className="py-1 px-3 text-right font-mono font-semibold">{formatarMm(Math.round(e.quantidade * (e.horasPorPessoa || 0) * 10) / 10)}</td>
                    <td className="py-1 px-3 text-center"><input type="checkbox" checked={e.proprio} onChange={ev => editarEfetivo(i, { proprio: ev.target.checked })} className="accent-primary" /></td>
                    <td className="py-1 px-1">{botaoRemover(() => atualizar({ efetivo: rdo.efetivo.filter((_, idx) => idx !== i) }), 'Remover função')}</td>
                  </tr>
                ))}
              </tbody>
              {rdo.efetivo.length > 0 && (
                <tfoot className="bg-surface-container-high font-semibold text-on-surface">
                  <tr>
                    <td className="py-2 px-3 uppercase text-[11px]" colSpan={2}>Total de efetivo presente</td>
                    <td className="py-2 px-3 text-center font-mono">{totais.pessoas}</td>
                    <td></td>
                    <td className="py-2 px-3 text-right font-mono text-primary">{formatarMm(Math.round(totais.hh * 10) / 10)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>

        {/* Bloco 3: Equipamentos */}
        <section className="bg-surface-container-low p-5 shadow-sm space-y-4 border border-surface-container-high">
          {tituloBloco('precision_manufacturing', '3. Máquinas & Equipamentos', (
            <div className="flex items-center gap-2">
              <button type="button" onClick={importarEquipamentos} className="no-print inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-surface hover:bg-surface-container-high border border-surface-container-high">
                <span className="material-symbols-outlined text-sm text-primary">download</span>Importar apontamento do dia
              </button>
              {botaoAdicionar('Equipamento', () => atualizar({ equipamentos: [...rdo.equipamentos, { tipo: '', identificacao: '', horasOperativas: 8, horasParadas: 0 }] }))}
            </div>
          ))}
          <div className="overflow-x-auto bg-surface border border-surface-container-high">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-container text-on-surface uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-2 px-3">Equipamento</th>
                  <th className="py-2 px-3">Identificação / Prefixo</th>
                  <th className="py-2 px-3 w-24 text-center">h operando</th>
                  <th className="py-2 px-3 w-24 text-center">h parado</th>
                  <th className="py-2 px-3">Motivo da parada</th>
                  <th className="py-2 px-3 w-28">Utilização</th>
                  <th className="py-2 px-1 w-8 no-print"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {rdo.equipamentos.length === 0 && (
                  <tr><td colSpan={7} className="py-6 text-center text-on-surface-variant">Nenhum equipamento lançado.</td></tr>
                )}
                {rdo.equipamentos.map((e, i) => {
                  const total = e.horasOperativas + e.horasParadas;
                  const uso = total > 0 ? (e.horasOperativas / total) * 100 : 0;
                  return (
                    <tr key={i}>
                      <td className="py-1 px-2"><input value={e.tipo} onChange={ev => editarEquip(i, { tipo: ev.target.value })} placeholder="Ex: Rolo compactador" className={inputCls} /></td>
                      <td className="py-1 px-2"><input value={e.identificacao} onChange={ev => editarEquip(i, { identificacao: ev.target.value })} placeholder="Ex: RC-03" className={`${inputCls} font-mono`} /></td>
                      <td className="py-1 px-2"><input inputMode="decimal" value={e.horasOperativas} onChange={ev => editarEquip(i, { horasOperativas: Math.min(24, num(ev.target.value)) })} className={`${inputCls} text-center font-mono`} /></td>
                      <td className="py-1 px-2"><input inputMode="decimal" value={e.horasParadas} onChange={ev => editarEquip(i, { horasParadas: Math.min(24, num(ev.target.value)) })} className={`${inputCls} text-center font-mono ${e.horasParadas > 0 ? 'text-error' : ''}`} /></td>
                      <td className="py-1 px-2"><input value={e.motivoParada || ''} onChange={ev => editarEquip(i, { motivoParada: ev.target.value })} placeholder={e.horasParadas > 0 ? 'Informe o motivo' : '—'} className={`${inputCls} ${e.horasParadas > 0 && !e.motivoParada ? 'border-error' : ''}`} /></td>
                      <td className="py-1 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-surface-container h-1.5"><div className={`h-1.5 ${uso < 75 ? 'bg-error' : 'bg-tertiary'}`} style={{ width: `${uso}%` }} /></div>
                          <span className="font-mono text-[10px] w-8 text-right">{Math.round(uso)}%</span>
                        </div>
                      </td>
                      <td className="py-1 px-1">{botaoRemover(() => atualizar({ equipamentos: rdo.equipamentos.filter((_, idx) => idx !== i) }), 'Remover equipamento')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bloco 4: Serviços */}
        <section className="bg-surface-container-low p-5 shadow-sm space-y-4 border border-surface-container-high">
          {tituloBloco('assignment_turned_in', '4. Serviços Executados por Frente / Estaca',
            botaoAdicionar('Serviço', () => atualizar({ servicos: [...rdo.servicos, { estacaInicial: '', estacaFinal: '', servico: '', descricao: '', status: 'em_andamento', unidade: 'm³' }] })))}
          {rdo.servicos.length === 0 && (
            <div className="bg-surface p-6 text-center text-xs text-on-surface-variant border border-surface-container-high">Nenhum serviço lançado neste RDO.</div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
            {rdo.servicos.map((s, i) => (
              <div key={i} className={`bg-surface p-4 shadow-sm space-y-2.5 border ${s.status === 'interrompido' ? 'border-error/50' : 'border-surface-container-high'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-semibold text-primary">FRENTE-{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex items-center gap-1">
                    <select value={s.status} onChange={ev => editarServico(i, { status: ev.target.value as OcorrenciaFrente['status'] })}
                      className={`px-2 py-0.5 text-[10px] font-semibold uppercase ${s.status === 'concluido' ? 'bg-tertiary-container text-on-tertiary-container' : s.status === 'interrompido' ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-fixed'}`}>
                      {(Object.keys(STATUS_SERVICO_LABEL) as OcorrenciaFrente['status'][]).map(st => <option key={st} value={st}>{STATUS_SERVICO_LABEL[st]}</option>)}
                    </select>
                    {botaoRemover(() => atualizar({ servicos: rdo.servicos.filter((_, idx) => idx !== i) }), 'Remover serviço')}
                  </div>
                </div>
                <input value={s.servico} onChange={ev => editarServico(i, { servico: ev.target.value })} placeholder="Serviço (ex: Execução de base BGS)" className={`${inputCls} text-sm font-semibold`} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Estaca / local inicial</label>
                    <input value={s.estacaInicial} onChange={ev => editarServico(i, { estacaInicial: ev.target.value })} placeholder="Ex: 120+00" className={`${inputCls} font-mono`} />
                  </div>
                  <div>
                    <label className={labelCls}>Estaca / local final</label>
                    <input value={s.estacaFinal} onChange={ev => editarServico(i, { estacaFinal: ev.target.value })} placeholder="Ex: 135+10" className={`${inputCls} font-mono`} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className={labelCls}>Quantidade executada</label>
                    <input inputMode="decimal" value={s.quantidade ?? ''} onChange={ev => editarServico(i, { quantidade: ev.target.value === '' ? undefined : num(ev.target.value) })} placeholder="0" className={`${inputCls} font-mono`} />
                  </div>
                  <div>
                    <label className={labelCls}>Unidade</label>
                    <select value={s.unidade || 'm³'} onChange={ev => editarServico(i, { unidade: ev.target.value })} className={inputCls}>
                      {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <textarea rows={2} value={s.descricao} onChange={ev => editarServico(i, { descricao: ev.target.value })} placeholder="Descrição, ocorrências, motivo de interrupção..." className={`${inputCls} resize-none`} />
              </div>
            ))}
          </div>
        </section>

        {/* Bloco 5: Fotos */}
        <section className="bg-surface-container-low p-5 shadow-sm space-y-4 border border-surface-container-high">
          {tituloBloco('photo_camera', '5. Registro Fotográfico', (
            <div className="flex items-center gap-2 no-print">
              <span className="text-xs text-on-surface-variant">{rdo.fotos.length} {rdo.fotos.length === 1 ? 'foto' : 'fotos'} • comprimidas para envio leve</span>
              <input ref={inputFotoRef} type="file" accept="image/*" capture="environment" multiple onChange={adicionarFoto} className="hidden" />
              <button type="button" onClick={() => inputFotoRef.current?.click()} disabled={processandoFoto}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-on-primary bg-primary hover:bg-primary/90 disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">add_a_photo</span>{processandoFoto ? 'Comprimindo…' : 'Adicionar fotos'}
              </button>
            </div>
          ))}
          {rdo.fotos.length === 0 ? (
            <div className="bg-surface p-6 text-center text-xs text-on-surface-variant border border-dashed border-surface-container-highest">
              Nenhuma foto. No celular, o botão abre a câmera direto.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
              {rdo.fotos.map((f, i) => (
                <div key={f.id} className="bg-surface border border-surface-container-high">
                  {/* img clicável (e não botão) para continuar abrindo com o RDO fechado */}
                  <img src={f.urlBlob} alt={f.descricao || `Foto ${i + 1}`} onClick={() => setFotoAberta(f.urlBlob)} className="w-full h-28 object-cover cursor-zoom-in" />
                  <div className="p-2 space-y-1">
                    <input value={f.descricao} onChange={ev => atualizar({ fotos: rdo.fotos.map(x => (x.id === f.id ? { ...x, descricao: ev.target.value } : x)) })} placeholder="Legenda" className={inputCls} />
                    <div className="flex items-center gap-1">
                      <input value={f.estaca || ''} onChange={ev => atualizar({ fotos: rdo.fotos.map(x => (x.id === f.id ? { ...x, estaca: ev.target.value } : x)) })} placeholder="Estaca" className={`${inputCls} font-mono`} />
                      {botaoRemover(() => atualizar({ fotos: rdo.fotos.filter(x => x.id !== f.id) }), 'Remover foto')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bloco 6: Observações */}
        <section className="bg-surface-container-low p-5 shadow-sm space-y-3 border border-surface-container-high">
          {tituloBloco('edit_note', '6. Observações Técnicas, Segurança & Ocorrências', (
            <button type="button" onClick={() => setIsEngineeringAiOpen(true)}
              className="no-print px-2.5 py-1 bg-secondary-container text-on-secondary-container text-[11px] font-bold flex items-center gap-1 hover:bg-secondary-container/80 border border-secondary/30"
              title="Revisar o texto com o Copilot IA">
              <span className="material-symbols-outlined text-sm text-secondary">auto_awesome</span> Revisar com IA
            </button>
          ))}
          <textarea
            value={rdo.observacoes}
            onChange={e => { atualizar({ observacoes: e.target.value }); setRdoNotes(e.target.value); }}
            rows={5}
            placeholder="Ocorrências do dia, segurança do trabalho, visitas da fiscalização, solicitações..."
            className="w-full bg-surface text-xs text-on-surface p-3 outline-none focus:bg-surface-container-lowest leading-relaxed resize-y border border-surface-container-high disabled:bg-surface-container-low"
          />
        </section>
      </fieldset>

      {/* Assinatura */}
      <section className="bg-surface-container-low p-5 shadow-sm space-y-3 border border-surface-container-high">
        {tituloBloco('history_edu', '7. Fechamento & Assinatura')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface p-4 shadow-sm flex flex-col justify-between gap-4 border border-surface-container-high">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] text-on-surface-variant uppercase font-semibold">Responsável técnico pela execução</span>
                <h4 className="text-sm font-semibold text-on-surface mt-0.5">{rdo.assinadoPor || currentUser?.name || activeProject.engineer}</h4>
                <p className="text-xs text-on-surface-variant font-mono">{activeProject.crea}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase ${bloqueado ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-[#fff8e1] text-[#b78103]'}`}>
                <span className="material-symbols-outlined text-xs">{bloqueado ? 'verified' : 'pending'}</span>
                {bloqueado ? 'Assinado' : 'Pendente'}
              </span>
            </div>
            {bloqueado ? (
              <div className="text-xs text-tertiary font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">task_alt</span>
                Assinado em {new Date(rdo.assinadoEm!).toLocaleString('pt-BR')}. O RDO está fechado para edição.
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 no-print">
                <button type="button" onClick={excluirRascunho} className="text-xs text-on-surface-variant hover:text-error font-medium">Excluir rascunho</button>
                <button type="button" onClick={assinar} className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold shadow-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">draw</span> Assinar e fechar RDO
                </button>
              </div>
            )}
          </div>
          <div className="bg-surface p-4 shadow-sm flex flex-col justify-between gap-3 border border-surface-container-high">
            <div>
              <span className="text-[11px] text-on-surface-variant uppercase font-semibold">Fiscalização do contratante</span>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                A assinatura da fiscalização e o envio para o servidor ficam disponíveis quando o backend da obra estiver no ar.
                Até lá, o RDO fica guardado neste aparelho e pode ser impresso ou salvo em PDF para coleta de assinatura.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rodapé de status */}
      <div className="bg-surface-container-low p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-on-surface-variant shadow-sm border border-surface-container-high no-print">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-base ${pendenteSalvar ? 'text-[#b78103]' : 'text-tertiary'}`}>{pendenteSalvar ? 'sync' : 'cloud_done'}</span>
          <span>
            {bloqueado
              ? 'RDO fechado. Guardado neste aparelho.'
              : pendenteSalvar
                ? 'Salvando…'
                : salvoEm ? `Salvo automaticamente neste aparelho às ${salvoEm}.` : 'Alterações são salvas automaticamente neste aparelho.'}
          </span>
        </div>
        <span>{diarios.length} {diarios.length === 1 ? 'RDO' : 'RDOs'} nesta obra • {diarios.filter(d => d.status === 'assinado').length} assinados</span>
      </div>

      {fotoAberta && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setFotoAberta(null)}>
          <img src={fotoAberta} alt="Foto do RDO" className="max-w-full max-h-[85vh] shadow-lg" />
        </div>
      )}
    </div>
  );
};
