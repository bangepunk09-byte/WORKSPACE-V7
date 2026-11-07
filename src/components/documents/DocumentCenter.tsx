import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Star,
  Download,
  Eye,
  Trash2,
  Folder,
  Shield,
  Tag,
  CheckCircle,
  FileCode,
  FileSpreadsheet,
  FileBox,
  Lock,
  ExternalLink,
  X
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { DocumentItem, DocCategory, DocAccessRole } from '../../types';

export const DocumentCenter: React.FC = () => {
  const {
    currentUser,
    documents,
    toggleStarDoc,
    recordDocDownload,
    deleteDocument,
    setQuickActionModal
  } = useWorkspace();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);

  const categories: { id: string; label: string; count: number }[] = [
    { id: 'all', label: 'Semua Dokumen', count: documents.length },
    { id: 'starred', label: 'Favorit (Starred)', count: documents.filter(d => d.isStarred).length },
    { id: 'sop', label: 'SOP & Kebijakan', count: documents.filter(d => d.category === 'sop').length },
    { id: 'guideline', label: 'Brand Guidelines', count: documents.filter(d => d.category === 'guideline').length },
    { id: 'architecture', label: 'Arsitektur Teknis', count: documents.filter(d => d.category === 'architecture').length },
    { id: 'handbook', label: 'Employee Handbook', count: documents.filter(d => d.category === 'handbook').length },
    { id: 'template', label: 'Template & Presentasi', count: documents.filter(d => d.category === 'template').length },
    { id: 'legal', label: 'Legal & Kepatuhan', count: documents.filter(d => d.category === 'legal').length }
  ];

  // RBAC Filter Check
  const canAccessDoc = (doc: DocumentItem) => {
    if (currentUser.role === 'super_admin' || currentUser.role === 'admin') return true;
    if (doc.accessRole === 'all') return true;
    if (doc.accessRole === 'manager' && currentUser.role === 'manager') return true;
    return false;
  };

  const filteredDocs = documents.filter(doc => {
    if (activeCategory === 'starred' && !doc.isStarred) return false;
    if (activeCategory !== 'all' && activeCategory !== 'starred' && doc.category !== activeCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchDesc = doc.description.toLowerCase().includes(q);
      const matchTags = doc.tags.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTags;
    }
    return true;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-600" />;
      case 'docx':
        return <FileCode className="h-6 w-6 text-blue-600" />;
      case 'xlsx':
        return <FileSpreadsheet className="h-6 w-6 text-emerald-600" />;
      default:
        return <FileBox className="h-6 w-6 text-purple-600" />;
    }
  };

  const handleDownload = (doc: DocumentItem) => {
    recordDocDownload(doc.id);
    // Trigger virtual download simulation
    const blob = new Blob([doc.contentPreview || doc.description], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Elongated Search Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              Pusat Dokumen Resmi & Knowledge Base Perusahaan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Penyimpanan terpusat SOP, kebijakan keamanan ISO 27001, pedoman merek, dan template korporat.
            </p>
          </div>

          <button
            onClick={() => setQuickActionModal('document')}
            className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-black active:scale-95 shrink-0 self-start sm:self-auto border border-slate-800 dark:bg-white dark:text-slate-950"
          >
            <Plus className="h-3.5 w-3.5 text-red-500" />
            <span>Unggah Dokumen</span>
          </button>
        </div>

        {/* Elongated Search Bar - Memanjang Full Width */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari SOP, kebijakan ISO 27001, template, nomor dokumen, atau pedoman kerja..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-9 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Tabs with Spacious Slider Track */}
      <div className="flex items-center gap-2 overflow-x-auto tab-slider-scroll pt-1 pb-3 px-1">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
              activeCategory === c.id
                ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <span>{c.label}</span>
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              activeCategory === c.id
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
            }`}>
              {c.count}
            </span>
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDocs.map(doc => {
          const hasAccess = canAccessDoc(doc);
          return (
            <div
              key={doc.id}
              className={`flex flex-col justify-between rounded-3xl border bg-white p-5 shadow-xs transition dark:bg-slate-900 ${
                !hasAccess
                  ? 'opacity-70 border-slate-200 dark:border-slate-800'
                  : 'hover:border-red-300 hover:shadow-md border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Header: file icon, version & star */}
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                    {getFileIcon(doc.fileType)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {doc.version}
                    </span>
                    <button
                      onClick={() => toggleStarDoc(doc.id)}
                      className={`p-1 rounded-lg transition ${
                        doc.isStarred ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
                      }`}
                      title={doc.isStarred ? 'Hapus Bintang' : 'Beri Bintang'}
                    >
                      <Star className={`h-4 w-4 ${doc.isStarred ? 'fill-amber-500' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocToDelete(doc)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="Hapus Dokumen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                  {doc.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {doc.description}
                </p>

                {/* Tags and Permission */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Shield className="h-3 w-3 text-red-600" />
                    <span>Akses: {doc.accessRole.toUpperCase()}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {doc.fileSize}
                  </span>
                </div>
              </div>

              {/* Footer: Uploader & Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={doc.uploaderAvatar}
                    alt={doc.uploaderName}
                    title={`Diunggah oleh ${doc.uploaderName}`}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <span className="text-[11px] text-slate-500 truncate max-w-[80px]">
                    {doc.uploaderName.split(' ')[0]}
                  </span>
                </div>

                {hasAccess ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                      title="Lihat Pratinjau Dokumen"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="flex items-center gap-1 rounded-xl bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700 transition"
                      title="Unduh File Resmi"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Unduh</span>
                    </button>
                  </div>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                    <Lock className="h-3.5 w-3.5" /> Khusus {doc.accessRole.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Document Reader / Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                  {previewDoc.category.toUpperCase()} • {previewDoc.version}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {previewDoc.title}
                </h2>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Document Metadata banner */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl dark:bg-slate-800/60 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Ukuran File</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{previewDoc.fileSize}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Total Diunduh</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{previewDoc.downloadsCount} kali</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Pembaruan Terakhir</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{previewDoc.updatedAt}</span>
                </div>
              </div>

              {/* Document Text Reader View */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span>Pratinjau Isi Dokumen:</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Tersertifikasi Resmi ISO 27001</span>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                  {previewDoc.contentPreview || previewDoc.description}
                  {'\n\n'}
                  ---
                  {'\n'}
                  Pasal 1: Ketentuan Umum dan Kewajiban Kepatuhan
                  {'\n'}
                  1.1 Seluruh staf berkewajiban menjaga kerahasiaan kredensial dan kata sandi akses sistem.
                  {'\n'}
                  1.2 Setiap pelanggaran keamanan akan dicatat pada Audit Log perusahaan secara real-time.
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-3 dark:border-slate-800">
              <span className="text-xs text-slate-400">
                Diunggah oleh {previewDoc.uploaderName}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDocToDelete(previewDoc)}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition cursor-pointer"
                  title="Hapus Dokumen Ini"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus</span>
                </button>
                <button
                  onClick={() => handleDownload(previewDoc)}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh Dokumen Asli</span>
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRM DELETE DOCUMENT MODAL (Bypass blocked window.confirm) */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Hapus Dokumen Ini?
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan ini akan menghapus dokumen dari Document Center.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block truncate">
                {docToDelete.title}
              </span>
              <span className="text-[11px] text-slate-500">
                Kategori: {docToDelete.category.toUpperCase()} • Versi: {docToDelete.version}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDocument(docToDelete.id);
                  if (previewDoc?.id === docToDelete.id) {
                    setPreviewDoc(null);
                  }
                  setDocToDelete(null);
                }}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-95 transition cursor-pointer"
              >
                Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
