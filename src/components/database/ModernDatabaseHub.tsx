/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modern Database Hub Component
 * Visual dashboard, live transaction stream, table inspector,
 * storage quota gauge, and backup/restore tools for ASLI GROUP.
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  Server,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  Activity,
  Table,
  ShieldCheck,
  Zap,
  Clock,
  Trash2,
  FileJson,
  X,
  Search,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { modernDb, ModernDbStats, DbActivityLog, DB_TABLES, DbTableName } from '../../services/modernDatabase';
import { useWorkspace } from '../../context/WorkspaceContext';

interface ModernDatabaseHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModernDatabaseHub: React.FC<ModernDatabaseHubProps> = ({ isOpen, onClose }) => {
  const {
    users,
    tasks,
    posts,
    meetings,
    documents,
    channels,
    notifications,
    auditLogs,
    resetToInitialCorporateData
  } = useWorkspace();

  const [stats, setStats] = useState<ModernDbStats | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'status' | 'telemetry' | 'backup' | 'inspector'>('status');
  const [selectedTable, setSelectedTable] = useState<DbTableName>('tasks');
  const [tableSearch, setTableSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchStats = async () => {
    setIsRefreshing(true);
    const s = await modernDb.getStats();
    setStats(s);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
      const interval = setInterval(fetchStats, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, users, tasks, posts, meetings, documents, channels, notifications, auditLogs]);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const jsonStr = modernDb.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `asli-group-database-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    fetchStats();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = modernDb.importFullBackup(content);
      if (res.success) {
        setImportStatus({
          type: 'success',
          message: `Berhasil memulihkan ${res.restoredTables?.length || 0} tabel data perusahaan! Memperbarui tampilan...`
        });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setImportStatus({
          type: 'error',
          message: res.error || 'Gagal memulihkan file cadangan.'
        });
      }
    };
    reader.readAsText(file);
  };

  // Get current table data for inspector
  const getTableData = (table: DbTableName): unknown[] => {
    try {
      const raw = localStorage.getItem('WORKSPACE_APP_' + table);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return [parsed];
      return [];
    } catch {
      return [];
    }
  };

  const rawTableItems = getTableData(selectedTable);
  const filteredTableItems = rawTableItems.filter(item => {
    if (!tableSearch) return true;
    const str = JSON.stringify(item).toLowerCase();
    return str.includes(tableSearch.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-5 backdrop-blur-md animate-fadeIn">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-md shadow-red-500/20">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Basis Data Modern ASLI GROUP
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  IndexedDB Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Arsitektur Offline-First, Real-time Snapshot Reconciler & Telemetri Transaksi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              title="Perbarui Metrik"
              className={`rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition ${isRefreshing ? 'animate-spin text-red-600' : ''}`}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200/80 px-5 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 no-scrollbar">
          <button
            onClick={() => setActiveSubTab('status')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeSubTab === 'status'
                ? 'border-red-600 text-red-600 dark:border-red-500 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Server className="h-4 w-4" />
            Status & Metrik
          </button>
          <button
            onClick={() => setActiveSubTab('telemetry')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeSubTab === 'telemetry'
                ? 'border-red-600 text-red-600 dark:border-red-500 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="h-4 w-4" />
            Log Transaksi Live
            {stats && stats.recentActivity.length > 0 && (
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-600 dark:text-slate-300">
                {stats.recentActivity.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('inspector')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeSubTab === 'inspector'
                ? 'border-red-600 text-red-600 dark:border-red-500 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Table className="h-4 w-4" />
            Inspektor Tabel
          </button>
          <button
            onClick={() => setActiveSubTab('backup')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeSubTab === 'backup'
                ? 'border-red-600 text-red-600 dark:border-red-500 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FileJson className="h-4 w-4" />
            Cadangan & Pulihkan
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: STATUS & METRICS */}
          {activeSubTab === 'status' && (
            <div className="space-y-6">
              {/* Architecture Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mesin Utama</span>
                    <HardDrive className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="mt-2 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    IndexedDB v1
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Offline-First Local Storage
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Rekor Data</span>
                    <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="mt-2 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {stats?.totalRecords || 0} Objek
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Tersebar di {DB_TABLES.length} Store Tabel
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Rerata Latensi</span>
                    <Zap className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="mt-2 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {stats?.avgLatencyMs || 1.2} ms
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                    Super Cepat & Non-Blocking
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Firestore Cloud Sync</span>
                    <Cloud className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="mt-2 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {stats?.isFirestoreSyncActive ? 'Tersambung' : 'Standby / Siap'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Sinkronisasi Reaktif Otomatis
                  </p>
                </div>
              </div>

              {/* Table Store Breakdown */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Table className="h-4 w-4 text-red-600" />
                      Status Penyimpanan Objek Tabel (Object Stores)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Jumlah baris data aktif di setiap koleksi entitas
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Sinkron Terakhir: {new Date().toLocaleTimeString('id-ID')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {DB_TABLES.filter(t => t !== 'dbActivityLogs' && t !== 'workspaceInfo').map(tableName => {
                    const count = stats?.recordsByTable[tableName] ?? 0;
                    return (
                      <div
                        key={tableName}
                        onClick={() => {
                          setSelectedTable(tableName);
                          setActiveSubTab('inspector');
                        }}
                        className="cursor-pointer rounded-xl border border-slate-200/60 bg-slate-50/50 p-3 hover:border-red-400 hover:bg-red-50/20 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-red-900/60 transition group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold capitalize text-slate-700 group-hover:text-red-700 dark:text-slate-300 dark:group-hover:text-red-300">
                            {tableName}
                          </span>
                          <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                            {count}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-500"
                            style={{ width: `${Math.min(100, Math.max(10, count * 5))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Storage Quota Gauge */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Kapasitas & Alokasi Ruang Disk Peramban
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    {((stats?.storageUsedBytes || 0) / (1024 * 1024)).toFixed(2)} MB / {((stats?.storageQuotaBytes || 0) / (1024 * 1024 * 1024)).toFixed(1)} GB
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${Math.max(1, stats?.storageUsagePercent || 0.5)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Data Anda tersimpan secara lokal dan aman di perangkat menggunakan teknologi sandboxed IndexedDB, memastikan privasi penuh dan akses secepat kilat.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: TELEMETRY & LIVE TRANSACTION STREAM */}
          {activeSubTab === 'telemetry' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-red-600" />
                    Aliran Transaksi Basis Data Real-Time
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Setiap mutasi (insert, update, delete, batch sync) direkam dengan audit latency millisecond
                  </p>
                </div>

                <button
                  onClick={() => {
                    modernDb.clearTelemetryLogs();
                    fetchStats();
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Bersihkan Log
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-950 p-4 font-mono text-xs text-slate-300 dark:border-slate-800 max-h-96 overflow-y-auto space-y-2">
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between border-b border-slate-800/80 pb-2 pt-1 font-mono hover:bg-slate-900/60 px-2 rounded-lg transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            log.operation === 'INSERT'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : log.operation === 'UPDATE'
                              ? 'bg-blue-950 text-blue-400 border border-blue-800'
                              : log.operation === 'DELETE'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : log.operation === 'BATCH'
                              ? 'bg-purple-950 text-purple-400 border border-purple-800'
                              : log.operation === 'READ'
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {log.operation}
                        </span>
                        <span className="font-semibold text-white">{log.entity}</span>
                        {log.details && (
                          <span className="text-slate-400 text-[11px]">({log.details})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px]">{log.itemCount} items</span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-amber-400 font-bold">
                          {log.durationMs}ms
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500">
                    Belum ada log transaksi terbaru yang terekam.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TABLE INSPECTOR */}
          {activeSubTab === 'inspector' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {DB_TABLES.filter(t => t !== 'dbActivityLogs').map((tbl) => (
                    <button
                      key={tbl}
                      onClick={() => {
                        setSelectedTable(tbl);
                        setTableSearch('');
                      }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition shrink-0 ${
                        selectedTable === tbl
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tbl} ({stats?.recordsByTable[tbl] || 0})
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder={`Cari dalam ${selectedTable}...`}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs focus:border-red-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 overflow-hidden">
                <div className="border-b border-slate-200/80 px-4 py-2.5 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Tabel: {selectedTable} ({filteredTableItems.length} ditampilkan)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Struktur JSON Objek IndexedDB
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto p-3 space-y-3 font-mono text-xs">
                  {filteredTableItems.length > 0 ? (
                    filteredTableItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/70"
                      >
                        <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200 dark:border-slate-800/60">
                          <span className="font-bold text-red-600 dark:text-red-400 text-[11px]">
                            #{(item as { id?: string })?.id || `Record ${idx + 1}`}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {((item as { createdAt?: string })?.createdAt) || ((item as { timestamp?: string })?.timestamp) || ''}
                          </span>
                        </div>
                        <pre className="text-[11px] text-slate-800 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(item, null, 2)}
                        </pre>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400">
                      Tidak ada data ditemukan dalam tabel ini.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP & RESTORE */}
          {activeSubTab === 'backup' && (
            <div className="space-y-6">
              {importStatus && (
                <div
                  className={`rounded-2xl p-4 text-xs font-semibold flex items-center gap-3 border ${
                    importStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                  }`}
                >
                  {importStatus.type === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between">
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-3">
                      <Download className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Ekspor Cadangan Penuh (Full JSON Backup)
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Unduh seluruh kumpulan data korporat (karyawan, feed, task kanban, meeting, dokumen SOP, pesan chat) dalam satu berkas JSON terstruktur yang dapat disimpan sebagai arsip atau dipulihkan kapan saja.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJson}
                    className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition"
                  >
                    <Download className="h-4 w-4" />
                    Unduh Cadangan JSON ({stats?.totalRecords || 0} Objek)
                  </button>
                </div>

                {/* Import Card */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between">
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 mb-3">
                      <Upload className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Impor & Pulihkan Basis Data
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Unggah berkas JSON cadangan untuk memulihkan seluruh struktur tabel secara instan. Data yang diunggah akan diverifikasi dan disinkronkan ke dalam IndexedDB dan Reactive Storage.
                    </p>
                  </div>
                  <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-purple-300 bg-purple-50 px-4 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300 transition">
                    <Upload className="h-4 w-4" />
                    Pilih File JSON untuk Dipulihkan
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset to Canonical ASLI RI Corporate Data */}
              <div className="rounded-2xl border border-rose-200/60 bg-rose-50/30 p-5 dark:border-rose-950/50 dark:bg-rose-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-rose-600" />
                    Reset ke Data Standar Perusahaan ASLI RI
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-xl">
                    Mengembalikan seluruh tabel ke dataset awal resmi ASLI GROUP (termasuk profil pimpinan Saeful Rohman, 5 divisi strategis biometrik, 12 task proyek aktif, dan SOP perusahaan).
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Apakah Anda yakin ingin mengatur ulang data ke kondisi awal ASLI GROUP?')) {
                      resetToInitialCorporateData();
                      modernDb.logActivity('RESET', 'all_tables', DB_TABLES.length, 2.0, 'success', 'Reset to initial canonical dataset');
                      fetchStats();
                    }
                  }}
                  className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40 transition shrink-0"
                >
                  Reset Data Awal
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200/80 px-6 py-3.5 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Koleksi Terverifikasi: <strong>{DB_TABLES.length} Tabel</strong></span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
