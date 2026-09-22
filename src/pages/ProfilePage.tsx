import React from 'react'
import { motion } from 'framer-motion'
import {
  LogOut,
  ChevronRight,
  User,
  Heart,
  Shield,
  HelpCircle,
  Gift,
  ShieldCheck,
  Wrench,
  Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import { toast } from 'sonner'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuthStore()
  const currentUser = user || {
    id: '1',
    email: 'budi.santoso@workshop.com',
    fullName: 'Budi Santoso',
    memberId: 'PK-964712',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Budi',
    role: 'member',
    totalBorrows: 47,
    favoriteTools: 12,
    rewardPoints: 580,
    department: 'Maintenance Workshop',
    createdAt: '2023-01-15',
  }

  const isAdmin = currentUser.role === 'admin'

  const toggleRole = () => {
    if (isAdmin) {
      setUser({
        ...currentUser,
        fullName: 'Budi Santoso',
        role: 'member',
        department: 'Maintenance Workshop',
        memberId: 'PK-964712',
      })
      toast.success('Beralih ke Peran: Peminjam Alat')
      navigate('/')
    } else {
      setUser({
        ...currentUser,
        fullName: 'Mandor Hendra (Admin)',
        role: 'admin',
        department: 'Kepala Gudang & Workshop',
        memberId: 'ADM-001',
      })
      toast.success('Beralih ke Peran: Admin / Pemilik Alat')
      navigate('/admin/approvals')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Top Header */}
      <div className="bg-teal-600 px-6 pt-12 pb-28 rounded-b-3xl relative text-center">
        <h1 className="text-xl font-bold text-white">Profil Saya</h1>
        <p className="text-xs text-teal-100 mt-0.5">Identitas & Hak Akses Workshop</p>
      </div>

      <div className="px-4 -mt-20 relative z-10 space-y-4">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white shadow-md overflow-hidden -mt-14 mb-3">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-1 bg-teal-50 text-teal-700 border border-teal-200">
              {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
              {isAdmin ? 'Akun Admin / Pemilik Alat' : 'Akun Anggota / Peminjam'}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{currentUser.fullName}</h2>
            <p className="text-xs text-gray-500">{currentUser.email}</p>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 mt-4 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">{currentUser.totalBorrows}</p>
              <p className="text-[10px] text-gray-400 uppercase">Pinjaman</p>
            </div>
            <div className="border-x border-gray-100">
              <p className="text-lg font-bold text-gray-900">{currentUser.favoriteTools}</p>
              <p className="text-[10px] text-gray-400 uppercase">Favorit</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-500">{currentUser.rewardPoints}</p>
              <p className="text-[10px] text-gray-400 uppercase">Poin</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Role Switcher (Crucial for Multi-Device & Demo Testing) */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <p className="text-xs font-bold">Uji Coba Peran HP</p>
              <p className="text-[10px] text-teal-200">
                Saat ini: <strong>{isAdmin ? 'Admin / Pemilik' : 'Peminjam Alat'}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={toggleRole}
            className="bg-white text-teal-900 font-bold text-xs px-3 py-2 rounded-xl hover:bg-teal-50 shadow-sm transition-transform active:scale-95"
          >
            Ganti ke {isAdmin ? 'Peminjam' : 'Admin'}
          </button>
        </div>

        {/* Admin Navigation Short-cuts if Admin */}
        {isAdmin && (
          <div className="bg-white rounded-2xl p-3 border border-purple-100 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider px-2 py-1">
              Menu Khusus Admin
            </p>
            <button
              onClick={() => navigate('/admin/approvals')}
              className="w-full flex items-center justify-between p-3 hover:bg-purple-50/50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-800">Verifikasi & Foto Serah Terima</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => navigate('/admin/tools')}
              className="w-full flex items-center justify-between p-3 hover:bg-purple-50/50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-800">Manajemen Data Alat (Add/Edit/Delete)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}

        {/* Digital Member Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 text-white shadow-md flex justify-between items-center">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">ID Anggota Digital</p>
            <p className="font-mono text-sm tracking-widest font-bold text-teal-300 mt-0.5">
              {currentUser.memberId}
            </p>
            <span className="inline-block mt-2 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
              Terverifikasi
            </span>
          </div>
          <div className="bg-white p-2 rounded-xl text-black">
            <span className="text-[10px] font-mono font-bold block text-center">ID QR</span>
            <div className="w-10 h-10 bg-gray-100 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-[9px]">
              QR
            </div>
          </div>
        </div>

        {/* General Menus */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 space-y-1">
          <MenuButton icon={<Heart className="w-4 h-4" />} label="Alat Favorit Saya" />
          <MenuButton icon={<Gift className="w-4 h-4" />} label="Poin & Reward" />
          <MenuButton icon={<HelpCircle className="w-4 h-4" />} label="Bantuan & SOP Workshop" />
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-white text-red-600 font-bold py-3.5 rounded-2xl shadow-sm border border-red-100 flex items-center justify-center gap-2 hover:bg-red-50 transition-colors text-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Akun</span>
        </button>
      </div>
    </div>
  )
}

function MenuButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">{icon}</div>
        <span className="text-xs font-semibold text-gray-800">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  )
}
