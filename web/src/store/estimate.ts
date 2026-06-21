import { create } from 'zustand';

/** How the per-token wait estimate is produced:
 *  - 'ai'     → auto-analyse real consultation durations (updates itself).
 *  - 'clinic' → a fixed "minutes per patient" the clinic sets. */
export type EstimateMode = 'ai' | 'clinic';

interface EstimateState {
  mode: EstimateMode;
  clinicMinutes: number;
  setMode: (m: EstimateMode) => void;
  setClinicMinutes: (n: number) => void;
}

const KEY = 'dh-estimate-settings';

const load = (): { mode: EstimateMode; clinicMinutes: number } | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persist = (s: { mode: EstimateMode; clinicMinutes: number }) => {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
};

const initial = load();

export const useEstimate = create<EstimateState>((set, get) => ({
  mode: initial?.mode ?? 'ai',
  clinicMinutes: initial?.clinicMinutes ?? 12,
  setMode: (mode) => { set({ mode }); persist({ mode, clinicMinutes: get().clinicMinutes }); },
  setClinicMinutes: (clinicMinutes) => { set({ clinicMinutes }); persist({ mode: get().mode, clinicMinutes }); },
}));
