import { Tool } from '@/lib/types';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import ToolCover from './ToolCover';

interface ToolGridCardProps {
  tool: Tool;
  onClick?: () => void;
}

export default function ToolGridCard({ tool, onClick }: ToolGridCardProps) {
  const isAvailable = tool.availableStock > 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <div className="aspect-square relative overflow-hidden bg-gray-50 flex items-center justify-center">
        <ToolCover imageUrl={tool.imageUrl} name={tool.name} size="lg" className="w-full h-full rounded-none" />
        <div className="absolute top-2 right-2">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {isAvailable ? `Tersedia ${tool.availableStock}` : 'Habis'}
          </span>
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <span className="text-[10px] font-medium text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
            {tool.category}
          </span>
          <div className="flex items-center text-[10px] font-medium text-amber-500">
            <Star size={10} className="fill-amber-500 mr-0.5" />
            {tool.rating}
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">
          {tool.name}
        </h3>
        <p className="text-xs text-gray-500 mt-auto">{tool.brand}</p>
      </div>
    </motion.div>
  );
}
