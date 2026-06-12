import { useState } from 'react';
import { Plus, Gift, Sparkles, Calendar, Stethoscope } from 'lucide-react';
import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { demoCashbackCampaigns } from '@/services/demoData';
import { inr, num } from '@/lib/format';

const typeMeta: Record<string, { label: string; icon: React.ReactNode; tone: 'brand' | 'accent' | 'warning' | 'success' }> = {
  first_booking: { label: 'First booking', icon: <Sparkles size={12} />, tone: 'brand' },
  festival: { label: 'Festival', icon: <Calendar size={12} />, tone: 'warning' },
  doctor_promo: { label: 'Doctor promo', icon: <Stethoscope size={12} />, tone: 'accent' },
  normal: { label: 'Default', icon: <Gift size={12} />, tone: 'success' },
};

export function AdminCashback() {
  const [open, setOpen] = useState(false);
  const totalClaimed = demoCashbackCampaigns.reduce((s, c) => s + c.claimed * c.amount, 0);
  const totalUses = demoCashbackCampaigns.reduce((s, c) => s + c.claimed, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active campaigns" value={demoCashbackCampaigns.filter((c) => c.active).length} icon={<Gift size={16} />} accent="brand" />
        <StatCard label="Total claims" value={num(totalUses)} accent="success" />
        <StatCard label="Cashback issued (MTD)" value={inr(totalClaimed)} accent="accent" />
        <StatCard label="Cap per booking" value="50%" accent="warning" />
      </div>

      <Card className="bg-warning-500/5 border-warning-500/20">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-warning-500/15 text-warning-600 flex items-center justify-center"><Gift size={16} /></div>
          <div>
            <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">Cashback policy</div>
            <p className="mt-1 text-xs text-muted">
              Cashback is booking-fee adjustment only. Max 50% of the booking fee per use. Never withdrawable to bank or UPI.
              Enforced server-side in <code className="font-mono">cashback_service.compute_use()</code>.
            </p>
          </div>
        </div>
      </Card>

      <Card padded={false}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <CardTitle>Campaigns</CardTitle>
            <CardSubtitle>Toggle active/inactive, adjust per-claim amount</CardSubtitle>
          </div>
          <Button leftIcon={<Plus size={14} />} onClick={() => setOpen(true)}>New campaign</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-ink-50 dark:bg-ink-900/60">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="px-5 py-3">Campaign</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Scope</th>
                <th className="px-5 py-3 text-right">Per claim</th>
                <th className="px-5 py-3 text-right">Claims</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {demoCashbackCampaigns.map((c) => {
                const meta = typeMeta[c.type];
                return (
                  <tr key={c.id}>
                    <td className="px-5 py-3 font-medium text-ink-900 dark:text-ink-50">{c.name}</td>
                    <td className="px-5 py-3"><Badge tone={meta.tone} icon={meta.icon} size="sm">{meta.label}</Badge></td>
                    <td className="px-5 py-3 text-muted">{c.scope}</td>
                    <td className="px-5 py-3 text-right font-semibold">{inr(c.amount)}</td>
                    <td className="px-5 py-3 text-right">{num(c.claimed)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={c.active ? 'success' : 'neutral'} size="sm" pulse={c.active}>{c.active ? 'Active' : 'Paused'}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New cashback campaign" description="Stays inactive until you turn it on">
        <div className="space-y-3">
          <Input label="Name" placeholder="e.g. Diwali boost" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Per-claim amount (₹)" type="number" defaultValue={0.25} step={0.05} />
            <Input label="Scope" placeholder="All clinics / city / doctor" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
