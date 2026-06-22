// Deterministic analytics dataset for the clinic Reports page. There is no
// backend on the static deploy, so we synthesize a stable per-day series for
// the last ~13 months and aggregate it for whatever date range the user picks
// (presets like Today / 7 days / 1 year, or a custom from–to range).

export interface DayPoint {
  date: Date;
  offline: number;
  online: number;
  qr: number;
  patients: number;   // offline + online + qr
  newPatients: number;
  revenue: number;    // consultation collections, ₹
  followups: number;
}

export interface Bucket {
  label: string;
  offline: number;
  online: number;
  qr: number;
  patients: number;
  revenue: number;
  followups: number;
}

export interface RangeTotals {
  patients: number;
  revenue: number;
  followups: number;
  newPatients: number;
  followupRate: number;   // 0..1
  avgVisits: number;      // patients / unique
}

const DAY_MS = 86400000;
const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

// Stable pseudo-random in [0,1) from an integer seed.
const seeded = (n: number) => {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const fmtDay = (d: Date) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
const fmtMonth = (d: Date) => d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

/** ~13 months of deterministic daily activity, oldest → newest. */
export function buildDailySeries(days = 400): DayPoint[] {
  const out: DayPoint[] = [];
  const today = startOfDay(new Date());
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS);
    const idx = Math.floor(d.getTime() / DAY_MS);
    const dow = d.getDay();
    const weekend = dow === 0 ? 0.5 : dow === 6 ? 0.78 : 1; // Sun/Sat dip
    const total = Math.max(6, Math.round((42 + seeded(idx) * 40) * weekend));
    const online = Math.round(total * (0.26 + seeded(idx * 2) * 0.1));
    const qr = Math.round(total * (0.14 + seeded(idx * 3) * 0.08));
    const offline = Math.max(0, total - online - qr);
    const revenue = total * (170 + Math.round(seeded(idx * 5) * 130)); // ₹170–300 / patient
    const followups = Math.round(total * (0.3 + seeded(idx * 7) * 0.16));
    const newPatients = Math.max(1, Math.round(total * (0.2 + seeded(idx * 11) * 0.06)));
    out.push({ date: d, offline, online, qr, patients: total, newPatients, revenue, followups });
  }
  return out;
}

export type PresetKey = 'today' | 'yesterday' | '7d' | '1m' | '3m' | '6m' | '1y' | 'custom';

export const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d', label: '7 days' },
  { key: '1m', label: '1 month' },
  { key: '3m', label: '3 months' },
  { key: '6m', label: '6 months' },
  { key: '1y', label: '1 year' },
];

/** Resolve a preset to an inclusive [from, to] day range. */
export function resolvePreset(key: PresetKey): { from: Date; to: Date } {
  const today = startOfDay(new Date());
  const back = (n: number) => new Date(today.getTime() - n * DAY_MS);
  switch (key) {
    case 'today': return { from: today, to: today };
    case 'yesterday': return { from: back(1), to: back(1) };
    case '7d': return { from: back(6), to: today };
    case '1m': return { from: back(29), to: today };
    case '3m': return { from: back(89), to: today };
    case '6m': return { from: back(179), to: today };
    case '1y': return { from: back(364), to: today };
    default: return { from: back(6), to: today };
  }
}

export const inRange = (series: DayPoint[], from: Date, to: Date): DayPoint[] => {
  const a = startOfDay(from).getTime();
  const b = startOfDay(to).getTime();
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return series.filter((p) => p.date.getTime() >= lo && p.date.getTime() <= hi);
};

export function totals(points: DayPoint[]): RangeTotals {
  const patients = points.reduce((s, p) => s + p.patients, 0);
  const revenue = points.reduce((s, p) => s + p.revenue, 0);
  const followups = points.reduce((s, p) => s + p.followups, 0);
  const newPatients = points.reduce((s, p) => s + p.newPatients, 0);
  return {
    patients,
    revenue,
    followups,
    newPatients,
    followupRate: patients ? followups / patients : 0,
    avgVisits: newPatients ? patients / newPatients : 0,
  };
}

/** Bucket the range into day / week / month columns for the charts. */
export function bucketize(points: DayPoint[]): Bucket[] {
  const spanDays = points.length;
  const gran: 'day' | 'week' | 'month' = spanDays <= 31 ? 'day' : spanDays <= 120 ? 'week' : 'month';
  if (gran === 'day') {
    return points.map((p) => ({
      label: fmtDay(p.date), offline: p.offline, online: p.online, qr: p.qr,
      patients: p.patients, revenue: p.revenue, followups: p.followups,
    }));
  }
  const map = new Map<string, Bucket & { sort: number }>();
  for (const p of points) {
    const key = gran === 'week'
      ? String(Math.floor(p.date.getTime() / (7 * DAY_MS)))
      : `${p.date.getFullYear()}-${p.date.getMonth()}`;
    const label = gran === 'week' ? fmtDay(p.date) : fmtMonth(p.date);
    const sort = p.date.getTime();
    const b = map.get(key) ?? { label, offline: 0, online: 0, qr: 0, patients: 0, revenue: 0, followups: 0, sort };
    b.offline += p.offline; b.online += p.online; b.qr += p.qr;
    b.patients += p.patients; b.revenue += p.revenue; b.followups += p.followups;
    map.set(key, b);
  }
  return [...map.values()].sort((a, b) => a.sort - b.sort).map(({ sort: _s, ...rest }) => rest);
}

/** % change current vs previous equal-length period (for the stat deltas). */
export function pctDelta(cur: number, prev: number): { value: string; positive: boolean } {
  if (!prev) return { value: cur ? '+100%' : '0%', positive: cur >= 0 };
  const pct = ((cur - prev) / prev) * 100;
  return { value: `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`, positive: pct >= 0 };
}
