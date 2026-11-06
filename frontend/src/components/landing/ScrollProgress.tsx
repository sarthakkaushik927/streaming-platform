import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

// A thin marquee-yellow bar along the very top of the window that fills as you scroll down the page.
export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 32, mass: 0.4 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: progress }}
      className="fixed inset-x-0 top-0 z-45 h-[3px] origin-left bg-marquee shadow-[0_0_8px_rgba(255,197,49,0.6)]"
    />
  );
};
