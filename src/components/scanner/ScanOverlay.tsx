import { ScanLine } from 'lucide-react';

export default function ScanOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
      <div className="relative w-64 h-64">
        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-500 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-500 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-500 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-500 rounded-br-xl" />
        
        {/* Scanning line animation */}
        <div className="absolute left-0 right-0 h-0.5 bg-teal-500 opacity-70 animate-[scan_2s_ease-in-out_infinite]" />
      </div>
      
      <div className="mt-8 bg-black/50 backdrop-blur-sm text-white px-6 py-3 rounded-full flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-1">
          <ScanLine size={18} className="text-teal-400" />
          <span className="font-medium text-sm">Arahkan kamera ke QR Code alat</span>
        </div>
        <span className="text-xs text-gray-300">Pastikan kode QR berada di dalam area bingkai</span>
      </div>
    </div>
  );
}
