import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/store/sound';
import { unlockAudio, playChime } from '@/lib/chime';
import { cancelSpeech } from '@/lib/speech';
import { cn } from '@/lib/cn';

interface Props {
  className?: string;
}

/**
 * Speaker on/off toggle for queue-announcement sound. Clicking it also doubles
 * as the audio-unlock gesture (browsers require a user interaction before
 * audio can play) — turning sound ON plays a short confirmation chime so the
 * user knows audio is now live on this device.
 */
export function SoundToggle({ className }: Props) {
  const { enabled, toggle } = useSound();

  const handleClick = () => {
    const next = !enabled;
    toggle();
    if (next) {
      // Unlock + confirmation ding so the operator hears it's working.
      unlockAudio();
      setTimeout(() => playChime(0.4), 60);
    } else {
      // Muting — stop any announcement that's mid-sentence.
      cancelSpeech();
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={enabled ? 'Mute call sound' : 'Enable call sound'}
      title={enabled ? 'Call sound on' : 'Call sound off'}
      className={cn(
        'relative h-10 w-10 rounded-xl border border-ink-200 dark:border-ink-800 bg-white/70 dark:bg-ink-900/80 backdrop-blur',
        'hover:border-brand-400/60 dark:hover:border-brand-500/60 transition-colors focus-ring',
        'flex items-center justify-center',
        enabled ? 'text-brand-600 dark:text-brand-300' : 'text-ink-400 dark:text-ink-500',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={enabled ? 'on' : 'off'}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute"
        >
          {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
