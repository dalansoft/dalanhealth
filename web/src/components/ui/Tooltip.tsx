import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  label: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

export function Tooltip({ label, children, side = 'top', className }: Props) {
  return (
    <span className={cn('group relative inline-flex', className)}>
      {children}
      <span
        className={cn(
          'pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-900 dark:bg-ink-50 px-2 py-1 text-[11px] font-medium text-white dark:text-ink-900 opacity-0 transition-opacity group-hover:opacity-100',
          side === 'top' ? 'bottom-full mb-1' : 'top-full mt-1',
        )}
      >
        {label}
      </span>
    </span>
  );
}
