// src/components/ui/Skeleton.jsx
import { clsx } from 'clsx';

const Skeleton = ({ className = '', ...props }) => (
  <div className={clsx('skeleton', className)} {...props} />
);

export const VehicleCardSkeleton = () => (
  <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
    <Skeleton className="h-48 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    ))}
  </div>
);

export const StatCardSkeleton = () => (
  <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export default Skeleton;
