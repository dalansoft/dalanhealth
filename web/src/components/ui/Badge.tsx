import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'online' | 'offline' | 'qr';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  pulse?: boolean;
  icon?: ReactNode;
  size?: 'sm' | 'md';
}

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 ring-1 ring-brand-500/20',
  accent: 'bg-accent-500/10 text-accent-600 dark:text-accent-300 ring-1 ring-accent-500/20',
  success: 'bg-success-500/10 text-success-600 dark:text-success-500 ring-1 ring-success-500/20',
  warning: 'bg-warning-500/10 text-warning-600 dark:text-warning-500 ring-1 ring-warning-500/20',
  danger: 'bg-danger-500/10 text-danger-600 dark:text-danger-500 ring-1 ring-danger-500/20',
  neutral: 'bg-ink-100 text-ink-700 dark:bg-ink-800/80 dark:text-ink-300 ring-1 ring-ink-200/70 dark:ring-ink-700/70',
  online: 'bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-1 ring-brand-500/25',
  offline: 'bg-success-500/10 text-success-600 dark:text-success-400 ring-1 ring-success-500/25',
  qr: 'bg-accent-500/10 text-accent-600 dark:text-accent-300 ring-1 ring-accent-500/25',
};

export function Badge({ tone = 'neutral', pulse, icon, size = 'md', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px] uppercase tracking-wider' : 'px-2.5 py-1 text-xs uppercase tracking-wider',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {pulse && <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current">
        <span className="absolute inset-0 inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
      </span>}
      {icon}
      {children}
    </span>
  );
}
