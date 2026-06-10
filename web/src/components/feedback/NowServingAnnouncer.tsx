import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, Volume2 } from 'lucide-react';
import { useQueue } from '@/store/queue';
import { useSound } from '@/store/sound';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { playChime, unlockAudio, isAudioUnlocked } from '@/lib/chime';
import { speakAnnouncement, speakCustomText } from '@/lib/speech';
import { subscribeAnnouncements } from '@/lib/announceBus';
import { cn } from '@/lib/cn';

interface Props {
  /** 'tv' → large top-centre banner for wall displays.
   *  'panel' → compact bottom-right toast for staff dashboards. */
  placement?: 'tv' | 'panel';
  /** When true, speak the announcement aloud (TTS) after the chime, using the
   *  language chosen in the sound store. Enabled on the TV; staff panels stay
   *  chime-only so the office isn't talked at all day. */
  speak?: boolean;
}

/**
 * Watches the live queue's currently-serving entry. Whenever it changes to a
 * NEW patient (i.e. someone was completed/skipped and the next is called), it:
 *   1. plays the call chime (if sound is enabled + audio unlocked), and
 *   2. shows a small "Now serving #N — Name" toast for a few seconds.
 *
 * Because the queue store syncs across tabs via BroadcastChannel, advancing
 * the queue on the receptionist panel fires this announcer on the TV tab, the
 * clinic dashboard, and the receptionist panel simultaneously — each device
 * that has this mounted rings independently.
 *
 * Mount one instance per surface that should announce (TV display, clinic
 * dashboard, receptionist dashboard, clinic queue).
 */
export function NowServingAnnouncer({ placement = 'panel', speak = false }: Props) {
  const current = useQueue((s) => s.entries[0]);
  const soundEnabled = useSound((s) => s.enabled);
  const announceLang = useSound((s) => s.announceLang);
  const templateEn = useSound((s) => s.templateEn);
  const templateHi = useSound((s) => s.templateHi);

  const prevTokenRef = useRef<number | null>(null);
  const [toast, setToast] = useState<{ token: number; name: string; source: string } | null>(null);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-unlock audio on the first user interaction anywhere on the page
  // (satisfies the browser autoplay policy without an explicit button).
  useEffect(() => {
    const onInteract = () => {
      unlockAudio();
      setNeedsUnlock(false);
    };
    window.addEventListener('pointerdown', onInteract, { once: false });
    window.addEventListener('keydown', onInteract, { once: false });
    return () => {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, []);

  // Custom PA announcements posted from the clinic panel's TV settings —
  // only speaking surfaces (the TV) react, and only while sound is on.
  useEffect(() => {
    if (!speak) return;
    return subscribeAnnouncements((a) => {
      if (!useSound.getState().enabled) return;
      playChime();
      setTimeout(() => speakCustomText(a.text, a.lang), 600);
    });
  }, [speak]);

  // Detect "new patient called".
  useEffect(() => {
    const token = current?.token ?? null;
    if (token === null) return;

    // First real token after mount — record silently, don't announce.
    if (prevTokenRef.current === null) {
      prevTokenRef.current = token;
      return;
    }
    if (token !== prevTokenRef.current) {
      prevTokenRef.current = token;
      if (current) {
        setToast({ token: current.token, name: current.patientName, source: current.source });
        if (soundEnabled) {
          if (isAudioUnlocked()) {
            playChime();
            // Speak the call ~0.7s after the chime so the ding leads in,
            // then the voice reads the token + name in the chosen language.
            if (speak) {
              const c = current;
              setTimeout(
                () => speakAnnouncement({
                  token: c.token,
                  name: c.patientName,
                  lang: announceLang,
                  templateEn,
                  templateHi,
                }),
                700,
              );
            }
          } else {
            // Sound wanted but blocked by autoplay policy — surface a hint.
            setNeedsUnlock(true);
          }
        }
        if (dismissRef.current) clearTimeout(dismissRef.current);
        dismissRef.current = setTimeout(() => setToast(null), placement === 'tv' ? 7000 : 5000);
      }
    } else {
      prevTokenRef.current = token;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.token, current?.patientName]);

  useEffect(() => () => { if (dismissRef.current) clearTimeout(dismissRef.current); }, []);

  const isTv = placement === 'tv';

  return (
    <>
      {/* "Enable sound" nudge — only when sound is on but audio is still locked
          and a call just happened. One tap anywhere clears it. */}
      <AnimatePresence>
        {needsUnlock && soundEnabled && (
          <motion.button
            type="button"
            onClick={() => { unlockAudio(); setNeedsUnlock(false); playChime(0.4); }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-[90] inline-flex items-center gap-2 rounded-full bg-brand-600 text-white px-4 py-2 text-xs font-semibold shadow-lg"
          >
            <Volume2 size={14} /> Tap to enable call sound
          </motion.button>
        )}
      </AnimatePresence>

      {/* Announcement toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.token}
            initial={{ opacity: 0, y: isTv ? -24 : 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isTv ? -16 : 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className={cn(
              'fixed z-[85] pointer-events-none',
              isTv
                ? 'top-4 left-1/2 -translate-x-1/2'
                : 'bottom-5 right-5',
            )}
          >
            <div className={cn(
              'flex items-center gap-3 rounded-2xl border shadow-2xl backdrop-blur-xl',
              'border-brand-500/40 bg-white/95 dark:bg-ink-900/95',
              isTv ? 'px-6 py-4' : 'px-4 py-3',
            )}>
              <span className={cn(
                'relative inline-flex items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300 shrink-0',
                isTv ? 'h-12 w-12' : 'h-9 w-9',
              )}>
                <span className="absolute inset-0 rounded-xl bg-brand-500/30 animate-ping" />
                <BellRing size={isTv ? 22 : 16} className="relative" />
              </span>
              <div className="min-w-0">
                <div className={cn(
                  'uppercase tracking-[0.2em] font-semibold text-brand-600 dark:text-brand-300',
                  isTv ? 'text-xs' : 'text-[10px]',
                )}>
                  Now serving
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn('font-extrabold tabular-nums font-brand text-ink-900 dark:text-ink-50', isTv ? 'text-2xl' : 'text-lg')}>
                    #{toast.token}
                  </span>
                  <span className={cn('font-semibold text-ink-800 dark:text-ink-100 truncate', isTv ? 'text-lg' : 'text-sm')}>
                    {toast.name}
                  </span>
                  <SourceBadge source={toast.source as 'ONLINE' | 'OFFLINE' | 'QR'} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
