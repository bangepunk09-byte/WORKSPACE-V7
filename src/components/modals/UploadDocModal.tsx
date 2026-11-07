import React, { useState } from 'react';
import { X, FileText, UploadCloud } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { DocCategory, DocAccessRole } from '../../types';

export const UploadDocModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentUser, uploadDocument } = useWorkspace();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocCategory>('sop');
  const [accessRole, setAccessRole] = useState<DocAccessRole>('all');
  const [version, setVersion] = useState('v1.0');
  const [fileName, setFileName] = useState('SOP_Corporate_Document_2026.pdf');
  const [fileSizeDisplay, setFileSizeDisplay] = useState('2.4 MB');
  const [fileType, setFileType] = useState<'pdf' | 'docx' | 'xlsx' | 'pptx' | 'zip'>('pdf');
  const [tagsInput, setTagsInput] = useState('SOP, Kebijakan, ISO27001');

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    if (!title) {
      setTitle(f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
    const sizeMb = (f.size / (1024 * 1024)).toFixed(1);
    setFileSizeDisplay(sizeMb === '0.0' ? `${(f.size / 1024).toFixed(0)} KB` : `${sizeMb} MB`);
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || ext === 'docx' || ext === 'xlsx' || ext === 'pptx' || ext === 'zip') {
      setFileType(ext as any);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    uploadDocument({
      title,
      description: description.trim() || 'Dokumen resmi operasional perusahaan.',
      category,
      accessRole,
      version,
      fileName,
      fileSize: fileSizeDisplay,
      fileType,
      uploadedBy: currentUser.id,
      uploaderName: currentUser.name,
      uploaderAvatar: currentUser.avatar,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      contentPreview: `${title}\nDokumen resmi perusahaan disahkan pada ${new Date().toISOString().split('T')[0]}.\nDeskripsi: ${description}`,
      isStarred: false,
      downloadsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-red-600" />
            Unggah Dokumen Perusahaan Baru
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* File Picker Box */}
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <input
              type="file"
              id="docFileInput"
              onChange={handleFilePick}
              className="hidden"
            />
            <label
              htmlFor="docFileInput"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <UploadCloud className="h-8 w-8 text-blue-600 mb-1.5" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Pilih Berkas Nyata dari Komputer
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {fileName ? `File terpilih: ${fileName} (${fileSizeDisplay})` : 'PDF, Word, Excel, PowerPoint, ZIP'}
              </span>
            </label>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nama Dokumen / Judul SOP *
            </label>
            <input
              type="text"
              placeholder="contoh: SOP Penanganan Insiden Keamanan & Eskalasi"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as DocCategory)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="sop">SOP & Kebijakan</option>
                <option value="guideline">Brand Guidelines</option>
                <option value="architecture">Arsitektur Teknis</option>
                <option value="handbook">Employee Handbook</option>
                <option value="template">Template Dokumen</option>
                <option value="legal">Legal & Kepatuhan</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tingkat Akses (RBAC)
              </label>
              <select
                value={accessRole}
                onChange={e => setAccessRole(e.target.value as DocAccessRole)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="all">Semua Karyawan (All)</option>
                <option value="manager">Khusus Manager & Admin</option>
                <option value="admin">Khusus Super Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Versi Rilis
              </label>
              <input
                type="text"
                placeholder="v1.0"
                value={version}
                onChange={e => setVersion(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Format Berkas
              </label>
              <select
                value={fileType}
                onChange={e => setFileType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="pdf">PDF Document (.pdf)</option>
                <option value="docx">Word (.docx)</option>
                <option value="xlsx">Excel Sheet (.xlsx)</option>
                <option value="pptx">PowerPoint (.pptx)</option>
                <option value="zip">Archive (.zip)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Deskripsi & Ringkasan Dokumen
            </label>
            <textarea
              placeholder="Jelaskan ruang lingkup dan isi pokok dokumen..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
            >
              Unggah Dokumen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
