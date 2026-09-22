import { create } from 'zustand'
import type { User, Borrow, Tool } from '@/lib/types'
import { mockUser, mockBorrows, mockTools } from '@/lib/mock-data'

// ---- Auth Store ----
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  login: async (_email: string, _password: string) => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 1000))
    set({ user: mockUser, isAuthenticated: true, isLoading: false })
  },
  logout: () => {
    set({ user: null, isAuthenticated: false })
  },
  setUser: (user: User) => {
    set({ user })
  },
}))

// ---- Borrow Store ----
interface BorrowState {
  borrows: Borrow[]
  isLoading: boolean
  setBorrows: (borrows: Borrow[]) => void
  addBorrow: (borrow: Borrow) => void
  extendBorrow: (borrowId: string) => void
  returnBorrow: (borrowId: string) => void
}

export const useBorrowStore = create<BorrowState>((set) => ({
  borrows: mockBorrows,
  isLoading: false,
  setBorrows: (borrows) => set({ borrows }),
  addBorrow: (borrow) =>
    set((state) => ({ borrows: [...state.borrows, borrow] })),
  extendBorrow: (borrowId) =>
    set((state) => ({
      borrows: state.borrows.map((b) =>
        b.id === borrowId
          ? {
              ...b,
              extensions: b.extensions + 1,
              dueDate: new Date(
                new Date(b.dueDate).getTime() + 3 * 24 * 60 * 60 * 1000
              )
                .toISOString()
                .split('T')[0]!,
            }
          : b
      ),
    })),
  returnBorrow: (borrowId) =>
    set((state) => ({
      borrows: state.borrows.map((b) =>
        b.id === borrowId
          ? {
              ...b,
              status: 'returned' as const,
              returnDate: new Date().toISOString().split('T')[0]!,
            }
          : b
      ),
    })),
}))

// ---- Tool Catalog Store ----
interface ToolState {
  tools: Tool[]
  searchQuery: string
  selectedCategory: string
  isLoading: boolean
  setTools: (tools: Tool[]) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string) => void
  getFilteredTools: () => Tool[]
}

export const useToolStore = create<ToolState>((set, get) => ({
  tools: mockTools,
  searchQuery: '',
  selectedCategory: 'semua',
  isLoading: false,
  setTools: (tools) => set({ tools }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  getFilteredTools: () => {
    const { tools, searchQuery, selectedCategory } = get()
    let filtered = tools

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.brand.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
    }

    if (selectedCategory === 'tersedia') {
      filtered = filtered.filter((t) => t.availableStock > 0)
    } else if (selectedCategory === 'populer') {
      filtered = [...filtered].sort((a, b) => b.totalBorrowed - a.totalBorrowed)
    } else if (selectedCategory !== 'semua') {
      filtered = filtered.filter((t) => t.category === selectedCategory)
    }

    return filtered
  },
}))

// ---- UI Store ----
interface UIState {
  isScannerOpen: boolean
  isDrawerOpen: boolean
  activeTab: string
  setScannerOpen: (open: boolean) => void
  setDrawerOpen: (open: boolean) => void
  setActiveTab: (tab: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  isScannerOpen: false,
  isDrawerOpen: false,
  activeTab: '/',
  setScannerOpen: (open) => set({ isScannerOpen: open }),
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
