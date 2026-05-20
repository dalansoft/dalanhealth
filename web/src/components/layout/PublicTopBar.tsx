import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

const links = [
  { to: '/#features', label: 'Features' },
  { to: '/#demo', label: 'Live Demo' },
  { to: '/#pricing', label: 'Pricing' },
  { to: '/#faq', label: 'FAQ' },
];

export function PublicTopBar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40">
      <div className="absolute inset-0 -z-10 bg-white/60 dark:bg-ink-950/60 backdrop-blur-xl border-b hairline" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className="px-3 py-2 text-sm font-medium text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-ink-50 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:flex" />
          <NavLink to="/login" className="hidden sm:inline-flex">
            <Button variant="ghost" size="md">Sign in</Button>
          </NavLink>
          <Link to="/demo">
            <Button size="md" variant="primary">Try live demo</Button>
          </Link>
          <button className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border hairline" onClick={() => setOpen((v) => !v)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      <div className={cn('md:hidden overflow-hidden transition-all duration-300', open ? 'max-h-96' : 'max-h-0')}>
        <div className="px-5 pb-4 pt-2 space-y-1 border-b hairline">
          {links.map((l) => (
            <a key={l.to} href={l.to} className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800" onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <NavLink to="/login" className="block rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setOpen(false)}>Sign in</NavLink>
        </div>
      </div>
    </header>
  );
}
