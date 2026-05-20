import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/store/theme';
import { cn } from '@/lib/cn';

interface Props {
  className?: string;
}

export function ThemeToggle({ className }: Props) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        'relative h-10 w-10 rounded-xl border border-ink-200 dark:border-ink-800 bg-white/70 dark:bg-ink-900/80 backdrop-blur',
        'hover:border-brand-400/60 dark:hover:border-brand-500/60 transition-colors focus-ring',
        'flex items-center justify-center text-ink-700 dark:text-ink-200',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          {isDark ? <Moon className="h-4.5 w-4.5" size={18} /> : <Sun size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
