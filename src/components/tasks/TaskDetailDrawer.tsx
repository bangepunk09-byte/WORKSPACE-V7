/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Reworked Task Detail Card Component
 * Fully functional Phase-based Workflow, Header Controls, Auto Progress, Right Sidebar Metrics,
 * Dynamic Admin Phase Management, Rich Text Brief, Live Image Attachment Thumbnails + Lightbox,
 * UI Calendar Pickers for Deadlines (No typing), and Multi-Select Assignees (Edit Assigned to).
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  Clock,
  Send,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  User as UserIcon,
  Smile,
  AtSign,
  Link as LinkIcon,
  ExternalLink,
  ChevronDown,
  Info,
  Check,
  Edit2,
  FileText,
  UploadCloud,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Image as ImageIcon,
  Download,
  Maximize2
} from 'lucide-react';
import {
  Task,
  User,
  ManagedBrand,
  TaskPhase,
  PhaseStatus,
  TaskPhaseAttachment,
  DetailedTaskComment,
  DetailedTaskCommentReply,
  DetailedTaskActivity
} from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';

interface TaskDetailDrawerProps {
  task: Task | null;
  onClose: () => void;
  currentUser: User;
}

// ==========================================
// DATE PICKER PILL COMPONENT (UI CALENDAR)
// ==========================================
const DatePickerPill: React.FC<{
  label?: string;
  value?: string;
  onChange: (formattedDisplay: string, isoValue: string) => void;
  className?: string;
}> = ({ label, value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nativeInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to parse existing string into YYYY-MM-DD
  const getIsoString = (val?: string): string => {
    if (!val || val === '-') {
      return new Date().toISOString().split('T')[0];
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;

    const currentYear = new Date().getFullYear();
    let clean = val.trim();
    if (!/\d{4}/.test(clean)) {
      clean += ` ${currentYear}`;
    }
    const parsed = new Date(clean);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  // Helper to format ISO string into clean display text (e.g. "9 Nov", "13 Nov 2026")
  const formatDisplay = (isoStr: string): string => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      const currentYear = new Date().getFullYear();
      if (d.getFullYear() === currentYear) {
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      }
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  const isoValue = getIsoString(value);
  const displayText = value && value !== '-' ? value : formatDisplay(isoValue);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectIso = (newIso: string) => {
    if (!newIso) return;
    const formatted = formatDisplay(newIso);
    onChange(formatted, newIso);
    setIsOpen(false);
  };

  const applyPresetDays = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const newIso = d.toISOString().split('T')[0];
    handleSelectIso(newIso);
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={className || "h-9 px-4 rounded-full border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-2xs hover:border-[#EF2028] dark:hover:border-red-500 transition cursor-pointer flex items-center justify-center gap-1.5 min-w-[80px]"}
      >
        {label && <span className="text-slate-400 font-semibold">{label}</span>}
        <span>{displayText}</span>
        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      </button>

      {/* Popover UI Calendar Selector */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-64 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#EF2028]" /> Edit Tanggal
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Pilih Dari Kalender
              </label>
              <input
                ref={nativeInputRef}
                type="date"
                value={isoValue}
                onChange={e => handleSelectIso(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#EF2028] cursor-pointer"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Pilihan Cepat
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPresetDays(0)}
                  className="px-2 py-1.5 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-red-50 hover:text-[#EF2028] dark:bg-slate-700 dark:hover:bg-slate-600 transition text-slate-700 dark:text-slate-200 text-center cursor-pointer"
                >
                  Hari ini
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays(1)}
                  className="px-2 py-1.5 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-red-50 hover:text-[#EF2028] dark:bg-slate-700 dark:hover:bg-slate-600 transition text-slate-700 dark:text-slate-200 text-center cursor-pointer"
                >
                  Besok
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays(7)}
                  className="px-2 py-1.5 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-red-50 hover:text-[#EF2028] dark:bg-slate-700 dark:hover:bg-slate-600 transition text-slate-700 dark:text-slate-200 text-center cursor-pointer"
                >
                  +1 Minggu
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays(14)}
                  className="px-2 py-1.5 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-red-50 hover:text-[#EF2028] dark:bg-slate-700 dark:hover:bg-slate-600 transition text-slate-700 dark:text-slate-200 text-center cursor-pointer"
                >
                  +2 Minggu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// ADVANCED CONTENT BRIEF EDITOR COMPONENT (RTE)
// ==========================================
const AdvancedPhaseBriefEditor: React.FC<{
  taskTitle: string;
  initialContent?: string;
  onChange: (val: string) => void;
}> = ({ taskTitle, initialContent = '', onChange }) => {
  const [content, setContent] = useState(initialContent);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [showHeadingsMenu, setShowHeadingsMenu] = useState(false);
  const [referenceImages, setReferenceImages] = useState<Array<{ id: string; url: string; name: string }>>([]);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);

  // Undo / Redo History State
  const [history, setHistory] = useState<string[]>([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setContent(initialContent);
    setHistory([initialContent]);
    setHistoryIndex(0);
  }, [initialContent]);

  const updateContent = (newVal: string) => {
    setContent(newVal);
    onChange(newVal);

    // Save history snapshot
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newVal);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevVal = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setContent(prevVal);
      onChange(prevVal);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextVal = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setContent(nextVal);
      onChange(nextVal);
    }
  };

  const handleInsertText = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      updateContent(content + `${prefix}${suffix}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const hasSelection = start !== end;
    const selected = content.substring(start, end);
    const textToWrap = hasSelection ? selected : '';
    const replacement = `${prefix}${textToWrap}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    updateContent(newContent);

    setTimeout(() => {
      textarea.focus();
      if (hasSelection) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length);
      }
    }, 20);
  };

  const handleApplyHeading = (level: string) => {
    setShowHeadingsMenu(false);
    if (level === 'p') {
      handleInsertText('', '');
    } else if (level === 'h1') {
      handleInsertText('\n# ', '');
    } else if (level === 'h2') {
      handleInsertText('\n## ', '');
    } else if (level === 'h3') {
      handleInsertText('\n### ', '');
    } else if (level === 'quote') {
      handleInsertText('\n> ', '');
    }
  };

  const handleApplyAlignment = (align: 'left' | 'center' | 'right') => {
    handleInsertText(`<div align="${align}">`, `</div>`);
  };

  const handleAttachReferenceImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImgs: Array<{ id: string; url: string; name: string }> = [];
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const imgObj = {
        id: `ref_img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        url,
        name: file.name
      };
      newImgs.push(imgObj);
    });

    setReferenceImages(prev => [...prev, ...newImgs]);

    // Insert first image markdown into content as well
    if (newImgs.length > 0) {
      const imgMd = `\n\n![Foto Referensi - ${newImgs[0].name}](${newImgs[0].url})\n`;
      updateContent(content + imgMd);
    }

    if (e.target) e.target.value = '';
  };

  const handleRemoveRefImage = (id: string) => {
    setReferenceImages(prev => prev.filter(img => img.id !== id));
  };

  const handleInsertTemplate = (templateType: string) => {
    let tpl = '';
    if (templateType === 'social') {
      tpl = `### 📱 Brief Promo Media Sosial (Instagram / TikTok)\n\n` +
        `**1. Target Audiens:** Profesional muda (usia 20-35 tahun)\n` +
        `**2. Hook Utama:** "Tingkatkan produktivitas kerja 2x lipat tanpa stress!"\n` +
        `**3. Pesan Kunci:** Edukasi peregangan & habit bekerja cerdas.\n` +
        `**4. Call-to-Action (CTA):** Simpan & bagikan ke rekan kerja Anda!\n` +
        `**5. Visual Style:** Modern, clean aesthetic, cerah & energik.\n`;
    } else if (templateType === 'article') {
      tpl = `### 📝 Brief Artikel Blog & SEO\n\n` +
        `**Judul Fokus:** ${taskTitle || 'Tips Produktivitas Kerja'}\n` +
        `**Target Keyword:** produktivitas kerja, habit bekerja cerdas, coworking space\n` +
        `**Struktur Outline:**\n` +
        `- H1: Pengantar Pentingnya Bekerja Cerdas\n` +
        `- H2: 5 Langkah Utama Mengatur Waktu & Fokus\n` +
        `- H2: Kesalahan Umum Saat Bekerja\n` +
        `- H3: Kesimpulan & Rekomendasi\n`;
    } else if (templateType === 'video') {
      tpl = `### 🎬 Brief Konten Video Reels / Shorts\n\n` +
        `**Durasi:** 30-45 detik\n` +
        `**Format:** Talking head + B-Roll aktivitas kantor\n` +
        `**Visual Hook (0-3s):** Tampilan layar kerja menumpuk lalu berubah rapi.\n` +
        `**Script/VO:** "Sering merasa lelah waktu kerja? Coba 3 habit sederhana ini..."\n` +
        `**BG Music:** Lofi chill energetic beats.\n`;
    } else if (templateType === 'campaign') {
      tpl = `### 🚀 Brief Peluncuran Kampanye Brand\n\n` +
        `**Nama Kampanye:** ${taskTitle || 'New Campaign'}\n` +
        `**Latar Belakang:** Kampanye terintegrasi untuk memperkuat positioning brand.\n` +
        `**Key Deliverables:**\n` +
        `- Visual Key Visual (KV)\n` +
        `- Social Media Banner Set\n` +
        `- Motion Graphics Teaser 15 detik\n`;
    }

    updateContent(content ? `${content}\n\n${tpl}` : tpl);
    setShowTemplateMenu(false);
  };

  const handleGenerateAIBrief = () => {
    const aiBrief = `### 🤖 Brief Konten AI-Generated\n\n` +
      `**Judul Tugas:** ${taskTitle || 'Strategi Produktivitas'}\n\n` +
      `**Ringkasan Eksekutif:**\n` +
      `Kampanye edukasi ini bertujuan menyajikan panduan praktis dan tips peregangan efisien bagi para profesional kantor.\n\n` +
      `**Tujuan Utama:**\n` +
      `- Meningkatkan brand awareness & engagement tim.\n` +
      `- Menyampaikan pesan kunci secara visual, interaktif, dan mudah dipahami.\n\n` +
      `**Elemen Konten Dibutuhkan:**\n` +
      `1. Carousel 5 slide infografis visual bermutu tinggi.\n` +
      `2. Hook menarik pada slide pertama.\n` +
      `3. Ringkasan poin penting pada slide penutup (CTA).\n`;

    updateContent(aiBrief);
    alert('✨ Brief Konten otomatis berhasil diproduksi oleh AI!');
  };

  // Word & Character count calculation
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="space-y-3">
      {/* Hidden File Input for Reference Images */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleAttachReferenceImages}
        className="hidden"
        accept="image/*"
        multiple
      />

      {/* TOP RTE TOOLBAR BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/90 p-2 rounded-2xl border border-slate-200/90 dark:border-slate-700 text-xs">
        
        {/* Left Toolbar formatting controls */}
        <div className="flex flex-wrap items-center gap-1">
          
          {/* Paragraph / Heading Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); setShowHeadingsMenu(!showHeadingsMenu); }}
              className="h-8 px-2.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 border border-slate-200 dark:border-slate-600 hover:border-[#EF2028] transition cursor-pointer"
            >
              <span>Normal</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showHeadingsMenu && (
              <div className="absolute left-0 top-10 z-30 w-44 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 space-y-1 text-xs">
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); handleApplyHeading('p'); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-normal text-slate-700 dark:text-slate-200"
                >
                  Teks Normal
                </button>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); handleApplyHeading('h1'); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-base text-slate-900 dark:text-white"
                >
                  Heading 1 (Besar)
                </button>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); handleApplyHeading('h2'); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-sm text-slate-800 dark:text-slate-100"
                >
                  Heading 2 (Sedang)
                </button>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); handleApplyHeading('h3'); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-xs text-[#EF2028]"
                >
                  Heading 3 (Kecil)
                </button>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); handleApplyHeading('quote'); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 italic text-slate-600 dark:text-slate-300"
                >
                  Kutipan / Quote
                </button>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Bold, Italic, Underline, Strikethrough */}
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); handleInsertText('**', '**'); }}
            className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold cursor-pointer transition border border-transparent hover:border-slate-200"
            title="Bold (**teks**)"
          >
            <Bold className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); handleInsertText('*', '*'); }}
            className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition border border-transparent hover:border-slate-200"
            title="Italic (*teks*)"
          >
            <Italic className="h-4 w-4" />
          </button>

          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); handleInsertText('<u>', '</u>'); }}
            className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition border border-transparent hover:border-slate-200"
            title="Underline (<u>teks</u>)"
          >
            <Underline className="h-4 w-4" />
          </button>

          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); handleInsertText('~~', '~~'); }}
            className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer transition border border-transparent hover:border-slate-200"
            title="Strikethrough (~~teks~~)"
          >
            S
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Alignment buttons */}
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); handleApplyAlignment('left'); }}
            className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition border border-transparent hover:border-slate-200"
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); handleApplyAlignment('center'); }}
            className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition border border-transparent hover:border-slate-200"
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); handleApplyAlignment('right'); }}
            className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition border border-transparent hover:border-slate-200"
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Bullet List & Numbered List */}
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); handleInsertText('\n- '); }}
            className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition border border-transparent hover:border-slate-200"
            title="Bullet List (- poin)"
          >
            <List className="h-4 w-4" />
          </button>

          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); handleInsertText('\n1. '); }}
            className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition border border-transparent hover:border-slate-200"
            title="Numbered List (1. poin)"
          >
            <ListOrdered className="h-4 w-4" />
          </button>

          {/* Link Insertion */}
          <button
            type="button"
            onMouseDown={e => {
              e.preventDefault();
              const url = prompt('Masukkan URL tautan:', 'https://');
              if (url) handleInsertText(`[Tautan Teks](${url})`);
            }}
            className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition border border-transparent hover:border-slate-200"
            title="Insert Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>

          {/* Attach Reference Image */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="h-8 px-2.5 rounded-xl bg-slate-100 hover:bg-white dark:bg-slate-700 dark:hover:bg-slate-600 text-[#EF2028] dark:text-red-400 font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 transition cursor-pointer"
            title="Lampirkan Foto / Gambar Referensi"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Foto Referensi</span>
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition"
            title="Undo"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Template Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTemplateMenu(!showTemplateMenu)}
              className="h-8 px-3 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 shadow-2xs hover:border-[#EF2028] transition cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-[#EF2028]" />
              <span>Template</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showTemplateMenu && (
              <div className="absolute left-0 top-10 z-30 w-64 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-2 space-y-1 animate-in fade-in duration-100 text-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Pilih Template Brief:</p>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate('social')}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                >
                  📱 Promo Media Sosial
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate('article')}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                >
                  📝 Artikel Blog & SEO
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate('video')}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                >
                  🎬 Video Reels / TikTok
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate('campaign')}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                >
                  🚀 Peluncuran Kampanye
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Toolbar: AI Generator & Preview Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerateAIBrief}
            className="h-8 px-3 rounded-full bg-gradient-to-r from-purple-600 via-[#EF2028] to-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:opacity-95 transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-200 animate-pulse" />
            <span>AI Generate</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`h-8 px-3 rounded-full font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border ${
              isPreviewMode
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{isPreviewMode ? 'Mode Edit' : 'Pratinjau'}</span>
          </button>
        </div>
      </div>

      {/* Editor Main Content Area */}
      {isPreviewMode ? (
        <div className="w-full min-h-[150px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 p-4 text-xs text-[#171717] dark:text-slate-200 leading-relaxed font-normal space-y-2 overflow-y-auto max-h-72">
          {content.trim() ? (
            content.split('\n').map((line, idx) => {
              if (line.startsWith('# ')) {
                return <h2 key={idx} className="text-lg font-bold text-[#171717] dark:text-white pt-2 pb-1">{line.replace('# ', '')}</h2>;
              }
              if (line.startsWith('## ')) {
                return <h3 key={idx} className="text-base font-bold text-slate-900 dark:text-slate-100 pt-1.5 pb-0.5">{line.replace('## ', '')}</h3>;
              }
              if (line.startsWith('### ')) {
                return <h4 key={idx} className="text-sm font-bold text-[#EF2028] pt-1">{line.replace('### ', '')}</h4>;
              }
              if (line.startsWith('> ')) {
                return (
                  <blockquote key={idx} className="border-l-4 border-[#EF2028] pl-3 py-1 italic bg-red-50/50 dark:bg-red-950/20 text-slate-700 dark:text-slate-300 rounded-r-lg">
                    {line.replace('> ', '')}
                  </blockquote>
                );
              }
              if (line.startsWith('- ')) {
                return (
                  <li key={idx} className="list-disc ml-5 text-slate-800 dark:text-slate-200">
                    {line.replace('- ', '')}
                  </li>
                );
              }
              if (/^\d+\.\s/.test(line)) {
                return (
                  <li key={idx} className="list-decimal ml-5 text-slate-800 dark:text-slate-200">
                    {line.replace(/^\d+\.\s/, '')}
                  </li>
                );
              }
              if (line.includes('![') && line.includes('](')) {
                const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
                if (imgMatch) {
                  return (
                    <div key={idx} className="my-2">
                      <img
                        src={imgMatch[2]}
                        alt={imgMatch[1]}
                        className="max-h-48 rounded-xl border border-slate-200 dark:border-slate-700 object-cover shadow-sm cursor-pointer hover:opacity-90 transition"
                        onClick={() => setPreviewModalImg(imgMatch[2])}
                      />
                      <span className="text-[10px] text-slate-400 block mt-1">📷 {imgMatch[1]}</span>
                    </div>
                  );
                }
              }
              return <p key={idx} className="leading-relaxed">{line}</p>;
            })
          ) : (
            <p className="text-slate-400 italic">Belum ada konten brief untuk dipratinjau.</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          rows={6}
          value={content}
          onChange={e => updateContent(e.target.value)}
          placeholder="Tulis brief konten lengkap di sini... (Gunakan toolbar RTE di atas untuk format Bold, Italic, Heading, List, atau Lampirkan Foto Referensi)"
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-xs font-normal text-[#171717] dark:text-slate-100 placeholder-slate-400 focus:border-[#EF2028] focus:outline-none transition leading-relaxed shadow-2xs"
        />
      )}

      {/* GALERI FOTO REFERENSI BRIEF */}
      {referenceImages.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-[#EF2028]" /> Foto Referensi Lampiran ({referenceImages.length}):
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {referenceImages.map(img => (
              <div
                key={img.id}
                className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs"
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition"
                  onClick={() => setPreviewModalImg(img.url)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveRefImage(img.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition"
                  title="Hapus foto referensi"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW MODAL FOR REFERENCE IMAGES */}
      {previewModalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden p-2 border border-slate-700 shadow-2xl flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-red-600 text-white transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewModalImg}
              alt="Preview Reference"
              className="max-h-[82vh] w-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* Brief Metrics Footer */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1 pt-1">
        <div className="flex items-center gap-3">
          <span>{wordCount} Kata</span>
          <span>•</span>
          <span>{charCount} Karakter</span>
          <span>•</span>
          <span>~{readTimeMin} Menit Baca</span>
        </div>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Draft Tersimpan
        </span>
      </div>
    </div>
  );
};

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  onClose,
  currentUser
}) => {
  const {
    users,
    channels,
    managedBrands,
    updateTask,
    addAuditLog,
    addNotification
  } = useWorkspace();

  // Local state for live editable task fields
  const [localTask, setLocalTask] = useState<Task | null>(task);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(task?.title || '');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState(task?.description || '');

  // Rich Text Editor State for Phase 01
  const briefTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Admin Phase Management Modal / Form State
  const [showAddPhaseModal, setShowAddPhaseModal] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseAssigneeId, setNewPhaseAssigneeId] = useState('');
  const [newPhaseApproverId, setNewPhaseApproverId] = useState('');
  const [newPhaseDeadline, setNewPhaseDeadline] = useState('');
  const [newPhaseEstimate, setNewPhaseEstimate] = useState('2 Hari');

  // Comment System State
  const [commentInput, setCommentInput] = useState('');
  const [commentAttachments, setCommentAttachments] = useState<{ name: string; url: string; size: string; type?: string }[]>([]);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionPopover, setShowMentionPopover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentFileInputRef = useRef<HTMLInputElement>(null);
  const phaseFileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadPhaseId, setActiveUploadPhaseId] = useState<string | null>(null);

  // Multi-Select Assignees Editing Popover State
  const [editingAssigneePhaseId, setEditingAssigneePhaseId] = useState<string | null>(null);
  const [isEditingTaskAssignees, setIsEditingTaskAssignees] = useState(false);

  // Image Lightbox Preview Modal State
  const [selectedImageModalUrl, setSelectedImageModalUrl] = useState<string | null>(null);
  const [selectedImageModalTitle, setSelectedImageModalTitle] = useState<string>('');

  // Revision notes popup per phase
  const [revisionNotesInput, setRevisionNotesInput] = useState<Record<string, string>>({});
  const [showRevisionModalPhaseId, setShowRevisionModalPhaseId] = useState<string | null>(null);

  // Submit Approval Modal & Multi-Approvers Form State
  const [submittingApprovalPhaseId, setSubmittingApprovalPhaseId] = useState<string | null>(null);
  const [submitGroupInput, setSubmitGroupInput] = useState<string>('Marketing & Brand Hub');
  const [submitApproverIdsInput, setSubmitApproverIdsInput] = useState<string[]>([]);
  const [submitNoteInput, setSubmitNoteInput] = useState<string>('');

  const isAdminOrOwner = currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'manager';

  // Synchronize local task state when prop changes
  useEffect(() => {
    setLocalTask(task);
    if (task) {
      setTitleInput(task.title);
      setDescInput(task.description || '');
      ensureInitialPhases(task);
    }
  }, [task]);

  // Keyboard Escape Key listener for closing drawer / modal as requested
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedImageModalUrl) {
          setSelectedImageModalUrl(null);
        } else if (showAddPhaseModal) {
          setShowAddPhaseModal(false);
        } else if (showRevisionModalPhaseId) {
          setShowRevisionModalPhaseId(null);
        } else if (submittingApprovalPhaseId) {
          setSubmittingApprovalPhaseId(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, selectedImageModalUrl, showAddPhaseModal, showRevisionModalPhaseId, submittingApprovalPhaseId]);

  if (!task || !localTask) return null;

  // Initialize Default 2 Phases if task has no phases
  function ensureInitialPhases(targetTask: Task) {
    if (targetTask.phases && targetTask.phases.length > 0) return;

    const defaultApprover = users.find(u => u.role === 'manager' || u.role === 'super_admin')?.id || currentUser.id;

    const defaultPhases: TaskPhase[] = [
      {
        id: 'phase-01',
        name: 'PHASE 01 — Content Brief',
        order: 1,
        assignedUserId: targetTask.assigneeId || currentUser.id,
        assignedUserName: targetTask.assigneeName || currentUser.name,
        assignedUserAvatar: targetTask.assigneeAvatar || currentUser.avatar,
        assignedUserIds: [targetTask.assigneeId || currentUser.id],
        assignedUsers: [
          {
            id: targetTask.assigneeId || currentUser.id,
            name: targetTask.assigneeName || currentUser.name,
            avatar: targetTask.assigneeAvatar || currentUser.avatar
          }
        ],
        approverUserId: defaultApprover,
        approverUserName: users.find(u => u.id === defaultApprover)?.name || 'Sarah Jenkins',
        approverUserAvatar: users.find(u => u.id === defaultApprover)?.avatar,
        deadline: targetTask.briefDeadline || '9 Nov',
        estimatedTime: '2 Hari',
        status: 'in_progress',
        briefContent: targetTask.description || 'Konten promo kampanye keamanan data biometrik untuk sosial media.',
        approvalRequired: true
      },
      {
        id: 'phase-02',
        name: 'PHASE 02 — Design Production',
        order: 2,
        assignedUserId: targetTask.assigneeId || currentUser.id,
        assignedUserName: targetTask.assigneeName || currentUser.name,
        assignedUserAvatar: targetTask.assigneeAvatar || currentUser.avatar,
        assignedUserIds: [targetTask.assigneeId || currentUser.id],
        assignedUsers: [
          {
            id: targetTask.assigneeId || currentUser.id,
            name: targetTask.assigneeName || currentUser.name,
            avatar: targetTask.assigneeAvatar || currentUser.avatar
          }
        ],
        approverUserId: defaultApprover,
        approverUserName: users.find(u => u.id === defaultApprover)?.name || 'Sarah Jenkins',
        approverUserAvatar: users.find(u => u.id === defaultApprover)?.avatar,
        deadline: targetTask.designDeadline || '11 Nov',
        estimatedTime: '3 Hari',
        status: 'waiting',
        designLink: '',
        notes: '',
        attachments: [
          {
            id: 'att-sample-1',
            name: 'Key_Visual_Preview.png',
            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
            type: 'image/png',
            size: '2.4 MB',
            uploadedAt: '10:30 WIB'
          }
        ],
        approvalRequired: true
      }
    ];

    const initialActivities: DetailedTaskActivity[] = targetTask.detailedActivities || [
      {
        id: 'act-init',
        userId: targetTask.reporterId || currentUser.id,
        userName: targetTask.reporterName || 'Kiki Pratama',
        action: 'Tugas dibuat & brief dikirim',
        timestamp: '09:00 WIB'
      }
    ];

    const updated: Task = {
      ...targetTask,
      phases: defaultPhases,
      briefDeadline: targetTask.briefDeadline || '9 Nov',
      designDeadline: targetTask.designDeadline || '11 Nov',
      publishDate: targetTask.publishDate || '13 Nov 2026',
      detailedActivities: initialActivities,
      overallStatus: targetTask.overallStatus || 'In Progress',
      taskType: targetTask.taskType || 'Regular',
      revisionCount: targetTask.revisionCount || 0,
      totalDurationText: targetTask.totalDurationText || '2 Hari 4 Jam',
      approvalTimeText: targetTask.approvalTimeText || '1.5 Jam',
      revisionTimeText: targetTask.revisionTimeText || '0 Jam',
      isOnTime: targetTask.isOnTime !== undefined ? targetTask.isOnTime : true
    };

    setLocalTask(updated);
    updateTask(updated);
  }

  const phases = localTask.phases || [];
  const comments = localTask.detailedComments || [];
  const activities = localTask.detailedActivities || [];

  // ==========================================
  // HELPER TO DETECT IMAGE ATTACHMENTS
  // ==========================================
  const isImageAttachment = (url: string, type?: string, name?: string) => {
    if (type?.startsWith('image/')) return true;
    if (url?.startsWith('data:image/')) return true;
    const str = `${url || ''} ${name || ''}`.toLowerCase();
    return /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(str) || str.includes('unsplash.com') || str.includes('images');
  };

  // ==========================================
  // MULTI-ASSIGNEE HELPERS FOR PHASES
  // ==========================================
  const getPhaseAssignees = (phase: TaskPhase): { id: string; name: string; avatar: string }[] => {
    if (phase.assignedUsers && phase.assignedUsers.length > 0) {
      return phase.assignedUsers;
    }
    if (phase.assignedUserIds && phase.assignedUserIds.length > 0) {
      return phase.assignedUserIds.map(id => {
        const u = users.find(x => x.id === id);
        return {
          id,
          name: u?.name || phase.assignedUserName || 'PIC',
          avatar: u?.avatar || phase.assignedUserAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
        };
      });
    }
    return [
      {
        id: phase.assignedUserId || currentUser.id,
        name: phase.assignedUserName || currentUser.name,
        avatar: phase.assignedUserAvatar || currentUser.avatar
      }
    ];
  };

  const getPhaseAssigneeIds = (phase: TaskPhase): string[] => {
    if (phase.assignedUserIds && phase.assignedUserIds.length > 0) {
      return phase.assignedUserIds;
    }
    if (phase.assignedUsers && phase.assignedUsers.length > 0) {
      return phase.assignedUsers.map(u => u.id);
    }
    return phase.assignedUserId ? [phase.assignedUserId] : [currentUser.id];
  };

  const togglePhaseAssignee = (phaseId: string, userToToggle: User) => {
    const targetPhase = phases.find(p => p.id === phaseId);
    if (!targetPhase) return;

    const currentIds = getPhaseAssigneeIds(targetPhase);
    let nextIds: string[] = [];

    if (currentIds.includes(userToToggle.id)) {
      nextIds = currentIds.filter(id => id !== userToToggle.id);
      if (nextIds.length === 0) {
        nextIds = [userToToggle.id];
      }
    } else {
      nextIds = [...currentIds, userToToggle.id];
    }

    const nextUsers = nextIds.map(id => {
      const u = users.find(x => x.id === id);
      return {
        id,
        name: u?.name || 'User',
        avatar: u?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      };
    });

    const primary = nextUsers[0];

    const updatedPhases = phases.map(p => {
      if (p.id === phaseId) {
        return {
          ...p,
          assignedUserId: primary.id,
          assignedUserName: nextUsers.map(u => u.name).join(', '),
          assignedUserAvatar: primary.avatar,
          assignedUserIds: nextIds,
          assignedUsers: nextUsers
        };
      }
      return p;
    });

    saveTaskState(
      { phases: updatedPhases },
      `PIC untuk ${targetPhase.name} diperbarui: ${nextUsers.map(u => u.name).join(', ')}`
    );
  };

  // ==========================================
  // AUTO PROGRESS & STATUS CALCULATION
  // ==========================================
  const completedPhasesCount = phases.filter(p => p.status === 'approved' || p.status === 'completed').length;
  const totalPhasesCount = phases.length;
  const progressPercentage = totalPhasesCount > 0 ? Math.round((completedPhasesCount / totalPhasesCount) * 100) : 0;

  const calculateOverallStatus = (currentPhases: TaskPhase[], currentTask: Task): string => {
    if (currentPhases.some(p => p.status === 'rejected')) return 'Rejected';
    if (currentPhases.length > 0 && currentPhases.every(p => p.status === 'approved' || p.status === 'completed')) return 'Completed';
    if (currentPhases.some(p => p.status === 'revision_requested')) return 'Revision';
    if (currentPhases.some(p => p.status === 'pending_approval')) return 'In Review';
    if (currentPhases.some(p => p.status === 'in_progress')) return 'In Progress';
    return 'To Do';
  };

  const currentOverallStatus = calculateOverallStatus(phases, localTask);

  // ==========================================
  // HELPER FOR SAVING & TASK UPDATES
  // ==========================================
  const saveTaskState = (updatedProps: Partial<Task>, newActivity?: string) => {
    const nowTimestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    
    let updatedActivities = [...activities];
    if (newActivity) {
      updatedActivities.push({
        id: `act-${Date.now()}-${Math.random()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        action: newActivity,
        timestamp: nowTimestamp
      });
    }

    const nextOverallStatus = updatedProps.phases ? calculateOverallStatus(updatedProps.phases, localTask) : currentOverallStatus;

    const nextTask: Task = {
      ...localTask,
      ...updatedProps,
      overallStatus: nextOverallStatus,
      status: nextOverallStatus === 'Completed' ? 'done' : nextOverallStatus === 'In Review' ? 'on_review' : 'on_progress',
      detailedActivities: updatedActivities,
      updatedAt: new Date().toISOString()
    };

    setLocalTask(nextTask);
    updateTask(nextTask);
  };

  // ==========================================
  // RICH TEXT EDITOR HELPERS FOR PHASE 01
  // ==========================================
  const handleApplyFormatting = (phaseId: string, format: string) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;

    let currentText = phase.briefContent || '';
    let updatedText = currentText;

    switch (format) {
      case 'bold':
        updatedText = currentText ? `**${currentText}**` : '**Tulis teks tebal...**';
        break;
      case 'italic':
        updatedText = currentText ? `*${currentText}*` : '*Tulis teks miring...*';
        break;
      case 'underline':
        updatedText = currentText ? `_${currentText}_` : '_Tulis teks garis bawah..._';
        break;
      case 'bullet':
        updatedText = currentText + '\n• ';
        break;
      case 'number':
        updatedText = currentText + '\n1. ';
        break;
      case 'link':
        const url = prompt('Masukkan URL link:', 'https://');
        if (url) updatedText = currentText + ` [Link](${url})`;
        break;
      default:
        break;
    }

    handleUpdatePhaseField(phaseId, 'briefContent', updatedText);
  };

  // Update a specific phase field
  const handleUpdatePhaseField = (phaseId: string, field: keyof TaskPhase, value: any) => {
    const updatedPhases = phases.map(p => (p.id === phaseId ? { ...p, [field]: value } : p));
    saveTaskState({ phases: updatedPhases });
  };

  // Save Draft Phase
  const handleSavePhaseDraft = (phaseId: string) => {
    const updatedPhases = phases.map(p => (p.id === phaseId ? { ...p, isDraftSaved: true } : p));
    saveTaskState({ phases: updatedPhases }, `Draft disimpan untuk ${phases.find(p => p.id === phaseId)?.name}`);
    alert('✅ Draft pekerjaan berhasil disimpan!');
  };

  // Submit Phase for Approval Modal Open
  const openSubmitApprovalModal = (phaseId: string) => {
    const targetPhase = phases.find(p => p.id === phaseId);
    if (!targetPhase) return;

    if (phaseId === 'phase-02' && !targetPhase.designLink?.trim()) {
      alert('⚠️ WAJIB mengisi Link Desain (Figma, Google Drive, dll) sebelum mengirim untuk approval!');
      return;
    }

    const defaultApproverId = targetPhase.approverUserId || users.find(u => u.role === 'manager' || u.role === 'super_admin')?.id || currentUser.id;
    setSubmitApproverIdsInput(targetPhase.approverUserIds && targetPhase.approverUserIds.length > 0 ? targetPhase.approverUserIds : [defaultApproverId]);
    setSubmitGroupInput(localTask?.groupName || 'Marketing & Brand Hub');
    setSubmitNoteInput('');
    setSubmittingApprovalPhaseId(phaseId);
  };

  const handleConfirmSubmitApproval = () => {
    if (!submittingApprovalPhaseId) return;

    const targetPhase = phases.find(p => p.id === submittingApprovalPhaseId);
    if (!targetPhase) return;

    const selectedApproverUsers = submitApproverIdsInput.map(id => {
      const u = users.find(x => x.id === id);
      return {
        id,
        name: u?.name || 'Approver',
        avatar: u?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      };
    });

    const approverNames = selectedApproverUsers.map(u => u.name).join(', ') || 'Approver Divisi';

    const updatedPhases = phases.map(p => {
      if (p.id === submittingApprovalPhaseId) {
        return {
          ...p,
          status: 'pending_approval' as PhaseStatus,
          targetGroup: submitGroupInput,
          approverUserIds: submitApproverIdsInput,
          approverUsers: selectedApproverUsers,
          approverUserName: approverNames,
          approverUserId: selectedApproverUsers[0]?.id || currentUser.id,
          submissionNote: submitNoteInput.trim(),
          submittedAt: new Date().toISOString()
        };
      }
      return p;
    });

    // Add activity comment into comment feed
    const nowTimestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const newComment: DetailedTaskComment = {
      id: `comment-sub-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userRole: currentUser.role === 'super_admin' ? 'Super Admin' : currentUser.role === 'admin' ? 'Admin' : 'PIC',
      content: `📢 **Pengajuan Approval ${targetPhase.name}**\nDikirim ke Group: **${submitGroupInput}**\nApprover Ditunjuk: **${approverNames}**${submitNoteInput.trim() ? `\n\nCatatan Submitter: "${submitNoteInput.trim()}"` : ''}`,
      timestamp: nowTimestamp
    };

    saveTaskState(
      { 
        phases: updatedPhases,
        detailedComments: [...comments, newComment]
      },
      `📢 ${targetPhase.name} dikirim untuk approval ke Group "${submitGroupInput}" (Approver: ${approverNames})`
    );

    // Send notification to approvers
    selectedApproverUsers.forEach(u => {
      if (addNotification) {
        addNotification({
          recipientId: u.id,
          title: `Persetujuan Dibutuhkan: ${targetPhase.name}`,
          message: `${currentUser.name} mengajukan ${targetPhase.name} ke Group "${submitGroupInput}". Mohon tinjau materi dan berikan persetujuan.`,
          type: 'approval',
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar
        });
      }
    });

    setSubmittingApprovalPhaseId(null);
    alert('🚀 Permintaan Approval berhasil dikirim ke Group & Approvers!');
  };

  // Approver Decisions: Approve, Revision, Reject
  const handleApproverDecision = (phaseId: string, decision: 'approve' | 'revision' | 'reject') => {
    const targetPhase = phases.find(p => p.id === phaseId);
    if (!targetPhase) return;

    if (decision === 'revision') {
      setShowRevisionModalPhaseId(phaseId);
      return;
    }

    const nowIso = new Date().toISOString();
    const newStatus: PhaseStatus = decision === 'approve' ? 'approved' : 'rejected';

    const updatedPhases = phases.map(p => {
      if (p.id === phaseId) {
        return {
          ...p,
          status: newStatus,
          approvedAt: decision === 'approve' ? nowIso : undefined,
          rejectedAt: decision === 'reject' ? nowIso : undefined
        };
      }
      // Unlock next phase if this phase is approved
      const currIdx = phases.findIndex(x => x.id === phaseId);
      const targetIdx = phases.findIndex(x => x.id === p.id);
      if (decision === 'approve' && targetIdx === currIdx + 1 && p.status === 'waiting') {
        return { ...p, status: 'in_progress' as PhaseStatus };
      }
      return p;
    });

    const actionText =
      decision === 'approve'
        ? `${targetPhase.name} SIAP & DISETUJUI oleh ${currentUser.name}`
        : `${targetPhase.name} DITOLAK oleh ${currentUser.name}`;

    saveTaskState({ phases: updatedPhases }, actionText);

    // Notify Assigned PIC
    if (targetPhase.assignedUserId && addNotification) {
      addNotification({
        recipientId: targetPhase.assignedUserId,
        title: decision === 'approve' ? '🎉 Phase Disetujui!' : '❌ Phase Ditolak',
        message: `${currentUser.name} telah ${decision === 'approve' ? 'menyetujui' : 'menolak'} ${targetPhase.name} pada tugas "${localTask.title}".`,
        type: 'status_change',
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar
      });
    }
  };

  // Submit Revision Notes
  const handleSubmitRevisionNotes = (phaseId: string) => {
    const notes = revisionNotesInput[phaseId] || '';
    if (!notes.trim()) {
      alert('Mohon tuliskan catatan revisi untuk PIC!');
      return;
    }

    const targetPhase = phases.find(p => p.id === phaseId);
    if (!targetPhase) return;

    const updatedPhases = phases.map(p => {
      if (p.id === phaseId) {
        return {
          ...p,
          status: 'revision_requested' as PhaseStatus,
          revisionNotes: notes
        };
      }
      return p;
    });

    const newRevCount = (localTask.revisionCount || 0) + 1;

    saveTaskState(
      {
        phases: updatedPhases,
        revisionCount: newRevCount
      },
      `Revisi diminta oleh ${currentUser.name}: "${notes}"`
    );

    // Notify PIC
    if (targetPhase.assignedUserId && addNotification) {
      addNotification({
        recipientId: targetPhase.assignedUserId,
        title: '⚠️ Permintaan Revisi Tugas',
        message: `${currentUser.name} meminta revisi pada ${targetPhase.name}: "${notes}"`,
        type: 'revision',
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar
      });
    }

    setShowRevisionModalPhaseId(null);
    setRevisionNotesInput(prev => ({ ...prev, [phaseId]: '' }));
    alert('📩 Catatan revisi telah dikirim kepada PIC.');
  };

  // Admin Dynamic Phase Management
  const handleAddNewPhase = () => {
    if (!newPhaseName.trim()) return;

    const newPhase: TaskPhase = {
      id: `phase-${Date.now()}`,
      name: newPhaseName.trim(),
      order: phases.length + 1,
      assignedUserId: newPhaseAssigneeId || currentUser.id,
      assignedUserName: users.find(u => u.id === newPhaseAssigneeId)?.name || currentUser.name,
      assignedUserAvatar: users.find(u => u.id === newPhaseAssigneeId)?.avatar || currentUser.avatar,
      assignedUserIds: [newPhaseAssigneeId || currentUser.id],
      assignedUsers: [
        {
          id: newPhaseAssigneeId || currentUser.id,
          name: users.find(u => u.id === newPhaseAssigneeId)?.name || currentUser.name,
          avatar: users.find(u => u.id === newPhaseAssigneeId)?.avatar || currentUser.avatar
        }
      ],
      approverUserId: newPhaseApproverId || currentUser.id,
      approverUserName: users.find(u => u.id === newPhaseApproverId)?.name || currentUser.name,
      deadline: newPhaseDeadline || '18 Nov 2026',
      estimatedTime: newPhaseEstimate || '2 Hari',
      status: phases.every(p => p.status === 'approved' || p.status === 'completed') ? 'in_progress' : 'waiting',
      approvalRequired: true
    };

    const updatedPhases = [...phases, newPhase];
    saveTaskState({ phases: updatedPhases }, `Admin menambahkan phase baru: "${newPhaseName}"`);

    setShowAddPhaseModal(false);
    setNewPhaseName('');
  };

  const handleDeletePhase = (phaseId: string) => {
    if (phases.length <= 1) {
      alert('Task harus memiliki minimal 1 phase!');
      return;
    }
    if (!confirm('Apakah Anda yakin ingin menghapus phase ini?')) return;

    const updatedPhases = phases.filter(p => p.id !== phaseId).map((p, idx) => ({ ...p, order: idx + 1 }));
    saveTaskState({ phases: updatedPhases }, `Admin menghapus phase ${phaseId}`);
  };

  const handleMovePhase = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= phases.length) return;

    const copy = [...phases];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    const reordered = copy.map((p, idx) => ({ ...p, order: idx + 1 }));
    saveTaskState({ phases: reordered });
  };

  // Phase File Attachment Handler
  const handlePhaseFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !activeUploadPhaseId) return;

    const file = e.target.files[0];
    if (file.size > 20 * 1024 * 1024) {
      alert('File terlalu besar! Maksimal 20 MB per file.');
      return;
    }

    const isImg = file.type.startsWith('image/');

    const processAndAttach = (fileUrl: string) => {
      const newAttach: TaskPhaseAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        url: fileUrl,
        type: file.type || 'application/octet-stream',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      const targetPhase = phases.find(p => p.id === activeUploadPhaseId);
      if (targetPhase) {
        const existing = targetPhase.attachments || [];
        handleUpdatePhaseField(activeUploadPhaseId, 'attachments', [...existing, newAttach]);
      }

      setActiveUploadPhaseId(null);
    };

    if (isImg) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string;
        processAndAttach(dataUrl || URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    } else {
      processAndAttach(URL.createObjectURL(file));
    }
  };

  // Comment Attachment Upload Handler
  const handleCommentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const isImg = file.type.startsWith('image/');

    const attach = (fileUrl: string) => {
      setCommentAttachments(prev => [
        ...prev,
        {
          name: file.name,
          url: fileUrl,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          type: file.type
        }
      ]);
    };

    if (isImg) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        attach((evt.target?.result as string) || URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    } else {
      attach(URL.createObjectURL(file));
    }
  };

  // Comment System Handlers
  const handleSendComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentInput.trim() && commentAttachments.length === 0) return;

    // Detect @mentions
    const mentionsFound: string[] = [];
    users.forEach(u => {
      if (commentInput.toLowerCase().includes(`@${u.name.toLowerCase()}`)) {
        mentionsFound.push(u.id);
        if (addNotification) {
          addNotification({
            recipientId: u.id,
            title: `💬 Sebutan di Task ${localTask.taskCode || ''}`,
            message: `${currentUser.name} menyebut Anda dalam komentar tugas "${localTask.title}": "${commentInput.slice(0, 40)}..."`,
            type: 'mention',
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar
          });
        }
      }
    });

    const newCommentObj: DetailedTaskComment = {
      id: `cmt-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: commentInput.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      mentions: mentionsFound,
      attachments: commentAttachments.length > 0 ? [...commentAttachments] : undefined,
      replies: []
    };

    const updatedComments = [newCommentObj, ...comments];
    saveTaskState({ detailedComments: updatedComments });
    setCommentInput('');
    setCommentAttachments([]);
    setShowEmojiPicker(false);
    setShowMentionPopover(false);
  };

  const handleSendReply = (commentId: string) => {
    if (!replyInput.trim()) return;

    const newReply: DetailedTaskCommentReply = {
      id: `rpl-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: replyInput.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };

    const updatedComments = comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newReply]
        };
      }
      return c;
    });

    saveTaskState({ detailedComments: updatedComments });
    setReplyingToCommentId(null);
    setReplyInput('');
  };

  // Header Title & Description Edit
  const handleSaveTitle = () => {
    if (titleInput.trim() && titleInput !== localTask.title) {
      saveTaskState({ title: titleInput.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveDesc = () => {
    if (descInput !== localTask.description) {
      saveTaskState({ description: descInput.trim() });
    }
    setIsEditingDesc(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      {/* Hidden File Input for Phase Attachment */}
      <input
        type="file"
        ref={phaseFileInputRef}
        onChange={handlePhaseFileUpload}
        className="hidden"
        accept="image/*,.pdf,.zip,.docx,.pptx"
      />

      {/* Hidden File Input for Comment Attachment */}
      <input
        type="file"
        ref={commentFileInputRef}
        onChange={handleCommentFileUpload}
        className="hidden"
        accept="image/*,.pdf,.zip,.docx"
      />

      <div className="w-full max-w-[96vw] xl:max-w-7xl my-auto rounded-3xl bg-white text-[#171717] dark:bg-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200/90 dark:border-slate-800 max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* ========================================================= */}
        {/* 1. HEADER TASK (BRAND, TITLE, HERO PROGRESS CARD, DEADLINES) */}
        {/* ========================================================= */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 space-y-5 w-full">
          
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6 w-full">
            
            {/* LEFT COLUMN: BRAND SELECTOR, TASK CODE, TITLE, DESC, BADGES, STEPPER */}
            <div className="flex-1 space-y-4 w-full">
              
              {/* Row 1: Brand Selector + Task Code + Department */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {/* Brand Selector Dropdown */}
                <div className="relative inline-flex items-center">
                  <select
                    value={localTask.brand || 'ASLI RI'}
                    onChange={e => saveTaskState({ brand: e.target.value })}
                    className="h-9 appearance-none rounded-full border border-slate-200/90 bg-white dark:bg-slate-800 dark:border-slate-700 px-4 pr-8 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#EF2028] shadow-2xs cursor-pointer transition"
                  >
                    <option value="ASLI RI">ASLI RI</option>
                    <option value="BANK ABDI">BANK ABDI</option>
                    <option value="TIXFLY">TIXFLY</option>
                    <option value="TRINITY">TRINITY</option>
                    <option value="MOVADEX">MOVADEX</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                </div>

                {/* Task Code Pill */}
                <span className="font-bold text-slate-900 dark:text-white tracking-wide text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                  {localTask.taskCode || `CT-0436`}
                </span>

                {/* Department Name */}
                <span className="font-semibold text-slate-400 dark:text-slate-400 text-xs">
                  {localTask.assigneeDept || 'Marketing & Brand'}
                </span>
              </div>

              {/* Editable Task Title & Description */}
              <div className="space-y-1">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={titleInput}
                      onChange={e => setTitleInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
                      className="w-full text-xl sm:text-2xl font-bold bg-slate-50 dark:bg-slate-800 border border-[#EF2028] rounded-2xl px-3.5 py-1 text-[#171717] dark:text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="h-9 rounded-full bg-[#EF2028] px-4 text-xs font-bold text-white shadow-xs cursor-pointer shrink-0"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] dark:text-white tracking-tight leading-tight">
                      {localTask.title}
                    </h1>
                    <Edit2 className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </div>
                )}

                {isEditingDesc ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={descInput}
                      onChange={e => setDescInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveDesc()}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl px-3 py-1.5 text-[#171717] dark:text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveDesc}
                      className="h-8 rounded-full bg-slate-800 text-white px-3 text-xs font-bold shadow-xs cursor-pointer shrink-0"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <p
                    onClick={() => setIsEditingDesc(true)}
                    className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-white transition font-normal"
                  >
                    {localTask.description || 'Tulis deskripsi singkat tugas di sini...'}
                  </p>
                )}
              </div>

              {/* Badges Row: Category, Publish Date (Calendar UI), Task Type, Priority */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs pt-1">
                {/* Category Pill Select */}
                <div className="relative inline-flex items-center">
                  <span className="h-9 flex items-center gap-1.5 rounded-full border border-purple-200/90 bg-purple-50/70 dark:bg-purple-950/40 dark:border-purple-800 px-3.5 text-xs font-bold text-purple-700 dark:text-purple-300 shadow-2xs">
                    <Sliders className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    <select
                      value={localTask.category || 'Design'}
                      onChange={e => saveTaskState({ category: e.target.value })}
                      className="bg-transparent appearance-none focus:outline-none font-bold cursor-pointer pr-4"
                    >
                      <option value="Design">Design</option>
                      <option value="Video">Video</option>
                      <option value="Content">Content</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-purple-600" />
                  </span>
                </div>

                {/* Publish Date UI Calendar Picker Pill */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span className="text-slate-400 font-medium">Publish:</span>
                  <DatePickerPill
                    value={localTask.publishDate || '13 Nov 2026'}
                    onChange={(formatted) => saveTaskState({ publishDate: formatted })}
                  />
                </div>

                {/* Task Type Select Pill */}
                <div className="relative inline-flex items-center">
                  <span className="h-9 flex items-center gap-1.5 rounded-full border border-sky-200/90 bg-sky-50/70 dark:bg-sky-950/40 dark:border-sky-800 px-3.5 text-xs font-bold text-sky-700 dark:text-sky-300 shadow-2xs">
                    <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    <select
                      value={localTask.taskType || 'Regular'}
                      onChange={e => saveTaskState({ taskType: e.target.value })}
                      className="bg-transparent appearance-none focus:outline-none font-bold cursor-pointer pr-4"
                    >
                      <option value="Regular">Regular</option>
                      <option value="Campaign">Campaign</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-sky-600" />
                  </span>
                </div>

                {/* Priority Select Pill */}
                <div className="relative inline-flex items-center">
                  <span className="h-9 flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50/70 dark:bg-amber-950/40 dark:border-amber-800 px-3.5 text-xs font-bold text-amber-700 dark:text-amber-300 shadow-2xs">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <select
                      value={localTask.priority || 'medium'}
                      onChange={e => saveTaskState({ priority: e.target.value as any })}
                      className="bg-transparent appearance-none focus:outline-none font-bold capitalize cursor-pointer pr-4"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-amber-600" />
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: TOTAL PROGRESS METRIC CARD (EXACT MATCH image_cb45bb5d.png) */}
            <div className="w-full lg:w-[420px] shrink-0 rounded-3xl p-5 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs flex flex-col justify-between space-y-3.5">
              
              {/* Header Row: Title & Info Icon + Status Dropdown */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-base">
                  <span>Total Progress</span>
                  <Info className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300" />
                </div>

                {/* Status selector pill dropdown */}
                <div className="relative">
                  <select
                    value={currentOverallStatus}
                    onChange={e => saveTaskState({ overallStatus: e.target.value })}
                    className={`h-8 appearance-none rounded-full px-3.5 pr-7 text-xs font-bold transition cursor-pointer focus:outline-none border shadow-2xs ${
                      currentOverallStatus === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : currentOverallStatus === 'In Review'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                        : currentOverallStatus === 'Revision'
                        ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800'
                        : currentOverallStatus === 'Rejected'
                        ? 'bg-red-50 text-[#EF2028] border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900'
                        : 'bg-red-50 text-[#EF2028] border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900'
                    }`}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Revision">Revision</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-current" />
                </div>
              </div>

              {/* Metric Row: Big Number & Growth Indicator (BASE-LINE ALIGNED image_cb45bb5d.png) */}
              <div className="flex items-baseline gap-3.5 my-0.5 text-left">
                <span className="text-4xl sm:text-5xl font-bold text-[#0f172a] dark:text-white tracking-tight leading-none">
                  {progressPercentage}%
                </span>
                <div className="flex flex-col text-xs leading-tight self-baseline">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    +{completedPhasesCount * 25 + 4.5}% project
                  </span>
                  <span className="text-slate-400 font-medium text-[11px]">from last phase</span>
                </div>
              </div>

              {/* Progress Bar with Lime-Green Pill Capsule & Ticks (EXACT MATCH reference image) */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-end text-[11px] font-bold text-slate-400 pr-1">
                  <span>100%</span>
                </div>

                <div className="relative w-full flex items-center h-8 gap-2">
                  {/* Track Container */}
                  <div className="relative flex-1 flex items-center justify-between h-6 bg-slate-50 dark:bg-slate-900 rounded-full px-1 border border-slate-100 dark:border-slate-800 overflow-hidden">
                    {/* Lime Green Filled Capsule */}
                    <div
                      className="h-5 rounded-full bg-gradient-to-r from-[#4ade80] via-[#34d399] to-[#10b981] transition-all duration-500 shadow-2xs z-20"
                      style={{ width: `${Math.max(progressPercentage, 14)}%` }}
                    />

                    {/* Vertical Tick Marks in background */}
                    <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none z-10">
                      {Array.from({ length: 22 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="w-[2px] h-3 bg-slate-200/80 dark:bg-slate-700/80 rounded-full"
                        />
                      ))}
                    </div>
                  </div>

                  {/* 100% End Cap Bar Node */}
                  <div className="w-1.5 h-6 bg-slate-300 dark:bg-slate-600 rounded-full shrink-0" />
                </div>
              </div>

              {/* Bottom Sub-Card Pill (EXACT MATCH image_cb45bb5d.png) */}
              <div className="w-full rounded-full border border-slate-200/90 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 transition">
                <span>
                  {totalPhasesCount} phase available, {completedPhasesCount} completed above {progressPercentage}%
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400 -rotate-90 shrink-0" />
              </div>

            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* MAIN BODY: LEFT CONTENT (PHASES & COMMENTS) + RIGHT SIDEBAR */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ========================================================= */}
          {/* LEFT 2 COLUMNS: PHASE WORKFLOW SYSTEM & COMMENTS          */}
          {/* ========================================================= */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Admin Dynamic Phase Management Button Bar */}
            {isAdminOrOwner && (
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-[#EF2028]" />
                  <span>Admin Phase Controls</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddPhaseModal(true)}
                  className="h-9 inline-flex items-center gap-1.5 rounded-full bg-[#EF2028] px-4 text-xs font-bold text-white shadow-2xs hover:bg-[#d91920] transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Phase Baru</span>
                </button>
              </div>
            )}

            {/* Vertical Timeline Phase Cards Container */}
            <div className="relative space-y-6">
              {/* Connecting Vertical Timeline Line */}
              <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800 z-0" />

              {phases.map((phase, pIdx) => {
                const isPic = phase.assignedUserId === currentUser.id || isAdminOrOwner;
                const isApprover = phase.approverUserId === currentUser.id || isAdminOrOwner;
                const isPhaseApproved = phase.status === 'approved' || phase.status === 'completed';
                const isPhasePendingApproval = phase.status === 'pending_approval';
                const isPhaseRevision = phase.status === 'revision_requested';
                const currentPhaseAssignees = getPhaseAssignees(phase);

                return (
                  <div key={phase.id} className="relative pl-10 z-10">
                    {/* Red Timeline Circle Badge with Phase Index */}
                    <div
                      className={`absolute left-0 top-4 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs text-white z-10 transition-colors ${
                        isPhaseApproved
                          ? 'bg-emerald-600'
                          : isPhasePendingApproval
                          ? 'bg-amber-500'
                          : isPhaseRevision
                          ? 'bg-orange-500'
                          : 'bg-[#EF2028]'
                      }`}
                    >
                      {pIdx + 1}
                    </div>

                    {/* Phase Card Content */}
                    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-5">
                      
                      {/* Phase Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-[#171717] dark:text-white">
                              {phase.name}
                            </h3>
                            {/* Status Badge */}
                            <span
                              className={`rounded-full px-3 py-0.5 text-[10px] font-bold ${
                                isPhaseApproved
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : isPhasePendingApproval
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : isPhaseRevision
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {phase.status === 'approved' || phase.status === 'completed'
                                ? 'Completed'
                                : phase.status === 'pending_approval'
                                ? 'Waiting Approval'
                                : phase.status === 'revision_requested'
                                ? 'Need Revision'
                                : phase.status === 'in_progress'
                                ? 'In Progress'
                                : 'Waiting'}
                            </span>
                          </div>
                        </div>

                        {/* Admin Controls for Phase: Reorder & Delete */}
                        {isAdminOrOwner && (
                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            <button
                              onClick={() => handleMovePhase(pIdx, 'up')}
                              disabled={pIdx === 0}
                              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Geser Ke Atas"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleMovePhase(pIdx, 'down')}
                              disabled={pIdx === phases.length - 1}
                              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Geser Ke Bawah"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePhase(phase.id)}
                              className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 transition cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Hapus Phase"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Phase Metadata Bar: Assigned To (Multi-Select Editable), Deadline (UI Calendar), Estimasi */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                        {/* Assigned To - Multi-Assignee Avatar Stack & Popover Selector */}
                        <div className="relative space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-medium">Assigned to ({currentPhaseAssignees.length})</span>
                            <button
                              type="button"
                              onClick={() => setEditingAssigneePhaseId(editingAssigneePhaseId === phase.id ? null : phase.id)}
                              className="text-[10px] font-bold text-[#EF2028] hover:underline cursor-pointer flex items-center gap-0.5"
                            >
                              <span>Edit PIC</span>
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Overlapping Avatar Stack */}
                            <div className="flex items-center -space-x-2 shrink-0">
                              {currentPhaseAssignees.map(u => (
                                <img
                                  key={u.id}
                                  src={u.avatar}
                                  alt={u.name}
                                  title={u.name}
                                  className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-2xs"
                                />
                              ))}
                            </div>
                            <div className="font-bold text-[#171717] dark:text-white truncate text-xs">
                              {currentPhaseAssignees.map(u => u.name).join(', ') || 'PIC Divisi'}
                            </div>
                          </div>

                          {/* Multi-Select Assignees Popover */}
                          {editingAssigneePhaseId === phase.id && (
                            <div className="absolute left-0 top-12 z-30 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 space-y-2 animate-in fade-in duration-100">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Pilih PIC ({phase.name})</span>
                                <button onClick={() => setEditingAssigneePhaseId(null)} className="text-slate-400 hover:text-slate-600">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                                {users.map(u => {
                                  const assignedIds = getPhaseAssigneeIds(phase);
                                  const isSelected = assignedIds.includes(u.id);

                                  return (
                                    <label
                                      key={u.id}
                                      onClick={e => {
                                        e.preventDefault();
                                        togglePhaseAssignee(phase.id, u);
                                      }}
                                      className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition ${
                                        isSelected
                                          ? 'bg-red-50 text-[#EF2028] dark:bg-red-950/40 dark:text-red-300 font-bold'
                                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <img src={u.avatar} alt={u.name} className="h-6 w-6 rounded-full object-cover" />
                                        <div>
                                          <div className="font-bold">{u.name}</div>
                                          <div className="text-[9px] text-slate-400">{u.department || u.position}</div>
                                        </div>
                                      </div>
                                      <div className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                                        isSelected ? 'bg-[#EF2028] border-[#EF2028] text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                      }`}>
                                        {isSelected && <Check className="h-3 w-3" />}
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>

                              <div className="pt-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => setEditingAssigneePhaseId(null)}
                                  className="h-7 px-3 rounded-full bg-[#EF2028] text-white text-[11px] font-bold shadow-2xs"
                                >
                                  Selesai
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Deadline UI Calendar Picker */}
                        <div className="flex flex-col justify-between border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-2 sm:pt-0 sm:pl-3">
                          <div className="text-[10px] text-slate-400 font-medium mb-0.5">Deadline Phase</div>
                          <DatePickerPill
                            value={phase.deadline || '10 Nov 2026'}
                            onChange={(formatted) => handleUpdatePhaseField(phase.id, 'deadline', formatted)}
                          />
                        </div>

                        {/* Estimasi */}
                        <div className="flex items-center gap-2.5 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-2 sm:pt-0 sm:pl-3">
                          <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                          <div>
                            <div className="text-[10px] text-slate-400 font-medium">Estimasi</div>
                            <input
                              type="text"
                              value={phase.estimatedTime || '2 Hari'}
                              onChange={e => handleUpdatePhaseField(phase.id, 'estimatedTime', e.target.value)}
                              className="font-bold text-[#171717] dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none w-20"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Revision Alert Box if revision requested */}
                      {isPhaseRevision && phase.revisionNotes && (
                        <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4 text-xs text-orange-900 dark:bg-orange-950/40 dark:border-orange-900 dark:text-orange-200 space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-orange-700 dark:text-orange-300">
                            <AlertCircle className="h-4 w-4" />
                            <span>Catatan Revisi dari Approver:</span>
                          </div>
                          <p className="pl-5 leading-relaxed font-medium">"{phase.revisionNotes}"</p>
                        </div>
                      )}

                      {/* ========================================================= */}
                      {/* PHASE 01 SPECIFIC BODY: RICH TEXT BRIEF EDITOR            */}
                      {/* ========================================================= */}
                      {pIdx === 0 ? (
                        <AdvancedPhaseBriefEditor
                          taskTitle={localTask.title}
                          initialContent={phase.briefContent || ''}
                          onChange={val => handleUpdatePhaseField(phase.id, 'briefContent', val)}
                        />
                      ) : (
                        /* ========================================================= */
                        /* PHASE 02 (OR CUSTOM PHASES) BODY: DESIGN LINK & ATTACH    */
                        /* ========================================================= */
                        <div className="space-y-4">
                          {/* Link Desain (WAJIB) */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#171717] dark:text-slate-200">
                              Link Desain <span className="text-[#EF2028]">*</span>
                            </label>
                            <div className="relative">
                              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <input
                                type="url"
                                value={phase.designLink || ''}
                                onChange={e => handleUpdatePhaseField(phase.id, 'designLink', e.target.value)}
                                placeholder="Masukkan link desain (Figma, Drive, dll)"
                                className="w-full h-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 text-xs font-medium text-[#171717] dark:text-slate-200 placeholder-slate-400 focus:border-[#EF2028] focus:outline-none transition"
                              />
                            </div>
                          </div>

                          {/* Catatan (Opsional) */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#171717] dark:text-slate-200">
                              Catatan <span className="text-slate-400 font-normal">(Opsional)</span>
                            </label>
                            <textarea
                              rows={2}
                              value={phase.notes || ''}
                              onChange={e => handleUpdatePhaseField(phase.id, 'notes', e.target.value)}
                              placeholder="Tambahkan catatan jika diperlukan..."
                              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs font-normal text-[#171717] dark:text-slate-200 placeholder-slate-400 focus:border-[#EF2028] focus:outline-none transition"
                            />
                          </div>

                          {/* Lampiran Upload Dropzone */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-[#171717] dark:text-slate-200">
                              Lampiran <span className="text-slate-400 font-normal">(Opsional)</span>
                            </label>
                            <div
                              onClick={() => {
                                setActiveUploadPhaseId(phase.id);
                                phaseFileInputRef.current?.click();
                              }}
                              className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-4 text-center hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer space-y-1"
                            >
                              <UploadCloud className="mx-auto h-6 w-6 text-slate-400" />
                              <p className="text-xs font-bold text-[#171717] dark:text-slate-200">
                                Upload file atau tarik dan lepas di sini
                              </p>
                              <p className="text-[10px] text-slate-400">
                                PNG, JPG, PDF, ZIP (maks. 20 MB)
                              </p>
                            </div>

                            {/* Attachments List - Visual Image Thumbnail Grid */}
                            {phase.attachments && phase.attachments.length > 0 && (
                              <div className="space-y-2 pt-1">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                  File Lampiran ({phase.attachments.length})
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {phase.attachments.map(att => {
                                    const isImg = isImageAttachment(att.url, att.type, att.name);
                                    return isImg ? (
                                      <div
                                        key={att.id}
                                        onClick={() => {
                                          setSelectedImageModalUrl(att.url);
                                          setSelectedImageModalTitle(att.name);
                                        }}
                                        className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xs hover:shadow-md transition cursor-pointer overflow-hidden flex flex-col justify-between"
                                      >
                                        <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                                          <img
                                            src={att.url}
                                            alt={att.name}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                                          />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-white transition-opacity font-bold text-xs">
                                            <Eye className="h-4 w-4" />
                                            <span>Pratinjau</span>
                                          </div>
                                        </div>
                                        <div className="pt-2 px-1 flex items-center justify-between gap-1">
                                          <div className="min-w-0 flex-1">
                                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate block">
                                              {att.name}
                                            </span>
                                            <span className="text-[9px] text-slate-400 block font-mono">{att.size}</span>
                                          </div>
                                          <a
                                            href={att.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            className="p-1 text-slate-400 hover:text-[#EF2028] transition"
                                            title="Buka Tab Baru"
                                          >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                          </a>
                                        </div>
                                      </div>
                                    ) : (
                                      <a
                                        key={att.id}
                                        href={att.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-[#EF2028] transition shadow-2xs"
                                      >
                                        <FileText className="h-5 w-5 text-[#EF2028] shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <span className="truncate block text-xs font-bold">{att.name}</span>
                                          <span className="text-[9px] text-slate-400 block font-mono">{att.size}</span>
                                        </div>
                                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                      </a>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons: Simpan Draft & Submit untuk Approval */}
                      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleSavePhaseDraft(phase.id)}
                          className="h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 text-xs font-bold text-[#171717] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs flex items-center justify-center"
                        >
                          Simpan Draft
                        </button>

                        <button
                          type="button"
                          onClick={() => openSubmitApprovalModal(phase.id)}
                          disabled={isPhaseApproved || isPhasePendingApproval}
                          className="h-9 rounded-full bg-[#EF2028] hover:bg-[#d91920] px-6 text-xs font-bold text-white shadow-2xs active:scale-95 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>
                            {isPhasePendingApproval ? 'Menunggu Approval' : isPhaseApproved ? 'Disetujui' : 'Submit untuk Approval'}
                          </span>
                        </button>
                      </div>

                      {/* ========================================================= */}
                      {/* PEMBERITAHUAN APPROVAL & SHOW MATERI REVIEW CARD           */}
                      {/* ========================================================= */}
                      {isPhasePendingApproval && (
                        <div className="rounded-3xl bg-amber-50/90 border-2 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800 p-5 space-y-4 shadow-sm animate-in fade-in duration-150">
                          {/* Top Info Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-800 pb-3">
                            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                              <ShieldCheck className="h-4 w-4 text-[#EF2028] animate-pulse" />
                              <span>⏳ STATUS: MENUNGGU PERSETUJUAN / APPROVAL</span>
                            </div>
                            {phase.submittedAt && (
                              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                                Diajukan: {new Date(phase.submittedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                              </span>
                            )}
                          </div>

                          {/* Target Group & Approvers List */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Group Tujuan Notifikasi</span>
                              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                                📢 {phase.targetGroup || 'Marketing & Brand Hub'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Approver Ditunjuk</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="flex -space-x-1 shrink-0">
                                  {(phase.approverUsers || []).map(u => (
                                    <img key={u.id} src={u.avatar} alt={u.name} className="h-5 w-5 rounded-full object-cover ring-1 ring-white" />
                                  ))}
                                </div>
                                <span className="font-bold text-[#EF2028] dark:text-red-300">
                                  {phase.approverUserName || 'Approver Divisi'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {phase.submissionNote && (
                            <div className="text-xs bg-amber-100/60 dark:bg-amber-900/30 p-3 rounded-xl text-amber-900 dark:text-amber-200">
                              <span className="font-bold">💬 Catatan Submitter: </span>
                              <span className="italic">"{phase.submissionNote}"</span>
                            </div>
                          )}

                          {/* MATERI LANGSUNG YANG DI-APPROVAL (SHOW MATERI DIREK) */}
                          <div className="space-y-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200 dark:border-slate-800 shadow-2xs">
                            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                              <FileText className="h-4 w-4 text-[#EF2028]" />
                              <span>Materi yang Diajukan untuk Di-Approve:</span>
                            </span>

                            {pIdx === 0 ? (
                              /* Phase 01 Material: Brief Content & Reference Images */
                              <div className="space-y-3 pt-1 text-xs text-slate-800 dark:text-slate-200">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl leading-relaxed whitespace-pre-line font-medium border border-slate-200/80 dark:border-slate-700">
                                  {phase.briefContent || 'Belum ada isi brief.'}
                                </div>
                              </div>
                            ) : (
                              /* Phase 02 Material: Design Link, Notes, Attachments */
                              <div className="space-y-3 pt-1 text-xs">
                                {phase.designLink && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-600 dark:text-slate-400">Link Desain:</span>
                                    <a
                                      href={phase.designLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#EF2028] text-white font-bold text-xs hover:bg-[#d91920] transition shadow-2xs"
                                    >
                                      <LinkIcon className="h-3.5 w-3.5" />
                                      <span>Buka Link Desain (Figma / Drive)</span>
                                      <ExternalLink className="h-3 w-3 ml-0.5" />
                                    </a>
                                  </div>
                                )}

                                {phase.notes && (
                                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-medium">
                                    <span className="font-bold">Catatan Desain: </span>
                                    {phase.notes}
                                  </div>
                                )}

                                {phase.attachments && phase.attachments.length > 0 && (
                                  <div className="space-y-1">
                                    <span className="font-bold text-slate-500 text-[11px]">Lampiran File ({phase.attachments.length}):</span>
                                    <div className="flex flex-wrap gap-2">
                                      {phase.attachments.map(att => (
                                        <a
                                          key={att.id}
                                          href={att.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:border-[#EF2028] transition text-xs"
                                        >
                                          <FileText className="h-3.5 w-3.5 text-[#EF2028]" />
                                          <span className="truncate max-w-[150px]">{att.name}</span>
                                          <ExternalLink className="h-3 w-3 text-slate-400" />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Tombol Aksi Approver: Approve / Request Revision / Reject */}
                          <div className="pt-1 flex flex-wrap items-center justify-end gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleApproverDecision(phase.id, 'approve')}
                              className="h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 px-5 text-xs font-bold text-white shadow-2xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                            >
                              <Check className="h-4 w-4" />
                              <span>Setujui / Approve Phase</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApproverDecision(phase.id, 'revision')}
                              className="h-9 rounded-full bg-amber-500 hover:bg-amber-600 px-5 text-xs font-bold text-white shadow-2xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                            >
                              <RotateCcw className="h-4 w-4" />
                              <span>Minta Revisi / Request Revision</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApproverDecision(phase.id, 'reject')}
                              className="h-9 rounded-full bg-rose-600 hover:bg-rose-700 px-4 text-xs font-bold text-white shadow-2xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                            >
                              <X className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>

            {/* ========================================================= */}
            {/* 4. KOMENTAR DAN DISKUSI SECTION                           */}
            {/* ========================================================= */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <FileText className="h-4 w-4 text-[#EF2028]" />
                <h3 className="text-base font-bold text-[#171717] dark:text-white">
                  Komentar ({comments.length})
                </h3>
              </div>

              {/* Comment Attachments Preview Box */}
              {commentAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80">
                  {commentAttachments.map((att, idx) => (
                    <div key={idx} className="relative group flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-xl border text-xs">
                      {isImageAttachment(att.url, att.type, att.name) ? (
                        <img src={att.url} alt="" className="h-10 w-10 object-cover rounded-lg" />
                      ) : (
                        <FileText className="h-5 w-5 text-red-500" />
                      )}
                      <span className="truncate max-w-[120px] font-bold">{att.name}</span>
                      <button
                        type="button"
                        onClick={() => setCommentAttachments(prev => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-600 ml-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Input Box */}
              <form onSubmit={handleSendComment} className="relative space-y-2">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-8 w-8 rounded-full object-cover shrink-0"
                  />
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={e => {
                        setCommentInput(e.target.value);
                        if (e.target.value.endsWith('@')) {
                          setShowMentionPopover(true);
                        } else if (!e.target.value.includes('@')) {
                          setShowMentionPopover(false);
                        }
                      }}
                      placeholder="Tulis komentar, gunakan @ untuk mention..."
                      className="w-full h-10 rounded-full border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-4 pr-24 text-xs font-normal text-[#171717] dark:text-slate-100 placeholder-slate-400 focus:border-[#EF2028] focus:bg-white focus:outline-none transition"
                    />

                    {/* Action Icons inside input: Attachment, Emoji, Send */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => commentFileInputRef.current?.click()}
                        className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        title="Lampirkan File/Foto"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        title="Tambah emoji"
                      >
                        <Smile className="h-4 w-4" />
                      </button>

                      <button
                        type="submit"
                        className="h-7 w-7 rounded-full bg-[#EF2028] flex items-center justify-center text-white hover:bg-[#d91920] active:scale-95 transition cursor-pointer"
                        title="Kirim komentar"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                  <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-sm w-fit">
                    {['😊', '👍', '🚀', '🔥', '❤️', '🎉', '✅', '📌'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setCommentInput(prev => prev + ' ' + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Mention Popover */}
                {showMentionPopover && (
                  <div className="absolute left-10 bottom-12 z-20 w-56 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-2 space-y-1 max-h-40 overflow-y-auto">
                    <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">Pilih anggota untuk sebutan:</p>
                    {users.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setCommentInput(prev => prev.replace(/@\w*$/, `@${u.name} `));
                          setShowMentionPopover(false);
                        }}
                        className="w-full flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-left transition"
                      >
                        <img src={u.avatar} alt={u.name} className="h-5 w-5 rounded-full object-cover" />
                        <span className="truncate">{u.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </form>

              {/* Posted Comments List with Image Attachments Thumbnail */}
              <div className="space-y-4 pt-2">
                {comments.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 dark:text-slate-400 py-3">
                    Belum ada diskusi atau komentar. Jadilah yang pertama memberikan masukan!
                  </p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="space-y-2 border-b border-slate-100 pb-3 dark:border-slate-800 last:border-none">
                      <div className="flex items-start gap-3">
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5"
                        />
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#171717] dark:text-white">
                              {comment.userName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {comment.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                            {comment.content}
                          </p>

                          {/* Comment Attachments Thumbnails */}
                          {comment.attachments && comment.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {comment.attachments.map((att, attIdx) => {
                                const isImg = isImageAttachment(att.url, (att as any).type, att.name);
                                return isImg ? (
                                  <div
                                    key={attIdx}
                                    onClick={() => {
                                      setSelectedImageModalUrl(att.url);
                                      setSelectedImageModalTitle(att.name);
                                    }}
                                    className="group relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer shadow-2xs"
                                  >
                                    <img src={att.url} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold">
                                      <Eye className="h-3.5 w-3.5" />
                                    </div>
                                  </div>
                                ) : (
                                  <a
                                    key={attIdx}
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700 hover:text-[#EF2028]"
                                  >
                                    <Paperclip className="h-3 w-3 text-slate-400" />
                                    <span className="truncate max-w-[120px]">{att.name}</span>
                                  </a>
                                );
                              })}
                            </div>
                          )}

                          {/* Reply Button */}
                          <button
                            type="button"
                            onClick={() => setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)}
                            className="text-[11px] font-bold text-[#EF2028] hover:underline cursor-pointer"
                          >
                            Balas
                          </button>

                          {/* Nested Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-2 pt-2">
                              {comment.replies.map(reply => (
                                <div key={reply.id} className="flex items-start gap-2">
                                  <img src={reply.userAvatar} alt={reply.userName} className="h-6 w-6 rounded-full object-cover" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-bold text-[#171717] dark:text-white">{reply.userName}</span>
                                      <span className="text-[9px] text-slate-400">{reply.timestamp}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">{reply.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Input Form */}
                          {replyingToCommentId === comment.id && (
                            <div className="flex items-center gap-2 pt-2">
                              <input
                                type="text"
                                value={replyInput}
                                onChange={e => setReplyInput(e.target.value)}
                                placeholder="Tulis balasan..."
                                className="flex-1 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSendReply(comment.id)}
                                className="h-8 rounded-full bg-[#EF2028] px-4 text-xs font-bold text-white shadow-2xs"
                              >
                                Kirim
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* 3. RIGHT SIDEBAR — TASK INFORMATION & PERFORMANCE (AUTO)  */}
          {/* ========================================================= */}
          <div className="space-y-5">
            
            {/* A. Quick Actions & Export Card */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <Sparkles className="h-4 w-4 text-[#EF2028]" />
                <h3 className="text-sm font-bold text-[#171717] dark:text-white">
                  Aksi Cepat & Ekspor
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('📋 Link task berhasil disalin ke clipboard!');
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer border border-slate-200/60 dark:border-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <LinkIcon className="h-3.5 w-3.5 text-slate-500" /> Salin Link Task
                  </span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => alert('📄 Ringkasan Brief & Phase sedang diunduh dalam format PDF...')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer border border-slate-200/60 dark:border-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <Download className="h-3.5 w-3.5 text-emerald-600" /> Unduh Ringkasan Brief PDF
                  </span>
                  <FileText className="h-3 w-3 text-slate-400" />
                </button>
              </div>
            </div>

            {/* B. Risk Level & SLA Compliance Card */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-[#171717] dark:text-white">
                    SLA & Tingkat Risiko
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full dark:bg-emerald-950 dark:text-emerald-300">
                  SAFE
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Compliance SLA</span>
                  <span className="font-bold text-emerald-600">100% On-Time</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Tingkat Risiko</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">Rendah (Aman)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Total Lampiran</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {phases.reduce((acc, p) => acc + (p.attachments?.length || 0), 0)} File
                  </span>
                </div>
              </div>
            </div>

            {/* C. Informasi Task Card */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <FileText className="h-4 w-4 text-[#EF2028]" />
                <h3 className="text-sm font-bold text-[#171717] dark:text-white">
                  Informasi Task
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Status</span>
                  <span
                    className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${
                      currentOverallStatus === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentOverallStatus === 'In Review'
                        ? 'bg-amber-100 text-amber-800'
                        : currentOverallStatus === 'Revision'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-50 text-[#EF2028]'
                    }`}
                  >
                    {currentOverallStatus}
                  </span>
                </div>

                {/* Penanggung Jawab / Multi-Assignee Display */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 font-medium">Penanggung Jawab</span>
                  <div className="text-right">
                    <div className="font-bold text-[#171717] dark:text-slate-200">
                      {localTask.assigneeName || 'Shakti Ramadhan'}
                    </div>
                    {phases.length > 0 && phases[0].assignedUsers && phases[0].assignedUsers.length > 1 && (
                      <div className="text-[10px] text-slate-400">
                        + {phases[0].assignedUsers.length - 1} tim tambahan
                      </div>
                    )}
                  </div>
                </div>

                {/* Approver */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Approver</span>
                  <span className="font-bold text-[#171717] dark:text-slate-200">
                    {phases[0]?.approverUserName || 'Sarah Jenkins'}
                  </span>
                </div>

                {/* Dibuat */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Dibuat</span>
                  <span className="font-medium text-[#171717] dark:text-slate-200">
                    {localTask.reporterName || 'Kiki Pratama'}
                  </span>
                </div>

                {/* Diperbarui */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Diperbarui</span>
                  <span className="font-medium text-[#171717] dark:text-slate-200">
                    {localTask.updatedAt ? new Date(localTask.updatedAt).toLocaleDateString('id-ID') : 'Hari ini'}
                  </span>
                </div>

                {/* Estimasi */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Estimasi</span>
                  <span className="font-bold text-[#171717] dark:text-slate-200">
                    {localTask.estimatedHours ? `${localTask.estimatedHours} Jam` : '5 Hari'}
                  </span>
                </div>

                {/* Jumlah Revisi */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Revisi</span>
                  <span className="font-bold text-[#EF2028]">
                    {localTask.revisionCount || 0} Kali
                  </span>
                </div>
              </div>
            </div>

            {/* B. Kinerja (Auto) Card */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#EF2028]" />
                  <h3 className="text-sm font-bold text-[#171717] dark:text-white">
                    Kinerja (Auto)
                  </h3>
                </div>
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </div>

              <div className="space-y-3 text-xs">
                {/* On-Time Status */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">On-Time</span>
                  <span
                    className={`font-bold ${
                      localTask.isOnTime ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {localTask.isOnTime ? '✓ On-Time' : '⚠ Overdue'}
                  </span>
                </div>

                {/* Durasi Total */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Durasi Total</span>
                  <span className="font-bold text-[#171717] dark:text-slate-200">
                    {localTask.totalDurationText || '2 Hari 4 Jam'}
                  </span>
                </div>

                {/* Waktu Approval */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Waktu Approval</span>
                  <span className="font-bold text-[#171717] dark:text-slate-200">
                    {localTask.approvalTimeText || '1.5 Jam'}
                  </span>
                </div>

                {/* Total Waktu Revisi */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Total Waktu Revisi</span>
                  <span className="font-bold text-[#171717] dark:text-slate-200">
                    {localTask.revisionTimeText || '0 Jam'}
                  </span>
                </div>
              </div>
            </div>

            {/* C. Timeline Task Card (Dynamic History Events) */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <Clock className="h-4 w-4 text-[#EF2028]" />
                <h3 className="text-sm font-bold text-[#171717] dark:text-white">
                  Timeline Task
                </h3>
              </div>

              <div className="relative pl-6 space-y-4 text-xs">
                {/* Vertical timeline connector */}
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800" />

                {activities.length === 0 ? (
                  <p className="text-slate-400 text-center py-2">Belum ada aktivitas.</p>
                ) : (
                  activities.map((act, aIdx) => (
                    <div key={act.id || aIdx} className="relative z-10 flex items-start gap-2.5">
                      <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-[#EF2028] shadow-2xs" />
                      <div className="space-y-0.5">
                        <div className="font-bold text-[#171717] dark:text-white leading-snug">
                          {act.action}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {act.userName} • {act.timestamp}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* LIGHTBOX MODAL: FULL PHOTO / IMAGE PREVIEW                */}
      {/* ========================================================= */}
      {selectedImageModalUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 text-white">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-[#EF2028]" />
                <span className="text-xs font-bold truncate max-w-xs sm:max-w-md">
                  {selectedImageModalTitle || 'Pratinjau Foto Lampiran'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedImageModalUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="h-8 px-3 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setSelectedImageModalUrl(null)}
                  className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Viewport */}
            <div className="flex-1 p-4 flex items-center justify-center overflow-auto max-h-[80vh] bg-black/40">
              <img
                src={selectedImageModalUrl}
                alt="Full Preview"
                className="max-h-full max-w-full object-contain rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADMIN ADD NEW PHASE FORM                           */}
      {/* ========================================================= */}
      {showAddPhaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-[#171717] dark:text-white">Tambah Phase Workflow Baru</h3>
              <button onClick={() => setShowAddPhaseModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nama Phase</label>
                <input
                  type="text"
                  placeholder="Contoh: PHASE 03 — Final Review & Sign-off"
                  value={newPhaseName}
                  onChange={e => setNewPhaseName(e.target.value)}
                  className="w-full h-9 rounded-full border border-slate-200 dark:border-slate-700 px-3.5 bg-slate-50 dark:bg-slate-800 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">PIC (Penanggung Jawab)</label>
                <select
                  value={newPhaseAssigneeId}
                  onChange={e => setNewPhaseAssigneeId(e.target.value)}
                  className="w-full h-9 rounded-full border border-slate-200 dark:border-slate-700 px-3.5 bg-slate-50 dark:bg-slate-800 focus:outline-none font-bold cursor-pointer"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.position})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Approver (Pemberi Persetujuan)</label>
                <select
                  value={newPhaseApproverId}
                  onChange={e => setNewPhaseApproverId(e.target.value)}
                  className="w-full h-9 rounded-full border border-slate-200 dark:border-slate-700 px-3.5 bg-slate-50 dark:bg-slate-800 focus:outline-none font-bold cursor-pointer"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.position})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Deadline</label>
                  <DatePickerPill
                    value={newPhaseDeadline || '18 Nov 2026'}
                    onChange={(formatted) => setNewPhaseDeadline(formatted)}
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Estimasi</label>
                  <input
                    type="text"
                    value={newPhaseEstimate}
                    onChange={e => setNewPhaseEstimate(e.target.value)}
                    placeholder="2 Hari"
                    className="w-full h-9 rounded-full border border-slate-200 dark:border-slate-700 px-3.5 bg-slate-50 dark:bg-slate-800 focus:outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddPhaseModal(false)}
                className="h-9 rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleAddNewPhase}
                className="h-9 rounded-full bg-[#EF2028] px-5 text-xs font-bold text-white shadow-2xs hover:bg-[#d91920]"
              >
                Tambah Phase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CATATAN REVISI                                      */}
      {/* ========================================================= */}
      {showRevisionModalPhaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-[#EF2028] flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Catatan Permintaan Revisi
              </h3>
              <button onClick={() => setShowRevisionModalPhaseId(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-500">
                Tuliskan dengan jelas poin-poin yang perlu diperbaiki oleh PIC sebelum disetujui:
              </p>
              <textarea
                rows={4}
                value={revisionNotesInput[showRevisionModalPhaseId] || ''}
                onChange={e => setRevisionNotesInput({ ...revisionNotesInput, [showRevisionModalPhaseId]: e.target.value })}
                placeholder="Contoh: Ubah font headline menjadi lebih bold dan tambahkan logo brand di kanan atas..."
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRevisionModalPhaseId(null)}
                className="h-9 rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleSubmitRevisionNotes(showRevisionModalPhaseId)}
                className="h-9 rounded-full bg-amber-500 hover:bg-amber-600 px-5 text-xs font-bold text-white shadow-2xs"
              >
                Kirim Revisi Ke PIC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SUBMIT PHASE UNTUK APPROVAL (GROUP & APPROVER SELECTOR) */}
      {/* ========================================================= */}
      {submittingApprovalPhaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-[#EF2028] flex items-center gap-2">
                <Send className="h-4 w-4" />
                Submit Phase untuk Approval
              </h3>
              <button
                onClick={() => setSubmittingApprovalPhaseId(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* 1. Kirim Ke Group / Channel */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900 dark:text-slate-100 block">
                  1. Kirim Beritahu ke Group / Channel
                </label>
                <div className="relative">
                  <select
                    value={submitGroupInput}
                    onChange={e => setSubmitGroupInput(e.target.value)}
                    className="w-full h-10 appearance-none rounded-2xl border border-slate-200 dark:border-slate-700 px-3.5 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#EF2028] cursor-pointer"
                  >
                    {channels.filter(c => c.type === 'channel').map(ch => (
                      <option key={ch.id} value={ch.name}>
                        {ch.isOfficialDivision ? '✓ ' : '💬 '} #{ch.name} ({ch.description || 'Grup Diskusi'})
                      </option>
                    ))}
                    {channels.filter(c => c.type === 'channel').length === 0 && (
                      <option value="Marketing & Brand Hub">📢 Marketing & Brand Hub</option>
                    )}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* 2. Pilih Approver (Bisa >1 orang / Multi-select) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 dark:text-slate-100 block">
                    2. Pilih Approver yang Ditunjuk <span className="text-[#EF2028]">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Bisa pilih lebih dari 1 orang</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  {users.map(u => {
                    const isChecked = submitApproverIdsInput.includes(u.id);

                    return (
                      <label
                        key={u.id}
                        onClick={e => {
                          e.preventDefault();
                          if (isChecked) {
                            if (submitApproverIdsInput.length > 1) {
                              setSubmitApproverIdsInput(prev => prev.filter(id => id !== u.id));
                            }
                          } else {
                            setSubmitApproverIdsInput(prev => [...prev, u.id]);
                          }
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                          isChecked
                            ? 'bg-red-50 dark:bg-red-950/40 text-[#EF2028] font-bold border border-red-200 dark:border-red-900'
                            : 'hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="h-7 w-7 rounded-full object-cover shadow-2xs" />
                          <div>
                            <div className="font-bold text-xs">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.position || u.department}</div>
                          </div>
                        </div>

                        <div className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                          isChecked ? 'bg-[#EF2028] border-[#EF2028] text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}>
                          {isChecked && <Check className="h-3 w-3" />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 3. Catatan Pengajuan Approval (Opsional) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900 dark:text-slate-100 block">
                  3. Catatan Pengajuan <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                  rows={2}
                  value={submitNoteInput}
                  onChange={e => setSubmitNoteInput(e.target.value)}
                  placeholder="Tulis pesan atau instruksi singkat untuk approver..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800 text-xs font-normal text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#EF2028] focus:outline-none transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSubmittingApprovalPhaseId(null)}
                className="h-9 rounded-full border border-slate-200 dark:border-slate-700 px-5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmitApproval}
                disabled={submitApproverIdsInput.length === 0}
                className="h-9 rounded-full bg-[#EF2028] hover:bg-[#d91920] px-6 text-xs font-bold text-white shadow-2xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Kirim Pengajuan Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
