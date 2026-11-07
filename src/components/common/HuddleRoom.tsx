import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Minimize2,
  Maximize2,
  Smile,
  Volume2,
  Users,
  Sparkles,
  MessageSquare,
  Check,
  Send,
  X,
  Layers,
  Radio
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { HuddleParticipant } from '../../types';

export const HuddleRoom: React.FC = () => {
  const {
    activeHuddle,
    endHuddle,
    toggleHuddleMinimize,
    toggleHuddleMic,
    toggleHuddleVideo,
    toggleHuddleScreenShare,
    sendHuddleReaction,
    currentUser
  } = useWorkspace();

  const [callDuration, setCallDuration] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const [showInCallChat, setShowInCallChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'System', text: 'Huddle dimulai. Mikrofon dan koneksi audio terenkripsi aktif.', time: 'Sekarang' }
  ]);

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Call timer
  useEffect(() => {
    if (!activeHuddle) return;
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeHuddle]);

  // Format call duration MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentParticipant = activeHuddle?.participants.find(p => p.id === currentUser.id);
  const isVideoOn = currentParticipant?.isVideoOn ?? false;
  const isMuted = currentParticipant?.isMuted ?? false;
  const isScreenSharing = currentParticipant?.isScreenSharing ?? false;

  // Handle webcam video stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (activeHuddle && isVideoOn) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then(s => {
          stream = s;
          setMediaStream(s);
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          // Camera permission denied or not available; fallback gracefully
          setMediaStream(null);
        });
    } else {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoOn, activeHuddle]);

  if (!activeHuddle) return null;

  // Trigger floating reaction animation
  const handleSendReaction = (emoji: string) => {
    sendHuddleReaction(emoji);
    const newEmoji = {
      id: Date.now() + Math.random(),
      emoji,
      left: Math.floor(Math.random() * 60) + 20
    };
    setFloatingEmojis(prev => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
    }, 2500);
  };

  const handleSendInCallChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      {
        sender: currentUser.name.split(' ')[0],
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
  };

  // FLOATING MINIMIZED PILL (Allows user to keep talking while browsing workspace)
  if (activeHuddle.isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full border border-slate-700 bg-slate-950/95 px-4 py-2.5 text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-tight truncate max-w-[140px]">
              {activeHuddle.title}
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              {formatDuration(callDuration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
          {/* Mic Toggle */}
          <button
            type="button"
            onClick={toggleHuddleMic}
            className={`rounded-full p-2 transition ${
              isMuted ? 'bg-red-600/90 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute Mikrofon' : 'Mute Mikrofon'}
          >
            {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          </button>

          {/* Video Toggle */}
          <button
            type="button"
            onClick={toggleHuddleVideo}
            className={`rounded-full p-2 transition ${
              isVideoOn ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title={isVideoOn ? 'Matikan Kamera' : 'Nyalakan Kamera'}
          >
            {isVideoOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
          </button>

          {/* Expand to Full Huddle */}
          <button
            type="button"
            onClick={toggleHuddleMinimize}
            className="rounded-full bg-slate-800 p-2 text-slate-200 hover:bg-slate-700 transition"
            title="Perbesar Layar Huddle"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>

          {/* End Call */}
          <button
            type="button"
            onClick={endHuddle}
            className="rounded-full bg-red-600 p-2 text-white hover:bg-red-700 transition"
            title="Tinggalkan Huddle"
          >
            <PhoneOff className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // EXPANDED HUDDLE ROOM MODAL / VIEW
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col h-full max-h-[92vh] w-full max-w-5xl rounded-[32px] bg-slate-900 border border-slate-800 text-white shadow-2xl overflow-hidden">
        {/* Floating Animated Emojis */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-30">
          {floatingEmojis.map(item => (
            <div
              key={item.id}
              style={{ left: `${item.left}%` }}
              className="absolute bottom-20 text-3xl sm:text-4xl animate-bounce"
            >
              {item.emoji}
            </div>
          ))}
        </div>

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {activeHuddle.title}
                </h3>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  LIVE HUDDLE
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="font-mono text-emerald-400 font-bold">{formatDuration(callDuration)}</span>
                <span>•</span>
                <span>{activeHuddle.participants.length} anggota bergabung</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleHuddleMinimize}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              title="Perkecil ke Widget Melayang"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={endHuddle}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-700 active:scale-95 transition"
            >
              <PhoneOff className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Main Content Area: Participant Grid + Optional In-Call Chat */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Participants Grid */}
          <div className={`flex-1 p-4 sm:p-6 overflow-y-auto ${showInCallChat ? 'hidden md:block' : ''}`}>
            <div
              className={`grid gap-4 h-full ${
                activeHuddle.participants.length === 1
                  ? 'grid-cols-1'
                  : activeHuddle.participants.length === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {activeHuddle.participants.map(participant => {
                const isMe = participant.id === currentUser.id;
                const hasVideo = isMe ? isVideoOn : participant.isVideoOn;
                const muted = isMe ? isMuted : participant.isMuted;
                const speaking = participant.isSpeaking;

                return (
                  <div
                    key={participant.id}
                    className={`relative flex flex-col items-center justify-center rounded-3xl bg-slate-950/70 border overflow-hidden p-6 transition-all ${
                      speaking
                        ? 'border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/50'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Live Video Feed or Animated Avatar Viewport */}
                    {hasVideo ? (
                      isMe && mediaStream ? (
                        <video
                          ref={userVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="absolute inset-0 h-full w-full object-cover rounded-3xl"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-950 via-slate-900 to-slate-950">
                          <img
                            src={participant.avatar}
                            alt={participant.name}
                            className="h-28 w-28 rounded-full object-cover ring-4 ring-sky-500/60 shadow-xl"
                          />
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center text-center z-10">
                        <div className="relative">
                          <img
                            src={participant.avatar}
                            alt={participant.name}
                            className={`h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover ring-4 transition ${
                              speaking ? 'ring-emerald-400 scale-105' : 'ring-slate-800'
                            }`}
                          />
                          {speaking && (
                            <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                              <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-white mt-4 flex items-center gap-1.5">
                          <span>{participant.name}</span>
                          {isMe && <span className="text-[10px] text-slate-400 font-normal">(Anda)</span>}
                        </h4>
                        <p className="text-[11px] text-slate-400">{participant.role}</p>
                      </div>
                    )}

                    {/* Participant Badge Overlay (Bottom Left) */}
                    <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-xl bg-slate-950/80 px-2.5 py-1 text-xs font-semibold backdrop-blur-xs border border-slate-800">
                      <span>{participant.name.split(' ')[0]}</span>
                      {muted ? (
                        <MicOff className="h-3.5 w-3.5 text-red-400" />
                      ) : (
                        <Mic className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* In-Call Quick Chat Drawer */}
          {showInCallChat && (
            <div className="w-full md:w-80 border-l border-slate-800 bg-slate-950/90 flex flex-col shrink-0">
              <div className="flex items-center justify-between p-3.5 border-b border-slate-800">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-sky-400" />
                  <span>Obrolan Huddle</span>
                </h4>
                <button
                  onClick={() => setShowInCallChat(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                {chatMessages.map((msg, i) => (
                  <div key={i} className="rounded-xl bg-slate-900 p-2.5 border border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-slate-300">{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="text-slate-200">{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendInCallChat} className="p-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Kirim catatan saat call..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  className="flex-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 border border-slate-800"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-500 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Control Dock (Zoom / Slack Huddle Style) */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              Bitrate: <strong className="text-emerald-400">128 kbps (HD)</strong>
            </span>
          </div>

          {/* Primary Controls */}
          <div className="flex items-center gap-3">
            {/* Mic Toggle */}
            <button
              type="button"
              onClick={toggleHuddleMic}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                isMuted
                  ? 'bg-red-600/90 text-white hover:bg-red-700'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-emerald-400" />}
              <span>{isMuted ? 'Muted' : 'Mic Aktif'}</span>
            </button>

            {/* Video Toggle */}
            <button
              type="button"
              onClick={toggleHuddleVideo}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                isVideoOn
                  ? 'bg-sky-600 text-white hover:bg-sky-500'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              <span>{isVideoOn ? 'Kamera ON' : 'Kamera OFF'}</span>
            </button>

            {/* Screen Share */}
            <button
              type="button"
              onClick={toggleHuddleScreenShare}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                isScreenSharing
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">{isScreenSharing ? 'Sharing...' : 'Bagi Layar'}</span>
            </button>

            {/* Reactions Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowReactions(!showReactions)}
                className="flex items-center gap-1.5 rounded-2xl bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition"
              >
                <Smile className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline">Reaksi</span>
              </button>

              {showReactions && (
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-2xl bg-slate-800 p-2 shadow-2xl border border-slate-700 z-50 animate-in fade-in zoom-in-95">
                  {['👍', '👏', '🔥', '❤️', '🚀', '🎉', '😂'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        handleSendReaction(emoji);
                        setShowReactions(false);
                      }}
                      className="text-2xl p-1.5 rounded-xl hover:bg-slate-700 transition hover:scale-125"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowInCallChat(!showInCallChat)}
              className={`rounded-2xl p-2.5 transition ${
                showInCallChat
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title="Buka Chat Dalam Huddle"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>

          {/* End Call Button */}
          <div>
            <button
              type="button"
              onClick={endHuddle}
              className="flex items-center gap-1.5 rounded-2xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 active:scale-95 transition shadow-lg"
            >
              <PhoneOff className="h-4 w-4" />
              <span className="hidden sm:inline">Akhiri Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
