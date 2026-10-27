import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PhotoEvidence } from '../types';

export const EvidenceView: React.FC = () => {
  const { 
    openPdfModal, 
    showToast, 
    addAuditLog 
  } = useApp();

  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEvidence | null>(null);
  const [selectedFront, setSelectedFront] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // New photo form
  const [newTitle, setNewTitle] = useState('');
  const [newFront, setNewFront] = useState('Torre A - 14º Pavimento');
  const [newDiscipline, setNewDiscipline] = useState('Estrutura de Concreto');

  const photosList: PhotoEvidence[] = [
    {
      id: 'photo-1',
      title: 'Inspeção de Armação Negativa Laje L-14',
      description: 'Conferência dos espaçadores pastilha plástica (cobridor de 3,0 cm garantido) e reforços de punção nos pilares P-12 e P-14.',
      discipline: 'Estrutura de Concreto',
      status: 'conforme',
      statusLabel: 'Conforme',
      rdoNumber: '184',
      author: 'Eng. Ricardo Souza',
      timestamp: '14:32:08',
      date: '24/10/2024',
      location: 'Torre A • Laje Pav. 14 (Setor Sul)',
      coords: '-23.58741° S, -46.68239° W',
      altitude: '782.4m',
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80',
      tags: ['Armação', 'Laje 14', 'FVS-EST-042']
    },
    {
      id: 'photo-2',
      title: 'Passagem de Tubulação Cortando Armadura Principal',
      description: 'Identificado corte indevido de barra de aço Ø16mm para passagem de tubulação esgoto 100mm. Paralisação imediata até revisão de cálculo.',
      discipline: 'Hidráulica x Estrutural',
      status: 'rnc',
      statusLabel: 'RNC #042 Aberta',
      rdoNumber: '184',
      author: 'Téc. Marcos Silva',
      timestamp: '11:15:42',
      date: '24/10/2024',
      location: 'Torre A • Shaft Prumada Apt 122',
      coords: '-23.58739° S, -46.68241° W',
      altitude: '782.1m',
      imageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80',
      tags: ['RNC', 'Shaft', 'Tubulação']
    },
    {
      id: 'photo-3',
      title: 'Teste de Estanqueidade da Laje do Barrilete',
      description: 'Início do teste hidrostático de lâmina d\'água com carga de 72 horas. Aplicação de manta asfáltica 4mm poliéster concluída.',
      discipline: 'Impermeabilização',
      status: 'em_andamento',
      statusLabel: 'Em Andamento (72h)',
      rdoNumber: '183',
      author: 'Eng. Ricardo Souza',
      timestamp: '16:48:10',
      date: '23/10/2024',
      location: 'Torre B • Terraço Técnico Cobertura',
      coords: '-23.58712° S, -46.68285° W',
      altitude: '814.0m',
      imageUrl: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=800&auto=format&fit=crop&q=80',
      tags: ['Estanqueidade', 'Manta Asfáltica']
    },
    {
      id: 'photo-4',
      title: 'Instalação de Proteção Coletiva de Periferia',
      description: 'Fixação com parabolt dos montantes metálicos de 1,20m com rodapé de 20cm e tela de polietileno conforme NR-18.',
      discipline: 'Segurança Ocupacional',
      status: 'conforme',
      statusLabel: 'NR-18 / Conforme',
      rdoNumber: '184',
      author: 'Téc. Seg. Fernanda Alencar',
      timestamp: '09:20:14',
      date: '24/10/2024',
      location: 'Perímetro Fachada Sul • Pav. 14',
      coords: '-23.58742° S, -46.68235° W',
      altitude: '782.5m',
      imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
      tags: ['SST', 'Guarda-corpo', 'NR-18']
    },
    {
      id: 'photo-5',
      title: 'Aplicação de Emboço Técnico e Revestimento',
      description: 'Progresso semanal da fachada externa. Argamassa AC-III com dupla colagem para cerâmica. Comparativo de 45 dias registrado.',
      discipline: 'Acabamento de Fachada',
      status: 'antes_depois',
      statusLabel: 'Antes x Depois',
      rdoNumber: '182',
      author: 'Eng. Ricardo Souza',
      timestamp: '15:10:00',
      date: '22/10/2024',
      location: 'Fachada Leste • Eixo 03 ao 07',
      coords: '-23.58750° S, -46.68260° W',
      altitude: '770.2m',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
      tags: ['Fachada', 'Cerâmica', 'Comparativo']
    },
    {
      id: 'photo-6',
      title: 'Marcação da 1ª Fiada e Prumo a Laser',
      description: 'Verificação dimensional e esquadro dos cômodos do apto 804 com trena laser. Desvio angular inferior a 1,5mm dentro da norma PBQP-H.',
      discipline: 'Alvenaria de Vedação',
      status: 'conforme',
      statusLabel: 'Conforme',
      rdoNumber: '184',
      author: 'Téc. Marcos Silva',
      timestamp: '08:05:33',
      date: '24/10/2024',
      location: 'Torre B • Apto 804 (Sala/Cozinha)',
      coords: '-23.58744° S, -46.68230° W',
      altitude: '779.3m',
      imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
      tags: ['Alvenaria', 'Laser', 'PBQP-H']
    }
  ];

  const filteredPhotos = photosList.filter(p => {
    if (selectedFront !== 'all' && !p.location.toLowerCase().includes(selectedFront.toLowerCase())) return false;
    if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
    return true;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Foto com carimbo GPS georreferenciado e hash SHA-256 anexada ao RDO.', 'success');
    addAuditLog('Evidência fotográfica adicionada', 'FVS', `Registro pericial de ${newTitle} gravado`);
    setIsUploadModalOpen(false);
    setNewTitle('');
  };

  return (
    <div className="flex flex-col w-full space-y-6 font-body">
      {/* Top Headline / Breadcrumb */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-surface-container-high">
        <div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
            <span>Auditoria &amp; Qualidade</span>
            <span>/</span>
            <span className="text-primary font-bold">Mural Fotográfico Pericial</span>
          </div>
          <div className="flex items-baseline gap-4 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Evidências Visuais &amp; Georreferenciamento de Campo
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-tertiary-container text-on-tertiary-container">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary mr-1.5"></span>
              Georreferenciamento 100% Auditado
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1.5 max-w-2xl leading-relaxed">
            Registros de conformidade, inspeções preventivas e rastreabilidade visual vinculada ao Diário de Obra (RDO) e laudos de fiscalização pericial com selo ICP-Brasil.
          </p>
        </div>

        {/* Quick Stats Ribbon */}
        <div className="grid grid-cols-3 gap-1 bg-surface-container-high p-1">
          <div className="bg-surface p-3 min-w-[120px] sm:min-w-[140px] border border-surface-container-high">
            <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-medium">
              <span>Hoje</span>
              <span className="material-symbols-outlined text-sm text-primary">photo_camera</span>
            </div>
            <div className="text-xl font-bold text-on-surface mt-1 tracking-tight font-mono">48</div>
            <div className="text-[10px] text-tertiary font-semibold flex items-center gap-0.5 mt-0.5">
              <span className="material-symbols-outlined text-xs">arrow_upward</span> +14 vs ontem
            </div>
          </div>

          <div className="bg-surface p-3 min-w-[120px] sm:min-w-[140px] border border-surface-container-high">
            <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-medium">
              <span>RNC / Alertas</span>
              <span className="material-symbols-outlined text-sm text-error">warning</span>
            </div>
            <div className="text-xl font-bold text-error mt-1 tracking-tight font-mono">03</div>
            <div className="text-[10px] text-error font-semibold mt-0.5">Pendentes de ação</div>
          </div>

          <div className="bg-surface p-3 min-w-[120px] sm:min-w-[140px] border border-surface-container-high">
            <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-medium">
              <span>Vínculo RDO</span>
              <span className="material-symbols-outlined text-sm text-tertiary">link</span>
            </div>
            <div className="text-xl font-bold text-on-surface mt-1 tracking-tight font-mono">100%</div>
            <div className="text-[10px] text-on-surface-variant font-medium mt-0.5">GPS / EXIF Válidos</div>
          </div>
        </div>
      </div>

      {/* Action Toolbar & Advanced Filter Hub */}
      <div className="flex flex-col gap-4 py-4 bg-surface-container-low px-4 sm:px-6 shadow-sm border border-surface-container-high">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mr-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">filter_alt</span> Filtros
            </span>
            <button 
              type="button" 
              onClick={() => setSelectedFront('Torre A')}
              className={`px-3 py-1.5 text-xs font-semibold border ${selectedFront === 'Torre A' ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface border-surface-container-high'}`}
            >
              Torre A (14º Pav.)
            </button>
            <button 
              type="button"
              onClick={() => setSelectedFront('Torre B')}
              className={`px-3 py-1.5 text-xs font-semibold border ${selectedFront === 'Torre B' ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface border-surface-container-high'}`}
            >
              Torre B (Cobertura &amp; 8º)
            </button>
            <button 
              type="button"
              onClick={() => { setSelectedFront('all'); setSelectedStatus('all'); }}
              className="text-xs text-primary font-semibold hover:underline ml-2"
            >
              Limpar Filtros
            </button>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button 
              type="button"
              onClick={() => setIsCompareDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-surface-container text-on-surface text-xs font-semibold shadow-sm transition-colors border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-base text-primary">compare</span>
              <span>Comparador Antes x Depois</span>
            </button>

            <button 
              type="button"
              onClick={() => openPdfModal('fotos')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface text-on-surface hover:bg-surface-container text-xs font-semibold shadow-sm transition-colors border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              <span>Caderno de Fotos (PDF)</span>
            </button>

            <button 
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-base">cloud_upload</span>
              <span>+ Upload de Evidências</span>
            </button>
          </div>
        </div>

        {/* Filter Selectors Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="flex flex-col bg-surface p-2.5 border border-surface-container-high">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-primary">location_on</span> Local / Frente de Obra
            </label>
            <select 
              value={selectedFront}
              onChange={e => setSelectedFront(e.target.value)}
              className="bg-surface-container-low text-xs font-medium text-on-surface py-2 px-2.5 outline-none border-b-2 border-primary"
            >
              <option value="all">Todas as Frentes de Obra</option>
              <option value="Torre A">Torre A - 14º Pavimento (Laje Atual)</option>
              <option value="Torre B">Torre B - Cobertura &amp; 8º Pavimento</option>
              <option value="Fachada">Fachada Leste &amp; Pastilhamento</option>
              <option value="Canteiro">Canteiro Geral &amp; Grua Principal</option>
            </select>
          </div>

          <div className="flex flex-col bg-surface p-2.5 border border-surface-container-high">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-primary">domain</span> Disciplina / Etapa
            </label>
            <select className="bg-surface-container-low text-xs font-medium text-on-surface py-2 px-2.5 outline-none border-b-2 border-primary">
              <option>Todas as Disciplinas</option>
              <option>Estrutura (Formas / Armações / Concreto)</option>
              <option>Alvenaria de Vedação &amp; Vergas</option>
              <option>Impermeabilização e Estanqueidade</option>
              <option>Instalações Hidráulicas &amp; Prumadas</option>
              <option>Segurança do Trabalho (NR-18 / NR-35)</option>
            </select>
          </div>

          <div className="flex flex-col bg-surface p-2.5 border border-surface-container-high">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-primary">verified</span> Auditoria &amp; Conformidade
            </label>
            <select 
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-surface-container-low text-xs font-medium text-on-surface py-2 px-2.5 outline-none border-b-2 border-primary"
            >
              <option value="all">Todos os Status</option>
              <option value="conforme">Conforme (Liberado p/ Etapa Segue)</option>
              <option value="rnc">Não Conformidade (RNC Aberta)</option>
              <option value="em_andamento">Em Andamento / Teste 72h</option>
              <option value="antes_depois">Antes x Depois Registrado</option>
            </select>
          </div>

          <div className="flex flex-col bg-surface p-2.5 border border-surface-container-high">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-primary">calendar_today</span> Janela Temporal
            </label>
            <div className="flex items-center gap-2">
              <input type="date" defaultValue="2024-10-20" className="w-full bg-surface-container-low text-xs font-medium text-on-surface py-1.5 px-2 outline-none border-b-2 border-primary" />
              <span className="text-xs text-on-surface-variant font-bold">a</span>
              <input type="date" defaultValue="2024-10-24" className="w-full bg-surface-container-low text-xs font-medium text-on-surface py-1.5 px-2 outline-none border-b-2 border-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Header Viewport Mode */}
      <div className="flex items-center justify-between pb-1 text-xs text-on-surface-variant">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-on-surface">Exibindo {filteredPhotos.length} de {photosList.length} registros periciais</span>
          <span>•</span>
          <span className="hidden sm:inline">Ordem cronológica inversa (Mais recentes primeiro)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-tertiary-container text-on-tertiary-container font-mono px-2 py-0.5 font-bold">
            GPS INDELÉVEL
          </span>
        </div>
      </div>

      {/* EVIDENCE GALLERY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPhotos.map(photo => {
          const statusBadge = {
            conforme: 'bg-tertiary text-on-tertiary',
            rnc: 'bg-error text-on-error',
            em_andamento: 'bg-primary text-on-primary',
            antes_depois: 'bg-surface-variant text-on-surface border border-surface-container-highest',
          }[photo.status];

          return (
            <div key={photo.id} className="bg-surface-container-low flex flex-col group shadow-sm hover:shadow-md transition-shadow border border-surface-container-high">
              {/* Photo Container with Timestamp Stamp */}
              <div className="relative w-full h-64 overflow-hidden bg-surface-container-highest">
                <img 
                  src={photo.imageUrl} 
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Status Badge */}
                <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase shadow ${statusBadge}`}>
                  <span className="material-symbols-outlined text-xs">
                    {photo.status === 'conforme' ? 'check_circle' : photo.status === 'rnc' ? 'error' : photo.status === 'antes_depois' ? 'auto_stories' : 'sync'}
                  </span>
                  <span>{photo.statusLabel}</span>
                </div>

                {/* RDO Badge Tag */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-surface/90 backdrop-blur-xs text-[11px] font-mono font-bold text-on-surface shadow">
                  <span className="material-symbols-outlined text-xs text-primary">bookmark</span>
                  <span>RDO #{photo.rdoNumber}</span>
                </div>

                {/* Georeference Technical Stamp (Bottom overlay) */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-on-surface/95 via-on-surface/75 to-transparent p-3 text-white font-mono text-[10px] leading-tight">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-tertiary-fixed">satellite_alt</span>
                      {photo.coords}
                    </span>
                    <span className="text-tertiary-fixed">{photo.date} • {photo.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between text-surface-container-high mt-0.5">
                    <span>{photo.location}</span>
                    <span>Alt: {photo.altitude}</span>
                  </div>
                </div>
              </div>

              {/* Card Metadata */}
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant mb-2">
                    <span className="font-semibold text-primary uppercase">{photo.discipline}</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">account_circle</span> {photo.author}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-on-surface tracking-tight mb-2">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {photo.description}
                  </p>
                </div>

                {/* Action Ribbon */}
                <div className="mt-4 pt-3 border-t border-surface-container-high flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => setSelectedPhoto(photo)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-xs">visibility</span> Ver Detalhes
                    </button>
                    <span className="text-surface-container-highest">•</span>
                    <button 
                      type="button"
                      onClick={() => setIsCompareDrawerOpen(true)}
                      className="text-xs font-semibold text-on-surface hover:text-primary flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-xs">history</span> Comparar
                    </button>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => showToast('Metadados EXIF e hash SHA-256 copiados para área de transferência.', 'info')}
                    className="p-1 hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
                    title="Inspecionar Hash Criptográfico"
                  >
                    <span className="material-symbols-outlined text-sm">fingerprint</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DRAWER / LATERAL PANEL: ANTES x DEPOIS */}
      {isCompareDrawerOpen && (
        <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-surface shadow-2xl z-50 flex flex-col overflow-hidden border-l border-surface-container-high animate-fadeIn">
          {/* Drawer Header */}
          <div className="p-5 bg-surface-container-low flex items-center justify-between border-b border-surface-container-high">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-xl">compare</span>
              <div>
                <h2 className="text-sm font-bold text-on-surface font-headline uppercase tracking-wide">
                  Auditoria Visual: Comparativo Antes x Depois
                </h2>
                <span className="text-xs text-on-surface-variant">Frente de Serviço: Torre A - Subsolo 2 ao Pavimento 14</span>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setIsCompareDrawerOpen(false)}
              className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="bg-surface-container-low p-4 border border-surface-container-high">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase text-on-surface">Ponto de Rastreabilidade Fixo #09</label>
                <span className="text-[11px] font-mono text-primary font-bold">Delta: +60 Dias Corridos</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Vértice de canteiro georreferenciado cravado. Evolução da fundação profunda para a superestrutura do 14º pavimento.
              </p>
            </div>

            {/* Side-by-Side Visual Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ANTES */}
              <div className="flex flex-col bg-surface-container-low border border-surface-container-high">
                <div className="p-2.5 bg-surface-container-high flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    ESTADO ANTERIOR (60 dias atrás)
                  </span>
                  <span className="text-[11px] font-mono text-on-surface-variant">28/08/2024</span>
                </div>
                <div className="relative h-60 w-full overflow-hidden bg-surface-container-highest">
                  <img 
                    src="https://images.unsplash.com/photo-1590496793929-36417d3117de?w=600&auto=format&fit=crop&q=80" 
                    alt="Fundação e Blocos" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-on-surface/80 text-white font-mono text-[10px] px-2 py-0.5">
                    Etapa: Fundação &amp; Blocos
                  </div>
                </div>
                <div className="p-3 text-xs text-on-surface-variant leading-relaxed">
                  <div className="font-semibold text-on-surface mb-1">Armação dos Blocos de Coroamento</div>
                  Escavação e regularização do lastro de brita no Subsolo 2. 12 sapatas com laudo de ensaio PIT aprovado.
                </div>
              </div>

              {/* DEPOIS */}
              <div className="flex flex-col bg-surface-container-low border border-surface-container-high">
                <div className="p-2.5 bg-primary text-on-primary flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    ESTADO ATUAL (Hoje)
                  </span>
                  <span className="text-[11px] font-mono">24/10/2024</span>
                </div>
                <div className="relative h-60 w-full overflow-hidden bg-surface-container-highest">
                  <img 
                    src="https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=600&auto=format&fit=crop&q=80" 
                    alt="Pavimento 14" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-primary text-on-primary font-mono text-[10px] px-2 py-0.5 font-bold">
                    Etapa: Superestrutura Pav. 14
                  </div>
                </div>
                <div className="p-3 text-xs text-on-surface-variant leading-relaxed">
                  <div className="font-semibold text-on-surface mb-1">Superestrutura Concluída e Desformada</div>
                  Ciclo de 7 dias por laje atingido sem atraso no cronograma físico-financeiro. Concreto fck 35 MPa aprovado.
                </div>
              </div>
            </div>

            {/* Parecer Fiscal */}
            <div className="bg-surface-container-low p-4 border border-surface-container-high space-y-2 text-xs">
              <h4 className="font-bold uppercase text-on-surface tracking-wide">Parecer da Auditoria Fiscal</h4>
              <div className="flex items-start gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-tertiary text-base shrink-0">task_alt</span>
                <p><strong>Aderência ao Cronograma:</strong> Execução dentro da faixa de tolerância de 5% da Linha de Base.</p>
              </div>
              <div className="flex items-start gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-tertiary text-base shrink-0">task_alt</span>
                <p><strong>Rastreabilidade de Concreto:</strong> Rompimento de corpos de prova de 28 dias atingiu 38,4 MPa (meta 35 MPa).</p>
              </div>
              <div className="flex items-start gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-base shrink-0">verified</span>
                <p><strong>Validação Eletrônica:</strong> Homologado por Eng. Ricardo Souza (CREA-SP 506.924.810-D).</p>
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex items-center justify-between gap-3">
            <button 
              type="button"
              onClick={() => showToast('Par de fotos em alta resolução exportado com metadados.', 'success')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Exportar Par em Alta Resolução</span>
            </button>
            <button 
              type="button"
              onClick={() => {
                showToast('Par comparativo anexado ao Caderno Fiscal do RDO #184.', 'success');
                setIsCompareDrawerOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-xs font-semibold text-on-primary hover:bg-primary/90 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>Inserir no Caderno Fiscal</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal with Simulated GPS */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface max-w-lg w-full p-6 shadow-2xl border border-surface-container-high">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_a_photo</span>
                <h3 className="text-sm font-bold uppercase tracking-wide text-on-surface">Subir Evidência Fotográfica Pericial</h3>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase mb-1">Título da Evidência *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Verificação de Prumo Pilar P-14"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-surface-container p-2.5 text-xs text-on-surface border border-surface-container-high focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant uppercase mb-1">Frente de Obra</label>
                  <select 
                    value={newFront}
                    onChange={e => setNewFront(e.target.value)}
                    className="w-full bg-surface-container p-2 text-xs text-on-surface border border-surface-container-high"
                  >
                    <option>Torre A - 14º Pavimento</option>
                    <option>Torre B - 8º Pavimento</option>
                    <option>Subsolo 2 - Garagens</option>
                    <option>Fachada Externa Leste</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant uppercase mb-1">Disciplina</label>
                  <select 
                    value={newDiscipline}
                    onChange={e => setNewDiscipline(e.target.value)}
                    className="w-full bg-surface-container p-2 text-xs text-on-surface border border-surface-container-high"
                  >
                    <option>Estrutura de Concreto</option>
                    <option>Alvenaria e Vedação</option>
                    <option>Instalações Hidráulicas</option>
                    <option>Segurança do Trabalho</option>
                  </select>
                </div>
              </div>

              {/* Automatic GPS Stamp Preview */}
              <div className="p-3 bg-surface-container text-[11px] space-y-1 font-mono border border-surface-container-high">
                <div className="flex justify-between text-tertiary font-bold">
                  <span>GPS AUTOMÁTICO COLETADO:</span>
                  <span>±1.2m Precisão</span>
                </div>
                <div className="text-on-surface-variant">Latitude: -23.58741° S • Longitude: -46.68239° W</div>
                <div className="text-on-surface-variant">Data/Hora: {new Date().toLocaleString('pt-BR')}</div>
                <div className="text-primary font-bold">Hash Criptográfico SHA-256 gerado automaticamente</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-on-primary font-semibold hover:bg-primary/90"
                >
                  Confirmar Upload e Carimbo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
