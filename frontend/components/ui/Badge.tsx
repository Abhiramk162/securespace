'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import type { Severity } from '@/lib/types';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'emerald' | 'cyan' | 'critical' | 'high' | 'medium' | 'low' | 'info' | 'outline' | 'warning';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export default function Badge({ className, variant = 'default', size = 'sm', dot, children, ...props }: BadgeProps) {
  const base = 'inline-flex items-center gap-1.5 font-semibold rounded-full border';

  const variants = {
    default: 'bg-navy-700 border-[#2A3A48] text-[#9BA9B7]',
    emerald: 'bg-emerald/10 border-emerald/20 text-emerald',
    cyan: 'bg-cyan/10 border-cyan/20 text-cyan',
    critical: 'bg-red-500/10 border-red-500/20 text-red-400',
    high: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    medium: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    low: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    info: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
    outline: 'bg-transparent border-[#2A3A48] text-[#9BA9B7]',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const dotColors: Record<string, string> = {
    default: 'bg-[#9BA9B7]',
    emerald: 'bg-emerald',
    cyan: 'bg-cyan',
    critical: 'bg-red-400',
    high: 'bg-orange-400',
    medium: 'bg-yellow-400',
    low: 'bg-blue-400',
    info: 'bg-gray-400',
    outline: 'bg-[#9BA9B7]',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}

// Convenience component for severity badges
export function SeverityBadge({ severity, ...props }: { severity: Severity } & Omit<BadgeProps, 'variant'>) {
  const variantMap: Record<Severity, BadgeProps['variant']> = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    UNKNOWN: 'info',
  };
  return <Badge variant={variantMap[severity]} dot {...props}>{severity}</Badge>;
}
