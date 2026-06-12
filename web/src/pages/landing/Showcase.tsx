import { motion } from 'framer-motion';
import { Ticket, Receipt, Wallet, BellRing } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { SourceBadge } from '@/components/ui/SourceBadge';

export function Showcase() {
  return (
    <Section
      eyebrow="See it in action"
      title="Premium experience, end to end."
      description="From the patient's first scan to the doctor's last prescription."
    >
      <div className="grid lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-2 relative rounded-3xl border hairline bg-white/70 dark:bg-ink-900/70 backdrop-blur p-6 overflow-hidden"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-500/8 via-transparent to-accent-500/8" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted">Live queue</div>
              <div className="mt-1 font-semibold text-ink-900 dark:text-ink-50">Sharma ENT Clinic · Patna</div>
            </div>
            <Badge tone="success" pulse>Realtime</Badge>
          </div>
          <div className="mt-5 overflow-x-auto rounded-2xl border hairline">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-ink-50 dark:bg-ink-900/60 text-ink-500 dark:text-ink-400">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Token</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Patient</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Source</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y hairline">
                {[
                  { t: 1, n: 'Shailesh', s: 'ONLINE' as const, st: 'Consultation' },
                  { t: 2, n: 'Raj', s: 'OFFLINE' as const, st: 'Up next' },
                  { t: 3, n: 'Saurabh', s: 'QR' as const, st: 'Waiting' },
                  { t: 4, n: 'Ramesh', s: 'OFFLINE' as const, st: 'Waiting' },
                ].map((r) => (
                  <tr key={r.t} className="hover:bg-ink-50/60 dark:hover:bg-ink-900/40">
                    <td className="px-4 py-3 font-semibold">#{r.t}</td>
                    <td className="px-4 py-3">{r.n}</td>
                    <td className="px-4 py-3"><SourceBadge source={r.s} /></td>
                    <td className="px-4 py-3"><Badge tone={r.st === 'Consultation' ? 'success' : r.st === 'Up next' ? 'brand' : 'neutral'} pulse={r.st === 'Consultation'}>{r.st}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-5"
        >
          {[
            { icon: <Ticket size={18} />, label: 'Live token tracking', val: '#18 · ~38 min', tone: 'brand' as const },
            { icon: <Receipt size={18} />, label: 'Today revenue', val: '₹8,600', tone: 'accent' as const },
            { icon: <Wallet size={18} />, label: 'Clinic wallet', val: '₹12,540', tone: 'success' as const },
            { icon: <BellRing size={18} />, label: 'Notifications sent', val: '184K MTD', tone: 'warning' as const },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border hairline bg-white/70 dark:bg-ink-900/70 backdrop-blur p-5 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${
                s.tone === 'brand' ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300' :
                s.tone === 'accent' ? 'bg-accent-500/15 text-accent-600 dark:text-accent-300' :
                s.tone === 'success' ? 'bg-success-500/15 text-success-600 dark:text-success-500' :
                'bg-warning-500/15 text-warning-600 dark:text-warning-500'
              }`}>{s.icon}</div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted">{s.label}</div>
                <div className="mt-0.5 text-lg font-semibold text-ink-900 dark:text-ink-50">{s.val}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
