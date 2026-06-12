import { motion } from 'framer-motion';
import { Globe, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

const channels = [
  { icon: Mail, title: 'Email us', value: 'info@dalanhealth.com', href: 'mailto:info@dalanhealth.com', note: 'Sales, support, careers — we reply within a working day.' },
  { icon: Globe, title: 'Website', value: 'dalanhealth.com', href: 'https://dalanhealth.com', note: 'Product, pricing and the live demo, all in one place.' },
  { icon: MapPin, title: 'Office', value: 'Patna, India', note: 'Dalansoft Technologies Pvt Ltd.' },
];

export function ContactPage() {
  return (
    <>
      <Section
        eyebrow="Contact"
        title={<>Talk to a <span className="gradient-text">human.</span></>}
        description="Questions about pricing, onboarding your clinic, or putting a TV display on your wall — we're easy to reach."
      >
        <div className="grid sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {channels.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl glass p-6 text-center"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
                <c.icon size={20} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink-900 dark:text-ink-50">{c.title}</h3>
              {c.href ? (
                <a
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="mt-1 block text-sm font-semibold text-brand-600 dark:text-brand-300 hover:underline"
                >
                  {c.value}
                </a>
              ) : (
                <div className="mt-1 text-sm font-semibold text-ink-800 dark:text-ink-100">{c.value}</div>
              )}
              <p className="mt-2 text-xs text-muted">{c.note}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section className="pt-0 pb-24">
        <div className="rounded-[28px] glass-strong p-10 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
            Fastest answer: see it running.
          </h2>
          <p className="mt-3 text-muted">The live demo answers most questions in two minutes.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/demo"><Button size="lg">Open the Live Demo</Button></Link>
            <Link to="/signup"><Button size="lg" variant="outline">Book a Free Demo</Button></Link>
          </div>
        </div>
      </Section>
    </>
  );
}
