import { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Search } from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { demoAllRecharges, demoClinics } from '@/services/demoData';
import { inr, inrCompact } from '@/lib/format';

export function AdminWallet() {
  const [q, setQ] = useState('');
  const totalWallet = demoClinics.reduce((s, c) => s + c.wallet, 0);
  const totalRecharge = demoAllRecharges.reduce((s, r) => r.status === 'Success' ? s + r.amount : s, 0);

  const filtered = demoAllRecharges.filter((r) => r.clinic.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total wallet (all clinics)" value={inrCompact(totalWallet)} icon={<Wallet size={16} />} accent="brand" />
        <StatCard label="Recharge today" value={inr(totalRecharge)} icon={<ArrowUpCircle size={16} />} accent="success" />
        <StatCard label="Deduction today (consults)" value={inr(312)} icon={<ArrowDownCircle size={16} />} accent="warning" />
        <StatCard label="Low-balance clinics" value="3" accent="danger" />
      </div>

      <Card padded={false}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <CardTitle>Recharge ledger</CardTitle>
            <CardSubtitle>Wallet top-ups across all clinics</CardSubtitle>
          </div>
          <div className="w-full sm:w-72">
            <Input leftIcon={<Search size={14} />} placeholder="Search clinic" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-ink-50 dark:bg-ink-900/60">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="px-5 py-3">When</th>
                <th className="px-5 py-3">Clinic</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3 text-muted">{r.when}</td>
                  <td className="px-5 py-3 font-medium text-ink-900 dark:text-ink-50">{r.clinic}</td>
                  <td className="px-5 py-3"><Badge tone="neutral" size="sm">{r.method}</Badge></td>
                  <td className={`px-5 py-3 text-right font-semibold ${r.status === 'Success' ? 'text-success-600 dark:text-success-500' : 'text-danger-500'}`}>
                    {r.status === 'Success' ? '+' : ''} {inr(r.amount)}
                  </td>
                  <td className="px-5 py-3"><Badge tone={r.status === 'Success' ? 'success' : 'danger'} size="sm">{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Wallet balance by clinic</CardTitle>
            <CardSubtitle>Sorted by current balance</CardSubtitle>
          </div>
        </CardHeader>
        <div className="space-y-2">
          {[...demoClinics].sort((a, b) => b.wallet - a.wallet).map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border hairline p-3">
              <div>
                <div className="text-sm font-medium text-ink-900 dark:text-ink-50">{c.name}</div>
                <div className="text-xs text-muted">{c.city} · {c.plan}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{inr(c.wallet)}</span>
                {c.wallet < 1000 && <Badge tone="warning" size="sm">Low</Badge>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
