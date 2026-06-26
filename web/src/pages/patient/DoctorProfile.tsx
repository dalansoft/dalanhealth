import { useNavigate, useParams } from 'react-router-dom';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { demoDoctors } from '@/services/demoData';
import { inr } from '@/lib/format';

export function DoctorProfile() {
  const { id } = useParams();
  const d = demoDoctors.find((x) => x.id === id) ?? demoDoctors[0];
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-gradient-to-br from-brand-500/15 via-transparent to-accent-500/15 border hairline p-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-brand-600 text-white font-semibold text-xl flex items-center justify-center shadow-glow">
            {d.name.split(' ')[1]?.[0] ?? 'D'}
          </div>
          <div>
            <div className="text-lg font-semibold text-ink-900 dark:text-ink-50">{d.name}</div>
            <div className="text-xs text-muted">{d.specialization}</div>
            <div className="mt-1 text-xs text-muted inline-flex items-center gap-1"><MapPin size={11} /> {d.clinic} · {d.city}</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        <Tile icon={<Clock size={14} />} label="Doctor timing" val={d.timing} />
        <Tile icon={<Calendar size={14} />} label="Current token" val={`#${d.currentToken}`} />
        <Tile icon={<Clock size={14} />} label="Approx wait" val={`~${d.approxWait} min`} />
      </div>

      <div className="rounded-2xl border hairline bg-white dark:bg-ink-900 p-4">
        <div className="text-xs uppercase tracking-wider text-muted">Consultation fee</div>
        <div className="text-2xl font-semibold text-ink-900 dark:text-ink-50">{inr(d.fee)}</div>
        <div className="mt-1 text-xs text-muted">+ ₹9 incl. GST booking fee</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button size="lg" onClick={() => navigate('/patient/queue')}>Join queue · Free</Button>
        <Button size="lg" variant="outline" onClick={() => navigate('/patient/queue')}>Book · ₹9 incl. GST</Button>
      </div>

      <div className="rounded-2xl border hairline bg-white dark:bg-ink-900 p-4">
        <div className="text-xs uppercase tracking-wider text-muted">About</div>
        <p className="mt-2 text-sm text-ink-700 dark:text-ink-200">
          15+ years of practice in {d.specialization.toLowerCase()}. Languages: Hindi, English, Bhojpuri.
          Accepts walk-ins, online bookings and QR join. <Badge tone="brand" size="sm">Verified</Badge>
        </p>
      </div>
    </div>
  );
}

const Tile = ({ icon, label, val }: { icon: React.ReactNode; label: string; val: string }) => (
  <div className="rounded-2xl border hairline bg-white dark:bg-ink-900 p-3">
    <div className="text-muted inline-flex items-center gap-1 text-[10px] uppercase tracking-wider">{icon} {label}</div>
    <div className="mt-1 text-sm font-semibold text-ink-900 dark:text-ink-50">{val}</div>
  </div>
);
