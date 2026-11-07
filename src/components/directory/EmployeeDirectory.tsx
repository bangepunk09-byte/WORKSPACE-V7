import React, { useState } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Building2,
  Briefcase,
  GitFork,
  LayoutGrid,
  List,
  Sparkles,
  X
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { User, AvailabilityStatus } from '../../types';

export const EmployeeDirectory: React.FC = () => {
  const { users, currentUser, startDirectMessage, setCurrentUser } = useWorkspace();

  const [viewMode, setViewMode] = useState<'grid' | 'orgChart'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  const departments = [
    { id: 'all', label: 'Semua Departemen' },
    { id: 'Technology & Engineering', label: 'Technology & Eng' },
    { id: 'Product & Design', label: 'Product & Design' },
    { id: 'People Operations & Culture', label: 'People Ops / HR' },
    { id: 'Marketing & Brand', label: 'Marketing' },
    { id: 'Finance & Legal Governance', label: 'Finance & Legal' }
  ];

  const filteredEmployees = users.filter(u => {
    if (selectedDept !== 'all' && u.department !== selectedDept) return false;
    if (selectedStatus !== 'all' && u.status !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchPos = u.position.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchLoc = u.location.toLowerCase().includes(q);
      return matchName || matchPos || matchEmail || matchLoc;
    }
    return true;
  });

  const getStatusBadge = (status: AvailabilityStatus) => {
    switch (status) {
      case 'online':
        return { label: 'Online', color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' };
      case 'in_meeting':
        return { label: 'In Meeting', color: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-300' };
      case 'busy':
        return { label: 'Busy (Fokus)', color: 'bg-red-500', text: 'text-red-700 dark:text-red-300' };
      default:
        return { label: 'Away', color: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-red-600" />
            Direktori Karyawan & Struktur Organisasi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daftar seluruh talenta perusahaan, jalur koordinasi reporting line, dan shortcut pesan instan.
          </p>
        </div>

        {/* View Switcher: Grid vs Org Chart */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid Profil</span>
            </button>
            <button
              onClick={() => setViewMode('orgChart')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'orgChart'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <GitFork className="h-3.5 w-3.5" />
              <span>Struktur Organisasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, jabatan, email kantor, atau keahlian..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-9 py-2.5 text-xs text-slate-800 focus:border-red-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
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

        <select
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-red-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 w-full sm:w-auto"
        >
          {departments.map(d => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* VIEW: GRID EMPLOYEES */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredEmployees.map(emp => {
            const st = getStatusBadge(emp.status);
            const isMe = emp.id === currentUser.id;

            return (
              <div
                key={emp.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-red-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  {/* Photo & Status */}
                  <div className="relative mb-3 flex items-start justify-between">
                    <div className="relative">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="h-16 w-16 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${st.color}`}
                        title={st.label}
                      />
                    </div>
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 uppercase tracking-wider dark:bg-slate-800 dark:text-slate-400">
                      {emp.role.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Name and Position */}
                  <h3
                    onClick={() => setSelectedEmployee(emp)}
                    className="cursor-pointer text-sm font-bold text-slate-900 hover:text-red-600 transition dark:text-white"
                  >
                    {emp.name}
                  </h3>
                  <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {emp.position}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {emp.department}
                  </div>

                  {/* Contact details */}
                  <div className="mt-4 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.location.split('(')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons: Chat & Profile Modal */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => startDirectMessage(emp.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                    title={`Mulai Chat dengan ${emp.name}`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => setSelectedEmployee(emp)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Profil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: ORG CHART HIERARCHY */}
      {viewMode === 'orgChart' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-center mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Struktur Kepemimpinan & Reporting Line Perusahaan
            </h3>
            <p className="text-xs text-slate-500">
              Hirarki tanggung jawab dan tim lintas divisi WORKSPACE
            </p>
          </div>

          {/* Org Tree: VP at top */}
          <div className="flex flex-col items-center space-y-6">
            {/* Top Node: Saeful Rohman (VP) */}
            <div className="flex flex-col items-center">
              <div
                onClick={() => setSelectedEmployee(users[0])}
                className="cursor-pointer rounded-2xl border-2 border-red-500 bg-red-50/40 p-4 shadow-md text-center max-w-xs transition hover:scale-105 dark:bg-red-950/20"
              >
                <img
                  src={users[0].avatar}
                  alt={users[0].name}
                  className="mx-auto h-14 w-14 rounded-full object-cover ring-2 ring-red-500"
                />
                <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                  {users[0].name}
                </h4>
                <div className="text-[10px] font-bold text-red-600">
                  {users[0].position}
                </div>
                <div className="text-[9px] text-slate-500">Super Admin / Executive</div>
              </div>
              <div className="h-8 w-0.5 bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Level 2 Managers: Nadia Putri, Rina Wijaya, Maya Anggraini, Budi Santoso */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-2 border-t-2 border-slate-300 dark:border-slate-700">
              {users.slice(1, 5).map(mgr => (
                <div
                  key={mgr.id}
                  onClick={() => setSelectedEmployee(mgr)}
                  className="cursor-pointer rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-center shadow-xs transition hover:border-red-400 dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <img
                    src={mgr.avatar}
                    alt={mgr.name}
                    className="mx-auto h-12 w-12 rounded-full object-cover"
                  />
                  <h5 className="mt-2 text-xs font-bold text-slate-900 dark:text-white truncate">
                    {mgr.name}
                  </h5>
                  <div className="text-[10px] text-red-600 font-semibold truncate">
                    {mgr.position}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">
                    {mgr.department.split('&')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedEmployee.avatar}
                  alt={selectedEmployee.name}
                  className="h-12 w-12 rounded-2xl object-cover ring-2 ring-red-500"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedEmployee.name}
                  </h3>
                  <div className="text-xs font-semibold text-red-600">
                    {selectedEmployee.position}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-400 text-[10px] block uppercase">Bio Ringkas</span>
                <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 p-3 rounded-xl dark:bg-slate-800/50">
                  {selectedEmployee.bio || 'Karyawan berdedikasi tinggi di tim WORKSPACE.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl dark:bg-slate-800/50">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Email Kantor</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEmployee.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Nomor Telepon</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEmployee.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Lokasi Kerja</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEmployee.location}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Bergabung Sejak</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedEmployee.joinedDate}</span>
                </div>
              </div>

              {/* Skills */}
              {selectedEmployee.skills && (
                <div>
                  <span className="font-bold text-slate-400 text-[10px] block uppercase mb-1.5">
                    Keahlian & Kompetensi
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEmployee.skills.map(s => (
                      <span
                        key={s}
                        className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                onClick={() => {
                  setCurrentUser(selectedEmployee);
                  setSelectedEmployee(null);
                }}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Ganti Persona ke Ini (RBAC)
              </button>
              <button
                onClick={() => {
                  startDirectMessage(selectedEmployee.id);
                  setSelectedEmployee(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Kirim Pesan Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
