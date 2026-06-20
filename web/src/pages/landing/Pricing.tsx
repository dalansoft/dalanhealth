import { motion } from 'framer-motion';
import {
  Check, Sparkles, Users, LayoutDashboard, Smartphone, ClipboardList,
  FileText, QrCode, MonitorPlay, BellRing, Wallet, BarChart3, ListChecks,
  Cloud, Headset, ShieldCheck, IndianRupee, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  PRICING_CATALOG, INCLUDED_FREE, CLOUD_PLATFORM, SUPPORT, SECURITY, WHY_DALAN,
} from './featureData';

// Icon per catalog category (ordered to match PRICING_CATALOG).
const CATALOG_ICONS = [
  ListChecks, Users, LayoutDashboard, Smartphone, ClipboardList, FileText,
  QrCode, MonitorPlay, BellRing, Wallet, BarChart3,
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

export function Pricing() {
  return (
    <Section
      id="pricing"
      eyebrow="Dalan Health Pricing"
      title={<>Simple. Transparent. <span className="gradient-text">Pay only for what you use.</span></>}
      description="No setup fee • No monthly subscription • No annual contract"
    >
      {/* ─── The price ─────────────────────────────────────────────── */}
      <motion.div {...fadeUp} className="relative mx-auto max-w-3xl">
        <div className="pointer-events-none absolute -inset-8 rounded-[40px] bg-gradient-to-r from-brand-500/15 via-accent-500/10 to-token/15 blur-2xl" />
        <div className="relative rounded-[28px] border border-brand-500/30 bg-white/80 dark:bg-ink-900/80 backdrop-blur-xl p-8 sm:p-12 text-center shadow-glow overflow-hidden">
          <div aria-hidden className="absolute inset-0 grid-bg opacity-[0.07]" />
          <Badge tone="brand" icon={<Sparkles size={11} />}>One price. Everything included.</Badge>
          <div className="mt-6 flex items-baseline justify-center gap-2">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, damping: 16 }}
              className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight gradient-text"
            >
              ₹9 + GST
            </motion.span>
            
          </div>
          <div className="mt-2 text-base sm:text-lg font-semibold text-ink-900 dark:text-ink-50">
            per visit
          </div>
          <p className="mt-3 text-sm text-muted max-w-md mx-auto">
            Only pay when you earn. A patient walks out consulted — ₹9 + GST is deducted from
            your wallet. Charged per visit, not per patient: two visits in a month = 2 × ₹9 + GST.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {['No Setup Fee', 'No Monthly Fee', 'No Annual Fee'].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-success-500/10 text-success-600 dark:text-success-500 px-3 py-1 text-xs font-semibold">
                <Check size={12} /> {t}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" rightIcon={<ArrowRight size={16} />}>Start free — pay per visit</Button>
            </Link>
            <a href="#subscribe">
              <Button size="lg" variant="outline">See full plan details</Button>
            </a>
          </div>
        </div>
      </motion.div>

      {/* ─── What doctors get ──────────────────────────────────────── */}
      <div className="mt-20 text-center">
        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
          What doctors get for just <span className="gradient-text">₹9 + GST</span> per visit
        </h3>
      </div>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PRICING_CATALOG.map((cat, i) => {
          const Icon = CATALOG_ICONS[i % CATALOG_ICONS.length];
          return (
            <motion.div
              key={cat.title}
              {...fadeUp}
              transition={{ delay: (i % 3) * 0.06 }}
              className="group relative rounded-2xl border hairline bg-white/70 dark:bg-ink-900/70 backdrop-blur p-6 overflow-hidden hover:border-brand-500/40 hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-brand-500/10 to-accent-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-600 dark:text-brand-300">
                    <Icon size={18} />
                  </span>
                  <h4 className="text-base font-semibold text-ink-900 dark:text-ink-50">{cat.title}</h4>
                </div>
                <ul className="mt-4 space-y-2">
                  {cat.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ink-700 dark:text-ink-200">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-500/15 text-success-600 dark:text-success-500">
                        <Check size={11} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                {cat.note && <p className="mt-3 text-xs text-muted italic">{cat.note}</p>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Assurance bands ───────────────────────────────────────── */}
      <div className="mt-16 grid md:grid-cols-2 gap-5">
        <AssuranceCard
          icon={<IndianRupee size={18} />}
          tone="success"
          title="Included at no extra cost"
          items={INCLUDED_FREE}
          highlight
        />
        <div className="grid gap-5">
          <AssuranceCard icon={<Cloud size={18} />} tone="brand" title="Cloud-based platform" items={CLOUD_PLATFORM} />
          <AssuranceCard icon={<Headset size={18} />} tone="accent" title="Support that actually answers" items={SUPPORT} />
        </div>
      </div>
      <div className="mt-5">
        <AssuranceCard icon={<ShieldCheck size={18} />} tone="warning" title="Security" items={SECURITY} horizontal />
      </div>

      {/* ─── Why Dalan Health ──────────────────────────────────────── */}
      <motion.div {...fadeUp} className="mt-16 rounded-3xl border hairline bg-gradient-to-br from-brand-500/8 via-transparent to-token/8 p-8 sm:p-10">
        <h3 className="text-center text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
          Why Dalan Health?
        </h3>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {WHY_DALAN.map((w, i) => (
            <motion.span
              key={w}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="inline-flex items-center gap-2 rounded-full border hairline bg-white/80 dark:bg-ink-900/80 px-4 py-2 text-sm font-medium text-ink-800 dark:text-ink-100"
            >
              <Check size={14} className="text-token" /> {w}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* ─── Summary ───────────────────────────────────────────────── */}
      <motion.div {...fadeUp} className="mt-16 text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">Pricing summary</div>
        <div className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
          ₹9 + GST per visit
        </div>
        <p className="mt-2 text-base font-semibold gradient-text">Only pay when you earn.</p>
        <p className="mt-1 text-xs text-muted">No Setup Fee • No Monthly Fee • No Annual Fee</p>
        <div className="mt-6 font-brand text-sm font-semibold tracking-[0.25em] uppercase text-ink-700 dark:text-ink-200">
          Dalan Health <span className="text-muted font-normal normal-case tracking-normal">· Better Health</span>
        </div>
      </motion.div>
    </Section>
  );
}

// ─── Assurance card helper ─────────────────────────────────────────────────

const toneStyles: Record<string, string> = {
  success: 'bg-success-500/15 text-success-600 dark:text-success-500',
  brand: 'bg-brand-500/15 text-brand-600 dark:text-brand-300',
  accent: 'bg-accent-500/15 text-accent-600 dark:text-accent-300',
  warning: 'bg-warning-500/15 text-warning-600 dark:text-warning-500',
};

function AssuranceCard({ icon, title, items, tone, highlight, horizontal }: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  tone: keyof typeof toneStyles;
  highlight?: boolean;
  horizontal?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className={`rounded-2xl border p-6 backdrop-blur ${
        highlight
          ? 'border-success-500/30 bg-success-500/5'
          : 'hairline bg-white/70 dark:bg-ink-900/70'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${toneStyles[tone]}`}>
          {icon}
        </span>
        <h4 className="text-base font-semibold text-ink-900 dark:text-ink-50">{title}</h4>
      </div>
      <ul className={`mt-4 gap-x-6 gap-y-2 ${horizontal ? 'grid sm:grid-cols-3 lg:grid-cols-5' : 'grid sm:grid-cols-2'}`}>
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-ink-700 dark:text-ink-200">
            <Check size={14} className="mt-0.5 shrink-0 text-success-500" /> {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
