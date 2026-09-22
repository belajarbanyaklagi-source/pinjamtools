import React from 'react';
import { motion } from 'framer-motion';
import { Search, ScanLine, Wrench, Bell, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { mockUser, mockTools, mockBorrows } from '@/lib/mock-data';
import { TOOL_CATEGORIES } from '@/lib/constants';

export default function HomePage() {
  const navigate = useNavigate();
  const activeBorrows = mockBorrows.filter(b => b.status === 'active' || b.status === 'overdue');
  const popularTools = mockTools.filter(t => t.rating && t.rating >= 4.5).slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Section */}
      <div className="bg-teal-600 px-6 pt-12 pb-6 rounded-b-3xl shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex justify-between items-start mb-6">
          <div>
            <p className="text-teal-100 text-sm font-medium">Selamat pagi,</p>
            <h1 className="text-white text-xl font-bold mt-0.5 flex items-center gap-2">
              {mockUser.fullName.split(' ')[0]} 🔧
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 bg-teal-500/30 rounded-full text-white hover:bg-teal-500/50 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-teal-600"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-white/20 p-0.5 border-2 border-white/50 overflow-hidden">
              <img 
                src={mockUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(mockUser.fullName)}&background=0D9488&color=fff`} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative z-10">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Cari alat, kunci, atau kategori..." 
            className="w-full bg-white py-3.5 pl-11 pr-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
            onClick={() => navigate('/katalog')}
            readOnly
          />
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-6 mt-6 space-y-8"
      >
        {/* Active Borrows */}
        {activeBorrows.length > 0 && (
          <motion.section variants={itemVariants}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Sedang Dipinjam ({activeBorrows.length})</h2>
              <Link to="/active-loans" className="text-sm font-medium text-teal-600">Lihat Semua</Link>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-2 -mx-6 px-6 hide-scrollbar">
              {activeBorrows.map(borrow => (
                <div key={borrow.id} className="min-w-[280px] bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg flex items-center justify-center shrink-0 border border-teal-50 overflow-hidden">
                    {borrow.tool.imageUrl ? (
                      <img src={borrow.tool.imageUrl} alt={borrow.tool.name} className="w-full h-full object-cover" />
                    ) : (
                      <Wrench className="w-8 h-8 text-teal-600 opacity-60" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{borrow.tool.name}</h3>
                    <p className="text-xs text-gray-500 truncate mb-2">{borrow.tool.brand}</p>
                    <div className="flex items-center">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${borrow.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                        {borrow.status === 'overdue' ? 'Terlambat' : 'Dipinjam'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Categories */}
        <motion.section variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Eksplorasi Kategori</h2>
            <Link to="/katalog" className="text-sm font-medium text-teal-600">Lihat Semua</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {TOOL_CATEGORIES.slice(0, 4).map((cat, idx) => {
              const bgColors = ['bg-blue-50', 'bg-orange-50', 'bg-purple-50', 'bg-green-50'];
              return (
                <Link key={cat.value} to={`/katalog?category=${cat.value}`}>
                  <div className={`${bgColors[idx % bgColors.length]} p-4 rounded-xl flex items-center gap-3 active:scale-95 transition-transform`}>
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="font-medium text-gray-800 text-sm">{cat.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.section>

        {/* Popular Tools */}
        <motion.section variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Rekomendasi Untukmu</h2>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 hide-scrollbar">
            {popularTools.map(tool => (
              <Link key={tool.id} to={`/katalog/${tool.id}`}>
                <div className="w-[140px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col active:scale-95 transition-transform">
                  <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative p-2">
                    {tool.imageUrl ? (
                      <img src={tool.imageUrl} alt={tool.name} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <Wrench className="w-12 h-12 text-gray-300" />
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-800 flex items-center gap-0.5 shadow-sm">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {tool.rating}
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">{tool.name}</h3>
                    <p className="text-xs text-gray-500 truncate mt-auto mb-2">{tool.brand}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded w-fit ${tool.availableStock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {tool.availableStock > 0 ? 'Tersedia' : 'Habis'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      </motion.div>

      {/* FAB */}
      <Link to="/scan">
        <button className="fixed bottom-20 right-6 w-14 h-14 bg-teal-600 text-white rounded-full shadow-lg shadow-teal-600/30 flex items-center justify-center hover:bg-teal-700 active:scale-95 transition-all z-20">
          <ScanLine className="w-6 h-6" />
        </button>
      </Link>
    </div>
  );
}
