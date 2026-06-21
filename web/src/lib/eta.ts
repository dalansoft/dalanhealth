import type { QueueEntry } from '@/store/queue';
import type { EstimateMode } from '@/store/estimate';

/** A sensible clinic average used as a fallback when there isn't enough real
 *  data to analyse yet. */
export const DEFAULT_MINUTES = 12;

/** Parse "10:45 AM" / "10:45" → minutes since midnight, else null. */
export function parseClock(s?: string): number | null {
  if (!s) return null;
  const m = s.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ap = m[3]?.toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

/**
 * Average minutes per consultation.
 *  - clinic: the fixed value the clinic set.
 *  - ai: analyse the real gaps between consecutive completed consultations
 *        (each gap ≈ how long that patient took). This is the data-driven
 *        estimate; swap in an LLM call here when a backend is available.
 */
export function avgConsultMinutes(
  completed: QueueEntry[],
  mode: EstimateMode,
  clinicMinutes: number,
): number {
  if (mode === 'clinic') return Math.max(1, clinicMinutes || DEFAULT_MINUTES);

  const times = completed
    .map((e) => parseClock(e.completedAt))
    .filter((n): n is number => n != null)
    .sort((a, b) => a - b);

  const diffs: number[] = [];
  for (let i = 1; i < times.length; i++) {
    const d = times[i] - times[i - 1];
    if (d >= 1 && d <= 90) diffs.push(d); // ignore demo bursts (<1m) + outliers
  }
  if (!diffs.length) return DEFAULT_MINUTES;
  return Math.max(1, Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length));
}

/** "~12 min" / "~1h 5m" / "now" for a wait in minutes. */
export function fmtWait(min: number): string {
  if (min <= 0) return 'now';
  if (min < 60) return `~${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `~${h}h ${m}m` : `~${h}h`;
}

/** Wall-clock time `min` minutes from now, e.g. "11:05 AM". */
export function clockAfter(min: number): string {
  return new Date(Date.now() + min * 60000)
    .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
