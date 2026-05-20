import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, Search, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/cn';

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

interface Props {
  nav: NavItem[];
  children: ReactNode;
  title?: string;
  subtitle?: string;
  topRight?: ReactNode;
}

export function DashboardShell({ nav, children, title, subtitle, topRight }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isDemo, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-mesh-light dark:bg-mesh-dark">
      <aside className={cn('hidden md:flex sticky top-0 h-screen flex-col border-r hairline bg-white/60 dark:bg-ink-950/60 backdrop-blur-xl transition-all duration-300', collapsed ? 'w-[72px]' : 'w-[244px]')}>
        <div className={cn('h-16 flex items-center border-b hairline', collapsed ? 'justify-center px-2' : 'px-5')}>
          {collapsed ? <Logo size="sm" /> : <Logo />}
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/20'
                    : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100/70 dark:hover:bg-ink-800/60',
                )
              }
            >
              <span className="inline-flex h-5 w-5 items-center justify-center">{n.icon}</span>
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                    className="truncate"
                  >
                    {n.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>
        <div className="border-t hairline p-3">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-muted hover:text-ink-900 dark:hover:text-ink-50 hover:bg-ink-100 dark:hover:bg-ink-800"
          >
            {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> Collapse</>}
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 border-b hairline bg-white/60 dark:bg-ink-950/60 backdrop-blur-xl">
          <div className="h-16 px-5 sm:px-8 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              {title && <h1 className="text-base sm:text-lg font-semibold tracking-tight text-ink-900 dark:text-ink-50 truncate">{title}</h1>}
              {subtitle && <p className="text-xs text-muted truncate">{subtitle}</p>}
            </div>
            <div className="hidden lg:flex items-center gap-2 max-w-md flex-1">
              <div className="w-full inline-flex items-center gap-2 rounded-xl border hairline bg-white/70 dark:bg-ink-900/60 px-3 py-2 text-sm text-ink-500 dark:text-ink-400">
                <Search size={14} /> <span className="truncate">Search patients, tokens, invoices…</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isDemo && <Badge tone="accent" size="sm">Demo</Badge>}
              {topRight}
              <ThemeToggle />
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border hairline relative">
                <Bell size={16} />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-danger-500" />
              </button>
              <div className="hidden sm:flex items-center gap-2 rounded-xl border hairline pl-1 pr-3 py-1">
                <Avatar name={user?.name ?? 'You'} size="sm" />
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-ink-900 dark:text-ink-50 truncate max-w-[120px]">{user?.name ?? 'Guest'}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted">{user?.role?.replace('_', ' ') ?? 'guest'}</div>
                </div>
              </div>
              <button onClick={onLogout} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border hairline hover:text-danger-500" title="Sign out">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 p-5 sm:p-8 max-w-[1600px] w-full mx-auto">{children}</div>
      </div>
    </div>
  );
}
