import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronsDownUp, ChevronsUpDown, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo, DalanMark } from '@/components/ui/Logo';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { BranchSwitcher } from '@/components/layout/BranchSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/cn';

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  badge?: string | number;
}

export interface NavSection {
  /** Uppercase section heading shown above its items. */
  title: string;
  items: NavItem[];
  /** Optional accent for the section heading. Defaults to brand. */
  accent?: 'brand' | 'token' | 'accent' | 'warning';
}

interface Props {
  /** Either a flat list of items or grouped sections. */
  nav: NavItem[] | NavSection[];
  children: ReactNode;
  title?: string;
  subtitle?: string;
  topRight?: ReactNode;
}

const isSectioned = (n: NavItem[] | NavSection[]): n is NavSection[] =>
  Array.isArray(n) && n.length > 0 && (n[0] as NavSection).items !== undefined;

const accentClass: Record<NonNullable<NavSection['accent']>, string> = {
  brand: 'text-brand-300',
  token: 'text-token',
  accent: 'text-accent-300',
  warning: 'text-warning-500',
};

const COLLAPSE_KEY = 'dh-sidebar-collapsed';

export function DashboardShell({ nav, children, title, subtitle, topRight }: Props) {
  const sections: NavSection[] = isSectioned(nav)
    ? nav
    : [{ title: 'Menu', items: nav as NavItem[] }];

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; }
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(sections.map((s) => [s.title, true])),
  );
  const { user, isDemo, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/');
  };

  /** True when every section is currently open. */
  const allOpen = useMemo(
    () => sections.every((s) => expanded[s.title] ?? true),
    [sections, expanded],
  );

  const toggleAllSections = () => {
    const next = !allOpen;
    setExpanded(Object.fromEntries(sections.map((s) => [s.title, next])));
  };

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0'); } catch {}
  };

  useEffect(() => {
    const onResize = () => window.innerWidth >= 768 && setMobileOpen(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /** Sidebar contents — same component used for desktop rail and mobile drawer. */
  const sidebar = (mode: 'desktop' | 'mobile') => {
    const isMobile = mode === 'mobile';
    const isCollapsed = !isMobile && collapsed; // mobile drawer always shows full content
    return (
      <div className={cn('flex h-full flex-col bg-white dark:bg-navy-900 text-ink-900 dark:text-white border-r border-ink-200 dark:border-transparent transition-[width] duration-300', isCollapsed ? 'w-[72px]' : 'w-full')}>
        {/* Header: company name + hamburger toggle */}
        <div className={cn('flex items-center pt-5 pb-3', isCollapsed ? 'px-3 flex-col gap-3' : 'px-5 justify-between')}>
          {isCollapsed ? (
            <>
              <DalanMark size={32} />
              <button
                onClick={toggleCollapse}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 dark:text-white/80 hover:bg-ink-100 dark:hover:bg-white/10"
                aria-label="Expand sidebar"
              >
                <Menu size={16} />
              </button>
            </>
          ) : (
            <>
              <Logo asLink={false} variant="auto" />
              <button
                onClick={isMobile ? () => setMobileOpen(false) : toggleCollapse}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 dark:text-white/70 hover:text-ink-900 dark:hover:text-white hover:bg-ink-100 dark:hover:bg-white/10 transition-colors"
                aria-label={isMobile ? 'Close menu' : 'Collapse sidebar'}
              >
                {isMobile ? <X size={16} /> : <Menu size={16} />}
              </button>
            </>
          )}
        </div>

        {/* Single dynamic Expand/Collapse-all toggle */}
        {!isCollapsed && sections.length > 1 && (
          <div className="px-4">
            <button
              onClick={toggleAllSections}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-ink-200 dark:border-white/10 bg-ink-50 dark:bg-white/[0.04] py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-600 dark:text-white/70 hover:bg-ink-100 dark:hover:bg-white/[0.08] hover:text-ink-900 dark:hover:text-white transition-colors"
            >
              {allOpen ? <ChevronsDownUp size={12} /> : <ChevronsUpDown size={12} />}
              {allOpen ? 'Collapse all' : 'Expand all'}
            </button>
          </div>
        )}

        {/* Sections */}
        <nav className={cn('flex-1 overflow-y-auto pt-4 pb-3 space-y-4', isCollapsed ? 'px-2' : 'px-3')}>
          {sections.map((section) => {
            const open = expanded[section.title] ?? true;
            return (
              <div key={section.title}>
                {!isCollapsed ? (
                  <button
                    onClick={() => setExpanded((e) => ({ ...e, [section.title]: !open }))}
                    className="w-full flex items-center justify-between px-3 mb-1.5"
                  >
                    <span className={cn('text-[10px] font-bold uppercase tracking-[0.18em]', accentClass[section.accent ?? 'brand'])}>
                      {section.title}
                    </span>
                    <ChevronDown size={12} className={cn('text-ink-400 dark:text-white/40 transition-transform', !open && '-rotate-90')} />
                  </button>
                ) : (
                  <Tooltip label={`Open ${section.title}`} side="bottom">
                    <button
                      onClick={() => {
                        setCollapsed(false);
                        try { localStorage.setItem(COLLAPSE_KEY, '0'); } catch {}
                        setExpanded((e) => ({ ...e, [section.title]: true }));
                      }}
                      className={cn(
                        'group flex items-center justify-center h-14 w-14 mx-auto rounded-2xl border border-ink-200 dark:border-white/10 bg-ink-50 dark:bg-white/[0.04] hover:bg-ink-100 dark:hover:bg-white/[0.10] hover:border-ink-300 dark:hover:border-white/20 transition-all',
                      )}
                      aria-label={`Open ${section.title} section`}
                    >
                      <span className={cn(
                        'font-brand text-2xl font-extrabold leading-none transition-transform group-hover:scale-110',
                        accentClass[section.accent ?? 'brand'],
                      )}>
                        {section.title.charAt(0)}
                      </span>
                    </button>
                  </Tooltip>
                )}
                <AnimatePresence initial={false}>
                  {!isCollapsed && open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden space-y-1"
                    >
                      {section.items.map((n) => {
                        const link = (
                          <NavLink
                            key={n.to}
                            to={n.to}
                            end={n.end}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                              cn(
                                'group relative rounded-xl text-sm font-medium transition-all',
                                isCollapsed
                                  ? 'flex flex-col items-center justify-center gap-1 h-14 w-14 mx-auto'
                                  : 'flex items-center gap-3 px-3 py-2.5',
                                isActive
                                  ? 'bg-gradient-to-r from-brand-500/90 via-brand-500/80 to-brand-400/70 text-white shadow-glowBright'
                                  : 'text-ink-700 dark:text-white/65 hover:text-ink-900 dark:hover:text-white hover:bg-ink-100 dark:hover:bg-white/[0.05]',
                              )
                            }
                          >
                            {({ isActive }) => (
                              <>
                                {isCollapsed ? (
                                  <>
                                    <span className={cn(
                                      'inline-flex h-5 w-5 items-center justify-center transition-colors',
                                      isActive ? 'text-white' : 'text-ink-600 dark:text-white/75 group-hover:text-ink-900 dark:group-hover:text-white',
                                    )}>{n.icon}</span>
                                    <span className={cn(
                                      'font-brand text-[10px] font-bold uppercase tracking-wide leading-none transition-colors',
                                      isActive ? 'text-white' : 'text-ink-600 dark:text-white/70 group-hover:text-ink-900 dark:group-hover:text-white',
                                    )}>
                                      {n.label.trim().charAt(0)}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className={cn(
                                      'inline-flex h-5 w-5 items-center justify-center transition-colors shrink-0',
                                      isActive ? 'text-white' : 'text-ink-500 dark:text-white/60 group-hover:text-ink-900 dark:group-hover:text-white',
                                    )}>{n.icon}</span>
                                    <span className="truncate flex-1">{n.label}</span>
                                    {n.badge !== undefined && (
                                      <span className={cn(
                                        'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                                        isActive ? 'bg-white/25 text-white' : 'bg-brand-500/15 text-brand-700 dark:bg-brand-500/25 dark:text-brand-200',
                                      )}>{n.badge}</span>
                                    )}
                                  </>
                                )}
                                {isCollapsed && n.badge !== undefined && (
                                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-brand-500 text-[9px] font-bold text-white flex items-center justify-center">
                                    {n.badge}
                                  </span>
                                )}
                              </>
                            )}
                          </NavLink>
                        );
                        return isCollapsed ? (
                          <Tooltip key={n.to} label={n.label} side="bottom">{link}</Tooltip>
                        ) : (
                          link
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Logout-only footer. User identity moved out of the sidebar — the
            top-right header avatar + CLINIC › Profile page cover that role. */}
        <div className={cn('border-t border-ink-200 dark:border-white/10', isCollapsed ? 'p-2' : 'p-3')}>
          {isCollapsed ? (
            <Tooltip label="Logout" side="bottom">
              <button
                onClick={onLogout}
                aria-label="Logout"
                className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl text-danger-500 hover:bg-danger-500/10 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger-500 hover:bg-danger-500/10 transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-ink-50 dark:bg-ink-950 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={cn('hidden md:flex sticky top-0 h-screen flex-col transition-[width] duration-300', collapsed ? 'w-[72px]' : 'w-[244px]')}>
        {sidebar('desktop')}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50 flex"
          >
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="w-[260px] h-full"
            >
              {sidebar('mobile')}
            </motion.div>
            <button className="flex-1 bg-ink-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 border-b hairline bg-white/70 dark:bg-ink-950/70 backdrop-blur-xl">
          <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border hairline"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0 flex-1">
              {title && <h1 className="text-base sm:text-lg font-semibold tracking-tight text-ink-900 dark:text-ink-50 truncate">{title}</h1>}
              {subtitle && <p className="text-xs text-muted truncate">{subtitle}</p>}
            </div>
            <div className="hidden md:block shrink-0">
              <BranchSwitcher />
            </div>
            <div className="hidden lg:flex items-center gap-2 max-w-md flex-1">
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-2">
              {isDemo && <Badge tone="accent" size="sm">Demo</Badge>}
              {topRight}
              <ThemeToggle />
              <NotificationBell />
              <div className="hidden sm:flex items-center gap-2 rounded-xl border hairline pl-1 pr-3 py-1">
                <Avatar name={user?.name ?? 'You'} src={user?.photoDataUrl} size="sm" />
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-ink-900 dark:text-ink-50 truncate max-w-[120px]">{user?.name ?? 'Guest'}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted">{user?.role?.replace('_', ' ') ?? 'guest'}</div>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Content area scrolls itself instead of the whole page, so the
            sidebar + header stay fixed and tightly-fitting pages (like the
            clinic dashboard) can render fully without a page scrollbar. */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="h-full p-4 sm:p-6 max-w-[1600px] w-full mx-auto">{children}</div>
        </div>
      </div>

    </div>
  );
}
