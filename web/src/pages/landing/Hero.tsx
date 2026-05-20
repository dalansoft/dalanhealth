import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, Sparkles, Activity, QrCode, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SourceBadge } from '@/components/ui/SourceBadge';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-50" />
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-[820px] rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-24 h-[420px] w-[420px] rounded-full bg-accent-500/20 blur-3xl" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 md:pt-24 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Badge tone="brand" icon={<Sparkles size={11} />}>Bihar-first healthcare OS</Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-ink-900 dark:text-ink-50"
          >
            Smarter clinic.<br />Faster queue.<br />
            <span className="gradient-text">Better patient experience.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-xl text-base sm:text-lg text-muted"
          >
            DalanHealth combines clinic management, QR queue, online booking, live token tracking,
            billing and patient engagement into one intelligent ecosystem — built for the realities of Indian clinics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/demo"><Button size="lg" rightIcon={<ArrowRight size={16} />}>Explore live demo</Button></Link>
            <Link to="/signup"><Button size="lg" variant="outline">Book a demo call</Button></Link>
            <a href="#features" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted hover:text-ink-900 dark:hover:text-ink-50">
              <PlayCircle size={16} /> Watch product tour
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center gap-5 text-xs text-muted"
          >
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-success-500" /> 124 clinics live</div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> 38K+ patients served</div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent-500" /> Realtime queue updates</div>
          </motion.div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative h-[520px]"
    >
      {/* Dashboard card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-0 top-8 w-[88%] glass-strong rounded-3xl p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted">Today's queue</div>
            <div className="mt-1 text-lg font-semibold text-ink-900 dark:text-ink-50">Sharma ENT Clinic</div>
          </div>
          <Badge tone="success" pulse>Live</Badge>
        </div>
        <div className="mt-4 space-y-2">
          {[
            { t: 1, n: 'Shailesh', src: 'ONLINE' as const, st: 'Consultation' },
            { t: 2, n: 'Raj', src: 'OFFLINE' as const, st: 'Up next' },
            { t: 3, n: 'Saurabh', src: 'QR' as const, st: 'Waiting' },
          ].map((e, i) => (
            <motion.div
              key={e.t}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center justify-between rounded-xl border hairline bg-white/60 dark:bg-ink-900/60 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-brand-500/15 text-brand-700 dark:text-brand-300 flex items-center justify-center font-semibold">#{e.t}</div>
                <div>
                  <div className="text-sm font-medium text-ink-900 dark:text-ink-50">{e.n}</div>
                  <div className="mt-0.5"><SourceBadge source={e.src} /></div>
                </div>
              </div>
              <Badge tone={e.st === 'Consultation' ? 'success' : e.st === 'Up next' ? 'brand' : 'neutral'} pulse={e.st === 'Consultation'}>{e.st}</Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Patient mobile card */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute right-0 bottom-2 w-[260px] glass-strong rounded-[28px] p-4 shadow-2xl"
      >
        <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 p-4 text-white">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider opacity-90"><Ticket size={12} /> Your token</div>
          <div className="mt-1 text-3xl font-bold">#18</div>
          <div className="mt-3 text-[11px] opacity-90">Running token <span className="font-semibold">#12</span> · ~38 min</div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/70 dark:bg-ink-900/60 p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted">Doctor till</div>
            <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">2:00 PM</div>
          </div>
          <div className="rounded-xl bg-white/70 dark:bg-ink-900/60 p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted">Est. consult</div>
            <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">1:10 PM</div>
          </div>
        </div>
      </motion.div>

      {/* QR float card */}
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-6 -bottom-2 w-[180px] glass-strong rounded-2xl p-4 shadow-xl"
      >
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted">
          <QrCode size={12} /> Scan to join queue
        </div>
        <div className="mt-2 grid grid-cols-5 grid-rows-5 gap-0.5 p-1">
          {Array.from({ length: 25 }).map((_, i) => (
            <span key={i} className={`rounded-[2px] ${[0, 2, 3, 4, 6, 7, 9, 12, 14, 16, 18, 21, 24].includes(i % 25) ? 'bg-ink-900 dark:bg-ink-100' : 'bg-transparent'}`} />
          ))}
        </div>
      </motion.div>

      {/* Live activity pill */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute right-8 top-0 glass rounded-full px-3 py-1.5 text-[11px] font-medium flex items-center gap-2"
      >
        <Activity size={12} className="text-brand-500" /> Realtime sync · WebSocket
      </motion.div>
    </motion.div>
  );
}
