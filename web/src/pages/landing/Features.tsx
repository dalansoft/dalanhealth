import { motion } from 'framer-motion';
import {
  Users, QrCode, Activity, Receipt, FileText, BellRing,
  Wallet, Gift, BarChart3, UserCog, Stethoscope, Smartphone,
} from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';

const features = [
  { icon: Users, title: 'Smart queue management', desc: 'Unified queue across offline, online and QR sources. No more parallel chaos.' },
  { icon: QrCode, title: 'QR queue join', desc: 'Patient scans, installs, logs in once, lands directly in your queue.' },
  { icon: Activity, title: 'Live token tracking', desc: 'WebSocket-powered realtime updates for patient app and reception screens.' },
  { icon: Receipt, title: 'Billing', desc: 'Print-ready invoices, GST-ready totals, share over WhatsApp in 5 seconds.' },
  { icon: FileText, title: 'Prescription', desc: 'Doctor-grade prescription builder with reusable medicines and follow-up dates.' },
  { icon: BellRing, title: 'Notifications', desc: 'Push → WhatsApp → SMS → Email fallback chain. Patients never miss their turn.' },
  { icon: Wallet, title: 'Wallet recharge', desc: 'Prepay your plan, auto-deduct per consultation. Low-balance alerts at ₹1000.' },
  { icon: Gift, title: 'Cashback engine', desc: 'Festival, doctor-promo and first-booking rewards. Booking-fee adjustment only.' },
  { icon: BarChart3, title: 'Reports & analytics', desc: 'Daily revenue, queue trends, follow-up funnels, source mix.' },
  { icon: UserCog, title: 'Staff management', desc: 'Receptionist, compounder, billing roles — RBAC built in.' },
  { icon: Stethoscope, title: 'Doctor dashboard', desc: 'Next patient, history, vitals, prior prescriptions — one tap.' },
  { icon: Smartphone, title: 'Patient mobile app', desc: 'Search doctors, join queue, track token, pay ₹1 booking — all in one place.' },
];

export function Features() {
  return (
    <Section
      id="features"
      eyebrow="Everything you need"
      title="One platform. End-to-end clinic operations."
      description="Twelve modules, one experience — designed for receptionists, doctors and patients alike."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: (i % 6) * 0.04 }}
          >
            <Card hover className="group h-full relative overflow-hidden">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-brand-500/10 to-accent-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-600 dark:text-brand-300 flex items-center justify-center">
                  <f.icon size={18} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-ink-900 dark:text-ink-50">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.desc}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
