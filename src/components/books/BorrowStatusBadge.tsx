import React from 'react';
import { cn, getBorrowStatusInfo } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BorrowStatusBadgeProps {
  dueDate: string;
  className?: string;
}

export default function BorrowStatusBadge({ dueDate, className }: BorrowStatusBadgeProps) {
  const { variant, daysText } = getBorrowStatusInfo(dueDate);
  
  const variantStyles = {
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
  };

  return (
    <motion.span 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {daysText}
    </motion.span>
  );
}
