import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Ticket, Calendar, Receipt, FileText, BarChart3,
  Wallet, UserCog, QrCode, Bell, Settings,
} from 'lucide-react';
import { DashboardShell, type NavItem } from '@/components/layout/DashboardShell';
import { useAuth } from '@/store/auth';

const nav: NavItem[] = [
  { to: '/clinic', label: 'Dashboard', icon: <LayoutDashboard size={16} />, end: true },
  { to: '/clinic/queue', label: 'Queue', icon: <Ticket size={16} /> },
  { to: '/clinic/patients', label: 'Patients', icon: <Users size={16} /> },
  { to: '/clinic/appointments', label: 'Appointments', icon: <Calendar size={16} /> },
  { to: '/clinic/billing', label: 'Billing', icon: <Receipt size={16} /> },
  { to: '/clinic/prescription', label: 'Prescription', icon: <FileText size={16} /> },
  { to: '/clinic/reports', label: 'Reports', icon: <BarChart3 size={16} /> },
  { to: '/clinic/wallet', label: 'Wallet', icon: <Wallet size={16} /> },
  { to: '/clinic/staff', label: 'Staff', icon: <UserCog size={16} /> },
  { to: '/clinic/qr', label: 'QR', icon: <QrCode size={16} /> },
  { to: '/clinic/notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { to: '/clinic/settings', label: 'Settings', icon: <Settings size={16} /> },
];

const titles: Record<string, { title: string; sub: string }> = {
  '/clinic': { title: 'Clinic dashboard', sub: 'Today at a glance' },
  '/clinic/queue': { title: 'Live queue', sub: 'Realtime — offline, online and QR merged' },
  '/clinic/patients': { title: 'Patients', sub: 'Search history and visit records' },
  '/clinic/billing': { title: 'Billing', sub: 'Create and share invoices' },
  '/clinic/prescription': { title: 'Prescription', sub: 'Doctor-grade prescription builder' },
  '/clinic/wallet': { title: 'Wallet & recharge', sub: 'Prepaid balance and consumption' },
  '/clinic/qr': { title: 'Clinic QR', sub: 'Patients scan to join your queue' },
};

export function ClinicLayout() {
  const { pathname } = useLocation();
  const meta = titles[pathname] ?? { title: 'Clinic', sub: 'DalanHealth' };
  const clinicName = useAuth((s) => s.user?.clinicName);
  return (
    <DashboardShell nav={nav} title={meta.title} subtitle={clinicName ? `${clinicName} · ${meta.sub}` : meta.sub}>
      <Outlet />
    </DashboardShell>
  );
}
