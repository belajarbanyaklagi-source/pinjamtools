import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-xl shadow-lg border border-teal-100 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center text-white shrink-0">
              <span className="font-bold text-lg">P</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">Install PinjamKu</h4>
              <p className="text-xs text-gray-500 mt-1">Tambahkan aplikasi ke layar utama untuk akses lebih cepat.</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="flex-1 flex items-center justify-center gap-1 bg-teal-600 text-white text-xs font-medium py-2 rounded-lg"
                >
                  <Download className="w-3.5 h-3.5" /> Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
