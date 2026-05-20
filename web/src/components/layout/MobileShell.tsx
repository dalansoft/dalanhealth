import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Ticket, Wallet, User } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/store/auth';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/cn';

const tabs = [
  { to: '/patient', icon: <Home size={18} />, label: 'Home', end: true },
  { to: '/patient/search', icon: <Search size={18} />, label: 'Search' },
  { to: '/patient/queue', icon: <Ticket size={18} />, label: 'Queue' },
  { to: '/patient/wallet', icon: <Wallet size={18} />, label: 'Wallet' },
  { to: '/patient/profile', icon: <User size={18} />, label: 'Profile' },
];

export function MobileShell({ children }: { children: ReactNode }) {
  const { user, isDemo, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark flex flex-col">
      <header className="sticky top-0 z-30 border-b hairline bg-white/70 dark:bg-ink-950/70 backdrop-blur-xl">
        <div className="max-w-screen-sm mx-auto px-5 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            {isDemo && <Badge tone="accent" size="sm">Demo</Badge>}
            <ThemeToggle />
            <button onClick={() => { logout(); navigate('/'); }}>
              <Avatar name={user?.name ?? 'Guest'} size="sm" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-screen-sm w-full mx-auto px-5 py-6 pb-28">{children}</main>
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t hairline bg-white/85 dark:bg-ink-950/85 backdrop-blur-xl">
        <div className="max-w-screen-sm mx-auto px-2 grid grid-cols-5">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                cn('flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium',
                  isActive ? 'text-brand-600 dark:text-brand-300' : 'text-ink-500 dark:text-ink-400')
              }
            >
              <span>{t.icon}</span>
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
