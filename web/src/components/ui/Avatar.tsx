import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';

interface Props {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
};

export function Avatar({ name, src, size = 'md', className }: Props) {
  return (
    <div className={cn(
      'inline-flex items-center justify-center rounded-full font-semibold text-white',
      'bg-gradient-to-br from-brand-500 to-accent-500',
      sizes[size],
      className,
    )}>
      {src ? <img src={src} alt={name} className="h-full w-full rounded-full object-cover" /> : initials(name)}
    </div>
  );
}
