import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CHAT_CHANNELS } from '../mock/data';

export const CommunicationView: React.FC = () => {
  const { 
    chatMessages, 
    sendMessage, 
    activeChatChannel, 
    setActiveChatChannel, 
    showToast,
    addAuditLog 
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [channelFilter, setChannelFilter] = useState<'all' | 'rnc' | 'active'>('all');

  const currentChannel = CHAT_CHANNELS.find(c => c.id === activeChatChannel) || CHAT_CHANNELS[0];
  const channelMessages = chatMessages.filter(m => m.channelId === currentChannel.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(currentChannel.id, inputMessage);
    setInputMessage('');
  };

  const handleVoiceRecord = () => {
    showToast('Nota de voz gravada (0:24) com filtro de cancelamento de ruído de betoneira.', 'info');
    sendMessage(currentChannel.id, 'Nota de voz de campo gravada (0:24): "Verificação de escoramento liberada para concretagem amanhã às 07:00."');
    addAuditLog('Áudio transmitido no canal de campo', 'RDO', `Nota de voz enviada para #${currentChannel.name}`);
  };

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      showToast('Reproduzindo áudio do Mestre Valdir com áudio enriquecido...', 'info');
    }
  };

  return (
    <div className="flex flex-col w-full font-body text-on-surface antialiased space-y-4">
      {/* Top Utility Bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-surface-container-high gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-7 bg-primary"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-semibold text-primary tracking-wider font-mono">Canteiro Conectado</span>
              <span className="text-xs text-on-surface-variant">•</span>
              <span className="text-xs text-tertiary font-semibold flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                Sincronização P2P Ativa
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-on-surface">Comunicação e Mensagens de Campo</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-surface-container text-xs text-on-surface-variant font-medium border border-surface-container-high">
            <span className="material-symbols-outlined text-base text-primary">security</span>
            <span>Canal Auditado pelo RDO #184</span>
          </div>
          <button 
            type="button" 
            onClick={() => showToast('Logs de transmissão e transcrições auditadas exportados.', 'info')}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors border border-surface-container-high shadow-sm"
          >
            <span className="material-symbols-outlined text-base">history</span>
            <span>Logs de Transmissão</span>
          </button>
        </div>
      </div>

      {/* 3-Column Workspace Grid */}
      <div className="grid grid-cols-12 gap-4 items-start w-full min-h-[calc(100vh-14rem)]">
        {/* COLUMN 1: Canais & Conversas */}
        <aside className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col bg-surface-container-low shadow-sm border border-surface-container-high">
          {/* Search & Filters */}
          <div className="p-3 bg-surface-container space-y-2.5 border-b border-surface-container-high">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-secondary text-lg pointer-events-none">search</span>
              <input 
                type="text" 
                placeholder="Buscar mensagens, frentes... /" 
                className="w-full pl-9 pr-8 py-2 bg-surface text-xs text-on-surface placeholder:text-secondary focus:outline-none border border-surface-container-high"
              />
              <kbd className="absolute right-2 px-1.5 py-0.5 text-[10px] font-mono bg-surface-container-high text-on-surface-variant">⌘K</kbd>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              <button 
                type="button"
                onClick={() => setChannelFilter('all')}
                className={`px-2.5 py-1 text-[11px] font-semibold border ${channelFilter === 'all' ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface-variant border-surface-container-high'}`}
              >
                Todas
              </button>
              <button 
                type="button"
                onClick={() => setChannelFilter('active')}
                className={`px-2.5 py-1 text-[11px] font-medium border ${channelFilter === 'active' ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface-variant border-surface-container-high'}`}
              >
                Frentes Ativas
              </button>
              <button 
                type="button"
                onClick={() => setChannelFilter('rnc')}
                className={`px-2.5 py-1 text-[11px] font-medium border flex items-center gap-1 ${channelFilter === 'rnc' ? 'bg-error text-on-error border-error' : 'bg-surface text-error border-surface-container-high'}`}
              >
                <span>RNC</span>
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
              </button>
            </div>
          </div>

          {/* Channels List */}
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-22rem)] py-2 space-y-2 px-2">
            {CHAT_CHANNELS.map(ch => {
              const isSelected = ch.id === currentChannel.id;

              return (
                <div 
                  key={ch.id} 
                  onClick={() => setActiveChatChannel(ch.id)}
                  className={`flex flex-col p-2.5 cursor-pointer transition-colors border ${isSelected ? 'bg-surface text-on-surface shadow-sm border-l-4 border-l-primary border-surface-container-high' : 'hover:bg-surface-container border-transparent'}`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`font-mono font-bold text-xs ${isSelected ? 'text-primary' : 'text-secondary'}`}>#</span>
                      <span className="text-xs font-semibold truncate text-on-surface">{ch.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-on-surface-variant shrink-0">{ch.lastMessageTime}</span>
                  </div>

                  {ch.badge && (
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] font-medium bg-primary-container text-on-primary-fixed px-1.5 py-0.2 leading-tight">
                        {ch.badge}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                    <p className="truncate text-on-surface-variant pr-2">
                      {ch.lastMessageText}
                    </p>
                    {ch.unreadCount > 0 && (
                      <span className="min-w-4 h-4 px-1 flex items-center justify-center bg-primary text-on-primary text-[10px] font-bold">
                        {ch.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* COLUMN 2: Janela Principal de Chat */}
        <section className="col-span-12 lg:col-span-8 xl:col-span-6 flex flex-col bg-surface shadow-sm border border-surface-container-high min-h-[calc(100vh-14rem)]">
          {/* Chat Header */}
          <header className="p-3 bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-surface-container-high">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-primary text-on-primary flex items-center justify-center text-base font-bold shadow-sm">
                #
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold tracking-tight text-on-surface">#{currentChannel.name}</h2>
                  <span className="text-[10px] font-semibold bg-tertiary-container text-on-tertiary-container px-2 py-0.5 tracking-wide uppercase font-mono">
                    {currentChannel.frontName}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-on-surface-variant mt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-secondary">group</span>
                    <span>8 membros alocados</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-tertiary font-medium">
                    <span className="material-symbols-outlined text-xs">lock</span>
                    <span>Auditado &amp; Vinculado ao RDO #184</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 self-end sm:self-center">
              <button 
                type="button" 
                onClick={() => showToast('Canal fixado no topo do seu painel de campo.', 'info')}
                className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                title="Fixar canal"
              >
                <span className="material-symbols-outlined text-lg">push_pin</span>
              </button>
            </div>
          </header>

          {/* Message Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-23rem)] bg-surface">
            {channelMessages.map(msg => {
              if (msg.isSelf) {
                return (
                  <div key={msg.id} className="flex items-start gap-3 justify-end">
                    <div className="flex-1 max-w-xl flex flex-col items-end">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[10px] text-secondary font-mono">{msg.timestamp}</span>
                        <span className="text-xs font-semibold text-primary">{msg.senderName}</span>
                      </div>
                      <div className="p-3 bg-primary text-on-primary text-xs leading-relaxed shadow-sm">
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-secondary">
                        <span className="material-symbols-outlined text-xs text-tertiary">done_all</span>
                        <span>Sincronizado na Nuvem</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-on-primary-container text-on-primary shrink-0 flex items-center justify-center text-xs font-bold">
                      {msg.senderInitials}
                    </div>
                  </div>
                );
              }

              if (msg.isBot && msg.photoEvidence) {
                return (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-container shrink-0 flex items-center justify-center text-primary font-bold">
                      <span className="material-symbols-outlined text-base">smart_toy</span>
                    </div>
                    <div className="flex-1 max-w-xl">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-semibold text-primary">{msg.senderName}</span>
                        <span className="text-[10px] text-secondary font-mono">{msg.timestamp}</span>
                        <span className="text-[10px] px-1 bg-primary text-on-primary font-semibold font-mono">AUTOMÁTICO</span>
                      </div>
                      <div className="p-3 bg-surface-container-low shadow-sm space-y-2 border border-surface-container-high">
                        <div className="flex items-center justify-between text-xs font-semibold text-on-surface">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-tertiary text-sm">photo_camera</span>
                            <span>{msg.photoEvidence.title}</span>
                          </span>
                          <span className="text-[10px] font-mono bg-surface-container px-1.5 py-0.5">GPS ATIVO</span>
                        </div>
                        <div className="relative w-full h-36 bg-surface-container overflow-hidden">
                          <img 
                            src={msg.photoEvidence.imageUrl} 
                            alt={msg.photoEvidence.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 inset-x-0 p-2 bg-inverse-surface/85 text-inverse-on-surface text-[10px] font-mono flex items-center justify-between">
                            <span>GPS: {msg.photoEvidence.gps}</span>
                            <span>Cota: {msg.photoEvidence.cota}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-on-surface-variant">
                          Armadura Negativa Laje L-14 conferida e auditada pericialmente.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              if (msg.audio) {
                return (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-surface-container-high shrink-0 flex items-center justify-center text-xs font-bold text-on-surface">
                      {msg.senderInitials}
                    </div>
                    <div className="flex-1 max-w-xl">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-semibold text-on-surface">{msg.senderName}</span>
                        <span className="text-[10px] text-secondary font-mono">{msg.timestamp}</span>
                      </div>
                      <div className="p-3 bg-surface-container-low shadow-sm space-y-2.5 border border-surface-container-high">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">mic</span>
                            <span>Nota de Voz de Campo • Cancelamento de Ruído</span>
                          </span>
                          <span className="text-[10px] font-mono text-on-surface-variant">{msg.audio.duration}</span>
                        </div>

                        {/* Waveform audio player */}
                        <div className="flex items-center gap-3 bg-surface p-2.5 shadow-sm border border-surface-container-high">
                          <button 
                            type="button" 
                            onClick={toggleAudio}
                            className="w-9 h-9 bg-primary hover:bg-primary/90 text-on-primary flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-lg">
                              {isPlayingAudio ? 'pause' : 'play_arrow'}
                            </span>
                          </button>
                          <div className="flex-1 flex items-center gap-0.5 h-7">
                            <svg className="w-full h-6 text-primary" preserveAspectRatio="none" viewBox="0 0 200 24">
                              {Array.from({ length: 40 }).map((_, i) => {
                                const height = (Math.sin(i * 0.4) * 0.5 + 0.5) * 18 + 4;
                                const isPlayed = isPlayingAudio ? (i / 40) < 0.6 : false;
                                return (
                                  <rect 
                                    key={i} 
                                    x={i * 5} 
                                    y={12 - height / 2} 
                                    width="3" 
                                    height={height} 
                                    fill={isPlayed ? '#0f62fe' : '#c6c6c6'}
                                  />
                                );
                              })}
                            </svg>
                          </div>
                          <span className="text-xs font-mono font-medium text-on-surface">1.2x</span>
                        </div>

                        <div className="bg-surface p-2 text-xs text-on-surface-variant leading-relaxed border border-surface-container-high">
                          <span className="font-semibold text-on-surface">Transcrição Automática: </span>
                          <span className="italic">{msg.audio.transcript}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (msg.attachment) {
                return (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-surface-container-high shrink-0 flex items-center justify-center text-xs font-bold text-on-surface">
                      {msg.senderInitials}
                    </div>
                    <div className="flex-1 max-w-xl">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-semibold text-on-surface">{msg.senderName}</span>
                        <span className="text-[10px] text-secondary font-mono">{msg.timestamp}</span>
                      </div>
                      <div className="p-3 bg-surface-container-low shadow-sm space-y-2 border border-surface-container-high">
                        <p className="text-xs text-on-surface">{msg.text}</p>
                        <div className="flex items-center justify-between p-2.5 bg-surface border border-surface-container-high shadow-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 bg-error-container text-error flex items-center justify-center shrink-0 font-bold text-xs">
                              PDF
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-on-surface truncate">{msg.attachment.name}</p>
                              <div className="flex items-center gap-2 text-[10px] text-secondary">
                                <span>{msg.attachment.size}</span>
                                <span>•</span>
                                <span className="text-tertiary flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[12px]">verified</span>
                                  Assinado ICP-Brasil
                                </span>
                              </div>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => showToast('Visualizando laudo técnico em modo seguro.', 'info')}
                            className="px-2.5 py-1 text-xs font-semibold bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors"
                          >
                            Visualizar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-surface-container-high shrink-0 flex items-center justify-center text-xs font-bold text-on-surface">
                    {msg.senderInitials}
                  </div>
                  <div className="flex-1 max-w-xl">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-semibold text-on-surface">{msg.senderName}</span>
                      <span className="text-[10px] text-secondary font-mono">{msg.timestamp}</span>
                      <span className="text-[10px] px-1 bg-surface-container text-on-surface-variant font-mono">{msg.senderRole}</span>
                    </div>
                    <div className="p-3 bg-surface-container-low text-xs leading-relaxed text-on-surface shadow-sm border border-surface-container-high">
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Input */}
          <footer className="p-3 bg-surface-container space-y-2 border-t border-surface-container-high">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setInputMessage(prev => prev + '@MestreValdir ')}
                  className="flex items-center gap-1 px-2 py-0.5 bg-surface text-on-surface text-[11px] font-medium border border-surface-container-high"
                >
                  <span className="text-primary font-bold">@</span>
                  <span>Mencionar</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setInputMessage(prev => prev + '#RDO184 ')}
                  className="flex items-center gap-1 px-2 py-0.5 bg-surface text-on-surface text-[11px] font-medium border border-surface-container-high"
                >
                  <span className="text-tertiary font-bold">#</span>
                  <span>Vincular RDO</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setInputMessage(prev => prev + '!ALERTA-RNC ')}
                  className="flex items-center gap-1 px-2 py-0.5 bg-surface text-on-surface text-[11px] font-medium border border-surface-container-high"
                >
                  <span className="text-error font-bold">!</span>
                  <span>Alerta RNC</span>
                </button>
              </div>
              <span className="text-[10px] text-on-surface-variant font-mono hidden sm:inline">Pressione Enter para enviar</span>
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 bg-surface p-2 border border-surface-container-high shadow-sm">
              <button 
                type="button"
                onClick={() => showToast('Anexo de foto com GPS vinculado à mensagem.', 'info')}
                className="p-2 text-on-surface-variant hover:text-on-surface"
                title="Anexar Foto ou Laudo"
              >
                <span className="material-symbols-outlined text-xl">attach_file</span>
              </button>

              <button 
                type="button"
                onClick={handleVoiceRecord}
                className="p-2 bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center justify-center"
                title="Gravar nota de voz de canteiro"
              >
                <span className="material-symbols-outlined text-xl">mic</span>
              </button>

              <input 
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder={`Mensagem para #${currentChannel.name}...`}
                className="flex-1 bg-transparent text-xs text-on-surface placeholder:text-secondary focus:outline-none px-2"
              />

              <button 
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
              >
                <span>Enviar</span>
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
          </footer>
        </section>

        {/* COLUMN 3: Detalhes da Frente */}
        <aside className="col-span-12 xl:col-span-3 flex flex-col bg-surface-container-low shadow-sm border border-surface-container-high p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface">Informações da Frente</span>
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
          </div>

          <div className="p-3 bg-surface border border-surface-container-high space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase text-secondary text-[11px]">Progresso Estrutural</span>
              <span className="font-mono font-bold text-primary">75% Concluído</span>
            </div>
            <div className="w-full bg-surface-container-high h-2 overflow-hidden">
              <div className="bg-primary h-2 w-3/4"></div>
            </div>

            <div className="p-2.5 bg-primary-container text-on-primary-fixed text-xs space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider block">Próximo Marco Crítico</span>
              <p className="font-bold">Concretagem amanhã às 07:00</p>
              <p className="text-[11px]">Volume: 90 m³ (Fck 35 MPa)</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface block">
              Integrantes Ativos ({currentChannel.unreadCount + 4})
            </span>
            <div className="space-y-1.5">
              <div className="p-2 bg-surface flex items-center justify-between border border-surface-container-high">
                <span className="font-semibold text-on-surface">Eng. Ricardo Souza (Você)</span>
                <span className="text-[10px] text-tertiary font-bold">Online</span>
              </div>
              <div className="p-2 bg-surface flex items-center justify-between border border-surface-container-high">
                <span className="font-medium text-on-surface">Mestre Valdir</span>
                <span className="text-[10px] text-tertiary font-bold">Online</span>
              </div>
              <div className="p-2 bg-surface flex items-center justify-between border border-surface-container-high">
                <span className="font-medium text-on-surface">Téc. Marcos Silva</span>
                <span className="text-[10px] text-tertiary font-bold">Online</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
