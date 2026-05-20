import { Gift, ArrowDownCircle, ArrowUpCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { demoPatient } from '@/services/demoData';
import { inr } from '@/lib/format';

const tx = [
  { date: 'Today', type: 'earn' as const, amount: 0.5, note: 'Doctor promo · Dr. Sharma' },
  { date: 'Yesterday', type: 'earn' as const, amount: 0.1, note: 'Normal booking' },
  { date: '12 Jan', type: 'use' as const, amount: 0.5, note: 'Adjusted on booking ₹1' },
  { date: '8 Jan', type: 'earn' as const, amount: 1, note: 'First booking reward' },
];

export function PatientWallet() {
  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-gradient-to-br from-accent-500 to-brand-500 p-5 text-white shadow-glow">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-wider opacity-90">DalanHealth Rewards Wallet</div>
          <Gift size={16} />
        </div>
        <div className="mt-2 text-4xl font-bold">{inr(demoPatient.walletBalance)}</div>
        <div className="mt-1 text-xs opacity-90">For booking-fee adjustment only · max 50% per booking</div>
      </motion.div>

      <div className="rounded-2xl border hairline bg-warning-500/5 p-4 flex gap-3 items-start">
        <Info size={14} className="text-warning-500 shrink-0 mt-0.5" />
        <div className="text-xs text-ink-700 dark:text-ink-200">
          Cashback is not withdrawable. You can use up to 50% of any booking fee. On a ₹1 booking, max ₹0.50 is applied — you pay the remaining ₹0.50.
        </div>
      </div>

      <Card padded={false}>
        <CardHeader className="px-5 pt-5 pb-3">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardSubtitle>Earned and used cashback</CardSubtitle>
          </div>
        </CardHeader>
        <div className="divide-y hairline">
          {tx.map((t, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {t.type === 'earn'
                  ? <ArrowUpCircle size={16} className="text-success-500" />
                  : <ArrowDownCircle size={16} className="text-brand-500" />
                }
                <div>
                  <div className="text-sm font-medium text-ink-900 dark:text-ink-50">{t.note}</div>
                  <div className="text-[11px] text-muted">{t.date}</div>
                </div>
              </div>
              <Badge tone={t.type === 'earn' ? 'success' : 'brand'} size="sm">
                {t.type === 'earn' ? '+' : '−'} {inr(t.amount)}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
