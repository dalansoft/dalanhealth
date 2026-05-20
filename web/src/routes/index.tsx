import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LandingPage } from '@/pages/landing';
import { LoginPage } from '@/pages/auth/Login';
import { SignupPage } from '@/pages/auth/Signup';
import { DemoSelector } from '@/pages/demo/DemoSelector';
import { NotFound } from '@/pages/NotFound';
import { ProtectedRoute } from './ProtectedRoute';

import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminClinics } from '@/pages/admin/AdminClinics';
import { AdminRevenue } from '@/pages/admin/AdminRevenue';
import {
  AdminWallet, AdminPlans, AdminCashback, AdminNotifications,
  AdminSupport, AdminTeam, AdminReports, AdminSystem, AdminSettings,
} from '@/pages/admin/AdminPlaceholders';

import { ClinicLayout } from '@/pages/clinic/ClinicLayout';
import { ClinicDashboard } from '@/pages/clinic/ClinicDashboard';
import { ClinicQueue } from '@/pages/clinic/ClinicQueue';
import { ClinicWallet } from '@/pages/clinic/ClinicWallet';
import { ClinicQR } from '@/pages/clinic/ClinicQR';
import {
  ClinicPatients, ClinicAppointments, ClinicReports,
  ClinicStaff, ClinicNotifications, ClinicSettings,
} from '@/pages/clinic/ClinicPlaceholders';

import { ReceptionistLayout } from '@/pages/receptionist/ReceptionistLayout';
import { ReceptionistDashboard } from '@/pages/receptionist/ReceptionistDashboard';
import { AddPatient } from '@/pages/receptionist/AddPatient';

import { PatientLayout } from '@/pages/patient/PatientLayout';
import { PatientHome } from '@/pages/patient/PatientHome';
import { PatientSearch } from '@/pages/patient/PatientSearch';
import { DoctorProfile } from '@/pages/patient/DoctorProfile';
import { TokenTracking } from '@/pages/patient/TokenTracking';
import { PatientWallet } from '@/pages/patient/PatientWallet';
import { PatientProfile } from '@/pages/patient/PatientProfile';

import { BillingScreen } from '@/pages/billing/BillingScreen';
import { PrescriptionScreen } from '@/pages/prescription/PrescriptionScreen';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
    ],
  },
  { path: '/demo', element: <DemoSelector /> },

  {
    path: '/admin',
    element: <ProtectedRoute allow={['super_admin']}><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'clinics', element: <AdminClinics /> },
      { path: 'revenue', element: <AdminRevenue /> },
      { path: 'wallet', element: <AdminWallet /> },
      { path: 'plans', element: <AdminPlans /> },
      { path: 'cashback', element: <AdminCashback /> },
      { path: 'notifications', element: <AdminNotifications /> },
      { path: 'support', element: <AdminSupport /> },
      { path: 'team', element: <AdminTeam /> },
      { path: 'reports', element: <AdminReports /> },
      { path: 'system', element: <AdminSystem /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },

  {
    path: '/clinic',
    element: <ProtectedRoute allow={['clinic_admin']}><ClinicLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <ClinicDashboard /> },
      { path: 'queue', element: <ClinicQueue /> },
      { path: 'patients', element: <ClinicPatients /> },
      { path: 'appointments', element: <ClinicAppointments /> },
      { path: 'billing', element: <BillingScreen /> },
      { path: 'prescription', element: <PrescriptionScreen /> },
      { path: 'reports', element: <ClinicReports /> },
      { path: 'wallet', element: <ClinicWallet /> },
      { path: 'staff', element: <ClinicStaff /> },
      { path: 'qr', element: <ClinicQR /> },
      { path: 'notifications', element: <ClinicNotifications /> },
      { path: 'settings', element: <ClinicSettings /> },
    ],
  },

  {
    path: '/receptionist',
    element: <ProtectedRoute allow={['receptionist', 'clinic_admin']}><ReceptionistLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <ReceptionistDashboard /> },
      { path: 'add', element: <AddPatient /> },
      { path: 'queue', element: <ClinicQueue /> },
      { path: 'billing', element: <BillingScreen /> },
      { path: 'prescription', element: <PrescriptionScreen /> },
    ],
  },

  {
    path: '/patient',
    element: <ProtectedRoute allow={['patient']}><PatientLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <PatientHome /> },
      { path: 'search', element: <PatientSearch /> },
      { path: 'doctor/:id', element: <DoctorProfile /> },
      { path: 'queue', element: <TokenTracking /> },
      { path: 'wallet', element: <PatientWallet /> },
      { path: 'profile', element: <PatientProfile /> },
      { path: 'bookings', element: <PatientProfile /> },
    ],
  },

  { path: '/dashboard', element: <Navigate to="/clinic" replace /> },
  { path: '*', element: <NotFound /> },
]);
