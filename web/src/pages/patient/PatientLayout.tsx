import { Outlet } from 'react-router-dom';
import { MobileShell } from '@/components/layout/MobileShell';

export function PatientLayout() {
  return (
    <MobileShell>
      <Outlet />
    </MobileShell>
  );
}
