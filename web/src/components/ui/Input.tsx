import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Plain string or any ReactNode — supports e.g. labels with a "*" suffix. */
  label?: ReactNode;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon, rightSlot, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className={cn(
        'group relative flex items-center rounded-xl border bg-white dark:bg-ink-900/80 transition-all',
        error ? 'border-danger-500/70 focus-within:border-danger-500' : 'border-ink-200 dark:border-ink-800 focus-within:border-brand-500/70 dark:focus-within:border-brand-500/70',
        'focus-within:ring-4 focus-within:ring-brand-500/10 dark:focus-within:ring-brand-500/15',
      )}>
        {leftIcon && <span className="pl-3 text-ink-400 dark:text-ink-500">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'peer w-full bg-transparent px-3.5 py-2.5 text-sm text-ink-900 dark:text-ink-50 placeholder:text-ink-400 dark:placeholder:text-ink-500 outline-none',
            className,
          )}
          {...rest}
        />
        {rightSlot && <span className="pr-3">{rightSlot}</span>}
      </div>
      {(hint || error) && (
        <p className={cn('mt-1.5 text-xs', error ? 'text-danger-500' : 'text-muted')}>{error ?? hint}</p>
      )}
    </div>
  );
});
