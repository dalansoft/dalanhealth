import { motion } from 'framer-motion';
import { HeartPulse, IndianRupee, MonitorPlay, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

const values = [
  { icon: Users, title: 'Patients first', desc: 'Every feature starts with one question — does this make the patient\'s visit calmer and faster?' },
  { icon: IndianRupee, title: 'Honest pricing', desc: '₹9 + GST per completed patient. No setup fee, no subscriptions, no contracts, no surprises.' },
  { icon: Sparkles, title: 'Radically simple', desc: 'A receptionist learns the panel in five minutes. Patients don\'t need to learn anything at all.' },
  { icon: ShieldCheck, title: 'Trust by design', desc: 'Strict clinic-level data isolation, encrypted at rest, with audit logs on every sensitive action.' },
];

export function AboutPage() {
  return (
    <>
      <Section
        eyebrow="About us"
        title={<>Better health starts with a <span className="gradient-text">better queue.</span></>}
        description="Dalan Health is the Smart Queue & Digital OPD platform for Indian clinics — built by Dalansoft Technologies."
      >
        <div className="max-w-3xl mx-auto space-y-5 text-base leading-relaxed text-ink-700 dark:text-ink-200">
          <p>
            Walk into most clinics in India and you'll see the same scene: a crowded reception, a paper register,
            patients asking "how many more before me?" — and nobody with a good answer. The doctor is excellent;
            the experience around the doctor isn't.
          </p>
          <p>
            We built Dalan Health to fix exactly that. One unified queue for walk-ins, QR scans and online bookings.
            A TV on the wall that shows — and speaks — whose turn it is, in Hindi and English. A dashboard that tells
            the doctor and the owner what's actually happening, live. And a price any clinic can say yes to:
            <span className="font-semibold text-ink-900 dark:text-ink-50"> ₹9 + GST per completed patient</span>, nothing else.
          </p>
          <p>
            We're starting with the clinics big software companies ignore — single-doctor practices and small
            hospitals in India's fast-growing cities — because that's where better queues change the most lives.
          </p>
        </div>
      </Section>

      <Section eyebrow="What we believe" title="Our values" className="pt-0">
        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl glass p-6"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
                <v.icon size={20} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink-900 dark:text-ink-50">{v.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section className="pt-0 pb-24">
        <div className="rounded-[28px] glass-strong p-10 text-center max-w-3xl mx-auto">
          <div className="flex justify-center gap-3 text-brand-600 dark:text-brand-300">
            <HeartPulse size={22} /> <MonitorPlay size={22} />
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
            See what your clinic could feel like.
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/signup"><Button size="lg">Get Started</Button></Link>
            <Link to="/demo"><Button size="lg" variant="outline">Try the Live Demo</Button></Link>
          </div>
        </div>
      </Section>
    </>
  );
}
