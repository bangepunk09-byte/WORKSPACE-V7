import React, { useState } from 'react';
import {
  Kanban,
  List,
  Calendar as CalendarIcon,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Check,
  Clock,
  AlertCircle,
  MoreVertical,
  CheckSquare,
  MessageSquare,
  Paperclip,
  User,
  ChevronDown,
  Layers,
  ArrowUpDown,
  Trash2,
  Sliders,
  X,
  Flag,
  FileBarChart,
  ShieldAlert,
  Send,
  AlertTriangle,
  FileText,
  Building2,
  Lock,
  Sparkles,
  Printer,
  CalendarDays,
  Clapperboard,
  Film,
  Video,
  ThumbsUp,
  ThumbsDown,
  Image as ImageIcon,
  Mail,
  Archive,
  RotateCcw,
  Link as LinkIcon,
  Info,
  ExternalLink,
  FileUp
} from 'lucide-react';
import { GanttChartTimeline } from './GanttChartTimeline';
import { TaskProductivityChart } from './TaskProductivityChart';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Task, TaskStatus, TaskPriority, TaskCheckpoint, TaskReportItem, VideoDraftScene, TaskApproval } from '../../types';

// Group / Division Definitions
interface GroupMeta {
  id: string;
  name: string;
  departmentMatch: string;
  color: string;
}

const TASK_GROUPS: GroupMeta[] = [
  { id: 'div_marketing', name: 'MARKETING', departmentMatch: 'MARKETING', color: 'bg-blue-600' },
  { id: 'div_hrga', name: 'HRGA', departmentMatch: 'HRGA', color: 'bg-emerald-600' },
  { id: 'div_legal', name: 'LEGAL', departmentMatch: 'LEGAL', color: 'bg-rose-600' },
  { id: 'div_finance', name: 'FINANCE', departmentMatch: 'FINANCE', color: 'bg-amber-600' },
  { id: 'div_sales', name: 'SALES', departmentMatch: 'SALES', color: 'bg-indigo-600' },
  { id: 'div_it', name: 'IT', departmentMatch: 'IT', color: 'bg-purple-600' }
];

