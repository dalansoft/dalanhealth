import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, IndianRupee, Wallet, Layers, Bell,
  Headset, UserCog, BarChart3, Activity, Settings,
} from 'lucide-react';
import { DashboardShell, type NavSection } from '@/components/layout/DashboardShell';

const nav: NavSection[] = [
  {
    title: 'Main',
    accent: 'brand',
    items: [
      { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={16} />, end: true },
      { to: '/admin/clinics', label: 'Clinics', icon: <Building2 size={16} />, badge: 124 },
      { to: '/admin/reports', label: 'Reports & Analytics', icon: <BarChart3 size={16} /> },
    ],
  },
  {
    title: 'Finance',
    accent: 'token',
    items: [
      { to: '/admin/revenue', label: 'Revenue', icon: <IndianRupee size={16} /> },
      { to: '/admin/wallet', label: 'Wallet & recharge', icon: <Wallet size={16} /> },
      { to: '/admin/plans', label: 'Plans & pricing', icon: <Layers size={16} /> },
    ],
  },
  {
    title: 'Operations',
    accent: 'accent',
    items: [
      { to: '/admin/notifications', label: 'Notifications', icon: <Bell size={16} /> },
      { to: '/admin/support', label: 'Support', icon: <Headset size={16} />, badge: 4 },
      { to: '/admin/team', label: 'Company admins', icon: <UserCog size={16} /> },
      { to: '/admin/system', label: 'System health', icon: <Activity size={16} /> },
      { to: '/admin/settings', label: 'Settings', icon: <Settings size={16} /> },
    ],
  },
];

const titles: Record<string, { title: string; sub: string }> = {
  '/admin': { title: 'Operations dashboard', sub: 'Realtime view of every clinic on DalanHealth' },
  '/admin/clinics': { title: 'Clinics', sub: 'Onboarded clinics across India' },
  '/admin/revenue': { title: 'Revenue', sub: 'MTD, YTD and per-clinic breakdown' },
  '/admin/wallet': { title: 'Wallet & recharges', sub: 'All wallet transactions across clinics' },
};

export function AdminLayout() {
  const { pathname } = useLocation();
  const meta = titles[pathname] ?? { title: 'Super admin', sub: 'Dalansoft control center' };
  return (
    <DashboardShell nav={nav} title={meta.title} subtitle={meta.sub}>
      <Outlet />
    </DashboardShell>
  );
}
