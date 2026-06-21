import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success' | 'subtle';
type Size = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.985]',
  secondary:
    'bg-accent-600 text-white hover:bg-accent-700 active:scale-[0.985]',
  ghost:
    'bg-transparent text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800/70',
  outline:
    'bg-white dark:bg-ink-900 text-ink-800 dark:text-ink-100 border border-ink-200 dark:border-ink-700 hover:border-brand-400/70 dark:hover:border-brand-500/70 hover:text-brand-700 dark:hover:text-brand-300',
  danger:
    'bg-danger-500 text-white hover:bg-danger-600 active:scale-[0.985]',
  success:
    'bg-success-500 text-white hover:bg-success-600 active:scale-[0.985]',
  subtle:
    'bg-ink-100 dark:bg-ink-800/70 text-ink-700 dark:text-ink-200 hover:bg-ink-200 dark:hover:bg-ink-700/70',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-2xl gap-2',
  xl: 'h-14 px-8 text-base rounded-2xl gap-2.5',
  icon: 'h-10 w-10 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, leftIcon, rightIcon, fullWidth, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-ring select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
