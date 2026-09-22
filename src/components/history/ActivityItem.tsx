import { ActivityItem as ActivityItemType } from '@/lib/types';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
  activity: ActivityItemType;
  isLast?: boolean;
}

export default function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const getIcon = () => {
    switch (activity.status) {
      case 'sedang_dipinjam':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'dikembalikan':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'terlambat_denda':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <RotateCcw className="w-4 h-4 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (activity.status) {
      case 'sedang_dipinjam': return 'bg-amber-100';
      case 'dikembalikan': return 'bg-emerald-100';
      case 'terlambat_denda': return 'bg-red-100';
      default: return 'bg-blue-100';
    }
  };

  const getActionText = () => {
    switch (activity.status) {
      case 'sedang_dipinjam': return 'Meminjam alat';
      case 'dikembalikan': return 'Mengembalikan alat';
      case 'terlambat_denda': return 'Terlambat mengembalikan';
      default: return 'Aktivitas lain';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative flex gap-4"
    >
      {!isLast && (
        <div className="absolute top-8 left-4 bottom-[-16px] w-px bg-gray-200" />
      )}
      
      <div className={cn("relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0", getBgColor())}>
        {getIcon()}
      </div>
      
      <div className="flex-1 pb-4">
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-900 mb-0.5">
            {getActionText()}
          </p>
          <div className="text-sm text-gray-600 font-medium line-clamp-1">
            {activity.toolName}
          </div>
          <div className="text-xs text-gray-500 mb-2 line-clamp-1">
            {activity.toolBrand}
          </div>
          
          <div className="text-[10px] text-gray-400 font-medium">
            {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: id })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
