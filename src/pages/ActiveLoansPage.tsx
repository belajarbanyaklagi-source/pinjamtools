import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  ChevronLeft,
  Wrench,
  AlertTriangle,
  Clock,
  Eye,
  CheckCircle2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabaseService } from '@/services/supabaseService'
import type { Borrow } from '@/lib/types'
import { format, differenceInDays } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ActiveLoansPage() {
  const navigate = useNavigate()
  const [borrows, setBorrows] = useState<Borrow[]>([])
  const [search, setSearch] = useState('')
  const [inspectPhoto, setInspectPhoto] = useState<string | null>(null)

  const loadBorrows = async () => {
    const data = await supabaseService.getBorrows()
    setBorrows(data)
  }

  useEffect(() => {
    loadBorrows()
    const unsubscribe = supabaseService.subscribeToBorrows(() => {
      loadBorrows()
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const calculateFine = (dueDate: string) => {
    const diff = differenceInDays(new Date(), new Date(dueDate))
    return diff > 0 ? diff * 5000 : 0
  }

  const handleReturn = async (borrow: Borrow) => {
    if (confirm(`Kembalikan alat "${borrow.tool.name}" ke gudang?`)) {
      await supabaseService.returnTool(borrow.id)
      toast.success(`Alat ${borrow.tool.name} berhasil dikembalikan!`)
      loadBorrows()
    }
  }

  const filteredBorrows = borrows.filter(
    (b) =>
      b.status !== 'returned' &&
      b.status !== 'rejected' &&
      (b.tool.name.toLowerCase().includes(search.toLowerCase()) ||
        b.tool.code.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Peminjaman Aktif</h1>
            <p className="text-xs text-gray-500">Status verifikasi & alat yang sedang dipinjam</p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari alat yang sedang dipinjam..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 py-2.5 pl-9 pr-4 rounded-xl text-xs text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-gray-200"
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filteredBorrows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
              <Wrench className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Tidak Ada Peminjaman Aktif</h3>
            <p className="text-xs text-gray-500 max-w-xs mb-4">
              Anda sedang tidak memegang pinjaman alat apapun saat ini.
            </p>
            <Button
              onClick={() => navigate('/katalog')}
              className="bg-teal-600 text-white rounded-xl text-xs py-2 px-4 font-bold"
            >
              Buka Katalog Alat
            </Button>
          </div>
        ) : (
          filteredBorrows.map((borrow, idx) => {
            const fine = calculateFine(borrow.dueDate)
            const isOverdue = borrow.status === 'overdue'
            const isPending = borrow.status === 'pending_approval'

            return (
              <motion.div
                key={borrow.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
                  isPending
                    ? 'border-2 border-amber-300'
                    : isOverdue
                    ? 'border-2 border-red-300'
                    : 'border-gray-100'
                }`}
              >
                {/* Pending Verification Banner */}
                {isPending && (
                  <div className="bg-amber-50 px-3.5 py-2 flex items-center justify-between border-b border-amber-200 text-amber-800 text-xs">
                    <span className="flex items-center gap-1.5 font-bold animate-pulse">
                      <Clock className="w-4 h-4" />
                      Menunggu Serah Terima Admin
                    </span>
                    <span className="font-mono bg-amber-200/80 px-2 py-0.5 rounded font-bold text-[10px]">
                      {borrow.borrowCode}
                    </span>
                  </div>
                )}

                {/* Overdue Banner */}
                {isOverdue && (
                  <div className="bg-red-50 px-3.5 py-2 flex items-center gap-2 border-b border-red-200 text-red-700 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    Terlambat Pengembalian!
                  </div>
                )}

                <div className="p-4 flex gap-3.5">
                  {/* Photo proof or Tool icon */}
                  {borrow.proofPhotoUrl ? (
                    <button
                      onClick={() => setInspectPhoto(borrow.proofPhotoUrl!)}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-teal-200 shrink-0 group shadow-sm"
                      title="Klik untuk melihat foto serah terima"
                    >
                      <img
                        src={borrow.proofPhotoUrl}
                        alt="Bukti Serah Terima"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Eye className="w-4 h-4" />
                      </div>
                      <span className="absolute bottom-0 inset-x-0 bg-teal-800/80 text-[8px] text-white text-center py-0.5 font-bold">
                        Foto Bukti
                      </span>
                    </button>
                  ) : (
                    <div className="w-20 h-20 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center shrink-0 border border-teal-100">
                      <Wrench className="w-10 h-10 opacity-70" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{borrow.tool.name}</h3>
                      <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-semibold shrink-0">
                        {borrow.tool.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-2">
                      {borrow.tool.brand} • {borrow.tool.location}
                    </p>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-gray-500 text-[11px]">
                        <span>Tgl Pinjam:</span>
                        <span className="font-semibold text-gray-800">
                          {format(new Date(borrow.borrowDate), 'dd MMM yyyy', { locale: idLocale })}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-500 text-[11px]">
                        <span>Tenggat Kembali:</span>
                        <span className={`font-bold ${isOverdue ? 'text-red-600' : 'text-teal-700'}`}>
                          {format(new Date(borrow.dueDate), 'dd MMM yyyy', { locale: idLocale })}
                        </span>
                      </div>
                      {fine > 0 && (
                        <div className="flex justify-between text-red-600 font-bold text-[11px]">
                          <span>Denda:</span>
                          <span>Rp {fine.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="border-t border-gray-100 p-3 bg-gray-50/70 flex justify-between items-center">
                  <span className="text-[11px] text-gray-500">
                    {borrow.approvedBy ? (
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Diverifikasi: {borrow.approvedBy}
                      </span>
                    ) : (
                      'Belum diverifikasi admin'
                    )}
                  </span>
                  {!isPending && (
                    <Button
                      onClick={() => handleReturn(borrow)}
                      className="text-xs bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-1.5 px-3 font-bold shadow-sm"
                    >
                      Kembalikan Alat
                    </Button>
                  )}
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Modal View Photo */}
      {inspectPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="max-w-sm w-full bg-gray-900 rounded-2xl overflow-hidden p-2 text-center">
            <p className="text-white text-xs font-bold py-2">Bukti Fisik Serah Terima Alat</p>
            <img src={inspectPhoto} alt="Bukti Serah Terima" className="w-full rounded-xl" />
            <Button
              onClick={() => setInspectPhoto(null)}
              className="w-full mt-3 bg-white text-black hover:bg-gray-100 font-bold rounded-xl text-xs py-2.5"
            >
              Tutup
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
