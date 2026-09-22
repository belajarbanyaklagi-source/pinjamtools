import { Borrow } from '@/lib/types';
import { Button } from '@/components/ui/button';
import BorrowStatusBadge from '@/components/books/BorrowStatusBadge';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import ToolCover from './ToolCover';

interface ToolCardProps {
  borrow: Borrow;
  onExtend?: () => void;
  onReturn?: () => void;
}

export default function ToolCard({ borrow, onExtend, onReturn }: ToolCardProps) {
  const isOverdue = borrow.status === 'overdue';
  const tool = borrow.tool;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-xl shadow-sm border p-4 flex flex-col gap-4",
        isOverdue ? "border-l-4 border-l-red-500 border-y-red-100 border-r-red-100" : "border-gray-100"
      )}
    >
      <div className="flex gap-4">
        <ToolCover imageUrl={tool.imageUrl} name={tool.name} size="lg" />
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
              {tool.code}
            </span>
            <BorrowStatusBadge dueDate={borrow.dueDate} />
          </div>
          <h3 className="font-semibold text-gray-900 truncate">{tool.name}</h3>
          <p className="text-sm text-gray-500 truncate">{tool.brand}</p>
          
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-400">Tgl Pinjam</p>
              <p className="font-medium text-gray-700">
                {format(new Date(borrow.borrowDate), 'dd MMM yyyy', { locale: idLocale })}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Batas Kembali</p>
              <p className={cn("font-medium", isOverdue ? "text-red-600" : "text-gray-700")}>
                {format(new Date(borrow.dueDate), 'dd MMM yyyy', { locale: idLocale })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {(onExtend || onReturn) && (
        <div className="flex gap-2 mt-2 pt-4 border-t border-gray-100">
          {onExtend && (
            <Button
              variant="outline"
              className="flex-1 rounded-2xl border-teal-600 text-teal-600 hover:bg-teal-50"
              onClick={onExtend}
              disabled={isOverdue || borrow.status === 'returned'}
            >
              Perpanjang
            </Button>
          )}
          {onReturn && (
            <Button
              className="flex-1 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white"
              onClick={onReturn}
              disabled={borrow.status === 'returned'}
            >
              Kembalikan
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
