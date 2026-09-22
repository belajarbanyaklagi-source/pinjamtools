// ============================================================
// PinjamKu — Constants (Tools/Alat Kerja)
// ============================================================

export const APP_NAME = 'PinjamKu'
export const APP_DESCRIPTION = 'Pinjam dan Kembalikan Alat dengan Mudah'
export const APP_TAGLINE = 'Kelola peminjaman alat kerja secara praktis dan efisien dengan fitur scan QR, tracking, dan notifikasi otomatis.'

// Borrow settings
export const MAX_BORROW_DAYS = 7
export const MAX_EXTENSIONS = 2
export const EXTENSION_DAYS = 3
export const MAX_ACTIVE_BORROWS = 5
export const FINE_PER_DAY = 5000 // Rp 5.000 per hari

// Reward points
export const POINTS_BORROW = 10
export const POINTS_RETURN_ONTIME = 15
export const POINTS_EXTEND = 5

// UI
export const BOTTOM_NAV_HEIGHT = 80 // px
export const HEADER_HEIGHT = 64 // px

// Routes
export const ROUTES = {
  WELCOME: '/welcome',
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/',
  SCAN: '/scan',
  CATALOG: '/katalog',
  TOOL_DETAIL: '/katalog/:id',
  ACTIVE: '/aktif',
  HISTORY: '/riwayat',
  PROFILE: '/profil',
} as const

// Activity status labels
export const ACTIVITY_STATUS_LABELS = {
  dikembalikan: 'Dikembalikan',
  sedang_dipinjam: 'Sedang Dipinjam',
  terlambat_denda: 'Terlambat & Denda',
} as const

export const ACTIVITY_STATUS_COLORS = {
  dikembalikan: 'bg-emerald-100 text-emerald-700',
  sedang_dipinjam: 'bg-amber-100 text-amber-700',
  terlambat_denda: 'bg-red-100 text-red-700',
} as const

// Tool categories
export const TOOL_CATEGORIES = [
  { value: 'kunci_inggris', label: 'Kunci Inggris', icon: '🔧' },
  { value: 'kunci_pas', label: 'Kunci Pas', icon: '🔩' },
  { value: 'kunci_ring', label: 'Kunci Ring', icon: '⭕' },
  { value: 'kunci_pas_ring', label: 'Kunci Pas Ring', icon: '🔗' },
  { value: 'kunci_sok', label: 'Kunci Sok', icon: '🔌' },
  { value: 'kunci_l', label: 'Kunci L / Allen', icon: '📐' },
  { value: 'kunci_torx', label: 'Kunci Torx', icon: '⭐' },
  { value: 'kunci_pipa', label: 'Kunci Pipa', icon: '🔨' },
  { value: 'kunci_momen', label: 'Kunci Momen', icon: '⚙️' },
  { value: 'kunci_spesial', label: 'Kunci Spesial', icon: '🛠️' },
] as const

// Tool condition labels
export const TOOL_CONDITIONS = {
  baik: { label: 'Baik', color: 'text-emerald-600 bg-emerald-50' },
  cukup_baik: { label: 'Cukup Baik', color: 'text-amber-600 bg-amber-50' },
  perlu_perbaikan: { label: 'Perlu Perbaikan', color: 'text-red-600 bg-red-50' },
} as const

// Category tab filters for catalog
export const CATALOG_TABS = [
  { value: 'semua', label: 'Semua' },
  { value: 'tersedia', label: 'Tersedia' },
  { value: 'populer', label: 'Populer' },
] as const
