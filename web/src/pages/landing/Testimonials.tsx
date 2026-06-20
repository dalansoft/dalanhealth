import { Star } from 'lucide-react';
import { Section } from '@/components/ui/Section';

interface Quote {
  quote: string;
  name: string;
  role: string;
  metric?: string;
}

const QUOTES: Quote[] = [
  { quote: 'My waiting room used to look like a railway platform. Now patients sit calmly watching the TV — they know exactly when their turn comes.', name: 'Dr. A. Sharma', role: 'ENT Specialist, Patna', metric: '−70% crowding at reception' },
  { quote: 'The compounder picked it up in one morning. Token disputes simply stopped — the screen is the truth, not the register.', name: 'Dr. R. Sinha', role: 'General Physician, Muzaffarpur', metric: 'Zero token disputes' },
  { quote: 'Patients book from home and walk in just before their number. The clinic feels organised for the first time in 12 years.', name: 'Dr. S. Kumari', role: 'Pediatrician, Gaya', metric: '40 min avg. wait → 12 min' },
  { quote: '9rs+gst per visit and nothing else. No yearly contract pressure, no surprise renewal call. I pay exactly for what I use.', name: 'Dr. V. Thakur', role: 'Orthopaedic Clinic, Bhagalpur', metric: '₹0 fixed cost' },
  { quote: 'The Hindi voice announcement is the feature my elderly patients love most. They hear their name — no squinting at screens.', name: 'Dr. M. Ansari', role: 'Family Clinic, Darbhanga', metric: 'Hindi + English voice' },
  { quote: 'I check revenue and patient count from my phone at night. Before this, I found out at month-end from the register.', name: 'Dr. P. Verma', role: 'Skin Clinic, Patna', metric: 'Live daily analytics' },
];

/** Infinite horizontal marquee — duplicate track, CSS-driven, pauses on hover. */
export function Testimonials() {
  const track = [...QUOTES, ...QUOTES];
  return (
    <Section
      eyebrow="Loved by clinics"
      title={<>Doctors talk. <span className="gradient-text">Queues listen.</span></>}
      description="What modern clinics say after switching to Dalan Health."
      className="overflow-hidden"
    >
      <div className="marquee-paused relative -mx-5 sm:-mx-8">
        {/* Edge fades */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-[rgb(var(--bg))] to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-[rgb(var(--bg))] to-transparent" />

        <div className="marquee-track flex gap-5 w-max py-2" style={{ ['--marquee-dur' as string]: '55s' }}>
          {track.map((q, i) => (
            <figure
              key={i}
              className="w-[320px] sm:w-[380px] shrink-0 rounded-2xl glass p-6 hover:shadow-glow transition-shadow"
            >
              <div className="flex items-center gap-1 text-warning-500" aria-label="5 star rating">
                {Array.from({ length: 5 }).map((_, s) => <Star key={s} size={13} fill="currentColor" />)}
              </div>
              <blockquote className="mt-3 text-sm text-ink-800 dark:text-ink-100 leading-relaxed">
                “{q.quote}”
              </blockquote>
              <figcaption className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{q.name}</div>
                  <div className="text-[11px] text-muted">{q.role}</div>
                </div>
                {q.metric && (
                  <span className="shrink-0 rounded-full bg-token/10 text-token px-2.5 py-1 text-[10px] font-bold">
                    {q.metric}
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Section>
  );
}
