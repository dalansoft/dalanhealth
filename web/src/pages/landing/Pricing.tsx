import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

const plans = [
  {
    name: 'Clinic Starter',
    tagline: 'Simple & affordable clinic management',
    price: '₹999',
    period: '/year',
    perVisit: '+ ₹9 per completed consultation',
    features: [
      'Unified queue (Offline + Online + QR)',
      'Patient registration & history',
      'Billing & GST-ready invoices',
      'Prescription builder',
      'Basic reports',
      '2 staff seats',
      'Email & SMS notifications',
    ],
    cta: 'Start with Starter',
    highlight: false,
  },
  {
    name: 'Clinic Growth',
    tagline: 'More patients. Better follow-up. Pro workflow.',
    price: '₹12',
    period: '/visit',
    perVisit: 'No yearly fee · pay-per-consultation',
    features: [
      'Everything in Starter',
      'Unlimited staff seats',
      'Unlimited doctors',
      'Advanced analytics & funnels',
      'WhatsApp + Push notifications',
      'Cashback campaigns',
      'Priority support',
    ],
    cta: 'Choose Growth',
    highlight: true,
  },
];

export function Pricing() {
  return (
    <Section
      id="pricing"
      eyebrow="Pricing"
      title="Simple pricing. No surprises."
      description="Wallet-based usage. Pay only for completed consultations. Patient booking is ₹1 — QR queue and walk-in are free."
    >
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {plans.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'relative rounded-3xl p-8 border backdrop-blur-xl',
              p.highlight
                ? 'border-brand-500/40 dark:border-brand-500/40 bg-gradient-to-br from-brand-500/10 to-accent-500/10 shadow-glow'
                : 'hairline bg-white/70 dark:bg-ink-900/70',
            )}
          >
            {p.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge tone="brand" icon={<Sparkles size={11} />}>Most popular</Badge>
              </div>
            )}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">{p.name}</div>
              <p className="mt-2 text-sm text-muted">{p.tagline}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">{p.price}</span>
                <span className="text-sm text-muted">{p.period}</span>
              </div>
              <p className="mt-1 text-xs text-muted">{p.perVisit}</p>
            </div>
            <ul className="mt-6 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-ink-700 dark:text-ink-200">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-500/15 text-success-600 dark:text-success-500">
                    <Check size={12} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link to="/signup"><Button size="lg" fullWidth variant={p.highlight ? 'primary' : 'outline'}>{p.cta}</Button></Link>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 mx-auto max-w-5xl grid md:grid-cols-3 gap-4 text-center">
        {[
          { l: 'Patient booking fee', v: '₹1' },
          { l: 'QR queue (same day)', v: 'Free' },
          { l: 'Offline walk-in', v: 'Free' },
        ].map((x) => (
          <div key={x.l} className="rounded-2xl border hairline bg-white/60 dark:bg-ink-900/60 p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted">{x.l}</div>
            <div className="text-xl font-semibold text-ink-900 dark:text-ink-50">{x.v}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
