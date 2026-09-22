import React from 'react';
import { Bell, Globe, HelpCircle, LogOut, ChevronRight } from 'lucide-react';

interface SettingsMenuProps {
  onLogout: () => void;
}

export default function SettingsMenu({ onLogout }: SettingsMenuProps) {
  return (
    <div className="mt-8">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">PENGATURAN</h3>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
              <Bell className="w-5 h-5" />
            </div>
            <span className="font-medium text-gray-700">Notifikasi</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
              <Globe className="w-5 h-5" />
            </div>
            <span className="font-medium text-gray-700">Bahasa</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="font-medium text-gray-700">Bantuan & FAQ</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg text-red-500">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-medium text-red-500">Keluar Akun</span>
          </div>
        </button>
      </div>
    </div>
  );
}
