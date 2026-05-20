import { create } from 'zustand';

export type QueueSource = 'ONLINE' | 'OFFLINE' | 'QR';
export type QueueStatus = 'Consultation' | 'Queue' | 'Waiting';

export interface QueueEntry {
  id: string;
  token: number;
  patientName: string;
  patientMobile: string;
  source: QueueSource;
  status: QueueStatus;
  joinedAt: string;
}

interface QueueState {
  entries: QueueEntry[];
  setEntries: (e: QueueEntry[]) => void;
  addEntry: (e: QueueEntry) => void;
  advance: () => void;
  skipCurrent: () => void;
}

const sortAndStatus = (list: QueueEntry[]): QueueEntry[] => {
  const sorted = [...list].sort((a, b) => a.token - b.token);
  return sorted.map((e, i) => ({
    ...e,
    status: i === 0 ? 'Consultation' : i === 1 ? 'Queue' : 'Waiting',
  }));
};

export const useQueue = create<QueueState>((set, get) => ({
  entries: [],
  setEntries: (e) => set({ entries: sortAndStatus(e) }),
  addEntry: (e) => set({ entries: sortAndStatus([...get().entries, e]) }),
  advance: () => {
    const rest = get().entries.slice(1);
    set({ entries: sortAndStatus(rest) });
  },
  skipCurrent: () => {
    const [first, ...rest] = get().entries;
    if (!first) return;
    set({ entries: sortAndStatus([...rest, first]) });
  },
}));
