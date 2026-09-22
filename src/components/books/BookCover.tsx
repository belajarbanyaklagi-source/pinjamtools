import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BookCoverProps {
  coverUrl: string;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BookCover({ coverUrl, title, size = 'md', className }: BookCoverProps) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-16',
    md: 'w-16 h-22', // roughly 64x88
    lg: 'w-24 h-32', // 96x128
  };

  return (
    <div className={cn("relative overflow-hidden rounded-md shadow-sm shrink-0", sizeClasses[size], className)}>
      {!error && coverUrl ? (
        <img 
          src={coverUrl} 
          alt={title} 
          onError={() => setError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 flex flex-col items-center justify-center text-white p-1">
          <BookOpen className={size === 'sm' ? 'w-4 h-4 mb-1' : size === 'lg' ? 'w-8 h-8 mb-2' : 'w-6 h-6 mb-1'} />
          <span className="font-bold text-center leading-none" style={{ fontSize: size === 'sm' ? '12px' : size === 'lg' ? '24px' : '16px' }}>
            {title.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
