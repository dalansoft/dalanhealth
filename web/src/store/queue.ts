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
}

interface QueueState {
  entries: QueueEntry[];
  setEntries: (e: QueueEntry[]) => void;
  addEntry: (e: QueueEntry) => void;
  advance: () => void;
  skipCurrent: () => void;
  /** Bring a previously-skipped patient back to the front (becomes the next
   *  after the currently-serving one). Resets their wasSkipped flag. */
  callBack: (id: string) => void;
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

export const useQueue = create<QueueState>((set, get) => {
  // Hydrate from localStorage on first store creation so a freshly-opened TV
  // tab can pick up the queue without waiting for a broadcast.
  const initial = readPersisted() ?? [];

  // Listen for sync messages from other tabs and for hydrate requests.
  if (channel) {
    channel.addEventListener('message', (e) => {
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

  return {
    entries: initial,
    setEntries: (e) => {
      const next = sortAndStatus(e);
      set({ entries: next });
      broadcast(next);
    },
    addEntry: (e) => {
      const next = sortAndStatus([...get().entries, e]);
      set({ entries: next });
      broadcast(next);
    },
    advance: () => {
      const next = sortAndStatus(get().entries.slice(1));
      set({ entries: next });
      broadcast(next);
    },
    skipCurrent: () => {
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
      broadcast(next);
    },
    callBack: (id) => {
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
      broadcast(next);
    },
  };
});
