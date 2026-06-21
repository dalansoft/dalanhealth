import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, CheckCircle2, ChevronDown, ClipboardList, DoorOpen, Globe,
  Hourglass, Link2, Mail, MessageSquare, Phone, QrCode, UserPlus, Volume2,
} from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';

/* ────────────────────────────────────────────────────────────────────────────
   Animated product story for the homepage. Three acts, all self-playing:
   1. TokenMergeShowcase   — QR / Offline / Online sources feed ONE token list
   2. CompounderShowcase   — the compounder's day, step by step
   3. PatientJourneyShowcase — what arrives on the patient's phone
   ──────────────────────────────────────────────────────────────────────────── */

const NAMES = ['Ramesh Jha', 'Pooja Sharma', 'Aman Kumar', 'Neha Singh', 'Saurabh Singh', 'Anjali Devi', 'Vikas Sah', 'Kiran Bala'];

// ─── Act 1: three sources, one queue ────────────────────────────────────────

const SOURCES = [
  {
    key: 'QR' as const,
    icon: QrCode,
    title: 'QR Scan Token',
    desc: 'Patient scans the clinic QR — works within a 100 m radius of the clinic or hospital.',
    chip: 'text-accent-600 dark:text-accent-300 bg-accent-500/15',
    ring: 'ring-accent-500/60',
  },
  {
    key: 'OFFLINE' as const,
    icon: UserPlusIcon(),
    title: 'Offline Token',
    desc: 'Booked at the desk by the compounder, receptionist, doctor or any staff.',
    chip: 'text-brand-600 dark:text-brand-300 bg-brand-500/15',
    ring: 'ring-brand-500/60',
  },
  {
    key: 'ONLINE' as const,
    icon: Globe,
    title: 'Online Token',
    desc: 'From the website or the Dalan Health mobile app — book from home.',
    chip: 'text-token bg-token/15',
    ring: 'ring-token/60',
  },
];

// lucide's UserPlus referenced via a helper so the SOURCES literal stays tidy.
function UserPlusIcon() { return UserPlus; }

