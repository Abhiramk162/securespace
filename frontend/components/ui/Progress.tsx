'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'emerald' | 'cyan' | 'critical' | 'high' | 'medium' | 'low';
  showLabel?: boolean;
  animated?: boolean;
  label?: string;
}

export default function Progress({
  value,
  max = 100,
  size = 'md',
  color = 'emerald',
  showLabel = false,
  animated = false,
  label,
  className,
  ...props
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const colors = {
    emerald: 'bg-emerald',
    cyan: 'bg-cyan',
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-[#9BA9B7]">{label}</span>}
          {showLabel && <span className="text-xs font-mono text-[#F4F7FA]">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-navy-700 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            colors[color],
            animated && 'relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shine'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
