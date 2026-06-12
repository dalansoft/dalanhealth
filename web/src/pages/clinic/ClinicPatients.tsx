import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Phone, ArrowRight, Users, UserPlus, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Avatar } from '@/components/ui/Avatar';
import { demoPatients, type PatientStatus } from '@/services/demoData';

const tones: Record<PatientStatus, 'success' | 'warning' | 'brand'> = {
  Active: 'success',
  'Follow-up due': 'warning',
  New: 'brand',
};

export function ClinicPatients() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'All' | PatientStatus>('All');

  const filtered = useMemo(() => {
    return demoPatients.filter((p) => {
      if (filter !== 'All' && p.status !== filter) return false;
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return p.name.toLowerCase().includes(needle) || p.mobile.includes(needle) || p.lastDx.toLowerCase().includes(needle);
    });
  }, [q, filter]);

  const followUps = demoPatients.filter((p) => p.status === 'Follow-up due').length;
  const newCount = demoPatients.filter((p) => p.status === 'New').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total patients" value={demoPatients.length} icon={<Users size={16} />} accent="brand" />
        <StatCard label="New (last 30d)" value={newCount} icon={<UserPlus size={16} />} accent="accent" />
        <StatCard label="Follow-ups due" value={followUps} icon={<AlertCircle size={16} />} accent="warning" />
        <StatCard label="Avg visits / patient" value="4.6" accent="success" />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Patient directory</CardTitle>
            <CardSubtitle>Search by name, mobile or diagnosis</CardSubtitle>
          </div>
          <Button leftIcon={<Plus size={14} />}>Add patient</Button>
        </CardHeader>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <Input leftIcon={<Search size={14} />} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {(['All', 'Active', 'Follow-up due', 'New'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  filter === f
                    ? 'bg-brand-500 text-white'
                    : 'bg-ink-100 dark:bg-ink-800 text-muted hover:text-ink-900 dark:hover:text-ink-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border hairline">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-ink-50 dark:bg-ink-900/60">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Last diagnosis</th>
                <th className="px-4 py-3 text-right">Visits</th>
                <th className="px-4 py-3">Last visit</th>
                <th className="px-4 py-3">Status</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {filtered.map((p) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-ink-50/60 dark:hover:bg-ink-900/40">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <Avatar name={p.name} size="sm" />
                    <span className="font-medium text-ink-900 dark:text-ink-50">{p.name}</span>
                  </td>
                  <td className="px-4 py-3 text-muted inline-flex items-center gap-1.5 mt-2.5"><Phone size={12} />{p.mobile}</td>
                  <td className="px-4 py-3 text-muted">{p.age} · {p.gender[0]}</td>
                  <td className="px-4 py-3 text-muted">{p.lastDx}</td>
                  <td className="px-4 py-3 text-right font-medium">{p.visits}</td>
                  <td className="px-4 py-3 text-muted">{p.lastVisit}</td>
                  <td className="px-4 py-3"><Badge tone={tones[p.status]} size="sm">{p.status}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={12} />}>Open</Button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">No matches.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
