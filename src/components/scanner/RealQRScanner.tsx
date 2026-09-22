import React, { useEffect, useRef, useState } from 'react'
import { Camera, RefreshCw, Zap, ZapOff, AlertCircle, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RealQRScannerProps {
  onScan: (code: string) => void
  onError?: (err: Error) => void
}

export default function RealQRScanner({ onScan, onError }: RealQRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [isTorchOn, setIsTorchOn] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Start camera stream
  const startCamera = async () => {
    try {
      setErrorMessage(null)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Live stream browser memerlukan HTTPS. Gunakan kamera langsung di bawah.')
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setHasPermission(true)

      const track = stream.getVideoTracks()[0]
      if (track) {
        const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any
        if (capabilities.torch) {
          setTorchSupported(true)
        }
      }

      startDetection()
    } catch (err: any) {
      console.warn('Camera access issue:', err)
      setHasPermission(false)
      setErrorMessage(
        'Kamera live stream browser dibatasi karena berjalan di HTTP lokal. Anda bisa langsung gunakan tombol Kamera HP di bawah.'
      )
      if (onError) onError(err)
    }
  }

  // Scan from photo taken by native phone camera
  const handleNativeImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if ('BarcodeDetector' in window) {
      try {
        // @ts-ignore
        const detector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128'] })
        const img = new Image()
        img.src = URL.createObjectURL(file)
        await img.decode()
        const barcodes = await detector.detect(img)
        if (barcodes && barcodes.length > 0) {
          playScanBeep()
          onScan(barcodes[0].rawValue)
          return
        }
      } catch (err) {
        console.warn('Native photo barcode detection failed:', err)
      }
    }
    // Fallback: prompt code or assume match
    const code = prompt('Kamera HP aktif. Masukkan atau konfirmasi kode alat (misal: KI-012):')
    if (code) {
      playScanBeep()
      onScan(code.trim())
    }
  }

  const startDetection = () => {
    if (!('BarcodeDetector' in window)) return

    try {
      // @ts-ignore
      const barcodeDetector = new window.BarcodeDetector({
        formats: ['qr_code', 'code_128', 'ean_13'],
      })

      const detectFrame = async () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current)
            if (barcodes && barcodes.length > 0) {
              const codeValue = barcodes[0].rawValue
              if (codeValue) {
                playScanBeep()
                if (navigator.vibrate) navigator.vibrate(100)
                onScan(codeValue)
                return
              }
            }
          } catch (e) {
            // ignore
          }
        }
        animationFrameRef.current = requestAnimationFrame(detectFrame)
      }

      animationFrameRef.current = requestAnimationFrame(detectFrame)
    } catch (e) {
      console.warn('BarcodeDetector error:', e)
    }
  }

  const playScanBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch (e) {
      // AudioContext
    }
  }

  const toggleTorch = async () => {
    if (!streamRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    if (track && torchSupported) {
      try {
        await (track as any).applyConstraints({
          advanced: [{ torch: !isTorchOn }],
        })
        setIsTorchOn(!isTorchOn)
      } catch (err) {
        console.error('Torch error:', err)
      }
    }
  }

  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  useEffect(() => {
    startCamera()
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [facingMode])

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Native camera file trigger */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleNativeImageCapture}
      />

      {/* Video Preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Camera Controls Floating Bar */}
      {hasPermission && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          {torchSupported && (
            <button
              onClick={toggleTorch}
              className={`p-3 rounded-full backdrop-blur-md transition-colors ${
                isTorchOn ? 'bg-amber-400 text-black' : 'bg-black/50 text-white'
              }`}
              title="Senter"
            >
              {isTorchOn ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={flipCamera}
            className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
            title="Ganti Kamera"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* HTTP / No Direct Stream State */}
      {hasPermission === false && (
        <div className="relative z-30 max-w-xs mx-4 bg-gray-900/95 border border-teal-500/40 p-6 rounded-3xl text-center text-white backdrop-blur-md shadow-2xl space-y-4">
          <div className="w-14 h-14 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto">
            <Camera className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-base mb-1">Scan Menggunakan Kamera HP</h3>
            <p className="text-xs text-gray-300">
              Buka aplikasi kamera bawaan HP untuk memindai label QR Code alat kerja secara langsung.
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs py-3.5 shadow-lg shadow-teal-600/30"
          >
            <Camera className="w-4 h-4 mr-2" />
            Buka Kamera HP Sekarang
          </Button>
        </div>
      )}
    </div>
  )
}
