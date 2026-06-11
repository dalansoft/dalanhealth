import { Link } from 'react-router-dom';
import { useTheme } from '@/store/theme';
import { cn } from '@/lib/cn';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  asLink?: boolean;
  /** Force wordmark colour — defaults to theme-aware. Useful on dark sidebars. */
  variant?: 'auto' | 'onDark' | 'onLight';
  showWordmark?: boolean;
}

const sizes = {
  sm: { box: 28, text: 'text-[11px]', tagline: 'text-[7px]' },
  md: { box: 34, text: 'text-[12px]', tagline: 'text-[8px]' },
  lg: { box: 42, text: 'text-[14px]', tagline: 'text-[9px]' },
};

/**
 * DalanHealth lockup — the brand mark (user-supplied PNG) next to the navy
 * "DALAN HEALTH" wordmark with the teal "Better Health" tagline, matching
 * the official logo.
 */
export function Logo({ size = 'md', className, asLink = true, variant = 'auto', showWordmark = true }: Props) {
  const s = sizes[size];
  const wordmarkClass =
    variant === 'onDark'
      ? 'text-white'
      : variant === 'onLight'
      ? 'text-ink-900'
      : 'text-ink-900 dark:text-white';

  const inner = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <DalanMark size={s.box} />
      {showWordmark && (
        <span className="flex flex-col">
          <span className={cn('font-brand font-bold leading-none tracking-[0.18em] uppercase', s.text, wordmarkClass)}>
            Dalan Health
          </span>
          <span className={cn('mt-0.5 font-medium leading-none tracking-[0.3em] text-teal-500 dark:text-teal-400', s.tagline)}>
            Better Health
          </span>
        </span>
      )}
    </span>
  );

  return asLink ? (
    <Link to="/" className="inline-flex items-center">
      {inner}
    </Link>
  ) : (
    inner
  );
}

/**
 * DalanHealth brand mark — renders the official PNG verbatim. Theme-aware:
 * light mode uses /logo.png (navy D + gradient bars); dark mode swaps to
 * /logo-dark.png where the navy is white so the mark stays visible on dark
 * headers (the teal-blue gradient is identical in both).
 */
export function DalanMark({ size = 34 }: { size?: number }) {
  const isDark = useTheme((s) => s.theme === 'dark');
  return (
    <img
      src={isDark ? '/logo-dark.png' : '/logo.png'}
      alt="DalanHealth"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
      draggable={false}
    />
  );
}

/**
 * Back-compat alias — older imports referenced `HeartLeafMark`. New code should
 * use `DalanMark` directly.
 * @deprecated Use {@link DalanMark}.
 */
export const HeartLeafMark = DalanMark;
