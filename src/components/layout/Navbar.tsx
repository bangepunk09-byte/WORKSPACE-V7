import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Moon,
  Sun,
  ShieldCheck,
  UserCheck,
  Briefcase,
  ChevronDown,
  CheckCircle2,
  Calendar,
  FileText,
  MessageSquare,
  CheckSquare,
  Menu,
  X,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ThemeToggle } from '../common/ThemeToggle';

interface NavbarProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const {
    currentUser,
    setCurrentUser,
    users,
    themeSettings,
    updateThemeSettings,
    notifications,
    unreadNotificationsCount,
    markAsRead,
    markAllAsRead,
    setActiveTab,
    setIsQuickSearchOpen,
    setQuickActionModal,
    workspaceInfo,
    logout,
    toggleRightNotifications
  } = useWorkspace();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRolePickerOpen, setIsRolePickerOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const rolePickerRef = useRef<HTMLDivElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (rolePickerRef.current && !rolePickerRef.current.contains(e.target as Node)) {
        setIsRolePickerOpen(false);
      }
      if (quickActionRef.current && !quickActionRef.current.contains(e.target as Node)) {
        setIsQuickActionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', bg: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800' };
      case 'admin':
        return { label: 'Admin', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
      case 'manager':
        return { label: 'Manager', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      default:
        return { label: 'Employee', bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
    }
  };

  const roleBadge = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Left section: mobile hamburger & search trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Global Search Button - Friendly Pill Shape (Matching image_00e3de8a.png) */}
        <button
          onClick={() => setIsQuickSearchOpen(true)}
          className="flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-slate-100/70 px-4 py-2 text-xs text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700/80 sm:w-80 md:w-96 shadow-2xs"
        >
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="hidden sm:inline truncate">Cari task, dokumen, pengumuman, rekan...</span>
          <span className="inline sm:hidden">Cari...</span>
          <kbd className="ml-auto hidden rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-200 shadow-2xs dark:border-slate-700 dark:bg-slate-900 sm:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section: actions, role switcher, notifications, profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Action Button - Uniform h-9 Rounded Pill */}
        <div className="relative" ref={quickActionRef}>
          <button
            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
            className="h-9 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 text-xs font-bold text-white shadow-2xs transition hover:bg-black active:scale-95 border border-slate-800 dark:bg-white dark:text-slate-900 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-red-500" />
            <span className="hidden sm:inline">Buat Baru</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-80" />
          </button>

          {isQuickActionOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Aksi Cepat
              </div>
              <button
                onClick={() => {
                  setQuickActionModal('task');
                  setIsQuickActionOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <span>Tugas / Task Baru</span>
              </button>

              <button
                onClick={() => {
                  setQuickActionModal('meeting');
                  setIsQuickActionOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <span>Jadwalkan Meeting</span>
              </button>

              <button
                onClick={() => {
                  setQuickActionModal('post');
                  setIsQuickActionOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <span>Buat Kiriman Feed</span>
              </button>

              <button
                onClick={() => {
                  setQuickActionModal('document');
                  setIsQuickActionOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <FileText className="h-4 w-4" />
                </div>
                <span>Unggah Dokumen SOP</span>
              </button>
            </div>
          )}
        </div>

        {/* Role Switcher Button - Uniform h-9 Height */}
        <div className="relative" ref={rolePickerRef}>
          <button
            onClick={() => setIsRolePickerOpen(!isRolePickerOpen)}
            title="Klik untuk beralih user & mencoba RBAC"
            className={`h-9 hidden md:inline-flex items-center justify-center gap-1.5 rounded-full border px-4 text-xs font-bold transition shadow-2xs cursor-pointer ${roleBadge.bg}`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{roleBadge.label}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </button>

          {isRolePickerOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Switch User (RBAC Preview)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pilih persona untuk mencoba hak akses peran berbeda.
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {users.map(u => {
                  const badge = getRoleBadge(u.role);
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setIsRolePickerOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                        isCurrent
                          ? 'bg-slate-100 dark:bg-slate-700/70 font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                      }`}
                    >
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium text-slate-800 dark:text-slate-100">
                          {u.name}
                        </div>
                        <div className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                          {u.position}
                        </div>
                      </div>
                      <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Theme mode toggle - Uniform h-9 w-9 */}
        <ThemeToggle className="h-9 w-9 !rounded-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80" />

        {/* Notification Center Trigger - Uniform h-9 w-9 */}
        <button
          onClick={() => {
            toggleRightNotifications();
            markAllAsRead();
          }}
          className="relative h-9 w-9 flex items-center justify-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
          aria-label="Buka Notifikasi"
          title="Notifikasi"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 pointer-events-none">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Profile Avatar & dropdown menu - Uniform h-9 */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="h-9 flex items-center gap-2 rounded-full p-1 border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 transition hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
              />
              <span
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                  currentUser.status === 'online'
                    ? 'bg-emerald-500'
                    : currentUser.status === 'busy'
                    ? 'bg-red-500'
                    : currentUser.status === 'in_meeting'
                    ? 'bg-purple-500'
                    : 'bg-amber-500'
                }`}
              />
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {currentUser.department.split('&')[0]}
              </div>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="border-b border-slate-100 p-3 dark:border-slate-700">
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {currentUser.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {currentUser.email}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <Briefcase className="h-3 w-3" />
                  {currentUser.position}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveTab('directory');
                    setIsUserMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <UserCheck className="h-4 w-4 text-slate-400" />
                  <span>Profil Karyawan Saya</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setIsUserMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <span>Pengaturan & Hak Akses (Admin)</span>
                </button>
              </div>

              <div className="border-t border-slate-100 p-1 dark:border-slate-700">
                <button
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
