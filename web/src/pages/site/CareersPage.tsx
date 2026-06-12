import { motion } from 'framer-motion';
import { Code2, Headset, Mail, Megaphone, Rocket } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

const teams = [
  { icon: Code2, title: 'Engineering', desc: 'React, React Native, FastAPI, PostgreSQL — real-time systems used by clinics every minute of the day.' },
  { icon: Megaphone, title: 'Sales & Clinic Onboarding', desc: 'Meet doctors, demo the product, and take a clinic from paper register to live queue in a day.' },
  { icon: Headset, title: 'Customer Support', desc: 'Hindi + English support that treats a receptionist\'s problem like a production incident.' },
];

export function CareersPage() {
  return (
    <>
      <Section
        eyebrow="Careers"
        title={<>Build healthcare infrastructure for <span className="gradient-text">a billion people.</span></>}
        description="We're a small team with a big mission: modernize how India's clinics run, one queue at a time."
      >
        <div className="max-w-3xl mx-auto space-y-5 text-base leading-relaxed text-ink-700 dark:text-ink-200">
          <p>
            Working at Dalan Health means your code, your call, or your demo directly changes how a patient's
            afternoon goes — less standing, less guessing, more getting better. We ship fast, talk to clinics
            every week, and measure ourselves by waiting time removed from people's lives.
          </p>
        </div>
      </Section>

      <Section eyebrow="Teams" title="Where you could fit" className="pt-0">
        <div className="grid sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {teams.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl glass p-6"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/15 text-accent-600 dark:text-accent-300">
                <t.icon size={20} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink-900 dark:text-ink-50">{t.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section className="pt-0 pb-24">
        <div className="rounded-[28px] glass-strong p-10 text-center max-w-3xl mx-auto">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
            <Rocket size={22} />
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
            Don't see a listed role? Pitch us anyway.
          </h2>
          <p className="mt-3 text-muted max-w-xl mx-auto">
            Tell us what you'd want to own at Dalan Health and why. We read every application ourselves.
          </p>
          <div className="mt-6">
            <a href="mailto:info@dalanhealth.com?subject=Careers%20at%20Dalan%20Health">
              <Button size="lg" leftIcon={<Mail size={15} />}>info@dalanhealth.com</Button>
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
