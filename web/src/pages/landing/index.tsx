import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero } from './Hero';
import { TokenMergeShowcase, CompounderShowcase, PatientJourneyShowcase } from './WorkflowShowcase';
import { PricingTeaser } from './PricingTeaser';
import { Stats } from './Stats';
import { Testimonials } from './Testimonials';
import { CTA } from './CTA';
import { Reveal } from '@/components/visual/Reveal';

/**
 * Slim homepage: the animated product story. Deep detail lives on the
 * dedicated pages (/features, /pricing, /how-it-works, /tv-display, /faq).
 */
export function LandingPage() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Drop the hash from the URL once used — otherwise every refresh
      // replays the auto-scroll to this section.
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [hash]);

  return (
    <>
      <Hero />
      <Reveal><TokenMergeShowcase /></Reveal>
      <Reveal><CompounderShowcase /></Reveal>
      <Reveal><PatientJourneyShowcase /></Reveal>
      <Reveal><PricingTeaser /></Reveal>
      <Reveal><Stats /></Reveal>
      <Reveal><Testimonials /></Reveal>
      <Reveal><CTA /></Reveal>
    </>
  );
}
