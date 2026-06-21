import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, ChevronUp, ChevronDown, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { demoPatient } from '@/services/demoData';

export function TokenTracking() {
  const [running, setRunning] = useState(demoPatient.runningToken);
  const yours = demoPatient.currentToken;
  const remaining = Math.max(0, yours - running);
  const status: 'Waiting' | 'Queue' | 'Consultation' = remaining > 1 ? 'Waiting' : remaining === 1 ? 'Queue' : 'Consultation';

  useEffect(() => {
    const id = setInterval(() => {
      setRunning((r) => Math.min(yours, r + (Math.random() > 0.7 ? 1 : 0)));
    }, 6000);
    return () => clearInterval(id);
  }, [yours]);

  const statusTone = status === 'Consultation' ? 'success' : status === 'Queue' ? 'brand' : 'neutral';

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-brand-600 text-white p-6 shadow-glow">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-wider opacity-90">{demoPatient.clinic}</div>
          <Badge tone={statusTone} pulse={status === 'Consultation'} className="bg-white/20 text-white ring-white/30">{status === 'Consultation' ? 'It is your turn' : status === 'Queue' ? 'Up next' : 'Waiting'}</Badge>
        </div>
        <div className="mt-3 flex items-end gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider opacity-90">Your token</div>
            <div className="text-6xl font-bold leading-none">#{yours}</div>
          </div>
          <div className="pb-2 grid grid-cols-2 gap-3 flex-1">
            <div className="rounded-2xl bg-white/15 p-3">
              <div className="text-[10px] uppercase tracking-wider opacity-90">Running</div>
              <motion.div key={running} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl font-semibold">#{running}</motion.div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3">
              <div className="text-[10px] uppercase tracking-wider opacity-90">Patients ahead</div>
              <div className="text-2xl font-semibold">{remaining}</div>
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-white/15 p-3">
            <div className="text-[10px] uppercase tracking-wider opacity-90">Approx wait</div>
            <div className="font-semibold">~{Math.max(0, remaining * 4)} min</div>
          </div>
          <div className="rounded-2xl bg-white/15 p-3">
            <div className="text-[10px] uppercase tracking-wider opacity-90">Doctor till</div>
            <div className="font-semibold">{demoPatient.doctorSittingTill}</div>
          </div>
        </div>
      </motion.div>

      <div className="rounded-2xl border hairline bg-white dark:bg-ink-900 p-4">
        <div className="text-xs uppercase tracking-wider text-muted">Doctor</div>
        <div className="mt-1 font-semibold text-ink-900 dark:text-ink-50">{demoPatient.doctor}</div>
        <div className="text-xs text-muted inline-flex items-center gap-1 mt-0.5"><MapPin size={11} /> {demoPatient.clinic}</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Tile icon={<Clock size={12} />} label="Expected consult" val={demoPatient.expectedConsultation} />
          <Tile icon={<Bell size={12} />} label="Notification" val="On" />
        </div>
      </div>

      <Steps remaining={remaining} />

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline">Cancel</Button>
        <Button>Get directions</Button>
      </div>
    </div>
  );
}

const Tile = ({ icon, label, val }: { icon: React.ReactNode; label: string; val: string }) => (
  <div className="rounded-xl border hairline p-3">
    <div className="text-[10px] uppercase tracking-wider text-muted inline-flex items-center gap-1">{icon} {label}</div>
    <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{val}</div>
  </div>
);

function Steps({ remaining }: { remaining: number }) {
  const labels = [
    { k: 'queue', label: 'In queue', done: true },
    { k: 'near', label: 'Coming soon', done: remaining <= 3 },
    { k: 'next', label: 'Up next', done: remaining <= 1 },
    { k: 'consult', label: 'Consultation', done: remaining === 0 },
  ];
  return (
    <div className="rounded-2xl border hairline bg-white dark:bg-ink-900 p-4">
      <div className="text-xs uppercase tracking-wider text-muted">Your journey</div>
      <div className="mt-3 space-y-2">
        {labels.map((l, i) => (
          <div key={l.k} className="flex items-center gap-3">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${l.done ? 'bg-brand-500 text-white' : 'bg-ink-100 dark:bg-ink-800 text-muted'}`}>{i + 1}</div>
            <div className={`text-sm ${l.done ? 'text-ink-900 dark:text-ink-50 font-medium' : 'text-muted'}`}>{l.label}</div>
            {l.done && i === labels.findIndex((x) => x.done && (!labels[labels.indexOf(x) + 1] || !labels[labels.indexOf(x) + 1].done)) && (
              <Badge tone="brand" size="sm">Current</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Tiny prevent-unused warnings
void ChevronUp; void ChevronDown;
