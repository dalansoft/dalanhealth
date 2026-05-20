import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero } from './Hero';
import { ProblemSolution } from './ProblemSolution';
import { Features } from './Features';
import { DemoSection } from './DemoSection';
import { Showcase } from './Showcase';
import { Pricing } from './Pricing';
import { FAQ } from './FAQ';
import { CTA } from './CTA';

export function LandingPage() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return (
    <>
      <Hero />
      <ProblemSolution />
      <Features />
      <DemoSection />
      <Showcase />
      <Pricing />
      <FAQ />
      <CTA />
    </>
  );
}
