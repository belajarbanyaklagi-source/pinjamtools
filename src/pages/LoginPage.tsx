import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ChevronLeft, Shield, User, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores'
import { toast } from 'sonner'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('budi.santoso@workshop.com')
  const [password, setPassword] = useState('••••••••')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })
      if (error) {
        throw error
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err)
      toast.info('Google OAuth dialihkan atau menggunakan sesi login saat ini.')
      // Fallback for seamless demo testing
      setUser({
        id: '1',
        email: 'budi.santoso@gmail.com',
        fullName: 'Budi Santoso',
        memberId: 'PK-964712',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Budi',
        role: 'member',
        totalBorrows: 47,
        favoriteTools: 12,
        rewardPoints: 580,
        createdAt: '2023-01-15',
      })
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }

  // Quick Role Switcher for 2-device testing
  const handleQuickLogin = (role: 'member' | 'admin') => {
    if (role === 'admin') {
      setUser({
        id: 'admin-1',
        email: 'admin.gudang@workshop.com',
        fullName: 'Mandor Hendra (Admin)',
        memberId: 'ADM-001',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Hendra',
        role: 'admin',
        totalBorrows: 152,
        favoriteTools: 25,
        rewardPoints: 1200,
        createdAt: '2022-01-01',
      })
      toast.success('Login sebagai Admin / Petugas Gudang!')
      navigate('/admin/approvals')
    } else {
      setUser({
        id: '1',
        email: 'budi.santoso@workshop.com',
        fullName: 'Budi Santoso (Peminjam)',
        memberId: 'PK-964712',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Budi',
        role: 'member',
        totalBorrows: 47,
        favoriteTools: 12,
        rewardPoints: 580,
        createdAt: '2023-01-15',
      })
      toast.success('Login sebagai Peminjam Alat!')
      navigate('/')
    }
  }

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    handleQuickLogin('member')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col p-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6 mt-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 flex flex-col max-w-sm w-full mx-auto"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Masuk Akun</h1>
          <p className="text-xs text-gray-500">
            Masuk dengan Akun Google atau akun workshop untuk mulai meminjam alat.
          </p>
        </div>

        {/* Primary Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white border-2 border-gray-200 hover:border-teal-500 hover:bg-gray-50 text-gray-800 font-bold py-3.5 px-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3 active:scale-[0.98] mb-4"
        >
          {/* Google "G" Colorful SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span className="text-sm">Lanjutkan dengan Google</span>
        </button>

        <div className="relative flex items-center my-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-3 text-gray-400 text-xs uppercase font-medium">
            atau pilih peran uji coba
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Dual Role Selector for Instant Multi-Device Testing */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          <button
            type="button"
            onClick={() => handleQuickLogin('member')}
            className="p-3 border-2 border-teal-200 bg-teal-50/50 hover:bg-teal-50 rounded-2xl flex flex-col items-center text-center transition-all group active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-900">HP Peminjam</span>
            <span className="text-[10px] text-teal-700 font-medium">Budi Santoso</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="p-3 border-2 border-purple-200 bg-purple-50/50 hover:bg-purple-50 rounded-2xl flex flex-col items-center text-center transition-all group active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-purple-700 text-white flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-900">HP Admin/Pemilik</span>
            <span className="text-[10px] text-purple-700 font-medium">Mandor Hendra</span>
          </button>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-3.5 mb-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Email Kerja</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs text-gray-900"
              required
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-gray-700">Kata Sandi</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs text-gray-900 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-600/20 text-xs transition-all active:scale-[0.98] mt-1"
          >
            Masuk dengan Email
          </button>
        </form>

        <div className="mt-auto text-center pb-4 text-xs text-gray-400">
          PinjamKu v2.0 • Sistem Peminjaman Alat Terverifikasi
        </div>
      </motion.div>
    </div>
  )
}
