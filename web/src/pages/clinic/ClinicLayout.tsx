import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Ticket, Calendar, Receipt, FileText, BarChart3,
  Wallet, UserCog, QrCode, Bell, Settings, CreditCard, UserCircle, Building2,
  Monitor,
} from 'lucide-react';
import { DashboardShell, type NavSection } from '@/components/layout/DashboardShell';
import { useCurrentBranch } from '@/store/branch';

const nav: NavSection[] = [
  {
    title: 'Main',
    accent: 'brand',
    items: [
      { to: '/clinic', label: 'Dashboard', icon: <LayoutDashboard size={16} />, end: true },
      { to: '/clinic/queue', label: 'Queue & Tokens', icon: <Ticket size={16} />, badge: 6 },
      { to: '/clinic/patients', label: 'Patients', icon: <Users size={16} /> },
      { to: '/clinic/appointments', label: 'Appointments', icon: <Calendar size={16} /> },
      { to: '/clinic/prescription', label: 'Prescriptions', icon: <FileText size={16} /> },
      { to: '/clinic/reports', label: 'Reports & Analytics', icon: <BarChart3 size={16} /> },
    ],
  },
  {
    title: 'Billing',
    accent: 'token',
    items: [
      { to: '/clinic/billing', label: 'Wallet & Billing', icon: <Receipt size={16} /> },
      { to: '/clinic/wallet', label: 'Transactions', icon: <CreditCard size={16} /> },
    ],
  },
  {
    title: 'Clinic',
    accent: 'accent',
    items: [
      { to: '/clinic/profile', label: 'Profile', icon: <UserCircle size={16} /> },
      { to: '/clinic/branches', label: 'Branches', icon: <Building2 size={16} /> },
      { to: '/clinic/tv-displays', label: 'TV Displays', icon: <Monitor size={16} /> },
      { to: '/clinic/staff', label: 'Staff', icon: <UserCog size={16} /> },
      { to: '/clinic/qr', label: 'QR Posters', icon: <QrCode size={16} /> },
      { to: '/clinic/notifications', label: 'Notifications', icon: <Bell size={16} /> },
      { to: '/clinic/settings', label: 'Settings', icon: <Settings size={16} /> },
    ],
  },
];

const titles: Record<string, { title: string; sub: string }> = {
  '/clinic': { title: 'Clinic dashboard', sub: 'Today at a glance' },
  '/clinic/queue': { title: 'Live queue', sub: 'Realtime — offline, online and QR merged' },
  '/clinic/patients': { title: 'Patients', sub: 'Search history and visit records' },
  '/clinic/billing': { title: 'Billing', sub: 'Create and share invoices' },
  '/clinic/prescription': { title: 'Prescription', sub: 'Doctor-grade prescription builder' },
  '/clinic/wallet': { title: 'Wallet & recharge', sub: 'Prepaid balance and consumption' },
  '/clinic/qr': { title: 'Clinic QR', sub: 'Patients scan to join your queue' },
  '/clinic/profile': { title: 'My profile', sub: 'Edit your public details' },
  '/clinic/branches': { title: 'Branches', sub: 'Add, switch, or manage clinic locations' },
  '/clinic/tv-displays': { title: 'TV Displays', sub: 'Register, pair, and schedule waiting-room TVs' },
};

export function ClinicLayout() {
  const { pathname } = useLocation();
  const meta = titles[pathname] ?? { title: 'Clinic', sub: 'DalanHealth' };
  const branch = useCurrentBranch();
  // Subtitle follows the selected branch so it updates instantly when the user
  // switches branches in the BranchSwitcher chip.
  const subtitle = branch ? `${branch.name} · ${meta.sub}` : meta.sub;
  return (
    <DashboardShell nav={nav} title={meta.title} subtitle={subtitle}>
      <Outlet />
    </DashboardShell>
  );
}
