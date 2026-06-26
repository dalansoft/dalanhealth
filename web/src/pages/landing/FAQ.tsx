import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { cn } from '@/lib/cn';

const faqs = [
  { q: 'How does pricing work?', a: 'Simple pay-per-use: ₹9 incl. GST per visit, deducted from your prepaid wallet only when a consultation is marked complete. Charged per visit, not per patient — if a patient visits twice in a month, that is 2 × ₹9 incl. GST. Cancellations, no-shows and unconsulted tokens are never charged. No monthly fee, no annual contract.' },
  { q: 'Do I need hardware?', a: 'No special hardware. Any phone, tablet or computer with a browser runs the clinic panel. For the waiting room, any ordinary TV with a browser (or a ₹2,000 Android stick) becomes your live queue display.' },
  { q: 'Can patients book online?', a: 'Yes. Patients book from home through the Dalan Health app or your clinic link, get a token instantly, and track the live queue on their phone — so they walk in just before their number is called.' },
  { q: 'How does QR booking work?', a: 'Print your clinic\'s unique QR and stick it at reception. Patients scan it with their phone camera, enter their name and mobile number, and join the same unified queue as walk-ins and online bookings — no app download required for a token.' },
  { q: 'Can I use TV Display?', a: 'Yes — it\'s included free. Open the display link on any TV browser and it shows the live token, up-next list and doctor info, with voice announcements in Hindi, English or both. Patients hear their name called.' },
  { q: 'Is there any setup fee?', a: 'Zero. No setup fee, no installation charges, no per-doctor license, no AMC, no server purchase, no IT team. You sign up, add your doctors, and start generating tokens the same day.' },
  { q: 'How do I recharge wallet?', a: 'Recharge anytime from the clinic dashboard via UPI, card or net banking. ₹9 incl. GST auto-deducts per completed visit, you can see every transaction in the wallet ledger, and we alert you before the balance runs low.' },
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
