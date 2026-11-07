import React, { useState } from 'react';
import {
  StickyNote,
  Plus,
  Send,
  CheckCircle2,
  Circle,
  Trash2,
  Share2,
  Tag,
  Calendar,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface MomChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

interface MomNote {
  id: string;
  title: string;
  meetingRef: string;
  date: string;
  color: 'yellow' | 'blue' | 'purple' | 'green' | 'rose';
  checklist: MomChecklistItem[];
}

export const MomStickyNotesTracker: React.FC = () => {
  const { currentUser, addNotification } = useWorkspace();

  const [notes, setNotes] = useState<MomNote[]>([
    {
      id: 'mom-1',
      title: 'MOM: Evaluasi KPI & Strategy Q4',
      meetingRef: 'Reminder to collect KPI October',
      date: '6 Nov 2026',
      color: 'yellow',
      checklist: [
        { id: 'c1', text: 'Kumpulkan rekap skor KPI tiap divisi', done: true },
        { id: 'c2', text: 'Finalisasi brief desain kampanye Trinity', done: true },
        { id: 'c3', text: 'Kirim draf laporan ke VP & Direksi', done: false },
        { id: 'c4', text: 'Jadwalkan sync meeting mingguan', done: false }
      ]
    }
  ]);

  const [activeNoteIdx, setActiveNoteIdx] = useState<number>(0);
  const [newItemText, setNewItemText] = useState<string>('');
  const [showSendModal, setShowSendModal] = useState<boolean>(false);
  const [targetGroup, setTargetGroup] = useState<string>('Marketing & Brand Hub');
  const [sendNoteMessage, setSendNoteMessage] = useState<string>('');

  const activeNote = notes[activeNoteIdx] || notes[0];

  const colorStyles = {
    yellow: 'bg-amber-100/90 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100',
    blue: 'bg-sky-100/90 dark:bg-sky-950/70 border-sky-300 dark:border-sky-700 text-sky-950 dark:text-sky-100',
    purple: 'bg-purple-100/90 dark:bg-purple-950/70 border-purple-300 dark:border-purple-700 text-purple-950 dark:text-purple-100',
    green: 'bg-emerald-100/90 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100',
    rose: 'bg-rose-100/90 dark:bg-rose-950/70 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100'
  };

  const handleToggleChecklist = (noteId: string, itemId: string) => {
    setNotes(prev =>
      prev.map(note => {
        if (note.id === noteId) {
          return {
            ...note,
            checklist: note.checklist.map(item =>
              item.id === itemId ? { ...item, done: !item.done } : item
            )
          };
        }
        return note;
      })
    );
  };

  const handleAddChecklistItem = (noteId: string) => {
    if (!newItemText.trim()) return;
    setNotes(prev =>
      prev.map(note => {
        if (note.id === noteId) {
          return {
            ...note,
            checklist: [
              ...note.checklist,
              { id: `c-${Date.now()}`, text: newItemText.trim(), done: false }
            ]
          };
        }
        return note;
      })
    );
    setNewItemText('');
  };

  const handleAddNewNote = () => {
    const colors: ('yellow' | 'blue' | 'purple' | 'green' | 'rose')[] = ['yellow', 'blue', 'purple', 'green', 'rose'];
    const randomColor = colors[notes.length % colors.length];
    const newNote: MomNote = {
      id: `mom-${Date.now()}`,
      title: `MOM: Sesi Catatan Meeting #${notes.length + 1}`,
      meetingRef: 'Sync Tim Internal',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      color: randomColor,
      checklist: [
        { id: `c-init-1`, text: 'Tulis action item pertama hasil meeting...', done: false }
      ]
    };
    setNotes(prev => [...prev, newNote]);
    setActiveNoteIdx(notes.length);
  };

  const handleConfirmSendToGroup = () => {
    if (!activeNote) return;

    const completedCount = activeNote.checklist.filter(c => c.done).length;
    const totalCount = activeNote.checklist.length;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    if (addNotification) {
      addNotification({
        recipientId: 'usr_all',
        title: `📢 MOM Card Shared: ${activeNote.title}`,
        message: `${currentUser.name} membagikan Card MOM ke Group "${targetGroup}" (Tracker Progress: ${completedCount}/${totalCount} - ${pct}% Selesai).`,
        type: 'system',
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar
      });
    }

    alert(`🚀 Card MOM "${activeNote.title}" berhasil dikirim ke Group "${targetGroup}"!`);
    setShowSendModal(false);
  };

  if (!activeNote) return null;

  const completedCount = activeNote.checklist.filter(c => c.done).length;
  const totalCount = activeNote.checklist.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bento-card p-5 flex flex-col justify-between space-y-4 relative">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="chip-orange rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs">
            <StickyNote className="h-3.5 w-3.5 text-amber-600" />
            <span>Sticky Notes MOM</span>
          </span>
          <button
            type="button"
            onClick={handleAddNewNote}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900 px-2.5 py-1 rounded-xl transition cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span>+ MOM Baru</span>
          </button>
        </div>

        {/* Note selector tabs if >1 note */}
        {notes.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2">
            {notes.map((n, idx) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setActiveNoteIdx(idx)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold truncate max-w-[120px] transition ${
                  idx === activeNoteIdx
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {n.title.replace('MOM: ', '')}
              </button>
            ))}
          </div>
        )}

        {/* Main Sticky Note Card */}
        <div className={`p-4 rounded-2xl border ${colorStyles[activeNote.color]} transition-all shadow-xs relative group`}>
          {/* Top Title & Meeting Tag */}
          <div className="mb-3">
            <input
              type="text"
              value={activeNote.title}
              onChange={e => {
                const val = e.target.value;
                setNotes(prev =>
                  prev.map(n => (n.id === activeNote.id ? { ...n, title: val } : n))
                );
              }}
              className="w-full bg-transparent font-bold text-sm focus:outline-none border-b border-black/10 dark:border-white/10 pb-1"
              placeholder="Judul MOM Meeting..."
            />
            <div className="flex items-center justify-between text-[11px] opacity-80 mt-1.5 font-semibold">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{activeNote.date}</span>
              </span>
              <span className="truncate max-w-[150px] font-mono">{activeNote.meetingRef}</span>
            </div>
          </div>

          {/* Tracker Progress Bar */}
          <div className="mb-3 p-2 rounded-xl bg-white/60 dark:bg-black/20 backdrop-blur-xs border border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="flex items-center gap-1">
                <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
                <span>Tracker Action Items</span>
              </span>
              <span>{completedCount}/{totalCount} ({progressPct}%)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Interactive Checklist Items List */}
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {activeNote.checklist.map(item => (
              <div
                key={item.id}
                onClick={() => handleToggleChecklist(activeNote.id, item.id)}
                className="flex items-center gap-2 text-xs font-semibold cursor-pointer group/item hover:opacity-100 opacity-90 transition"
              >
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-400 shrink-0 group-hover/item:text-slate-600" />
                )}
                <span className={`flex-1 transition ${item.done ? 'line-through opacity-60' : ''}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Add Item Input */}
          <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-black/10 dark:border-white/10">
            <input
              type="text"
              value={newItemText}
              onChange={e => setNewItemText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddChecklistItem(activeNote.id);
              }}
              placeholder="+ Tambah action item..."
              className="flex-1 bg-white/70 dark:bg-black/30 text-xs px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 focus:outline-none placeholder:text-slate-400 font-medium"
            />
            <button
              type="button"
              onClick={() => handleAddChecklistItem(activeNote.id)}
              className="bg-black/80 text-white dark:bg-white dark:text-slate-900 text-xs font-bold px-2 py-1.5 rounded-lg hover:bg-black transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Row: Send to Group Button */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>MOM Tracker Sync</span>
        </span>
        <button
          type="button"
          onClick={() => setShowSendModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Send MOM to Group</span>
        </button>
      </div>

      {/* Send to Group Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="h-4 w-4 text-amber-500" />
                <span>Send MOM Card ke Group</span>
              </h4>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Pilih Group Tujuan
                </label>
                <select
                  value={targetGroup}
                  onChange={e => setTargetGroup(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Marketing & Brand Hub">Marketing & Brand Hub</option>
                  <option value="Design & Creative Review Group">Design & Creative Review Group</option>
                  <option value="Technology & Engineering">Technology & Engineering</option>
                  <option value="All Employees Workspace Feed">All Employees Workspace Feed</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Catatan Pengirim (Opsional)
                </label>
                <textarea
                  value={sendNoteMessage}
                  onChange={e => setSendNoteMessage(e.target.value)}
                  rows={2}
                  placeholder="Instruksi / ringkasan tindak lanjut..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                📢 Card MOM akan dikirim langsung ke feed & ruang kerja group terpilih beserta status tracker checklist ({completedCount}/{totalCount} Selesai).
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowSendModal(false)}
                className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSendToGroup}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-xs font-bold shadow-2xs"
              >
                Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
