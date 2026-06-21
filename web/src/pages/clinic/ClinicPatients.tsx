import { useMemo, useState } from 'react';
import { Search, Users, AlertCircle, CheckCircle2, Clock, Calendar, X } from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { useQueue, tokenLabel, type QueueEntry, type QueueSource } from '@/store/queue';
import { demoPatients } from '@/services/demoData';

type Tone = 'brand' | 'accent' | 'success' | 'neutral';
type StatusFilter = 'All' | 'In queue' | 'Completed';

interface Row {
  id: string;          // visit id, e.g. VIS-20260621-A1B2
  token: string;       // "#12" or "E1"
  emergency?: boolean;
  name: string;
  mobile: string;
  source: QueueSource;
  date: Date;
  time: string;
  status: string;      // In consultation / Up next / Waiting / Completed
  tone: Tone;
}

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const ddmmyyyy = (d: Date) => `${pad(d.getDate())}${pad(d.getMonth() + 1)}${d.getFullYear()}`;
const fmtDate = (d: Date) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const SOURCES: QueueSource[] = ['OFFLINE', 'ONLINE', 'QR'];

// Display status + badge tone for a today's-queue record.
function statusOf(e: QueueEntry): { label: string; tone: Tone } {
  if (e.completedAt) return { label: 'Completed', tone: 'success' };
  if (e.status === 'Consultation') return { label: 'In consultation', tone: 'brand' };
  if (e.status === 'Queue') return { label: 'Up next', tone: 'accent' };
  return { label: 'Waiting', tone: 'neutral' };
}

// Deterministic past visits so the date search has multi-day data to find.
function buildPastVisits(): Row[] {
  const out: Row[] = [];
  demoPatients.forEach((p, pi) => {
    const count = Math.min(p.visits, 2 + (pi % 3)); // 2–4 visits each
    for (let v = 0; v < count; v++) {
      const daysAgo = ((pi * 7 + v * 11 + 2) % 80) + 1;
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      d.setHours(9 + ((pi + v) % 8), (pi * 13 + v * 7) % 60, 0, 0);
      out.push({
        id: `VIS-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad((pi * 3 + v) % 100)}`,
        token: `#${((pi * 5 + v * 3) % 48) + 1}`,
        name: p.name,
        mobile: p.mobile,
        source: SOURCES[(pi + v) % 3],
        date: d,
        time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
        status: 'Completed',
        tone: 'success',
      });
    }
  });
  return out;
}

export function ClinicPatients() {
  const { entries, completed } = useQueue();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [dateFilter, setDateFilter] = useState(''); // yyyy-mm-dd from the calendar

  const past = useMemo(buildPastVisits, []);

  const rows = useMemo(() => {
    // Today: still-in-queue (active) + completed, from the live store.
    const today: Row[] = [...entries, ...completed].map((e) => {
      const st = statusOf(e);
      const d = new Date();
      return {
        id: `VIS-${ymd(d).replace(/-/g, '')}-${e.id.slice(-4).toUpperCase()}`,
        token: tokenLabel(e),
        emergency: e.emergency,
        name: e.patientName,
        mobile: e.patientMobile,
        source: e.source,
        date: d,
        time: e.completedAt ?? e.joinedAt,
        status: st.label,
        tone: st.tone,
      };
    });
    const all = [...today, ...[...past].sort((a, b) => b.date.getTime() - a.date.getTime())];
    const nq = norm(query);
    return all.filter((r) => {
      if (statusFilter === 'In queue' && r.status === 'Completed') return false;
      if (statusFilter === 'Completed' && r.status !== 'Completed') return false;
      if (dateFilter && ymd(r.date) !== dateFilter) return false;
      if (nq) {
        const hay = norm([r.name, r.mobile, r.id, r.token, fmtDate(r.date), ddmmyyyy(r.date), ymd(r.date)].join(' '));
        if (!hay.includes(nq)) return false;
      }
      return true;
    });
  }, [entries, completed, past, query, statusFilter, dateFilter]);

  const inQueueCount = entries.length;
  const seenCount = completed.length;
  const followUps = demoPatients.filter((p) => p.status === 'Follow-up due').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="In queue now" value={inQueueCount} icon={<Clock size={16} />} accent="brand" />
        <StatCard label="Seen today" value={seenCount} icon={<CheckCircle2 size={16} />} accent="success" />
        <StatCard label="Total patients" value={demoPatients.length} icon={<Users size={16} />} accent="accent" />
        <StatCard label="Follow-ups due" value={followUps} icon={<AlertCircle size={16} />} accent="warning" />
      </div>

      <Card padded={false}>
        <div className="p-5 flex flex-col gap-3">
          <CardHeader className="mb-0">
            <div>
              <CardTitle>Patient history</CardTitle>
              <CardSubtitle>Every visit — in queue and completed, normal &amp; emergency. Search by name, mobile, visit ID or token.</CardSubtitle>
            </div>
            <Badge tone="neutral">{rows.length} shown</Badge>
          </CardHeader>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex-1">
              <Input
                leftIcon={<Search size={14} />}
                placeholder="Search name, mobile, visit ID, token — or a date (ddmmyyyy)…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Calendar: pick a date, or type it. Plus clear. */}
            <div className="relative shrink-0">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                aria-label="Filter by date"
                className="pl-9 pr-9 py-2.5 rounded-xl border hairline bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              {dateFilter && (
                <button
                  type="button"
                  onClick={() => setDateFilter('')}
                  aria-label="Clear date"
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {(['All', 'In queue', 'Completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    statusFilter === f
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-100 dark:bg-ink-800 text-muted hover:text-ink-900 dark:hover:text-ink-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border-t hairline">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-ink-50 dark:bg-ink-900/60">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="px-5 py-3">Token</th>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Mobile</th>
                <th className="px-5 py-3">Visit ID</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Date · Time</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {rows.map((r) => (
                <tr key={r.id} className={`transition-colors hover:bg-ink-50 dark:hover:bg-ink-900/40 ${r.emergency ? 'bg-danger-500/5' : ''}`}>
                  <td className={`px-5 py-3.5 font-semibold ${r.emergency ? 'text-danger-500' : ''}`}>{r.token}</td>
                  <td className="px-5 py-3.5 font-medium text-ink-900 dark:text-ink-50">
                    <div className="flex items-center gap-2">
                      <span>{r.name}</span>
                      {r.emergency && <Badge tone="danger" size="sm">Emergency</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{r.mobile}</td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-muted">{r.id}</td>
                  <td className="px-5 py-3.5"><SourceBadge source={r.source} /></td>
                  <td className="px-5 py-3.5 text-muted whitespace-nowrap">{fmtDate(r.date)} · {r.time}</td>
                  <td className="px-5 py-3.5"><Badge tone={r.tone} size="sm" pulse={r.status === 'In consultation'}>{r.status}</Badge></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted">No patients match.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
