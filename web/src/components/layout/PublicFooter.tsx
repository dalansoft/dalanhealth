import { Link } from 'react-router-dom';
import { Mail, Globe, MapPin, Linkedin, Instagram, Youtube, Github } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const cols = [
  {
    title: 'Product',
    links: [
      { to: '/features', label: 'Features' },
      { to: '/pricing', label: 'Pricing' },
      { to: '/how-it-works', label: 'How It Works' },
      { to: '/tv-display', label: 'TV Display' },
      { to: '/demo', label: 'Live Demo' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About Us' },
      { to: '/careers', label: 'Careers' },
      { to: '/contact', label: 'Contact' },
      { to: '/faq', label: 'FAQ' },
      { to: '/signup', label: 'Get Started' },
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

const socials = [
  { href: 'https://linkedin.com/company/dalanhealth', label: 'LinkedIn', Icon: Linkedin },
  { href: 'https://instagram.com/dalanhealth', label: 'Instagram', Icon: Instagram },
  { href: 'https://youtube.com/@dalanhealth', label: 'YouTube', Icon: Youtube },
  { href: 'https://github.com/dalanhealth', label: 'GitHub', Icon: Github },
];

export function PublicFooter() {
  return (
    <footer id="contact" className="border-t hairline bg-white/40 dark:bg-ink-950/40 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 grid gap-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo size="lg" asLink={false} />
          <p className="mt-3 text-sm font-semibold gradient-text">Better Health</p>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Smart Token &amp; Digital OPD platform. Reduce waiting time, improve patient experience, and modernize your clinic — pay just 9rs+gst per visit.
          </p>
          <div className="mt-6 space-y-2 text-sm text-muted">
            <a href="mailto:info@dalanhealth.com" className="flex items-center gap-2 hover:text-brand-600 dark:hover:text-brand-300"><Mail size={14} /> info@dalanhealth.com</a>
            <a href="https://dalanhealth.com" className="flex items-center gap-2 hover:text-brand-600 dark:hover:text-brand-300"><Globe size={14} /> dalanhealth.com</a>
            <div className="flex items-center gap-2"><MapPin size={14} /> Patna, India</div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border hairline text-ink-600 dark:text-ink-300 hover:text-brand-600 dark:hover:text-brand-300 hover:border-brand-500/40 hover:shadow-glow transition-all"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">{c.title}</div>
            <ul className="mt-4 space-y-2">
              {c.links.map((l) => (
                <li key={l.to}>
                  {'external' in l && l.external ? (
                    <a href={l.to} target="_blank" rel="noreferrer" className="text-sm text-ink-600 dark:text-ink-300 hover:text-brand-600 dark:hover:text-brand-300">{l.label}</a>
                  ) : (
                    <Link to={l.to} className="text-sm text-ink-600 dark:text-ink-300 hover:text-brand-600 dark:hover:text-brand-300">{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t hairline">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <div className="whitespace-nowrap">
            Powered by{' '}
            <span className="font-bold text-ink-800 dark:text-ink-100">Dalan Health</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 min-w-0 text-center">
            <span>© {new Date().getFullYear()} Dalansoft Technologies Pvt Ltd. All rights reserved.</span>
          </div>
          <div className="whitespace-nowrap">
            A Product of{' '}
            <span className="font-bold text-ink-800 dark:text-ink-100">Dalansoft Technologies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
