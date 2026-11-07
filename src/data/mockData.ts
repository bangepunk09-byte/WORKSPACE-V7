import { User, Post, Task, Channel, ChatMessage, Meeting, DocumentItem, NotificationItem, AuditLog, WorkspaceInfo, DivisionItem, DivisionTaskRequest, BrandDriveFolder, ManagedBrand } from '../types';

export const INITIAL_WORKSPACE_INFO: WorkspaceInfo = {
  name: 'ASLI GROUP',
  tagline: 'Corporate Collaboration Hub',
  orgDomain: 'asliri.id',
  logoUrl: '',
  timezone: 'Asia/Jakarta (WIB)',
  loginLayout: 'left-banner',
  loginBgStyle: 'radiant-journey',
  loginBgCustomUrl: '',
  loginBgBlur: 0,
  loginBgOverlayOpacity: 0,
  loginOuterBgColor: '#181a20',
  loginBannerBadge: 'Join Us to Build 🤩',
  loginBannerHeadline: 'Start your Journey',
  loginBannerSubtitle: 'Follow these simple steps to set up your account.',
  loginStep1Text: 'Register your account',
  loginStep2Text: 'Set up your profile information',
  loginStep3Text: 'Verify your identity through passport/ID',
  loginFormTitleSignUp: 'Join Us',
  loginFormTitleSignIn: 'Welcome Back',
  loginCtaSignUp: 'Continue',
  loginCtaSignIn: 'Continue',
  loginTermsText: 'By signing up I confirm that I carefully have read and agree to the ASLI GROUP Privacy Policy and Terms of Service.'
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_saeful',
    name: 'Saeful Rohman',
    email: 'saeful.rohman@asliri.id',
    password: 'Admin123!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    role: 'super_admin',
    department: 'Technology & Engineering',
    position: 'VP of Technology & Digital Innovation',
    phone: '+62 812-9845-7721',
    location: 'Headquarters - Jakarta (Tower A, Lt. 18)',
    status: 'online',
    bio: 'Fokus pada arsitektur skala enterprise, integrasi identitas digital, keandalan sistem cloud, dan transformasi AI modern.',
    skills: ['System Architecture', 'Cloud Infrastructure', 'Cybersecurity', 'Executive Leadership', 'AI Systems'],
    directReports: ['usr_epunk'],
    joinedDate: '2021-03-15',
    employeeId: 'EMP-2021-001',
    employmentType: 'Full-time',
    birthDate: '1988-06-12',
    gender: 'Laki-laki',
    emergencyContact: { name: 'Siti Rahma', relation: 'Istri', phone: '+62 812-9845-7722' },
    bankAccount: { bankName: 'Bank Central Asia (BCA)', accountNumber: '5270189234', accountHolder: 'Saeful Rohman' }
  },
  {
    id: 'usr_epunk',
    name: 'Bang Epunk',
    email: 'epunk@asliri.id',
    password: 'Admin123!',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
    role: 'super_admin',
    department: 'Marketing & Brand',
    position: 'Lead Marketing & Creative Director',
    phone: '+62 812-3456-7890',
    location: 'Headquarters - Jakarta (Tower A, Lt. 15)',
    status: 'online',
    bio: 'Creative Lead & Strategis Pemasaran ASLI GROUP.',
    skills: ['Brand Strategy', 'Creative Direction', 'Marketing Campaign', 'Content Production'],
    managerId: 'usr_saeful',
    joinedDate: '2021-04-01',
    employeeId: 'EMP-2021-002',
    employmentType: 'Full-time',
    birthDate: '1990-05-15',
    gender: 'Laki-laki',
    emergencyContact: { name: 'Siti', relation: 'Keluarga', phone: '+62 812-3456-7899' },
    bankAccount: { bankName: 'Bank Central Asia (BCA)', accountNumber: '5270189999', accountHolder: 'Bang Epunk' }
  }
];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'dm_kiki',
    name: 'Kiki Pratama',
    type: 'direct',
    otherUserId: 'usr_kiki',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    memberIds: ['usr_saeful', 'usr_kiki'],
    unreadCount: 0
  },
  {
    id: 'dm_shakti',
    name: 'Shakti Ramadhan',
    type: 'direct',
    otherUserId: 'usr_shakti',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    memberIds: ['usr_saeful', 'usr_shakti'],
    unreadCount: 0
  },
  {
    id: 'dm_nadia',
    name: 'Nadia Kirana',
    type: 'direct',
    otherUserId: 'usr_nadia',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    memberIds: ['usr_saeful', 'usr_nadia'],
    unreadCount: 0
  }
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'gcal_kpi_oct',
    title: 'Reminder to collect KPI October 2026',
    description: '📅 Imported dari Google Calendar • Pengumpulan laporan KPI & evaluasi pencapaian target bulanan Oktober 2026.',
    date: '2026-11-02',
    startTime: '15:00',
    endTime: '16:00',
    location: 'Google Calendar / HQ Jakarta',
    meetLink: 'https://meet.google.com/asli-kpi-sync',
    organizerId: 'usr_saeful',
    organizerName: 'Saeful Rohman',
    organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    attendees: [
      { userId: 'usr_saeful', name: 'Saeful Rohman', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80', role: 'Organizer', status: 'accepted' },
      { userId: 'usr_epunk', name: 'Bang Epunk', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80', role: 'Creative Director', status: 'accepted' }
    ],
    agenda: ['Review pencapaian KPI bulanan Oktober 2026', 'Finalisasi data laporan ke direksi'],
    actionItems: [
      { id: 'ai_kpi_1', text: 'Kumpulkan rekapitulasi score KPI dari masing-masing kepala divisi', isConvertedToTask: false }
    ],
    status: 'scheduled',
    createdAt: '2026-10-28T08:00:00.000Z'
  },
  {
    id: 'gcal_shooting_trinity',
    title: 'Shooting Trinity',
    description: '📅 Imported dari Google Calendar • Sesi produksi & shooting video klip kampanye Trinity.',
    date: '2026-11-05',
    startTime: '18:00',
    endTime: '21:00',
    location: 'Studio Utama / On Location Trinity',
    meetLink: 'https://meet.google.com/asli-shooting-trinity',
    organizerId: 'usr_epunk',
    organizerName: 'Bang Epunk',
    organizerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
    attendees: [
      { userId: 'usr_epunk', name: 'Bang Epunk', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80', role: 'Organizer', status: 'accepted' },
      { userId: 'usr_saeful', name: 'Saeful Rohman', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80', role: 'VP Tech', status: 'accepted' }
    ],
    agenda: ['Shooting video materi kampanye Trinity', 'Pemeriksaan lighting & audio master'],
    actionItems: [
      { id: 'ai_shoot_1', text: 'Upload raw footage shooting Trinity ke Drive', isConvertedToTask: false }
    ],
    status: 'scheduled',
    createdAt: '2026-10-29T10:00:00.000Z'
  },
  {
    id: 'gcal_weekly_mkt_1',
    title: 'Weekly - Marketing',
    description: '📅 Imported dari Google Calendar • Sesi sinkronisasi rutin minggu I pemasaran & campaign brand.',
    date: '2026-11-06',
    startTime: '15:00',
    endTime: '16:00',
    location: 'Ruang Rapat Marketing (Lt. 15) / Google Meet',
    meetLink: 'https://meet.google.com/asli-weekly-marketing',
    organizerId: 'usr_epunk',
    organizerName: 'Bang Epunk',
    organizerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
    attendees: [
      { userId: 'usr_epunk', name: 'Bang Epunk', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80', role: 'Organizer', status: 'accepted' }
    ],
    agenda: ['Review performa reels minggu ini', 'Persiapan konten minggu depan'],
    actionItems: [],
    status: 'scheduled',
    createdAt: '2026-11-01T08:00:00.000Z'
  },
  {
    id: 'gcal_weekly_mkt_2',
    title: 'Weekly - Marketing',
    description: '📅 Imported dari Google Calendar • Sesi sinkronisasi rutin minggu II pemasaran.',
    date: '2026-11-13',
    startTime: '15:00',
    endTime: '16:00',
    location: 'Google Meet Virtual Room',
    meetLink: 'https://meet.google.com/asli-weekly-marketing',
    organizerId: 'usr_epunk',
    organizerName: 'Bang Epunk',
    organizerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
    attendees: [
      { userId: 'usr_epunk', name: 'Bang Epunk', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80', role: 'Organizer', status: 'accepted' }
    ],
    agenda: ['Evaluasi engagement campaign & ad spends'],
    actionItems: [],
    status: 'scheduled',
    createdAt: '2026-11-01T08:00:00.000Z'
  },
  {
    id: 'gcal_sharing_pk',
    title: 'Sharing Session - Product Knowledge ASLIRI',
    description: '📅 Imported dari Google Calendar • Edukasi & pelatihan internal produk biometrik & solusi ASLIRI.',
    date: '2026-11-16',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Auditorium Utama Tower A (Lt. 18) / Live Streaming',
    meetLink: 'https://meet.google.com/asli-sharing-session',
    organizerId: 'usr_saeful',
    organizerName: 'Saeful Rohman',
    organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    attendees: [
      { userId: 'usr_saeful', name: 'Saeful Rohman', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80', role: 'Organizer', status: 'accepted' },
      { userId: 'usr_epunk', name: 'Bang Epunk', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80', role: 'Participant', status: 'accepted' }
    ],
    agenda: ['Penjelasan produk biometrik & verifikasi paspor', 'Sesi tanya jawab interaktif'],
    actionItems: [
      { id: 'ai_pk_1', text: 'Bagikan slide deck materi product knowledge ke peserta', isConvertedToTask: false }
    ],
    status: 'scheduled',
    createdAt: '2026-11-02T11:00:00.000Z'
  },
  {
    id: 'gcal_weekly_mkt_3',
    title: 'Weekly - Marketing',
    description: '📅 Imported dari Google Calendar • Sesi sinkronisasi rutin minggu III pemasaran.',
    date: '2026-11-20',
    startTime: '15:00',
    endTime: '16:00',
    location: 'Google Meet Virtual Room',
    meetLink: 'https://meet.google.com/asli-weekly-marketing',
    organizerId: 'usr_epunk',
    organizerName: 'Bang Epunk',
    organizerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
    attendees: [
      { userId: 'usr_epunk', name: 'Bang Epunk', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80', role: 'Organizer', status: 'accepted' }
    ],
    agenda: ['Sync progres campaign Q4 akhir bulan'],
    actionItems: [],
    status: 'scheduled',
    createdAt: '2026-11-01T08:00:00.000Z'
  },
  {
    id: 'gcal_weekly_mkt_4',
    title: 'Weekly - Marketing',
    description: '📅 Imported dari Google Calendar • Sesi sinkronisasi rutin minggu IV pemasaran.',
    date: '2026-11-27',
    startTime: '15:00',
    endTime: '16:00',
    location: 'Google Meet Virtual Room',
    meetLink: 'https://meet.google.com/asli-weekly-marketing',
    organizerId: 'usr_epunk',
    organizerName: 'Bang Epunk',
    organizerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
    attendees: [
      { userId: 'usr_epunk', name: 'Bang Epunk', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80', role: 'Organizer', status: 'accepted' }
    ],
    agenda: ['Review bulanan campaign November'],
    actionItems: [],
    status: 'scheduled',
    createdAt: '2026-11-01T08:00:00.000Z'
  },
  {
    id: 'gcal_weekly_mkt_5',
    title: 'Weekly - Marketing',
    description: '📅 Imported dari Google Calendar • Sesi sinkronisasi rutin minggu I Desember.',
    date: '2026-12-04',
    startTime: '15:00',
    endTime: '16:00',
    location: 'Google Meet Virtual Room',
    meetLink: 'https://meet.google.com/asli-weekly-marketing',
    organizerId: 'usr_epunk',
    organizerName: 'Bang Epunk',
    organizerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
    attendees: [
      { userId: 'usr_epunk', name: 'Bang Epunk', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80', role: 'Organizer', status: 'accepted' }
    ],
    agenda: ['Perencanaan campaign awal Desember'],
    actionItems: [],
    status: 'scheduled',
    createdAt: '2026-11-01T08:00:00.000Z'
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_BRAND_DRIVE_FOLDERS: BrandDriveFolder[] = [];

export const INITIAL_DIVISIONS: DivisionItem[] = [
  {
    id: 'div_marketing',
    name: 'MARKETING',
    departmentMatch: 'MARKETING',
    leadName: 'Siti Rahma',
    leadRole: 'Head of Marketing',
    leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    color: 'royal-blue',
    bannerGradient: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 35%, #1e1b4b 100%)',
    description: 'Marketing & Brand Strategy workspace.'
  },
  {
    id: 'div_hrga',
    name: 'HRGA',
    departmentMatch: 'HRGA',
    leadName: 'Dewi Lestari',
    leadRole: 'Head of HRGA',
    leadAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80',
    color: 'emerald-teal',
    bannerGradient: 'linear-gradient(90deg, #059669 0%, #0d9488 45%, #064e3b 100%)',
    description: 'Human Resources & General Affairs workspace.'
  },
  {
    id: 'div_legal',
    name: 'LEGAL',
    departmentMatch: 'LEGAL',
    leadName: 'Ahmad Hakim',
    leadRole: 'Chief Legal Officer',
    leadAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    color: 'rose-red',
    bannerGradient: 'linear-gradient(90deg, #e11d48 0%, #9f1239 45%, #4c0519 100%)',
    description: 'Legal compliance, contracts & regulatory governance.'
  },
  {
    id: 'div_finance',
    name: 'FINANCE',
    departmentMatch: 'FINANCE',
    leadName: 'Rina Melati',
    leadRole: 'Head of Finance',
    leadAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
    color: 'amber-sunset',
    bannerGradient: 'linear-gradient(90deg, #ea580c 0%, #d97706 45%, #451a03 100%)',
    description: 'Financial planning, accounting, budgeting & audits.'
  },
  {
    id: 'div_sales',
    name: 'SALES',
    departmentMatch: 'SALES',
    leadName: 'Budi Santoso',
    leadRole: 'VP of Sales',
    leadAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80',
    color: 'royal-blue',
    bannerGradient: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 40%, #1e1b4b 100%)',
    description: 'Sales pipeline, commercial partnerships & revenue growth.'
  },
  {
    id: 'div_it',
    name: 'IT',
    departmentMatch: 'IT',
    leadName: 'Saeful Rohman',
    leadRole: 'VP of Technology & IT',
    leadAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80',
    color: 'vibrant-purple',
    bannerGradient: 'linear-gradient(90deg, #9333ea 0%, #7e22ce 40%, #1e1b4b 100%)',
    description: 'Information Technology, infrastructure, security & engineering.'
  }
];

export const INITIAL_DIVISION_REQUESTS: DivisionTaskRequest[] = [];

export const INITIAL_MANAGED_BRANDS: ManagedBrand[] = [];

