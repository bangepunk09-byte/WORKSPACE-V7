import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Hash,
  Lock,
  Plus,
  Search,
  Phone,
  Video,
  ChevronLeft,
  CheckCheck,
  Play,
  Pause,
  X,
  Users,
  Sparkles,
  SmilePlus,
  Check,
  UserPlus,
  Image as ImageIcon,
  Pin,
  Star,
  CheckSquare,
  ThumbsUp,
  ThumbsDown,
  Settings,
  FileText,
  Download,
  ExternalLink,
  AlertCircle,
  UploadCloud,
  ChevronRight,
  FolderOpen,
  Camera,
  Upload,
  BadgeCheck,
  ShieldCheck,
  Trash2,
  LogOut,
  Crown,
  Edit2
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Channel, ChatMessage, StickerData, Task, Attachment } from '../../types';

// Pre-made corporate sticker templates
const DEFAULT_PRESET_STICKERS: StickerData[] = [
  { id: 'stk_1', emoji: '🚀', text: 'Siap Laksanakan!', style: 'neon' },
  { id: 'stk_2', emoji: '✅', text: 'Approved & Done!', style: 'emerald' },
  { id: 'stk_3', emoji: '🔥', text: 'Mantap Jiwa!', style: 'gold' },
  { id: 'stk_4', emoji: '⚠️', text: 'Perlu Review Segera', style: 'stamp' },
  { id: 'stk_5', emoji: '🛵', text: 'OTW Lapangan', style: 'cyan' },
  { id: 'stk_6', emoji: '⚡', text: 'Gaskeun Bro!', style: 'neon' },
  { id: 'stk_7', emoji: '💰', text: 'Closing Deal!', style: 'gold' },
  { id: 'stk_8', emoji: '☕', text: 'Ngopi Dulu Bentar', style: 'bubble' },
  { id: 'stk_9', emoji: '🎯', text: 'Target Tercapai!', style: 'emerald' },
  { id: 'stk_10', emoji: '💪', text: 'Kerja Keras Mantap', style: 'stamp' },
  { id: 'stk_11', emoji: '🏆', text: 'Top Performer!', style: 'gold' },
  { id: 'stk_12', emoji: '🤝', text: 'Sepakat & Deal', style: 'cyan' },
];

