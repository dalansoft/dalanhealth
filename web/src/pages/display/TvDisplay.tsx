import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartLeafMark } from '@/components/ui/Logo';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useQueue } from '@/store/queue';
import { demoQueue, demoClinic } from '@/services/demoData';

/**
 * TV / kiosk display for the clinic waiting room.
 *
 * - Locked to viewport (h-screen + overflow-hidden) so it never scrolls.
 * - Theme-aware: respects the user's light/dark choice via the toggle
 *   in the top-right corner.
 * - Up-next list is capped at 5 with derived status labels:
 *     position 0 -> GET READY
 *     position 1 -> QUEUE
 *     positions 2-4 -> WAITING
 */
export function TvDisplay() {
  const { entries, setEntries } = useQueue();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (entries.length === 0) setEntries(demoQueue);
  }, [entries.length, setEntries]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const current = entries[0];

  // Cap at 5 visible — comfortably fits on every display at the larger
  // row size the user asked for. Honest total still appears in the
  // header counter and the "+N more" footer.
  const MAX_UP_NEXT = 5;
  const totalWaiting = Math.max(0, entries.length - (current ? 1 : 0));
  const upNext = entries.slice(1, 1 + MAX_UP_NEXT);
  const overflow = Math.max(0, totalWaiting - upNext.length);

  // Clock — manual format so seconds + uppercase AM/PM stay consistent.
  const h24 = now.getHours();
  const hour12 = String(h24 % 12 || 12).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const time = `${hour12}:${minute}:${second} ${ampm}`;
  const date = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const year = now.getFullYear();

  const timingBlocks = demoClinic.timing.split(',').map((t) => t.trim()).filter(Boolean);

  // Derive a position-based status label for the up-next list.
  const statusFor = (idx: number) => {
    if (idx === 0) return { label: 'Get ready', tone: 'text-brand-600 dark:text-brand-300' };
    if (idx === 1) return { label: 'Queue', tone: 'text-token' };
    return { label: 'Waiting', tone: 'text-ink-500 dark:text-white/55' };
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-ink-50 dark:bg-navy-950 text-ink-900 dark:text-white relative flex flex-col">
      {/* Decorative backdrop */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 h-[640px] w-[640px] rounded-full bg-token/15 dark:bg-token/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-40 h-[640px] w-[640px] rounded-full bg-brand-500/15 dark:bg-brand-500/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-10" />

      {/* Header — clinic info stacked, time + theme toggle on the right */}
      <header className="relative z-10 shrink-0 px-6 sm:px-10 lg:px-14 py-4 lg:py-5 flex items-start justify-between gap-6 border-b border-ink-200 dark:border-white/10">
        <div className="flex items-start gap-4 min-w-0">
          <HeartLeafMark size={52} />
          <div className="min-w-0">
            <div className="text-xl lg:text-2xl xl:text-3xl font-extrabold tracking-tight font-brand truncate">
              {demoClinic.name}
            </div>
            <div className="mt-1 text-sm lg:text-base xl:text-lg font-semibold text-token">
              {demoClinic.doctor}
            </div>
            <div className="mt-1 text-xs lg:text-sm text-ink-600 dark:text-white/60 truncate">
              {demoClinic.specialization}
            </div>
            <div className="text-xs lg:text-sm text-ink-500 dark:text-white/55 truncate">
              {demoClinic.city}
            </div>
          </div>
        </div>
        <div className="shrink-0 flex items-start gap-3 lg:gap-5">
          <div className="flex flex-col items-end">
            <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tabular-nums leading-none font-brand whitespace-nowrap">
              {time}
            </div>
            <div className="mt-1 text-xs lg:text-sm text-ink-600 dark:text-white/60">{date}</div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 min-h-0 px-6 sm:px-10 lg:px-14 py-6 lg:py-8 grid lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-8 overflow-hidden">
        {/* LEFT: Now serving + Doctor sitting */}
        <section className="rounded-3xl bg-white dark:bg-white/[0.04] border border-ink-200 dark:border-white/10 backdrop-blur-xl p-6 lg:p-8 flex flex-col relative overflow-hidden min-h-0 shadow-card dark:shadow-none">
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-br from-token/8 via-transparent to-brand-500/8 dark:from-token/10 dark:to-brand-500/10" />

          <div className="flex items-center justify-center gap-2 text-[10px] lg:text-xs uppercase tracking-[0.32em] text-token font-semibold">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 inline-flex h-full w-full rounded-full bg-token opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-token" />
            </span>
            Now serving
          </div>

          <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="wait">
              {current ? (
                <motion.div
                  key={current.token}
                  initial={{ scale: 0.7, opacity: 0, y: 12 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 1.15, opacity: 0, y: -16 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className="font-extrabold leading-none tracking-tight text-token drop-shadow-[0_0_60px_rgba(34,197,94,0.45)] font-brand"
                    style={{ fontSize: 'clamp(6rem, 22vh, 16rem)' }}
                  >
                    #{current.token}
                  </div>
                  <div className="mt-4 lg:mt-6 text-2xl lg:text-4xl xl:text-5xl font-bold">{current.patientName}</div>
                  <div className="mt-2 lg:mt-3 flex items-center justify-center gap-3 text-ink-600 dark:text-white/70 text-sm lg:text-base">
                    <SourceBadge source={current.source} />
                  </div>
                  <div className="mt-4 lg:mt-5 inline-flex items-center gap-2 rounded-full bg-token/15 px-4 lg:px-5 py-1.5 lg:py-2 text-token font-semibold uppercase tracking-wider text-xs lg:text-sm">
                    Please proceed to the consultation room
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-ink-500 dark:text-white/40 text-2xl lg:text-3xl"
                >
                  Waiting for the next patient…
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Doctor sitting — beneath the "Please proceed" pill. Pairs split L/R. */}
          <div className="mt-4 lg:mt-6 rounded-2xl border border-ink-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-5 lg:px-8 py-3 lg:py-4 shrink-0">
            <div className="text-[10px] lg:text-xs uppercase tracking-wider text-ink-500 dark:text-white/60 text-center">Doctor sitting</div>
            <div className="mt-1.5 grid grid-cols-2 gap-x-6 lg:gap-x-10 gap-y-1.5 items-center">
              {timingBlocks.map((t, i) => {
                const isLastOdd = i === timingBlocks.length - 1 && timingBlocks.length % 2 === 1;
                const align = isLastOdd
                  ? 'col-span-2 text-center'
                  : i % 2 === 0
                  ? 'text-left'
                  : 'text-right';
                return (
                  <div
                    key={i}
                    className={`text-lg lg:text-2xl font-bold tracking-tight whitespace-nowrap ${align}`}
                  >
                    {t}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT: Up next — 5 max with status labels */}
        <section className="rounded-3xl bg-white dark:bg-white/[0.04] border border-ink-200 dark:border-white/10 backdrop-blur-xl p-5 lg:p-7 flex flex-col min-h-0 overflow-hidden shadow-card dark:shadow-none">
          <div className="shrink-0 flex items-center justify-between mb-4">
            <div className="text-[10px] lg:text-xs uppercase tracking-[0.32em] text-brand-600 dark:text-brand-300 font-semibold">Up next</div>
            <span className="text-xs text-ink-500 dark:text-white/60">{totalWaiting} waiting</span>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden space-y-2.5">
            <AnimatePresence initial={false}>
              {upNext.map((e, idx) => {
                const s = statusFor(idx);
                const isLead = idx === 0;
                return (
                  <motion.div
                    key={e.id}
                    layout
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    className={`flex items-center gap-4 rounded-2xl border p-3 lg:p-4 ${
                      isLead
                        ? 'border-brand-500/40 bg-brand-500/10 dark:bg-brand-500/15'
                        : 'border-ink-200 dark:border-white/10 bg-ink-50 dark:bg-white/[0.02]'
                    }`}
                  >
                    <div className={`w-16 lg:w-20 text-center text-3xl lg:text-4xl xl:text-5xl font-extrabold tabular-nums leading-none font-brand ${
                      isLead ? 'text-brand-600 dark:text-brand-300' : 'text-ink-500 dark:text-white/70'
                    }`}>
                      #{e.token}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base lg:text-lg xl:text-xl font-semibold truncate">{e.patientName}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <SourceBadge source={e.source} />
                      </div>
                    </div>
                    <div className={`text-[10px] lg:text-xs uppercase tracking-wider font-bold shrink-0 ${s.tone}`}>
                      {s.label}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {upNext.length === 0 && (
              <div className="text-ink-500 dark:text-white/50 text-base lg:text-lg text-center py-10">No further patients in queue.</div>
            )}
          </div>

          {overflow > 0 && (
            <div className="shrink-0 pt-3 text-center text-xs lg:text-sm font-semibold uppercase tracking-wider text-ink-500 dark:text-white/55">
              + {overflow} more waiting
            </div>
          )}
        </section>
      </main>

      {/* Footer — three sections: brand · company / contact · queue size */}
      <footer className="relative z-10 shrink-0 border-t border-ink-200 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur">
        <div className="px-6 sm:px-10 lg:px-14 py-3 grid grid-cols-3 items-center text-[11px] lg:text-xs text-ink-600 dark:text-white/60 gap-4">
          <span className="truncate">
            Powered by <span className="font-brand font-bold text-ink-900 dark:text-white tracking-[0.18em]">DALAN HEALTH</span>
          </span>
          <span className="hidden md:flex items-center justify-center gap-2 lg:gap-3 truncate">
            <span>© {year} Dalansoft Technologies</span>
            <span aria-hidden className="text-ink-300 dark:text-white/30">·</span>
            <a href="https://dalansoft.com" target="_blank" rel="noreferrer" className="hover:text-brand-600 dark:hover:text-brand-300 transition-colors">dalansoft.com</a>
            <span aria-hidden className="text-ink-300 dark:text-white/30">·</span>
            <a href="mailto:info@dalansoft.com" className="hover:text-brand-600 dark:hover:text-brand-300 transition-colors">info@dalansoft.com</a>
          </span>
          <span className="text-right truncate">
            {entries.length} patient{entries.length === 1 ? '' : 's'} in today's queue
          </span>
        </div>
      </footer>
    </div>
  );
}
