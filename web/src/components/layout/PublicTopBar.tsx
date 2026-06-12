import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

const links = [
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/tv-display', label: 'TV Display' },
  { to: '/about', label: 'About Us' },
  { to: '/careers', label: 'Careers' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

export function PublicTopBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Deepen the glass blur once the page scrolls.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div
        className={cn(
          'absolute inset-0 -z-10 border-b transition-all duration-300',
          scrolled
            ? 'bg-white/75 dark:bg-ink-950/75 backdrop-blur-2xl hairline shadow-sm'
            : 'bg-white/40 dark:bg-ink-950/40 backdrop-blur-md border-transparent',
        )}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        <Logo />
        <nav className="hidden xl:flex items-center" aria-label="Main">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'nav-underline px-2.5 2xl:px-3 py-2 text-[13px] 2xl:text-sm font-medium transition-colors',
                  isActive
                    ? 'text-ink-900 dark:text-ink-50'
                    : 'text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-ink-50',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle className="hidden sm:flex" />
          <NavLink to="/login" className="hidden xl:inline-flex">
            <Button variant="ghost" size="md">Sign in</Button>
          </NavLink>
          <Link to="/demo" className="hidden sm:inline-flex">
            <Button size="md" variant="outline">Book Demo</Button>
          </Link>
          <Link to="/signup">
            <Button size="md" variant="primary" className="h-9 px-3 text-[13px] sm:h-10 sm:px-4 sm:text-sm">Get Started</Button>
          </Link>
          <button
            className="xl:hidden inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border hairline"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      <div className={cn('xl:hidden overflow-hidden transition-all duration-300', open ? 'max-h-[520px]' : 'max-h-0')}>
        <div className="px-5 pb-4 pt-2 space-y-1 border-b hairline bg-white/90 dark:bg-ink-950/90 backdrop-blur-xl">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800" onClick={() => setOpen(false)}>{l.label}</NavLink>
          ))}
          <NavLink to="/demo" className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-700 dark:text-ink-200" onClick={() => setOpen(false)}>Book Demo</NavLink>
          <NavLink to="/login" className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-700 dark:text-ink-200" onClick={() => setOpen(false)}>Sign in</NavLink>
        </div>
      </div>
    </header>
  );
}
