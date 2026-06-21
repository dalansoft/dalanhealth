import { create } from 'zustand';

export type QueueSource = 'ONLINE' | 'OFFLINE' | 'QR';
export type QueueStatus = 'Consultation' | 'Queue' | 'Waiting';

export interface PatientDetails {
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  /** Kilograms. */
  weight?: number;
  /** Centimetres. */
  height?: number;
  /** e.g. 'A+', 'O-', 'AB+'. */
  bloodGroup?: string;
  address?: string;
  allergies?: string;
  conditions?: string;
  emergencyName?: string;
  emergencyMobile?: string;
}

export interface QueueEntry {
  id: string;
  /** Permanent, patient-visible token assigned at booking time. Never changes
   *  after creation — patients track this number. Skip / call-back only
   *  affect queue position, not this. */
  token: number;
  patientName: string;
  patientMobile: string;
  source: QueueSource;
  status: QueueStatus;
  joinedAt: string;
  /** True if this patient was skipped earlier. */
  wasSkipped?: boolean;
  /** Internal sort key for queue position. Defaults to token when unset.
   *  Skipping makes it larger (moves to back); calling back makes it smaller
   *  (jumps to front). The patient's `token` itself stays the same. */
  order?: number;
  /** Extended health record captured at booking. All fields optional —
   *  receptionist can skip the "More details" section for a fast flow. */
  details?: PatientDetails;
  /** Priority/emergency patient — jumps in right after the current
   *  consultation, ahead of the normal waiting tokens. */
  emergency?: boolean;
  /** Daily emergency sequence (1, 2, …). Shown as "E1" etc. instead of the
   *  normal "#23" token, and resets at the start of each day. */
  emergencyNo?: number;
  /** Set when the consultation is completed — the patient leaves the live
   *  queue but stays in today's history (Patients section). */
  completedAt?: string;
}

/** Display label for a token: "E1" for an emergency (priority) patient,
 *  "#23" for a normal sequential queue token. */
export const tokenLabel = (
  e: Pick<QueueEntry, 'emergency' | 'emergencyNo' | 'token'>,
): string => (e.emergency ? `E${e.emergencyNo ?? ''}` : `#${e.token}`);

export type QueueMode = 'demo' | 'live';

interface QueueState {
  entries: QueueEntry[];
  /** Today's completed patients (most-recent first) — left the live queue
   *  after their consultation, but kept for the Patients-section history. */
  completed: QueueEntry[];
  /** demo → browser-local data + BroadcastChannel tab sync (the /demo flow).
   *  live → the FastAPI backend owns the queue; actions are REST calls and a
   *  WebSocket keeps every device in sync. */
  mode: QueueMode;
  /** True while the live WebSocket is connected (drives the Live badge). */
  liveConnected: boolean;
  setEntries: (e: QueueEntry[]) => void;
  addEntry: (e: QueueEntry) => void;
  /** Add a priority/emergency patient: inserted right after the current
   *  consultation, numbered E1, E2… (daily reset). Returns the assigned
   *  emergency number so the caller can show it. */
  addEmergency: (e: Omit<QueueEntry, 'token' | 'status' | 'order' | 'emergency' | 'emergencyNo'>) => number;
  /** Edit a patient's name / details in place (mobile + token stay fixed). */
  updateEntry: (id: string, patch: Partial<Pick<QueueEntry, 'patientName' | 'details'>>) => void;
  advance: () => void;
  skipCurrent: () => void;
  /** Bring a previously-skipped patient back to the front (becomes the next
   *  after the currently-serving one). */
  callBack: (id: string) => void;
  /** Switch to live mode: fetch the clinic's queue and open the socket. */
  startLive: (clinicId: string) => Promise<void>;
  /** Tear down the socket and return to demo mode. */
  stopLive: () => void;
}

const orderOf = (e: QueueEntry): number => e.order ?? e.token;

const sortAndStatus = (list: QueueEntry[]): QueueEntry[] => {
  const sorted = [...list].sort((a, b) => orderOf(a) - orderOf(b));
  return sorted.map((e, i) => ({
    ...e,
    status: i === 0 ? 'Consultation' : i === 1 ? 'Queue' : 'Waiting',
  }));
};

// ─── Cross-tab sync via BroadcastChannel ───────────────────────────────────
// The TV display opens in a separate browser tab (target="_blank"), which gets
// its own Zustand store. Without a sync layer, calling `advance()` in the
// dashboard tab would never reach the TV display tab. We use BroadcastChannel
// so every action in any tab is mirrored to all other tabs of the same origin.
//
// Persistence to localStorage is the secondary safety net — if the TV display
// is opened *after* state has been set elsewhere, it can hydrate from storage
// instead of starting empty and waiting for the next message.

const CHANNEL_NAME = 'dh-queue-sync';
const STORAGE_KEY = 'dh-queue-entries';
const EMERGENCY_KEY = 'dh-emergency-counter';
const COMPLETED_KEY = 'dh-queue-completed';

