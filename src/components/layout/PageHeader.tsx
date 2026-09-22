import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, rightAction, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between py-4", className)}>
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {rightAction && (
        <div>
          {rightAction}
        </div>
      )}
    </div>
  );
}
