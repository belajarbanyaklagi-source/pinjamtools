import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';

interface ManualInputProps {
  onSubmit: (code: string) => void;
}

export default function ManualInput({ onSubmit }: ManualInputProps) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onSubmit(code.trim());
      setCode('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-2">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
          <Keyboard size={18} />
        </div>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Contoh: KI-012"
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
        />
      </div>
      <Button 
        type="submit" 
        disabled={!code.trim()}
        className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-6 h-auto"
      >
        Cari Alat
      </Button>
    </form>
  );
}
