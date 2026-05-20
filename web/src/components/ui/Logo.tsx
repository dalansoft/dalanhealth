import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  asLink?: boolean;
}

const sizes = {
  sm: { box: 'h-7 w-7', text: 'text-sm' },
  md: { box: 'h-9 w-9', text: 'text-base' },
  lg: { box: 'h-11 w-11', text: 'text-lg' },
};

export function Logo({ size = 'md', className, asLink = true }: Props) {
  const s = sizes[size];
  const inner = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className={cn('relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-glow', s.box)}>
        <span className="text-white font-bold leading-none" style={{ fontSize: '0.85em' }}>+</span>
        <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 opacity-30 blur-md -z-10" />
      </span>
      <span className={cn('font-semibold tracking-tight text-ink-900 dark:text-ink-50', s.text)}>
        Dalan<span className="gradient-text">Health</span>
      </span>
    </span>
  );
  return asLink ? <Link to="/" className="inline-flex">{inner}</Link> : inner;
}
