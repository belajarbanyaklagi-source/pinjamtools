import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Wrench,
  CheckCircle2,
  Clock,
  Keyboard,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { mockTools, mockUser } from '@/lib/mock-data'
import type { Tool, Borrow } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import RealQRScanner from '@/components/scanner/RealQRScanner'
import { supabaseService } from '@/services/supabaseService'

export default function ScanPage() {
  const navigate = useNavigate()
  const [scannedTool, setScannedTool] = useState<Tool | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [isManualInput, setIsManualInput] = useState(false)
  const [toolsList, setToolsList] = useState<Tool[]>(mockTools)

  // Checkout flow state: 'idle' | 'pending_approval' | 'approved'
  const [borrowState, setBorrowState] = useState<'idle' | 'pending_approval' | 'approved'>('idle')
  const [activeBorrow, setActiveBorrow] = useState<Borrow | null>(null)

  useEffect(() => {
    // Load fresh tools from Supabase / cache
    supabaseService.getTools().then(setToolsList)
  }, [])

  // Listen for realtime status change when in pending_approval state
  useEffect(() => {
    if (borrowState !== 'pending_approval' || !activeBorrow) return

    const unsubscribe = supabaseService.subscribeToBorrows((payload) => {
      if (payload.new && payload.new.id === activeBorrow.id) {
        if (payload.new.status === 'active') {
          setActiveBorrow((prev) => (prev ? { ...prev, status: 'active', proofPhotoUrl: payload.new.proof_photo_url } : null))
          setBorrowState('approved')
          toast.success('Peminjaman telah diverifikasi dan disetujui Admin!')
        } else if (payload.new.status === 'rejected') {
          toast.error('Pengajuan peminjaman ditolak oleh Admin.')
          setBorrowState('idle')
          setScannedTool(null)
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [borrowState, activeBorrow])

  const handleQRDetected = (code: string) => {
    // Look up by qrCode, code, or ID
    const cleanCode = code.trim().toLowerCase()
    const found = toolsList.find(
      (t) =>
        t.qrCode.toLowerCase() === cleanCode ||
        t.code.toLowerCase() === cleanCode ||
        cleanCode.includes(t.code.toLowerCase())
    )

    if (found) {
      setScannedTool(found)
      toast.success(`Alat terdeteksi: ${found.name}`)
    } else {
      toast.error(`Kode QR "${code}" tidak cocok dengan alat manapun di database.`)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCode) return
    const clean = manualCode.trim().toLowerCase()
    const found = toolsList.find((t) => t.code.toLowerCase() === clean || t.name.toLowerCase().includes(clean))
    if (found) {
      setScannedTool(found)
      setIsManualInput(false)
      toast.success(`Alat ditemukan: ${found.name}`)
    } else {
      toast.error('Alat tidak ditemukan. Cek kembali kode unik (misal: KI-012)')
    }
  }

  // Peminjam submits checkout -> enters pending_approval
  const handleCheckoutRequest = async () => {
    if (!scannedTool) return

    toast.loading('Mengirim permohonan ke Admin...', { id: 'request' })
    const borrowRecord = await supabaseService.createBorrowRequest(scannedTool, mockUser)
    setActiveBorrow(borrowRecord)
    setBorrowState('pending_approval')
    toast.success('Permintaan terkirim! Silakan tunjukkan alat ke Petugas/Admin.', { id: 'request' })
  }

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Header Bar */}
      <div className="absolute top-0 inset-x-0 z-30 p-4 pt-12 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 text-white rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white font-bold text-base tracking-wide">
          {borrowState === 'pending_approval'
            ? 'Menunggu Serah Terima'
            : borrowState === 'approved'
            ? 'Peminjaman Berhasil'
            : 'Scan QR Alat Kerja'}
        </h1>
        <button
          onClick={() => setIsManualInput(!isManualInput)}
          className="p-2.5 text-white rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors"
          title="Input Kode Manual"
        >
          <Keyboard className="w-5 h-5" />
        </button>
      </div>

      {/* Main Scanner Viewport (Active when idle) */}
      {borrowState === 'idle' && (
        <div className="flex-1 relative flex items-center justify-center">
          {/* Live Video Camera Stream */}
          <RealQRScanner onScan={handleQRDetected} />

          {/* Scanner Targeting Frame Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 border-2 border-teal-500/30 rounded-3xl">
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-teal-400 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-teal-400 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-teal-400 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-teal-400 rounded-br-2xl" />

              {/* Animated Laser Scanning Line */}
              <motion.div
                className="w-full h-0.5 bg-teal-400 shadow-[0_0_12px_3px_rgba(45,212,191,0.8)]"
                animate={{ y: [0, 250, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <p className="text-white/80 text-xs font-medium mt-6 bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-sm">
              Arahkan kamera ke stiker QR Code pada alat kerja
            </p>
          </div>
        </div>
      )}

      {/* State 2: Waiting for Admin Approval */}
      {borrowState === 'pending_approval' && activeBorrow && (
        <div className="flex-1 bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 animate-pulse">
              <Clock className="w-12 h-12" />
            </div>
            <div className="absolute -inset-4 rounded-full border border-amber-400/30 animate-ping" />
          </div>

          <span className="bg-amber-500/20 text-amber-300 font-bold px-3 py-1 rounded-full text-xs mb-3">
            KODE VERIFIKASI: {activeBorrow.borrowCode}
          </span>
          <h2 className="text-xl font-bold mb-2">Menunggu Konfirmasi Petugas</h2>
          <p className="text-xs text-gray-400 max-w-xs mb-6">
            Serahkan alat <strong>{activeBorrow.tool.name}</strong> ke Petugas Gudang / Admin untuk verifikasi fisik dan pengambilan foto serah terima.
          </p>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 w-full max-w-xs text-left mb-6 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Peminjam:</span>
              <span className="font-bold text-white">{activeBorrow.userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Alat:</span>
              <span className="font-bold text-teal-400">{activeBorrow.tool.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Kode Alat:</span>
              <span className="font-mono text-gray-300">{activeBorrow.tool.code}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-teal-400 animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>Layar ini akan otomatis update setelah disetujui Admin</span>
          </div>
        </div>
      )}

      {/* State 3: Approved Success Screen with Proof Photo */}
      {borrowState === 'approved' && activeBorrow && (
        <div className="flex-1 bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold mb-1">Peminjaman Berhasil!</h2>
          <p className="text-xs text-gray-400 mb-6">Alat kerja resmi diserahterimakan kepada Anda.</p>

          {/* Proof Photo Thumbnail */}
          {activeBorrow.proofPhotoUrl && (
            <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-teal-500 mb-4 shadow-2xl relative">
              <img
                src={activeBorrow.proofPhotoUrl}
                alt="Foto Serah Terima"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 inset-x-2 bg-black/70 text-[10px] text-white py-1 rounded backdrop-blur-sm">
                Foto Bukti Serah Terima
              </span>
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 w-full max-w-xs text-left mb-6 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-400">Alat:</span>
              <span className="font-bold text-white">{activeBorrow.tool.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Jatuh Tempo:</span>
              <span className="font-bold text-amber-400">{activeBorrow.dueDate}</span>
            </div>
          </div>

          <Button
            onClick={() => navigate('/aktif')}
            className="w-full max-w-xs bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl py-6 text-sm"
          >
            Lihat di Peminjaman Aktif
          </Button>
        </div>
      )}

      {/* Manual Code Input Modal */}
      {isManualInput && (
        <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Input Kode Alat Manual</h3>
            <p className="text-xs text-gray-500">
              Ketikkan kode alat yang tertera pada badan alat (misal: KI-012, KP-1011):
            </p>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <input
                type="text"
                autoFocus
                placeholder="Contoh: KI-012"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full border-2 border-teal-500 rounded-xl py-2.5 px-3 text-center text-sm font-bold tracking-widest uppercase focus:outline-none"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsManualInput(false)}
                  className="flex-1 rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button type="submit" className="flex-1 bg-teal-600 text-white rounded-xl text-xs font-bold">
                  Cari Alat
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scanned Tool Confirmation Drawer */}
      <AnimatePresence>
        {scannedTool && borrowState === 'idle' && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 inset-x-0 bg-white rounded-t-3xl shadow-2xl z-40 p-6 space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto" />

            <div className="flex gap-4 items-start">
              <div className="w-20 h-20 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center shrink-0 border border-teal-100">
                <Wrench className="w-10 h-10" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {scannedTool.code}
                  </span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                    Stok: {scannedTool.availableStock}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base leading-snug">{scannedTool.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{scannedTool.brand} • {scannedTool.location}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1 text-gray-600">
              <p><strong>Spesifikasi:</strong> {scannedTool.specification || scannedTool.description}</p>
              <p><strong>Kondisi:</strong> {scannedTool.condition}</p>
              <p className="text-teal-700 font-semibold pt-1">
                ⚡ Memerlukan verifikasi & foto serah terima dari Admin saat checkout.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setScannedTool(null)}
                className="flex-1 rounded-2xl text-xs py-3 text-gray-600"
              >
                Scan Lain
              </Button>
              <Button
                onClick={handleCheckoutRequest}
                className="flex-[2] rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 shadow-lg shadow-teal-600/30"
              >
                Ajukan Pinjam Sekarang
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
