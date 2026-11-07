import React, { useState } from 'react';
import { Users, Send, ChevronRight } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const TeamWorkloadSection: React.FC = () => {
  const { users, tasks, startDirectMessage, setActiveTab } = useWorkspace();
  const [selectedDivFilter, setSelectedDivFilter] = useState<string>('all');
  const [showAll, setShowAll] = useState<boolean>(false);

  const divisionsList = ['all', 'Marketing', 'HRGA', 'Legal', 'Finance', 'Sales', 'IT'];

  const filteredUsers = users.filter(u => {
    if (selectedDivFilter === 'all') return true;
    return u.department.toLowerCase().includes(selectedDivFilter.toLowerCase());
  });

  const displayUsers = showAll ? filteredUsers : filteredUsers.slice(0, 6);

  // Calculate stats
  let optimalCount = 0;
  let stableCount = 0;
  let pressureCount = 0;

  users.forEach(u => {
    const userTasks = tasks.filter(t => t.assigneeId === u.id && t.status !== 'done');
    if (userTasks.length <= 3) optimalCount++;
    else if (userTasks.length <= 6) stableCount++;
    else pressureCount++;
  });

  return (
    <div className="bento-card p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Kapasitas & Beban Kerja Personel</span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoring distribusi tugas aktif dan indikator tekanan kerja tim secara proporsional.
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
            <span>😊 {optimalCount} Optimal</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
            <span>😐 {stableCount} Stabil</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800">
            <span>😰 {pressureCount} Under Pressure</span>
          </span>
        </div>
      </div>

      {/* Division Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 mr-1">Divisi:</span>
        {divisionsList.map(div => (
          <button
            key={div}
            type="button"
            onClick={() => setSelectedDivFilter(div)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedDivFilter === div
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {div === 'all' ? 'Semua Divisi' : div}
          </button>
        ))}
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayUsers.map(u => {
          const userTasks = tasks.filter(t => t.assigneeId === u.id && t.status !== 'done');
          const taskCount = userTasks.length;
          const percentage = Math.min(100, Math.round((taskCount / 10) * 100));

          let statusBadge = { label: 'Optimal', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' };
          if (taskCount > 6) {
            statusBadge = { label: 'Under Pressure', bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300' };
          } else if (taskCount > 3) {
            statusBadge = { label: 'Stabil', bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300' };
          }

          return (
            <div
              key={u.id}
              className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* User Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-xs"
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${u.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {u.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {u.position}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {u.department}
                      </p>
                    </div>
                  </div>

                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${statusBadge.bg}`}>
                    😊 {statusBadge.label}
                  </span>
                </div>

                {/* Workload Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Beban Tugas Aktif</span>
                    <span className="text-slate-900 dark:text-white">{taskCount} tugas ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        taskCount > 6 ? 'bg-rose-500' : taskCount > 3 ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(8, percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Current Tasks List */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tugas Sedang Berjalan:
                  </div>
                  {userTasks.length === 0 ? (
                    <p className="text-[11px] italic text-slate-400">
                      Tidak ada tugas aktif saat ini.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {userTasks.slice(0, 3).map(t => (
                        <div key={t.id} className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}
                      {userTasks.length > 3 && (
                        <div className="text-[10px] font-bold text-slate-400 pl-3">
                          +{userTasks.length - 3} tugas lainnya
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => startDirectMessage(u.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5 text-blue-600" />
                  <span>Kirim Pesan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('tasks');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 text-white hover:bg-black dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 px-3 py-2 text-xs font-bold transition cursor-pointer shadow-2xs"
                >
                  <span>Lihat di Kanban</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length > 6 && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-2xs"
          >
            {showAll ? 'Tampilkan Lebih Sedikit' : `Lihat semua personel (${filteredUsers.length})`}
          </button>
        </div>
      )}
    </div>
  );
};
