import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Hours during which the TV should show the queue. Outside this window the
 *  TV renders a "We're closed" screen and animates back to active when the
 *  next opening time arrives. Set both to `0` to disable scheduling. */
export interface TvSchedule {
  /** 0–23, inclusive. */
  startHour: number;
  /** 0–23, exclusive (e.g. endHour=20 → last active minute is 19:59). */
  endHour: number;
  /** Days of the week the TV is active. 0 = Sunday, 6 = Saturday. */
  daysActive: number[];
}

export interface TvAccount {
  id: string;
  /** Display name shown in admin UI ("Reception TV", "Waiting Room Wall"). */
  name: string;
  /** Which branch this TV is locked to. */
  branchId: string;
  /** 6-digit alphanumeric code the TV enters once to pair. */
  pairingCode: string;
  /** True once the TV has successfully paired and is in use. */
  paired: boolean;
  /** Optional auto-close schedule. */
  schedule?: TvSchedule;
  createdAt: string;
  lastSeenAt?: string;
}

interface TvAccountsState {
  accounts: TvAccount[];
  addTv: (tv: Omit<TvAccount, 'id' | 'pairingCode' | 'paired' | 'createdAt'>) => TvAccount;
  removeTv: (id: string) => void;
  updateTv: (id: string, patch: Partial<TvAccount>) => void;
  /** Mark a TV as paired (called from the pairing flow when code matches). */
  markPaired: (id: string) => void;
  /** Unpair a TV (admin "reset" — generates a fresh code and forces re-login). */
  unpair: (id: string) => void;
  /** Find a TV by its current pairing code. Used by /tv/pair. */
  findByCode: (code: string) => TvAccount | undefined;
  /** Stamp a heartbeat so admin can see when each TV was last alive. */
  touch: (id: string) => void;
}

const _genCode = (): string => {
  // 6-character alphanumeric, no ambiguous chars (no 0/O, 1/I).
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
};

const _now = () => new Date().toISOString();

// Seed a single TV against the primary branch so demo viewers can immediately
// see the management UI populated and try pairing.
const demoTvs: TvAccount[] = [
  {
    id: 'tv1',
    name: 'Reception TV',
    branchId: 'b1',
    pairingCode: 'DH4K2P',
    paired: false,
    schedule: { startHour: 9, endHour: 21, daysActive: [1, 2, 3, 4, 5, 6] },
    createdAt: new Date('2026-05-01').toISOString(),
  },
];

export const useTvAccounts = create<TvAccountsState>()(
  persist(
    (set, get) => ({
      accounts: demoTvs,
      addTv: (input) => {
        const tv: TvAccount = {
          id: `tv${Date.now()}`,
          pairingCode: _genCode(),
          paired: false,
          createdAt: _now(),
          ...input,
        };
        set((s) => ({ accounts: [...s.accounts, tv] }));
        return tv;
      },
      removeTv: (id) => set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),
      updateTv: (id, patch) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      markPaired: (id) =>
        set((s) => ({
          accounts: s.accounts.map((a) =>
            a.id === id ? { ...a, paired: true, lastSeenAt: _now() } : a,
          ),
        })),
      unpair: (id) =>
        set((s) => ({
          accounts: s.accounts.map((a) =>
            a.id === id ? { ...a, paired: false, pairingCode: _genCode(), lastSeenAt: undefined } : a,
          ),
        })),
      findByCode: (code) => {
        const normalised = code.trim().toUpperCase();
        return get().accounts.find((a) => a.pairingCode.toUpperCase() === normalised);
      },
      touch: (id) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, lastSeenAt: _now() } : a)),
        })),
    }),
    { name: 'dh-tv-accounts' },
  ),
);

/** Returns true when `now` falls inside the TV's active window. If the TV has
 *  no schedule, always returns true (always-on). */
export const isWithinSchedule = (schedule: TvSchedule | undefined, now: Date = new Date()): boolean => {
  if (!schedule) return true;
  const day = now.getDay();
  if (!schedule.daysActive.includes(day)) return false;
  const h = now.getHours() + now.getMinutes() / 60;
  return h >= schedule.startHour && h < schedule.endHour;
};
