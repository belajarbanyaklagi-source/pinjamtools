import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center text-teal-600 mb-6">
          <BookX size={48} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-8 max-w-[280px]">
          Maaf, halaman yang Anda cari mungkin telah dihapus, dipindahkan, atau tidak pernah ada.
        </p>
        
        <Button 
          onClick={() => navigate('/')}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 py-6 shadow-lg shadow-teal-600/20 font-semibold"
        >
          Kembali ke Beranda
        </Button>
      </motion.div>
    </div>
  );
}
