import { useState } from 'react';
import { Headset, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { demoSupport } from '@/services/demoData';

const priorityTone: Record<string, 'danger' | 'warning' | 'neutral'> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'neutral',
};
const statusTone: Record<string, 'warning' | 'brand' | 'success'> = {
  Open: 'warning',
  'In progress': 'brand',
  Resolved: 'success',
};
const statuses = ['All', 'Open', 'In progress', 'Resolved'] as const;

export function AdminSupport() {
  const [filter, setFilter] = useState<typeof statuses[number]>('All');
  const filtered = demoSupport.filter((t) => filter === 'All' || t.status === filter);

  const open = demoSupport.filter((t) => t.status === 'Open').length;
  const inProgress = demoSupport.filter((t) => t.status === 'In progress').length;
  const resolved = demoSupport.filter((t) => t.status === 'Resolved').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Open tickets" value={open} icon={<AlertCircle size={16} />} accent="warning" />
        <StatCard label="In progress" value={inProgress} icon={<Clock size={16} />} accent="brand" />
        <StatCard label="Resolved today" value={resolved} icon={<CheckCircle size={16} />} accent="success" />
        <StatCard label="Avg first response" value="14 min" icon={<Headset size={16} />} accent="accent" />
      </div>

      <Card padded={false}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <CardTitle>Support inbox</CardTitle>
            <CardSubtitle>Issues raised by clinics</CardSubtitle>
          </div>
          <div className="inline-flex rounded-xl border hairline p-1 text-sm">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === s ? 'bg-brand-500 text-white' : 'text-muted hover:text-ink-900 dark:hover:text-ink-50'
                }`}
              >{s}</button>
            ))}
          </div>
        </div>
        <div className="divide-y hairline">
          {filtered.map((t) => (
            <div key={t.id} className="px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink-900 dark:text-ink-50">{t.subject}</span>
                  <Badge tone={priorityTone[t.priority]} size="sm">{t.priority}</Badge>
                </div>
                <div className="mt-1 text-xs text-muted">{t.clinic} · {t.when} · assigned to {t.assignee}</div>
              </div>
              <Badge tone={statusTone[t.status]} size="sm">{t.status}</Badge>
              <Button variant="ghost" size="sm">Open</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
