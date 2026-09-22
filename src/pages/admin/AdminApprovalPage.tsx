import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Clock,
  Camera,
  XCircle,
  AlertCircle,
  Wrench,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabaseService } from '@/services/supabaseService'
import type { Borrow } from '@/lib/types'
import { toast } from 'sonner'
import ProofCameraModal from '@/components/admin/ProofCameraModal'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export default function AdminApprovalPage() {
  const [borrows, setBorrows] = useState<Borrow[]>([])
  const [selectedBorrowForPhoto, setSelectedBorrowForPhoto] = useState<Borrow | null>(null)
  const [inspectPhotoUrl, setInspectPhotoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadBorrows = async () => {
    setIsLoading(true)
    const data = await supabaseService.getBorrows()
    setBorrows(data)
    setIsLoading(false)
  }

  useEffect(() => {
    loadBorrows()

    // Subscribe to realtime changes on borrows
    const unsubscribe = supabaseService.subscribeToBorrows((payload) => {
      console.log('Realtime borrow update:', payload)
      loadBorrows()
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const pendingBorrows = borrows.filter((b) => b.status === 'pending_approval')
  const activeApprovedBorrows = borrows.filter((b) => b.status === 'active')

  const handleCaptureComplete = async (photoBase64: string) => {
    if (!selectedBorrowForPhoto) return
    const borrow = selectedBorrowForPhoto

    toast.loading('Menyimpan bukti foto & mengaktifkan pinjaman...', { id: 'approval' })
    const res = await supabaseService.approveBorrowWithPhoto(
      borrow.id,
      photoBase64,
      'Admin Workshop'
    )

    if (res.success) {
      toast.success(`Peminjaman ${borrow.tool.name} oleh ${borrow.userName || 'Peminjam'} berhasil disetujui!`, {
        id: 'approval',
      })
      // Update local state immediately
      setBorrows((prev) =>
        prev.map((b) =>
          b.id === borrow.id
            ? {
                ...b,
                status: 'active',
                proofPhotoUrl: res.photoUrl,
                approvedBy: 'Admin Workshop',
              }
            : b
        )
      )
    } else {
      toast.error('Gagal menyetujui peminjaman.', { id: 'approval' })
    }
    setSelectedBorrowForPhoto(null)
  }

  const handleReject = async (borrow: Borrow) => {
    if (confirm(`Tolak pengajuan peminjaman alat ${borrow.tool.name} untuk ${borrow.userName}?`)) {
      await supabaseService.rejectBorrow(borrow.id, 'Stok sedang tidak siap pakai')
      toast.info('Pengajuan peminjaman telah ditolak.')
      loadBorrows()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Mode Admin / Pemilik Alat
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verifikasi Peminjaman</h1>
          <p className="text-xs text-gray-500">Konfirmasi serah terima fisik & ambil foto peminjam</p>
        </div>
      </div>

      {/* Pending Approval Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Menunggu Verifikasi ({pendingBorrows.length})
          </h2>
          {pendingBorrows.length > 0 && (
            <span className="animate-pulse flex h-2 w-2 rounded-full bg-amber-500" />
          )}
        </div>

        {pendingBorrows.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center shadow-sm">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <p className="font-semibold text-gray-700 text-sm">Tidak Ada Pengajuan Menunggu</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Saat ada peminjam yang checkout di HP-nya, permintaan akan muncul otomatis di sini secara realtime.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingBorrows.map((borrow) => (
              <motion.div
                key={borrow.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-amber-200 rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        KODE: {borrow.borrowCode}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {format(new Date(borrow.createdAt), 'HH:mm', { locale: idLocale })} WIB
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">{borrow.userName || 'Peminjam'}</h3>
                    <p className="text-xs text-teal-600 font-medium">{borrow.userEmail || 'Anggota Workshop'}</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center shrink-0 border border-teal-100 font-bold">
                    <Wrench className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Alat Diminta</span>
                    <span className="font-bold text-gray-800">{borrow.tool.name}</span>
                    <span className="text-gray-500 ml-1.5">({borrow.tool.code})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block text-[10px]">Lokasi</span>
                    <span className="font-semibold text-gray-700">{borrow.tool.location}</span>
                  </div>
                </div>

                {borrow.notes && (
                  <p className="text-xs text-gray-500 italic bg-amber-50/50 p-2 rounded-lg">
                    "{borrow.notes}"
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => handleReject(borrow)}
                    className="flex-1 rounded-xl text-red-600 border-red-200 hover:bg-red-50 text-xs py-2"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Tolak
                  </Button>
                  <Button
                    onClick={() => setSelectedBorrowForPhoto(borrow)}
                    className="flex-[2] rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 shadow-md shadow-teal-600/20"
                  >
                    <Camera className="w-4 h-4 mr-1.5" />
                    Foto Bukti & Setujui
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Active Loans with Proof Photos Section */}
      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          Peminjaman Aktif & Bukti Serah Terima ({activeApprovedBorrows.length})
        </h2>

        {activeApprovedBorrows.length === 0 ? (
          <p className="text-xs text-gray-400 bg-white p-4 rounded-xl text-center">
            Belum ada peminjaman aktif yang telah diverifikasi.
          </p>
        ) : (
          <div className="space-y-2.5">
            {activeApprovedBorrows.map((borrow) => (
              <div
                key={borrow.id}
                className="bg-white border border-gray-100 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm hover:border-teal-200 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {borrow.proofPhotoUrl ? (
                    <button
                      onClick={() => setInspectPhotoUrl(borrow.proofPhotoUrl!)}
                      className="relative group w-12 h-12 rounded-lg overflow-hidden border border-teal-200 shrink-0"
                    >
                      <img
                        src={borrow.proofPhotoUrl}
                        alt="Bukti"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Eye className="w-4 h-4" />
                      </div>
                    </button>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                      <Wrench className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">
                      {borrow.tool.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Dipinjam: <span className="font-semibold text-gray-800">{borrow.userName}</span>
                    </p>
                    <p className="text-[10px] text-teal-600 font-medium">
                      Tenggat: {format(new Date(borrow.dueDate), 'dd MMM yyyy', { locale: idLocale })}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700">
                    Aktif
                  </span>
                  {borrow.proofPhotoUrl && (
                    <button
                      onClick={() => setInspectPhotoUrl(borrow.proofPhotoUrl!)}
                      className="block text-[10px] text-teal-600 font-bold hover:underline mt-1"
                    >
                      Lihat Foto
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Camera for Snapshot */}
      {selectedBorrowForPhoto && (
        <ProofCameraModal
          isOpen={!!selectedBorrowForPhoto}
          borrowerName={selectedBorrowForPhoto.userName || 'Peminjam'}
          toolName={selectedBorrowForPhoto.tool.name}
          onCapture={handleCaptureComplete}
          onClose={() => setSelectedBorrowForPhoto(null)}
        />
      )}

      {/* Modal Photo Inspector */}
      {inspectPhotoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 p-2">
            <img src={inspectPhotoUrl} alt="Bukti Serah Terima" className="w-full rounded-xl" />
            <Button
              onClick={() => setInspectPhotoUrl(null)}
              className="w-full mt-3 bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-xl"
            >
              Tutup
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
