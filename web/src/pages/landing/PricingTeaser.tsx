import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

/** Compact pricing strip for the slim homepage — details live at /pricing. */
export function PricingTeaser() {
  return (
    <Section className="py-10 md:py-14">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[28px] border hairline glass-strong px-6 py-8 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div aria-hidden className="gradient-drift pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-500/10 via-transparent to-token/10" />
        <div className="relative text-center md:text-left">
          <div className="flex items-baseline justify-center md:justify-start gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight gradient-text">₹15</span>
            <span className="text-lg font-semibold text-ink-700 dark:text-ink-200">+ GST</span>
            <span className="text-sm text-muted">per visit</span>
          </div>
          <p className="mt-1.5 text-sm text-muted">
            No setup fee · No monthly fee · No annual contract — pay only when a visit completes.
          </p>
        </div>
        <div className="relative flex flex-wrap justify-center gap-3 shrink-0">
          <Link to="/pricing"><Button size="lg" variant="outline" rightIcon={<ArrowRight size={15} />}>See Full Pricing</Button></Link>
          <Link to="/signup"><Button size="lg">Get Started</Button></Link>
        </div>
      </motion.div>
    </Section>
  );
}
