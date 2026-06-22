import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { demoStaff } from '@/services/demoData';

export type StaffRole = 'Receptionist' | 'Compounder' | 'Billing Staff';
export type StaffStatus = 'Active' | 'Invited';

export interface StaffMember {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: StaffRole;
  status: StaffStatus;
  addedOn: string;
  /** 6-digit activation code, present while status === 'Invited'. */
  otp?: string;
}

const gen6 = () => String(Math.floor(100000 + Math.random() * 900000));
const today = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

const SEED: StaffMember[] = demoStaff.map((s) => ({
  ...s,
  role: s.role as StaffRole,
  status: s.status as StaffStatus,
  // Seeded "Invited" member gets a sample OTP so the flow is demoable.
  otp: s.status === 'Invited' ? gen6() : undefined,
}));

interface StaffState {
  members: StaffMember[];
  /** Invite a new member — created as "Invited" with a fresh OTP. Returns it. */
  invite: (m: { name: string; mobile: string; email?: string; role: StaffRole }) => StaffMember;
  /** Verify an OTP for a member; activates them on a match. */
  verifyOtp: (id: string, code: string) => boolean;
  /** Issue a new OTP for an invited member. */
  resendOtp: (id: string) => string | undefined;
  remove: (id: string) => void;
}

export const useStaff = create<StaffState>()(
  persist(
    (set, get) => ({
      members: SEED,
      invite: (m) => {
        const member: StaffMember = {
          id: `s-${Date.now()}`,
          name: m.name.trim(),
          mobile: m.mobile.trim(),
          email: m.email?.trim() || undefined,
          role: m.role,
          status: 'Invited',
          addedOn: today(),
          otp: gen6(),
        };
        set((s) => ({ members: [member, ...s.members] }));
        return member;
      },
      verifyOtp: (id, code) => {
        const member = get().members.find((x) => x.id === id);
        if (!member || member.otp !== code.trim()) return false;
        set((s) => ({
          members: s.members.map((x) => (x.id === id ? { ...x, status: 'Active', otp: undefined } : x)),
        }));
        return true;
      },
      resendOtp: (id) => {
        const code = gen6();
        set((s) => ({ members: s.members.map((x) => (x.id === id ? { ...x, otp: code, status: 'Invited' } : x)) }));
        return code;
      },
      remove: (id) => set((s) => ({ members: s.members.filter((x) => x.id !== id) })),
    }),
    { name: 'dh-staff' },
  ),
);
