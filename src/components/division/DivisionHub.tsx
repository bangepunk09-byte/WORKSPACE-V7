import React, { useState } from 'react';
import {
  Building2,
  Users,
  Kanban,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Lock,
  Plus,
  Video,
  Radio,
  FileCheck2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Check,
  X,
  FileText,
  ChevronRight,
  Send,
  Settings,
  Star,
  Pin,
  FolderOpen,
  Image as ImageIcon,
  Paperclip,
  MessageSquare,
  Trash2,
  Palette,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Task, TaskStatus, DivisionItem } from '../../types';

export interface DivisionTheme {
  id: string;
  name: string;
  gradient: string;
  previewBg: string;
  accentText: string;
}

export const UNIQUE_DIVISION_THEMES: DivisionTheme[] = [
  { id: 'royal-blue', name: 'Royal Blue Corporate', gradient: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 35%, #1e1b4b 100%)', previewBg: '#2563eb', accentText: 'text-blue-500' },
  { id: 'electric-indigo', name: 'Electric Indigo', gradient: 'linear-gradient(90deg, #4f46e5 0%, #4338ca 40%, #0f172a 100%)', previewBg: '#4f46e5', accentText: 'text-indigo-500' },
  { id: 'vibrant-purple', name: 'Vibrant Purple', gradient: 'linear-gradient(90deg, #9333ea 0%, #7e22ce 40%, #1e1b4b 100%)', previewBg: '#9333ea', accentText: 'text-purple-500' },
  { id: 'emerald-teal', name: 'Emerald Forest & Teal', gradient: 'linear-gradient(90deg, #059669 0%, #0d9488 45%, #064e3b 100%)', previewBg: '#059669', accentText: 'text-emerald-500' },
  { id: 'amber-sunset', name: 'Amber Sunset & Bronze', gradient: 'linear-gradient(90deg, #ea580c 0%, #d97706 45%, #451a03 100%)', previewBg: '#d97706', accentText: 'text-amber-500' },
  { id: 'crimson-ruby', name: 'Crimson Ruby', gradient: 'linear-gradient(90deg, #e11d48 0%, #be123c 40%, #18181b 100%)', previewBg: '#e11d48', accentText: 'text-rose-500' },
  { id: 'cyan-pacific', name: 'Pacific Cyan & Deep Sea', gradient: 'linear-gradient(90deg, #0891b2 0%, #0284c7 40%, #082f49 100%)', previewBg: '#0891b2', accentText: 'text-cyan-500' },
  { id: 'fuchsia-velvet', name: 'Fuchsia Velvet', gradient: 'linear-gradient(90deg, #c026d3 0%, #a21caf 40%, #3b0764 100%)', previewBg: '#c026d3', accentText: 'text-fuchsia-500' },
  { id: 'lime-aurora', name: 'Lime Aurora & Jade', gradient: 'linear-gradient(90deg, #65a30d 0%, #16a34a 45%, #14532d 100%)', previewBg: '#65a30d', accentText: 'text-lime-500' },
  { id: 'midnight-slate', name: 'Midnight Carbon & Steel', gradient: 'linear-gradient(90deg, #334155 0%, #1e293b 50%, #020617 100%)', previewBg: '#334155', accentText: 'text-slate-400' },
  { id: 'copper-warm', name: 'Warm Copper & Terracotta', gradient: 'linear-gradient(90deg, #c2410c 0%, #9a3412 45%, #292524 100%)', previewBg: '#c2410c', accentText: 'text-orange-500' },
  { id: 'rose-quartz', name: 'Rose Quartz & Berry', gradient: 'linear-gradient(90deg, #db2777 0%, #be185d 40%, #500724 100%)', previewBg: '#db2777', accentText: 'text-pink-500' },
  { id: 'sapphire-glacier', name: 'Sapphire & Glacier Blue', gradient: 'linear-gradient(90deg, #2563eb 0%, #06b6d4 50%, #0f172a 100%)', previewBg: '#06b6d4', accentText: 'text-sky-500' },
  { id: 'tropical-mint', name: 'Tropical Mint & Pine', gradient: 'linear-gradient(90deg, #10b981 0%, #047857 45%, #022c22 100%)', previewBg: '#10b981', accentText: 'text-teal-500' },
  { id: 'violet-night', name: 'Ultra Violet Cosmos', gradient: 'linear-gradient(90deg, #7c3aed 0%, #6d28d9 45%, #2e1065 100%)', previewBg: '#7c3aed', accentText: 'text-violet-500' }
];

export const getNextUniqueDivisionTheme = (existingDivisions: DivisionItem[]): DivisionTheme => {
  const usedIds = new Set(existingDivisions.map(d => d.color?.toLowerCase()));
  const usedGradients = new Set(existingDivisions.map(d => d.bannerGradient?.trim().toLowerCase()));

  // 1. Check presets
  const availablePreset = UNIQUE_DIVISION_THEMES.find(
    t => !usedIds.has(t.id.toLowerCase()) && !usedGradients.has(t.gradient.toLowerCase())
  );
  if (availablePreset) return availablePreset;

  // 2. Fallback to golden-ratio distinct HSL
  const count = existingDivisions.length;
  const hue = Math.round((count * 137.508) % 360);
  const hue2 = (hue + 32) % 360;
  return {
    id: `custom-hue-${hue}`,
    name: `Warna Generatif (${hue}°)`,
    gradient: `linear-gradient(90deg, hsl(${hue}, 85%, 45%) 0%, hsl(${hue2}, 80%, 38%) 45%, hsl(${(hue + 60) % 360}, 90%, 14%) 100%)`,
    previewBg: `hsl(${hue}, 85%, 45%)`,
    accentText: 'text-indigo-400'
  };
};

export const DivisionHub: React.FC = () => {
  const {
    currentUser,
    users,
    tasks,
    channels,
    divisions,
    addDivision,
    deleteDivision,
    updateDivision,
    setActiveTab,
    setActiveChannelId,
    setSelectedTaskGroup,
    setQuickActionModal,
    startHuddle,
    processTaskApproval,
    updateChannelSettings,
    toggleStarChannel,
    messages,
    togglePinMessage
  } = useWorkspace();

  const isSuperAdmin = currentUser.role === 'super_admin';

  // Find user's home division
  const userHomeDiv = divisions.find(d =>
    currentUser.department.toLowerCase().includes(d.departmentMatch.toLowerCase()) ||
    d.departmentMatch.toLowerCase().includes(currentUser.department.toLowerCase())
  ) || divisions[0] || {
    id: 'hrga',
    name: 'HRGA',
    departmentMatch: 'People Operations & Culture',
    leadName: 'Rina Wijaya',
    leadRole: 'Head of People Operations & HRGA',
    leadAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    color: 'royal-blue',
    bannerGradient: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 30%, #1e1b4b 100%)',
    description: 'Pusat operasional dan koordinasi tim HRGA.'
  };

  // Active selected division
  const [selectedDivId, setSelectedDivId] = useState<string>(userHomeDiv.id);
  const activeDiv = divisions.find(d => d.id === selectedDivId) || userHomeDiv;

  // STRICT ACCESS CHECK: Only members of this division or Super Admin can access!
  const hasAccess = isSuperAdmin || activeDiv.id === userHomeDiv.id;

  // Gradient Customizer Modal State
  const [showGradientModal, setShowGradientModal] = useState(false);
  const [customGradAngle, setCustomGradAngle] = useState('90deg');
  const [customGradColor1, setCustomGradColor1] = useState('#1d4ed8');
  const [customGradColor2, setCustomGradColor2] = useState('#2563eb');
  const [customGradColor3, setCustomGradColor3] = useState('#1e1b4b');
  const [customGradPreview, setCustomGradPreview] = useState('');
  const [gradientToast, setGradientToast] = useState<string | null>(null);

  const handleOpenCustomizeGradient = () => {
    const current = activeDiv.bannerGradient || 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 35%, #1e1b4b 100%)';
    setCustomGradPreview(current);
    setShowGradientModal(true);
  };

  const handleApplyPresetGradient = (gradient: string) => {
    setCustomGradPreview(gradient);
  };

  const handleBuildCustomGradient = (c1: string, c2: string, c3: string, angle: string) => {
    const grad = `linear-gradient(${angle}, ${c1} 0%, ${c2} 45%, ${c3} 100%)`;
    setCustomGradPreview(grad);
  };

  const handleSaveGradient = () => {
    if (!customGradPreview) return;
    updateDivision({
      ...activeDiv,
      bannerGradient: customGradPreview
    });
    setGradientToast(`Gradient background divisi ${activeDiv.name} berhasil diperbarui!`);
    setTimeout(() => setGradientToast(null), 3500);
    setShowGradientModal(false);
  };

  const handleRandomizeGradient = () => {
    const randomHue = Math.floor(Math.random() * 360);
    const c1 = `hsl(${randomHue}, 85%, 45%)`;
    const c2 = `hsl(${(randomHue + 30) % 360}, 80%, 40%)`;
    const c3 = `hsl(${(randomHue + 60) % 360}, 90%, 14%)`;
    const grad = `linear-gradient(${customGradAngle}, ${c1} 0%, ${c2} 45%, ${c3} 100%)`;
    setCustomGradPreview(grad);
  };

  // Add Division modal state
  const [showAddDivisionModal, setShowAddDivisionModal] = useState(false);
  const [newDivName, setNewDivName] = useState('');
  const [newDivDeptMatch, setNewDivDeptMatch] = useState('');
  const [newDivLeadName, setNewDivLeadName] = useState('');
  const [newDivLeadRole, setNewDivLeadRole] = useState('');
  const [newDivColor, setNewDivColor] = useState('royal-blue');
  const [newDivGradient, setNewDivGradient] = useState('');
  const [newDivDesc, setNewDivDesc] = useState('');
  const [divToDelete, setDivToDelete] = useState<DivisionItem | null>(null);

  // Helper to open Add Division modal with automatic unique color pre-generation
  const openAddDivisionModal = () => {
    const nextTheme = getNextUniqueDivisionTheme(divisions);
    setNewDivColor(nextTheme.id);
    setNewDivGradient(nextTheme.gradient);
    setShowAddDivisionModal(true);
  };

  // Modals state for group settings & media view
  const [showDivisionSettingsModal, setShowDivisionSettingsModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaTab, setMediaTab] = useState<'images' | 'docs' | 'pins'>('images');
  const [memberSearch, setMemberSearch] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');

  const handleDeleteDivision = (div: DivisionItem) => {
    if (divisions.length <= 1) {
      return;
    }
    setDivToDelete(div);
  };

  const handleCreateDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDivName.trim()) return;

    // Guaranteed unique theme generator
    const selectedTheme = UNIQUE_DIVISION_THEMES.find(t => t.id === newDivColor);
    const finalGradient = newDivGradient || selectedTheme?.gradient || getNextUniqueDivisionTheme(divisions).gradient;

    addDivision({
      name: newDivName.trim(),
      departmentMatch: newDivDeptMatch.trim() || newDivName.trim(),
      leadName: newDivLeadName.trim() || currentUser.name,
      leadRole: newDivLeadRole.trim() || 'Division Lead',
      leadAvatar: currentUser.avatar,
      color: newDivColor,
      bannerGradient: finalGradient,
      description: newDivDesc.trim() || `Pusat operasional dan koordinasi tim ${newDivName.trim()}.`
    });

    setNewDivName('');
    setNewDivDeptMatch('');
    setNewDivLeadName('');
    setNewDivLeadRole('');
    setNewDivDesc('');
    setShowAddDivisionModal(false);
  };

  // Find associated channel for this division
  const divisionChannel = channels.find(c =>
    c.id === `chn_${activeDiv.id}` ||
    c.name.toLowerCase().includes(activeDiv.id) ||
    c.dept?.toLowerCase() === activeDiv.id
  ) || channels.find(c => c.id === 'chn_general') || channels[0];

  const channelMessages = (divisionChannel && messages[divisionChannel.id]) || [];
  const channelImages = channelMessages.filter(m => !!m.imageUrl);
  const channelDocs = channelMessages.filter(m => m.attachments && m.attachments.length > 0);
  const channelPins = channelMessages.filter(
    m => m.isPinned || (divisionChannel?.pinnedMessageIds && divisionChannel.pinnedMessageIds.includes(m.id))
  );

  // Filter tasks for this division
  const divisionTasks = tasks.filter(t =>
    t.groupId === activeDiv.id ||
    t.assigneeDept.toLowerCase().includes(activeDiv.departmentMatch.toLowerCase())
  );

  // Pending approval tasks for this division
  const pendingApprovals = divisionTasks.filter(t => t.approvalRequest && t.approvalRequest.status === 'pending');

  // Stats
  const notStartedCount = divisionTasks.filter(t => t.status === 'not_started' || t.status === 'todo' || t.status === 'backlog').length;
  const inProgressCount = divisionTasks.filter(t => t.status === 'on_progress' || t.status === 'in_progress').length;
  const onReviewCount = divisionTasks.filter(t => t.status === 'on_review' || t.status === 'review').length;
  const doneCount = divisionTasks.filter(t => t.status === 'done').length;

  // Division team members
  const divisionMembers = users.filter(u =>
    u.department.toLowerCase().includes(activeDiv.departmentMatch.toLowerCase()) ||
    activeDiv.departmentMatch.toLowerCase().includes(u.department.toLowerCase())
  );

  const handleOpenDivisionBoard = () => {
    setSelectedTaskGroup(activeDiv.id);
    setActiveTab('tasks');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. DIVISION SELECTOR & ACCESS HEADER */}
      <div className="rounded-[32px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md">
              <Building2 className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Divisi Perusahaan
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {divisions.length} Divisi
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pusat operasional divisi, akses terisolasi per anggota, huddle tim, dan antrian approval.
              </p>
            </div>
          </div>

          {/* Quick Notice Badge & Add Division Button */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {isSuperAdmin ? (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-500/30 dark:text-amber-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Super Admin: Akses Seluruh Divisi</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-500/30 dark:text-blue-300">
                <Lock className="h-3.5 w-3.5" />
                <span>Divisi Anda: {userHomeDiv.name}</span>
              </span>
            )}

            <button
              type="button"
              onClick={openAddDivisionModal}
              className="flex items-center gap-1.5 rounded-2xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Divisi</span>
            </button>
          </div>
        </div>

        {/* Division Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100 dark:border-slate-800">
          {divisions.map(div => {
            const isUserHome = div.id === userHomeDiv.id;
            const isSelected = div.id === selectedDivId;
            const canSwitch = isSuperAdmin || isUserHome;

            return (
              <button
                key={div.id}
                type="button"
                onClick={() => setSelectedDivId(div.id)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 text-white shadow-md dark:bg-white dark:text-slate-900'
                    : canSwitch
                    ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800/80 dark:text-slate-200'
                    : 'bg-slate-50/50 text-slate-400 opacity-60 dark:bg-slate-800/40 cursor-not-allowed'
                }`}
              >
                <span>{div.name}</span>
                {isUserHome && (
                  <span className="rounded-full bg-sky-500 text-white px-1.5 py-0.2 text-[9px] font-bold">
                    Saya
                  </span>
                )}
                {!canSwitch && <Lock className="h-3 w-3 text-slate-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DIVISION DETAILS OR RESTRICTION GUARD */}
      {!hasAccess ? (
        <div className="rounded-[32px] border border-red-200 bg-red-50/60 p-8 sm:p-12 text-center dark:border-red-900/50 dark:bg-red-950/20 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-100 text-red-600 dark:bg-red-900/40">
            <Lock className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Akses Terbatas: Bukan Anggota Divisi {activeDiv.name}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            Sesuai kebijakan keamanan perusahaan, Task Management dan dokumen kerja internal hanya dapat diakses oleh anggota divisi yang bersangkutan (<strong>{userHomeDiv.name}</strong>). Hanya <strong>Super Admin</strong> yang memiliki otorisasi penuh lintas seluruh divisi.
          </p>
          <button
            type="button"
            onClick={() => setSelectedDivId(userHomeDiv.id)}
            className="rounded-2xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-black transition cursor-pointer"
          >
            Beralih ke Divisi Saya ({userHomeDiv.name})
          </button>
        </div>
      ) : (
        <>
          {/* Gradient updated toast banner */}
          {gradientToast && (
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{gradientToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setGradientToast(null)}
                className="text-xs font-bold hover:underline cursor-pointer opacity-75 hover:opacity-100"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Active Division Banner Card */}
          <div
            className={`relative overflow-hidden rounded-[32px] p-6 sm:p-8 text-white shadow-lg ${
              !activeDiv.bannerGradient?.startsWith('linear-gradient') ? `bg-linear-to-r ${activeDiv.bannerGradient}` : ''
            }`}
            style={activeDiv.bannerGradient?.startsWith('linear-gradient') ? { background: activeDiv.bannerGradient } : undefined}
          >
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {activeDiv.name}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {activeDiv.description}
                </p>
              </div>

              {/* Quick Actions inside Banner */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {/* Star division channel */}
                <button
                  type="button"
                  onClick={() => divisionChannel && toggleStarChannel(divisionChannel.id)}
                  className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5 text-xs font-bold backdrop-blur-md transition cursor-pointer ${
                    divisionChannel?.isStarred
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title={divisionChannel?.isStarred ? 'Hapus Bintang' : 'Beri Bintang Favorit'}
                >
                  <Star className={`h-4 w-4 ${divisionChannel?.isStarred ? 'fill-slate-950' : ''}`} />
                  <span>{divisionChannel?.isStarred ? 'Favorit ★' : 'Star'}</span>
                </button>

                {/* Customize Division Gradient Button */}
                <button
                  type="button"
                  onClick={handleOpenCustomizeGradient}
                  className="flex items-center gap-1.5 rounded-2xl bg-white/20 hover:bg-white/30 px-3.5 py-2.5 text-xs font-bold text-white backdrop-blur-md active:scale-95 transition cursor-pointer"
                  title="Kustomisasi Warna / Gradient Banner Divisi Ini"
                >
                  <Palette className="h-4 w-4 text-cyan-300" />
                  <span>Ubah Gradient</span>
                </button>

                {/* Division Group Settings */}
                <button
                  type="button"
                  onClick={() => setShowDivisionSettingsModal(true)}
                  className="flex items-center gap-1.5 rounded-2xl bg-white/20 px-3.5 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/30 active:scale-95 transition cursor-pointer"
                  title="Atur Member, Foto Profil & Deskripsi Divisi"
                >
                  <Settings className="h-4 w-4" />
                  <span>Pengaturan Grup</span>
                </button>

                {/* View Media & Attached Files */}
                <button
                  type="button"
                  onClick={() => setShowMediaModal(true)}
                  className="flex items-center gap-1.5 rounded-2xl bg-white/20 px-3.5 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/30 active:scale-95 transition cursor-pointer"
                  title="Lihat Media, Gambar & Dokumen Terlampir"
                >
                  <FolderOpen className="h-4 w-4 text-amber-300" />
                  <span>Media ({channelImages.length + channelDocs.length})</span>
                </button>

                {/* Start Division Live Huddle */}
                <button
                  type="button"
                  onClick={() => startHuddle(`Huddle Divisi: ${activeDiv.name}`, 'division', activeDiv.id, false)}
                  className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-slate-100 active:scale-95 transition cursor-pointer"
                >
                  <Video className="h-4 w-4 text-emerald-600" />
                  <span>Huddle Divisi</span>
                </button>

                {/* Open Division Board */}
                <button
                  type="button"
                  onClick={handleOpenDivisionBoard}
                  className="flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/30 active:scale-95 transition cursor-pointer"
                >
                  <Kanban className="h-4 w-4 text-sky-300" />
                  <span>Task Board</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                {/* Delete Division Action (available when more than 1 division exists) */}
                {divisions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteDivision(activeDiv)}
                    className="flex items-center gap-1.5 rounded-2xl bg-rose-500/80 hover:bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white backdrop-blur-md active:scale-95 transition cursor-pointer"
                    title={`Hapus Divisi ${activeDiv.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Hapus Divisi</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. DIVISION METRICS & STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                Not Started
              </span>
              <div className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {notStartedCount}
              </div>
              <span className="text-[10px] text-slate-400">Antrian tugas baru</span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                On Progress
              </span>
              <div className="mt-1 text-2xl font-bold text-sky-600 dark:text-sky-400">
                {inProgressCount}
              </div>
              <span className="text-[10px] text-slate-400">Sedang dikerjakan tim</span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                On Review / Approval
              </span>
              <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {onReviewCount}
              </div>
              <span className="text-[10px] text-slate-400">Menunggu evaluasi</span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                Done (Selesai)
              </span>
              <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {doneCount}
              </div>
              <span className="text-[10px] text-slate-400">Tugas terselesaikan</span>
            </div>
          </div>

          {/* 4. APPROVAL QUEUE FOR MANAGERS (Requested Feature) */}
          <div className="rounded-[32px] border border-amber-200/80 bg-amber-50/40 p-5 sm:p-6 shadow-xs dark:border-amber-900/40 dark:bg-amber-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Antrian Approval Manager Divisi ({pendingApprovals.length})
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Kartu yang diajukan untuk disetujui. Jika disetujui oleh seluruh Manager, kartu akan otomatis masuk ke kolom <strong>Done / Selesai</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenDivisionBoard}
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Lihat di Board</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-300/80 bg-white/70 p-6 text-center text-slate-400 dark:bg-slate-900/60 dark:border-amber-900/60">
                <Check className="h-6 w-6 mx-auto mb-1 text-emerald-500" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tidak Ada Tugas Menunggu Approval
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Semua kartu tugas di divisi {activeDiv.name} telah diproses.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map(task => {
                  const req = task.approvalRequest!;
                  const myApproval = req.requiredApprovals.find(a => a.managerId === currentUser.id);
                  const canIApprove = isSuperAdmin || myApproval !== undefined;

                  return (
                    <div
                      key={task.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-white bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md dark:bg-amber-950/60">
                            Menunggu Approval
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-[11px] text-slate-500">
                            Diajukan oleh: <strong>{req.requestedByName}</strong>
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {task.description}
                        </p>
                      </div>

                      {/* Approval Actions for Managers */}
                      <div className="flex items-center gap-2 shrink-0">
                        {(() => {
                          const isRequester = req.requestedBy === currentUser.id || task.reporterId === currentUser.id;

                          if (isRequester) {
                            return (
                              <span className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                                <Lock className="h-3.5 w-3.5" />
                                <span>Menunggu Manajer Lain (Pengaju)</span>
                              </span>
                            );
                          }

                          if (canIApprove) {
                            return (
                              <>
                                <button
                                  type="button"
                                  onClick={() => processTaskApproval(task.id, currentUser.id, 'declined', 'Perlu revisi sesuai catatan')}
                                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 transition cursor-pointer"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>Decline (Tolak)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => processTaskApproval(task.id, currentUser.id, 'approved', 'Disetujui untuk rilis final')}
                                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm active:scale-95 transition cursor-pointer"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Approve (Setujui → Done)</span>
                                </button>
                              </>
                            );
                          }

                          return (
                            <span className="text-xs text-slate-400 italic">
                              Menunggu Manager Terkait
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. DIVISION ROSTER & ACTIVE TEAM */}
          <div className="rounded-[32px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-sky-600" />
                <span>Anggota Resmi Divisi ({divisionMembers.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {divisionMembers.map(member => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-700"
                  />
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {member.name}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {member.position || member.role}
                    </p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* 6. MODAL PENGATURAN GRUP DIVISI */}
          {showDivisionSettingsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Pengaturan Grup: {activeDiv.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Atur foto profil grup divisi, anggota tim, dan status favorit.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDivisionSettingsModal(false)}
                    className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Division Avatar & Starred Row */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <img
                      src={editAvatarUrl || activeDiv.leadAvatar}
                      alt={activeDiv.name}
                      className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white dark:ring-slate-700 shadow-xs"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Avatar / Foto Profil Divisi
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {divisionMembers.length} Anggota Resmi Terdaftar
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => divisionChannel && toggleStarChannel(divisionChannel.id)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      divisionChannel?.isStarred
                        ? 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <Star className={`h-3.5 w-3.5 ${divisionChannel?.isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
                    <span>{divisionChannel?.isStarred ? 'Favorit ★' : 'Beri Bintang'}</span>
                  </button>
                </div>

                {/* Edit Photo Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    URL Foto Profil Divisi Baru
                  </label>
                  <input
                    type="url"
                    value={editAvatarUrl}
                    onChange={e => setEditAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Manage Division Members */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Kelola Anggota Divisi ({divisionMembers.length} Personel)
                    </label>
                    <span className="text-[10px] text-slate-400">Tambah atau sesuaikan personel</span>
                  </div>

                  <input
                    type="text"
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                    placeholder="Cari anggota tim..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />

                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {users
                      .filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase()))
                      .map(user => {
                        const isInDiv =
                          user.department.toLowerCase().includes(activeDiv.departmentMatch.toLowerCase()) ||
                          activeDiv.departmentMatch.toLowerCase().includes(user.department.toLowerCase());

                        return (
                          <div
                            key={user.id}
                            className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-800/40"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-7 w-7 rounded-full object-cover"
                              />
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                                  {user.name}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate block">
                                  {user.position} • {user.department}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`rounded-xl px-2.5 py-1 text-[11px] font-bold ${
                                isInDiv
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {isInDiv ? 'Anggota Aktif' : 'Divisi Lain'}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowDivisionSettingsModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (divisionChannel && editAvatarUrl.trim()) {
                        updateChannelSettings(divisionChannel.id, { avatar: editAvatarUrl.trim() });
                      }
                      setShowDivisionSettingsModal(false);
                    }}
                    className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-black dark:bg-white dark:text-slate-900 transition"
                  >
                    Simpan Pengaturan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 7. MODAL LIHAT MEDIA & BERKAS TERLAMPIR DIVISI */}
          {showMediaModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Media & Berkas Terlampir: {activeDiv.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Galeri foto, dokumen, dan pesan disematkan pada saluran divisi.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMediaModal(false)}
                    className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Tabs: Foto, Dokumen, Pinned */}
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setMediaTab('images')}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                      mediaTab === 'images'
                        ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    Foto Terlampir ({channelImages.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaTab('docs')}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                      mediaTab === 'docs'
                        ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    Dokumen ({channelDocs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaTab('pins')}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                      mediaTab === 'pins'
                        ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    Pesan Disematkan ({channelPins.length})
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {mediaTab === 'images' && (
                    <div>
                      {channelImages.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-400">
                          Belum ada foto terlampir di divisi ini.
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {channelImages.map(img => (
                            <img
                              key={img.id}
                              src={img.imageUrl}
                              alt="Lampiran"
                              className="aspect-square rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-2xs"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {mediaTab === 'docs' && (
                    <div className="space-y-2">
                      {channelDocs.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-400">
                          Belum ada dokumen terlampir di divisi ini.
                        </div>
                      ) : (
                        channelDocs.flatMap(d => d.attachments || []).map((att, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40"
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
                                className="rounded-xl bg-slate-200 p-2 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 transition"
                              >
                                Unduh
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {mediaTab === 'pins' && (
                    <div className="space-y-2">
                      {channelPins.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-400">
                          Belum ada pesan yang disematkan (pinned) di divisi ini.
                        </div>
                      ) : (
                        channelPins.map(pinMsg => (
                          <div
                            key={pinMsg.id}
                            className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3 text-xs space-y-1 dark:border-amber-900/60 dark:bg-amber-950/30"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 text-[11px]">
                                <Pin className="h-3 w-3 rotate-45" />
                                <span>{pinMsg.senderName}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => divisionChannel && togglePinMessage(divisionChannel.id, pinMsg.id)}
                                className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer"
                              >
                                Lepas Pin
                              </button>
                            </div>
                            <p className="text-slate-800 dark:text-slate-200 text-xs">
                              {pinMsg.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (divisionChannel) {
                        setActiveChannelId(divisionChannel.id);
                        setActiveTab('chat');
                      }
                      setShowMediaModal(false);
                    }}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
                  >
                    Buka Obrolan Lengkap di Chat Divisi →
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 5. TAMBAH DIVISI BARU MODAL */}
      {showAddDivisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Tambah Divisi Baru
                  </h3>
                  <p className="text-xs text-slate-400">
                    Bentuk divisi kerja operasional baru di workspace
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDivisionModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDivision} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Divisi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Growth & Partnerships"
                  value={newDivName}
                  onChange={e => setNewDivName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/80 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nama Lead / Kepala Divisi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Dimas Aditya"
                    value={newDivLeadName}
                    onChange={e => setNewDivLeadName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Jabatan Lead
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: VP of Growth"
                    value={newDivLeadRole}
                    onChange={e => setNewDivLeadRole(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Warna Background Divisi (Otomatis & Unik)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = getNextUniqueDivisionTheme(divisions);
                      setNewDivColor(next.id);
                      setNewDivGradient(next.gradient);
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Generate Warna Baru</span>
                  </button>
                </div>

                {/* Live Preview of the Generated Unique Banner */}
                <div
                  className="mb-3 rounded-2xl p-3.5 text-white shadow-xs transition-all duration-300"
                  style={{
                    background:
                      newDivGradient ||
                      UNIQUE_DIVISION_THEMES.find(t => t.id === newDivColor)?.gradient ||
                      'linear-gradient(90deg, #1d4ed8 0%, #2563eb 30%, #1e1b4b 100%)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold tracking-tight">
                        {newDivName.trim() || 'Nama Divisi Baru'}
                      </div>
                      <div className="text-[10px] text-white/80">
                        {newDivDesc.trim() || 'Pusat operasional dan koordinasi tim.'}
                      </div>
                    </div>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold backdrop-blur-xs">
                      Warna Unik Terverifikasi ✓
                    </span>
                  </div>
                </div>

                {/* Palette Grid of Distinct Presets with Used Indicator */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  {UNIQUE_DIVISION_THEMES.map(theme => {
                    const isAlreadyUsed = divisions.some(
                      d => d.color?.toLowerCase() === theme.id.toLowerCase() || d.bannerGradient === theme.gradient
                    );
                    const isSelected = newDivColor === theme.id;

                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          setNewDivColor(theme.id);
                          setNewDivGradient(theme.gradient);
                        }}
                        className={`flex items-center gap-2 rounded-xl p-1.5 text-left text-xs transition cursor-pointer border ${
                          isSelected
                            ? 'border-blue-600 bg-white dark:bg-slate-800 shadow-xs ring-2 ring-blue-500/20'
                            : isAlreadyUsed
                            ? 'border-slate-200/50 bg-slate-100/50 dark:bg-slate-800/20 opacity-50'
                            : 'border-transparent bg-white/70 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span
                          className="h-4 w-4 shrink-0 rounded-full shadow-2xs border border-white/50"
                          style={{ background: theme.previewBg }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            {theme.name}
                          </div>
                          {isAlreadyUsed ? (
                            <span className="text-[9px] text-slate-400">Terpakai</span>
                          ) : (
                            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Tersedia</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Deskripsi & Tugas Pokok
                </label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan peran divisi, tugas strategis, dan lingkup kerja tim..."
                  value={newDivDesc}
                  onChange={e => setNewDivDesc(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/80 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDivisionModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition cursor-pointer"
                >
                  Simpan & Bentuk Divisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMIZE DIVISION GRADIENT MODAL */}
      {showGradientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Kustomisasi Gradient Banner Divisi
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Atur palet warna eksklusif untuk <strong className="text-slate-700 dark:text-slate-300">{activeDiv.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGradientModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* LIVE PREVIEW BANNER */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Live Preview Tampilan Banner</span>
                <span className="text-[11px] font-mono text-slate-400 lowercase truncate max-w-[280px]">
                  {customGradPreview}
                </span>
              </label>
              <div
                className="relative overflow-hidden rounded-2xl p-6 text-white shadow-md transition-all duration-300"
                style={{ background: customGradPreview }}
              >
                <div className="relative z-10 space-y-2">
                  <div className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-xs">
                    PREVIEW
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold tracking-tight drop-shadow-xs">
                    {activeDiv.name}
                  </h4>
                  <p className="text-xs text-white/85 max-w-md drop-shadow-xs">
                    {activeDiv.description || 'Pusat koordinasi & operasional divisi.'}
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <span className="rounded-xl bg-white px-3 py-1.5 text-[11px] font-bold text-slate-900 shadow-xs">
                      Huddle Divisi
                    </span>
                    <span className="rounded-xl bg-white/20 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-xs">
                      Task Board &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TAB 1: CURATED PRESETS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Pilihan Gradient Cepat (Presets)</span>
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeGradient}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Acak Harmoni Warna</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-2xl">
                {UNIQUE_DIVISION_THEMES.map(theme => {
                  const isCurrent = customGradPreview === theme.gradient;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleApplyPresetGradient(theme.gradient)}
                      className={`group flex items-center gap-2 p-2 rounded-xl text-left border transition cursor-pointer ${
                        isCurrent
                          ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30'
                          : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600'
                      }`}
                    >
                      <div
                        className="h-8 w-8 rounded-lg shrink-0 shadow-xs ring-1 ring-black/10 group-hover:scale-105 transition"
                        style={{ background: theme.gradient }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {theme.name}
                        </div>
                        <div className="text-[10px] text-slate-400">Pilih Preset</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB 2: CUSTOM MULTI-STOP BUILDER */}
            <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-indigo-500" />
                <span>Custom Racikan Warna (3-Stop Gradient)</span>
              </label>

              {/* Angle Direction */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                  Arah Gradient
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '90° (Horisontal)', val: '90deg' },
                    { label: '135° (Diagonal)', val: '135deg' },
                    { label: '180° (Vertikal)', val: '180deg' },
                    { label: '45° (Diagonal Atas)', val: '45deg' },
                  ].map(dir => (
                    <button
                      key={dir.val}
                      type="button"
                      onClick={() => {
                        setCustomGradAngle(dir.val);
                        handleBuildCustomGradient(customGradColor1, customGradColor2, customGradColor3, dir.val);
                      }}
                      className={`rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-center border transition cursor-pointer ${
                        customGradAngle === dir.val
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {dir.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Stop 1 */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Warna Utama (0%)
                  </span>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5">
                    <input
                      type="color"
                      value={customGradColor1}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomGradColor1(val);
                        handleBuildCustomGradient(val, customGradColor2, customGradColor3, customGradAngle);
                      }}
                      className="h-8 w-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={customGradColor1}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomGradColor1(val);
                        handleBuildCustomGradient(val, customGradColor2, customGradColor3, customGradAngle);
                      }}
                      className="w-full text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase bg-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Stop 2 */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Warna Aksen Tengah (45%)
                  </span>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5">
                    <input
                      type="color"
                      value={customGradColor2}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomGradColor2(val);
                        handleBuildCustomGradient(customGradColor1, val, customGradColor3, customGradAngle);
                      }}
                      className="h-8 w-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={customGradColor2}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomGradColor2(val);
                        handleBuildCustomGradient(customGradColor1, val, customGradColor3, customGradAngle);
                      }}
                      className="w-full text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase bg-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Stop 3 */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Warna Aksen Akhir (100%)
                  </span>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5">
                    <input
                      type="color"
                      value={customGradColor3}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomGradColor3(val);
                        handleBuildCustomGradient(customGradColor1, customGradColor2, val, customGradAngle);
                      }}
                      className="h-8 w-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={customGradColor3}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomGradColor3(val);
                        handleBuildCustomGradient(customGradColor1, customGradColor2, val, customGradAngle);
                      }}
                      className="w-full text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setShowGradientModal(false)}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveGradient}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition cursor-pointer"
              >
                <Palette className="h-4 w-4" />
                <span>Simpan & Terapkan ke Divisi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRM DELETE DIVISION MODAL (Bypass blocked window.confirm) */}
      {divToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Hapus Divisi Ini?
                </h3>
                <p className="text-xs text-slate-500">
                  Semua penugasan divisi ini akan dialihkan ke divisi utama.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block truncate">
                {divToDelete.name}
              </span>
              <span className="text-[11px] text-slate-500">
                Lead: {divToDelete.leadName} ({divToDelete.leadRole})
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDivToDelete(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDivision(divToDelete.id);
                  const remaining = divisions.filter(d => d.id !== divToDelete.id);
                  if (remaining.length > 0) {
                    setSelectedDivId(remaining[0].id);
                  }
                  setDivToDelete(null);
                }}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-95 transition cursor-pointer"
              >
                Ya, Hapus Divisi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