export const ChatMessaging: React.FC = () => {
  const {
    currentUser,
    users,
    tasks,
    channels,
    activeChannelId,
    setActiveChannelId,
    markChannelAsRead,
    messages,
    sendMessage,
    toggleReaction,
    createChannel,
    deleteChannel,
    leaveChannel,
    updateChannelSettings,
    toggleStarChannel,
    togglePinMessage,
    toggleStarMessage,
    processTaskApproval,
    startDirectMessage,
    startHuddle
  } = useWorkspace();

  const [messageText, setMessageText] = useState('');
  const [searchChannel, setSearchChannel] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'channels' | 'direct'>('all');
  const [isPlayingVoice, setIsPlayingVoice] = useState<string | null>(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showDmModal, setShowDmModal] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);

  // Sticker modal & maker state
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [stickerTab, setStickerTab] = useState<'presets' | 'create' | 'photo'>('presets');
  
  // Custom sticker studio state
  const [customStickerText, setCustomStickerText] = useState('KERJA KERAS 🚀');
  const [customStickerEmoji, setCustomStickerEmoji] = useState('🔥');
  const [customStickerStyle, setCustomStickerStyle] = useState<StickerData['style']>('neon');
  const [photoStickerFile, setPhotoStickerFile] = useState<string | null>(null);
  const [photoStickerCaption, setPhotoStickerCaption] = useState('');
  const photoStickerInputRef = useRef<HTMLInputElement>(null);

  const [userCreatedStickers, setUserCreatedStickers] = useState<StickerData[]>(() => {
    try {
      const saved = localStorage.getItem('WORKSPACE_CUSTOM_STICKERS');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // New channel / group creation form state
  const [newChanName, setNewChanName] = useState('');
  const [newChanDesc, setNewChanDesc] = useState('');
  const [newChanAvatar, setNewChanAvatar] = useState('');
  const [newChanPrivate, setNewChanPrivate] = useState(false);
  const [newChanMembers, setNewChanMembers] = useState<string[]>([]);
  const [newChanMemberSearch, setNewChanMemberSearch] = useState('');
  const newChanAvatarFileRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Group settings and Media drawer state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSearch, setInviteSearch] = useState('');
  const [selectedInviteIds, setSelectedInviteIds] = useState<string[]>([]);
  const [showMediaDrawer, setShowMediaDrawer] = useState(false);
  const [showAttachTaskModal, setShowAttachTaskModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mediaTab, setMediaTab] = useState<'images' | 'docs' | 'tasks'>('images');
  const [memberSearch, setMemberSearch] = useState('');

  // Edit channel form state inside settings modal
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [attachTaskCustomNote, setAttachTaskCustomNote] = useState('');

  // Current active channel
  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0] || {
    id: 'general',
    name: 'general-announcements',
    type: 'channel',
    memberIds: []
  };
  const currentMessages = (activeChannel && messages[activeChannel.id]) || [];

  // Pinned messages & Media collections for active channel
  const pinnedMessages = currentMessages.filter(
    m => m.isPinned || (activeChannel.pinnedMessageIds && activeChannel.pinnedMessageIds.includes(m.id))
  );
  const allImages = currentMessages.filter(m => !!m.imageUrl);
  const allDocs = currentMessages.filter(m => m.attachments && m.attachments.length > 0);
  const allAttachedTasks = currentMessages.filter(m => !!m.attachedTask);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, activeChannelId]);

  // Mark channel as read as soon as activeChannelId changes
  useEffect(() => {
    if (activeChannelId) {
      markChannelAsRead(activeChannelId);
    }
  }, [activeChannelId]);

  // Sync edit form with active channel
  useEffect(() => {
    if (activeChannel) {
      setEditName(activeChannel.name);
      setEditDesc(activeChannel.description || '');
      setEditAvatar(activeChannel.avatar || '');
    }
  }, [activeChannel.id]);

  // Persist custom stickers
  useEffect(() => {
    try {
      localStorage.setItem('WORKSPACE_CUSTOM_STICKERS', JSON.stringify(userCreatedStickers));
    } catch (e) {
      console.error('Error saving custom stickers:', e);
    }
  }, [userCreatedStickers]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessage(activeChannel.id, messageText);
    setMessageText('');
  };

  // REAL FILE UPLOAD HANDLER
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const ext = (file.name.split('.').pop() || 'pdf').toLowerCase();
    const mockBlobUrl = URL.createObjectURL(file);

    const getAttachmentType = (extension: string): 'pdf' | 'document' | 'image' | 'archive' => {
      if (extension === 'pdf') return 'pdf';
      if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(extension)) return 'image';
      if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive';
      return 'document';
    };

    sendMessage(
      activeChannel.id,
      `📎 Mengunggah dokumen: ${file.name}`,
      [
        {
          name: file.name,
          url: mockBlobUrl,
          type: getAttachmentType(ext),
          size: `${sizeMb === '0.0' ? (file.size / 1024).toFixed(0) + ' KB' : sizeMb + ' MB'}`
        }
      ]
    );
    if (e.target) e.target.value = '';
  };

  // REAL IMAGE UPLOAD HANDLER
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      sendMessage(
        activeChannel.id,
        `📷 Mengunggah foto: ${file.name}`,
        undefined,
        undefined,
        undefined,
        { imageUrl: dataUrl }
      );
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  // ATTACH CARD APPROVAL TO CHAT GROUP WITH CUSTOM MESSAGE
  const handleAttachTaskCard = (task: Task, customNote?: string) => {
    const textToSend = customNote?.trim() || messageText.trim() || `Mohon review dan persetujuan untuk tugas: ${task.title}`;
    sendMessage(
      activeChannel.id,
      textToSend,
      undefined,
      undefined,
      undefined,
      { attachedTask: task }
    );
    setMessageText('');
    setAttachTaskCustomNote('');
    setShowAttachTaskModal(false);
  };

  // REAL GROUP AVATAR FILE UPLOAD
  const handleGroupAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleSendSticker = (sticker: StickerData) => {
    sendMessage(activeChannel.id, '', undefined, undefined, sticker);
    setShowStickerModal(false);
  };

  const handleCreateAndSendCustomSticker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStickerText.trim()) return;

    const newSticker: StickerData = {
      id: 'stk_custom_' + Date.now(),
      text: customStickerText.trim(),
      emoji: customStickerEmoji,
      style: customStickerStyle,
      authorName: currentUser.name
    };

    // Save to user collection
    setUserCreatedStickers(prev => [newSticker, ...prev]);

    // Send to current channel
    sendMessage(activeChannel.id, '', undefined, undefined, newSticker);
    setShowStickerModal(false);
  };

  const handlePhotoStickerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoStickerFile(reader.result as string);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleSaveAndSendPhotoSticker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoStickerFile) return;

    const newPhotoSticker: StickerData = {
      id: 'stk_photo_' + Date.now(),
      imageUrl: photoStickerFile,
      type: 'custom_photo',
      style: 'custom_photo',
      text: photoStickerCaption.trim() || undefined,
      authorName: currentUser.name
    };

    setUserCreatedStickers(prev => [newPhotoSticker, ...prev]);
    handleSendSticker(newPhotoSticker);
    setPhotoStickerFile(null);
    setPhotoStickerCaption('');
  };

  const handleNewChanAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewChanAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleCreateChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChanName.trim()) return;
    createChannel(newChanName, newChanDesc, newChanPrivate, newChanMembers, undefined, {
      avatar: newChanAvatar.trim() || undefined,
      isOfficialDivision: false
    });
    setNewChanName('');
    setNewChanDesc('');
    setNewChanAvatar('');
    setNewChanPrivate(false);
    setNewChanMembers([]);
    setNewChanMemberSearch('');
    setShowChannelModal(false);
  };

  // Channels filtering
  const allFiltered = channels.filter(c => {
    if (channelFilter === 'channels' && c.type !== 'channel') return false;
    if (channelFilter === 'direct' && c.type !== 'direct') return false;
    return c.name.toLowerCase().includes(searchChannel.toLowerCase());
  });

  const getDirectUser = (channel: Channel) => {
    if (channel.type !== 'direct' || !channel.otherUserId) return null;
    return users.find(u => u.id === channel.otherUserId);
  };

  const directUser = getDirectUser(activeChannel);

  // Sticker visual style renderer
  const renderStickerBadge = (sticker: StickerData, isMe: boolean) => {
    // Real WhatsApp Photo Sticker rendering
    if (sticker.imageUrl || sticker.type === 'custom_photo') {
      return (
        <div className="group/sticker relative inline-flex flex-col items-center justify-center transition-transform duration-200 hover:scale-105 select-none my-1">
          <div className="relative rounded-2xl overflow-hidden p-1 bg-white/80 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 shadow-lg shadow-black/10 backdrop-blur-xs">
            <img
              src={sticker.imageUrl}
              alt={sticker.text || 'Stiker Foto'}
              className="h-32 w-32 sm:h-40 sm:w-40 object-contain rounded-xl drop-shadow-md"
            />
          </div>
          {sticker.text && (
            <span className="mt-1 text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-white/95 dark:bg-slate-800/95 px-2.5 py-0.5 rounded-full shadow-2xs border border-slate-200 dark:border-slate-700 max-w-[200px] truncate text-center">
              {sticker.text}
            </span>
          )}
          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium mt-0.5">
            <Sparkles className="h-2.5 w-2.5 text-amber-500" />
            <span>{sticker.authorName ? `Stiker Foto • by ${sticker.authorName.split(' ')[0]}` : 'Stiker WhatsApp'}</span>
          </div>
        </div>
      );
    }

    const styleClasses = {
      neon: 'from-violet-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30 border-violet-400/30 ring-2 ring-indigo-400/40',
      gold: 'from-amber-400 via-amber-500 to-yellow-600 text-slate-950 font-bold shadow-lg shadow-amber-500/25 border-yellow-200 ring-2 ring-amber-300',
      stamp: 'from-red-600 via-rose-600 to-red-700 text-white uppercase tracking-wider shadow-lg shadow-red-600/30 border-2 border-dashed border-red-200 ring-2 ring-red-400',
      emerald: 'from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/25 border-emerald-300/40 ring-2 ring-emerald-400/40',
      cyan: 'from-sky-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/25 border-cyan-300/40 ring-2 ring-cyan-400/40',
      bubble: 'from-pink-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-pink-500/25 border-pink-300/40 ring-2 ring-pink-400/40',
      custom_photo: 'from-slate-700 to-slate-900 text-white'
    };

    return (
      <div
        className={`group/sticker relative inline-flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-br px-5 py-3.5 transition-transform duration-200 hover:scale-105 select-none ${
          (sticker.style && styleClasses[sticker.style]) || styleClasses.neon
        }`}
      >
        <span className="text-3xl filter drop-shadow-sm transition-transform duration-200 group-hover/sticker:rotate-12 group-hover/sticker:scale-110">
          {sticker.emoji}
        </span>
        <span className="text-xs font-bold leading-tight text-center drop-shadow-xs max-w-[180px]">
          {sticker.text}
        </span>
        <div className="flex items-center gap-1 text-[9px] opacity-80 font-medium">
          <Sparkles className="h-2.5 w-2.5" />
          <span>{sticker.authorName ? `by ${sticker.authorName.split(' ')[0]}` : 'Stiker Tim'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      {/* Left Sidebar: Seamless Channel & DM Directory */}
      <div
        className={`flex w-full flex-col border-r border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/70 md:w-80 shrink-0 ${
          showMobileList ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Header & Quick Action Buttons */}
        <div className="border-b border-slate-200/80 p-3.5 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white shadow-xs">
                <Hash className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Chat & Diskusi
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowDmModal(true)}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                title="Kirim Pesan Langsung (DM)"
              >
                <UserPlus className="h-3 w-3 text-red-600" />
                <span>DM</span>
              </button>
              <button
                onClick={() => setShowChannelModal(true)}
                className="flex items-center gap-1 rounded-xl bg-red-600 px-2 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-red-700"
                title="Buat Saluran Baru"
              >
                <Plus className="h-3 w-3" />
                <span>Channel</span>
              </button>
            </div>
          </div>

          {/* Elongated Search Channel */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari obrolan atau rekan kerja..."
              value={searchChannel}
              onChange={e => setSearchChannel(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
            {searchChannel && (
              <button
                onClick={() => setSearchChannel('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Unified Filter Tabs: Semua, Channel, DM */}
          <div className="mt-2.5 flex items-center gap-1 rounded-xl bg-slate-200/60 p-0.5 dark:bg-slate-800/80">
            <button
              onClick={() => setChannelFilter('all')}
              className={`flex-1 rounded-lg py-1 text-[11px] font-semibold transition ${
                channelFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setChannelFilter('channels')}
              className={`flex-1 rounded-lg py-1 text-[11px] font-semibold transition ${
                channelFilter === 'channels'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Channels
            </button>
            <button
              onClick={() => setChannelFilter('direct')}
              className={`flex-1 rounded-lg py-1 text-[11px] font-semibold transition ${
                channelFilter === 'direct'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Pesan DM
            </button>
          </div>
        </div>

        {/* Unified Conversation Scroll Area */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {allFiltered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Tidak ada obrolan ditemukan.
            </div>
          ) : (
            allFiltered.map(c => {
              const isActive = c.id === activeChannel.id;
              const isDirect = c.type === 'direct';
              const user = isDirect ? getDirectUser(c) : null;

              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveChannelId(c.id);
                    markChannelAsRead(c.id);
                    setShowMobileList(false);
                  }}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-xs transition duration-150 ${
                    isActive
                      ? 'bg-red-50/90 text-red-700 shadow-2xs dark:bg-red-950/40 dark:text-red-300'
                      : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {isDirect ? (
                    <div className="relative shrink-0">
                      <img
                        src={user?.avatar || currentUser.avatar}
                        alt={c.name}
                        className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                          user?.status === 'online'
                            ? 'bg-emerald-500'
                            : user?.status === 'busy'
                            ? 'bg-red-500'
                            : 'bg-amber-500'
                        }`}
                      />
                    </div>
                  ) : c.avatar ? (
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="h-8 w-8 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                    />
                  ) : (
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
                        isActive
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-700'
                      }`}
                    >
                      {c.isPrivate ? (
                        <Lock className="h-3.5 w-3.5" />
                      ) : (
                        <Hash className="h-4 w-4" />
                      )}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`truncate font-semibold ${
                            isActive ? 'text-red-700 dark:text-red-300 font-bold' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {isDirect ? c.name : `#${c.name}`}
                        </span>
                        {c.isOfficialDivision && (
                          <span
                            className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 shrink-0"
                            title="Grup Resmi Divisi (Terverifikasi)"
                          >
                            <BadgeCheck className="h-3 w-3 text-blue-600 dark:text-blue-400 fill-blue-100 dark:fill-blue-900" />
                          </span>
                        )}
                      </div>
                      {c.lastMessageTime && (
                        <span className="shrink-0 text-[10px] text-slate-400">
                          {c.lastMessageTime}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {c.lastMessage || (isDirect ? user?.position : c.description) || 'Mulai obrolan...'}
                      </span>
                      {c.unreadCount ? (
                        <span className="shrink-0 rounded-full bg-red-600 px-1.5 py-0.2 text-[9px] font-bold text-white">
                          {c.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Conversation Stream */}
      <div
        className={`flex flex-1 flex-col overflow-hidden bg-slate-50/30 dark:bg-slate-950/40 ${
          showMobileList ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Chat Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setShowMobileList(true)}
              className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {activeChannel.type === 'channel' ? (
              <div
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                title="Klik untuk membuka Info Grup & Pengaturan WhatsApp"
              >
                {activeChannel.avatar ? (
                  <img
                    src={activeChannel.avatar}
                    alt={activeChannel.name}
                    className="h-10 w-10 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300 shrink-0 group-hover:bg-red-200 transition">
                    <Hash className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition">
                      #{activeChannel.name}
                    </span>
                    {activeChannel.isOfficialDivision ? (
                      <span
                        className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 shrink-0 shadow-2xs"
                        title="Divisi Resmi Terverifikasi"
                      >
                        <BadgeCheck className="h-3 w-3 text-blue-600 dark:text-blue-400 fill-blue-100 dark:fill-blue-900" />
                      </span>
                    ) : (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400 shrink-0">
                        Grup Tim
                      </span>
                    )}
                    {activeChannel.isPrivate && (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400 shrink-0">
                        Privat
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {activeChannel.memberIds?.length || 0} anggota
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={directUser?.avatar || currentUser.avatar}
                    alt={activeChannel.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                      directUser?.status === 'online'
                        ? 'bg-emerald-500'
                        : directUser?.status === 'busy'
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {activeChannel.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {directUser?.status === 'online' ? '● Online' : 'Sedang Sibuk'}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="truncate text-slate-500 dark:text-slate-400">
                      {directUser?.position || 'Anggota Tim'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Communication Actions, Media Drawer & Settings */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Star channel toggle */}
            <button
              type="button"
              onClick={() => toggleStarChannel(activeChannel.id)}
              className={`rounded-xl p-2 transition cursor-pointer ${
                activeChannel.isStarred
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={activeChannel.isStarred ? 'Hapus Bintang' : 'Beri Bintang Favorit'}
            >
              <Star className={`h-4 w-4 ${activeChannel.isStarred ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Media & Attachments Drawer Trigger */}
            <button
              type="button"
              onClick={() => setShowMediaDrawer(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
              title="Lihat Media & Dokumen Terlampir"
            >
              <FolderOpen className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden sm:inline">Media ({allImages.length + allDocs.length})</span>
            </button>

            {/* Group / Channel Settings */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Pengaturan Grup Divisi (Member, Foto, Deskripsi)"
            >
              <Settings className="h-4 w-4" />
            </button>

          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Pinned Messages Banner */}
          {pinnedMessages.length > 0 && (
            <div className="sticky top-0 z-20 mb-3 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/95 p-3 text-xs shadow-xs backdrop-blur-md dark:border-amber-900/60 dark:bg-amber-950/90 animate-in fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <Pin className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 rotate-45" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-900 dark:text-amber-300">
                      Pesan Disematkan ({pinnedMessages.length})
                    </span>
                    <span className="rounded-md bg-amber-200/60 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      Penting
                    </span>
                  </div>
                  <p className="truncate text-amber-800/90 dark:text-amber-200/90 text-[11px] mt-0.5">
                    {pinnedMessages[pinnedMessages.length - 1].content || 'Berkas / Kartu Terlampir'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => togglePinMessage(activeChannel.id, pinnedMessages[pinnedMessages.length - 1].id)}
                className="text-[10px] font-bold text-amber-700 hover:text-amber-900 dark:text-amber-300 underline shrink-0 cursor-pointer ml-2"
              >
                Lepas Pin
              </button>
            </div>
          )}

          {currentMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3">
                <Hash className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Belum ada percakapan di #{activeChannel.name}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Kirim pesan, unggah gambar/dokumen, atau lampirkan card tugas approval untuk memulai koordinasi tim!
              </p>
              <button
                onClick={() => {
                  setShowStickerModal(true);
                  setStickerTab('presets');
                }}
                className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-700"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Kirim Stiker Pembuka 🎉</span>
              </button>
            </div>
          ) : (
            currentMessages.map(msg => {
              const isMe = msg.senderId === currentUser.id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 group/msg ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                  )}

                  <div className={`max-w-[85%] sm:max-w-[72%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5">
                      {!isMe && (
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {msg.senderName}
                        </span>
                      )}
                      {msg.isPinned && (
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          <Pin className="h-2.5 w-2.5 rotate-45" />
                          <span>Pinned</span>
                        </span>
                      )}
                      {msg.isStarred && (
                        <span className="text-amber-500">
                          <Star className="h-3 w-3 fill-amber-500" />
                        </span>
                      )}
                    </div>

                    {/* Sticker Content Rendering with Pop Animation */}
                    {msg.sticker ? (
                      <div className={`my-1 ${isMe ? 'chat-bubble-animate-outgoing' : 'chat-bubble-animate-incoming'}`}>
                        {renderStickerBadge(msg.sticker, isMe)}
                      </div>
                    ) : (
                      <div
                        className={`relative rounded-2xl ${
                          msg.attachedTask ? 'p-4 sm:p-5 space-y-3' : 'px-4 py-2.5 space-y-1'
                        } text-xs shadow-2xs leading-relaxed transition-all ${
                          isMe
                            ? 'chat-bubble-outgoing rounded-tr-xs chat-bubble-animate-outgoing'
                            : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700/70 rounded-tl-xs chat-bubble-animate-incoming'
                        }`}
                      >
                        {/* Voice Note Player Mock */}
                        {msg.voiceNote && (
                          <div className="flex items-center gap-3 py-1">
                            <button
                              onClick={() =>
                                setIsPlayingVoice(isPlayingVoice === msg.id ? null : msg.id)
                              }
                              className={`flex h-8 w-8 items-center justify-center rounded-full transition shadow-xs ${
                                isMe ? 'bg-white text-slate-900' : 'bg-red-600 text-white'
                              }`}
                            >
                              {isPlayingVoice === msg.id ? (
                                <Pause className="h-3.5 w-3.5" />
                              ) : (
                                <Play className="h-3.5 w-3.5 ml-0.5" />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-1 h-4">
                                <span className="w-1 bg-current h-2 rounded-full animate-pulse" />
                                <span className="w-1 bg-current h-4 rounded-full" />
                                <span className="w-1 bg-current h-3 rounded-full" />
                                <span className="w-1 bg-current h-5 rounded-full" />
                                <span className="w-1 bg-current h-2 rounded-full" />
                                <span className="w-1 bg-current h-4 rounded-full" />
                              </div>
                              <span className="text-[10px] opacity-80">{msg.voiceNote.duration}</span>
                            </div>
                          </div>
                        )}

                        {/* Standard / Custom Text Message */}
                        {msg.content && (
                          <p className={`whitespace-pre-wrap ${msg.attachedTask ? 'font-semibold text-[13px] leading-snug px-0.5' : ''}`}>
                            {msg.content}
                          </p>
                        )}

                        {/* Image Preview Rendering */}
                        {msg.imageUrl && (
                          <div className="mt-2 overflow-hidden rounded-2xl">
                            <img
                              src={msg.imageUrl}
                              alt="Foto terlampir"
                              onClick={() => setPreviewImage(msg.imageUrl || null)}
                              className="max-h-64 w-full rounded-2xl object-cover hover:opacity-95 shadow-xs cursor-pointer transition"
                            />
                            <div className="mt-1 flex items-center justify-between text-[10px] opacity-75">
                              <span>Klik foto untuk memperbesar</span>
                            </div>
                          </div>
                        )}

                        {/* Task Card Approval Bubble (Harmonized with Chat Bubble Color & Balanced Margins) */}
                        {msg.attachedTask && (
                          <div
                            className={`mt-3 rounded-2xl border p-4 space-y-3 text-left transition ${
                              isMe
                                ? 'bg-black/25 border-white/20 text-white shadow-md backdrop-blur-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-900/90 dark:border-slate-700 dark:text-white shadow-xs'
                            }`}
                          >
                            <div className={`flex items-center justify-between gap-2 pb-2.5 ${isMe ? 'border-b border-white/15' : 'border-b border-slate-200 dark:border-slate-800'}`}>
                              <div className="flex items-center gap-1.5">
                                <CheckSquare className={`h-4 w-4 ${isMe ? 'text-amber-300' : 'text-amber-600 dark:text-amber-400'}`} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                  Task Card Approval
                                </span>
                              </div>
                              <span
                                className={`rounded-lg px-2.5 py-0.5 text-[9px] font-bold shadow-2xs ${
                                  msg.attachedTask.status === 'done'
                                    ? 'bg-emerald-400 text-slate-950'
                                    : 'bg-amber-300 text-slate-950'
                                }`}
                              >
                                {msg.attachedTask.status === 'done' ? 'DONE (APPROVED)' : 'ON REVIEW'}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-sm font-bold line-clamp-1">{msg.attachedTask.title}</h4>
                              <p className={`text-[11px] ${isMe ? 'text-white/85' : 'text-slate-600 dark:text-slate-300'} line-clamp-1`}>
                                {msg.attachedTask.project} • Assignee: <strong>{msg.attachedTask.assigneeName}</strong>
                              </p>
                              {msg.attachedTask.deadline && (
                                <p className={`text-[10px] ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                                  Deadline: {msg.attachedTask.deadline}
                                </p>
                              )}
                            </div>

                            {/* Manager Approval Buttons inside chat */}
                            <div className={`pt-2.5 flex items-center gap-2 ${isMe ? 'border-t border-white/15' : 'border-t border-slate-200 dark:border-slate-800'}`}>
                              {msg.attachedTask.status === 'done' ? (
                                <div className={`flex items-center gap-1.5 text-xs font-bold ${isMe ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                  <Check className="h-4 w-4" />
                                  <span>Card Telah Disetujui Penuh (Selesai/Done)</span>
                                </div>
                              ) : (() => {
                                const isRequester =
                                  currentUser.id === msg.senderId ||
                                  currentUser.id === msg.attachedTask?.approvalRequest?.requestedBy ||
                                  currentUser.id === msg.attachedTask?.reporterId;

                                if (isRequester) {
                                  return (
                                    <div className={`flex-1 rounded-xl px-3.5 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-1.5 ${
                                      isMe
                                        ? 'bg-black/20 border border-white/20 text-white/95'
                                        : 'bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300'
                                    }`}>
                                      <Lock className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                                      <span>Menunggu persetujuan rekan / manajer lain (Anda adalah pengaju kartu ini)</span>
                                    </div>
                                  );
                                }

                                return (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        processTaskApproval(
                                          msg.attachedTask!.id,
                                          currentUser.id,
                                          'declined',
                                          'Ditolak via chat grup'
                                        )
                                      }
                                      className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold text-center transition cursor-pointer ${
                                        isMe
                                          ? 'bg-white/20 hover:bg-white/30 border border-white/20 text-white'
                                          : 'bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-white'
                                      }`}
                                    >
                                      ✕ Tolak
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        processTaskApproval(
                                          msg.attachedTask!.id,
                                          currentUser.id,
                                          'approved',
                                          'Disetujui via chat grup'
                                        )
                                      }
                                      className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white py-2 px-3 text-xs font-bold text-center shadow-md transition cursor-pointer"
                                    >
                                      ✓ Setujui (Approve)
                                    </button>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Document Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.attachments.map((att, i) => (
                              <div
                                key={i}
                                className={`flex items-center justify-between rounded-xl p-2.5 text-[11px] ${
                                  isMe
                                    ? 'bg-red-700/60 text-white'
                                    : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Paperclip className="h-4 w-4 shrink-0 text-blue-300" />
                                  <div className="min-w-0">
                                    <span className="font-bold truncate block">{att.name}</span>
                                    <span className="text-[9px] opacity-75">{att.size}</span>
                                  </div>
                                </div>
                                {att.url && att.url !== '#' && (
                                  <a
                                    href={att.url}
                                    download={att.name}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-lg p-1.5 hover:bg-white/20 transition shrink-0"
                                    title="Unduh Berkas"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reactions, Pin, Star & Timestamp */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>Baru saja</span>
                      {isMe && <CheckCheck className="h-3 w-3 text-red-500" />}

                      {/* Reaction Badges */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex items-center gap-1">
                          {msg.reactions.map(r => (
                            <button
                              key={r.emoji}
                              onClick={() => toggleReaction(activeChannel.id, msg.id, r.emoji)}
                              className={`flex items-center gap-0.5 rounded-full border px-1.5 py-0.2 text-[10px] ${
                                r.userIds.includes(currentUser.id)
                                  ? 'border-red-400 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                                  : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800'
                              }`}
                            >
                              <span>{r.emoji}</span>
                              <span>{r.userIds.length}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Hover Actions: Pin & Star */}
                      <button
                        type="button"
                        onClick={() => togglePinMessage(activeChannel.id, msg.id)}
                        className="opacity-0 group-hover/msg:opacity-100 transition rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                        title={msg.isPinned ? 'Lepas Pin' : 'Sematkan Pesan (Pin)'}
                      >
                        <Pin className={`h-3 w-3 rotate-45 ${msg.isPinned ? 'text-amber-500' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleStarMessage(activeChannel.id, msg.id)}
                        className="opacity-0 group-hover/msg:opacity-100 transition rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                        title={msg.isStarred ? 'Hapus Bintang' : 'Beri Bintang Favorit'}
                      >
                        <Star className={`h-3 w-3 ${msg.isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>

                      {/* Quick Reactions on Hover */}
                      <button
                        onClick={() => toggleReaction(activeChannel.id, msg.id, '👍')}
                        className="opacity-0 group-hover/msg:opacity-100 transition rounded p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Tambah jempol"
                      >
                        👍
                      </button>
                      <button
                        onClick={() => toggleReaction(activeChannel.id, msg.id, '🔥')}
                        className="opacity-0 group-hover/msg:opacity-100 transition rounded p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Tambah api"
                      >
                        🔥
                      </button>
                      <button
                        onClick={() => toggleReaction(activeChannel.id, msg.id, '❤️')}
                        className="opacity-0 group-hover/msg:opacity-100 transition rounded p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Tambah hati"
                      >
                        ❤️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar with Real Upload and Task Card Approval Attach */}
        <form
          onSubmit={handleSend}
          className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shrink-0"
        >
          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleDocUpload}
          />
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            className="hidden"
            onChange={handleImageUpload}
          />

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Real Document Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Unggah Dokumen Nyata (PDF, DOCX, XLSX, ZIP)"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {/* Real Image Upload Button */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Unggah Foto / Gambar Nyata"
            >
              <ImageIcon className="h-4 w-4 text-emerald-600" />
            </button>

            {/* Attach Card Approval Button */}
            <button
              type="button"
              onClick={() => setShowAttachTaskModal(true)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Lampirkan Card Tugas untuk Approval Manager"
            >
              <CheckSquare className="h-4 w-4 text-amber-500" />
            </button>

            {/* Voice Note Button */}
            <button
              type="button"
              onClick={() =>
                sendMessage(activeChannel.id, '🎤 Pesan Suara (Voice Note)', undefined, {
                  duration: '0:24',
                  url: '#'
                })
              }
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              title="Kirim Pesan Suara (Voice Note)"
            >
              <Mic className="h-4 w-4" />
            </button>

            {/* Sticker Drawer Trigger */}
            <button
              type="button"
              onClick={() => setShowStickerModal(true)}
              className="flex items-center gap-1 rounded-xl p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/40 dark:hover:text-red-300 transition"
              title="Buka Stiker & Bikin Stiker Baru"
            >
              <SmilePlus className="h-4 w-4 text-red-600" />
            </button>

            <input
              type="text"
              placeholder={`Tulis pesan di #${activeChannel.name}...`}
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />

            <button
              type="submit"
              disabled={!messageText.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs transition hover:bg-red-700 disabled:opacity-40 shrink-0"
              title="Kirim Pesan"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* STICKER PICKER & MAKER STUDIO MODAL */}
      {showStickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Stiker Korporat & Pembuat Stiker
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Kirim stiker ekspresif atau rancang stiker custom khas tim kamu!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStickerModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Studio Navigation Tabs */}
            <div className="mt-3 flex items-center gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setStickerTab('presets')}
                className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition ${
                  stickerTab === 'presets'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Katalog
              </button>
              <button
                type="button"
                onClick={() => setStickerTab('create')}
                className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  stickerTab === 'create'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Stiker Teks</span>
              </button>
              <button
                type="button"
                onClick={() => setStickerTab('photo')}
                className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  stickerTab === 'photo'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Foto Stiker (WA)</span>
              </button>
            </div>

            {/* TAB 1: PRESET & SAVED STICKERS */}
            {stickerTab === 'presets' && (
              <div className="mt-4 max-h-[380px] overflow-y-auto pr-1 space-y-4">
                {/* User's custom made stickers */}
                {userCreatedStickers.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Stiker Buatanmu ({userCreatedStickers.length})</span>
                      <button
                        onClick={() => setUserCreatedStickers([])}
                        className="text-[10px] font-medium text-slate-400 hover:text-red-500"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {userCreatedStickers.map(stk => (
                        <button
                          key={stk.id}
                          onClick={() => handleSendSticker(stk)}
                          className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-3 hover:border-red-400 hover:bg-red-50/40 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-red-500/50 transition cursor-pointer"
                        >
                          {renderStickerBadge(stk, false)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular corporate presets */}
                <div>
                  <div className="mb-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    Stiker Siap Pakai
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {DEFAULT_PRESET_STICKERS.map(stk => (
                      <button
                        key={stk.id}
                        onClick={() => handleSendSticker(stk)}
                        className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 hover:border-red-400 hover:bg-red-50/30 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-red-500/50 transition cursor-pointer"
                      >
                        {renderStickerBadge(stk, false)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE STICKER MAKER STUDIO */}
            {stickerTab === 'create' && (
              <form onSubmit={handleCreateAndSendCustomSticker} className="mt-4 space-y-4">
                {/* Live Preview Display */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Pratinjau Hasil Stiker
                  </div>
                  {renderStickerBadge(
                    {
                      id: 'preview',
                      text: customStickerText || 'CONTOH TEKS STIKER',
                      emoji: customStickerEmoji,
                      style: customStickerStyle,
                      authorName: currentUser.name
                    },
                    true
                  )}
                </div>

                {/* Input Slogan / Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Teks Stiker (Slogan/Kata-kata)
                  </label>
                  <input
                    type="text"
                    maxLength={28}
                    placeholder="misal: ACC BOS 🌟 atau SIAP KAWAL!"
                    value={customStickerText}
                    onChange={e => setCustomStickerText(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                    <span>Maksimal 28 karakter untuk tampilan terbaik</span>
                    <span>{customStickerText.length}/28</span>
                  </div>
                </div>

                {/* Select Emoji */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pilih Emotikon Utama
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    {['🔥', '🚀', '✅', '⚡', '💡', '🎯', '💰', '🏆', '☕', '🛵', '💪', '🤝', '💯', '🦁', '⭐', '🍕'].map(
                      emo => (
                        <button
                          key={emo}
                          type="button"
                          onClick={() => setCustomStickerEmoji(emo)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg transition ${
                            customStickerEmoji === emo
                              ? 'bg-white shadow-xs scale-110 ring-2 ring-red-500 dark:bg-slate-700'
                              : 'hover:bg-white/60 dark:hover:bg-slate-700/60'
                          }`}
                        >
                          {emo}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Select Style Theme */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tema Gaya Visual
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'neon', label: 'Neon Cyber', color: 'bg-violet-600' },
                      { key: 'gold', label: 'Gold Luxury', color: 'bg-amber-500' },
                      { key: 'stamp', label: 'Red Stamp', color: 'bg-red-600' },
                      { key: 'emerald', label: 'Emerald OK', color: 'bg-emerald-600' },
                      { key: 'cyan', label: 'Cyan Sky', color: 'bg-cyan-600' },
                      { key: 'bubble', label: 'Pink Pop', color: 'bg-pink-600' }
                    ].map(styleOpt => (
                      <button
                        key={styleOpt.key}
                        type="button"
                        onClick={() => setCustomStickerStyle(styleOpt.key as StickerData['style'])}
                        className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition ${
                          customStickerStyle === styleOpt.key
                            ? 'border-red-500 bg-red-50/50 font-bold text-red-700 dark:border-red-400 dark:bg-red-950/40 dark:text-red-300 ring-1 ring-red-500'
                            : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <span className={`h-3 w-3 rounded-full ${styleOpt.color}`} />
                        <span className="truncate">{styleOpt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setStickerTab('presets')}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!customStickerText.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:scale-95 disabled:opacity-40"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Kirim & Simpan Stiker</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: WHATSAPP PHOTO STICKER MAKER */}
            {stickerTab === 'photo' && (
              <form onSubmit={handleSaveAndSendPhotoSticker} className="mt-4 space-y-4">
                <input
                  type="file"
                  ref={photoStickerInputRef}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handlePhotoStickerUpload}
                  className="hidden"
                />

                {photoStickerFile ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-300 bg-red-50/40 p-5 dark:border-red-900/60 dark:bg-red-950/20">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
                      Pratinjau Stiker WhatsApp
                    </div>

                    {renderStickerBadge(
                      {
                        id: 'photo_preview',
                        imageUrl: photoStickerFile,
                        type: 'custom_photo',
                        style: 'custom_photo',
                        text: photoStickerCaption || undefined,
                        authorName: currentUser.name
                      },
                      true
                    )}

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => photoStickerInputRef.current?.click()}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Ganti Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoStickerFile(null);
                          setPhotoStickerCaption('');
                        }}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      onClick={() => photoStickerInputRef.current?.click()}
                      className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center hover:border-red-500 hover:bg-red-50/30 transition cursor-pointer dark:border-slate-700 dark:bg-slate-800/40"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs group-hover:scale-110 transition dark:bg-slate-700">
                        <Camera className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="mt-3 text-xs font-bold text-slate-900 dark:text-white">
                        Pilih Foto untuk Dijadikan Stiker
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 max-w-xs">
                        Upload foto dari perangkat Anda (JPG, PNG, WebP). Akan otomatis diformat menjadi stiker WhatsApp interaktif!
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs">
                        Pilih dari Perangkat
                      </span>
                    </div>

                    {/* Quick Sample Photo Stickers */}
                    <div className="mt-3">
                      <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2">
                        Atau Coba Contoh Foto Cepat:
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            name: 'Team Thumbs Up',
                            url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&h=200&q=80'
                          },
                          {
                            name: 'Happy Coffee',
                            url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&h=200&q=80'
                          },
                          {
                            name: 'Victory Cheer',
                            url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80'
                          }
                        ].map((sample, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setPhotoStickerFile(sample.url);
                              setPhotoStickerCaption('MANTAP TIM! 🔥');
                            }}
                            className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-red-500 transition"
                          >
                            <img src={sample.url} alt={sample.name} className="h-full w-full object-cover group-hover:scale-110 transition" />
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-[9px] font-bold text-white text-center truncate px-1">
                              {sample.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Caption Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Caption Stiker (Opsional)
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="misal: MANTAP BOSKU! 👍 atau GASKEUN!"
                    value={photoStickerCaption}
                    onChange={e => setPhotoStickerCaption(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setStickerTab('presets');
                      setPhotoStickerFile(null);
                      setPhotoStickerCaption('');
                    }}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!photoStickerFile}
                    className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:scale-95 disabled:opacity-40 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Kirim & Simpan ke Koleksi</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* NEW DIRECT MESSAGE MODAL */}
      {showDmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Mulai Pesan Langsung (DM)
              </h3>
              <button
                onClick={() => setShowDmModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 max-h-64 overflow-y-auto space-y-1">
              {users
                .filter(u => u.id !== currentUser.id)
                .map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      startDirectMessage(user.id);
                      setShowDmModal(false);
                      setShowMobileList(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {user.position} • {user.department}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW GROUP MODAL (WHATSAPP STYLE) */}
      {showChannelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Buat Grup Tim Baru
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Grup mandiri untuk kolaborasi tim, squad project, atau hobi.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowChannelModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChannelSubmit} className="mt-4 space-y-4">
              {/* WhatsApp Avatar Selector */}
              <div className="flex flex-col items-center justify-center gap-2 py-1">
                <input
                  type="file"
                  ref={newChanAvatarFileRef}
                  accept="image/*"
                  onChange={handleNewChanAvatarUpload}
                  className="hidden"
                />
                <div
                  onClick={() => newChanAvatarFileRef.current?.click()}
                  className="group relative h-20 w-20 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-red-500 transition shadow-inner bg-slate-50 dark:bg-slate-800"
                  title="Klik untuk memilih foto profil grup"
                >
                  {newChanAvatar ? (
                    <img
                      src={newChanAvatar}
                      alt="Avatar Grup Baru"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-red-500">
                      <Camera className="h-6 w-6" />
                      <span className="text-[9px] font-semibold mt-1">Foto Grup</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                    <Camera className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => newChanAvatarFileRef.current?.click()}
                    className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    + Upload Foto dari Perangkat
                  </button>
                  {newChanAvatar && (
                    <button
                      type="button"
                      onClick={() => setNewChanAvatar('')}
                      className="text-[11px] text-slate-400 hover:text-red-500"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>

              {/* Group Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Grup <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">#</span>
                  <input
                    type="text"
                    placeholder="squad-peluncuran, ide-konten, futsal-asli"
                    value={newChanName}
                    onChange={e => setNewChanName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Group Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Deskripsi Grup (Opsional)
                </label>
                <textarea
                  placeholder="Jelaskan tujuan atau topik diskusi grup ini..."
                  value={newChanDesc}
                  onChange={e => setNewChanDesc(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Explanatory Info Card: Non-Verified Standalone Group */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong>Grup Mandiri:</strong> Grup yang dibuat di sini adalah grup bebas yang <em>tidak memiliki badge centang verified</em>. Saluran resmi divisi dengan badge centang resmi dibuat secara otomatis saat divisi baru ditambahkan di menu Divisi.
                  </div>
                </div>
              </div>

              {/* Select Initial Members */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Pilih Anggota Tim Awal ({newChanMembers.length} dipilih)
                  </label>
                  <span className="text-[10px] text-slate-400">Anda otomatis jadi Admin</span>
                </div>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-2.5 h-3 w-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari rekan kerja..."
                    value={newChanMemberSearch}
                    onChange={e => setNewChanMemberSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-slate-100 dark:border-slate-800 rounded-xl p-1.5 bg-slate-50/50 dark:bg-slate-850">
                  {users
                    .filter(u => u.id !== currentUser.id && u.name.toLowerCase().includes(newChanMemberSearch.toLowerCase()))
                    .map(u => {
                      const isSelected = newChanMembers.includes(u.id);
                      return (
                        <div
                          key={u.id}
                          onClick={() => {
                            if (isSelected) {
                              setNewChanMembers(prev => prev.filter(id => id !== u.id));
                            } else {
                              setNewChanMembers(prev => [...prev, u.id]);
                            }
                          }}
                          className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                            isSelected
                              ? 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold truncate block">{u.name}</span>
                              <span className="text-[9px] text-slate-400 truncate block">
                                {u.position} • {u.department}
                              </span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-red-600 focus:ring-red-500"
                          />
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Private Group Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="privCheck"
                  checked={newChanPrivate}
                  onChange={e => setNewChanPrivate(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <label htmlFor="privCheck" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Jadikan Grup Privat (Hanya anggota terdaftar yang bisa bergabung)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowChannelModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs cursor-pointer"
                >
                  Buat Grup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. ATTACH TASK CARD FOR APPROVAL MODAL */}
      {showAttachTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Lampirkan Card Tugas untuk Approval
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Pilih kartu tugas yang ingin diajukan ke grup #{activeChannel.name}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAttachTaskModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {tasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Tidak ada data tugas yang tersedia.
                </div>
              ) : (
                tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 hover:border-amber-400 hover:bg-amber-50/30 transition dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-amber-500/40"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-200 px-1.5 py-0.2 text-[9px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300 uppercase">
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">{task.project}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span>Assignee: {task.assigneeName}</span>
                        <span>•</span>
                        <span>Prioritas: {task.priority.toUpperCase()}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAttachTaskCard(task)}
                      className="shrink-0 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-600 transition cursor-pointer"
                    >
                      Lampirkan Card
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MEDIA & DOKUMEN TERLAMPIR DRAWER */}
      {showMediaDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white p-5 shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Media & Berkas Terlampir
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaDrawer(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Media Tabs */}
            <div className="flex items-center gap-1 my-3 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setMediaTab('images')}
                className={`flex-1 rounded-lg py-1 text-xs font-bold transition ${
                  mediaTab === 'images'
                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Foto ({allImages.length})
              </button>
              <button
                type="button"
                onClick={() => setMediaTab('docs')}
                className={`flex-1 rounded-lg py-1 text-xs font-bold transition ${
                  mediaTab === 'docs'
                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Dokumen ({allDocs.length})
              </button>
              <button
                type="button"
                onClick={() => setMediaTab('tasks')}
                className={`flex-1 rounded-lg py-1 text-xs font-bold transition ${
                  mediaTab === 'tasks'
                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Card ({allAttachedTasks.length})
              </button>
            </div>

            {/* Media Content Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {mediaTab === 'images' && (
                <div>
                  {allImages.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400">
                      Belum ada foto terlampir di obrolan ini.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      {allImages.map(imgMsg => (
                        <div
                          key={imgMsg.id}
                          onClick={() => setPreviewImage(imgMsg.imageUrl || null)}
                          className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer shadow-2xs"
                        >
                          <img
                            src={imgMsg.imageUrl}
                            alt="Lampiran"
                            className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                            Perbesar
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {mediaTab === 'docs' && (
                <div className="space-y-2">
                  {allDocs.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400">
                      Belum ada dokumen yang diunggah.
                    </div>
                  ) : (
                    allDocs.flatMap(d => d.attachments || []).map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Paperclip className="h-4 w-4 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                              {att.name}
                            </span>
                            <span className="text-[10px] text-slate-400">{att.size}</span>
                          </div>
                        </div>
                        {att.url && att.url !== '#' && (
                          <a
                            href={att.url}
                            download={att.name}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-slate-200 p-2 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 transition shrink-0"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {mediaTab === 'tasks' && (
                <div className="space-y-2.5">
                  {allAttachedTasks.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400">
                      Belum ada kartu tugas yang dilampirkan.
                    </div>
                  ) : (
                    allAttachedTasks.map(msg => {
                      const task = msg.attachedTask!;
                      return (
                        <div
                          key={msg.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 dark:border-slate-800 dark:bg-slate-800/50"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              {task.project}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                              task.status === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {task.status.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {task.title}
                          </h4>
                          <div className="text-[10px] text-slate-400">
                            Assignee: {task.assigneeName} • Deadline: {task.deadline}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. WHATSAPP-LIKE GROUP INFO & SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Info Grup
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Detail profil grup, admin, dan daftar peserta.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleStarChannel(activeChannel.id)}
                  className={`rounded-xl p-1.5 border transition cursor-pointer ${
                    activeChannel.isStarred
                      ? 'border-amber-300 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                  title={activeChannel.isStarred ? 'Hapus dari Favorit' : 'Beri Bintang Favorit'}
                >
                  <Star className={`h-4 w-4 ${activeChannel.isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Centered WhatsApp Group Profile Picture Hero */}
            <div className="flex flex-col items-center justify-center pt-2 pb-1 text-center">
              <input
                type="file"
                ref={avatarFileInputRef}
                accept="image/*"
                onChange={handleGroupAvatarUpload}
                className="hidden"
              />
              <div
                onClick={() => avatarFileInputRef.current?.click()}
                className="group relative h-24 w-24 rounded-full ring-4 ring-slate-100 dark:ring-slate-800 shadow-md cursor-pointer overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800"
                title="Ganti Foto Profil Grup"
              >
                {editAvatar || activeChannel.avatar ? (
                  <img
                    src={editAvatar || activeChannel.avatar}
                    alt={activeChannel.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-red-600 text-white">
                    <Hash className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition">
                  <Camera className="h-6 w-6" />
                  <span className="text-[9px] font-bold mt-0.5">Ubah Foto</span>
                </div>
              </div>

              {/* URL or Direct upload quick links */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Camera className="h-3 w-3" />
                  <span>Upload Foto</span>
                </button>
                {(editAvatar || activeChannel.avatar) && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditAvatar('');
                      updateChannelSettings(activeChannel.id, { avatar: undefined });
                    }}
                    className="text-[11px] text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>

              {/* Group Name & Inline Edit */}
              <div className="mt-3 flex items-center justify-center gap-2">
                {isEditingGroupName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      className="rounded-xl border border-red-500 px-3 py-1 text-sm font-bold text-slate-900 dark:text-white dark:bg-slate-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (editName.trim()) {
                          updateChannelSettings(activeChannel.id, { name: editName.trim() });
                          setIsEditingGroupName(false);
                        }
                      }}
                      className="rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditName(activeChannel.name);
                        setIsEditingGroupName(false);
                      }}
                      className="rounded-lg bg-slate-200 dark:bg-slate-700 p-1.5 text-slate-600 dark:text-slate-300"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      #{activeChannel.name}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditingGroupName(true)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                      title="Edit Nama Grup"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Verified Badge / Group Status */}
              <div className="mt-1 flex items-center justify-center gap-1.5">
                {activeChannel.isOfficialDivision ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 px-2.5 py-0.5 text-[10px] font-bold border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
                    <BadgeCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 fill-blue-100 dark:fill-blue-900" />
                    <span>✓ Divisi Resmi (Terverifikasi)</span>
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                    Grup Tim Mandiri (Bebas)
                  </span>
                )}
              </div>
            </div>

            {/* Group Description Box */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Deskripsi Grup
              </label>
              <textarea
                rows={2}
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                placeholder="Tambahkan deskripsi grup..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Members Section (WhatsApp style) */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {activeChannel.memberIds.length} Peserta
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedInviteIds([]);
                    setInviteSearch('');
                    setShowInviteModal(true);
                  }}
                  className="flex items-center gap-1 rounded-xl bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>+ Tambah Anggota</span>
                </button>
              </div>

              {/* Member Search filter */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3 w-3 text-slate-400" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  placeholder="Cari peserta dalam grup..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Members List */}
              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                {users
                  .filter(u => activeChannel.memberIds.includes(u.id) && u.name.toLowerCase().includes(memberSearch.toLowerCase()))
                  .map(member => {
                    const isAdmin = (activeChannel.adminIds || []).includes(member.id);
                    const isMe = member.id === currentUser.id;
                    const canManage = (activeChannel.adminIds || []).includes(currentUser.id) || currentUser.role === 'super_admin';

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {member.name} {isMe && '(Anda)'}
                              </span>
                              {isAdmin && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold shrink-0">
                                  <Crown className="h-2.5 w-2.5 text-emerald-600" />
                                  <span>Admin Grup</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {member.position} • {member.department}
                            </span>
                          </div>
                        </div>

                        {canManage && !isMe && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                const currentAdmins = activeChannel.adminIds || [];
                                const newAdmins = isAdmin
                                  ? currentAdmins.filter(id => id !== member.id)
                                  : [...currentAdmins, member.id];
                                updateChannelSettings(activeChannel.id, { adminIds: newAdmins });
                              }}
                              className={`rounded-lg px-2 py-1 text-[10px] font-bold transition cursor-pointer ${
                                isAdmin
                                  ? 'border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                              title={isAdmin ? 'Hapus status Admin' : 'Jadikan Admin Grup'}
                            >
                              {isAdmin ? 'Cabut Admin' : '+ Admin'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newMembers = activeChannel.memberIds.filter(id => id !== member.id);
                                const newAdmins = (activeChannel.adminIds || []).filter(id => id !== member.id);
                                updateChannelSettings(activeChannel.id, {
                                  memberIds: newMembers,
                                  adminIds: newAdmins
                                });
                              }}
                              className="rounded-lg p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                              title="Keluarkan dari grup"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Exit / Danger Actions (WhatsApp style) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Apakah Anda yakin ingin keluar dari grup #${activeChannel.name}?`)) {
                    leaveChannel(activeChannel.id);
                    setShowSettingsModal(false);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar dari Grup</span>
              </button>

              {((activeChannel.adminIds || []).includes(currentUser.id) || currentUser.role === 'super_admin') && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus permanen grup #${activeChannel.name}? Semua riwayat chat di grup ini akan dihapus.`)) {
                      deleteChannel(activeChannel.id);
                      setShowSettingsModal(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus Grup Ini</span>
                </button>
              )}
            </div>

            {/* Bottom Save Changes */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  updateChannelSettings(activeChannel.id, {
                    avatar: editAvatar.trim() || activeChannel.avatar,
                    description: editDesc.trim() || activeChannel.description
                  });
                  setShowSettingsModal(false);
                }}
                className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-black dark:bg-white dark:text-slate-900 transition cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL: INVITE / ADD MEMBERS TO ACTIVE GROUP (WHATSAPP STYLE) */}
      {showInviteModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tambah Peserta
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Pilih rekan kerja untuk diundang ke #{activeChannel.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau divisi rekan kerja..."
                value={inviteSearch}
                onChange={e => setInviteSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Available Users List */}
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {users
                .filter(u => !activeChannel.memberIds.includes(u.id) && (
                  u.name.toLowerCase().includes(inviteSearch.toLowerCase()) ||
                  u.department.toLowerCase().includes(inviteSearch.toLowerCase())
                ))
                .map(user => {
                  const isSelected = selectedInviteIds.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedInviteIds(prev => prev.filter(id => id !== user.id));
                        } else {
                          setSelectedInviteIds(prev => [...prev, user.id]);
                        }
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                        isSelected
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">{user.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {user.position} • {user.department}
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                    </div>
                  );
                })}
              {users.filter(u => !activeChannel.memberIds.includes(u.id)).length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  Semua rekan kerja sudah menjadi anggota grup ini.
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500">
                {selectedInviteIds.length} rekan dipilih
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={selectedInviteIds.length === 0}
                  onClick={() => {
                    const newMemberList = [...activeChannel.memberIds, ...selectedInviteIds];
                    updateChannelSettings(activeChannel.id, { memberIds: newMemberList });
                    sendMessage(
                      activeChannel.id,
                      `👋 ${currentUser.name} menambahkan ${selectedInviteIds.length} anggota baru ke dalam grup.`
                    );
                    setShowInviteModal(false);
                    setSelectedInviteIds([]);
                  }}
                  className="rounded-xl bg-red-600 disabled:opacity-50 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 shadow-xs transition cursor-pointer"
                >
                  Tambahkan ke Grup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. IMAGE LIGHTBOX PREVIEW */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Pratinjau Foto"
              className="max-h-[85vh] w-auto rounded-3xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 rounded-full bg-black/60 p-2 text-white hover:bg-black"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

