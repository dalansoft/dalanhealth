import { useState } from 'react';
import { Save, Check, Layers, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { cn } from '@/lib/cn';
import { inr } from '@/lib/format';

const features = [
  { id: 'queue', label: 'Unified queue (offline + online + QR)', starter: true, growth: true },
  { id: 'billing', label: 'Billing & invoicing', starter: true, growth: true },
  { id: 'rx', label: 'Prescription builder', starter: true, growth: true },
  { id: 'reports', label: 'Basic reports', starter: true, growth: true },
  { id: 'staff2', label: '2 staff seats', starter: true, growth: false },
  { id: 'staffU', label: 'Unlimited staff seats', starter: false, growth: true },
  { id: 'docsU', label: 'Unlimited doctors', starter: false, growth: true },
  { id: 'analytics', label: 'Advanced analytics', starter: false, growth: true },
  { id: 'wa', label: 'WhatsApp + Push notifications', starter: false, growth: true },
  { id: 'cb', label: 'Cashback campaigns', starter: false, growth: true },
  { id: 'support', label: 'Priority support', starter: false, growth: true },
];

export function AdminPlans() {
  const [starterYearly, setStarterYearly] = useState(999);
  const [starterPerVisit, setStarterPerVisit] = useState(9);
  const [growthPerVisit, setGrowthPerVisit] = useState(12);
  const [bookingFee, setBookingFee] = useState(1);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Starter clinics" value="78" icon={<Layers size={16} />} accent="accent" />
        <StatCard label="Growth clinics" value="46" icon={<Sparkles size={16} />} accent="brand" />
        <StatCard label="Per-visit revenue (MTD)" value={inr(782_000)} accent="success" />
        <StatCard label="Annual revenue (MTD)" value={inr(78_000)} accent="warning" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <PricingForm
          name="Starter"
          tagline="Simple & affordable clinic management"
          tone="accent"
          fields={[
            { label: 'Yearly fee (₹)', value: starterYearly, set: setStarterYearly },
            { label: 'Per completed consultation (₹)', value: starterPerVisit, set: setStarterPerVisit },
          ]}
        />
        <PricingForm
          name="Growth"
          tagline="More patients. Better follow-up. Pro workflow."
          tone="brand"
          highlight
          fields={[
            { label: 'Per completed consultation (₹)', value: growthPerVisit, set: setGrowthPerVisit },
          ]}
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Feature matrix</CardTitle>
            <CardSubtitle>Per-plan capabilities. Wallet deduction triggers on consultation complete only.</CardSubtitle>
          </div>
        </CardHeader>
        <div className="overflow-x-auto rounded-xl border hairline">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-ink-50 dark:bg-ink-900/60">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="px-5 py-3">Feature</th>
                <th className="px-5 py-3 text-center">Starter</th>
                <th className="px-5 py-3 text-center">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {features.map((f) => (
                <tr key={f.id}>
                  <td className="px-5 py-3 text-ink-700 dark:text-ink-200">{f.label}</td>
                  <td className="px-5 py-3 text-center">{f.starter ? <Check size={14} className="text-success-500 inline" /> : <span className="text-muted">—</span>}</td>
                  <td className="px-5 py-3 text-center">{f.growth ? <Check size={14} className="text-success-500 inline" /> : <span className="text-muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Patient booking fee</CardTitle>
            <CardSubtitle>QR queue and offline walk-in stay free</CardSubtitle>
          </div>
        </CardHeader>
        <div className="max-w-xs">
          <Input label="App / home booking (₹)" type="number" value={bookingFee} onChange={(e) => setBookingFee(Number(e.target.value) || 0)} />
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-5 sm:-mx-8 px-5 sm:px-8 py-4 border-t hairline bg-white/80 dark:bg-ink-950/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto flex items-center justify-end gap-2">
          {saved && <Badge tone="success" pulse>Saved</Badge>}
          <Button leftIcon={<Save size={14} />} onClick={save}>Save pricing</Button>
        </div>
      </div>
    </div>
  );
}

function PricingForm({ name, tagline, fields, tone, highlight }: {
  name: string;
  tagline: string;
  tone: 'brand' | 'accent';
  highlight?: boolean;
  fields: { label: string; value: number; set: (n: number) => void }[];
}) {
  return (
    <Card className={cn('relative overflow-hidden', highlight && 'ring-1 ring-brand-500/40')}>
      <div className={cn('absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl', tone === 'brand' ? 'bg-brand-500/15' : 'bg-accent-500/15')} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <div className={cn('text-xs font-bold uppercase tracking-wider', tone === 'brand' ? 'text-brand-600 dark:text-brand-300' : 'text-accent-600 dark:text-accent-300')}>{name}</div>
            <div className="text-sm text-muted">{tagline}</div>
          </div>
          {highlight && <Badge tone="brand">Most popular</Badge>}
        </div>
        <div className="mt-4 space-y-3">
          {fields.map((f) => (
            <Input key={f.label} label={f.label} type="number" value={f.value} onChange={(e) => f.set(Number(e.target.value) || 0)} />
          ))}
        </div>
      </div>
    </Card>
  );
}
