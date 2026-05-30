import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SoundState {
  /** Whether the call-bell chime plays when a new patient is served. */
  enabled: boolean;
  toggle: () => void;
  set: (v: boolean) => void;
}

/**
 * Per-device sound preference for queue announcements. Persisted so a TV or
 * reception machine remembers its setting across reloads. Default ON — the
 * whole point of a waiting-room TV is the audible call.
 */
export const useSound = create<SoundState>()(
  persist(
    (set, get) => ({
      enabled: true,
      toggle: () => set({ enabled: !get().enabled }),
      set: (v) => set({ enabled: v }),
    }),
    { name: 'dh-sound' },
  ),
);
