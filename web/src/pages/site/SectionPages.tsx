import { Features } from '@/pages/landing/Features';
import { Pricing } from '@/pages/landing/Pricing';
import { Subscribe } from '@/pages/landing/Subscribe';
import { HowItWorks } from '@/pages/landing/HowItWorks';
import { LiveQueueDemo } from '@/pages/landing/LiveQueueDemo';
import { TvDisplaySection } from '@/pages/landing/TvDisplaySection';
import { FAQ } from '@/pages/landing/FAQ';
import { CTA } from '@/pages/landing/CTA';

/**
 * Standalone routes for each top-nav item. They reuse the landing sections
 * (which carry their own headers) so the dedicated pages and the homepage
 * never drift apart.
 */

export function FeaturesPage() {
  return (
    <>
      <Features />
      <CTA />
    </>
  );
}

export function PricingPage() {
  return (
    <>
      <Pricing />
      <Subscribe />
      <CTA />
    </>
  );
}

export function HowItWorksPage() {
  return (
    <>
      <HowItWorks />
      <LiveQueueDemo />
      <CTA />
    </>
  );
}

export function TvDisplayPage() {
  return (
    <>
      <TvDisplaySection />
      <CTA />
    </>
  );
}

export function FaqPage() {
  return (
    <>
      <FAQ />
      <CTA />
    </>
  );
}
