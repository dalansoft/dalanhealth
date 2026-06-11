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
  sm: { box: 28, wordH: 22 },
  md: { box: 34, wordH: 27 },
  lg: { box: 42, wordH: 33 },
};

/**
 * DalanHealth lockup — the brand mark next to the official wordmark image
 * (DALAN HEALTH + Better Health tagline) cropped straight from the logo
 * file, so letterforms, teal A-notches and spacing match the brand exactly.
 * Theme/variant aware: dark surfaces get the white-text version.
 */
export function Logo({ size = 'md', className, asLink = true, variant = 'auto', showWordmark = true }: Props) {
  const s = sizes[size];
  const isDarkTheme = useTheme((st) => st.theme === 'dark');
  const dark = variant === 'onDark' || (variant === 'auto' && isDarkTheme);

  const inner = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <DalanMark size={s.box} />
      {showWordmark && (
        <img
          src={dark ? '/wordmark-dark.png' : '/wordmark.png'}
          alt="Dalan Health — Better Health"
          style={{ height: s.wordH, width: 'auto', display: 'block' }}
          draggable={false}
        />
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
