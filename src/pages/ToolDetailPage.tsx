import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Heart,
  Share2,
  Star,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { mockTools, mockUser } from '@/lib/mock-data'
import { supabaseService } from '@/services/supabaseService'
import type { Tool, Borrow } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ToolDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tool, setTool] = useState<Tool | null>(null)
  const [borrowState, setBorrowState] = useState<'idle' | 'pending' | 'approved'>('idle')
  const [activeBorrow, setActiveBorrow] = useState<Borrow | null>(null)

  useEffect(() => {
    supabaseService.getTools().then((list) => {
      const found = list.find((t) => t.id === id) || mockTools.find((t) => t.id === id) || null
      setTool(found)
    })
  }, [id])

  // Realtime subscription for approval
  useEffect(() => {
    if (borrowState !== 'pending' || !activeBorrow) return

    const unsubscribe = supabaseService.subscribeToBorrows((payload) => {
      if (payload.new && payload.new.id === activeBorrow.id) {
        if (payload.new.status === 'active') {
          setActiveBorrow((prev) => (prev ? { ...prev, status: 'active', proofPhotoUrl: payload.new.proof_photo_url } : null))
          setBorrowState('approved')
          toast.success('Peminjaman telah diverifikasi dan disetujui Admin!')
        } else if (payload.new.status === 'rejected') {
          toast.error('Pengajuan peminjaman ditolak oleh Admin.')
          setBorrowState('idle')
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [borrowState, activeBorrow])

  if (!tool) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Alat tidak ditemukan</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg">
          Kembali
        </button>
      </div>
    )
  }

  const isAvailable = tool.availableStock > 0
  const stockPercentage = (tool.availableStock / tool.totalStock) * 100

  const handleCheckout = async () => {
    toast.loading('Mengajukan peminjaman...', { id: 'borrow-req' })
    const borrow = await supabaseService.createBorrowRequest(tool, mockUser)
    setActiveBorrow(borrow)
    setBorrowState('pending')
    toast.success('Pengajuan terkirim! Silakan datangi Admin untuk serah terima.', { id: 'borrow-req' })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 p-4 pt-12 flex justify-between items-center z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white/80 backdrop-blur-sm text-gray-800 rounded-full shadow-sm hover:bg-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-2">
          <button className="p-2 bg-white/80 backdrop-blur-sm text-gray-800 rounded-full shadow-sm">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white/80 backdrop-blur-sm text-gray-800 rounded-full shadow-sm">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image Area */}
      <div className="h-[320px] bg-gradient-to-b from-teal-100 to-gray-50 relative flex items-center justify-center pt-8">
        <div className="w-44 h-44 bg-teal-600/10 text-teal-700 rounded-3xl flex items-center justify-center border border-teal-500/20 shadow-xl">
          <Wrench className="w-24 h-24 text-teal-600" />
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white -mt-6 rounded-t-3xl relative z-10 px-6 pt-8 pb-8 shadow-sm space-y-6">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md border border-teal-200">
                {tool.code}
              </span>
              <h1 className="text-xl font-bold text-gray-900 mt-1">{tool.name}</h1>
              <p className="text-xs text-gray-500">{tool.brand} • Lokasi: {tool.location}</p>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 text-amber-600 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{tool.rating}</span>
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Deskripsi</h3>
          <p className="text-xs text-gray-600 leading-relaxed">{tool.description}</p>
        </div>

        {/* Spesifikasi Detail */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Spesifikasi Detail</h3>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-500">Ukuran</span>
              <span className="font-semibold text-gray-800">{tool.size || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-500">Berat</span>
              <span className="font-semibold text-gray-800">{tool.weight || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-500">Kondisi</span>
              <span className="font-semibold text-teal-700 capitalize">{tool.condition}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-500">Detail Spek</span>
              <span className="font-medium text-gray-800 text-right max-w-[65%]">
                {tool.specification || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Stock Info */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-xs font-bold text-gray-700">Ketersediaan Stok</h3>
            <span className="text-xs font-semibold text-teal-700">
              {tool.availableStock} dari {tool.totalStock} tersedia
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full ${isAvailable ? 'bg-teal-500' : 'bg-red-500'}`}
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 pb-8 z-20">
        <Button
          disabled={!isAvailable}
          onClick={handleCheckout}
          className={`w-full py-6 rounded-2xl font-bold text-sm shadow-lg ${
            isAvailable
              ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/25'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
          }`}
        >
          {isAvailable ? 'Ajukan Pinjam Sekarang' : 'Stok Sedang Habis'}
        </Button>
      </div>

      {/* Modal Menunggu Approval */}
      {borrowState === 'pending' && activeBorrow && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                KODE: {activeBorrow.borrowCode}
              </span>
              <h3 className="font-bold text-gray-900 text-lg mt-2">Menunggu Serah Terima</h3>
              <p className="text-xs text-gray-500 mt-1">
                Tunjukkan kode ini ke Petugas Gudang / Admin untuk verifikasi fisik & pengambilan foto bukti peminjaman.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Alat:</span>
                <span className="font-bold text-teal-700">{tool.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Peminjam:</span>
                <span className="font-semibold text-gray-800">{mockUser.fullName}</span>
              </div>
            </div>

            <div className="text-[11px] text-teal-600 flex items-center justify-center gap-1.5 animate-pulse font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Menunggu persetujuan Admin secara realtime...</span>
            </div>

            <Button
              variant="outline"
              onClick={() => setBorrowState('idle')}
              className="w-full rounded-xl text-xs py-2 text-gray-500"
            >
              Tutup & Tunggu di Beranda
            </Button>
          </div>
        </div>
      )}

      {/* Modal Berhasil Disetujui */}
      {borrowState === 'approved' && activeBorrow && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Peminjaman Disetujui!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Admin telah memverifikasi serah terima alat kepada Anda.
              </p>
            </div>

            {activeBorrow.proofPhotoUrl && (
              <div className="w-40 h-40 rounded-2xl overflow-hidden mx-auto border-2 border-teal-500 shadow-md">
                <img
                  src={activeBorrow.proofPhotoUrl}
                  alt="Bukti Serah Terima"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <Button
              onClick={() => navigate('/aktif')}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs py-3"
            >
              Buka Halaman Peminjaman Aktif
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
