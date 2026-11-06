import React, { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// How much of each half stays visible once the curtain is fully open, gathered at its edge.
const GATHERED = 0.1;

/*
  Two halves of a red curtain cover the section and part from the centre as you scroll to it.
  They don't disappear: each half squeezes toward its outer edge, so the folds bunch up like a real
  theatre curtain and stay as a red frame on both sides.
  The timing follows the section's bottom edge reaching the bottom of the window, which can always be
  scrolled to (the footer follows), and the curtain is fully open a little before that point.
*/
export const CurtainReveal: React.FC<{ children: ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const curtainScale = useTransform(scrollYProgress, [0, 0.8], [1, GATHERED]);
  const contentScale = useTransform(scrollYProgress, [0.3, 0.8], [0.94, 1]);

  return (
    <section ref={ref} className="spotlight relative overflow-hidden border-t border-line">
      {/* Side padding keeps the text clear of the gathered curtains. */}
      <motion.div style={{ scale: contentScale }} className="px-[6vw]">
        {children}
      </motion.div>

      <motion.div
        aria-hidden="true"
        style={{ scaleX: curtainScale }}
        className="curtain pointer-events-none absolute inset-y-0 left-0 w-1/2 origin-left shadow-[inset_-18px_0_24px_-12px_rgba(0,0,0,0.45)]"
      />
      <motion.div
        aria-hidden="true"
        style={{ scaleX: curtainScale }}
        className="curtain pointer-events-none absolute inset-y-0 right-0 w-1/2 origin-right shadow-[inset_18px_0_24px_-12px_rgba(0,0,0,0.45)]"
      />
      <div aria-hidden="true" className="marquee-bulbs pointer-events-none absolute inset-x-0 top-0" />
    </section>
  );
};
