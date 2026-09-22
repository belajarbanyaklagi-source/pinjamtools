import { Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolCoverProps {
  imageUrl?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24'
};

const iconSizes = {
  sm: 20,
  md: 24,
  lg: 32
};

export default function ToolCover({ imageUrl, name, size = 'md', className }: ToolCoverProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn("object-cover rounded-xl bg-gray-100", sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shrink-0",
        sizeClasses[size],
        className
      )}
    >
      <div className="flex flex-col items-center justify-center opacity-80">
        <Wrench size={iconSizes[size]} />
      </div>
    </div>
  );
}
