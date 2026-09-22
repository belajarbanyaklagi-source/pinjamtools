import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Package, ScanLine, ClipboardList, User, ShieldCheck, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores'

export default function BottomNav() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  const memberNavItems = [
    { icon: Home, label: 'Beranda', path: '/' },
    { icon: Package, label: 'Katalog', path: '/katalog' },
    { icon: ScanLine, label: 'Scan', path: '/scan', isMain: true },
    { icon: ClipboardList, label: 'Aktif', path: '/aktif' },
    { icon: User, label: 'Profil', path: '/profil' },
  ]

  const adminNavItems = [
    { icon: Home, label: 'Beranda', path: '/' },
    { icon: ShieldCheck, label: 'Verifikasi', path: '/admin/approvals' },
    { icon: ScanLine, label: 'Scan', path: '/scan', isMain: true },
    { icon: Wrench, label: 'Kelola Alat', path: '/admin/tools' },
    { icon: User, label: 'Profil', path: '/profil' },
  ]

  const navItems = isAdmin ? adminNavItems : memberNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-md border-t border-gray-200 px-4 pb-safe z-40">
      <div className="flex justify-between items-center h-full max-w-md mx-auto relative">
        {navItems.map((item, index) => {
          const isMain = item.isMain
          const Icon = item.icon

          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center w-14 transition-colors',
                  isMain ? 'absolute left-1/2 -translate-x-1/2 -top-5' : '',
                  isActive ? 'text-teal-600 font-bold' : 'text-gray-400 hover:text-gray-600'
                )
              }
            >
              {isMain ? (
                <div className="bg-teal-600 text-white p-4 rounded-full shadow-lg shadow-teal-600/30 active:scale-95 transition-transform">
                  <Icon size={24} />
                </div>
              ) : (
                <>
                  <Icon size={20} className="mb-1" />
                  <span className="text-[10px]">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
