import React, { useState } from 'react';
import {
  LogIn,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Users,
  X,
  Check,
  ExternalLink,
  ShieldAlert,
  Building2,
  UserPlus
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { User, UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { workspaceInfo, users, login, registerUser } = useWorkspace();

  // Default mode is 'register' as requested (users must register first)
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('register');
  const [email, setEmail] = useState('saeful.rohman@asliri.id');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Registration Form States for Division Classification
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState('HRGA');
  const [regPosition, setRegPosition] = useState('Staff Divisi');
  const [regRole, setRegRole] = useState<UserRole>('employee');
  const [googleTargetDept, setGoogleTargetDept] = useState('HRGA');

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setErrorMsg('Nama dan email wajib diisi.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      try {
        registerUser({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword,
          department: regDepartment,
          position: regPosition.trim() || 'Anggota Divisi',
          role: regRole
        });
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal mendaftarkan akun.');
        setIsLoading(false);
      }
    }, 400);
  };

  // Google OAuth SSO Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Persona Quick Switch Modal State
  const [showPersonaModal, setShowPersonaModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (foundUser) {
        login(foundUser);
      } else {
        const fallback = users[0];
        login({
          ...fallback,
          email: email.trim(),
          name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())
        });
      }
    }, 350);
  };

  const handleQuickLogin = (user: User) => {
    setIsLoading(true);
    setTimeout(() => {
      login(user);
    }, 200);
  };

  const handleGoogleLoginSubmit = (selectedEmail?: string) => {
    setIsGoogleLoading(true);
    const targetEmail = (selectedEmail || googleCustomEmail || 'saeful.rohman@asliri.id').toLowerCase();

    setTimeout(() => {
      const existing = users.find(u => u.email.toLowerCase() === targetEmail);
      if (existing) {
        login({
          ...existing,
          department: googleTargetDept || existing.department
        });
      } else {
        const baseUser = users[0];
        const newGoogleUser: User = {
          ...baseUser,
          id: 'usr_g_' + Date.now(),
          email: targetEmail,
          name: targetEmail.includes('@')
            ? targetEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())
            : 'Google Workspace User',
          department: googleTargetDept || 'HRGA',
          position: targetEmail.includes('asliri.id') ? 'Lead Administrator' : 'Staff Anggota',
          role: targetEmail.includes('asliri.id') ? 'super_admin' : 'employee'
        };
        login(newGoogleUser);
      }
      setIsGoogleLoading(false);
      setShowGoogleModal(false);
    }, 500);
  };

  // Background style computation based on workspace settings
  const bgStyle = workspaceInfo.loginBgStyle || 'sky';
  const bgBlur = workspaceInfo.loginBgBlur ?? 0;
  const overlayOpacity = (workspaceInfo.loginBgOverlayOpacity ?? 40) / 100;

  const renderBackgroundLayer = () => {
    if (bgStyle === 'custom-image' && workspaceInfo.loginBgCustomUrl) {
      return (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: `url(${workspaceInfo.loginBgCustomUrl})`,
            filter: bgBlur > 0 ? `blur(${bgBlur}px)` : undefined,
            transform: bgBlur > 0 ? 'scale(1.05)' : undefined
          }}
        />
      );
    }

    if (bgStyle === 'modern-office') {
      return (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=85')`,
            filter: bgBlur > 0 ? `blur(${bgBlur}px)` : undefined,
            transform: bgBlur > 0 ? 'scale(1.05)' : undefined
          }}
        />
      );
    }

    if (bgStyle === 'geometric-grid') {
      return (
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-200/30 via-transparent to-slate-200/60 dark:from-slate-950/40 dark:via-transparent dark:to-slate-950/80" />
        </div>
      );
    }

    if (bgStyle === 'aurora') {
      return (
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
          <div className="absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-violet-200/40 blur-[120px] dark:bg-violet-600/20" />
          <div className="absolute right-[-10%] top-[20%] h-[500px] w-[500px] rounded-full bg-rose-200/40 blur-[130px] dark:bg-red-600/20" />
          <div className="absolute bottom-[-10%] left-[20%] h-[600px] w-[600px] rounded-full bg-indigo-200/30 blur-[140px] dark:bg-indigo-600/15" />
        </div>
      );
    }

    // Default Sky / Minimal Clean Ambient (Exact inspiration from reference image_c1891eda.png)
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-[#bfe3f7] via-[#d6ecfa] to-[#eef7fd] dark:from-[#0a0f1d] dark:via-[#0e172a] dark:to-[#090d16] transition-colors duration-500">
        {/* Soft atmospheric cloud & ambient gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent dark:from-sky-950/20" />
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-white/70 via-white/30 to-transparent dark:from-slate-950/80 dark:via-transparent" />
      </div>
    );
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#0B1220] dark:text-slate-100 transition-colors duration-300 selection:bg-red-500/30 selection:text-red-600">
      {/* Background layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {renderBackgroundLayer()}
        <div
          className="absolute inset-0 bg-white/20 dark:bg-slate-950/30 transition-opacity duration-300"
          style={{ opacity: overlayOpacity }}
        />
        {/* Concentric subtle circular arcs centered behind the card, matching image_c1891eda.png */}
        <svg
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[960px] w-[960px] text-white/70 dark:text-slate-800/50"
          viewBox="0 0 960 960"
          fill="none"
        >
          <circle cx="480" cy="480" r="230" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />
          <circle cx="480" cy="480" r="350" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="480" cy="480" r="460" stroke="currentColor" strokeWidth="1" strokeDasharray="5 8" />
        </svg>
      </div>

      {/* Top Header: Sleek brand logo & Theme Toggle */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm transition-colors">
            {workspaceInfo.logoUrl ? (
              <img src={workspaceInfo.logoUrl} alt="Logo" className="h-5 w-5 rounded-md object-contain" />
            ) : (
              <div className="relative flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-red-500 fill-none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 0 0-10 10" />
                  <path d="M12 6a6 6 0 0 0-6 6" />
                  <circle cx="12" cy="12" r="2" fill="#ef4444" />
                  <path d="M12 6a6 6 0 0 1 6 6" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            <span>{workspaceInfo.name || 'ASLI GROUP'}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle size="md" />
        </div>
      </header>

      {/* Center Compact Card (Matching image_c1891eda.png) */}
      <main className="relative z-20 w-full max-w-[390px] px-4 py-8">
        <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] transition-all">
          {/* Top Squircle Icon */}
          <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/80 text-slate-800 dark:text-white">
            <LogIn className="h-5 w-5 text-slate-700 dark:text-slate-200" />
          </div>

          {/* Mode Switcher Tabs: Register (Default) vs Sign In */}
          <div className="mx-auto mb-4 flex w-full max-w-[280px] rounded-2xl bg-slate-100/90 p-1 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
              className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Registrasi (Baru)
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setErrorMsg(''); }}
              className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Masuk (Login)
            </button>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white text-center">
            {authMode === 'register' ? 'Registrasi Akun & Divisi' : 'Masuk ke Akun Anda'}
          </h1>
          <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2">
            {authMode === 'register'
              ? 'Daftarkan akun atau login dengan Akun Google untuk mengakses workspace perusahaan'
              : 'Gunakan Akun Google atau email kredensial resmi perusahaan Anda'}
          </p>

          {/* Prominent Google Workspace SSO Access */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-slate-300/80 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/80 py-2.5 px-3 text-xs font-bold text-slate-800 dark:text-white shadow-xs transition active:scale-[0.98] cursor-pointer group"
            >
              <svg className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>{authMode === 'register' ? 'Daftar Cepat dengan Akun Google' : 'Masuk dengan Akun Google'}</span>
            </button>
            <div className="relative my-3 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative bg-white/95 dark:bg-slate-900/95 px-2.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                atau isi formulir pendaftaran
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/60 dark:text-red-300">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form: Sign In Mode */}
          {authMode === 'signin' ? (
            <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/20 transition"
                />
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => setErrorMsg('Tautan pemulihan akun telah dikirimkan ke administrator IT perusahaan.')}
                  className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* CTA Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-black active:scale-[0.98] disabled:opacity-60 cursor-pointer dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                <span>{isLoading ? 'Signing in...' : 'Get Started'}</span>
                {!isLoading && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </form>
          ) : (
            /* Form: Register Mode with Division Classification */
            <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-2.5 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Contoh: Pratama Nugraha"
                  className="w-full rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/20 transition font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Email Perusahaan *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="nama@workspace.corp"
                  className="w-full rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/20 transition font-medium"
                />
              </div>

              {/* KLASIFIKASI DIVISI PERUSAHAAN */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1 flex items-center justify-between">
                  <span>Klasifikasi Divisi *</span>
                  <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold lowercase">menentukan akses board</span>
                </label>
                <select
                  value={regDepartment}
                  onChange={e => setRegDepartment(e.target.value)}
                  className="w-full rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="HRGA">HRGA (Human Resource & General Affair)</option>
                  <option value="Technology & Engineering">Technology & Engineering</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="People Operations & Culture">People Operations & Culture</option>
                  <option value="Marketing & Brand">Marketing & Brand</option>
                  <option value="Finance & Legal">Finance & Legal Governance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Jabatan / Posisi
                  </label>
                  <input
                    type="text"
                    value={regPosition}
                    onChange={e => setRegPosition(e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    className="w-full rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Level Role
                  </label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as UserRole)}
                    className="w-full rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="employee">Anggota (Staff)</option>
                    <option value="manager">Lead / Manager</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Password Baru *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>{isLoading ? 'Mendaftarkan...' : 'Daftar & Masuk ke Divisi'}</span>
              </button>
            </form>
          )}

          {/* Dotted Divider */}
          <div className="relative my-3.5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-800" />
            </div>
            <span className="relative bg-white/95 dark:bg-slate-900/95 px-3 text-[11px] text-slate-400 dark:text-slate-500">
              Or sign in with
            </span>
          </div>

          {/* 3 Bottom Compact Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* 1. Google SSO */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              title="Masuk dengan Akun Google"
              className="flex h-10 items-center justify-center rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition active:scale-95 shadow-2xs cursor-pointer group"
            >
              <svg className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
            </button>

            {/* 2. Quick Demo Persona Selector */}
            <button
              type="button"
              onClick={() => setShowPersonaModal(true)}
              title="Pilih Persona Tim (Saeful, Nadia, Budi, Rina)"
              className="flex h-10 items-center justify-center rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition active:scale-95 shadow-2xs cursor-pointer group"
            >
              <Users className="h-4 w-4 text-slate-700 dark:text-slate-300 transition-transform group-hover:scale-110" />
            </button>

            {/* 3. Instant Super Admin Access */}
            <button
              type="button"
              onClick={() => handleQuickLogin(users[0])}
              title="Akses Cepat Super Admin"
              className="flex h-10 items-center justify-center rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition active:scale-95 shadow-2xs cursor-pointer group"
            >
              <ShieldCheck className="h-4 w-4 text-red-600 dark:text-red-400 transition-transform group-hover:scale-110" />
            </button>
          </div>
        </div>
      </main>

      {/* Persona Selection Modal */}
      {showPersonaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/80 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-5 shadow-2xl text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-red-600 dark:text-red-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pilih Persona Demo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPersonaModal(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Pilih salah satu akun tim untuk langsung masuk ke workspace:
            </p>

            <div className="space-y-2">
              {users.slice(0, 4).map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setShowPersonaModal(false);
                    handleQuickLogin(u);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-left transition hover:border-red-400 hover:bg-slate-100 group cursor-pointer dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-red-500 dark:hover:bg-slate-800"
                >
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-red-600 dark:text-white dark:group-hover:text-red-400">
                      {u.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {u.role === 'super_admin' ? '👑 Super Admin' : u.position.split('&')[0]}
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-red-600 dark:text-slate-500 dark:group-hover:text-red-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Google Workspace Login Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/80 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-xs border border-slate-100 dark:border-slate-700">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Masuk dengan Akun Google
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Google Workspace Single Sign-On (SSO)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Division Selection for Google SSO */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-3 border border-slate-200/90 dark:border-slate-700/80 mb-3 space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Klasifikasi Penugasan Divisi:</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">akses board otomatis</span>
              </label>
              <select
                value={googleTargetDept}
                onChange={e => setGoogleTargetDept(e.target.value)}
                className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="HRGA">HRGA (Human Resource & General Affair)</option>
                <option value="Technology & Engineering">Technology & Engineering</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Marketing & Brand">Marketing & Brand</option>
                <option value="Finance & Legal">Finance & Legal Governance</option>
              </select>
            </div>

            {/* Google Accounts Selection */}
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Pilih akun Google terverifikasi untuk melanjutkan ke {workspaceInfo.name || 'ASLI GROUP'}:
              </p>

              {/* Account 1: Saeful Rohman Super Admin */}
              <button
                type="button"
                disabled={isGoogleLoading}
                onClick={() => handleGoogleLoginSubmit('saeful.rohman@asliri.id')}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-red-400 hover:bg-slate-100 group cursor-pointer dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-red-500 dark:hover:bg-slate-800"
              >
                <img
                  src={users[0]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'}
                  alt="Saeful Rohman"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-red-500/30"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-red-600 dark:text-white dark:group-hover:text-red-400 flex items-center gap-1.5">
                    <span>Saeful Rohman</span>
                    <span className="rounded bg-red-100 dark:bg-red-950 px-1.5 py-0.2 text-[9px] font-bold text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                      Super Admin
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    saeful.rohman@asliri.id
                  </div>
                </div>
                <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              </button>

              {/* Account 2: Connected Google Account */}
              <button
                type="button"
                disabled={isGoogleLoading}
                onClick={() => handleGoogleLoginSubmit('bangepunk09@gmail.com')}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-left transition hover:border-slate-300 hover:bg-slate-100 group cursor-pointer dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-white text-sm font-bold shrink-0">
                  B
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-red-600 dark:text-white dark:group-hover:text-red-400">
                    Akun Google Pengguna
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    bangepunk09@gmail.com
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
              </button>

              {/* Or type custom Google Email */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Atau gunakan alamat Google email lain:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="nama@gmail.com / nama@asliri.id"
                    value={googleCustomEmail}
                    onChange={e => setGoogleCustomEmail(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                  />
                  <button
                    type="button"
                    disabled={isGoogleLoading || !googleCustomEmail.trim()}
                    onClick={() => handleGoogleLoginSubmit(googleCustomEmail)}
                    className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-40 transition cursor-pointer"
                  >
                    Masuk
                  </button>
                </div>
              </div>

              {isGoogleLoading && (
                <div className="py-2 text-center text-xs text-slate-500 dark:text-slate-400 animate-pulse flex items-center justify-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  <span>Menghubungkan ke Google Identity Services...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
