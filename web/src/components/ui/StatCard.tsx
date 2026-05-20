import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Card } from './Card';
import { cn } from '@/lib/cn';

interface Props {
  label: string;
  value: ReactNode;
  delta?: { value: string; positive?: boolean };
  icon?: ReactNode;
  accent?: 'brand' | 'accent' | 'teal' | 'success' | 'warning' | 'danger';
  className?: string;
}

const accents = {
  brand: 'from-brand-500/15 to-transparent text-brand-600 dark:text-brand-300',
  accent: 'from-accent-500/15 to-transparent text-accent-600 dark:text-accent-300',
  teal: 'from-teal-500/15 to-transparent text-teal-600 dark:text-teal-400',
  success: 'from-success-500/15 to-transparent text-success-600 dark:text-success-500',
  warning: 'from-warning-500/15 to-transparent text-warning-600 dark:text-warning-500',
  danger: 'from-danger-500/15 to-transparent text-danger-600 dark:text-danger-500',
};

export function StatCard({ label, value, delta, icon, accent = 'brand', className }: Props) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <div className={cn('pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br blur-2xl', accents[accent])} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">{label}</span>
          {icon && (
            <div className={cn('inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br', accents[accent])}>
              {icon}
            </div>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50"
        >
          {value}
        </motion.div>
        {delta && (
          <div className={cn('mt-1 text-xs font-medium', delta.positive ? 'text-success-600 dark:text-success-500' : 'text-danger-500')}>
            {delta.positive ? '▲' : '▼'} {delta.value}
          </div>
        )}
      </div>
    </Card>
  );
}