/** Today's completed patients, persisted so the Patients-section history
 *  survives reloads. Resets at the start of each new day. */
const readCompleted = (): QueueEntry[] => {
  if (typeof window === 'undefined') return [];
  const day = new Date().toISOString().slice(0, 10);
  try {
    const raw = window.localStorage.getItem(COMPLETED_KEY);
    const data = raw ? (JSON.parse(raw) as { day: string; list: QueueEntry[] }) : null;
    return data && data.day === day && Array.isArray(data.list) ? data.list : [];
  } catch {
    return [];
  }
};

const persistCompleted = (list: QueueEntry[]) => {
  if (typeof window === 'undefined') return;
  const day = new Date().toISOString().slice(0, 10);
  try { window.localStorage.setItem(COMPLETED_KEY, JSON.stringify({ day, list })); } catch {}
};

/** Per-day emergency counter: never reuses a number within a day (survives
 *  completing earlier emergency patients) and resets to 1 each new day. */
const nextEmergencyNumber = (): number => {
  if (typeof window === 'undefined') return 1;
  const day = new Date().toISOString().slice(0, 10);
  try {
    const raw = window.localStorage.getItem(EMERGENCY_KEY);
    const data = raw ? (JSON.parse(raw) as { day: string; n: number }) : null;
    const n = (data && data.day === day ? data.n : 0) + 1;
    window.localStorage.setItem(EMERGENCY_KEY, JSON.stringify({ day, n }));
    return n;
  } catch {
    return 1;
  }
};

let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try { channel = new BroadcastChannel(CHANNEL_NAME); } catch { channel = null; }
}

// When applying an entries update that came from another tab (or from storage
// hydration), don't broadcast it back out — that would cause echo loops.
let applyingRemote = false;

const persist = (entries: QueueEntry[]) => {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch {}
};

const broadcast = (entries: QueueEntry[]) => {
  if (applyingRemote) return;
  persist(entries);
  if (channel) {
    try { channel.postMessage({ type: 'sync', entries }); } catch {}
  }
};

const readPersisted = (): QueueEntry[] | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as QueueEntry[];
  } catch {
    return null;
  }
};

// Live-mode socket handle lives outside the store (not serializable state).
let liveSocket: { close: () => void } | null = null;
let liveClinicId: string | null = null;

