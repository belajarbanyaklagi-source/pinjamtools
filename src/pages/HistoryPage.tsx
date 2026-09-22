import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockUser, mockActivities } from '@/lib/mock-data';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function HistoryPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Riwayat Aktivitas</h1>
            <p className="text-xs text-gray-500">Jejak peminjaman alat kerja Anda</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="relative border-l-2 border-gray-200 ml-4 space-y-6 pb-4 mt-2">
          {mockActivities.map((activity, idx) => {
            const isBorrow = activity.status === 'sedang_dipinjam';
            return (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-6"
              >
                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${isBorrow ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${isBorrow ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {isBorrow ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <span className="font-semibold text-sm text-gray-900">
                        {isBorrow ? 'Peminjaman Alat' : 'Pengembalian Alat'}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(activity.date), 'dd MMM yyyy', { locale: id })}
                    </span>
                  </div>
                  
                  <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.toolName}</p>
                    <p className="text-xs text-gray-500 truncate">{activity.toolBrand}</p>
                  </div>
                  
                  {!isBorrow && (
                    <div className="mt-3 text-xs text-gray-600 bg-emerald-50 px-3 py-2 rounded-md border border-emerald-100 inline-block">
                      Tepat waktu • Tidak ada denda
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
