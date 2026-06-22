import { lazy, Suspense, type ComponentType } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from './ScrollToTop';
import { ProtectedRoute } from './ProtectedRoute';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

// Eager — needed for first paint of the public/auth entry points.
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LandingPage } from '@/pages/landing';
import { LoginPage } from '@/pages/auth/Login';
import { SignupPage } from '@/pages/auth/Signup';
import { DemoSelector } from '@/pages/demo/DemoSelector';
import { NotFound } from '@/pages/NotFound';

/* Lazy route helper: code-splits each page into its own chunk so the heavy
   dashboards (and recharts) never load with the public landing site. Works
   with the project's named exports. */
function lz<M extends Record<string, unknown>>(factory: () => Promise<M>, name: keyof M) {
  const C = lazy(() => factory().then((m) => ({ default: m[name] as ComponentType })));
  return <C />;
}

function RouteLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
      <span className="h-8 w-8 rounded-full border-2 border-brand-500/30 border-t-brand-500 animate-spin" />
    </div>
  );
}

/** Root shell: resets scroll on route change + Suspense for lazy chunks. */
function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteLoader />}>
        <Outlet />
      </Suspense>
      <InstallPrompt />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <LandingPage /> },
          { path: '/features', element: lz(() => import('@/pages/site/SectionPages'), 'FeaturesPage') },
          { path: '/pricing', element: lz(() => import('@/pages/site/SectionPages'), 'PricingPage') },
          { path: '/how-it-works', element: lz(() => import('@/pages/site/SectionPages'), 'HowItWorksPage') },
          { path: '/tv-display', element: lz(() => import('@/pages/site/SectionPages'), 'TvDisplayPage') },
          { path: '/faq', element: lz(() => import('@/pages/site/SectionPages'), 'FaqPage') },
          { path: '/about', element: lz(() => import('@/pages/site/AboutPage'), 'AboutPage') },
          { path: '/careers', element: lz(() => import('@/pages/site/CareersPage'), 'CareersPage') },
          { path: '/contact', element: lz(() => import('@/pages/site/ContactPage'), 'ContactPage') },
          { path: '/privacy', element: lz(() => import('@/pages/site/LegalPages'), 'PrivacyPage') },
          { path: '/terms', element: lz(() => import('@/pages/site/LegalPages'), 'TermsPage') },
          { path: '/compliance', element: lz(() => import('@/pages/site/LegalPages'), 'CompliancePage') },
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
      { path: '/book', element: lz(() => import('@/pages/public/PatientBook'), 'PatientBook') },
      { path: '/display/clinic', element: lz(() => import('@/pages/display/TvDisplay'), 'TvDisplay') },
      { path: '/tv/pair', element: lz(() => import('@/pages/display/TvPair'), 'TvPair') },
      { path: '/tv', element: lz(() => import('@/pages/display/TvPair'), 'TvPair') },

      {
        path: '/admin',
        element: <ProtectedRoute allow={['super_admin']}>{lz(() => import('@/pages/admin/AdminLayout'), 'AdminLayout')}</ProtectedRoute>,
        children: [
          { index: true, element: lz(() => import('@/pages/admin/AdminDashboard'), 'AdminDashboard') },
          { path: 'clinics', element: lz(() => import('@/pages/admin/AdminClinics'), 'AdminClinics') },
          { path: 'revenue', element: lz(() => import('@/pages/admin/AdminRevenue'), 'AdminRevenue') },
          { path: 'wallet', element: lz(() => import('@/pages/admin/AdminWallet'), 'AdminWallet') },
          { path: 'plans', element: lz(() => import('@/pages/admin/AdminPlans'), 'AdminPlans') },
          { path: 'cashback', element: lz(() => import('@/pages/admin/AdminCashback'), 'AdminCashback') },
          { path: 'notifications', element: lz(() => import('@/pages/admin/AdminNotifications'), 'AdminNotifications') },
          { path: 'support', element: lz(() => import('@/pages/admin/AdminSupport'), 'AdminSupport') },
          { path: 'team', element: lz(() => import('@/pages/admin/AdminTeam'), 'AdminTeam') },
          { path: 'reports', element: lz(() => import('@/pages/admin/AdminReports'), 'AdminReports') },
          { path: 'system', element: lz(() => import('@/pages/admin/AdminSystem'), 'AdminSystem') },
          { path: 'settings', element: lz(() => import('@/pages/admin/AdminSettings'), 'AdminSettings') },
        ],
      },

      {
        path: '/clinic',
        element: <ProtectedRoute allow={['clinic_admin']}>{lz(() => import('@/pages/clinic/ClinicLayout'), 'ClinicLayout')}</ProtectedRoute>,
        children: [
          { index: true, element: lz(() => import('@/pages/clinic/ClinicDashboard'), 'ClinicDashboard') },
          { path: 'queue', element: lz(() => import('@/pages/clinic/ClinicQueue'), 'ClinicQueue') },
          { path: 'patients', element: lz(() => import('@/pages/clinic/ClinicPatients'), 'ClinicPatients') },
          { path: 'appointments', element: lz(() => import('@/pages/clinic/ClinicAppointments'), 'ClinicAppointments') },
          { path: 'billing', element: lz(() => import('@/pages/billing/BillingScreen'), 'BillingScreen') },
          { path: 'prescription', element: lz(() => import('@/pages/prescription/PrescriptionScreen'), 'PrescriptionScreen') },
          { path: 'reports', element: lz(() => import('@/pages/clinic/ClinicReports'), 'ClinicReports') },
          { path: 'wallet', element: lz(() => import('@/pages/clinic/ClinicWallet'), 'ClinicWallet') },
          { path: 'profile', element: lz(() => import('@/pages/clinic/ClinicProfile'), 'ClinicProfile') },
          { path: 'branches', element: lz(() => import('@/pages/clinic/ClinicBranches'), 'ClinicBranches') },
          { path: 'tv-displays', element: lz(() => import('@/pages/clinic/ClinicTvDisplays'), 'ClinicTvDisplays') },
          { path: 'staff', element: lz(() => import('@/pages/clinic/ClinicStaff'), 'ClinicStaff') },
          { path: 'qr', element: lz(() => import('@/pages/clinic/ClinicQR'), 'ClinicQR') },
          { path: 'notifications', element: lz(() => import('@/pages/clinic/ClinicNotifications'), 'ClinicNotifications') },
          { path: 'settings', element: lz(() => import('@/pages/clinic/ClinicSettings'), 'ClinicSettings') },
        ],
      },

      {
        path: '/receptionist',
        element: <ProtectedRoute allow={['receptionist', 'clinic_admin']}>{lz(() => import('@/pages/receptionist/ReceptionistLayout'), 'ReceptionistLayout')}</ProtectedRoute>,
        children: [
          { index: true, element: lz(() => import('@/pages/receptionist/ReceptionistDashboard'), 'ReceptionistDashboard') },
          { path: 'add', element: lz(() => import('@/pages/receptionist/AddPatient'), 'AddPatient') },
          { path: 'queue', element: lz(() => import('@/pages/clinic/ClinicQueue'), 'ClinicQueue') },
          { path: 'billing', element: lz(() => import('@/pages/billing/BillingScreen'), 'BillingScreen') },
          { path: 'prescription', element: lz(() => import('@/pages/prescription/PrescriptionScreen'), 'PrescriptionScreen') },
        ],
      },

      {
        path: '/patient',
        element: <ProtectedRoute allow={['patient']}>{lz(() => import('@/pages/patient/PatientLayout'), 'PatientLayout')}</ProtectedRoute>,
        children: [
          { index: true, element: lz(() => import('@/pages/patient/PatientHome'), 'PatientHome') },
          { path: 'search', element: lz(() => import('@/pages/patient/PatientSearch'), 'PatientSearch') },
          { path: 'doctor/:id', element: lz(() => import('@/pages/patient/DoctorProfile'), 'DoctorProfile') },
          { path: 'queue', element: lz(() => import('@/pages/patient/TokenTracking'), 'TokenTracking') },
          { path: 'wallet', element: lz(() => import('@/pages/patient/PatientWallet'), 'PatientWallet') },
          { path: 'profile', element: lz(() => import('@/pages/patient/PatientProfile'), 'PatientProfile') },
          { path: 'bookings', element: lz(() => import('@/pages/patient/PatientProfile'), 'PatientProfile') },
        ],
      },

      { path: '/dashboard', element: <Navigate to="/clinic" replace /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
