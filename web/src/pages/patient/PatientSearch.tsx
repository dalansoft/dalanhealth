import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Search, Clock, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { demoDoctors } from '@/services/demoData';

export function PatientSearch() {
  const [q, setQ] = useState('');
  const filtered = demoDoctors.filter((d) =>
    `${d.name} ${d.specialization} ${d.clinic} ${d.city}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="space-y-4">
      <Input leftIcon={<Search size={14} />} placeholder="Doctor, clinic, specialization, city" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      <div className="space-y-3">
        {filtered.map((d) => (
          <Link key={d.id} to={`/patient/doctor/${d.id}`} className="block">
            <div className="rounded-2xl border hairline bg-white dark:bg-ink-900 p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-600 dark:text-brand-300 font-semibold flex items-center justify-center">
                  {d.name.split(' ')[1]?.[0] ?? 'D'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{d.name}</div>
                  <div className="text-xs text-muted">{d.specialization} · {d.clinic}</div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted">
                    <span className="inline-flex items-center gap-1"><MapPin size={11} /> {d.city}</span>
                    <span className="inline-flex items-center gap-1"><Clock size={11} /> ~{d.approxWait} min</span>
                  </div>
                </div>
                <Badge tone="brand" size="sm">#{d.currentToken}</Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
