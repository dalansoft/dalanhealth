import { Outlet } from 'react-router-dom';
import { PublicTopBar } from './PublicTopBar';
import { PublicFooter } from './PublicFooter';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-mesh-light dark:bg-mesh-dark">
      <PublicTopBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
