import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { cn } from '@/lib/cn';

const faqs = [
  { q: 'Why a queue instead of fixed slots?', a: 'Tier-2/3 clinics in India run on walk-ins. Patients show up, take a token, wait. Fixed 15-minute slots assume metro behaviour and break the moment a single consultation runs long. DalanHealth gives you the visibility of slots without breaking the queue-based reality.' },
  { q: 'How does the wallet deduction work?', a: 'You prepay your wallet. We deduct ₹9 (Starter) or ₹12 (Growth) only when a consultation is marked complete. Cancellations, no-shows and tokens generated but not consulted are never charged.' },
  { q: 'Is patient data secure?', a: 'Yes. JWT authentication, role-based access control, encrypted data at rest, audit logs, and strict clinic_id isolation so one clinic can never see another\'s data.' },
  { q: 'What about offline patients?', a: 'Offline walk-ins are first-class. Your receptionist enters the mobile number, generates a token in 5 seconds, and the patient appears in the same unified queue as online and QR joiners.' },
  { q: 'Do patients need to install the app?', a: 'Only for online booking and live token tracking. Walk-in patients don\'t need the app — they get a printed/spoken token. QR join offers the smoothest in-clinic experience (scan → install → joined).' },
  { q: 'How are cashbacks limited?', a: 'Cashback is booking-fee adjustment only. Maximum 50% of any single booking fee can be paid from cashback. No bank withdrawal, no UPI transfer.' },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section id="faq" eyebrow="FAQ" title="Questions, answered." description="The most common things clinics and patients ask before getting started.">
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className={cn('rounded-2xl border hairline bg-white/70 dark:bg-ink-900/70 backdrop-blur')}
            >
              <button onClick={() => setOpen(isOpen ? null : i)} className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 focus-ring rounded-2xl">
                <span className="text-sm sm:text-base font-medium text-ink-900 dark:text-ink-50">{f.q}</span>
                <span className="text-muted">{isOpen ? <Minus size={16} /> : <Plus size={16} />}</span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-muted">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
