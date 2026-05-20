import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hover?: boolean;
  padded?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { glass, hover, padded = true, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        glass ? 'glass rounded-2xl' : 'card',
        padded && 'p-5',
        hover && 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

export const CardHeader = ({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4 flex items-start justify-between gap-4', className)} {...rest}>{children}</div>
);

export const CardTitle = ({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-base font-semibold tracking-tight text-ink-900 dark:text-ink-50', className)} {...rest}>{children}</h3>
);

export const CardSubtitle = ({ className, children, ...rest }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('mt-1 text-sm text-muted', className)} {...rest}>{children}</p>
);
