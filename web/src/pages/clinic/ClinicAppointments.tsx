import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Phone, Ticket } from 'lucide-react';
import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { demoAppointments } from '@/services/demoData';
import { inr } from '@/lib/format';

const tabs = ['Today', 'Tomorrow', 'This week', 'All'] as const;

export function ClinicAppointments() {
  const [tab, setTab] = useState<typeof tabs[number]>('Today');

  const filtered = demoAppointments.filter((a) => {
    if (tab === 'Today') return a.when.startsWith('Today');
    if (tab === 'Tomorrow') return a.when.startsWith('Tomorrow');
    return true;
  });

  const todayCount = demoAppointments.filter((a) => a.when.startsWith('Today')).length;
  const tomorrowCount = demoAppointments.filter((a) => a.when.startsWith('Tomorrow')).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Today" value={todayCount} icon={<Calendar size={16} />} accent="brand" />
        <StatCard label="Tomorrow" value={tomorrowCount} icon={<Calendar size={16} />} accent="accent" />
        <StatCard label="Confirmed rate" value="92%" icon={<CheckCircle size={16} />} accent="success" />
        <StatCard label="Booking revenue (₹1 fee)" value={inr(demoAppointments.length)} accent="warning" />
      </div>

      <Card padded={false}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <CardTitle>Online appointments</CardTitle>
            <CardSubtitle>Each booking generates a unified-queue token on the day of visit</CardSubtitle>
          </div>
          <div className="inline-flex rounded-xl border hairline p-1 text-sm">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tab === t ? 'bg-brand-500 text-white' : 'text-muted hover:text-ink-900 dark:hover:text-ink-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-ink-50 dark:bg-ink-900/60">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="px-5 py-3">When</th>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Mobile</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3 text-right">Fee</th>
                <th className="px-5 py-3">Status</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {filtered.map((a, i) => (
                <motion.tr key={a.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                  <td className="px-5 py-3 font-medium text-ink-900 dark:text-ink-50">{a.when}</td>
                  <td className="px-5 py-3">{a.patient}</td>
                  <td className="px-5 py-3 text-muted inline-flex items-center gap-1.5 mt-2.5"><Phone size={12} />{a.mobile}</td>
                  <td className="px-5 py-3"><SourceBadge source={a.source} /></td>
                  <td className="px-5 py-3 text-right font-medium">{a.fee === 0 ? 'Free' : inr(a.fee)}</td>
                  <td className="px-5 py-3"><Badge tone={a.status === 'Confirmed' ? 'success' : 'brand'} size="sm">{a.status}</Badge></td>
                  <td className="px-5 py-3 text-right">
                    <Button size="sm" variant="ghost" leftIcon={<Ticket size={12} />}>Generate token</Button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-muted">No appointments in this range.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
