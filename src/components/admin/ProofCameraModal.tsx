import React, { useRef, useState, useEffect } from 'react'
import { Camera, X, Check, RotateCcw, AlertCircle, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProofCameraModalProps {
  isOpen: boolean
  borrowerName: string
  toolName: string
  onCapture: (photoBase64: string) => void
  onClose: () => void
}

export default function ProofCameraModal({
  isOpen,
  borrowerName,
  toolName,
  onCapture,
  onClose,
}: ProofCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startCamera = async () => {
    try {
      setError(null)
      setCapturedPhoto(null)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser HTTP membatasi video stream langsung. Gunakan kamera HP.')
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
    } catch (err: any) {
      console.warn('Live stream camera not available:', err)
      setError('Kamera live stream memerlukan HTTPS. Anda tetap bisa gunakan tombol kamera native HP di bawah.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      fileInputRef.current?.click()
      return
    }
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedPhoto(photoDataUrl)
      stopCamera()
    }
  }

  // Native phone camera input handler (works on ANY HTTP / HTTPS)
  const handleNativeFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setCapturedPhoto(result)
        stopCamera()
      }
      reader.readAsDataURL(file)
    }
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    startCamera()
  }

  const confirmPhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto)
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-between p-4 safe-area-pt safe-area-pb">
      {/* Hidden Native File Input (Direct Camera Trigger for Android/iPhone) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleNativeFileCapture}
      />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between text-white py-2">
        <div>
          <h2 className="text-base font-bold">Bukti Foto Serah Terima</h2>
          <p className="text-xs text-gray-300">
            {borrowerName} • <span className="text-teal-400">{toolName}</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Viewfinder / Preview Box */}
      <div className="relative w-full max-w-sm aspect-[3/4] bg-gray-950 rounded-2xl overflow-hidden border-2 border-teal-500/50 shadow-2xl flex items-center justify-center my-auto">
        {capturedPhoto ? (
          <img src={capturedPhoto} alt="Pratinjau Bukti" className="w-full h-full object-cover" />
        ) : stream ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-6 top-8 bottom-8 border-2 border-dashed border-teal-400/70 rounded-xl pointer-events-none flex flex-col justify-between p-3">
              <span className="text-[11px] bg-black/60 text-teal-300 px-2.5 py-1 rounded-md self-center font-medium backdrop-blur-sm">
                Posisikan Peminjam & Alat di Dalam Bingkai
              </span>
              <span className="text-[10px] text-white/70 text-center bg-black/40 py-1 rounded">
                Bukti fisik serah terima alat
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mb-3">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold mb-1">Ambil Foto dengan Kamera HP</p>
            <p className="text-xs text-gray-400 mb-5">
              Klik tombol di bawah untuk membuka aplikasi kamera HP dan memotret bukti serah terima.
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs py-3 px-6 shadow-lg shadow-teal-600/30"
            >
              <Camera className="w-4 h-4 mr-2" />
              Buka Kamera HP Sekarang
            </Button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Bottom Action Controls */}
      <div className="w-full max-w-sm py-4 flex items-center justify-around">
        {capturedPhoto ? (
          <>
            <Button
              variant="outline"
              onClick={retakePhoto}
              className="rounded-2xl border-white/20 text-white hover:bg-white/10 px-6 py-6"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Foto Ulang
            </Button>
            <Button
              onClick={confirmPhoto}
              className="rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-6 shadow-lg shadow-teal-600/30"
            >
              <Check className="w-5 h-5 mr-2" />
              Gunakan Foto
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => {
                if (stream) takePhoto()
                else fileInputRef.current?.click()
              }}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 active:scale-95 transition-all shadow-xl"
              title="Ambil Foto"
            >
              <div className="w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center text-white">
                <Camera className="w-7 h-7" />
              </div>
            </button>
            <span className="text-[11px] text-white/70">Tekan untuk Memotret</span>
          </div>
        )}
      </div>
    </div>
  )
}
