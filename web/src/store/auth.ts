import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'patient' | 'clinic_admin' | 'receptionist' | 'super_admin' | 'tv_display';

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
  mobile?: string;
  email?: string;
  clinicId?: string;
  clinicName?: string;
  avatarUrl?: string;
  /** For role=tv_display: which branch this TV is locked to. */
  branchId?: string;
  /** For role=tv_display: which TV-account record this session belongs to. */
  tvId?: string;
  // Extended profile fields — all optional except name & mobile (those live
  // above). Edited via /clinic/profile.
  address?: string;
  specialization?: string;
  experience?: string;
  qualification?: string;
  aboutMe?: string;
  /** Data-URI for the uploaded profile photo (demo persistence). */
  photoDataUrl?: string;
}

interface AuthState {
  user: SessionUser | null;
  token: string | null;
  isDemo: boolean;
  login: (user: SessionUser, token: string, isDemo?: boolean) => void;
  logout: () => void;
  /** Partially update fields on the current user (name, mobile, email, etc.) */
  updateUser: (patch: Partial<SessionUser>) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isDemo: false,
      login: (user, token, isDemo = false) => set({ user, token, isDemo }),
      logout: () => set({ user: null, token: null, isDemo: false }),
      updateUser: (patch) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...patch } });
      },
    }),
    { name: 'dh-auth' },
  ),
);

export const dashboardPathForRole = (role: Role): string => {
  switch (role) {
    case 'patient':
      return '/patient';
    case 'clinic_admin':
      return '/clinic';
    case 'receptionist':
      return '/receptionist';
    case 'super_admin':
      return '/admin';
    case 'tv_display':
      return '/display/clinic';
    default:
      return '/';
  }
};
