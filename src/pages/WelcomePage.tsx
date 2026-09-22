import React from 'react';
import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-teal-50/50 rounded-b-[100%] blur-3xl -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center max-w-sm w-full"
      >
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="w-32 h-32 bg-teal-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-teal-600/20"
        >
          <Wrench className="w-16 h-16 text-white" strokeWidth={1.5} />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">PinjamKu</h1>
        <p className="text-teal-600 font-medium mb-4 text-center">Pinjam dan Kembalikan dengan Mudah</p>
        
        <p className="text-sm text-gray-500 text-center mb-12">
          Kelola peminjaman alat kerja secara praktis dan efisien dengan fitur scan QR, tracking, dan notifikasi otomatis.
        </p>

        <div className="w-full space-y-4">
          <Link to="/login" className="block w-full">
            <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-teal-600/20 transition-all active:scale-[0.98]">
              Mulai Sekarang
            </button>
          </Link>
          
          <div className="text-center">
            <span className="text-sm text-gray-500">Belum punya akun? </span>
            <Link to="/register" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
