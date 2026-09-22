import Dexie, { type EntityTable } from 'dexie'

// ============================================================
// PinjamKu — Offline Database (IndexedDB via Dexie.js)
// ============================================================

interface OfflineTool {
  id: string
  name: string
  brand: string
  code: string
  imageUrl: string
  category: string
  qrCode: string
  availableStock: number
  location: string
  condition: string
  syncedAt: number
}

interface OfflineBorrow {
  id: string
  userId: string
  toolId: string
  borrowDate: string
  dueDate: string
  returnDate: string | null
  status: string
  syncedAt: number
}

interface PendingSync {
  id?: number
  action: 'borrow' | 'return' | 'extend'
  payload: string
  createdAt: number
  retries: number
}

const db = new Dexie('PinjamKuDB') as Dexie & {
  tools: EntityTable<OfflineTool, 'id'>
  borrows: EntityTable<OfflineBorrow, 'id'>
  pendingSync: EntityTable<PendingSync, 'id'>
}

db.version(2).stores({
  tools: 'id, name, brand, code, qrCode, category, location',
  borrows: 'id, userId, toolId, status, dueDate',
  pendingSync: '++id, action, createdAt',
})

export { db }
export type { OfflineTool, OfflineBorrow, PendingSync }
