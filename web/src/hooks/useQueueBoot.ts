import { useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { useQueue } from '@/store/queue';
import { demoQueue } from '@/services/demoData';

/**
 * One hook every queue-rendering screen mounts.
 *
 * - Signed in for real (JWT + clinic_id, not the /demo flow) → switches the
 *   queue store to LIVE mode: fetches the clinic's server-owned queue and
 *   keeps it synced over WebSocket.
 * - Demo browsing → seeds the local demo queue exactly as before.
 * - Logout while live → back to demo mode.
 *
 * Pass an explicit clinicId to override (the TV display uses ?clinic=… so a
 * wall TV can run without a signed-in session).
 */
export function useQueueBoot(explicitClinicId?: string | null) {
  const token = useAuth((s) => s.token);
  const isDemo = useAuth((s) => s.isDemo);
  const userClinicId = useAuth((s) => s.user?.clinicId);

  const clinicId = explicitClinicId ?? (token && !isDemo ? userClinicId : undefined);

  useEffect(() => {
    const q = useQueue.getState();
    if (clinicId) {
      void q.startLive(clinicId);
    } else {
      if (q.mode === 'live') q.stopLive();
      if (useQueue.getState().entries.length === 0) {
        q.setEntries(demoQueue);
      }
    }
  }, [clinicId]);

  return useQueue((s) => s.mode);
}
