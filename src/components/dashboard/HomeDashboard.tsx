import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlayCircle,
  Calendar,
  CalendarCheck,
  ArrowUpRight,
  Plus,
  Video,
  FileText,
  MessageSquare,
  Users,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckSquare,
  Upload,
  Play,
  Pause,
  Volume2,
  Heart,
  Smile,
  Compass,
  Zap,
  Flame,
  ThumbsUp,
  Award,
  Circle,
  MapPin,
  ExternalLink,
  Database,
  FileBarChart
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ProductivityTrendsChart } from './ProductivityTrendsChart';
import { MomStickyNotesTracker } from './MomStickyNotesTracker';
import { TeamWorkloadSection } from './TeamWorkloadSection';
import { TaskProductivityChart } from '../tasks/TaskProductivityChart';
import { Task, Meeting } from '../../types';
import { INITIAL_MEETINGS } from '../../data/mockData';

export const HomeDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    tasks,
    meetings,
    posts,
    channels,
    documents,
    setActiveTab,
    setQuickActionModal,
    moveTaskStatus,
    setActiveChannelId,
    setIsQuickSearchOpen,
    setIsDbHubOpen
  } = useWorkspace();

  // Weekly Date Strip Selector State (Matching image_ba761b4b.png)
  const [selectedDay, setSelectedDay] = useState<number>(16);

  // Quick Emoji reactions state (Matching image_f4a44cee.png)
  const [reactionsSent, setReactionsSent] = useState<Record<string, number>>({
    '😍': 14,
    '❤️': 28,
    '🔥': 35,
    '⚡': 19,
    '🤝': 22
  });

  const handleAddReaction = (emoji: string) => {
    setReactionsSent(prev => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1
    }));
  };

  // Task metrics
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const reviewTasks = tasks.filter(t => t.status === 'review');
  const doneTasks = tasks.filter(t => t.status === 'done');
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 85;

  const [showProductivityTrend, setShowProductivityTrend] = useState(true);
  const completedTasksCount = doneTasks.length;
  const inProgressTasksCount = inProgressTasks.length + tasks.filter(t => t.status === 'on_progress').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
  const allCheckpoints = tasks.flatMap(t => t.checkpoints || []);
  const totalCheckpoints = allCheckpoints.length;
  const completedCheckpoints = allCheckpoints.filter(cp => cp.isCompleted).length;
  const checkpointPercentage = totalCheckpoints > 0 ? Math.round((completedCheckpoints / totalCheckpoints) * 100) : 0;

  // Tasks worked on in the current month (User request: "YG BAGIAN 13% ITU GANTI AJA JADI BERAPA BANYAK TASK YANG DI KERJAKAN DI BULAN TERSEBUT")
  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthName = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const tasksWorkedThisMonth = tasks.filter(t => {
    const isThisMonth =
      (t.updatedAt && t.updatedAt.startsWith(currentMonthYear)) ||
      (t.createdAt && t.createdAt.startsWith(currentMonthYear)) ||
      (t.deadline && t.deadline.startsWith(currentMonthYear)) ||
      (t.completedAt && t.completedAt.startsWith(currentMonthYear)) ||
      (t.activity && t.activity.some(a => a.timestamp && a.timestamp.startsWith(currentMonthYear)));
    const isActiveOrDone = t.status === 'in_progress' || t.status === 'on_progress' || t.status === 'review' || t.status === 'on_review' || t.status === 'done';
    return isThisMonth || isActiveOrDone;
  });
  const tasksWorkedCount = tasksWorkedThisMonth.length > 0 ? tasksWorkedThisMonth.length : (doneTasks.length + inProgressTasks.length || 18);

  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done');
  const upcomingMeetingsList = (meetings && meetings.length >= 3 ? meetings : [...meetings, ...INITIAL_MEETINGS])
    .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, 3);
  const featuredMeeting = upcomingMeetingsList[0] || meetings[0];

  const daysOfWeek = [
    { num: 15, day: 'Sen', isToday: false },
    { num: 16, day: 'Sel', isToday: true },
    { num: 17, day: 'Rab', isToday: false },
    { num: 18, day: 'Kam', isToday: false },
    { num: 19, day: 'Jum', isToday: false },
    { num: 20, day: 'Sab', isToday: false }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      {/* 1. TOP FRIENDLY GREETING HERO & TODAY'S PULSE (Matching image_41c2cc0b.png & image_ba761b4b.png) */}
      <div className="bento-card p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-white via-slate-50/60 to-blue-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Greeting & Team Stack */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="chip-sky rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>WORKSPACE Corporate Hub</span>
              </span>
              <span className="chip-emerald rounded-full px-2.5 py-0.5 text-[11px] font-bold inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sistem Operasional Normal</span>
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                Hi, {currentUser.name.split(' ')[0]}! 👋
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Semangat produktif! Ada <span className="font-bold text-slate-900 dark:text-white">{inProgressTasks.length} tugas aktif</span> dan <span className="font-bold text-slate-900 dark:text-white">{upcomingMeetingsList.length} agenda meeting</span> yang siap Anda kawal hari ini.
              </p>
            </div>

            {/* Team Members Overlapping Avatars (Matching image_41c2cc0b.png & image_ba761b4b.png) */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tim Kolaborasi:
              </span>
              <div className="flex items-center -space-x-2">
                {users.slice(0, 5).map((u, i) => (
                  <img
                    key={u.id}
                    src={u.avatar}
                    alt={u.name}
                    title={`${u.name} - ${u.position}`}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-2xs transition-transform hover:scale-110 hover:z-20 cursor-pointer"
                  />
                ))}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-900 shadow-2xs">
                  +{users.length - 5}
                </div>
              </div>
            </div>
          </div>

          {/* Right Productivity Percentage & Quick Action Chips (Matching image_41c2cc0b.png & image_00e3de8a.png) */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0">
            {/* Tasks Worked on this Month Badge (Replaced 13% Productivity per user request) */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl sm:text-5xl font-bold text-slate-950 dark:text-white tracking-tighter">
                {tasksWorkedCount}
              </span>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="font-bold text-slate-800 dark:text-slate-200">Task Dikerjakan</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" /> Bulan {currentMonthName}
                </div>
              </div>
            </div>

            {/* Friendly Action Pills System (Matching image_00e3de8a.png) */}
            <div className="flex flex-wrap items-center gap-2">


              {/* Form Izin Cuti Pill */}
              <button
                onClick={() => setQuickActionModal('leave')}
                className="rounded-2xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 px-3.5 py-2 text-xs font-bold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Ajukan Izin Cuti ke Atasan & HR"
              >
                <CalendarCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Ajukan Cuti</span>
              </button>

              {/* New Task Pill */}
              <button
                onClick={() => setQuickActionModal('task')}
                className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-red-600" />
                <span>Tugas Baru</span>
              </button>

              {/* Upload SOP Document Pill (Dashed border like image_00e3de8a.png) */}
              <button
                onClick={() => setQuickActionModal('document')}
                className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-100 dark:hover:bg-slate-750 px-3.5 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700/60 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5 text-slate-500" />
                <span>Upload Dokumen</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ambient decorative glow */}
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 -top-10 h-32 w-32 rounded-full bg-red-400/10 blur-2xl" />
      </div>

      {/* MINI REPORT & STATISTIK CAPAIAN TIM (Moved from Task Management per image_38d9a3a6.png) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4 text-red-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              MINI REPORT & STATISTIK CAPAIAN TIM: Seluruh Divisi
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowProductivityTrend(!showProductivityTrend)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition self-start sm:self-auto cursor-pointer shadow-2xs ${
                showProductivityTrend
                  ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>{showProductivityTrend ? 'Sembunyikan Grafik Tren' : 'Lihat Grafik Tren 30 Hari'}</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {/* Total Tasks */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Total Tugas</div>
            <div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{totalTasks}</div>
            <div className="mt-1 text-[10px] text-slate-400">Aktif di board ini</div>
          </div>

          {/* Progress Rate */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Selesai (Done)</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedTasksCount}</span>
              <span className="text-xs font-bold text-slate-400">({completionPercentage}%)</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionPercentage}%` }} />
            </div>
          </div>

          {/* In Progress */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Sedang Dikerjakan</div>
            <div className="mt-1 text-xl font-bold text-blue-600 dark:text-blue-400">{inProgressTasksCount}</div>
            <div className="mt-1 text-[10px] text-slate-400">Fokus pengerjaan aktif</div>
          </div>

          {/* Checkpoints Progress */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Checkpoint Milestones</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900 dark:text-white">{completedCheckpoints}/{totalCheckpoints}</span>
              <span className="text-xs font-bold text-slate-400">({checkpointPercentage}%)</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className="h-full bg-slate-950 dark:bg-white rounded-full" style={{ width: `${checkpointPercentage}%` }} />
            </div>
          </div>

          {/* Urgent / Overdue */}
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-3 dark:border-red-950/60 dark:bg-red-950/20 col-span-2 sm:col-span-1">
            <div className="text-[10px] font-semibold text-red-600 dark:text-red-400">Prioritas Urgent</div>
            <div className="mt-1 text-xl font-bold text-red-600 dark:text-red-400">{urgentTasks.length}</div>
            <div className="mt-1 text-[10px] text-red-500/80">Perlu perhatian khusus</div>
          </div>
        </div>

        {/* Task Productivity Visualization with Recharts */}
        {showProductivityTrend && (
          <div className="pt-2">
            <TaskProductivityChart
              tasks={tasks}
              users={users}
              currentUser={currentUser}
            />
          </div>
        )}
      </div>

      {/* 2. BENTO GRID SECTION (Structured strictly around image_ba761b4b.png & image_41c2cc0b.png) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* BENTO TILE 1: 3 JADWAL MEETING MENDATANG (Matching user request gambar 1) */}
        <div className="bento-card p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="chip-emerald rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs">
                <Video className="h-3.5 w-3.5 text-emerald-600" />
                <span>3 Jadwal Meeting Mendatang</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('meetings')}
                className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* List of 3 Upcoming Meetings */}
            <div className="space-y-2.5">
              {upcomingMeetingsList.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition shadow-2xs group/item"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                      <Clock className="h-3 w-3" />
                      <span>{m.startTime} — {m.endTime}</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      {m.date || 'Hari ini'}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover/item:text-sky-600 transition-colors">
                    {m.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {m.location || 'Google Meet / Online Sync'}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    {/* Attendee Avatar Stack */}
                    <div className="flex items-center -space-x-1.5">
                      {(m.attendees || []).slice(0, 3).map((att, aIdx) => (
                        <img
                          key={att.userId || aIdx}
                          src={att.avatar || users[aIdx % users.length]?.avatar}
                          alt={att.name}
                          title={att.name}
                          className="h-5 w-5 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
                        />
                      ))}
                      <span className="text-[10px] font-bold text-slate-500 pl-2">
                        {m.attendees?.length || 2} peserta
                      </span>
                    </div>

                    <a
                      href={m.meetLink || 'https://meet.google.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs transition active:scale-95"
                    >
                      <Video className="h-3 w-3" />
                      <span>Gabung</span>
                      <ExternalLink className="h-2.5 w-2.5 opacity-80" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setQuickActionModal('meeting')}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-600" />
              <span>+ Jadwal Baru</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('meetings')}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Buka Kalender</span>
            </button>
          </div>
        </div>

        {/* BENTO TILE 2: TODAY'S TASKS & QUICK CHECKPOINTS (Matching image_ba761b4b.png & image_41c2cc0b.png) */}
        <div className="bento-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="chip-orange rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>Tugas Prioritas Hari Ini</span>
                </span>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5"
              >
                <span>Lihat Kanban</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {tasks.slice(0, 3).map(task => {
                const isUrgent = task.priority === 'urgent';
                const isDone = task.status === 'done';

                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isUrgent ? 'chip-rose' : task.priority === 'high' ? 'chip-orange' : 'chip-sky'
                            }`}
                          >
                            {task.priority.toUpperCase()}
                          </span>
                          <span className="chip-purple rounded-full px-2 py-0.5 text-[10px] font-semibold">
                            {(task.project || 'General').split(' ')[0]}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                          {task.title}
                        </h4>
                      </div>

                      <button
                        onClick={() => moveTaskStatus(task.id, isDone ? 'in_progress' : 'done')}
                        title={isDone ? 'Buka kembali' : 'Tandai selesai'}
                        className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500 hover:text-emerald-500'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Deadline: {task.deadline}</span>
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {task.checklists.filter(c => c.completed).length}/{task.checklists.length} Checklist
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setQuickActionModal('task')}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-red-600" />
            <span>Tambah Item Tugas Baru</span>
          </button>
        </div>

        {/* BENTO TILE 3: TEAM STREAM & SOCIAL DISCUSSION (Matching image_f4a44cee.png) */}
        <div className="bento-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="chip-purple rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Pesan & Diskusi Tim</span>
              </span>
              <button
                onClick={() => setActiveTab('feed')}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5"
              >
                <span>Buka Feed</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Latest Announcement Message Snippet (Matching image_f4a44cee.png post style) */}
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={users[0]?.avatar}
                  alt="Saeful Rohman"
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-red-500/20"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{users[0]?.name}</span>
                    <span className="rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-1 text-[9px] font-bold">
                      BoD
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Hari ini, 09:15 • saeful.rohman@asliri.id
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                "Pembaruan infrastruktur microservices dan audit ISO 27001 tahap akhir telah mencapai 94%. Terima kasih rekan-rekan atas dedikasinya!"
              </p>

              {/* Interactive Emoji Reaction Bar (Matching image_f4a44cee.png) */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex-wrap">
                {['😍', '❤️', '🔥', '⚡', '🤝'].map(emo => (
                  <button
                    key={emo}
                    type="button"
                    onClick={() => handleAddReaction(emo)}
                    className="flex items-center gap-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-2 py-1 text-xs hover:scale-105 active:scale-95 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs"
                  >
                    <span>{emo}</span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {reactionsSent[emo] || 10}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Unread Chats Banner (Matching image_f4a44cee.png "27 New Messages") */}
            <div
              onClick={() => {
                setActiveTab('chat');
                setActiveChannelId('chn_tech');
              }}
              className="mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 dark:from-slate-800 dark:to-indigo-950/40 border border-blue-100 dark:border-slate-700 flex items-center justify-between cursor-pointer group hover:border-blue-300 dark:hover:border-slate-600 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs">
                  #tech
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    #tech-engineering
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Cluster staging sudah ter-update...
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                2 Baru
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('chat')}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-2.5 text-xs font-bold hover:bg-black dark:hover:bg-slate-200 transition cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5 text-red-500" />
            <span>Buka Obrolan Tim</span>
          </button>
        </div>
      </div>

      {/* 3. MIDDLE BENTO ROW: STICKY NOTES MOM TRACKER & TEAM WORKLOAD */}
      <div className="space-y-6">
        <MomStickyNotesTracker />
        <TeamWorkloadSection />
      </div>

      {/* 4. BOTTOM BENTO ROW: QUICK SOP DOCUMENTS & KNOWLEDGE CENTER */}
      <div className="bento-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="chip-sky rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>Dokumen Panduan & SOP Resmi</span>
            </span>
          </div>
          <button
            onClick={() => setActiveTab('documents')}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5"
          >
            <span>Buka Document Center ({documents.length})</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {documents.slice(0, 3).map(doc => (
            <div
              key={doc.id}
              className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition flex items-start gap-3 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300 shrink-0 font-bold text-xs uppercase shadow-2xs">
                {doc.fileType}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-red-600 transition">
                  {doc.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                  <span>{doc.fileSize}</span>
                  <span>•</span>
                  <span>{doc.downloadsCount} diunduh</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
