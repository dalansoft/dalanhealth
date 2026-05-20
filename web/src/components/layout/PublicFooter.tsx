import { Link } from 'react-router-dom';
import { Mail, Globe, MapPin } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const cols = [
  {
    title: 'Product',
    links: [
      { to: '/#features', label: 'Features' },
      { to: '/#pricing', label: 'Pricing' },
      { to: '/demo', label: 'Live Demo' },
      { to: '/signup', label: 'Get Started' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
      { to: '/careers', label: 'Careers' },
      { to: '/blog', label: 'Blog' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/privacy', label: 'Privacy' },
      { to: '/terms', label: 'Terms' },
      { to: '/compliance', label: 'Compliance' },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t hairline bg-white/40 dark:bg-ink-950/40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 grid gap-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo size="lg" asLink={false} />
          <p className="mt-4 max-w-sm text-sm text-muted">
            Smarter clinic. Faster queue. Better patient experience. DalanHealth is a hybrid clinic management ecosystem built for Bihar-first healthcare workflows.
          </p>
          <div className="mt-6 space-y-2 text-sm text-muted">
            <div className="flex items-center gap-2"><Mail size={14} /> info@dalansoft.com</div>
            <div className="flex items-center gap-2"><Globe size={14} /> dalansoft.com</div>
            <div className="flex items-center gap-2"><MapPin size={14} /> Patna, Bihar — India</div>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">{c.title}</div>
            <ul className="mt-4 space-y-2">
              {c.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-ink-600 dark:text-ink-300 hover:text-brand-600 dark:hover:text-brand-300">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t hairline">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <div>© {new Date().getFullYear()} Dalansoft Technologies Pvt Ltd. All rights reserved.</div>
          <div>Made in India · For India</div>
        </div>
      </div>
    </footer>
  );
}
