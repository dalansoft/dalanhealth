import { Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Ticket, Receipt, FileText } from 'lucide-react';
import { DashboardShell, type NavSection } from '@/components/layout/DashboardShell';
import { useQueue } from '@/store/queue';

const buildNav = (queueCount: number): NavSection[] => [
  {
    title: 'Main',
    accent: 'brand',
    items: [
      { to: '/receptionist', label: 'Dashboard', icon: <LayoutDashboard size={16} />, end: true },
      { to: '/receptionist/queue', label: 'Queue & Tokens', icon: <Ticket size={16} />, badge: queueCount || undefined },
    ],
  },
  {
    title: 'Patients',
    accent: 'token',
    items: [
      { to: '/receptionist/add', label: 'Add patient', icon: <UserPlus size={16} /> },
      { to: '/receptionist/billing', label: 'Billing', icon: <Receipt size={16} /> },
      { to: '/receptionist/prescription', label: 'Prescription', icon: <FileText size={16} /> },
    ],
  },
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
  const queueCount = useQueue((s) => s.entries.length);
  return (
    <DashboardShell nav={buildNav(queueCount)} title={meta.title} subtitle={meta.sub}>
      <Outlet />
    </DashboardShell>
  );
}
