import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { SourceBadge } from '@/components/ui/SourceBadge';

const NAMES: Array<{ name: string; source: 'OFFLINE' | 'ONLINE' | 'QR' }> = [
  { name: 'Raj Verma', source: 'OFFLINE' },
  { name: 'Pooja Sharma', source: 'ONLINE' },
  { name: 'Saurabh Singh', source: 'QR' },
  { name: 'Anjali Devi', source: 'OFFLINE' },
  { name: 'Aman Kumar', source: 'QR' },
  { name: 'Neha Singh', source: 'ONLINE' },
  { name: 'Ramesh Jha', source: 'OFFLINE' },
  { name: 'Kiran Bala', source: 'QR' },
];

const PER_PATIENT_MIN = 6;

/**
 * Self-running queue simulation: every few seconds the current token
 * completes and the next patient is called, exactly like the real product's
 * TV display — visitors watch the queue actually move.
 */
export function LiveQueueDemo() {
  const [head, setHead] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setHead((h) => h + 1), 4000);
    return () => clearInterval(id);
  }, []);

  const token = (offset: number) => 12 + ((head + offset) % 88);
  const person = (offset: number) => NAMES[(head + offset) % NAMES.length];
  const ahead = 3;

  return (
    <Section
      id="demo"
      eyebrow="See it move"
      title={<>This is your waiting room, <span className="gradient-text">running itself.</span></>}
      description="A live simulation of the Dalan Health queue — tokens advance automatically, exactly like in your clinic."
    >
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="relative rounded-[28px] border hairline glass-strong p-6 sm:p-10 overflow-hidden"
        >
          <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-token/15 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl" />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            {/* NOW SERVING */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-token font-semibold">
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-token opacity-60 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-token" />
                </span>
                Now Serving
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={head}
                  initial={{ scale: 0.7, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 1.1, opacity: 0, y: -12 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                  className="mt-3"
                >
                  <div className="text-7xl sm:text-8xl font-extrabold tracking-tight text-token drop-shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                    #{token(0)}
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="text-xl font-semibold text-ink-900 dark:text-ink-50">{person(0).name}</span>
                    <SourceBadge source={person(0).source} />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* UP NEXT */}
            <div>
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300 font-semibold">Up Next</div>
                <Badge tone="success" pulse size="sm">Live</Badge>
              </div>
              {/* Plain keyed render (no exit animations): rows leave the DOM
                  immediately when the queue advances, so the loop can never
                  accumulate stale rows. */}
              <div className="mt-3 space-y-2">
                {[1, 2, 3].map((off) => (
                  <motion.div
                    key={token(off)}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      off === 1
                        ? 'border-brand-500/40 bg-brand-500/10'
                        : 'hairline bg-white/50 dark:bg-ink-900/40'
                    }`}
                  >
                    <span className={`w-12 text-center text-xl font-extrabold tabular-nums ${off === 1 ? 'text-brand-600 dark:text-brand-300' : 'text-ink-500 dark:text-ink-400'}`}>
                      #{token(off)}
                    </span>
                    <span className="flex-1 text-sm font-medium text-ink-800 dark:text-ink-100 truncate">{person(off).name}</span>
                    <SourceBadge source={person(off).source} />
                  </motion.div>
                ))}
              </div>

              {/* Wait stats */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border hairline bg-white/50 dark:bg-ink-900/40 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted"><Clock size={11} /> Estimated Wait</div>
                  <div className="mt-1 text-lg font-bold text-ink-900 dark:text-ink-50">{ahead * PER_PATIENT_MIN} Minutes</div>
                </div>
                <div className="rounded-xl border hairline bg-white/50 dark:bg-ink-900/40 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted"><Users size={11} /> Patients Ahead</div>
                  <div className="mt-1 text-lg font-bold text-ink-900 dark:text-ink-50">{ahead}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
