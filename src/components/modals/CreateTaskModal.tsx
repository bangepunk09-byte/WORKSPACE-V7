import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Check,
  Calendar,
  User as UserIcon,
  Flag,
  Clock,
  Layers,
  Paperclip,
  Share2,
  Bell,
  MoreHorizontal,
  AtSign,
  Image as ImageIcon,
  Smile,
  GripVertical,
  Link2,
  Maximize2,
  Grid,
  SlidersHorizontal,
  FolderKanban,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Sliders,
  Tag,
  Building2,
  Trash2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  RotateCcw,
  Eye,
  FileText,
  Link as LinkIcon
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TaskPriority, TaskStatus, Attachment, TaskPhase } from '../../types';

interface SubtaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export const CreateTaskModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentUser, users, createTask, divisions, selectedTaskGroup, managedBrands } = useWorkspace();

  const [title, setTitle] = useState('Widelab: Review Design');
  const [description, setDescription] = useState('');
  const [descriptionTab, setDescriptionTab] = useState<'description' | 'preview'>('description');
  const [isPublic, setIsPublic] = useState(true);

  // Attributes
  const [project, setProject] = useState('Campaign Creative & Video');
  const [divisionId, setDivisionId] = useState<string>(() => {
    if (selectedTaskGroup && selectedTaskGroup !== 'all') return selectedTaskGroup;
    return divisions[0]?.id || 'marketing';
  });
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [status, setStatus] = useState<TaskStatus>('on_progress');
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [deadline, setDeadline] = useState('2026-11-14');

  // Detail Card Integrated Fields
  const [brand, setBrand] = useState('ASLI RI');
  const [category, setCategory] = useState<'Design' | 'Video' | 'Content' | 'Other'>('Design');
  const [taskType, setTaskType] = useState<'Regular' | 'Campaign' | 'Urgent'>('Regular');
  const [showExtraAttributes, setShowExtraAttributes] = useState(false);

  // Subtasks matching attached image (image_f16946e7.png)
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([
    { id: 'st_1', text: 'Create real-time socket for agenda', completed: true },
    { id: 'st_2', text: 'Suggest a discussion of statistics', completed: false }
  ]);
  const [currentSubtaskInput, setCurrentSubtaskInput] = useState('Responsive');
  const [showSubtaskInput, setShowSubtaskInput] = useState(true);

  // File Attachments
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleSubtask = (id: string) => {
    setSubtasks(prev =>
      prev.map(st => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleSaveSubtask = () => {
    if (!currentSubtaskInput.trim()) return;
    setSubtasks(prev => [
      ...prev,
      { id: 'st_' + Date.now(), text: currentSubtaskInput.trim(), completed: false }
    ]);
    setCurrentSubtaskInput('');
  };

  const handleDiscardSubtask = () => {
    setCurrentSubtaskInput('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImg = file.type.startsWith('image/');
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setAttachments(prev => [
        ...prev,
        {
          name: file.name,
          url,
          type: isImg ? 'image' : 'document',
          size: `${sizeMb === '0.0' ? (file.size / 1024).toFixed(0) + ' KB' : sizeMb + ' MB'}`
        }
      ]);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const selectedAssignee = users.find(u => u.id === assigneeId) || currentUser;
  const targetDivision = divisions.find(d => d.id === divisionId) || divisions[0];

  // SUBMIT & SYNC TO TASK DETAIL CARD DATA STRUCTURE
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskCode = `CT-04` + Math.floor(10 + Math.random() * 90);
    const formattedPublishDate = deadline
      ? new Date(deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : '14 Nov 2026';
    const briefDeadlineStr = deadline
      ? new Date(new Date(deadline).getTime() - 2 * 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      : '12 Nov';
    const designDeadlineStr = deadline
      ? new Date(new Date(deadline).getTime() - 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      : '13 Nov';

    // Status mapping for TaskDetailDrawer Total Progress Header
    const statusToOverall: Record<TaskStatus, string> = {
      not_started: 'To Do',
      todo: 'To Do',
      backlog: 'To Do',
      on_progress: 'In Progress',
      in_progress: 'In Progress',
      on_review: 'In Review',
      review: 'In Review',
      done: 'Completed'
    };
    const overallStatus = statusToOverall[status] || 'In Progress';

    // Map subtasks to checklists
    const checklists = subtasks.map(st => ({
      id: st.id,
      text: st.text,
      completed: st.completed
    }));

    // Pre-populate Phase 01 & Phase 02 for TaskDetailDrawer
    const defaultApprover = users.find(u => u.role === 'manager' || u.role === 'super_admin')?.id || currentUser.id;
    const defaultApproverUser = users.find(u => u.id === defaultApprover);

    const initialPhases: TaskPhase[] = [
      {
        id: 'phase-01',
        name: 'PHASE 01 — Content Brief',
        order: 1,
        assignedUserId: selectedAssignee.id,
        assignedUserName: selectedAssignee.name,
        assignedUserAvatar: selectedAssignee.avatar,
        assignedUserIds: [selectedAssignee.id],
        assignedUsers: [
          {
            id: selectedAssignee.id,
            name: selectedAssignee.name,
            avatar: selectedAssignee.avatar
          }
        ],
        approverUserId: defaultApprover,
        approverUserName: defaultApproverUser?.name || 'Sarah Jenkins',
        approverUserAvatar: defaultApproverUser?.avatar,
        deadline: briefDeadlineStr,
        estimatedTime: '2 Hari',
        status: status === 'done' ? 'approved' : 'in_progress',
        briefContent: description.trim() || `Konten brief untuk ${title.trim()}`,
        approvalRequired: true
      },
      {
        id: 'phase-02',
        name: 'PHASE 02 — Design Production',
        order: 2,
        assignedUserId: selectedAssignee.id,
        assignedUserName: selectedAssignee.name,
        assignedUserAvatar: selectedAssignee.avatar,
        assignedUserIds: [selectedAssignee.id],
        assignedUsers: [
          {
            id: selectedAssignee.id,
            name: selectedAssignee.name,
            avatar: selectedAssignee.avatar
          }
        ],
        approverUserId: defaultApprover,
        approverUserName: defaultApproverUser?.name || 'Sarah Jenkins',
        approverUserAvatar: defaultApproverUser?.avatar,
        deadline: designDeadlineStr,
        estimatedTime: '3 Hari',
        status: status === 'done' ? 'approved' : status === 'on_review' ? 'pending_approval' : 'waiting',
        designLink: '',
        notes: '',
        attachments: attachments.map(att => ({
          id: 'att_' + Date.now() + Math.random(),
          name: att.name,
          url: att.url,
          type: att.type || 'image/png',
          size: att.size || '1.2 MB',
          uploadedAt: 'Baru saja'
        })),
        approvalRequired: true
      }
    ];

    createTask({
      title: title.trim(),
      description: description.trim(),
      project,
      status,
      overallStatus,
      priority,
      category,
      taskType,
      brand,
      taskCode,
      publishDate: formattedPublishDate,
      briefDeadline: briefDeadlineStr,
      designDeadline: designDeadlineStr,
      assigneeId: selectedAssignee.id,
      assigneeName: selectedAssignee.name,
      assigneeAvatar: selectedAssignee.avatar,
      assigneeDept: targetDivision?.departmentMatch || selectedAssignee.department,
      assignees: [
        {
          id: selectedAssignee.id,
          name: selectedAssignee.name,
          avatar: selectedAssignee.avatar,
          dept: targetDivision?.departmentMatch || selectedAssignee.department,
          role: selectedAssignee.position
        }
      ],
      groupId: targetDivision?.id || 'marketing',
      groupName: targetDivision?.name || 'Marketing & Brand',
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      deadline,
      labels: [project, targetDivision?.name || 'Division', brand],
      checklists,
      phases: initialPhases,
      attachments: attachments.length > 0 ? attachments : undefined,
      revisionCount: 0,
      totalDurationText: '2 Hari 4 Jam',
      approvalTimeText: '1.5 Jam',
      revisionTimeText: '0 Jam',
      isOnTime: true
    });

    onClose();
  };

  // Available brands from workspace or fallback list
  const availableBrands = managedBrands && managedBrands.length > 0
    ? managedBrands.map(b => b.name)
    : ['ASLI RI', 'BANK ABDI', 'TIXFLY', 'TRINITY', 'MOVADEX'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-5xl rounded-3xl bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        {/* Hidden File Input for Real Attachments */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* ================= LEFT MAIN FORM PANEL ================= */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 overflow-y-auto bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-800">
          <div className="space-y-6">
            {/* Top Breadcrumb & Controls Row (Matching image_f16946e7.png) */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="hover:text-slate-600 transition">Projects</span>
                <span>/</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">Create a task</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Public Toggle: Color RED (#EF2028) */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isPublic ? 'bg-[#EF2028]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isPublic ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Public</span>
                </div>

                <button
                  type="button"
                  title="Copy Link"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Link2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Maximize"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  title="Tutup"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Task Title Input matching "Widelab: Review Design" */}
            <div>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter task name or title..."
                className="w-full text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white bg-transparent border-none focus:outline-none placeholder:text-slate-300 tracking-tight"
                autoFocus
              />
            </div>

            {/* Description Section with Advanced Inline RTE (Matching Task Detail View) */}
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setDescriptionTab('description')}
                  className={`transition pb-1 cursor-pointer ${
                    descriptionTab === 'description'
                      ? 'text-[#EF2028] dark:text-[#EF2028] border-b-2 border-[#EF2028]'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Description
                </button>
                <button
                  type="button"
                  onClick={() => setDescriptionTab('preview')}
                  className={`transition pb-1 cursor-pointer ${
                    descriptionTab === 'preview'
                      ? 'text-[#EF2028] dark:text-[#EF2028] border-b-2 border-[#EF2028]'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Preview
                </button>
              </div>

              {descriptionTab === 'description' ? (
                <div className="space-y-2">
                  {/* Inline RTE Toolbar matching Task Detail View */}
                  <div className="flex flex-wrap items-center gap-1 bg-slate-50 dark:bg-slate-800/90 p-2 rounded-2xl border border-slate-200/90 dark:border-slate-700 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">RTE Format:</span>
                    <button
                      type="button"
                      onClick={() => setDescription(prev => prev + '\n**Teks Tebal (Bold)**')}
                      className="h-7 px-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 transition"
                      title="Bold"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescription(prev => prev + '\n*Teks Miring (Italic)*')}
                      className="h-7 px-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 transition"
                      title="Italic"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescription(prev => prev + '\n<u>Teks Garis Bawah</u>')}
                      className="h-7 px-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 transition"
                      title="Underline"
                    >
                      <Underline className="h-3.5 w-3.5" />
                    </button>
                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
                    <button
                      type="button"
                      onClick={() => setDescription(prev => prev + '\n- Poin list item')}
                      className="h-7 px-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 transition"
                      title="Bullet List"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescription(prev => prev + '\n1. Nomor poin item')}
                      className="h-7 px-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 transition"
                      title="Numbered List"
                    >
                      <ListOrdered className="h-3.5 w-3.5" />
                    </button>
                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
                    <button
                      type="button"
                      onClick={() => {
                        const tpl = '### 📱 Brief Promo Media Sosial\n- Target Audiens: Profesional\n- Hook Utama: "Tingkatkan produktivitas kerja!"';
                        setDescription(prev => prev ? `${prev}\n\n${tpl}` : tpl);
                      }}
                      className="h-7 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#EF2028] dark:bg-red-950/50 dark:text-red-300 font-bold flex items-center gap-1 transition"
                      title="Insert Template Brief"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Template</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const ai = '### 🤖 AI-Generated Brief\n- Analisis tren konten kreatif terbaru.\n- Fokus pada visual estetik & interaktif.';
                        setDescription(prev => prev ? `${prev}\n\n${ai}` : ai);
                        alert('✨ Brief berhasil digenerate oleh AI!');
                      }}
                      className="h-7 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold flex items-center gap-1 transition"
                      title="AI Generate Brief"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>AI Generate</span>
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-3.5 focus-within:border-[#EF2028] transition shadow-2xs">
                    <textarea
                      rows={4}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Tulis brief konten lengkap di sini... (Gunakan toolbar RTE di atas untuk format Bold, Italic, List, atau Template)"
                      className="w-full text-xs font-medium text-slate-800 dark:text-slate-200 bg-transparent border-none focus:outline-none resize-none placeholder:text-slate-400"
                    />
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-slate-400 text-xs">
                      <div className="flex items-center gap-3">
                        <button type="button" className="hover:text-slate-600 dark:hover:text-slate-200" title="Mention">
                          <AtSign className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="hover:text-[#EF2028] transition"
                          title="Attach image"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </button>
                        <button type="button" className="hover:text-slate-600 dark:hover:text-slate-200" title="Emoji">
                          <Smile className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {description.length} karakter ({description.trim() ? description.trim().split(/\s+/).length : 0} kata)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-4 min-h-[120px] text-xs text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap">
                  {description || <span className="text-slate-400 italic">Belum ada deskripsi / brief yang ditulis.</span>}
                </div>
              )}
            </div>

            {/* SUB-TASKS Section with RED Accent (#EF2028) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  SUB-TASKS
                </span>
                {/* Red bar indicator as requested */}
                <span className="h-1.5 w-6 rounded-full bg-[#EF2028] inline-block" />
              </div>

              {/* Subtask Items */}
              <div className="space-y-2">
                {subtasks.map(st => (
                  <div
                    key={st.id}
                    className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 group/st"
                  >
                    <GripVertical className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0 cursor-grab" />
                    {/* Checkbox with RED fill when checked */}
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(st.id)}
                      className={`flex h-4.5 w-4.5 items-center justify-center rounded-md transition ${
                        st.completed
                          ? 'bg-[#EF2028] text-white'
                          : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {st.completed && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>
                    <span
                      onClick={() => handleToggleSubtask(st.id)}
                      className={`flex-1 cursor-pointer ${
                        st.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {st.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="opacity-0 group-hover/st:opacity-100 text-slate-400 hover:text-rose-500 transition p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Active input field with RED border (#EF2028) */}
              {showSubtaskInput && (
                <div className="space-y-1.5 pt-1">
                  <div className="rounded-xl border-2 border-[#EF2028] bg-white dark:bg-slate-800 p-2.5 shadow-2xs">
                    <input
                      type="text"
                      value={currentSubtaskInput}
                      onChange={e => setCurrentSubtaskInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveSubtask();
                        }
                      }}
                      placeholder="Type subtask name..."
                      className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent border-none focus:outline-none placeholder:text-slate-300"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold px-1">
                    <button
                      type="button"
                      onClick={handleDiscardSubtask}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                    >
                      Discard
                    </button>
                    {/* Red save task text */}
                    <button
                      type="button"
                      onClick={handleSaveSubtask}
                      className="text-[#EF2028] hover:text-red-700 transition cursor-pointer"
                    >
                      Save task
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Attached Files List if any */}
            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-500 block">
                  Berkas Terlampir ({attachments.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                    >
                      <Paperclip className="h-3 w-3 text-[#EF2028]" />
                      <span className="max-w-[120px] truncate">{att.name}</span>
                      <span className="text-[10px] text-slate-400">({att.size})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="text-slate-400 hover:text-red-600 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar: Attachment | Relationship | Alert | ... More */}
          <div className="flex items-center gap-2 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-[#EF2028] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-2xs transition cursor-pointer"
            >
              <Paperclip className="h-3.5 w-3.5 text-slate-500" />
              <span>Attachment {attachments.length > 0 && `(${attachments.length})`}</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-2xs transition"
            >
              <Share2 className="h-3.5 w-3.5 text-slate-500" />
              <span>Relationship</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-2xs transition"
            >
              <Bell className="h-3.5 w-3.5 text-slate-500" />
              <span>Alert</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 shadow-2xs transition"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
              <span>More</span>
            </button>
          </div>
        </div>

        {/* ================= RIGHT ATTRIBUTES SIDEBAR ================= */}
        <div className="w-full md:w-80 p-6 sm:p-7 flex flex-col justify-between bg-[#F8FAFC] dark:bg-slate-900/90 space-y-6">
          <div className="space-y-6">
            {/* Project Selector Header matching "Select a project >" with RED Grid icon */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800 p-3 flex items-center justify-between shadow-2xs cursor-pointer hover:border-slate-300 transition">
              <div className="flex items-center gap-2.5 min-w-0">
                <Grid className="h-4 w-4 text-[#EF2028] shrink-0" />
                <select
                  value={project}
                  onChange={e => setProject(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer truncate"
                >
                  <option value="Campaign Creative & Video">Campaign Creative & Video</option>
                  <option value="Widelab Campaign & Design">Widelab Campaign & Design</option>
                  <option value="Digital Security Awareness">Digital Security Awareness</option>
                  <option value="Biometric Engine ASLI RI">Biometric Engine ASLI RI</option>
                  <option value="Mobile App Redesign">Mobile App Redesign</option>
                </select>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
            </div>

            {/* ATTRIBUTES List Header */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">
                <span>ATTRIBUTES</span>
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              </div>

              {/* Attributes Rows matching reference */}
              <div className="space-y-3.5 text-xs font-bold">
                {/* 1. Status Attribute */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Status</span>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as TaskStatus)}
                      className="appearance-none inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 px-3 py-1 text-xs font-bold cursor-pointer pr-6 shadow-2xs"
                    >
                      <option value="not_started">● Not started</option>
                      <option value="on_progress">● In progress</option>
                      <option value="on_review">● On review</option>
                      <option value="done">● Done</option>
                    </select>
                  </div>
                </div>

                {/* 2. Priority Attribute */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Priority</span>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as TaskPriority)}
                    className="appearance-none inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40 px-3 py-1 text-xs font-bold cursor-pointer pr-6 shadow-2xs"
                  >
                    <option value="urgent">! Urgent</option>
                    <option value="high">! High</option>
                    <option value="medium">● Medium</option>
                    <option value="low">● Low</option>
                  </select>
                </div>

                {/* 3. Assignee Attribute */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Assignee</span>
                  <div className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white dark:bg-slate-800 px-2.5 py-1 shadow-2xs">
                    <img
                      src={selectedAssignee.avatar}
                      alt={selectedAssignee.name}
                      className="h-5 w-5 rounded-full object-cover shrink-0"
                    />
                    <select
                      value={assigneeId}
                      onChange={e => setAssigneeId(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[120px] truncate"
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.id} className="dark:bg-slate-900">
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Due Date Attribute (Red Calendar Icon) */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Due date</span>
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                    <Calendar className="h-3.5 w-3.5 text-[#EF2028] shrink-0" />
                    <input
                      type="date"
                      value={deadline}
                      onChange={e => setDeadline(e.target.value)}
                      className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* 5. Division Attribute */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Division</span>
                  <select
                    value={divisionId}
                    onChange={e => setDivisionId(e.target.value)}
                    className="rounded-xl border border-slate-200/80 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[140px] truncate shadow-2xs uppercase"
                  >
                    {divisions.map(d => (
                      <option key={d.id} value={d.id} className="dark:bg-slate-900">
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. Brand Attribute (Integrated with Task Detail Card) */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Brand</span>
                  <select
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="rounded-xl border border-slate-200/80 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[140px] truncate shadow-2xs uppercase"
                  >
                    {availableBrands.map(b => (
                      <option key={b} value={b} className="dark:bg-slate-900">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7. Category Attribute (Integrated with Task Detail Card) */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Category</span>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="rounded-xl border border-slate-200/80 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[140px] truncate shadow-2xs"
                  >
                    <option value="Design">Design</option>
                    <option value="Video">Video</option>
                    <option value="Content">Content</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* 8. Task Type Attribute (Integrated with Task Detail Card) */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Task Type</span>
                  <select
                    value={taskType}
                    onChange={e => setTaskType(e.target.value as any)}
                    className="rounded-xl border border-slate-200/80 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[140px] truncate shadow-2xs"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Campaign">Campaign</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* + Add attribute link */}
              <button
                type="button"
                onClick={() => setShowExtraAttributes(!showExtraAttributes)}
                className="mt-3 text-xs font-bold text-slate-400 hover:text-[#EF2028] dark:hover:text-red-400 inline-flex items-center gap-1 transition cursor-pointer"
              >
                <span>{showExtraAttributes ? '− Sembunyikan atribut ekstra' : '+ Add attribute'}</span>
              </button>

              {showExtraAttributes && (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1 animate-in fade-in">
                  <div className="font-bold text-slate-700 dark:text-slate-200">
                    Atribut Tambahan Otomatis:
                  </div>
                  <div>• Kode Tugas: Otomatis di-generate (CT-04xx)</div>
                  <div>• Timeline & Phase 01 / Phase 02 otomatis disiapkan</div>
                  <div>• Label terhubung: [{project}, {brand}, {targetDivision?.name}]</div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Buttons: Cancel | + Create (RED #EF2028) */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200/90 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-xl bg-[#EF2028] hover:bg-[#dc1a22] text-white px-5 py-2 text-xs font-bold transition shadow-md active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
