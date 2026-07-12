// src/components/ui/Select.jsx
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  options = [],
  error,
  className = '',
  containerClass = '',
  placeholder = 'Select...',
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
        <select
          ref={ref}
          className={clsx(
            'w-full appearance-none rounded-xl bg-zinc-800/80 border text-zinc-100',
            'px-4 py-2.5 text-sm pr-10 outline-none transition-all duration-200',
            'focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500',
            error ? 'border-red-500/70' : 'border-zinc-700 hover:border-zinc-600',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" className="bg-zinc-900">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-900">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
