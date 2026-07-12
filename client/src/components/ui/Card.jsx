// src/components/ui/Card.jsx
import { clsx } from 'clsx';

const Card = ({ children, className = '', hover = false, glass = false, padding = true, ...props }) => (
  <div
    className={clsx(
      'rounded-2xl border border-zinc-800',
      glass ? 'glass' : 'bg-zinc-900',
      padding && 'p-6',
      hover && 'card-hover cursor-pointer',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

Card.Header = ({ children, className = '' }) => (
  <div className={clsx('flex items-center justify-between mb-4', className)}>{children}</div>
);

Card.Title = ({ children, className = '' }) => (
  <h3 className={clsx('text-lg font-semibold text-zinc-100', className)}>{children}</h3>
);

Card.Body = ({ children, className = '' }) => (
  <div className={clsx(className)}>{children}</div>
);

export default Card;
