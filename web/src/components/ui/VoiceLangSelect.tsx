import { useEffect, useRef, useState } from 'react';
import { Languages, Check, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/store/sound';
import { useQueue } from '@/store/queue';
import { previewVoice } from '@/lib/speech';
import { unlockAudio } from '@/lib/chime';
import type { AnnounceLang } from '@/lib/speech';
import { cn } from '@/lib/cn';

interface Option {
  value: AnnounceLang;
  label: string;
  short: string;
}

const OPTIONS: Option[] = [
  { value: 'en', label: 'English', short: 'EN' },
  { value: 'hi', label: 'हिन्दी', short: 'हि' },
  { value: 'both', label: 'Hindi + English', short: 'हि+EN' },
];

/**
 * Announcement-language picker for the TV display. Sets the voice used by the
 * spoken "now serving" call. Selecting an option speaks a short preview so the
 * operator hears the voice/accent immediately.
 */
export function VoiceLangSelect({ className }: { className?: string }) {
  const announceLang = useSound((s) => s.announceLang);
  const setLang = useSound((s) => s.setLang);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = OPTIONS.find((o) => o.value === announceLang) ?? OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (value: AnnounceLang) => {
    setLang(value);
    setOpen(false);
    // Speaking needs a prior user gesture; this click is one — unlock + preview.
    // Preview with the LIVE current patient's name so what you hear matches
    // the screen (a hardcoded sample name here previously confused operators).
    unlockAudio();
    const current = useQueue.getState().entries[0];
    const { templateEn, templateHi } = useSound.getState();
    setTimeout(
      () => previewVoice(value, current?.patientName, { templateEn, templateHi }, current?.token ?? 1),
      80,
    );
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Announcement language"
        title="Announcement voice language"
        className={cn(
          'h-10 px-2.5 rounded-xl border border-ink-200 dark:border-ink-800 bg-white/70 dark:bg-ink-900/80 backdrop-blur',
          'hover:border-brand-400/60 dark:hover:border-brand-500/60 transition-colors',
          'flex items-center gap-1.5 text-ink-700 dark:text-ink-200',
        )}
      >
        <Languages size={16} className="text-brand-600 dark:text-brand-300" />
        <span className="text-xs font-semibold tabular-nums">{current.short}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-ink-200 dark:border-white/10 bg-white dark:bg-ink-900 shadow-2xl z-50 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-ink-200 dark:border-white/10 text-[10px] uppercase tracking-wider text-ink-500 dark:text-white/55 font-semibold">
              Announcement voice
            </div>
            {OPTIONS.map((o) => {
              const active = o.value === announceLang;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => choose(o.value)}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors',
                    active ? 'bg-brand-500/10 dark:bg-brand-500/15' : 'hover:bg-ink-50 dark:hover:bg-ink-800',
                  )}
                >
                  <span className={cn(
                    'text-sm font-medium',
                    active ? 'text-ink-900 dark:text-ink-50' : 'text-ink-700 dark:text-ink-200',
                  )}>
                    {o.label}
                  </span>
                  {active ? (
                    <Check size={15} className="text-brand-600 dark:text-brand-300 shrink-0" />
                  ) : (
                    <Play size={13} className="text-ink-400 shrink-0" />
                  )}
                </button>
              );
            })}
            <div className="px-3 py-2 border-t border-ink-200 dark:border-white/10 text-[10px] text-ink-500 dark:text-white/45">
              Female · Indian accent · plays a preview
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
