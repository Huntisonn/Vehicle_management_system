// src/components/ui/Input.jsx
import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';
import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = '',
  containerClass = '',
  required,
  ...props
}, ref) => {
  return (
    <div className={clsx('flex flex-col gap-1.5', containerClass)}>
      {label && (
        <label className="text-sm font-medium text-zinc-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full rounded-xl bg-zinc-800/80 border text-zinc-100 placeholder-zinc-500',
            'px-4 py-2.5 text-sm outline-none transition-all duration-200',
            'focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-red-500/70' : 'border-zinc-700 hover:border-zinc-600',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
