import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Ticket, MapPin, Gift, ArrowRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { demoPatient, demoDoctors, demoBookings } from '@/services/demoData';
import { inr } from '@/lib/format';

export function PatientHome() {
  const upcoming = demoBookings.find((b) => b.status === 'Upcoming');
  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted">Hello</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">{demoPatient.name}</h1>
      </div>

      <Link to="/patient/search" className="block">
        <div className="rounded-2xl border hairline bg-white/80 dark:bg-ink-900/80 p-4 flex items-center gap-3 text-sm text-muted">
          <Search size={16} /> Search doctor, clinic or specialization
        </div>
      </Link>

      {upcoming && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/patient/queue" className="block">
            <div className="rounded-3xl bg-brand-600 p-5 text-white shadow-glow">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-wider opacity-90">Your active token</div>
                <Badge tone="neutral" size="sm" className="bg-white/20 text-white ring-white/30">{upcoming.clinic}</Badge>
              </div>
              <div className="mt-2 flex items-end gap-3">
                <div className="text-5xl font-bold">#{demoPatient.currentToken}</div>
                <div className="pb-1">
                  <div className="text-xs opacity-90">Running token</div>
                  <div className="text-sm font-semibold">#{demoPatient.runningToken}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="opacity-90 flex items-center gap-1.5"><Clock size={12} /> ~{demoPatient.approxWaitMin} min</div>
                <div className="font-semibold flex items-center gap-1">View live <ArrowRight size={14} /></div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to="/patient/wallet" className="rounded-2xl border hairline bg-white/80 dark:bg-ink-900/80 p-4">
          <Gift size={16} className="text-accent-500" />
          <div className="mt-3 text-[10px] uppercase tracking-wider text-muted">Cashback wallet</div>
          <div className="text-xl font-semibold text-ink-900 dark:text-ink-50">{inr(demoPatient.walletBalance)}</div>
        </Link>
        <Link to="/patient/bookings" className="rounded-2xl border hairline bg-white/80 dark:bg-ink-900/80 p-4">
          <Ticket size={16} className="text-brand-500" />
          <div className="mt-3 text-[10px] uppercase tracking-wider text-muted">Bookings</div>
          <div className="text-xl font-semibold text-ink-900 dark:text-ink-50">{demoBookings.length} total</div>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-900 dark:text-ink-50">Doctors near you</h2>
          <Link to="/patient/search" className="text-xs font-medium text-brand-600 dark:text-brand-300">See all</Link>
        </div>
        <div className="mt-3 space-y-3">
          {demoDoctors.slice(0, 3).map((d) => (
            <Link key={d.id} to={`/patient/doctor/${d.id}`} className="block">
              <motion.div whileHover={{ scale: 1.005 }} className="rounded-2xl border hairline bg-white dark:bg-ink-900 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-600 dark:text-brand-300 font-semibold flex items-center justify-center">
                    {d.name.split(' ')[1]?.[0] ?? 'D'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{d.name}</div>
                    <div className="text-xs text-muted">{d.specialization} · {d.clinic}</div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-muted">
                      <span className="inline-flex items-center gap-1"><MapPin size={11} /> {d.city}</span>
                      <span className="inline-flex items-center gap-1"><Clock size={11} /> ~{d.approxWait} min</span>
                    </div>
                  </div>
                  <Badge tone="brand" size="sm">#{d.currentToken}</Badge>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
