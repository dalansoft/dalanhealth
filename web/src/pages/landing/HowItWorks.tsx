import { motion } from 'framer-motion';
import { Footprints, Ticket, Radar, Stethoscope, CheckCircle2 } from 'lucide-react';
import { Section } from '@/components/ui/Section';

const steps = [
  { icon: Footprints, title: 'Patient Arrives', desc: 'Walks in, scans the clinic QR, or books online from home.' },
  { icon: Ticket, title: 'Token Generated Instantly', desc: 'One sequential number across every entry source — printed, on-screen, or in the app.' },
  { icon: Radar, title: 'Track Queue Live', desc: 'Phone, reception screen and waiting-room TV all show the same live position.' },
  { icon: Stethoscope, title: 'Doctor Consultation', desc: 'Doctor calls next — the TV announces the name, the patient walks in calm.' },
  { icon: CheckCircle2, title: 'Visit Completed', desc: '₹9 incl. GST auto-deducts from the wallet. History, billing and follow-up saved.' },
];

export function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      eyebrow="How it works"
      title={<>From door to doctor in <span className="gradient-text">five steps.</span></>}
      description="No training manuals. Your receptionist learns it in five minutes; patients don't need to learn anything."
    >
      <div className="relative max-w-3xl mx-auto">
        {/* Timeline spine */}
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute left-[27px] top-2 bottom-2 w-[2px] origin-top bg-brand-500"
          aria-hidden
        />
        <ol className="space-y-8">
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.08 }}
              className="relative flex gap-5"
            >
              <motion.span
                whileInView={{ scale: [0.6, 1.15, 1] }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 + 0.2, duration: 0.4 }}
                className="relative z-10 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl glass-strong text-brand-600 dark:text-brand-300 shadow-glow"
              >
                <s.icon size={22} />
              </motion.span>
              <div className="pt-1">
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">Step {i + 1}</div>
                <h3 className="mt-1 text-lg font-semibold text-ink-900 dark:text-ink-50">{s.title}</h3>
                <p className="mt-1 text-sm text-muted max-w-md">{s.desc}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
