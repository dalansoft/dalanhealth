import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { demoClinics } from '@/services/demoData';
import { inr } from '@/lib/format';

export function AdminClinics() {
  const [q, setQ] = useState('');
  const filtered = demoClinics.filter((c) => `${c.name} ${c.city}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <Input leftIcon={<Search size={14} />} placeholder="Search clinic or city" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button leftIcon={<Plus size={14} />}>Onboard new clinic</Button>
        </div>
      </Card>

      <Card padded={false}>
        <div className="overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 dark:bg-ink-900/60">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="px-5 py-3">Clinic</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3 text-right">Wallet</th>
                <th className="px-5 py-3 text-right">Patients today</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3.5 font-medium text-ink-900 dark:text-ink-50">{c.name}</td>
                  <td className="px-5 py-3.5 text-muted">{c.city}</td>
                  <td className="px-5 py-3.5"><Badge tone={c.plan === 'Growth' ? 'brand' : 'neutral'} size="sm">{c.plan}</Badge></td>
                  <td className="px-5 py-3.5 text-right">{inr(c.wallet)}</td>
                  <td className="px-5 py-3.5 text-right">{c.patientsToday}</td>
                  <td className="px-5 py-3.5"><Badge tone={c.status === 'Active' ? 'success' : 'warning'} size="sm">{c.status}</Badge></td>
                  <td className="px-5 py-3.5 text-right"><Button variant="ghost" size="sm">Open</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
