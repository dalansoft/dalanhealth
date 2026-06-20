import { motion } from 'framer-motion';
import {
  Users, QrCode, Footprints, Globe, Smartphone, Stethoscope,
  ClipboardList, MonitorPlay, Wallet, BarChart3, CloudUpload, Headset,
} from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { cn } from '@/lib/cn';

/**
 * Bento-grid solution catalog. Tile spans create the editorial rhythm; the
 * two hero tiles (queue + TV display) get the wide slots.
 */
const tiles = [
  {
    icon: Users, title: 'Smart Queue Management', size: 'lg' as const, tone: 'brand' as const,
    desc: 'Walk-in, QR and online tokens merge into one sequential live queue — no parallel chaos, no disputes.',
  },
  { icon: QrCode, title: 'QR Token Booking', size: 'sm' as const, tone: 'accent' as const, desc: 'Patient scans at the door, lands in the queue in seconds.' },
  { icon: Footprints, title: 'Walk-In Tokens', size: 'sm' as const, tone: 'token' as const, desc: '5-second token generation at reception.' },
  { icon: Globe, title: 'Online Token Booking', size: 'sm' as const, tone: 'brand' as const, desc: 'Patients book from home and arrive on time.' },
  { icon: Smartphone, title: 'Patient Mobile App', size: 'sm' as const, tone: 'accent' as const, desc: 'Live token tracking, history, notifications.' },
  { icon: Stethoscope, title: 'Doctor Dashboard', size: 'sm' as const, tone: 'token' as const, desc: 'Current patient, waiting count, revenue — one glance.' },
  { icon: ClipboardList, title: 'Compounder Dashboard', size: 'sm' as const, tone: 'brand' as const, desc: 'Full queue control panel for your staff.' },
  {
    icon: MonitorPlay, title: 'TV Queue Display', size: 'lg' as const, tone: 'accent' as const,
    desc: 'Waiting-room TV shows the current token, up-next list and voice announcements — patients relax instead of crowding the desk.',
  },
  { icon: Wallet, title: 'Wallet Billing', size: 'sm' as const, tone: 'token' as const, desc: 'Auto 9rs+gst deduction per completed visit. GST invoices.' },
  { icon: BarChart3, title: 'Reports & Analytics', size: 'sm' as const, tone: 'brand' as const, desc: 'Daily, monthly, queue and revenue insights.' },
  { icon: CloudUpload, title: 'Cloud Backup', size: 'sm' as const, tone: 'accent' as const, desc: 'Secure, automatic, nothing to install.' },
  { icon: Headset, title: '24×7 Support', size: 'sm' as const, tone: 'token' as const, desc: 'WhatsApp, phone and email — real humans.' },
];

const tones = {
  brand: { icon: 'bg-brand-500/15 text-brand-600 dark:text-brand-300', glow: 'from-brand-500/25 to-brand-500/0' },
  accent: { icon: 'bg-accent-500/15 text-accent-600 dark:text-accent-300', glow: 'from-accent-500/25 to-accent-500/0' },
  token: { icon: 'bg-token/15 text-token', glow: 'from-token/25 to-token/0' },
};

export function Features() {
  return (
    <Section
      id="features"
      eyebrow="Everything your clinic needs"
      title={<>One platform. <span className="gradient-text">End-to-end clinic operations.</span></>}
      description="Twelve modules, one experience — designed for doctors, compounders and patients alike."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(150px,auto)]">
        {tiles.map((t, i) => {
          const tone = tones[t.tone];
          return (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: (i % 4) * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className={cn(
                'group relative rounded-2xl p-[1px] overflow-hidden',
                'bg-gradient-to-br from-ink-200/80 to-ink-200/30 dark:from-ink-700/60 dark:to-ink-800/30',
                'hover:from-brand-500/50 hover:to-accent-500/40 transition-colors duration-300',
                t.size === 'lg' && 'sm:col-span-2',
              )}
            >
              <div className="relative h-full rounded-[15px] bg-white/85 dark:bg-ink-900/85 backdrop-blur p-5">
                <div className={cn('pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500', tone.glow)} />
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: -6, scale: 1.08 }}
                    className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl', tone.icon)}
                  >
                    <t.icon size={18} />
                  </motion.div>
                  <h3 className="mt-3 text-base font-semibold text-ink-900 dark:text-ink-50">{t.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{t.desc}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
