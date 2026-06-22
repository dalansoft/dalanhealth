import { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Users, IndianRupee, RotateCw, Repeat, Calendar } from 'lucide-react';
import {
  buildDailySeries, PRESETS, resolvePreset, inRange, totals, bucketize, pctDelta, ymd, startOfDay,
  type PresetKey,
} from '@/lib/reports';
import { inr, inrCompact } from '@/lib/format';

const DAY_MS = 86400000;
const parseDay = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const fmtNice = (d: Date) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const SOURCE_COLORS = { offline: '#0ea5e9', online: '#3b82f6', qr: '#6366f1' };
const tooltipStyle = { background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 } as const;

export function ClinicReports() {
  const series = useMemo(() => buildDailySeries(400), []);
  const todayStr = ymd(startOfDay(new Date()));

  const init = resolvePreset('7d');
  const [preset, setPreset] = useState<PresetKey>('7d');
  const [from, setFrom] = useState(ymd(init.from));
  const [to, setTo] = useState(ymd(init.to));

  const applyPreset = (key: PresetKey) => {
    const r = resolvePreset(key);
    setPreset(key);
    setFrom(ymd(r.from));
    setTo(ymd(r.to));
  };

  const { tot, prevTot, buckets, sourcePie, rangeLabel } = useMemo(() => {
    const today = startOfDay(new Date());
    const fromD = parseDay(from);
    const toD = parseDay(to);
    const lo = fromD <= toD ? fromD : toD;
    let hi = fromD <= toD ? toD : fromD;
    // Never report beyond today — future days have no data (show 0).
    if (hi.getTime() > today.getTime()) hi = today;
    const pts = lo.getTime() > hi.getTime() ? [] : inRange(series, lo, hi);

    // Previous equal-length window for the deltas.
    const lenDays = Math.max(1, Math.round((hi.getTime() - lo.getTime()) / DAY_MS) + 1);
    const prevHi = new Date(lo.getTime() - DAY_MS);
    const prevLo = new Date(prevHi.getTime() - (lenDays - 1) * DAY_MS);
    const prevPts = inRange(series, prevLo, prevHi);

    const t = totals(pts);
    const sum = (k: 'offline' | 'online' | 'qr') => pts.reduce((s, p) => s + p[k], 0);
    const pie = [
      { name: 'Offline', value: sum('offline'), color: SOURCE_COLORS.offline },
      { name: 'Online', value: sum('online'), color: SOURCE_COLORS.online },
      { name: 'QR', value: sum('qr'), color: SOURCE_COLORS.qr },
    ];
    const label = preset === 'custom'
      ? `${fmtNice(lo)} – ${fmtNice(hi)}`
      : PRESETS.find((p) => p.key === preset)?.label ?? '';

    return { tot: t, prevTot: totals(prevPts), buckets: bucketize(pts), sourcePie: pie, rangeLabel: label };
  }, [series, from, to, preset]);

  return (
    <div className="space-y-5">
      {/* ─── Date range toolbar ─────────────────────────────────────────── */}
      <Card>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <CardTitle>Patients &amp; revenue</CardTitle>
            <CardSubtitle>Showing <span className="font-semibold text-ink-700 dark:text-ink-200">{rangeLabel}</span></CardSubtitle>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    preset === p.key
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-100 dark:bg-ink-800 text-muted hover:text-ink-900 dark:hover:text-ink-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <DateField label="From" value={from} max={to < todayStr ? to : todayStr} onChange={(v) => { setFrom(v); setPreset('custom'); }} />
              <span className="text-muted text-xs">to</span>
              <DateField label="To" value={to} min={from} max={todayStr} onChange={(v) => { setTo(v); setPreset('custom'); }} />
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Stat tiles (range-aware) ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Patients" value={tot.patients.toLocaleString('en-IN')} icon={<Users size={16} />} accent="brand" delta={{ ...pctDelta(tot.patients, prevTot.patients), value: `${pctDelta(tot.patients, prevTot.patients).value} vs prev` }} />
        <StatCard label="Revenue" value={inr(tot.revenue)} icon={<IndianRupee size={16} />} accent="success" delta={{ ...pctDelta(tot.revenue, prevTot.revenue), value: `${pctDelta(tot.revenue, prevTot.revenue).value} vs prev` }} />
        <StatCard label="Follow-up rate" value={`${Math.round(tot.followupRate * 100)}%`} icon={<Repeat size={16} />} accent="accent" />
        <StatCard label="Avg visits / patient" value={tot.avgVisits ? tot.avgVisits.toFixed(1) : '—'} icon={<RotateCw size={16} />} accent="warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Patients by source</CardTitle>
              <CardSubtitle>Offline + Online + QR · {rangeLabel}</CardSubtitle>
            </div>
            <Badge tone="brand">Stacked</Badge>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={buckets}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="label" stroke="currentColor" opacity={0.6} fontSize={11} minTickGap={16} />
                <YAxis stroke="currentColor" opacity={0.6} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="offline" stackId="a" fill={SOURCE_COLORS.offline} name="Offline" />
                <Bar dataKey="online" stackId="a" fill={SOURCE_COLORS.online} name="Online" />
                <Bar dataKey="qr" stackId="a" fill={SOURCE_COLORS.qr} name="QR" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Source distribution</CardTitle>
              <CardSubtitle>{rangeLabel}</CardSubtitle>
            </div>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={sourcePie} dataKey="value" nameKey="name" outerRadius={90} innerRadius={48} paddingAngle={2}>
                  {sourcePie.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue trend</CardTitle>
              <CardSubtitle>Consultation collections · {rangeLabel}</CardSubtitle>
            </div>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={buckets}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="label" stroke="currentColor" opacity={0.6} fontSize={11} minTickGap={16} />
                <YAxis stroke="currentColor" opacity={0.6} fontSize={11} tickFormatter={(v) => inrCompact(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => inr(v)} />
                <Line type="monotone" dataKey="revenue" stroke={SOURCE_COLORS.online} strokeWidth={2.5} dot={{ r: 2 }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Visits vs follow-ups</CardTitle>
              <CardSubtitle>How many patients return · {rangeLabel}</CardSubtitle>
            </div>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={buckets}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="label" stroke="currentColor" opacity={0.6} fontSize={11} minTickGap={16} />
                <YAxis stroke="currentColor" opacity={0.6} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="patients" fill={SOURCE_COLORS.online} name="Visits" radius={[6, 6, 0, 0]} />
                <Bar dataKey="followups" fill={SOURCE_COLORS.qr} name="Follow-ups" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function DateField({ label, value, onChange, min, max }: { label: string; value: string; onChange: (v: string) => void; min?: string; max?: string }) {
  return (
    <div className="relative">
      <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
      <input
        type="date"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 pr-2 py-2 rounded-xl border hairline bg-white dark:bg-ink-900 text-xs text-ink-900 dark:text-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      />
    </div>
  );
}
