import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

// Deterministic particle field (no Math.random → stable across renders/SSR)
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  left: `${(i * 9.7 + 5) % 96}%`,
  bottom: `${(i * 13) % 55}%`,
  size: 2 + (i % 3) * 1.5,
  dur: `${7 + (i % 5)}s`,
  delay: `${(i * 0.9) % 6}s`,
  drift: `${(i % 2 === 0 ? 1 : -1) * (10 + (i % 4) * 6)}px`,
}));

export function CTA() {
  return (
    <Section className="pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[28px] p-10 md:p-16 glass-strong text-center"
      >
        {/* Animated gradient wash + glow */}
        <div className="gradient-drift absolute inset-0 -z-10 bg-gradient-to-br from-brand-500/20 via-accent-500/10 to-token/15" />
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />

        {/* Floating particles */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="particle bg-brand-400/50 dark:bg-brand-300/40"
              style={{
                left: p.left,
                bottom: p.bottom,
                width: p.size,
                height: p.size,
                ['--dur' as string]: p.dur,
                ['--delay' as string]: p.delay,
                ['--drift' as string]: p.drift,
              }}
            />
          ))}
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
          Ready to Transform Your Clinic?
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-muted">
          Join the next generation of clinics using DALAN HEALTH.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/signup"><Button size="lg" rightIcon={<ArrowRight size={16} />}>Book Demo</Button></Link>
          <a href="mailto:info@dalanhealth.com">
            <Button size="lg" variant="outline" leftIcon={<Mail size={15} />}>Contact Sales</Button>
          </a>
        </div>
        <p className="mt-5 text-xs text-muted">₹9 + GST per visit · No setup fee · No contract</p>
      </motion.div>
    </Section>
  );
}
