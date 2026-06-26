import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, PlayCircle, Sparkles, Check, BellRing, Link2, MonitorPlay, UserPlus, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Real WebGL accent (Three.js) — lazy so it never ships with non-landing routes.
const HeroCanvas = lazy(() => import('@/components/visual/HeroCanvas'));

const TRUST_TICKS = ['QR Token Booking', 'Walk-In Patients', 'Online Appointments', 'TV Queue Display'];

// Deterministic particle field (no Math.random at render → stable rerenders).
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7.3 + 4) % 96}%`,
  top: `${58 + ((i * 13) % 38)}%`,
  size: 3 + (i % 3) * 2,
  dur: `${7 + (i % 5) * 2}s`,
  delay: `${(i % 7) * 1.2}s`,
  drift: `${((i % 3) - 1) * 28}px`,
  tone: i % 3 === 0 ? 'bg-token/50' : i % 3 === 1 ? 'bg-brand-500/50' : 'bg-accent-500/45',
}));

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center">
      {/* Drifting gradient + grid backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-50" />

      {/* WebGL liquid blob (teal→emerald), behind the glass product frame */}
      <Suspense fallback={null}>
        <HeroCanvas />
      </Suspense>
      <div className="gradient-drift pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-[820px] rounded-full bg-brand-500/20 blur-3xl -z-10" />
      <div className="gradient-drift pointer-events-none absolute top-40 -right-24 h-[420px] w-[420px] rounded-full bg-accent-500/20 blur-3xl -z-10" style={{ animationDelay: '-6s' }} />
      <div className="gradient-drift pointer-events-none absolute bottom-0 -left-24 h-[380px] w-[380px] rounded-full bg-token/15 blur-3xl -z-10" style={{ animationDelay: '-12s' }} />

      {/* Floating glow particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className={`particle ${p.tone}`}
          style={{
            left: p.left, top: p.top, width: p.size, height: p.size,
            ['--dur' as string]: p.dur, ['--delay' as string]: p.delay, ['--drift' as string]: p.drift,
          }}
        />
      ))}

      <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-14 md:pt-20 pb-20 grid lg:grid-cols-2 gap-12 items-center w-full">
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Badge tone="brand" icon={<Sparkles size={11} />}>Trusted by Modern Clinics Across India</Badge>
          </motion.div>

          {/* Staggered headline — fluid font size keeps each line on a single
              line at every viewport (nowrap + size derived from the column
              width instead of fixed breakpoint steps). */}
          <h1 className="mt-6 font-semibold tracking-tight leading-[1.08] text-ink-900 dark:text-ink-50 text-[min(7.3vw,3.4rem)] lg:text-[min(3.2vw,3rem)]">
            <motion.span initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="block whitespace-nowrap">
              Goodbye, Waiting Lines.
            </motion.span>
            <motion.span initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="block whitespace-nowrap gradient-text">
              Hello, Smart Clinic.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
            className="mt-6 max-w-xl text-base sm:text-lg text-muted"
          >
            One token system for walk-ins, QR scans and online bookings — a live queue on every
            phone, at reception, and on a waiting-room TV that calls patients by name.
          </motion.p>

          {/* Pricing highlight */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
            className="mt-6 inline-flex flex-col gap-1 rounded-2xl border border-token/30 bg-token/5 px-5 py-3"
          >
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
              ₹9 <span className="text-sm font-semibold text-ink-600 dark:text-ink-300">incl. GST</span>
              <span className="text-sm font-medium text-muted"> per visit</span>
            </span>
            <span className="text-[11px] text-muted">No Setup Fee • No Monthly Fee • No Annual Contract</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link to="/signup"><Button size="lg" rightIcon={<ArrowRight size={16} />}>Book Free Demo</Button></Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" leftIcon={<PlayCircle size={16} />}>Watch Live Queue Demo</Button>
            </Link>
          </motion.div>

          {/* Trust ticks */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            className="mt-8 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted"
          >
            {TRUST_TICKS.map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-success-500/15 text-success-600 dark:text-success-500">
                  <Check size={10} />
                </span>
                {t}
              </div>
            ))}
          </motion.div>
        </div>

        <ProductMovie />
      </div>
    </section>
  );
}

/* ─── Self-playing product movie ─────────────────────────────────────────────
   A screen-recording-style loop in a browser frame: token booked → queue
   moves → TV calls the patient → patient tracks live on the phone.
   Mouse parallax keeps the premium 3D feel. */

const SCENES = [
  { icon: UserPlus, label: 'Reception books a token in 5 seconds' },
  { icon: BellRing, label: 'The queue moves on its own' },
  { icon: MonitorPlay, label: 'The TV calls the patient by name' },
  { icon: Link2, label: 'The patient tracks it live — no app needed' },
];

function Scene({ scene }: { scene: number }) {
  switch (scene) {
    case 0: // Reception: add patient → token
      return (
        <div className="h-full flex flex-col justify-center px-6">
          <div className="text-[10px] uppercase tracking-wider text-muted">Reception · Add patient</div>
          <div className="mt-3 space-y-2">
            <div className="rounded-xl border hairline bg-white/70 dark:bg-ink-900/60 px-3 py-2.5 text-sm text-ink-800 dark:text-ink-100">Ramesh Jha</div>
            <div className="rounded-xl border hairline bg-white/70 dark:bg-ink-900/60 px-3 py-2.5 text-sm text-ink-800 dark:text-ink-100">+91 98765 43210</div>
          </div>
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 0.95, 1] }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mt-3 rounded-xl bg-brand-600 text-white text-center text-sm font-semibold py-2.5 shadow-glow"
          >
            Generate Token
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.3, type: 'spring', stiffness: 260, damping: 18 }}
            className="mt-3 self-center inline-flex items-center gap-2 rounded-full bg-token/15 text-token px-4 py-1.5 text-sm font-extrabold"
          >
            <Check size={14} /> Token #23 created
          </motion.div>
        </div>
      );
    case 1: // Live queue
      return (
        <div className="h-full flex flex-col justify-center px-6">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-wider text-muted">Live Queue · Sharma ENT Clinic</div>
            <Badge tone="success" pulse size="sm">Live</Badge>
          </div>
          <div className="mt-3 rounded-xl border border-token/30 bg-token/10 px-4 py-2.5 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-token font-bold">Now serving</span>
            <span className="text-2xl font-extrabold font-brand text-token">#21</span>
          </div>
          <div className="mt-2 space-y-1.5">
            {[
              { t: 22, n: 'Pooja Sharma', s: 'QR' },
              { t: 23, n: 'Ramesh Jha', s: 'OFFLINE' },
              { t: 24, n: 'Neha Singh', s: 'ONLINE' },
            ].map((r, i) => (
              <motion.div
                key={r.t}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.18 }}
                className="flex items-center gap-3 rounded-lg border hairline bg-white/60 dark:bg-ink-900/50 px-3 py-2"
              >
                <span className="w-9 text-center text-sm font-extrabold tabular-nums text-ink-900 dark:text-ink-50">#{r.t}</span>
                <span className="flex-1 text-xs font-medium text-ink-800 dark:text-ink-100 truncate">{r.n}</span>
                <span className="text-[9px] font-bold text-muted">{r.s}</span>
              </motion.div>
            ))}
          </div>
        </div>
      );
    case 2: // TV announcement
      return (
        <div className="h-full flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-[260px] rounded-xl bg-navy-950 p-4 text-white shadow-2xl">
            <div className="flex items-center justify-between text-[8px] text-white/60">
              <span>Sharma ENT Clinic</span>
              <span className="inline-flex items-center gap-1"><Volume2 size={8} /> ON</span>
            </div>
            <div className="mt-2 text-center">
              <div className="text-[9px] uppercase tracking-[0.3em] text-token">Now serving</div>
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="text-5xl font-extrabold text-token"
              >
                #23
              </motion.div>
              <div className="text-xs font-semibold mt-1">Ramesh Jha</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ scaleY: [0.4, 1.5, 0.4] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                className="inline-block h-4 w-1 rounded-full bg-token origin-center"
              />
            ))}
            <span className="ml-2 text-[11px] font-semibold text-ink-800 dark:text-ink-100">हिन्दी • English • भोजपुरी</span>
          </div>
        </div>
      );
    default: // Patient phone
      return (
        <div className="h-full flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-[250px] rounded-[20px] border-[5px] border-ink-900 dark:border-black bg-ink-50 dark:bg-navy-950 overflow-hidden shadow-2xl">
            <div className="bg-white/70 dark:bg-ink-900/70 px-3 py-2 border-b hairline text-[10px] font-semibold text-ink-900 dark:text-ink-50">Dalan Health</div>
            <div className="p-3 space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl rounded-tl-sm border border-token/40 bg-token/10 px-3 py-2"
              >
                <div className="text-[10px] font-bold text-ink-900 dark:text-ink-50">Track your token 🔴</div>
                <div className="mt-0.5 text-[10px] text-brand-600 dark:text-brand-300">
                  <Link2 size={9} className="inline mr-0.5 -mt-0.5" />dalanhealth.com/t/x7k2
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="rounded-xl bg-brand-600 p-3 text-white"
              >
                <div className="text-[9px] uppercase tracking-wider opacity-90">Your token</div>
                <div className="text-2xl font-bold">#23</div>
                <div className="text-[10px] opacity-90">Now serving #21 · ~12 min</div>
              </motion.div>
            </div>
          </div>
        </div>
      );
  }
}

function ProductMovie() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [beat, setBeat] = useState(0);
  const scene = beat % SCENES.length;

  useEffect(() => {
    const id = setInterval(() => setBeat((b) => b + 1), 3200);
    return () => clearInterval(id);
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setTilt({
      x: ((e.clientX - r.left) / r.width - 0.5) * 12,
      y: ((e.clientY - r.top) / r.height - 0.5) * -8,
    });
  };

  const SceneIcon = SCENES[scene].icon;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="relative block mt-2 lg:mt-0"
      style={{ perspective: 1200 }}
      aria-hidden
    >
      <motion.div
        animate={{ rotateY: tilt.x, rotateX: tilt.y, y: [0, -8, 0] }}
        transition={{
          rotateY: { type: 'spring', stiffness: 120, damping: 18 },
          rotateX: { type: 'spring', stiffness: 120, damping: 18 },
          y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Browser frame */}
        <div className="glass-strong rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b hairline bg-white/50 dark:bg-ink-900/50">
            <span className="h-2.5 w-2.5 rounded-full bg-danger-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success-500/70" />
            <span className="ml-3 flex-1 rounded-md bg-ink-100/80 dark:bg-ink-800/80 px-3 py-1 text-[10px] text-muted truncate">
              dalanhealth.com — your clinic, live
            </span>
            <Badge tone="success" pulse size="sm">LIVE</Badge>
          </div>

          {/* Stage */}
          <div className="relative h-[330px] bg-gradient-to-br from-brand-500/5 via-transparent to-token/5">
            <AnimatePresence mode="wait">
              <motion.div
                key={scene}
                initial={{ opacity: 0, x: 36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -36 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0"
              >
                <Scene scene={scene} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Caption + progress */}
          <div className="px-5 py-3.5 border-t hairline bg-white/50 dark:bg-ink-900/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={scene}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-ink-50"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-300">
                  <SceneIcon size={14} />
                </span>
                {SCENES[scene].label}
              </motion.div>
            </AnimatePresence>
            <div className="mt-2.5 flex items-center gap-1.5">
              {SCENES.map((_, i) => (
                <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i === scene ? 'w-8 bg-brand-500' : 'w-3 bg-ink-200 dark:bg-ink-700'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Glow under the frame */}
        <div aria-hidden className="pointer-events-none absolute -inset-6 -z-10 bg-gradient-to-b from-brand-500/15 via-accent-500/10 to-token/15 blur-2xl rounded-[40px]" />
      </motion.div>
    </motion.div>
  );
}
