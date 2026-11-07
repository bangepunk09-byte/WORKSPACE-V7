import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  CheckSquare,
  FileText,
  Users,
  MessageSquare,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const QuickSearchModal: React.FC = () => {
  const {
    isQuickSearchOpen,
    setIsQuickSearchOpen,
    tasks,
    documents,
    users,
    channels,
    posts,
    setActiveTab,
    startDirectMessage,
    setActiveChannelId
  } = useWorkspace();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen(!isQuickSearchOpen);
      }
      if (e.key === 'Escape' && isQuickSearchOpen) {
        setIsQuickSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickSearchOpen]);

  useEffect(() => {
    if (isQuickSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isQuickSearchOpen]);

  if (!isQuickSearchOpen) return null;

  const q = query.toLowerCase().trim();

  // Search results
  const matchingTasks = q ? tasks.filter(t => t.title.toLowerCase().includes(q) || (t.project || '').toLowerCase().includes(q)).slice(0, 3) : [];
  const matchingDocs = q ? documents.filter(d => d.title.toLowerCase().includes(q) || d.fileName.toLowerCase().includes(q)).slice(0, 3) : [];
  const matchingUsers = q ? users.filter(u => u.name.toLowerCase().includes(q) || u.position.toLowerCase().includes(q)).slice(0, 3) : [];
  const matchingChannels = q ? channels.filter(c => c.name.toLowerCase().includes(q)).slice(0, 3) : [];
  const matchingPosts = q ? posts.filter(p => p.content.toLowerCase().includes(q)).slice(0, 2) : [];

  const hasResults = matchingTasks.length > 0 || matchingDocs.length > 0 || matchingUsers.length > 0 || matchingChannels.length > 0 || matchingPosts.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
          <Search className="h-5 w-5 text-red-600" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari task, SOP, rekan kerja, saluran chat, atau postingan..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100"
          />
          <button
            onClick={() => setIsQuickSearchOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {!q ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Ketikkan kata kunci untuk mencari di seluruh database WORKSPACE...
            </div>
          ) : !hasResults ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Tidak ada hasil yang ditemukan untuk &quot;{query}&quot;.
            </div>
          ) : (
            <>
              {/* Tasks */}
              {matchingTasks.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Tugas & Project Kanban
                  </div>
                  <div className="space-y-1">
                    {matchingTasks.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setActiveTab('tasks');
                          setIsQuickSearchOpen(false);
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{t.title}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{t.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {matchingDocs.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Dokumen & SOP
                  </div>
                  <div className="space-y-1">
                    {matchingDocs.map(d => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setActiveTab('documents');
                          setIsQuickSearchOpen(false);
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-4 w-4 text-red-500 shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{d.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{d.version}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* People */}
              {matchingUsers.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Karyawan & Tim
                  </div>
                  <div className="space-y-1">
                    {matchingUsers.map(u => (
                      <div
                        key={u.id}
                        onClick={() => {
                          startDirectMessage(u.id);
                          setIsQuickSearchOpen(false);
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{u.name}</span>
                            <span className="text-slate-400 text-[10px] ml-2">{u.position}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Channels */}
              {matchingChannels.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Channel Obrolan
                  </div>
                  <div className="space-y-1">
                    {matchingChannels.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setActiveChannelId(c.id);
                          setActiveTab('chat');
                          setIsQuickSearchOpen(false);
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-500 shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">#{c.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{c.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
