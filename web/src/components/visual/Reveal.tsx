import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

/* Scroll-reveal wrapper — fades + lifts its children in the first time they
   enter the viewport. Falls back to a plain wrapper for reduced-motion users. */

const variants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Vertical offset in px; smaller for subtle reveals. */
  y?: number;
}

export function Reveal({ children, className, delay = 0, y = 28 }: Props) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={{ hidden: { opacity: 0, y }, show: variants.show }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
