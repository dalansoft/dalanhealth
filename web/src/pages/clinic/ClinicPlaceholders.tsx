import { Users, Calendar, BarChart3, UserCog, Bell, Settings } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

const make = (icon: React.ReactNode, title: string, desc: string, cta = 'Open module') => () => (
  <div className="card p-12">
    <EmptyState icon={icon} title={title} description={desc} action={<Button variant="outline">{cta}</Button>} />
  </div>
);

export const ClinicPatients = make(<Users size={22} />, 'Patient directory', 'Search by mobile, name or token. Visit history, prescriptions and outstanding follow-ups.');
export const ClinicAppointments = make(<Calendar size={22} />, 'Appointments', 'Online bookings for today and the upcoming week. Convert any booking into a live token.');
export const ClinicReports = make(<BarChart3 size={22} />, 'Reports', 'Daily revenue, queue trend, source mix and follow-up funnel.');
export const ClinicStaff = make(<UserCog size={22} />, 'Staff & roles', 'Invite receptionists, compounders and billing staff. RBAC built in.');
export const ClinicNotifications = make(<Bell size={22} />, 'Notification log', 'Push, WhatsApp and SMS delivery — per patient, per event.');
export const ClinicSettings = make(<Settings size={22} />, 'Clinic settings', 'Doctor timing, notification toggles, branding and theme.');
