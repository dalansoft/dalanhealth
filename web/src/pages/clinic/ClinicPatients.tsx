import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, AlertCircle, CheckCircle2, Clock, Calendar, X, Phone, Pencil } from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Avatar } from '@/components/ui/Avatar';
import { useQueue, tokenLabel, type QueueEntry, type QueueSource, type PatientDetails } from '@/store/queue';
import { AddPatientModal } from '@/pages/receptionist/AddPatientModal';
import { demoPatients } from '@/services/demoData';

type Tone = 'brand' | 'accent' | 'success' | 'neutral' | 'warning';
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
  // Extra detail for the "show all" panel.
  age?: number;
  gender?: string;
  diagnosis?: string;
  fee?: number;
  doctor?: string;
  details?: PatientDetails;
  /** The live queue entry behind this row (today's patients) — enables Edit. */
  entry?: QueueEntry;
}

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const ddmmyyyy = (d: Date) => `${pad(d.getDate())}${pad(d.getMonth() + 1)}${d.getFullYear()}`;
const fmtDate = (d: Date) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const SOURCES: QueueSource[] = ['OFFLINE', 'ONLINE', 'QR'];
const DOCTORS = ['Dr. Anil Sharma', 'Dr. Priya Gupta', 'Dr. Ravi Kumar'];

function statusOf(e: QueueEntry): { label: string; tone: Tone } {
  if (e.completedAt) return { label: 'Completed', tone: 'success' };
  if (e.wasSkipped) return { label: 'Skipped', tone: 'warning' };
  if (e.status === 'Consultation') return { label: 'In consultation', tone: 'brand' };
  if (e.status === 'Queue') return { label: 'Up next', tone: 'accent' };
  return { label: 'Waiting', tone: 'neutral' };
}

// Deterministic past visits so the date search + history have multi-day data.
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
        age: p.age,
        gender: p.gender,
        diagnosis: p.lastDx,
        fee: 200 + ((pi * 5 + v * 3) % 5) * 50,
        doctor: DOCTORS[pi % DOCTORS.length],
      });
    }
  });
  return out;
}

// One label/value line in the detail panel; renders nothing if empty.
function Field({ label, value }: { label: string; value?: ReactNode }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-sm font-medium text-ink-900 dark:text-ink-50 text-right">{value}</span>
    </div>
  );
}

export function ClinicPatients() {
  const { entries, completed } = useQueue();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [dateFilter, setDateFilter] = useState('');
  const [selected, setSelected] = useState<Row | null>(null);
  const [editEntry, setEditEntry] = useState<QueueEntry | null>(null);

  // Esc closes the detail panel.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selected]);

  const past = useMemo(buildPastVisits, []);

  const rows = useMemo(() => {
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
        age: e.details?.age,
        gender: e.details?.gender,
        details: e.details,
        entry: e,
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
  const d = selected?.details;

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
              <CardSubtitle>Every visit — in queue and completed, normal &amp; emergency. Click a visit ID to see everything.</CardSubtitle>
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
                <tr
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className={`cursor-pointer transition-colors hover:bg-ink-50 dark:hover:bg-ink-900/40 ${r.emergency ? 'bg-danger-500/5' : ''}`}
                >
                  <td className={`px-5 py-3.5 font-semibold ${r.emergency ? 'text-danger-500' : ''}`}>{r.token}</td>
                  <td className="px-5 py-3.5 font-medium text-ink-900 dark:text-ink-50">
                    <div className="flex items-center gap-2">
                      <span>{r.name}</span>
                      {r.emergency && <Badge tone="danger" size="sm">Emergency</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{r.mobile}</td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelected(r); }}
                      className="font-mono text-[11px] text-brand-600 dark:text-brand-300 hover:underline"
                      title="Show full visit details"
                    >
                      {r.id}
                    </button>
                  </td>
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

      {/* ─── Visit detail panel — "show all" ─────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[60] bg-ink-950/60 backdrop-blur-sm"
              onClick={() => setSelected(null)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-4 sm:p-6 pointer-events-none overflow-y-auto"
              role="dialog" aria-modal="true"
            >
              <div className="w-full max-w-lg pointer-events-auto rounded-2xl bg-white dark:bg-ink-900 border hairline shadow-2xl my-auto">
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b hairline">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={selected.name} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink-900 dark:text-ink-50 truncate">{selected.name}</span>
                        <span className={`text-sm font-bold ${selected.emergency ? 'text-danger-500' : 'text-brand-600 dark:text-brand-300'}`}>{selected.token}</span>
                        {selected.emergency && <Badge tone="danger" size="sm">Emergency</Badge>}
                      </div>
                      <div className="text-[11px] text-muted inline-flex items-center gap-1"><Phone size={10} /> {selected.mobile}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {selected.entry && (
                      <button
                        type="button"
                        onClick={() => { setEditEntry(selected.entry!); setSelected(null); }}
                        className="inline-flex items-center gap-1.5 rounded-xl border hairline px-3 h-9 text-xs font-semibold text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
                      aria-label="Close"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-5 max-h-[70vh] overflow-y-auto">
                  <div className="rounded-xl border hairline divide-y hairline px-4">
                    <div className="py-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Visit</div>
                    <Field label="Visit ID" value={<span className="font-mono">{selected.id}</span>} />
                    <Field label="Token" value={selected.token} />
                    <Field label="Status" value={<Badge tone={selected.tone} size="sm">{selected.status}</Badge>} />
                    <Field label="Date" value={fmtDate(selected.date)} />
                    <Field label="Time" value={selected.time} />
                    <Field label="Source" value={<SourceBadge source={selected.source} />} />
                    <Field label="Doctor" value={selected.doctor} />
                    <Field label="Diagnosis" value={selected.diagnosis} />
                    <Field label="Consultation fee" value={selected.fee !== undefined ? `₹${selected.fee}` : undefined} />
                  </div>

                  <div className="mt-4 rounded-xl border hairline divide-y hairline px-4">
                    <div className="py-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Patient</div>
                    <Field label="Name" value={selected.name} />
                    <Field label="Mobile" value={selected.mobile} />
                    <Field label="Age" value={selected.age} />
                    <Field label="Gender" value={selected.gender} />
                  </div>

                  {d && (d.weight || d.height || d.bloodGroup || d.address || d.allergies || d.conditions || d.emergencyName) && (
                    <div className="mt-4 rounded-xl border hairline divide-y hairline px-4">
                      <div className="py-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Health record</div>
                      <Field label="Weight" value={d.weight !== undefined ? `${d.weight} kg` : undefined} />
                      <Field label="Height" value={d.height !== undefined ? `${d.height} cm` : undefined} />
                      <Field label="Blood group" value={d.bloodGroup} />
                      <Field label="Address" value={d.address} />
                      <Field label="Allergies" value={d.allergies} />
                      <Field label="Conditions" value={d.conditions} />
                      <Field label="Emergency contact" value={d.emergencyName ? `${d.emergencyName}${d.emergencyMobile ? ` · ${d.emergencyMobile}` : ''}` : undefined} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit patient — same form, mobile locked */}
      <AddPatientModal open={!!editEntry} editEntry={editEntry ?? undefined} onClose={() => setEditEntry(null)} />
    </div>
  );
}