export function TokenMergeShowcase() {
  // Start at 3 so the queue renders all 4 rows from the first paint —
  // rows growing in one by one changed the page height under the reader.
  const [tick, setTick] = useState(3);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, []);

  const activeIdx = tick % 3;
  // The unified list: newest token on top, derived purely from the tick.
  const rows = Array.from({ length: 4 }, (_, i) => tick - i)
    .filter((n) => n >= 0)
    .map((n) => ({ token: 21 + n, name: NAMES[n % NAMES.length], src: SOURCES[n % 3] }));

  return (
    <Section
      id="how-it-works-home"
      eyebrow="How it works for clinics & hospitals"
      title={<>Three ways in. <span className="gradient-text">One token list.</span></>}
      description="QR scans, walk-ins and online bookings don't fight for position — every patient lands in the same live queue, in order."
    >
      <div className="max-w-4xl mx-auto">
        {/* Sources */}
        <div className="grid sm:grid-cols-3 gap-4">
          {SOURCES.map((s, i) => {
            const active = i === activeIdx;
            return (
              <motion.div
                key={s.key}
                animate={{ scale: active ? 1.03 : 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className={`relative rounded-2xl glass p-5 text-center transition-shadow ${active ? `ring-2 ${s.ring} shadow-glow` : ''}`}
              >
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${s.chip}`}>
                  <s.icon size={20} />
                </span>
                <h3 className="mt-3 text-base font-semibold text-ink-900 dark:text-ink-50">{s.title}</h3>
                <p className="mt-1 text-xs text-muted">{s.desc}</p>
                {/* Token chip "emitted" by the active source — keyed remount,
                    fades itself out at the end of its keyframes. */}
                {active && (
                  <motion.span
                    key={tick}
                    initial={{ opacity: 0, y: 0, scale: 0.7 }}
                    animate={{ opacity: [0, 1, 1, 0], y: 34, scale: 1 }}
                    transition={{ duration: 1.6, ease: 'easeIn' }}
                    className={`absolute left-1/2 -translate-x-1/2 -bottom-3 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.chip}`}
                  >
                    #{21 + tick}
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Merge arrows */}
        <div aria-hidden className="flex justify-center py-3">
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
            <ChevronDown className="text-brand-500" size={22} />
          </motion.div>
        </div>

        {/* Unified queue */}
        <div className="rounded-[24px] border hairline glass-strong p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.3em] font-semibold text-brand-600 dark:text-brand-300">
              Unified Token List
            </div>
            <Badge tone="success" pulse size="sm">Live</Badge>
          </div>
          {/* Plain keyed render (no exit animations): rows leave the DOM the
              moment they fall off the list, so the loop can never accumulate
              stale rows. New rows still animate in via initial/animate. */}
          <div className="mt-3 space-y-2">
            {rows.map((r) => (
              <motion.div
                key={r.token}
                layout
                initial={{ opacity: 0, y: -14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="flex items-center gap-3 rounded-xl border hairline bg-white/60 dark:bg-ink-900/50 px-3 py-2.5"
              >
                <span className="w-12 text-center text-lg font-extrabold tabular-nums font-brand text-ink-900 dark:text-ink-50">
                  #{r.token}
                </span>
                <span className="flex-1 text-sm font-medium text-ink-800 dark:text-ink-100 truncate">{r.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.src.chip}`}>{r.src.key}</span>
              </motion.div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-muted">
            Sequential numbers across all three sources — no patient ever loses their place.
          </p>
        </div>
      </div>
    </Section>
  );
}

// ─── Act 2: the compounder's workflow ───────────────────────────────────────

const COMP_STEPS = [
  { icon: ClipboardList, title: 'Book the token', desc: 'Name and mobile number — five seconds at the desk.' },
  { icon: Hourglass, title: 'Patient waits with a live estimate', desc: 'Token and expected time on the phone, the TV and at reception.' },
  { icon: Volume2, title: 'Compounder calls — the TV speaks', desc: 'Name announced aloud in हिन्दी • English • भोजपुरी.' },
  { icon: DoorOpen, title: 'Patient walks to the chamber', desc: 'No shouting across the room, no register checks.' },
  { icon: Camera, title: 'Prescription photo uploaded', desc: 'One photo after the consultation — saved to the patient\'s record in the app.' },
  { icon: CheckCircle2, title: 'Done', desc: 'Visit completed; the next patient is called automatically.' },
];

function CompounderVignette({ step, beat }: { step: number; beat: number }) {
  switch (step) {
    case 0:
      return (
        <div className="w-full max-w-xs space-y-2.5">
          <div className="text-[10px] uppercase tracking-wider text-muted">New patient</div>
          <div className="rounded-xl border hairline bg-white/70 dark:bg-ink-900/60 px-3 py-2.5 text-sm text-ink-800 dark:text-ink-100">Ramesh Jha</div>
          <div className="rounded-xl border hairline bg-white/70 dark:bg-ink-900/60 px-3 py-2.5 text-sm text-ink-800 dark:text-ink-100">+91 98765 43210</div>
          <motion.div
            animate={{ scale: [1, 0.96, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="rounded-xl bg-brand-600 text-white text-center text-sm font-semibold py-2.5 shadow-glow"
          >
            Generate Token
          </motion.div>
        </div>
      );
    case 1:
      return (
        <div className="text-center">
          <div className="text-6xl font-extrabold font-brand text-brand-600 dark:text-brand-300">#14</div>
          <div className="mt-2 text-sm font-semibold text-ink-900 dark:text-ink-50">Ramesh Jha</div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-warning-500/15 text-warning-700 dark:text-warning-300 px-3 py-1 text-xs font-bold">
            <Hourglass size={12} /> ~25 min · 4 ahead
          </div>
        </div>
      );
    case 2:
      return (
        <div className="text-center">
          <div className="mx-auto w-44 rounded-lg bg-navy-950 p-2.5 text-white shadow-2xl">
            <div className="text-[8px] uppercase tracking-[0.25em] text-token">Now serving</div>
            <div className="text-2xl font-extrabold text-token">#14</div>
            <div className="text-[10px]">Ramesh Jha</div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ scaleY: [0.4, 1.4, 0.4] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                className="inline-block h-4 w-1 rounded-full bg-token origin-center"
              />
            ))}
            <span className="ml-2 text-xs font-semibold text-ink-800 dark:text-ink-100">हिन्दी • English • भोजपुरी</span>
          </div>
        </div>
      );
    case 3:
      return (
        <div className="flex items-center gap-4">
          <motion.span
            animate={{ x: [0, 26, 26], opacity: [1, 1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300 text-lg"
          >
            🚶
          </motion.span>
          <DoorOpen size={44} className="text-ink-700 dark:text-ink-200" />
          <span className="text-sm font-semibold text-ink-800 dark:text-ink-100">Doctor's chamber</span>
        </div>
      );
    case 4:
      return (
        <div className="w-full max-w-xs">
          <div className="rounded-xl border hairline bg-white/70 dark:bg-ink-900/60 p-4 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/15 text-accent-600 dark:text-accent-300">
              <Camera size={18} />
            </span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">prescription_14.jpg</div>
              <div className="mt-1.5 h-1.5 rounded-full bg-ink-200 dark:bg-ink-700 overflow-hidden">
                <motion.div
                  key={beat}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.8, ease: 'easeInOut' }}
                  className="h-full rounded-full bg-brand-600"
                />
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-muted">Uploaded to the patient's record</p>
        </div>
      );
    default:
      return (
        <div className="text-center">
          <motion.span
            initial={{ scale: 0.5 }}
            animate={{ scale: [0.5, 1.15, 1] }}
            transition={{ duration: 0.6 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-500/15 text-success-600 dark:text-success-500"
          >
            <CheckCircle2 size={34} />
          </motion.span>
          <div className="mt-3 text-sm font-semibold text-ink-900 dark:text-ink-50">Visit completed</div>
          <div className="text-xs text-muted">Next patient called automatically</div>
        </div>
      );
  }
}

export function CompounderShowcase() {
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setBeat((b) => b + 1), 2600);
    return () => clearInterval(id);
  }, []);
  const active = beat % COMP_STEPS.length;

  return (
    <Section
      eyebrow="Compounder workflow"
      title={<>The compounder's day, <span className="gradient-text">on autopilot.</span></>}
      description="From booking the token to uploading the prescription — watch one patient go through."
    >
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Steps */}
        <ol className="space-y-2">
          {COMP_STEPS.map((s, i) => {
            const isActive = i === active;
            const isDone = i < active;
            return (
              <li
                key={s.title}
                className={`flex items-start gap-3 rounded-2xl border px-4 py-3 transition-all ${
                  isActive
                    ? 'border-brand-500/50 bg-brand-500/10 dark:bg-brand-500/15 shadow-glow'
                    : 'hairline bg-white/50 dark:bg-ink-900/40'
                }`}
              >
                <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  isDone
                    ? 'bg-success-500/15 text-success-600 dark:text-success-500'
                    : isActive
                    ? 'bg-brand-500/20 text-brand-600 dark:text-brand-300'
                    : 'bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400'
                }`}>
                  {isDone ? <CheckCircle2 size={15} /> : <s.icon size={15} />}
                </span>
                <div className="min-w-0">
                  <div className={`text-sm font-semibold ${isActive ? 'text-ink-900 dark:text-ink-50' : 'text-ink-700 dark:text-ink-200'}`}>
                    {i + 1}. {s.title}
                  </div>
                  <div className="text-xs text-muted">{s.desc}</div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Stage */}
        <div className="rounded-[24px] border hairline glass-strong min-h-[280px] flex items-center justify-center p-8 relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-brand-500/15 blur-3xl" />
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full flex justify-center"
            >
              <CompounderVignette step={active} beat={beat} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

// ─── Act 3: the patient's phone ─────────────────────────────────────────────

const PATIENT_MSGS = [
  {
    tone: 'border-brand-500/40 bg-brand-500/10',
    head: 'Token booked ✅',
    body: 'Token #14 at Sharma Clinic — Dr. Anil Sharma. We\'ll keep you posted.',
  },
  {
    tone: 'border-token/40 bg-token/10',
    head: 'Track your token live 🔴',
    body: 'dalanhealth.com/t/x7k2 — 4 ahead · ~25 min. Walk in just before your turn.',
    link: true,
  },
  {
    tone: 'border-accent-500/40 bg-accent-500/10',
    head: 'Thank you! 🙏',
    body: 'Hope you feel better soon. Your prescription is attached to your visit record.',
  },
];

export function PatientJourneyShowcase() {
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setBeat((b) => b + 1), 2000);
    return () => clearInterval(id);
  }, []);
  // 0..2 = messages appearing, 3 = hold, then loop.
  const phase = beat % 5;
  const visible = Math.min(phase + 1, PATIENT_MSGS.length);

  return (
    <Section
      eyebrow="Patient experience"
      title={<>The patient never asks <span className="gradient-text">"kitna time lagega?"</span></>}
      description="Booking confirmation, a live tracking link, and a thank-you — delivered automatically."
      className="pb-24"
    >
      <div className="max-w-md mx-auto">
        {/* Channels */}
        <div className="flex justify-center gap-2 mb-5">
          {[
            { icon: MessageSquare, label: 'SMS' },
            { icon: Phone, label: 'WhatsApp' },
            { icon: Mail, label: 'Email' },
          ].map((c) => (
            <span key={c.label} className="inline-flex items-center gap-1.5 rounded-full border hairline bg-white/60 dark:bg-ink-900/50 px-3 py-1 text-xs font-semibold text-ink-700 dark:text-ink-200">
              <c.icon size={12} /> {c.label}
            </span>
          ))}
        </div>

        {/* Phone */}
        <div className="rounded-[28px] border-[6px] border-ink-900 dark:border-black bg-ink-50 dark:bg-navy-950 shadow-2xl overflow-hidden">
          <div className="bg-white/70 dark:bg-ink-900/70 backdrop-blur px-4 py-2.5 border-b hairline flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300 text-[10px] font-extrabold">DH</span>
            <div>
              <div className="text-xs font-semibold text-ink-900 dark:text-ink-50">Dalan Health</div>
              <div className="text-[10px] text-muted">Token updates</div>
            </div>
          </div>
          {/* Fixed height (not min-h): the looping typing indicator must never
              change the page height, or the footer visibly jumps. */}
          <div className="p-4 space-y-2.5 h-[300px] overflow-hidden">
            {/* Keyed remount per cycle (no exit animations — see queue note). */}
            {PATIENT_MSGS.slice(0, visible).map((m, i) => (
              <motion.div
                key={`${Math.floor(beat / 5)}-${i}`}
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className={`rounded-2xl rounded-tl-sm border px-3.5 py-2.5 ${m.tone}`}
              >
                <div className="text-xs font-bold text-ink-900 dark:text-ink-50">{m.head}</div>
                <div className={`mt-0.5 text-xs leading-relaxed ${m.link ? 'text-brand-600 dark:text-brand-300' : 'text-ink-700 dark:text-ink-200'}`}>
                  {m.link && <Link2 size={11} className="inline mr-1 -mt-0.5" />}
                  {m.body}
                </div>
              </motion.div>
            ))}
            {phase < PATIENT_MSGS.length - 1 && (
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="inline-flex items-center gap-1 rounded-full bg-ink-200/70 dark:bg-ink-800/70 px-3 py-1.5"
              >
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-1.5 w-1.5 rounded-full bg-ink-500 dark:bg-ink-400" />
                ))}
              </motion.div>
            )}
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-muted">
          Each message carries a unique live-token link — no app needed to track.
        </p>
      </div>
    </Section>
  );
}
