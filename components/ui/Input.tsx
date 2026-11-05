'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, type, wrapperClassName, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label className="text-sm font-medium text-[#F4F7FA]">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA9B7]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              'w-full bg-[#18232D] border text-[#F4F7FA] rounded-lg py-2.5 placeholder-[#9BA9B7]',
              'focus:outline-none focus:ring-1 transition-all duration-200',
              leftIcon ? 'pl-10' : 'pl-4',
              isPassword || rightIcon ? 'pr-10' : 'pr-4',
              error
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-[#2A3A48] focus:border-emerald focus:ring-emerald/20 hover:border-[#374959]',
              'text-sm',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BA9B7] hover:text-[#F4F7FA] transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          {!isPassword && rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BA9B7]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-400 flex items-center gap-1">{error}</p>}
        {hint && !error && <p className="text-xs text-[#9BA9B7]">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export default Input;
