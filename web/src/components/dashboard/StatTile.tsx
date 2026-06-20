import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Sparkline } from '@/components/ui/Sparkline';
import { cn } from '@/lib/cn';

interface Props {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  sparkline?: number[];
  accent?: 'brand' | 'accent' | 'teal' | 'success' | 'warning' | 'token';
  className?: string;
  /** Compact variant — smaller padding, smaller value font, shorter sparkline. */
  dense?: boolean;
}

const accents = {
  brand: { tint: 'from-brand-500/15 to-transparent', color: '#14b8a6', text: 'text-brand-600 dark:text-brand-300' },
  accent: { tint: 'from-accent-500/15 to-transparent', color: '#10b981', text: 'text-accent-600 dark:text-accent-300' },
  teal: { tint: 'from-teal-500/15 to-transparent', color: '#06b6d4', text: 'text-teal-600 dark:text-teal-400' },
  success: { tint: 'from-success-500/15 to-transparent', color: '#10b981', text: 'text-success-600 dark:text-success-500' },
  warning: { tint: 'from-warning-500/15 to-transparent', color: '#f59e0b', text: 'text-warning-600 dark:text-warning-500' },
  token: { tint: 'from-token/15 to-transparent', color: '#22c55e', text: 'text-token' },
};

export function StatTile({ label, value, hint, icon, sparkline, accent = 'brand', className, dense }: Props) {
  const a = accents[accent];
  return (
    <Card padded={false} className={cn('relative overflow-hidden', dense ? 'p-3' : 'p-5', className)}>
      <div className={cn('pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl', a.tint)} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className={cn('font-semibold uppercase tracking-wider text-muted', dense ? 'text-[10px]' : 'text-[11px]')}>{label}</span>
          {icon && (
            <div className={cn('inline-flex items-center justify-center rounded-xl bg-gradient-to-br', dense ? 'h-7 w-7' : 'h-8 w-8', a.tint, a.text)}>
              {icon}
            </div>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('font-extrabold tracking-tight text-ink-900 dark:text-ink-50', dense ? 'mt-1 text-2xl' : 'mt-2 text-3xl')}
        >
          {value}
        </motion.div>
        {hint && <div className={cn('text-muted', dense ? 'text-[10px]' : 'mt-0.5 text-[11px]')}>{hint}</div>}
        {sparkline && <Sparkline data={sparkline} color={a.color} className={cn('w-full', dense ? 'mt-1.5 h-6' : 'mt-3 h-9')} />}
      </div>
    </Card>
  );
}
