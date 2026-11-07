import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  MessageSquare,
  CheckSquare,
  Calendar,
  Megaphone,
  ChevronRight,
  ExternalLink,
  ChevronLeft,
  Sparkles,
  Radio
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { NotificationType, NotificationItem } from '../../types';

export const RightNotificationPanel: React.FC = () => {
  const {
    isRightNotificationOpen,
    setIsRightNotificationOpen,
    notifications,
    markAsRead,
    markAllAsRead,
    unreadNotificationsCount,
    setActiveTab,
    setActiveChannelId
  } = useWorkspace();

  const [filterType, setFilterType] = useState<string>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.read;
    return n.type === filterType;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="h-4 w-4 text-sky-500" />;
      case 'task':
        return <CheckSquare className="h-4 w-4 text-emerald-500" />;
      case 'meeting':
        return <Calendar className="h-4 w-4 text-amber-500" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    if (item.targetTab) {
      setActiveTab(item.targetTab);
    } else if (item.type === 'chat') {
      setActiveTab('chat');
    } else if (item.type === 'task') {
      setActiveTab('tasks');
    } else if (item.type === 'meeting') {
      setActiveTab('meetings');
    } else if (item.type === 'announcement') {
      setActiveTab('feed');
    }
  };

  if (!isRightNotificationOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity lg:hidden"
        onClick={() => setIsRightNotificationOpen(false)}
      />

      {/* Real-time Right Notification Column */}
      <aside
        aria-label="Notifikasi Real-Time"
        className="fixed lg:static right-0 top-0 bottom-0 z-50 lg:z-10 flex h-full w-full max-w-[340px] sm:max-w-[360px] lg:w-[340px] xl:w-[360px] flex-col border-l border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xl lg:shadow-none transition-all duration-300 dark:border-slate-800/90 dark:bg-slate-900/95 shrink-0"
      >
        {/* Panel Header with Real-Time Live status */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4.5 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs">
              <Bell className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Notifikasi
                </h3>
                {/* Live Real-Time Pulse Indicator */}
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Real-time workspace feed</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Tandai semua sudah dibaca"
              >
                <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[10px]">Baca</span>
              </button>
            )}

            <button
              onClick={() => setIsRightNotificationOpen(false)}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
              aria-label="Sembunyikan panel notifikasi"
              title="Sembunyikan panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Filter Categories */}
        <div className="border-b border-slate-100 p-2.5 pb-2 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto tab-slider-scroll pt-0.5 pb-2 px-0.5 text-xs">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'unread', label: unreadNotificationsCount > 0 ? `Unread (${unreadNotificationsCount})` : 'Unread' },
              { id: 'task', label: 'Tasks' },
              { id: 'chat', label: 'Pesan' },
              { id: 'meeting', label: 'Rapat' },
              { id: 'announcement', label: 'Info' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`rounded-xl px-2.5 py-1 text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-slate-950 text-white shadow-2xs dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-2.5">
                <Bell className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Semua Terbaca
              </h4>
              <p className="mt-1 text-[11px] text-slate-400 max-w-xs">
                Tidak ada notifikasi baru untuk kategori ini. Notifikasi baru akan langsung tampil di sini secara real-time.
              </p>
            </div>
          ) : (
            filteredNotifications.map(item => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`group relative flex items-start gap-3 rounded-2xl border p-3 transition cursor-pointer ${
                  !item.read
                    ? 'border-red-200/80 bg-red-50/30 shadow-xs dark:border-red-900/40 dark:bg-red-950/20 hover:border-red-400 dark:hover:border-red-700'
                    : 'border-slate-200/70 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                }`}
              >
                {/* Left Indicator or Avatar */}
                <div className="relative shrink-0 mt-0.5">
                  {item.senderAvatar ? (
                    <img
                      src={item.senderAvatar}
                      alt={item.senderName || 'Sender'}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                      {getIcon(item.type)}
                    </div>
                  )}

                  {!item.read && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </span>
                    <span className="text-[9px] font-medium text-slate-400 shrink-0">
                      {item.createdAt.includes('T') ? item.createdAt.substring(11, 16) : item.createdAt}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {getIcon(item.type)}
                      <span className="capitalize">{item.type}</span>
                    </span>
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ml-auto">
                      <span>Buka</span>
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-100 p-2.5 text-center dark:border-slate-800/80 text-[10px] text-slate-400 shrink-0">
          Notifikasi tersinkronisasi otomatis secara real-time
        </div>
      </aside>
    </>
  );
};
