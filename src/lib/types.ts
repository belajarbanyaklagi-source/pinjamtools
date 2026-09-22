// ============================================================
// PinjamKu — Type Definitions (Tools/Alat Kerja)
// ============================================================

export interface User {
  id: string
  email: string
  fullName: string
  memberId: string
  avatarUrl: string
  role: 'admin' | 'member'
  totalBorrows: number
  favoriteTools: number
  rewardPoints: number
  phone?: string
  department?: string
  createdAt: string
}

export interface Tool {
  id: string
  name: string
  brand: string
  code: string
  imageUrl: string
  category: ToolCategory
  qrCode: string
  totalStock: number
  availableStock: number
  isActive: boolean
  description: string
  specification?: string
  size?: string
  weight?: string
  condition: 'baik' | 'cukup_baik' | 'perlu_perbaikan'
  location: string
  rating: number
  totalBorrowed: number
  createdAt: string
}

export interface Borrow {
  id: string
  userId: string
  userName?: string
  userEmail?: string
  toolId: string
  tool: Tool
  borrowCode: string
  borrowDate: string
  dueDate: string
  returnDate: string | null
  status: BorrowStatus
  extensions: number
  fineAmount: number
  finePaid: boolean
  notes?: string
  proofPhotoUrl?: string | null
  approvedBy?: string | null
  approvedAt?: string | null
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}

export interface RewardLog {
  id: string
  userId: string
  borrowId: string
  points: number
  reason: RewardReason
  createdAt: string
}

export interface ActivityItem {
  id: string
  date: string
  toolName: string
  toolBrand: string
  status: ActivityStatus
  imageUrl?: string
}

// Enums
export type BorrowStatus = 'pending_approval' | 'active' | 'returned' | 'overdue' | 'rejected'
export type NotificationType = 'reminder' | 'overdue' | 'info' | 'reward'
export type RewardReason = 'borrow' | 'return_ontime' | 'extend' | 'bonus'
export type ActivityStatus = 'dikembalikan' | 'sedang_dipinjam' | 'terlambat_denda'

export type ToolCategory =
  | 'kunci_inggris'
  | 'kunci_pas'
  | 'kunci_ring'
  | 'kunci_pas_ring'
  | 'kunci_sok'
  | 'kunci_l'
  | 'kunci_torx'
  | 'kunci_pipa'
  | 'kunci_momen'
  | 'kunci_spesial'

// Navigation
export interface NavItem {
  label: string
  path: string
  icon: string
}

// Stats
export interface UserStats {
  totalBorrows: number
  favoriteTools: number
  rewardPoints: number
}
