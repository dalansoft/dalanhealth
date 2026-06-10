import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
}

export function Section({ eyebrow, title, description, align = 'center', className, children, ...rest }: Props) {
  return (
    <section className={cn('mx-auto w-full max-w-7xl px-5 sm:px-8 py-20 md:py-28', className)} {...rest}>
      {(eyebrow || title || description) && (
        <div className={cn('mx-auto mb-12 max-w-3xl', align === 'center' ? 'text-center' : 'text-left')}>
          {eyebrow && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-50 dark:bg-brand-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              {eyebrow}
            </span>
          )}
          {title && (
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-4 text-base sm:text-lg text-muted">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
