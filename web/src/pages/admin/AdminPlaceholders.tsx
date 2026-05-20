import { Wallet, Gift, Bell, Headset, UserCog, BarChart3, Activity, Settings, Layers } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

const make = (icon: React.ReactNode, title: string, desc: string) => () => (
  <div className="card p-12">
    <EmptyState
      icon={icon}
      title={title}
      description={desc}
      action={<Button variant="outline">Configure</Button>}
    />
  </div>
);

export const AdminWallet = make(<Wallet size={22} />, 'Wallet & recharge ledger', 'View every recharge, deduction and refund across all clinics. Coming online with backend wiring.');
export const AdminPlans = make(<Layers size={22} />, 'Plans & pricing', 'Toggle features, edit per-visit rates and manage plan upgrades.');
export const AdminCashback = make(<Gift size={22} />, 'Cashback campaigns', 'Create festival, doctor-promo and first-booking rewards. Booking-fee adjustment only.');
export const AdminNotifications = make(<Bell size={22} />, 'Notification center', 'Push, WhatsApp, SMS and Email delivery monitoring with fallback chains.');
export const AdminSupport = make(<Headset size={22} />, 'Support inbox', 'Tickets from clinics — login issues, queue questions, billing help.');
export const AdminTeam = make(<UserCog size={22} />, 'Company admins', 'Support, sales, finance and technical roles with scoped permissions.');
export const AdminReports = make(<BarChart3 size={22} />, 'Reports', 'Custom report builder — revenue by city, plan, doctor, week.');
export const AdminSystem = make(<Activity size={22} />, 'System health', 'API latency, websocket connections, notification queue, DB metrics.');
export const AdminSettings = make(<Settings size={22} />, 'Settings', 'Branding, defaults, feature flags and dynamic configuration.');
