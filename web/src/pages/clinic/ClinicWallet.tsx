import { motion } from 'framer-motion';
import { Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { demoClinic } from '@/services/demoData';
import { inr } from '@/lib/format';

const tx = [
  { date: 'Today, 12:42 PM', type: 'recharge' as const, amount: 5000, status: 'Success' },
  { date: 'Today, 12:30 PM', type: 'deduction' as const, amount: 12, status: 'Success', note: 'Consultation #14' },
  { date: 'Today, 12:11 PM', type: 'deduction' as const, amount: 12, status: 'Success', note: 'Consultation #13' },
  { date: 'Today, 11:54 AM', type: 'deduction' as const, amount: 12, status: 'Success', note: 'Consultation #12' },
  { date: 'Yesterday', type: 'recharge' as const, amount: 10000, status: 'Success' },
];

export function ClinicWallet() {
  const balance = demoClinic.walletBalance;
  const low = balance < 1000;
  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-500/15 via-transparent to-accent-500/15" />
          <CardHeader>
            <div>
                <CardTitle>Wallet balance</CardTitle>
                  <CardSubtitle>Auto-deducts 9rs+gst per completed consultation (Growth plan)</CardSubtitle>
            </div>
            {low && <Badge tone="warning" pulse>Low balance</Badge>}
          </CardHeader>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
            {inr(balance)}
          </motion.div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button leftIcon={<Plus size={14} />}>Recharge</Button>
            <Button variant="outline">View invoices</Button>
            <Button variant="ghost">Setup auto-recharge</Button>
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Thresholds</CardTitle></CardHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm"><span className="text-muted">Warning</span><span className="font-semibold">₹1,000</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-muted">Critical</span><span className="font-semibold text-danger-500">₹200</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-muted">Plan</span><Badge tone="brand" size="sm">Growth · 9rs+gst/visit</Badge></div>
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div className="px-5 py-4 border-b hairline">
          <CardTitle>Transaction history</CardTitle>
          <CardSubtitle>Recent activity</CardSubtitle>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-ink-50 dark:bg-ink-900/60">
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y hairline">
            {tx.map((t, i) => (
              <tr key={i}>
                <td className="px-5 py-3 text-muted">{t.date}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-2">
                    {t.type === 'recharge' ? <ArrowUpCircle size={14} className="text-success-500" /> : <ArrowDownCircle size={14} className="text-danger-500" />}
                    <span className="font-medium capitalize">{t.type}</span>
                    {t.note && <span className="text-muted">· {t.note}</span>}
                  </span>
                </td>
                <td className={`px-5 py-3 text-right font-semibold ${t.type === 'recharge' ? 'text-success-600 dark:text-success-500' : 'text-ink-900 dark:text-ink-50'}`}>
                  {t.type === 'recharge' ? '+' : '−'} {inr(t.amount)}
                </td>
                <td className="px-5 py-3"><Badge tone="success" size="sm">{t.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
