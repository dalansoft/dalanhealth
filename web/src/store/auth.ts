import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'patient' | 'clinic_admin' | 'receptionist' | 'super_admin';

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
  mobile?: string;
  email?: string;
  clinicId?: string;
  clinicName?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: SessionUser | null;
  token: string | null;
  isDemo: boolean;
  login: (user: SessionUser, token: string, isDemo?: boolean) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isDemo: false,
      login: (user, token, isDemo = false) => set({ user, token, isDemo }),
      logout: () => set({ user: null, token: null, isDemo: false }),
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
  }
};
