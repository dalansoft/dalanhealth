import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Branch {
  id: string;
  name: string;
  city: string;
  address?: string;
  /** True if this is the primary / HQ branch. */
  primary?: boolean;
  /** Doctors attending at this branch. */
  doctors?: string[];
  /** Geo-coordinates of the clinic, used to geofence QR self-booking. */
  lat?: number;
  lng?: number;
}

interface BranchState {
  branches: Branch[];
  currentBranchId: string;
  setBranches: (b: Branch[]) => void;
  switchBranch: (id: string) => void;
  addBranch: (b: Omit<Branch, 'id'>) => void;
}

// Demo seed — three branches under a single clinic group. In production this
// would come from the backend when the clinic admin signs in.
const demoBranches: Branch[] = [
  { id: 'b1', name: 'Sharma ENT Clinic', city: 'Boring Road, Patna', primary: true, address: '12 Boring Road, Patna 800001', doctors: ['Dr. Anil Sharma'], lat: 25.6093, lng: 85.1235 },
  { id: 'b2', name: 'Sharma ENT — Kankarbagh', city: 'Kankarbagh, Patna', address: 'Plot 7, Main Road, Kankarbagh, Patna', doctors: ['Dr. Priya Gupta'], lat: 25.5934, lng: 85.1565 },
  { id: 'b3', name: 'Sharma ENT — Gaya', city: 'Civil Lines, Gaya', address: 'Near Bus Stand, Civil Lines, Gaya 823001', doctors: ['Dr. Ravi Kumar'], lat: 24.7969, lng: 85.0002 },
];

// Cross-tab sync — switching branches in the clinic dashboard tab should also
// flip the branch on any open TV-display tab. Same pattern as the queue store.
const CHANNEL_NAME = 'dh-branch-sync';
let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try { channel = new BroadcastChannel(CHANNEL_NAME); } catch { channel = null; }
}
let applyingRemote = false;

export const useBranch = create<BranchState>()(
  persist(
    (set, get) => {
      if (channel) {
        channel.addEventListener('message', (e) => {
          const msg = e.data as { type?: string; currentBranchId?: string } | null;
          if (!msg) return;
          if (msg.type === 'switch' && typeof msg.currentBranchId === 'string') {
            applyingRemote = true;
            try { set({ currentBranchId: msg.currentBranchId }); } finally { applyingRemote = false; }
          }
        });
      }

      const broadcast = (currentBranchId: string) => {
        if (applyingRemote || !channel) return;
        try { channel.postMessage({ type: 'switch', currentBranchId }); } catch {}
      };

      return {
        branches: demoBranches,
        currentBranchId: demoBranches[0].id,
        setBranches: (b) => set({ branches: b }),
        switchBranch: (id) => {
          const exists = get().branches.some((br) => br.id === id);
          if (exists) {
            set({ currentBranchId: id });
            broadcast(id);
          }
        },
        addBranch: (b) => {
          const id = `b${Date.now()}`;
          set((s) => ({ branches: [...s.branches, { ...b, id }] }));
        },
      };
    },
    { name: 'dh-branch' },
  ),
);

/** Convenience selector for the currently active branch object. */
export const useCurrentBranch = (): Branch | undefined => {
  return useBranch((s) => s.branches.find((b) => b.id === s.currentBranchId));
};
