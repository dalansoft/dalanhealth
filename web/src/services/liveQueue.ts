/**
 * Live queue plumbing — maps the FastAPI backend's snake_case queue entries
 * to the UI's QueueEntry shape, and maintains a self-healing WebSocket to
 * /ws/queue/{clinic_id} so every device (reception PC, clinic dashboard,
 * physical TV) renders the same server-owned queue in realtime.
 */

import { wsBase, type ApiQueueEntry } from '@/services/api';
import type { QueueEntry, QueueStatus } from '@/store/queue';

const STATUS_MAP: Record<string, QueueStatus> = {
  in_consultation: 'Consultation',
  queued: 'Queue',
  waiting: 'Waiting',
};

export function mapApiEntry(e: ApiQueueEntry): QueueEntry {
  return {
    id: e.id,
    token: e.token,
    patientName: e.patient_name,
    patientMobile: e.patient_mobile,
    source: e.source,
    status: STATUS_MAP[e.status] ?? 'Waiting',
    joinedAt: e.joined_at ?? '',
    wasSkipped: e.was_skipped === true,
  };
}

export function mapApiEntries(entries: ApiQueueEntry[]): QueueEntry[] {
  return entries.map(mapApiEntry);
}

interface LiveSocketHandle {
  close: () => void;
}

/**
 * Open (and keep open) the clinic's queue socket. `onEntries` fires with the
 * mapped entry list every time the backend broadcasts a change. Reconnects
 * with capped exponential backoff; pings every 30 s to keep proxies happy.
 */
export function connectQueueSocket(
  clinicId: string,
  onEntries: (entries: QueueEntry[]) => void,
  onStatus?: (connected: boolean) => void,
): LiveSocketHandle {
  let ws: WebSocket | null = null;
  let closed = false;
  let attempts = 0;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const cleanup = () => {
    if (pingTimer) clearInterval(pingTimer);
    pingTimer = null;
  };

  const open = () => {
    if (closed) return;
    try {
      ws = new WebSocket(`${wsBase}/queue/${clinicId}`);
    } catch {
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      attempts = 0;
      onStatus?.(true);
      pingTimer = setInterval(() => {
        try { ws?.send('ping'); } catch { /* reconnect handles it */ }
      }, 30_000);
    };

    ws.onmessage = (ev) => {
      if (typeof ev.data !== 'string' || ev.data === 'pong') return;
      try {
        const msg = JSON.parse(ev.data) as { type?: string; entries?: ApiQueueEntry[] };
        if (msg.type === 'queue_updated' && Array.isArray(msg.entries)) {
          onEntries(mapApiEntries(msg.entries));
        }
      } catch { /* non-JSON frames (hello/pong) are fine to ignore */ }
    };

    ws.onclose = () => {
      cleanup();
      onStatus?.(false);
      scheduleReconnect();
    };
    ws.onerror = () => {
      try { ws?.close(); } catch { /* onclose handles reconnect */ }
    };
  };

  const scheduleReconnect = () => {
    if (closed) return;
    attempts += 1;
    const delay = Math.min(30_000, 1000 * 2 ** Math.min(attempts, 5));
    reconnectTimer = setTimeout(open, delay);
  };

  open();

  return {
    close: () => {
      closed = true;
      cleanup();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try { ws?.close(); } catch { /* already closed */ }
    },
  };
}
