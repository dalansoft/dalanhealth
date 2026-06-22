import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Users, AlertCircle, CheckCircle2, Clock, Calendar, X, Phone, Pencil,
  ChevronLeft, Download, FileText, Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Avatar } from '@/components/ui/Avatar';
import { useQueue, tokenLabel, type QueueEntry, type QueueSource, type PatientDetails } from '@/store/queue';
import { usePrescriptions, type Rx, type RxMed } from '@/store/prescriptions';
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
const last10 = (s: string) => s.replace(/\D/g, '').slice(-10);

const SOURCES: QueueSource[] = ['OFFLINE', 'ONLINE', 'QR'];
const DOCTORS = ['Dr. Anil Sharma', 'Dr. Priya Gupta', 'Dr. Ravi Kumar'];

const medDose = (m: RxMed) => m.dose?.trim() || '—';
const medTiming = (m: RxMed) =>
  ([['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening'], ['night', 'Night']] as const)
    .filter(([k]) => m[k]).map(([, l]) => l).join(', ') || 'as needed';

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

// "Download everything" — a single PDF with the patient's details, every
// visit, and every prescription (with medicines for digital ones).
async function exportPatientPdf(sel: Row, visits: Row[], rx: Rx[]) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const M = 40;
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const lastY = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  let y = M + 8;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(15, 23, 42);
  doc.text('Patient Record', M, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
  doc.text('Dalan Health', W - M, y, { align: 'right' });
  y += 10; doc.setDrawColor(226, 232, 240); doc.line(M, y, W - M, y); y += 22;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(15, 23, 42);
  doc.text(sel.name, M, y); y += 15;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
  doc.text(sel.mobile, M, y); y += 14;

  const dd = sel.details;
  const info: string[] = [];
  if (sel.age != null) info.push(`Age: ${sel.age}`);
  if (sel.gender) info.push(`Gender: ${sel.gender}`);
  if (dd?.bloodGroup) info.push(`Blood group: ${dd.bloodGroup}`);
  if (dd?.allergies) info.push(`Allergies: ${dd.allergies}`);
  if (dd?.conditions) info.push(`Conditions: ${dd.conditions}`);
  if (info.length) {
    doc.setFontSize(9); doc.setTextColor(100, 116, 139);
    const lines = doc.splitTextToSize(info.join('   ·   '), W - 2 * M);
    doc.text(lines, M, y); y += lines.length * 12 + 4;
  }

  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(15, 23, 42);
  doc.text(`Visit history (${visits.length})`, M, y + 14);
  autoTable(doc, {
    startY: y + 20,
    head: [['Date · Time', 'Token', 'Status', 'Source', 'Visit ID']],
    body: visits.map((v) => [`${fmtDate(v.date)} · ${v.time}`, v.token, v.status, v.source, v.id]),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    margin: { left: M, right: M },
  });
  y = lastY() + 24;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(15, 23, 42);
  doc.text(`Prescriptions (${rx.length})`, M, y);
  if (!rx.length) {
    y += 16; doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
    doc.text('No prescriptions on record.', M, y);
  } else {
    rx.forEach((r) => {
      if (y > H - 130) { doc.addPage(); y = M; }
      y += 18;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(30, 41, 59);
      doc.text(`${r.date}  ·  ${r.kind.toUpperCase()}`, M, y); y += 12;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(71, 85, 105);
      const sl = doc.splitTextToSize(r.summary || '—', W - 2 * M);
      doc.text(sl, M, y); y += sl.length * 11;
      const meds = (r.doc?.meds ?? []).filter((m) => m.name);
      if (meds.length) {
        autoTable(doc, {
          startY: y + 4,
          head: [['Medicine', 'Dose', 'Timing', 'Days']],
          body: meds.map((m) => [m.name, medDose(m), medTiming(m), m.days || '—']),
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85] },
          margin: { left: M, right: M },
        });
        y = lastY() + 6;
      }
    });
  }

  doc.save(`patient-${sel.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

export function ClinicPatients() {
  const { entries, completed } = useQueue();
  const allRx = usePrescriptions((s) => s.list);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [dateFilter, setDateFilter] = useState('');
  const [selected, setSelected] = useState<Row | null>(null);
  const [editEntry, setEditEntry] = useState<QueueEntry | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const past = useMemo(buildPastVisits, []);

  // Every visit (today's live queue + completed + synthetic past), unfiltered.
  const allRows = useMemo<Row[]>(() => {
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
    return [...today, ...[...past].sort((a, b) => b.date.getTime() - a.date.getTime())];
  }, [entries, completed, past]);

  const rows = useMemo(() => {
    const nq = norm(query);
    return allRows.filter((r) => {
      if (statusFilter === 'In queue' && r.status === 'Completed') return false;
      if (statusFilter === 'Completed' && r.status !== 'Completed') return false;
      if (dateFilter && ymd(r.date) !== dateFilter) return false;
      if (nq) {
        const hay = norm([r.name, r.mobile, r.id, r.token, fmtDate(r.date), ddmmyyyy(r.date), ymd(r.date)].join(' '));
        if (!hay.includes(nq)) return false;
      }
      return true;
    });
  }, [allRows, query, statusFilter, dateFilter]);

  // Deep-link: queue rows open here as `?focus=<mobile digits>` and auto-show
  // that patient's full history. Clear the param so refreshes stay clean.
  useEffect(() => {
    const f = searchParams.get('focus');
    if (!f) return;
    const match = allRows.find((r) => last10(r.mobile) === f.slice(-10));
    if (match) setSelected(match);
    const next = new URLSearchParams(searchParams);
    next.delete('focus');
    setSearchParams(next, { replace: true });
  }, [searchParams, allRows, setSearchParams]);

  // Esc closes the inline patient view.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selected]);

  // All visits + prescriptions for the selected patient (across all dates).
  const patientVisits = useMemo(
    () => (selected ? allRows.filter((r) => last10(r.mobile) === last10(selected.mobile)).sort((a, b) => b.date.getTime() - a.date.getTime()) : []),
    [allRows, selected],
  );
  const patientRx = useMemo(
    () => (selected ? allRx.filter((r) => last10(r.patientMobile) === last10(selected.mobile)) : []),
    [allRx, selected],
  );

  const inQueueCount = entries.length;
  const seenCount = completed.length;
  const followUps = demoPatients.filter((p) => p.status === 'Follow-up due').length;

  const doDownload = async () => {
    if (!selected) return;
    setDownloading(true);
    try { await exportPatientPdf(selected, patientVisits, patientRx); }
    finally { setDownloading(false); }
  };

  // ─── Inline patient view (same tab, no floating dialog) ──────────────────
  if (selected) {
    const d = selected.details;
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-ink-50"
          >
            <ChevronLeft size={16} /> Back to patients
          </button>
          <div className="flex items-center gap-2">
            {selected.entry && (
              <Button variant="outline" size="sm" leftIcon={<Pencil size={14} />} onClick={() => setEditEntry(selected.entry!)}>
                Edit
              </Button>
            )}
            <Button
              size="sm"
              leftIcon={downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              onClick={doDownload}
              disabled={downloading}
            >
              Download record (PDF)
            </Button>
          </div>
        </div>

        {/* Patient header + info */}
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar name={selected.name} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-ink-900 dark:text-ink-50">{selected.name}</span>
                  <span className={`text-sm font-bold ${selected.emergency ? 'text-danger-500' : 'text-brand-600 dark:text-brand-300'}`}>{selected.token}</span>
                  {selected.emergency && <Badge tone="danger" size="sm">Emergency</Badge>}
                </div>
                <div className="text-xs text-muted inline-flex items-center gap-1 mt-0.5"><Phone size={11} /> {selected.mobile}</div>
              </div>
            </div>
            <div className="text-right">
              <Badge tone={selected.tone} size="sm" pulse={selected.status === 'In consultation'}>{selected.status}</Badge>
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-0">
            <div className="rounded-xl border hairline divide-y hairline px-4">
              <div className="py-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Patient</div>
              <Field label="Name" value={selected.name} />
              <Field label="Mobile" value={selected.mobile} />
              <Field label="Age" value={selected.age} />
              <Field label="Gender" value={selected.gender} />
            </div>
            {d && (d.weight || d.height || d.bloodGroup || d.address || d.allergies || d.conditions || d.emergencyName) ? (
              <div className="rounded-xl border hairline divide-y hairline px-4">
                <div className="py-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Health record</div>
                <Field label="Weight" value={d.weight !== undefined ? `${d.weight} kg` : undefined} />
                <Field label="Height" value={d.height !== undefined ? `${d.height} cm` : undefined} />
                <Field label="Blood group" value={d.bloodGroup} />
                <Field label="Address" value={d.address} />
                <Field label="Allergies" value={d.allergies} />
                <Field label="Conditions" value={d.conditions} />
                <Field label="Emergency contact" value={d.emergencyName ? `${d.emergencyName}${d.emergencyMobile ? ` · ${d.emergencyMobile}` : ''}` : undefined} />
              </div>
            ) : (
              <div className="rounded-xl border hairline px-4 py-3 text-xs text-muted self-start">No extended health record on file.</div>
            )}
          </div>
        </Card>

        {/* Full visit history for this patient */}
        <Card padded={false}>
          <div className="px-5 py-4 border-b hairline flex items-center justify-between">
            <div>
              <CardTitle>Visit history</CardTitle>
              <CardSubtitle>Every visit for this patient</CardSubtitle>
            </div>
            <Badge tone="neutral">{patientVisits.length}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-ink-50 dark:bg-ink-900/60">
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-5 py-3">Date · Time</th>
                  <th className="px-5 py-3">Token</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Diagnosis</th>
                  <th className="px-5 py-3">Visit ID</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y hairline">
                {patientVisits.map((v) => (
                  <tr key={v.id} className={v.emergency ? 'bg-danger-500/5' : ''}>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{fmtDate(v.date)} · {v.time}</td>
                    <td className={`px-5 py-3 font-semibold ${v.emergency ? 'text-danger-500' : ''}`}>{v.token}</td>
                    <td className="px-5 py-3"><SourceBadge source={v.source} /></td>
                    <td className="px-5 py-3 text-ink-700 dark:text-ink-200">{v.diagnosis ?? '—'}</td>
                    <td className="px-5 py-3 font-mono text-[11px] text-brand-600 dark:text-brand-300">{v.id}</td>
                    <td className="px-5 py-3"><Badge tone={v.tone} size="sm" pulse={v.status === 'In consultation'}>{v.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Prescriptions for this patient */}
        <Card padded={false}>
          <div className="px-5 py-4 border-b hairline flex items-center justify-between">
            <div>
              <CardTitle>Prescriptions</CardTitle>
              <CardSubtitle>All prescriptions on record</CardSubtitle>
            </div>
            <Badge tone="neutral">{patientRx.length}</Badge>
          </div>
          {patientRx.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-ink-50 dark:bg-ink-900/60">
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Summary</th>
                    <th className="px-5 py-3">Medicines</th>
                  </tr>
                </thead>
                <tbody className="divide-y hairline">
                  {patientRx.map((r) => (
                    <tr key={r.id}>
                      <td className="px-5 py-3 text-muted whitespace-nowrap">{r.date}</td>
                      <td className="px-5 py-3"><Badge tone="brand" size="sm">{r.kind}</Badge></td>
                      <td className="px-5 py-3 text-ink-700 dark:text-ink-200">{r.summary}</td>
                      <td className="px-5 py-3 text-muted">{(r.doc?.meds ?? []).filter((m) => m.name).map((m) => m.name).join(', ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-10 text-center text-sm text-muted">
              <FileText size={20} className="mx-auto mb-2 opacity-40" />
              No prescriptions for this patient yet.
            </div>
          )}
        </Card>

        {/* Edit patient — same form, mobile locked */}
        <AddPatientModal open={!!editEntry} editEntry={editEntry ?? undefined} onClose={() => setEditEntry(null)} />
      </motion.div>
    );
  }

  // ─── List view ───────────────────────────────────────────────────────────
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
              <CardSubtitle>Every visit — in queue and completed, normal &amp; emergency. Click a row to open the full patient record.</CardSubtitle>
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
                  title="Open full patient record"
                >
                  <td className={`px-5 py-3.5 font-semibold ${r.emergency ? 'text-danger-500' : ''}`}>{r.token}</td>
                  <td className="px-5 py-3.5 font-medium text-ink-900 dark:text-ink-50">
                    <div className="flex items-center gap-2">
                      <span>{r.name}</span>
                      {r.emergency && <Badge tone="danger" size="sm">Emergency</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{r.mobile}</td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-brand-600 dark:text-brand-300">{r.id}</td>
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
