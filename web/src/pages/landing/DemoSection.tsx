import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, ShieldCheck, Stethoscope, Headset, ArrowRight } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const demos = [
  {
    role: 'patient',
    title: 'Patient app',
    desc: 'Doctor search, QR join queue, live token tracking, ₹1 booking and cashback wallet.',
    icon: Smartphone,
    tone: 'from-brand-500/15 to-brand-500/0',
    color: 'text-brand-600 dark:text-brand-300',
  },
  {
    role: 'super_admin',
    title: 'Super admin',
    desc: 'Clinic monitoring, revenue analytics, recharge, cashback campaigns, support.',
    icon: ShieldCheck,
    tone: 'from-accent-500/15 to-accent-500/0',
    color: 'text-accent-600 dark:text-accent-300',
  },
  {
    role: 'clinic_admin',
    title: 'Clinic admin',
    desc: 'Queue management, billing, prescription, wallet, reports, staff and QR.',
    icon: Stethoscope,
    tone: 'from-teal-500/15 to-teal-500/0',
    color: 'text-teal-600 dark:text-teal-400',
  },
  {
    role: 'receptionist',
    title: 'Receptionist',
    desc: 'Add patient, generate token, billing, prescription — five seconds per patient.',
    icon: Headset,
    tone: 'from-success-500/15 to-success-500/0',
    color: 'text-success-600 dark:text-success-400',
  },
] as const;

export function DemoSection() {
  return (
    <Section
      id="demo"
      eyebrow="Try it now"
      title="Open any demo in one click."
      description="No signup. No friction. Real interactive dashboards with realistic data."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {demos.map((d, i) => (
          <motion.div
            key={d.role}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={`/demo?role=${d.role}`} className="block h-full group">
              <Card hover className="h-full relative overflow-hidden">
                <div className={`absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${d.tone} blur-2xl`} />
                <div className="relative">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${d.tone} flex items-center justify-center ${d.color}`}>
                    <d.icon size={22} />
                  </div>
                  <div className="mt-5 flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-50">{d.title}</h3>
                    <Badge tone="neutral" size="sm">Live</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted">{d.desc}</p>
                  <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-300 group-hover:gap-2.5 transition-all">
                    Open demo <ArrowRight size={14} />
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
