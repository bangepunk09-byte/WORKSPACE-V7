import React, { useState } from 'react';
import {
  X,
  Calendar,
  CalendarCheck,
  UserCheck,
  ShieldCheck,
  FileText,
  Clock,
  Send,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Paperclip
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { LeaveType, User } from '../../types';

interface LeaveRequestModalProps {
  onClose: () => void;
  defaultChannelId?: string;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  onClose,
  defaultChannelId
}) => {
  const {
    currentUser,
    users,
    channels,
    activeChannelId,
    submitLeaveRequest,
    setActiveChannelId,
    setActiveTab
  } = useWorkspace();

  const [leaveType, setLeaveType] = useState<LeaveType>('cuti_tahunan');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [reason, setReason] = useState('');
  
  // Potential bosses/supervisors (default to Dimas Aditya or supervisor)
  const defaultBoss = users.find(u => u.position.toLowerCase().includes('lead') || u.position.toLowerCase().includes('director') || u.role === 'manager' || u.role === 'admin') || users[0];
  const [selectedBossId, setSelectedBossId] = useState<string>(defaultBoss?.id || '');

  // Potential HR representatives (default to Sarah Jenkins or HR user)
  const defaultHr = users.find(u => u.department.toLowerCase().includes('hr') || u.position.toLowerCase().includes('hr')) || users[1] || users[0];
  const [selectedHrId, setSelectedHrId] = useState<string>(defaultHr?.id || '');

  // Target channel for the interactive chat card
  const defaultTargetChannel = defaultChannelId || activeChannelId || channels[0]?.id || 'chn_general';
  const [targetChannelId, setTargetChannelId] = useState<string>(defaultTargetChannel);

  // Optional attachment state
  const [hasAttachment, setHasAttachment] = useState(false);
  const [attachmentName, setAttachmentName] = useState('Surat_Keterangan_Cuti.pdf');

  // Compute total days
  const calculateDays = () => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  };

  const totalDays = calculateDays();

  const LEAVE_TYPE_OPTIONS: { id: LeaveType; label: string; icon: string; desc: string }[] = [
    {
      id: 'cuti_tahunan',
      label: 'Cuti Tahunan',
      icon: '🏖️',
      desc: 'Pengambilan kuota cuti tahunan reguler'
    },
    {
      id: 'cuti_sakit',
      label: 'Cuti Sakit',
      icon: '🤒',
      desc: 'Izin istirahat medis / sakit berobat'
    },
    {
      id: 'cuti_alasan_penting',
      label: 'Alasan Penting / Darurat',
      icon: '🚨',
      desc: 'Keperluan keluarga mendesak atau duka'
    },
    {
      id: 'cuti_melahirkan',
      label: 'Cuti Melahirkan / Ayah',
      icon: '👶',
      desc: 'Cuti melahirkan atau mendampingi istri'
    },
    {
      id: 'izin_khusus',
      label: 'Izin Khusus / Keperluan Mendesak',
      icon: '📋',
      desc: 'Izin khusus dengan kompensasi jam kerja'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    const selectedBoss = users.find(u => u.id === selectedBossId) || defaultBoss;
    const selectedHr = users.find(u => u.id === selectedHrId) || defaultHr;
    const selectedTypeObj = LEAVE_TYPE_OPTIONS.find(t => t.id === leaveType);

    submitLeaveRequest(
      targetChannelId,
      {
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        requesterAvatar: currentUser.avatar,
        requesterDept: currentUser.department,
        requesterPosition: currentUser.position,
        leaveType,
        leaveTypeLabel: selectedTypeObj?.label || 'Cuti Tahunan',
        startDate,
        endDate,
        totalDays,
        reason: reason.trim(),
        attachmentName: hasAttachment ? attachmentName : undefined,
        attachmentUrl: hasAttachment ? 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80' : undefined
      },
      selectedBoss,
      selectedHr
    );

    // Switch to chat view and navigate to that channel so user immediately sees their request card
    setActiveChannelId(targetChannelId);
    setActiveTab('chat');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-500 text-white shadow-md">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Form Pengajuan Izin Cuti
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kirim pengajuan cuti resmi ke Atasan Langsung & HR via integrasi Chat terpadu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Pemohon Snapshot */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Karyawan Pemohon
                </span>
                <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {currentUser.position} • {currentUser.department}
                </div>
              </div>
            </div>
            <span className="rounded-xl bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Sisa Kuota: 12 Hari
            </span>
          </div>

          {/* Jenis Cuti Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Pilih Jenis Cuti
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LEAVE_TYPE_OPTIONS.map(opt => {
                const isSelected = leaveType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLeaveType(opt.id)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{opt.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tanggal Mulai, Selesai & Durasi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                <span>Tanggal Mulai</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                <span>Tanggal Selesai</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                <span>Total Durasi</span>
              </label>
              <div className="flex h-[38px] items-center rounded-xl bg-slate-100 px-3.5 text-xs font-bold text-indigo-700 dark:bg-slate-800 dark:text-indigo-400 border border-slate-200/80 dark:border-slate-700">
                {totalDays} Hari Kerja
              </div>
            </div>
          </div>

          {/* Alasan Cuti */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Alasan Pengajuan Cuti / Keterangan Lengkap <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Contoh: Mengurus keperluan keluarga mendesak di luar kota dan menghadiri pernikahan saudara..."
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Approvers Selection: Atasan Langsung & Tim HR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Boss / Atasan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                <span>Pilih Atasan Langsung (Boss)</span>
              </label>
              <select
                value={selectedBossId}
                onChange={e => setSelectedBossId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:border-indigo-500 cursor-pointer"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.position} ({u.department})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Atasan akan menerima permohonan persetujuan tahap 1 di chat.
              </p>
            </div>

            {/* HR Representative */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-sky-600" />
                <span>Pilih Perwakilan HR (People Ops)</span>
              </label>
              <select
                value={selectedHrId}
                onChange={e => setSelectedHrId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:border-indigo-500 cursor-pointer"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.position} ({u.department})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                HR memvalidasi kuota cuti dan memberikan approval final.
              </p>
            </div>
          </div>

          {/* Target Chat Channel & Optional Attachment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Saluran Chat Tujuan (Kirim Kartu)
              </label>
              <select
                value={targetChannelId}
                onChange={e => setTargetChannelId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:border-indigo-500 cursor-pointer"
              >
                {channels.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.type === 'direct' ? '👤 Direct Message' : `# ${c.name}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Lampiran / Surat Keterangan Dokter (Opsional)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHasAttachment(!hasAttachment)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition cursor-pointer ${
                    hasAttachment
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>{hasAttachment ? 'Lampiran Terpasang ✓' : '+ Tambah Lampiran File'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dual Approval Pipeline Notice Box */}
          <div className="rounded-2xl bg-indigo-50/70 p-3.5 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/80 text-xs space-y-1.5">
            <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Alur Persetujuan Ganda (Dual-Approval) Terintegrasi:</span>
            </div>
            <p className="text-[11px] text-indigo-800 dark:text-indigo-300 leading-relaxed">
              1. Kartu pengajuan terkirim langsung ke Chat.<br />
              2. <strong>Atasan Langsung</strong> memeriksa & meng-approve kartu.<br />
              3. <strong>Tim HR</strong> memverifikasi & meng-approve tahap akhir.<br />
              4. Ketika <strong>keduanya sudah approve</strong>, notifikasi resmi terbit dan status cuti sah.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-6 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Kirim Pengajuan Cuti via Chat</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
