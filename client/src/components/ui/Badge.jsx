// src/components/ui/Badge.jsx
import { clsx } from 'clsx';

const variants = {
  default: 'bg-zinc-700 text-zinc-300',
  primary: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
  info: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
};

const statusMap = {
  pending: 'warning',
  approved: 'success',
  active: 'primary',
  completed: 'default',
  cancelled: 'danger',
  rejected: 'danger',
  available: 'success',
  rented: 'primary',
  maintenance: 'warning',
  inactive: 'default',
};

const Badge = ({ children, variant = 'default', status, size = 'sm', className = '', dot = false }) => {
  const resolvedVariant = status ? statusMap[status] || 'default' : variant;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variants[resolvedVariant],
        className
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full', {
          'bg-zinc-400': resolvedVariant === 'default',
          'bg-indigo-400': resolvedVariant === 'primary',
          'bg-emerald-400': resolvedVariant === 'success',
          'bg-amber-400': resolvedVariant === 'warning',
          'bg-red-400': resolvedVariant === 'danger',
          'bg-sky-400': resolvedVariant === 'info',
        })} />
      )}
      {children}
    </span>
  );
};

export default Badge;
