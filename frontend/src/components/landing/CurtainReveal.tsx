import React, { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/*
  Two halves of a red curtain cover the section and part as you scroll to it.
  The timing is tied to the section's bottom edge reaching the bottom of the window, which can always be
  scrolled to (the footer follows), and the curtain is fully open a little before that point.
*/
export const CurtainReveal: React.FC<{ children: ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const leftX = useTransform(scrollYProgress, [0, 0.8], ['0%', '-101%']);
  const rightX = useTransform(scrollYProgress, [0, 0.8], ['0%', '101%']);
  const contentScale = useTransform(scrollYProgress, [0.3, 0.8], [0.94, 1]);

  return (
    <section ref={ref} className="spotlight relative overflow-hidden border-t border-line">
      <motion.div style={{ scale: contentScale }}>{children}</motion.div>
      <motion.div aria-hidden="true" style={{ x: leftX }} className="curtain pointer-events-none absolute inset-y-0 left-0 w-1/2">
        <div className="marquee-bulbs absolute inset-x-0 top-0" />
      </motion.div>
      <motion.div aria-hidden="true" style={{ x: rightX }} className="curtain pointer-events-none absolute inset-y-0 right-0 w-1/2">
        <div className="marquee-bulbs absolute inset-x-0 top-0" />
      </motion.div>
    </section>
  );
};
