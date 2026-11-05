'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'bordered';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, padding = 'md', children, ...props }, ref) => {
    const base = 'rounded-xl border transition-all duration-200';

    const variants = {
      default: 'bg-[#202C37] border-[#2A3A48] shadow-card',
      elevated: 'bg-[#202C37] border-[#2A3A48] shadow-card-hover',
      glass: 'bg-[#202C37]/60 backdrop-blur-md border-[#2A3A48]/50 shadow-card',
      bordered: 'bg-transparent border-[#2A3A48]',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const hoverStyle = hover
      ? 'hover:border-emerald/30 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={cn(base, variants[variant], paddings[padding], hoverStyle, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center justify-between mb-5', className)} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: 'sm' | 'md' | 'lg';
}
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size = 'md', children, ...props }, ref) => {
    const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };
    return (
      <h3 ref={ref} className={cn('font-semibold text-[#F4F7FA]', sizes[size], className)} {...props}>
        {children}
      </h3>
    );
  }
);
CardTitle.displayName = 'CardTitle';

export default Card;
