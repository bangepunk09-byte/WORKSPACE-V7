import React from 'react';
import {
  LayoutDashboard,
  MessageSquareText,
  MessagesSquare,
  Kanban,
  CalendarDays,
  FileText,
  Users,
  Bell,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Circle,
  Layers,
  Sparkles,
  Building2,
  FolderGit2,
  Database
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AvailabilityStatus } from '../../types';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    themeSettings,
    updateThemeSettings,
    currentUser,
    updateUserStatus,
    tasks,
    notifications,
    channels,
    workspaceInfo,
    toggleRightNotifications,
    markAllAsRead,
    setIsDbHubOpen,
    divisions,
    setSelectedTaskGroup
  } = useWorkspace();

  const isCollapsed = themeSettings.sidebarCollapsed;

  // Unread badge calculations
  const urgentTasksCount = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length;
  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const unreadChatCount = channels.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'feed',
      label: 'Social Feed',
      icon: MessageSquareText,
      badge: { text: 'New', color: 'bg-red-500 text-white' }
    },
    {
      id: 'chat',
      label: 'Chat & Messaging',
      icon: MessagesSquare,
      badge: unreadChatCount > 0 ? { text: String(unreadChatCount), color: 'bg-red-600 text-white' } : null
    },
    {
      id: 'tasks',
      label: 'Task Management',
      icon: Kanban,
      badge: urgentTasksCount > 0 ? { text: `${urgentTasksCount} Urgent`, color: 'bg-red-500 text-white' } : null
    },
    {
      id: 'division',
      label: 'Divisi Perusahaan',
      icon: Building2,
      badge: null
    },
    {
      id: 'meetings',
      label: 'Meeting & Schedule',
      icon: CalendarDays,
      badge: null
    },
    {
      id: 'documents',
      label: 'Company Documents',
      icon: FileText,
      badge: null
    },
    {
      id: 'drive',
      label: 'Brand Google Drive',
      icon: FolderGit2,
      badge: { text: 'Enterprise', color: 'bg-blue-600 text-white' }
    },
    {
      id: 'directory',
      label: 'Employee Directory',
      icon: Users,
      badge: null
    },
    {
      id: 'admin',
      label: 'Admin & Customization',
      icon: ShieldCheck,
      badge: currentUser.role === 'super_admin' ? { text: 'Super', color: 'bg-slate-900 text-white border border-slate-700 dark:bg-red-950 dark:text-red-300' } : null
    }
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  const statusOptions: { value: AvailabilityStatus; label: string; color: string }[] = [
    { value: 'online', label: 'Online', color: 'text-emerald-500 fill-emerald-500' },
    { value: 'in_meeting', label: 'In Meeting', color: 'text-purple-500 fill-purple-500' },
    { value: 'busy', label: 'Busy (Fokus)', color: 'text-red-500 fill-red-500' },
    { value: 'away', label: 'Away (Istirahat)', color: 'text-amber-500 fill-amber-500' }
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto bg-white text-slate-800 transition-colors duration-200 dark:bg-slate-900 dark:text-slate-100">
      {/* Brand Header */}
      <div>
        {isCollapsed ? (
          <div className="flex flex-col items-center justify-center gap-2 border-b border-slate-200/80 px-2 py-4 transition-colors dark:border-slate-800/80">
            <div
              className="flex items-center justify-center cursor-pointer group"
              onClick={() => handleNavClick('dashboard')}
              title={workspaceInfo.name || 'ASLI GROUP HUB'}
            >
              {workspaceInfo.logoUrl ? (
                <img
                  src={workspaceInfo.logoUrl}
                  alt={workspaceInfo.name}
                  className="h-10 w-10 shrink-0 rounded-2xl object-cover ring-2 ring-slate-200 shadow-sm dark:ring-slate-700 transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-md ring-2 ring-slate-800 transition-transform group-hover:scale-105 dark:bg-white dark:text-slate-950">
                  <Layers className="h-5 w-5" />
                </div>
              )}
            </div>
            {/* Desktop collapse expand button below logo */}
            <button
              onClick={() => updateThemeSettings({ sidebarCollapsed: false })}
              className="hidden rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white md:flex items-center justify-center transition"
              title="Perluas sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-4.5 transition-colors dark:border-slate-800/80">
            <div
              className="flex items-center gap-3 overflow-hidden cursor-pointer group min-w-0"
              onClick={() => handleNavClick('dashboard')}
            >
              {workspaceInfo.logoUrl ? (
                <img
                  src={workspaceInfo.logoUrl}
                  alt={workspaceInfo.name}
                  className="h-10 w-10 shrink-0 rounded-2xl object-cover ring-2 ring-slate-200 shadow-sm dark:ring-slate-700 transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-md ring-2 ring-slate-800 transition-transform group-hover:scale-105 dark:bg-white dark:text-slate-950">
                  <Layers className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold tracking-tight text-slate-950 font-sans dark:text-white uppercase truncate">
                    {workspaceInfo.name || 'ASLI GROUP'}
                  </span>
                  <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700 border border-red-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800/60 shrink-0">
                    HUB
                  </span>
                </div>
                <p className="truncate text-xs text-slate-500 font-medium dark:text-slate-400">
                  {workspaceInfo.tagline || 'Corporate Internal Platform'}
                </p>
              </div>
            </div>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => updateThemeSettings({ sidebarCollapsed: true })}
              className="hidden rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white md:block transition shrink-0 ml-1"
              title="Ciutkan sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation items */}
        <nav className="space-y-1 p-3">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <React.Fragment key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950 font-bold border border-slate-900 dark:border-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-red-400 dark:text-red-600' : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'
                    }`}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-xs ${item.badge.color}`}>
                          {item.badge.text}
                        </span>
                      )}
                    </>
                  )}
                </button>


              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* User Status & Quick Card */}
      <div className="border-t border-slate-200/80 p-3 dark:border-slate-800 transition-colors">
        {!isCollapsed ? (
          <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/60 dark:bg-slate-800/70 dark:border-slate-800/60 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-900 ${
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
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                  {currentUser.name}
                </div>
                <div className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                  {currentUser.position}
                </div>
              </div>
            </div>

            {/* Quick status selector */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Status Ketersediaan
              </label>
              <select
                value={currentUser.status}
                onChange={e => updateUserStatus(e.target.value as AvailabilityStatus)}
                className="w-full rounded-xl bg-white px-2 py-1.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-red-500 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 font-medium"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Modern Database Hub trigger */}
            <button
              onClick={() => {
                setIsDbHubOpen(true);
                onCloseMobile();
              }}
              className="mt-2.5 flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-slate-100/70 p-2 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/40 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-emerald-800 transition"
              title="Buka Pusat Basis Data Modern"
            >
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-bold">Basis Data Modern</span>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-2">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                title={`${currentUser.name} - ${currentUser.status}`}
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                  currentUser.status === 'online'
                    ? 'bg-emerald-500'
                    : currentUser.status === 'busy'
                    ? 'bg-red-500'
                    : 'bg-amber-500'
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 z-20 shadow-xs ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (offcanvas) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
