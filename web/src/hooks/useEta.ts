import { useMemo } from 'react';
import { useQueue } from '@/store/queue';
import { useEstimate } from '@/store/estimate';
import { avgConsultMinutes, clockAfter, fmtWait } from '@/lib/eta';

/**
 * Shared wait-time estimate for any queue surface. `pos` is the patient's
 * position in the live queue (0 = now serving). Wait = pos × avg-per-patient,
 * where avg is AI-analysed from real durations or the clinic's fixed value.
 */
export function useEta() {
  const completed = useQueue((s) => s.completed);
  const mode = useEstimate((s) => s.mode);
  const clinicMinutes = useEstimate((s) => s.clinicMinutes);

  const avg = useMemo(
    () => avgConsultMinutes(completed, mode, clinicMinutes),
    [completed, mode, clinicMinutes],
  );

  return {
    mode,
    avg,
    waitMinutes: (pos: number) => Math.max(0, pos) * avg,
    waitLabel: (pos: number) => fmtWait(Math.max(0, pos) * avg),
    etaClock: (pos: number) => clockAfter(Math.max(0, pos) * avg),
  };
}
