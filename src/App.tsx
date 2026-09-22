import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<AppLayout />}>
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

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
