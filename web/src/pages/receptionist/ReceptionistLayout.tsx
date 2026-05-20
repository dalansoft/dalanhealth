import { Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Ticket, Receipt, FileText } from 'lucide-react';
import { DashboardShell, type NavItem } from '@/components/layout/DashboardShell';

const nav: NavItem[] = [
  { to: '/receptionist', label: 'Dashboard', icon: <LayoutDashboard size={16} />, end: true },
  { to: '/receptionist/add', label: 'Add patient', icon: <UserPlus size={16} /> },
  { to: '/receptionist/queue', label: 'Queue', icon: <Ticket size={16} /> },
  { to: '/receptionist/billing', label: 'Billing', icon: <Receipt size={16} /> },
  { to: '/receptionist/prescription', label: 'Prescription', icon: <FileText size={16} /> },
];

const titles: Record<string, { title: string; sub: string }> = {
  '/receptionist': { title: 'Receptionist desk', sub: 'Fast workflow · 5 second token generation' },
  '/receptionist/add': { title: 'Add patient', sub: 'Mobile-first lookup' },
  '/receptionist/queue': { title: 'Queue', sub: 'Live token list' },
  '/receptionist/billing': { title: 'Billing', sub: 'Quick invoice' },
  '/receptionist/prescription': { title: 'Prescription', sub: 'Doctor builder' },
};

export function ReceptionistLayout() {
  const { pathname } = useLocation();
  const meta = titles[pathname] ?? { title: 'Receptionist', sub: 'DalanHealth' };
  return (
    <DashboardShell nav={nav} title={meta.title} subtitle={meta.sub}>
      <Outlet />
    </DashboardShell>
  );
}
