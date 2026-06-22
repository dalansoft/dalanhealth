import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowDownCircle, ArrowUpCircle, Users, Check } from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useWallet, visitsLeft, PER_VISIT_FEE, MIN_RECHARGE } from '@/store/wallet';
import { inr } from '@/lib/format';

const PRESETS = [1000, 3000, 5000];

export function ClinicWallet() {
  const balance = useWallet((s) => s.balance);
  const txns = useWallet((s) => s.txns);
  const recharge = useWallet((s) => s.recharge);
  const [open, setOpen] = useState(false);
  const low = balance < 1000;
  const covered = visitsLeft(balance);

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-500/15 via-transparent to-accent-500/15" />
          <CardHeader>
            <div>
              <CardTitle>Wallet balance</CardTitle>
              <CardSubtitle>Auto-deducts ₹{PER_VISIT_FEE} + GST per completed consultation (Growth plan)</CardSubtitle>
            </div>
            {low && <Badge tone="warning" pulse>Low balance</Badge>}
          </CardHeader>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
            {inr(balance)}
          </motion.div>
          <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted">
            <Users size={14} className="text-brand-600 dark:text-brand-300" />
            Covers <span className="font-semibold text-ink-800 dark:text-ink-100">{covered.toLocaleString('en-IN')}</span> more consultations
            <span className="text-ink-400">· {inr(balance)} ÷ ₹{PER_VISIT_FEE}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button leftIcon={<Plus size={14} />} onClick={() => setOpen(true)}>Recharge</Button>
            <Button variant="outline">View invoices</Button>
            <Button variant="ghost">Setup auto-recharge</Button>
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Thresholds</CardTitle></CardHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm"><span className="text-muted">Warning</span><span className="font-semibold">₹1,000</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-muted">Critical</span><span className="font-semibold text-danger-500">₹200</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-muted">Plan</span><Badge tone="brand" size="sm">Growth · ₹{PER_VISIT_FEE} + GST/visit</Badge></div>
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
            {txns.map((t) => (
              <tr key={t.id}>
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

      <RechargeModal open={open} onClose={() => setOpen(false)} onConfirm={(amt) => { recharge(amt); setOpen(false); }} />
    </div>
  );
}

function RechargeModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: (amount: number) => void }) {
  const [amount, setAmount] = useState(1000);
  const valid = amount >= MIN_RECHARGE;
  const visits = Math.floor((Number.isFinite(amount) ? amount : 0) / PER_VISIT_FEE);

  return (
    <Modal open={open} onClose={onClose} title="Recharge wallet" description={`Minimum ₹${MIN_RECHARGE.toLocaleString('en-IN')}. Every ₹${PER_VISIT_FEE} covers one consultation.`} size="sm">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(p)}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                amount === p
                  ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                  : 'hairline text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800'
              }`}
            >
              ₹{p.toLocaleString('en-IN')}
            </button>
          ))}
        </div>

        <div>
          <div className="mb-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide">Or enter an amount</div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">₹</span>
            <input
              type="number"
              inputMode="numeric"
              min={MIN_RECHARGE}
              step={500}
              value={Number.isNaN(amount) ? '' : amount}
              onChange={(e) => setAmount(Math.floor(Number(e.target.value) || 0))}
              className="w-full pl-7 pr-3 py-2.5 rounded-xl border hairline bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-ink-50 outline-none focus:border-brand-500/70 focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
          {!valid && <div className="mt-1.5 text-xs text-danger-500">Minimum recharge is ₹{MIN_RECHARGE.toLocaleString('en-IN')}.</div>}
        </div>

        <div className="rounded-xl border hairline bg-ink-50/60 dark:bg-ink-900/40 px-3 py-2.5 flex items-center gap-2 text-sm">
          <Users size={15} className="text-brand-600 dark:text-brand-300 shrink-0" />
          <span>
            Covers <span className="font-semibold text-ink-900 dark:text-ink-50">{visits.toLocaleString('en-IN')}</span> consultations
            <span className="text-muted"> · ₹{(valid ? amount : 0).toLocaleString('en-IN')} ÷ ₹{PER_VISIT_FEE}</span>
          </span>
        </div>

        <Button fullWidth leftIcon={<Check size={15} />} disabled={!valid} onClick={() => valid && onConfirm(amount)}>
          Recharge ₹{(valid ? amount : MIN_RECHARGE).toLocaleString('en-IN')}
        </Button>
      </div>
    </Modal>
  );
}
