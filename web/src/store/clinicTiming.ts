import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TimeSlot {
  id: string;
  label: string;
  from: string; // 'HH:MM' 24h
  to: string;   // 'HH:MM' 24h
}

const DEFAULTS: TimeSlot[] = [
  { id: 's1', label: 'Morning', from: '10:00', to: '14:00' },
  { id: 's2', label: 'Evening', from: '17:00', to: '20:00' },
];

// Cross-tab sync so the TV display / QR / booking pages reflect timing edits
// from the Settings tab instantly (same pattern as the sound/branch stores).
const CHANNEL_NAME = 'dh-timing-sync';
let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try { channel = new BroadcastChannel(CHANNEL_NAME); } catch { channel = null; }
}
let applyingRemote = false;

interface TimingState {
  slots: TimeSlot[];
  setSlots: (slots: TimeSlot[]) => void;
}

export const useClinicTiming = create<TimingState>()(
  persist(
    (set, get) => {
      if (channel) {
        channel.addEventListener('message', (e) => {
          const msg = e.data as { type?: string; slots?: TimeSlot[] } | null;
          if (!msg || msg.type !== 'sync' || !Array.isArray(msg.slots)) return;
          applyingRemote = true;
          try { set({ slots: msg.slots }); } finally { applyingRemote = false; }
        });
      }
      const broadcast = () => {
        if (applyingRemote || !channel) return;
        try { channel.postMessage({ type: 'sync', slots: get().slots }); } catch { /* ignore */ }
      };
      return {
        slots: DEFAULTS,
        setSlots: (slots) => { set({ slots: slots.length ? slots : DEFAULTS }); broadcast(); },
      };
    },
    { name: 'dh-timing' },
  ),
);

// ─── Formatting helpers ─────────────────────────────────────────────────────
export const fmtTime = (hhmm: string): string => {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h)) return hhmm;
  const ap = h < 12 ? 'AM' : 'PM';
  const h12 = ((h + 11) % 12) + 1;
  return m ? `${h12}:${String(m).padStart(2, '0')} ${ap}` : `${h12} ${ap}`;
};
export const fmtSlot = (s: TimeSlot): string => `${fmtTime(s.from)} – ${fmtTime(s.to)}`;
export const timingString = (slots: TimeSlot[]): string => slots.map(fmtSlot).join(', ');