export const TaskManagement: React.FC = () => {
  const {
    currentUser,
    users,
    tasks,
    divisions,
    managedBrands,
    selectedTaskGroup,
    setSelectedTaskGroup,
    moveTaskStatus,
    setQuickActionModal,
    deleteTask,
    toggleChecklistItem,
    toggleTaskCheckpoint,
    addTaskCheckpoint,
    addTaskReport,
    sendTaskForApproval,
    processTaskApproval,
    updateTaskVideoDraft,
    channels,
    addAuditLog,
    archiveTask,
    unarchiveTask
  } = useWorkspace();

  const isSuperAdmin = currentUser.role === 'super_admin';

  // Determine user's home group ID based on their department
  const userHomeGroup = TASK_GROUPS.find(g =>
    currentUser.department.toLowerCase().includes(g.departmentMatch.toLowerCase()) ||
    g.departmentMatch.toLowerCase().includes(currentUser.department.toLowerCase())
  ) || TASK_GROUPS[0];

  // Active group: Non-super admins are strictly locked to their division
  const activeGroupId = isSuperAdmin ? (selectedTaskGroup || 'all') : userHomeGroup.id;

  // Access check: Super admin can access anything. Others can only access their home division.
  const hasAccessToCurrentGroup = isSuperAdmin || activeGroupId === userHomeGroup.id;

  // DEFAULT VIEW MODE IS NOW EXPLICITLY 'kanban' (BOARD)
  const [viewMode, setViewMode] = useState<'overview' | 'kanban' | 'timeline' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showArchivedModal, setShowArchivedModal] = useState(false);

  // Approval modal state: for sending task to channel/group for manager approval
  const [approvalModalTask, setApprovalModalTask] = useState<Task | null>(null);
  const [approvalCustomMessage, setApprovalCustomMessage] = useState('');
  const [approvalChannelId, setApprovalChannelId] = useState<string>('chn_general');
  const [approvalManagerIds, setApprovalManagerIds] = useState<string[]>([]);

  const openApprovalModal = (task: Task) => {
    setApprovalModalTask(task);
    setApprovalCustomMessage(`Mohon review dan persetujuan untuk tugas: "${task.title}"`);
    if (channels.length > 0) {
      setApprovalChannelId(channels[0].id);
    }
    const defaultMgrs = users.filter(u => u.role === 'manager' || u.role === 'super_admin' || u.role === 'admin').map(u => u.id);
    if (defaultMgrs.length > 0) {
      setApprovalManagerIds(defaultMgrs);
    }
  };

  // Mini Report Modal state & Email Dispatch
  const [showReportModal, setShowReportModal] = useState(false);
  const [showProductivityTrend, setShowProductivityTrend] = useState(true);

  // Email report dispatch state
  const managersList = users.filter(u => u.role === 'manager' || u.role === 'super_admin' || u.role === 'admin');
  const [reportTargetManagerEmail, setReportTargetManagerEmail] = useState('');
  const [reportCcList, setReportCcList] = useState<string[]>(['executive@asliri.id']);
  const [reportCcInput, setReportCcInput] = useState('');
  const [reportMemo, setReportMemo] = useState('');
  const [isSendingReportEmail, setIsSendingReportEmail] = useState(false);
  const [reportEmailSentSuccess, setReportEmailSentSuccess] = useState(false);

  const handleAddCc = () => {
    if (!reportCcInput.trim()) return;
    const clean = reportCcInput.trim().toLowerCase();
    if (!reportCcList.includes(clean)) {
      setReportCcList(prev => [...prev, clean]);
    }
    setReportCcInput('');
  };

  const handleRemoveCc = (item: string) => {
    setReportCcList(prev => prev.filter(c => c !== item));
  };

  const handleSendReportEmail = () => {
    const finalManager = reportTargetManagerEmail || (managersList[0]?.email || 'manager@asliri.id');
    setIsSendingReportEmail(true);
    setTimeout(() => {
      setIsSendingReportEmail(false);
      setReportEmailSentSuccess(true);
      addAuditLog(
        'REPORT_DISPATCH_EMAIL',
        'Executive Report',
        `Ringkasan eksekutif sprint berhasil dikirim ke Manajer: ${finalManager} (CC: ${reportCcList.join(', ') || 'None'})`
      );
      setTimeout(() => setReportEmailSentSuccess(false), 4500);
    }, 700);
  };

  // New Checkpoint form inside task modal
  const [newCheckpointTitle, setNewCheckpointTitle] = useState('');
  const [newCheckpointDate, setNewCheckpointDate] = useState('');

  // New Progress Report / Note form inside task modal
  const [reportType, setReportType] = useState<'progress_update' | 'blocker' | 'note'>('progress_update');
  const [reportContent, setReportContent] = useState('');

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Filter tasks based on group
  const groupFilteredTasks = tasks.filter(t => {
    if (activeGroupId === 'all') return true;
    return t.groupId === activeGroupId || t.assigneeDept === TASK_GROUPS.find(g => g.id === activeGroupId)?.departmentMatch;
  });

  // Filter tasks based on search & selectors
  const filteredTasks = groupFilteredTasks.filter(t => {
    if (brandFilter !== 'all') {
      const b = (t.brand || t.project || '').toLowerCase();
      if (!b.includes(brandFilter.toLowerCase())) return false;
    }

    if (contentTypeFilter !== 'all') {
      const ct = (t.contentType || '').toLowerCase();
      if (!ct.includes(contentTypeFilter.toLowerCase())) return false;
    }

    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (assigneeFilter === 'mine' && t.assigneeId !== currentUser.id) return false;
    if (assigneeFilter !== 'all' && assigneeFilter !== 'mine' && t.assigneeId !== assigneeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchProject = (t.project || '').toLowerCase().includes(q);
      const matchAssignee = t.assigneeName.toLowerCase().includes(q);
      return matchTitle || matchProject || matchAssignee;
    }
    return true;
  });

  // Mini Report Statistics Calculation
  const totalTasks = groupFilteredTasks.length;
  const completedTasks = groupFilteredTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = groupFilteredTasks.filter(t => t.status === 'on_progress' || t.status === 'in_progress').length;
  const urgentTasks = groupFilteredTasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Checkpoints total & completed
  const allCheckpoints = groupFilteredTasks.flatMap(t => t.checkpoints || []);
  const totalCheckpoints = allCheckpoints.length;
  const completedCheckpoints = allCheckpoints.filter(cp => cp.isCompleted).length;
  const checkpointPercentage = totalCheckpoints > 0 ? Math.round((completedCheckpoints / totalCheckpoints) * 100) : 0;

  // Column visual styles matching spacious, high-end pastel board design
  const columnStyles: Record<string, {
    bg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    addBtnBorder: string;
    addBtnText: string;
    addBtnHover: string;
    titleColor: string;
    accentDot: string;
  }> = {
    not_started: {
      bg: 'bg-[#F2EFFE] dark:bg-indigo-950/25',
      border: 'border-indigo-200/80 dark:border-indigo-900/50',
      badgeBg: 'bg-white dark:bg-indigo-900/80',
      badgeText: 'text-indigo-700 dark:text-indigo-300',
      addBtnBorder: 'border-indigo-300 dark:border-indigo-800',
      addBtnText: 'text-indigo-600 dark:text-indigo-300',
      addBtnHover: 'hover:bg-indigo-100/60 dark:hover:bg-indigo-950/40',
      titleColor: 'text-indigo-950 dark:text-indigo-200',
      accentDot: 'bg-indigo-500'
    },
    on_progress: {
      bg: 'bg-[#EAF3FD] dark:bg-blue-950/25',
      border: 'border-blue-200/80 dark:border-blue-900/50',
      badgeBg: 'bg-white dark:bg-blue-900/80',
      badgeText: 'text-blue-700 dark:text-blue-300',
      addBtnBorder: 'border-blue-300 dark:border-blue-800',
      addBtnText: 'text-blue-600 dark:text-blue-300',
      addBtnHover: 'hover:bg-blue-100/60 dark:hover:bg-blue-950/40',
      titleColor: 'text-blue-950 dark:text-blue-200',
      accentDot: 'bg-sky-500'
    },
    on_review: {
      bg: 'bg-[#FEF5E8] dark:bg-amber-950/25',
      border: 'border-amber-200/80 dark:border-amber-900/50',
      badgeBg: 'bg-white dark:bg-amber-900/80',
      badgeText: 'text-amber-700 dark:text-amber-300',
      addBtnBorder: 'border-amber-300 dark:border-amber-800',
      addBtnText: 'text-amber-600 dark:text-amber-300',
      addBtnHover: 'hover:bg-amber-100/60 dark:hover:bg-amber-950/40',
      titleColor: 'text-amber-950 dark:text-amber-200',
      accentDot: 'bg-amber-500'
    },
    done: {
      bg: 'bg-[#EBFBF3] dark:bg-emerald-950/25',
      border: 'border-emerald-200/80 dark:border-emerald-900/50',
      badgeBg: 'bg-white dark:bg-emerald-900/80',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      addBtnBorder: 'border-emerald-300 dark:border-emerald-800',
      addBtnText: 'text-emerald-600 dark:text-emerald-300',
      addBtnHover: 'hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40',
      titleColor: 'text-emerald-950 dark:text-emerald-200',
      accentDot: 'bg-emerald-500'
    }
  };

  // 4 requested flow stages: Not started - On Progress - On Review - Done
  const columns: {
    id: TaskStatus;
    label: string;
    filterFn: (t: Task) => boolean;
    count: number;
  }[] = [
    {
      id: 'not_started',
      label: 'Not started',
      filterFn: t => t.status === 'not_started' || t.status === 'todo' || t.status === 'backlog',
      count: filteredTasks.filter(t => t.status === 'not_started' || t.status === 'todo' || t.status === 'backlog').length
    },
    {
      id: 'on_progress',
      label: 'On Progress',
      filterFn: t => t.status === 'on_progress' || t.status === 'in_progress',
      count: filteredTasks.filter(t => t.status === 'on_progress' || t.status === 'in_progress').length
    },
    {
      id: 'on_review',
      label: 'On Review',
      filterFn: t => t.status === 'on_review' || t.status === 'review',
      count: filteredTasks.filter(t => t.status === 'on_review' || t.status === 'review').length
    },
    {
      id: 'done',
      label: 'Done',
      filterFn: t => t.status === 'done' && !t.isArchived,
      count: filteredTasks.filter(t => t.status === 'done' && !t.isArchived).length
    }
  ];

  const archivedTasks = groupFilteredTasks.filter(t => t.status === 'done' && t.isArchived);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: TaskStatus) => {
    if (dragOverColId === colId) {
      setDragOverColId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (id) {
      moveTaskStatus(id, targetStatus);
    }
    setDraggedTaskId(null);
    setDragOverColId(null);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return { label: 'High', bg: 'bg-[#FEE8E8] text-[#E02424] dark:bg-rose-950/70 dark:text-rose-300' };
      case 'high':
        return { label: 'High', bg: 'bg-[#FEE8E8] text-[#E02424] dark:bg-rose-950/70 dark:text-rose-300' };
      case 'medium':
        return { label: 'Medium', bg: 'bg-[#FDF1DB] text-[#D97706] dark:bg-amber-950/70 dark:text-amber-300' };
      default:
        return { label: 'Low', bg: 'bg-[#E7F8F0] text-[#057A55] dark:bg-emerald-950/70 dark:text-emerald-300' };
    }
  };

  const formatDueDisplay = (deadline: string) => {
    if (!deadline) return 'Today 11:00';
    try {
      const d = new Date(deadline);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      if (d.toDateString() === today.toDateString()) {
        const hh = d.getHours().toString().padStart(2, '0');
        const mm = d.getMinutes().toString().padStart(2, '0');
        return `Today ${hh}:${mm || '00'}`;
      } else if (d.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow 16:00`;
      } else {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `${days[d.getDay()]} 11:00`;
      }
    } catch {
      return 'Today 11:00';
    }
  };

  const handleAddCheckpointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newCheckpointTitle.trim()) return;
    addTaskCheckpoint(selectedTask.id, newCheckpointTitle, newCheckpointDate || undefined);
    setNewCheckpointTitle('');
    setNewCheckpointDate('');

    // Keep selectedTask state updated in modal
    const updated = tasks.find(t => t.id === selectedTask.id);
    if (updated) setSelectedTask(updated);
  };

  const handleAddReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !reportContent.trim()) return;
    addTaskReport(selectedTask.id, {
      type: reportType,
      content: reportContent
    });
    setReportContent('');

    // Keep selectedTask state updated in modal
    const updated = tasks.find(t => t.id === selectedTask.id);
    if (updated) setSelectedTask(updated);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. GROUP SWITCHER & ACCESS CONTROL BAR */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-slate-800 ring-1 ring-slate-800 shadow-xs">
            <Building2 className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Task Management Per Divisi
              </h2>
              {isSuperAdmin && (
                <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/80 dark:text-red-300">
                  Universal Admin Access
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Setiap divisi memiliki board kerja terpisah. Akses dibatasi sesuai otorisasi tim.
            </p>
          </div>
        </div>

        {/* Group Selector Dropdown / Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Pilih Board:</span>
          <select
            value={activeGroupId}
            onChange={e => setSelectedTaskGroup(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs"
          >
            {isSuperAdmin && (
              <option value="all">🌐 Semua Divisi (Global Overview)</option>
            )}
            {TASK_GROUPS.map(g => (
              <option
                key={g.id}
                value={g.id}
                disabled={!isSuperAdmin && g.id !== userHomeGroup.id}
              >
                {g.name} {!isSuperAdmin && g.id !== userHomeGroup.id ? '🔒 (Terkunci)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ACCESS DENIED STATE FOR UNAUTHORIZED GROUPS */}
      {!hasAccessToCurrentGroup ? (
        <div className="rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center dark:border-red-900/60 dark:bg-red-950/30">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 mb-3">
            <Lock className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Akses Board Terbatas
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            Sesuai kebijakan keamanan perusahaan, Anda hanya diizinkan mengakses board divisi Anda (<strong>{currentUser.department}</strong>). Hanya <strong>Super Admin</strong> yang memiliki otorisasi penuh lintas divisi.
          </p>
          <button
            onClick={() => setSelectedTaskGroup(userHomeGroup.id)}
            className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-black transition"
          >
            Beralih ke Board Saya ({userHomeGroup.name})
          </button>
        </div>
      ) : (
        <>
          {/* 2. HEADER MINI STATISTIK & MINI REPORT (EXECUTIVE WIDGET) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileBarChart className="h-4 w-4 text-red-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Mini Report & Statistik Capaian Tim: {activeGroupId === 'all' ? 'Semua Divisi' : TASK_GROUPS.find(g => g.id === activeGroupId)?.name}
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
                <button
                  onClick={() => setShowReportModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition self-start sm:self-auto cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-red-600" />
                  <span>Lihat Laporan Lengkap Tim</span>
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
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedTasks}</span>
                  <span className="text-xs font-bold text-slate-400">({completionPercentage}%)</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionPercentage}%` }} />
                </div>
              </div>

              {/* In Progress */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Sedang Dikerjakan</div>
                <div className="mt-1 text-xl font-bold text-blue-600 dark:text-blue-400">{inProgressTasks}</div>
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
                <div className="mt-1 text-xl font-bold text-red-600 dark:text-red-400">{urgentTasks}</div>
                <div className="mt-1 text-[10px] text-red-500/80">Perlu perhatian khusus</div>
              </div>
            </div>

            {/* Task Productivity Visualization with Recharts (30 Days Trend + Filters) */}
            {showProductivityTrend && (
              <div className="pt-2">
                <TaskProductivityChart
                  tasks={filteredTasks}
                  users={users}
                  currentUser={currentUser}
                />
              </div>
            )}
          </div>

          {/* 3. PROJECT BOARD HEADER (Matching exact layout from image_023adcc3.png) */}
          <div className="rounded-[28px] border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            {/* TOP ROW: Search Task + Member Avatars + Red Export, Import, Archive Buttons */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
              {/* Search Task Input */}
              <div className="relative w-full xl:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Task"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-11 rounded-full border border-slate-200/90 bg-slate-50/70 pl-11 pr-10 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Right cluster: Member avatars + Bright Blue + Circle Button + Red Action Buttons (Export, Import, Archive) */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Member Avatars Stack + Bright Blue Plus Circle Button */}
                <div className="flex items-center -space-x-2">
                  {users.slice(0, 3).map((u, idx) => (
                    <img
                      key={u.id}
                      src={u.avatar}
                      alt={u.name}
                      title={u.name}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-xs"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setQuickActionModal('meeting')}
                    title="Add member"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0099FF] text-white text-xs font-bold ring-2 ring-white dark:ring-slate-900 shadow-md hover:bg-blue-600 transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                  </button>
                </div>

                {/* Export CSV Button (Red #EF2028) */}
                <button
                  type="button"
                  onClick={() => {
                    addAuditLog('EXPORT_CSV', 'Project Board', 'Data project board berhasil diekspor ke CSV.');
                    alert('Data Project Board berhasil diekspor ke CSV.');
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#EF2028] hover:bg-[#dc1a22] px-5 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>

                {/* Import CSV Button (Red #EF2028) */}
                <button
                  type="button"
                  onClick={() => {
                    alert('Fitur Import CSV siap mengunggah data task.');
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#EF2028] hover:bg-[#dc1a22] px-5 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
                >
                  <FileUp className="h-4 w-4" />
                  <span>Import CSV</span>
                </button>

                {/* Archive Button (Red #EF2028) */}
                <button
                  type="button"
                  onClick={() => setShowArchivedModal(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#EF2028] hover:bg-[#dc1a22] px-5 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
                >
                  <Archive className="h-4 w-4" />
                  <span>Archive</span>
                  {archivedTasks.length > 0 && (
                    <span className="bg-white/25 px-1.5 py-0.5 rounded-full text-[10px]">
                      {archivedTasks.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* DIVIDER LINE */}
            <div className="border-t border-slate-200/80 dark:border-slate-800 my-2" />

            {/* BOTTOM ROW: View Switcher Pills + Filter Dropdowns (1 Single Line) */}
            <div className="flex items-center justify-between gap-3 pt-1 flex-nowrap overflow-x-auto">
              {/* Left: View Switcher Pills */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-full border border-slate-200/90 dark:border-slate-700 shadow-2xs shrink-0">
                {/* Board Active (Red #EF2028) */}
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    viewMode === 'kanban'
                      ? 'bg-[#EF2028] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <Kanban className="h-4 w-4" />
                  <span>Board</span>
                </button>

                {/* List View */}
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-[#EF2028] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span>List</span>
                </button>

                {/* Gantt Chart */}
                <button
                  type="button"
                  onClick={() => setViewMode('timeline')}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    viewMode === 'timeline'
                      ? 'bg-[#EF2028] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>Gantt Chart</span>
                </button>
              </div>

              {/* Right: Filter Dropdowns (All Brand, Content Type, All Tasks, All Members) in 1 line */}
              <div className="flex items-center gap-2 shrink-0">
                {/* All Brand Dropdown */}
                <div className="relative inline-flex items-center">
                  <select
                    value={brandFilter}
                    onChange={e => setBrandFilter(e.target.value)}
                    className="h-10 appearance-none rounded-full border border-slate-200/90 bg-white dark:bg-slate-800 pl-4 pr-9 text-xs font-bold text-slate-700 dark:text-slate-200 focus:border-red-500 focus:outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="all">All Brand ({managedBrands?.length || 0})</option>
                    {managedBrands?.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>

                {/* Content Type Dropdown */}
                <div className="relative inline-flex items-center">
                  <select
                    value={contentTypeFilter}
                    onChange={e => setContentTypeFilter(e.target.value)}
                    className="h-10 appearance-none rounded-full border border-slate-200/90 bg-white dark:bg-slate-800 pl-4 pr-9 text-xs font-bold text-slate-700 dark:text-slate-200 focus:border-red-500 focus:outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="all">Content Type</option>
                    <option value="regular">Regular Feeds</option>
                    <option value="video">Shorts / Reels Video</option>
                    <option value="live">Live Streaming</option>
                    <option value="campaign">Special Campaign</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>

                {/* All Tasks Dropdown */}
                <div className="relative inline-flex items-center">
                  <select
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value)}
                    className="h-10 appearance-none rounded-full border border-slate-200/90 bg-white dark:bg-slate-800 pl-4 pr-9 text-xs font-bold text-slate-700 dark:text-slate-200 focus:border-red-500 focus:outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="all">All Tasks</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>

                {/* All Members Dropdown */}
                <div className="relative inline-flex items-center">
                  <select
                    value={assigneeFilter}
                    onChange={e => setAssigneeFilter(e.target.value)}
                    className="h-10 appearance-none rounded-full border border-slate-200/90 bg-white dark:bg-slate-800 pl-4 pr-9 text-xs font-bold text-slate-700 dark:text-slate-200 focus:border-red-500 focus:outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="all">All Members</option>
                    <option value="mine">My Tasks</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. GANTT CHART TIMELINE ONLY (When in dedicated 'timeline' view) */}
          {viewMode === 'timeline' && (
            <div className="space-y-4">
              <GanttChartTimeline
                tasks={filteredTasks}
                users={users}
                currentUser={currentUser}
                activeGroupName={
                  activeGroupId === 'all'
                    ? 'All Divisions'
                    : TASK_GROUPS.find(g => g.id === activeGroupId)?.name || 'Unified Workspace'
                }
                onSelectTask={task => setSelectedTask(task)}
                onAddTask={() => setQuickActionModal('task')}
                onToggleTaskComplete={taskId => {
                  const target = tasks.find(t => t.id === taskId);
                  if (target) {
                    moveTaskStatus(target.id, target.status === 'done' ? 'on_progress' : 'done');
                  }
                }}
              />
            </div>
          )}

          {/* 5. 4-STAGE SPACIOUS STATUS COLUMNS (Shown in 'overview' and 'kanban' views) */}
          {(viewMode === 'overview' || viewMode === 'kanban') && (
            <div className="space-y-3">

              {/* Grid: 4 columns with spacious gap-6 sm:gap-7, breathable padding, no cramped touching */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-7 pb-4">
                {columns.map(col => {
                  const colTasks = filteredTasks.filter(col.filterFn);
                  const style = columnStyles[col.id] || columnStyles.not_started;

                  return (
                    <div
                      key={col.id}
                      onDragOver={e => handleDragOver(e, col.id)}
                      onDragLeave={e => handleDragLeave(e, col.id)}
                      onDrop={e => handleDrop(e, col.id)}
                      className={`flex flex-col rounded-[32px] border ${style.border} ${style.bg} p-4.5 sm:p-5 min-h-[580px] shadow-xs transition-all duration-200 ease-out ${
                        dragOverColId === col.id ? 'ring-2 ring-sky-400 bg-sky-50/70 dark:bg-sky-950/40 scale-[1.01]' : ''
                      }`}
                    >
                      {/* Column Header: [Count Circle] [Title] [...] [+] */}
                      <div className="flex items-center justify-between pb-4 pt-1 px-1">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full ${style.badgeBg} ${style.badgeText} text-xs font-bold shadow-xs`}
                          >
                            {col.count}
                          </div>
                          <span className={`text-sm font-bold ${style.titleColor}`}>
                            {col.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {col.id === 'done' && (
                            <button
                              type="button"
                              onClick={() => setShowArchivedModal(true)}
                              className="flex items-center gap-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 px-2 py-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-200 shadow-2xs transition cursor-pointer"
                              title="Tugas selesai > 7 hari otomatis diarsipkan"
                            >
                              <Archive className="h-3 w-3" />
                              <span>Arsip ({archivedTasks.length})</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setQuickActionModal('task')}
                            className={`rounded-xl p-1.5 ${style.addBtnText} hover:bg-white/60 dark:hover:bg-slate-800/60 transition cursor-pointer`}
                            title="Add task"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                            title="Options"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Task Cards List with generous space-y-4 and top clearance to avoid hover clipping */}
                      <div className="flex-1 space-y-4 overflow-y-auto overflow-x-visible pt-3.5 pb-4 px-1.5 -mx-1.5">
                        {colTasks.length === 0 ? (
                          <div className={`flex h-40 flex-col items-center justify-center rounded-[24px] border border-dashed p-4 text-center text-slate-400 transition-colors ${
                            dragOverColId === col.id ? 'border-sky-400 bg-sky-50/50 dark:bg-sky-950/20 text-sky-600' : 'border-slate-300/80 dark:border-slate-800'
                          }`}>
                            <p className="text-xs font-bold">Lepaskan kartu tugas di sini</p>
                            <p className="text-[11px] text-slate-400/80 mt-1">Kolom {col.label}</p>
                          </div>
                        ) : (
                          colTasks.map((task, taskIdx) => {
                            const priorityBadge = getPriorityBadge(task.priority);
                            const totalComments = task.comments?.length || 8;
                            const totalAttachments = task.attachments?.length || 1;
                            const isDone = task.status === 'done';

                            // Progress percentage from checkpoints or checklists
                            let progressPct = 0;
                            if (isDone) {
                              progressPct = 100;
                            } else if (task.checkpoints && task.checkpoints.length > 0) {
                              const doneCount = task.checkpoints.filter(cp => cp.isCompleted).length;
                              progressPct = Math.round((doneCount / task.checkpoints.length) * 100);
                            } else if (task.checklists && task.checklists.length > 0) {
                              const doneCount = task.checklists.filter(c => c.completed).length;
                              progressPct = Math.round((doneCount / task.checklists.length) * 100);
                            } else {
                              progressPct = col.id === 'on_progress' ? 65 : (col.id === 'on_review' ? 85 : 0);
                            }

                            return (
                              <div
                                key={task.id}
                                draggable
                                onDragStart={e => handleDragStart(e, task.id)}
                                onDragEnd={() => {
                                  setDraggedTaskId(null);
                                  setDragOverColId(null);
                                }}
                                onClick={() => setSelectedTask(task)}
                                className={`kanban-task-card group relative select-none rounded-[24px] border p-4 sm:p-5 transition-all duration-200 ease-out cursor-grab active:cursor-grabbing dark:border-slate-800/90 dark:bg-slate-900 ${
                                  draggedTaskId === task.id
                                    ? 'is-dragging scale-[1.03] -translate-y-2 rotate-1 shadow-2xl ring-2 ring-blue-500 border-blue-400 bg-white/95 dark:bg-slate-900/95 z-50'
                                    : 'bg-white shadow-xs border-white/90 hover:border-slate-200 dark:hover:border-slate-700'
                                }`}
                              >
                                {/* Top Brand Label & Accent Dot */}
                                <div className="flex items-center justify-between gap-2 mb-3">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                    {/* Brand Label Badge */}
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700 shadow-2xs truncate">
                                      <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                                      <span className="truncate">{task.brand || task.groupName || task.project || 'ASLI RI'}</span>
                                    </span>
                                    {task.taskCode && (
                                      <span className="px-2 py-0.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                                        {task.taskCode}
                                      </span>
                                    )}
                                  </div>
                                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${style.accentDot}`} />
                                </div>

                                {/* Task Title matching reference with clear, bold, enlarged font */}
                                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 mb-3.5 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                  {task.title}
                                </h4>

                                {/* Progress Bar & Milestone Status (Clear & Enlarged) */}
                                <div className="mb-3.5 rounded-2xl bg-slate-50/90 p-3 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                                    <span className="text-slate-600 dark:text-slate-300">Progress</span>
                                    <span className={`font-bold ${isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                      {progressPct}%
                                    </span>
                                  </div>
                                  <div className="h-2.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden p-0.5">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        isDone
                                          ? 'bg-emerald-500'
                                          : col.id === 'on_review'
                                          ? 'bg-amber-500'
                                          : 'bg-sky-500'
                                      }`}
                                      style={{ width: `${progressPct}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Middle Row: Assignee Avatar + Due Time + Blue Checkmark Circle */}
                                <div className="flex items-center justify-between mb-3.5">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                      src={task.assigneeAvatar}
                                      alt={task.assigneeName}
                                      className="h-7 w-7 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700 shrink-0 shadow-2xs"
                                    />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                                      {formatDueDisplay(task.deadline)}
                                    </span>
                                  </div>

                                  {/* Blue Checkmark Circle */}
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      const nextStatus: TaskStatus = isDone ? 'on_progress' : 'done';
                                      moveTaskStatus(task.id, nextStatus);
                                    }}
                                    title={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
                                    className={`flex h-7 w-7 items-center justify-center rounded-full transition active:scale-90 shrink-0 ${
                                      isDone
                                        ? 'bg-sky-500 text-white shadow-2xs'
                                        : 'border-2 border-sky-500 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40'
                                    }`}
                                  >
                                    <Check className="h-4 w-4 stroke-[3]" />
                                  </button>
                                </div>

                                {/* Video Draft Scene Badge & Google Links indicator */}
                                {task.videoDraftScenes && task.videoDraftScenes.length > 0 && (
                                  <div className="mb-3 flex items-center justify-between rounded-xl bg-indigo-50/90 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40">
                                    <div className="flex items-center gap-1.5">
                                      <Clapperboard className="h-3.5 w-3.5 text-indigo-600" />
                                      <span>{task.videoDraftScenes.length} Scene Video Draft</span>
                                    </div>
                                    <span className="text-[10px] font-mono opacity-80">
                                      {task.videoDraftScenes.reduce((acc, s) => acc + (s.googleLinks?.length || 0), 0)} Link
                                    </span>
                                  </div>
                                )}

                                {/* Bottom Row: Comments, Attachments + Pastel Priority Badge */}
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                                  <div className="flex items-center gap-3.5 text-slate-500 dark:text-slate-400 text-xs font-bold">
                                    <span className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200">
                                      <MessageSquare className="h-4 w-4 text-slate-400" />
                                      <span>{totalComments}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200">
                                      <Paperclip className="h-4 w-4 text-slate-400" />
                                      <span>{totalAttachments}</span>
                                    </span>
                                  </div>

                                  {/* Soft Pastel Priority Badge */}
                                  <span className={`px-3 py-1 rounded-xl text-xs font-bold ${priorityBadge.bg}`}>
                                    {priorityBadge.label}
                                  </span>
                                </div>

                                {/* Manager Approval Banner & Action */}
                                {task.approvalRequest ? (
                                  <div className={`mt-3 rounded-2xl p-2.5 text-xs font-bold border transition ${
                                    task.approvalRequest.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
                                      : task.approvalRequest.status === 'declined'
                                      ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60'
                                      : 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60'
                                  }`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5 truncate">
                                        <Send className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">
                                          {task.approvalRequest.status === 'approved'
                                            ? '✓ Disetujui Manajer (Auto Done)'
                                            : task.approvalRequest.status === 'declined'
                                            ? '✕ Approval Ditolak'
                                            : `⏳ Review Manajer (${task.approvalRequest.requiredApprovals.filter(a => a.status === 'approved').length}/${task.approvalRequest.requiredApprovals.length})`}
                                        </span>
                                      </div>

                                      {/* If current user is one of the approvers or super_admin and status is pending */}
                                      {task.approvalRequest.status === 'pending' && (() => {
                                        const isRequester = task.approvalRequest?.requestedBy === currentUser.id || task.reporterId === currentUser.id;

                                        if (isRequester) {
                                          return (
                                            <span className="text-xs font-bold text-amber-700 bg-amber-100/90 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-md">
                                              Menunggu Manajer
                                            </span>
                                          );
                                        }

                                        return (
                                          <div className="flex items-center gap-1 shrink-0 ml-1">
                                            <button
                                              type="button"
                                              onClick={e => {
                                                e.stopPropagation();
                                                processTaskApproval(task.id, currentUser.id, 'approved', 'Disetujui dari card board');
                                              }}
                                              title="Setujui (Approve) & Otomatis Selesai"
                                              className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs"
                                            >
                                              ✓ Setujui
                                            </button>
                                            <button
                                              type="button"
                                              onClick={e => {
                                                e.stopPropagation();
                                                processTaskApproval(task.id, currentUser.id, 'declined', 'Perlu revisi');
                                              }}
                                              title="Tolak (Decline)"
                                              className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-bold text-white hover:bg-rose-700 shadow-2xs"
                                            >
                                              ✕ Tolak
                                            </button>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={e => {
                                        e.stopPropagation();
                                        openApprovalModal(task);
                                      }}
                                      className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 hover:text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 shadow-2xs transition"
                                    >
                                      <Send className="h-3.5 w-3.5 text-blue-600" />
                                      <span>Kirim Approval</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                        {dragOverColId === col.id && draggedTaskId !== null && (
                          <div className="rounded-[22px] border-2 border-dashed border-sky-400 bg-sky-50/50 dark:border-sky-500 dark:bg-sky-950/20 py-4 text-center text-xs font-bold text-sky-600 dark:text-sky-300 animate-pulse select-none">
                            ↓ Pindahkan kartu ke {col.label}
                          </div>
                        )}
                      </div>

                      {/* Bottom Add New Task button with matching dashed border & color */}
                      <button
                        type="button"
                        onClick={() => setQuickActionModal('task')}
                        className={`w-full mt-4 flex items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed ${style.addBtnBorder} ${style.addBtnText} ${style.addBtnHover} py-2.5 text-xs font-bold transition shadow-2xs cursor-pointer`}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add new task</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. GANTT CHART TIMELINE AT THE BOTTOM IN OVERVIEW MODE */}
          {viewMode === 'overview' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Gantt Chart Timeline (Ringkas & Terkoneksi)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Timeline proyek & milestone per divisi
                </span>
              </div>
              <GanttChartTimeline
                tasks={filteredTasks}
                users={users}
                currentUser={currentUser}
                activeGroupName={
                  activeGroupId === 'all'
                    ? 'All Divisions'
                    : TASK_GROUPS.find(g => g.id === activeGroupId)?.name || 'Unified Workspace'
                }
                onSelectTask={task => setSelectedTask(task)}
                onAddTask={() => setQuickActionModal('task')}
                onToggleTaskComplete={taskId => {
                  const target = tasks.find(t => t.id === taskId);
                  if (target) {
                    moveTaskStatus(target.id, target.status === 'done' ? 'on_progress' : 'done');
                  }
                }}
              />
            </div>
          )}

          {/* 6. VIEW: TABLE LIST VIEW */}
          {viewMode === 'list' && (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/80">
                    <tr>
                      <th className="px-4 py-3">Judul Task</th>
                      <th className="px-4 py-3">Proyek & Divisi</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Prioritas</th>
                      <th className="px-4 py-3">Milestone Checkpoints</th>
                      <th className="px-4 py-3">Assignee</th>
                      <th className="px-4 py-3">Deadline</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTasks.map(t => {
                      const priority = getPriorityBadge(t.priority);
                      const totalCp = (t.checkpoints || []).length;
                      const doneCp = (t.checkpoints || []).filter(c => c.isCompleted).length;

                      return (
                        <tr
                          key={t.id}
                          className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                          onClick={() => setSelectedTask(t)}
                        >
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <CheckCircle2
                                onClick={e => {
                                  e.stopPropagation();
                                  moveTaskStatus(t.id, t.status === 'done' ? 'in_progress' : 'done');
                                }}
                                className={`h-4 w-4 cursor-pointer transition ${
                                  t.status === 'done' ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-500'
                                }`}
                              />
                              <span className={t.status === 'done' ? 'line-through text-slate-400' : ''}>
                                {t.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            <div>{t.project}</div>
                            <div className="text-[10px] text-slate-400">{t.groupName || t.assigneeDept}</div>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={
                                t.status === 'done'
                                  ? 'done'
                                  : t.status === 'review' || t.status === 'on_review'
                                  ? 'on_review'
                                  : t.status === 'in_progress' || t.status === 'on_progress'
                                  ? 'on_progress'
                                  : 'not_started'
                              }
                              onClick={e => e.stopPropagation()}
                              onChange={e => moveTaskStatus(t.id, e.target.value as TaskStatus)}
                              className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              <option value="not_started">Not started</option>
                              <option value="on_progress">On Progress</option>
                              <option value="on_review">On Review</option>
                              <option value="done">Done</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${priority.bg}`}>
                              {priority.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {totalCp > 0 ? (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{doneCp}/{totalCp}</span>
                                <div className="h-1.5 w-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                  <div className="h-full bg-slate-950 dark:bg-white" style={{ width: `${(doneCp / totalCp) * 100}%` }} />
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <img src={t.assigneeAvatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                              <span>{t.assigneeName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{t.deadline}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                deleteTask(t.id);
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-red-600"
                              title="Hapus Task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}


        </>
      )}

      {/* 7. TASK DETAILS MODAL WITH REWORKED PHASE WORKFLOW & BRAND HEADER */}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          currentUser={currentUser}
        />
      )}
      {/* 8. MINI REPORT MODAL (RINGKASAN EKSEKUTIF CAPAIAN TIM) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Laporan Ringkas Kinerja & Milestones Tim
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  Divisi: {activeGroupId === 'all' ? 'Seluruh Divisi Perusahaan' : TASK_GROUPS.find(g => g.id === activeGroupId)?.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Periode Sprint: Q4 2026 • Dihasilkan otomatis oleh WORKSPACE Operating System
                </div>
              </div>

              {/* Metrics Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-slate-200 p-2.5 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400">Total Deliverables</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-1">{totalTasks} Task</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-2.5 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400">Tingkat Penyelesaian</div>
                  <div className="text-base font-bold text-emerald-600 mt-1">{completionPercentage}%</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-2.5 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400">Milestone Checkpoint</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-1">{completedCheckpoints}/{totalCheckpoints}</div>
                </div>
              </div>

              {/* Status List */}
              <div className="space-y-2">
                <div className="font-bold text-slate-700 dark:text-slate-300">
                  Ringkasan Task Kunci:
                </div>
                {groupFilteredTasks.slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px]">
                    <span className="font-medium truncate max-w-[280px] text-slate-800 dark:text-slate-200">{t.title}</span>
                    <span className="font-bold text-slate-600 dark:text-slate-400 uppercase">{t.status}</span>
                  </div>
                ))}
              </div>

              {/* Email Dispatch Section to Manager & CC (Requested Feature) */}
              <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-slate-900 dark:text-white">
                      Kirim Laporan Lengkap ke Email Manager & Tim
                    </span>
                  </div>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                    Otomatisasi Email
                  </span>
                </div>

                {reportEmailSentSuccess && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Laporan berhasil dikirimkan ke email Manager & seluruh penerima CC!</span>
                  </div>
                )}

                {/* Manager Target Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kirim ke Email Manager Utama:
                  </label>
                  <select
                    value={reportTargetManagerEmail || (managersList[0]?.email || '')}
                    onChange={e => setReportTargetManagerEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {managersList.map(m => (
                      <option key={m.id} value={m.email}>
                        {m.name} ({m.position} • {m.email})
                      </option>
                    ))}
                    <option value="custom">-- Masukkan Alamat Lain --</option>
                  </select>
                  {reportTargetManagerEmail === 'custom' && (
                    <input
                      type="email"
                      placeholder="Masukkan alamat email manager (contoh: vp@perusahaan.com)"
                      onChange={e => setReportTargetManagerEmail(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  )}
                </div>

                {/* CC Recipients Section */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Penerima CC (Tembusan Rekan / Pimpinan):
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {reportCcList.map((cc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 shadow-2xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      >
                        <span>{cc}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCc(cc)}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="Tambah email CC (misal: dirut@asliri.id, finance@asliri.id)..."
                      value={reportCcInput}
                      onChange={e => setReportCcInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCc();
                        }
                      }}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCc}
                      className="rounded-xl bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      Tambah CC
                    </button>
                  </div>
                </div>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={handleSendReportEmail}
                  disabled={isSendingReportEmail}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-98 transition disabled:opacity-50 cursor-pointer"
                >
                  <Mail className="h-4 w-4" />
                  <span>
                    {isSendingReportEmail
                      ? 'Mengirim Laporan...'
                      : `Kirim Laporan Lengkap via Email (${reportCcList.length} CC)`}
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak Ringkasan</span>
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="rounded-xl bg-slate-950 dark:bg-white px-4 py-1.5 text-xs font-bold text-white dark:text-slate-950 hover:bg-black dark:hover:bg-slate-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL KIRIM CARD KE GROUP UNTUK APPROVAL MANAJER */}
      {approvalModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Kirim Card ke Group untuk Approval
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Kirim kartu tugas terstruktur ke channel dengan tombol Setujui/Tolak otomatis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApprovalModalTask(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Task summary preview formatted exactly like Chat Approval Card */}
              <div className="rounded-2xl border border-amber-300/80 bg-linear-to-br from-amber-500/10 via-amber-500/5 to-slate-900/10 p-4 space-y-3 dark:border-amber-600/40">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    <FileBarChart className="h-4 w-4" />
                    <span>Card Approval Tugas (Tampilan di Chat)</span>
                  </span>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                    ON REVIEW
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {approvalModalTask.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    {approvalModalTask.project} • Assignee: <strong>{approvalModalTask.assigneeName}</strong>
                  </p>
                  {approvalModalTask.deadline && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Deadline: {approvalModalTask.deadline}
                    </p>
                  )}
                </div>

                {/* Simulated action buttons */}
                <div className="pt-2 border-t border-amber-200/60 dark:border-slate-800 flex items-center gap-2">
                  <div className="flex-1 rounded-xl bg-white/70 dark:bg-slate-800 py-1.5 text-[11px] font-bold text-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    ✕ Tolak
                  </div>
                  <div className="flex-1 rounded-xl bg-emerald-500 py-1.5 text-[11px] font-bold text-center text-white shadow-xs">
                    ✓ Setujui (Approve)
                  </div>
                </div>
              </div>

              {/* Target Channel Selector */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Pilih Channel / Grup Tujuan *
                </label>
                <select
                  value={approvalChannelId}
                  onChange={e => setApprovalChannelId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  {channels.map(c => (
                    <option key={c.id} value={c.id}>
                      #{c.name} ({c.type === 'channel' ? 'Channel Tim' : 'Pesan Langsung'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Managers / Approvers Multi-Selection */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Pilih Manajer Penyetuju (Bisa lebih dari 1)
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {users
                    .filter(u => u.role === 'manager' || u.role === 'super_admin' || u.role === 'admin' || u.id !== currentUser.id)
                    .map(m => {
                      const isSelected = approvalManagerIds.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => {
                            if (isSelected) {
                              setApprovalManagerIds(approvalManagerIds.filter(id => id !== m.id));
                            } else {
                              setApprovalManagerIds([...approvalManagerIds, m.id]);
                            }
                          }}
                          className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition ${
                            isSelected
                              ? 'border-blue-300 bg-blue-50/80 text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200'
                              : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-blue-600 pointer-events-none"
                            />
                            <img src={m.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                            <div>
                              <div className="font-bold leading-none">{m.name}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{m.department} • {m.role}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-blue-600">Dipilih</span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-[11px] text-amber-800 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60">
                💡 <strong>Catatan Sistem:</strong> Ketika semua manajer yang dipilih memberikan persetujuan (Approve), kartu ini akan <strong>secara otomatis dipindahkan ke status Done (Selesai)</strong>.
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setApprovalModalTask(null)}
                className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!approvalModalTask) return;
                  const targetChn = channels.find(c => c.id === approvalChannelId) || channels[0];
                  const channelIdToUse = targetChn ? targetChn.id : (channels[0]?.id || 'chn_general');
                  const finalManagerIds = approvalManagerIds.length > 0
                    ? approvalManagerIds
                    : users.filter(u => u.role === 'manager' || u.role === 'super_admin' || u.role === 'admin').map(u => u.id).slice(0, 2);

                  sendTaskForApproval(approvalModalTask.id, channelIdToUse, finalManagerIds, approvalCustomMessage);
                  setApprovalModalTask(null);
                  setApprovalManagerIds([]);
                }}
                className="rounded-2xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md transition cursor-pointer"
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
