import { motion } from 'framer-motion';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Clock, Users, Frown, EyeOff, AlertCircle, Shuffle, ArrowRight } from 'lucide-react';

const problems = [
  { icon: <Users size={18} />, title: 'Manual queue', desc: 'Tokens scribbled on paper, lost slips, frequent disputes.' },
  { icon: <Clock size={18} />, title: 'Long waiting', desc: 'Patients sit for hours with no idea when their turn comes.' },
  { icon: <EyeOff size={18} />, title: 'No transparency', desc: 'Doctor running late? Patient finds out only on arrival.' },
  { icon: <Frown size={18} />, title: 'Patient frustration', desc: 'Repeat visits abandoned, walk-outs, negative reviews.' },
  { icon: <Shuffle size={18} />, title: 'Online/offline confusion', desc: 'Two queues. Mismanaged. Receptionist juggles both.' },
  { icon: <AlertCircle size={18} />, title: 'No follow-up', desc: 'Patient leaves and is never reminded to come back.' },
];

export function ProblemSolution() {
  return (
    <Section
      eyebrow="The reality of Tier-2/3 clinics"
      title="Healthcare in Bihar isn't broken. It just needs the right system."
      description="Existing software assumes metro-style slot booking. We built DalanHealth for how clinics actually run."
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {problems.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card hover className="h-full">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-danger-500/10 text-danger-500 flex items-center justify-center">{p.icon}</div>
                <h3 className="font-semibold text-ink-900 dark:text-ink-50">{p.title}</h3>
              </div>
              <p className="mt-3 text-sm text-muted">{p.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12"
      >
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 glass-strong">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-500/10 via-transparent to-accent-500/10" />
          <div className="grid md:grid-cols-5 gap-6 items-center">
            <div className="md:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">The DalanHealth solution</div>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">One unified queue. One operating system.</h3>
              <p className="mt-3 text-sm text-muted">Offline walk-ins, online bookings and QR joins merge into a single sequential token list — visible to receptionist, doctor and patient in realtime.</p>
            </div>
            <div className="md:col-span-3">
              <Equation />
            </div>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

function Equation() {
  const Pill = ({ label, tone }: { label: string; tone: 'brand' | 'accent' | 'teal' }) => {
    const colors = {
      brand: 'from-brand-500 to-brand-600',
      accent: 'from-accent-500 to-accent-600',
      teal: 'from-teal-500 to-teal-600',
    };
    return (
      <div className={`flex-1 min-w-[100px] rounded-2xl p-4 text-center text-white bg-gradient-to-br ${colors[tone]} shadow-glow`}>
        <div className="text-[10px] uppercase tracking-wider opacity-90">Source</div>
        <div className="text-base font-semibold">{label}</div>
      </div>
    );
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Pill label="Offline" tone="teal" />
      <span className="text-2xl text-muted">+</span>
      <Pill label="Online" tone="brand" />
      <span className="text-2xl text-muted">+</span>
      <Pill label="QR" tone="accent" />
      <span className="text-2xl text-muted hidden md:inline-flex"><ArrowRight /></span>
      <div className="flex-1 min-w-[160px] rounded-2xl border hairline bg-white/70 dark:bg-ink-900/60 p-4 text-center">
        <div className="text-[10px] uppercase tracking-wider text-muted">One queue</div>
        <div className="text-base font-semibold text-ink-900 dark:text-ink-50">Sequential token</div>
      </div>
    </div>
  );
}
