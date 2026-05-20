import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartLeafMark } from '@/components/ui/Logo';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { useQueue } from '@/store/queue';
import { demoQueue, demoClinic } from '@/services/demoData';

/**
 * TV / kiosk display for the clinic waiting room.
 *
 * Locked to viewport height (h-screen + overflow-hidden) so the page
 * never scrolls — fits any display from a laptop to a wall-mounted TV.
 * The up-next list scrolls *internally* if it overflows, so the
 * surrounding layout stays visually intact.
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

  // Force dark mode for in-room legibility.
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.classList.contains('dark');
    root.classList.add('dark');
    return () => { if (!prev) root.classList.remove('dark'); };
  }, []);

  const current = entries[0];
  const upNext = entries.slice(1);

  // Time with seconds + uppercase AM/PM (e.g. "07:11:34 PM").
  const h24 = now.getHours();
  const hour12 = String(h24 % 12 || 12).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const time = `${hour12}:${minute}:${second} ${ampm}`;
  const date = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Split "10 AM – 2 PM, 5 PM – 8 PM" so each block can sit on its own side.
  const timingBlocks = demoClinic.timing.split(',').map((t) => t.trim()).filter(Boolean);

  return (
    <div className="h-screen w-screen overflow-hidden bg-navy-950 text-white relative flex flex-col">
      {/* Decorative gradient backdrop */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 h-[640px] w-[640px] rounded-full bg-token/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-40 h-[640px] w-[640px] rounded-full bg-brand-500/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-10" />

      {/* Header */}
      <header className="relative z-10 shrink-0 px-6 sm:px-10 lg:px-14 py-4 lg:py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3 lg:gap-4 min-w-0">
          <HeartLeafMark size={48} />
          <div className="min-w-0">
            <div className="text-xl lg:text-2xl xl:text-3xl font-extrabold tracking-tight font-brand truncate">{demoClinic.name}</div>
            <div className="text-xs lg:text-sm text-white/60 truncate">{demoClinic.doctor} · {demoClinic.specialization} · {demoClinic.city}</div>
          </div>
        </div>
        <div className="text-right shrink-0 ml-4">
          <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tabular-nums leading-none font-brand whitespace-nowrap">{time}</div>
          <div className="mt-1 text-xs lg:text-sm text-white/60">{date}</div>
        </div>
      </header>

      {/* Main — fixed height, never scrolls */}
      <main className="relative z-10 flex-1 min-h-0 px-6 sm:px-10 lg:px-14 py-6 lg:py-8 grid lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-8 overflow-hidden">
        {/* LEFT: Now serving + Doctor sitting */}
        <section className="rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl p-6 lg:p-8 flex flex-col relative overflow-hidden min-h-0">
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-br from-token/10 via-transparent to-brand-500/10" />

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
                    className="font-extrabold leading-none tracking-tight text-token drop-shadow-[0_0_60px_rgba(34,197,94,0.55)] font-brand"
                    style={{ fontSize: 'clamp(6rem, 22vh, 16rem)' }}
                  >
                    #{current.token}
                  </div>
                  <div className="mt-4 lg:mt-6 text-2xl lg:text-4xl xl:text-5xl font-bold text-white">{current.patientName}</div>
                  <div className="mt-2 lg:mt-3 flex items-center justify-center gap-3 text-white/70 text-sm lg:text-base">
                    <SourceBadge source={current.source} />
                    <span>Joined {current.joinedAt}</span>
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
                  className="text-white/40 text-2xl lg:text-3xl"
                >
                  Waiting for the next patient…
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Doctor sitting — beneath the "Please proceed" pill; two blocks split left + right */}
          <div className="mt-4 lg:mt-6 rounded-2xl border border-white/10 bg-white/[0.04] px-5 lg:px-8 py-3 lg:py-4 shrink-0">
            <div className="text-[10px] lg:text-xs uppercase tracking-wider text-white/60 text-center">Doctor sitting</div>
            <div className={`mt-1.5 flex items-center gap-4 lg:gap-10 ${timingBlocks.length >= 2 ? 'justify-between' : 'justify-center'}`}>
              {timingBlocks.map((t, i) => (
                <div key={i} className="text-lg lg:text-2xl font-bold tracking-tight whitespace-nowrap">{t}</div>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT: Up next — internally scrollable */}
        <section className="rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl p-5 lg:p-7 flex flex-col min-h-0 overflow-hidden">
          <div className="shrink-0 flex items-center justify-between mb-4">
            <div className="text-[10px] lg:text-xs uppercase tracking-[0.32em] text-brand-300 font-semibold">Up next</div>
            <span className="text-xs text-white/60">{upNext.length} waiting</span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2.5">
            <AnimatePresence initial={false}>
              {upNext.map((e, idx) => (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className={`flex items-center gap-4 rounded-2xl border border-white/10 p-3 lg:p-4 ${
                    idx === 0 ? 'bg-brand-500/15' : 'bg-white/[0.02]'
                  }`}
                >
                  <div className={`w-16 lg:w-20 text-center text-3xl lg:text-4xl xl:text-5xl font-extrabold tabular-nums leading-none font-brand ${
                    idx === 0 ? 'text-brand-300' : 'text-white/70'
                  }`}>
                    #{e.token}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base lg:text-lg xl:text-xl font-semibold text-white truncate">{e.patientName}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs lg:text-sm text-white/60">
                      <SourceBadge source={e.source} />
                      <span>Joined {e.joinedAt}</span>
                    </div>
                  </div>
                  {idx === 0 && (
                    <div className="hidden sm:block text-[10px] lg:text-xs uppercase tracking-wider text-brand-300 font-semibold shrink-0">Get ready</div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {upNext.length === 0 && (
              <div className="text-white/50 text-base lg:text-lg text-center py-10">No further patients in queue.</div>
            )}
          </div>
        </section>
      </main>

      {/* Footer / ticker */}
      <footer className="relative z-10 shrink-0 border-t border-white/10 bg-black/30 backdrop-blur">
        <div className="px-6 sm:px-10 lg:px-14 py-3 flex items-center justify-between text-xs lg:text-sm text-white/60">
          <span>Powered by <span className="font-brand font-bold text-white tracking-[0.18em]">DALAN HEALTH</span></span>
          <span>{entries.length} patient{entries.length === 1 ? '' : 's'} in today's queue</span>
        </div>
      </footer>
    </div>
  );
}