export const useQueue = create<QueueState>((set, get) => {
  // Hydrate from localStorage on first store creation so a freshly-opened TV
  // tab can pick up the queue without waiting for a broadcast.
  const initial = readPersisted() ?? [];

  // Listen for sync messages from other tabs and for hydrate requests.
  // Demo-mode only — in live mode the backend WebSocket is the sync layer.
  if (channel) {
    channel.addEventListener('message', (e) => {
      if (get().mode === 'live') return;
      const msg = e.data as { type?: string; entries?: QueueEntry[] } | null;
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'sync' && Array.isArray(msg.entries)) {
        applyingRemote = true;
        try { set({ entries: msg.entries }); } finally { applyingRemote = false; }
      } else if (msg.type === 'request') {
        // Another tab just opened — respond with our current state so it can
        // hydrate even if localStorage hasn't been written yet.
        const current = get().entries;
        if (current.length > 0) {
          try { channel?.postMessage({ type: 'sync', entries: current }); } catch {}
        }
      }
    });
    // Ask other tabs for their current state. Useful when a tab loads with an
    // empty localStorage but another tab already has live entries in memory.
    setTimeout(() => {
      try { channel?.postMessage({ type: 'request' }); } catch {}
    }, 50);
  }

  /** Demo-only persistence + cross-tab broadcast. */
  const publish = (entries: QueueEntry[]) => {
    if (get().mode === 'demo') broadcast(entries);
  };

  return {
    entries: initial,
    completed: readCompleted(),
    mode: 'demo',
    liveConnected: false,
    setEntries: (e) => {
      const next = sortAndStatus(e);
      set({ entries: next });
      publish(next);
    },
    addEntry: (e) => {
      const next = sortAndStatus([...get().entries, e]);
      set({ entries: next });
      publish(next);
    },
    addEmergency: (e) => {
      const list = get().entries;
      const no = nextEmergencyNumber();
      // Slot right after the current consultation (smallest order) and before
      // the next normal token; the tiny `no` nudge keeps E1 before E2.
      const minOrder = list.reduce((m, x) => Math.min(m, orderOf(x)), Infinity);
      const order = (isFinite(minOrder) ? minOrder + 0.5 : 1) + no * 0.0001;
      // Internal token stays unique (so "now serving" change-detection and
      // React keys never collide). It's never shown — every queue surface
      // renders tokenLabel(), which prints "E1" for emergencies.
      const token = list.reduce((m, x) => Math.max(m, x.token), 0) + 1;
      const entry: QueueEntry = {
        ...e,
        token,
        emergency: true,
        emergencyNo: no,
        order,
        status: 'Waiting',
      };
      const next = sortAndStatus([...list, entry]);
      set({ entries: next });
      publish(next);
      return no;
    },
    updateEntry: (id, patch) => {
      const next = sortAndStatus(get().entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
      set({ entries: next });
      publish(next);
      // Keep today's history in sync if this patient is already there.
      const comp = get().completed.map((e) => (e.id === id ? { ...e, ...patch } : e));
      set({ completed: comp });
      persistCompleted(comp);
    },
    advance: () => {
      // Record the patient leaving consultation in today's history so the
      // Patients section can show completed patients, while the live queue
      // and TV keep showing only who's still queued.
      const markCompleted = (done?: QueueEntry) => {
        if (!done) return;
        const rec: QueueEntry = {
          ...done,
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const completed = [rec, ...get().completed].slice(0, 200);
        set({ completed });
        persistCompleted(completed);
      };
      if (get().mode === 'live') {
        const done = get().entries[0];
        import('@/services/api').then(({ queueApi }) =>
          queueApi.completeCurrent().then(({ entries }) =>
            import('@/services/liveQueue').then(({ mapApiEntries }) => {
              set({ entries: mapApiEntries(entries) });
              markCompleted(done);
            }),
          ),
        ).catch(() => {/* WS will reconcile */});
        return;
      }
      const list = get().entries;
      const done = list[0];
      const next = sortAndStatus(list.slice(1));
      set({ entries: next });
      markCompleted(done);
      publish(next);
    },
    skipCurrent: () => {
      if (get().mode === 'live') {
        import('@/services/api').then(({ queueApi }) =>
          queueApi.skipCurrent().then(({ entries }) =>
            import('@/services/liveQueue').then(({ mapApiEntries }) =>
              set({ entries: mapApiEntries(entries) }),
            ),
          ),
        ).catch(() => {/* WS will reconcile */});
        return;
      }
      const list = get().entries;
      if (list.length === 0) return;
      const [first, ...rest] = list;
      // Bump the sort position to the back (max order + 1). Token stays the
      // same — the patient still knows themselves as "#N". Setting wasSkipped
      // surfaces the Skipped badge + Call back button in the UI.
      const maxOrder = list.reduce((m, e) => Math.max(m, orderOf(e)), 0);
      const skipped: QueueEntry = { ...first, order: maxOrder + 1, wasSkipped: true };
      const next = sortAndStatus([...rest, skipped]);
      set({ entries: next });
      publish(next);
    },
    callBack: (id) => {
      if (get().mode === 'live') {
        import('@/services/api').then(({ queueApi }) =>
          queueApi.callBack(id).then(({ entries }) =>
            import('@/services/liveQueue').then(({ mapApiEntries }) =>
              set({ entries: mapApiEntries(entries) }),
            ),
          ),
        ).catch(() => {/* WS will reconcile */});
        return;
      }
      const list = get().entries;
      const target = list.find((e) => e.id === id);
      if (!target) return;
      // Insert the called-back patient right after the currently-serving one
      // (= second smallest order). Token is preserved — the patient sees the
      // same "#19" they originally booked, just now they're next in line.
      // `wasSkipped` stays TRUE so the yellow tint persists on the TV and in
      // the queue table — that way staff + patients know this token was
      // deferred earlier and has returned (an audit trail for the visit).
      const others = list.filter((e) => e.id !== id);
      const minOrder = others.reduce((m, e) => Math.min(m, orderOf(e)), Infinity);
      const newOrder = isFinite(minOrder) ? minOrder + 0.5 : 1;
      const updated: QueueEntry = { ...target, order: newOrder };
      const next = sortAndStatus([...others, updated]);
      set({ entries: next });
      publish(next);
    },
    startLive: async (clinicId: string) => {
      // Idempotent: navigating between clinic pages re-runs the boot hook —
      // don't tear down a healthy socket for the same clinic.
      if (liveClinicId === clinicId && liveSocket && get().mode === 'live') return;
      const { queueApi } = await import('@/services/api');
      const { mapApiEntries, connectQueueSocket } = await import('@/services/liveQueue');
      liveSocket?.close();
      liveClinicId = clinicId;
      set({ mode: 'live' });
      try {
        const listing = await queueApi.list();
        set({ entries: mapApiEntries(listing) });
      } catch {
        set({ entries: [] }); // socket reconcile / next action will populate
      }
      liveSocket = connectQueueSocket(
        clinicId,
        (entries) => set({ entries }),
        (connected) => set({ liveConnected: connected }),
      );
    },
    stopLive: () => {
      liveSocket?.close();
      liveSocket = null;
      liveClinicId = null;
      set({ mode: 'demo', liveConnected: false });
    },
  };
});
