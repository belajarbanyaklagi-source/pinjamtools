import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import HomePage from '@/pages/HomePage'
import CatalogPage from '@/pages/CatalogPage'
import ToolDetailPage from '@/pages/ToolDetailPage'
import ScanPage from '@/pages/ScanPage'
import ActiveLoansPage from '@/pages/ActiveLoansPage'
import HistoryPage from '@/pages/HistoryPage'
import ProfilePage from '@/pages/ProfilePage'
import LoginPage from '@/pages/LoginPage'
import WelcomePage from '@/pages/WelcomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import AdminApprovalPage from '@/pages/admin/AdminApprovalPage'
import ToolManagementPage from '@/pages/admin/ToolManagementPage'
import { useAuthStore } from '@/stores'
import { supabase } from '@/lib/supabase'

// Auth Guard: Redirects any unauthenticated visitor to /login
function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function App() {
  const { setUser } = useAuthStore()

  // Listen for Supabase Google OAuth callback & session changes
  useEffect(() => {
    // 1. Check existing session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user
        const meta = u.user_metadata || {}
        setUser({
          id: u.id,
          email: u.email || 'user.google@gmail.com',
          fullName: meta.full_name || meta.name || (u.email ? u.email.split('@')[0] : 'Pengguna Google'),
          memberId: `PK-${u.id.substring(0, 6).toUpperCase()}`,
          avatarUrl: meta.avatar_url || meta.picture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.id}`,
          role: 'member',
          totalBorrows: 0,
          favoriteTools: 0,
          rewardPoints: 100,
          department: 'Workshop Member',
          createdAt: u.created_at || new Date().toISOString(),
        })
      }
    })

    // 2. Subscribe to auth events (Sign in with Google OAuth)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user
        const meta = u.user_metadata || {}
        setUser({
          id: u.id,
          email: u.email || 'user.google@gmail.com',
          fullName: meta.full_name || meta.name || (u.email ? u.email.split('@')[0] : 'Pengguna Google'),
          memberId: `PK-${u.id.substring(0, 6).toUpperCase()}`,
          avatarUrl: meta.avatar_url || meta.picture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.id}`,
          role: 'member',
          totalBorrows: 0,
          favoriteTools: 0,
          rewardPoints: 100,
          department: 'Workshop Member',
          createdAt: u.created_at || new Date().toISOString(),
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/welcome" element={<WelcomePage />} />

        {/* Protected Routes (Requires Login) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="katalog" element={<CatalogPage />} />
            <Route path="katalog/:id" element={<ToolDetailPage />} />
            <Route path="scan" element={<ScanPage />} />
            <Route path="aktif" element={<ActiveLoansPage />} />
            <Route path="riwayat" element={<HistoryPage />} />
            <Route path="profil" element={<ProfilePage />} />

            {/* Admin Routes */}
            <Route path="admin/approvals" element={<AdminApprovalPage />} />
            <Route path="admin/tools" element={<ToolManagementPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
