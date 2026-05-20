import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

export function CTA() {
  return (
    <Section className="pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[28px] p-10 md:p-14 glass-strong text-center"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-500/15 via-accent-500/10 to-teal-500/10" />
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
          Ready to give your clinic a real queue?
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-muted">
          Launch in a day. Train your receptionist in five minutes. Make patients smile within a week.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/demo"><Button size="lg" rightIcon={<ArrowRight size={16} />}>Try the live demo</Button></Link>
          <Link to="/signup"><Button size="lg" variant="outline">Onboard your clinic</Button></Link>
        </div>
      </motion.div>
    </Section>
  );
}
