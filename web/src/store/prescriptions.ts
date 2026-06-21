import { create } from 'zustand';

export type RxKind = 'digital' | 'upload' | 'photo';

export interface Rx {
  id: string;
  patientName: string;
  patientMobile: string;
  date: string;     // display, e.g. "21 Jun 2026"
  kind: RxKind;
  summary: string;  // diagnosis line or file name
}

const KEY = 'dh-prescriptions';
const todayLabel = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// A little history so "all patients" isn't empty in the demo.
const SEED: Rx[] = [
  { id: 'rx-seed-1', patientName: 'Raj Verma', patientMobile: '+91 91234 56780', date: '20 Jun 2026', kind: 'digital', summary: 'Otitis media — Amoxicillin, Paracetamol' },
  { id: 'rx-seed-2', patientName: 'Saurabh Singh', patientMobile: '+91 99887 12345', date: '18 Jun 2026', kind: 'upload', summary: 'scan_prescription.pdf' },
  { id: 'rx-seed-3', patientName: 'Pooja Sharma', patientMobile: '+91 98700 33445', date: '15 Jun 2026', kind: 'photo', summary: 'Photo of handwritten Rx' },
  { id: 'rx-seed-4', patientName: 'Shailesh Kumar', patientMobile: '+91 98765 43210', date: '12 Jun 2026', kind: 'digital', summary: 'Acute pharyngitis — Azithromycin' },
];

const load = (): Rx[] => {
  if (typeof window === 'undefined') return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? (parsed as Rx[]) : SEED;
  } catch {
    return SEED;
  }
};

interface State {
  list: Rx[];
  add: (rx: Omit<Rx, 'id' | 'date'>) => void;
}

export const usePrescriptions = create<State>((set, get) => ({
  list: load(),
  add: (rx) => {
    const next: Rx[] = [{ ...rx, id: `rx-${Date.now()}`, date: todayLabel() }, ...get().list];
    set({ list: next });
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    }
  },
}));
