import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { EASE_OUT, IN_VIEW } from './motionPresets';

// Fades each page in on arrival and out on leaving. Used by the router around every route.
export const PageTransition: React.FC<{ children: ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT } }}
    exit={{ opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } }}
  >
    {children}
  </motion.div>
);

interface RevealProps extends HTMLMotionProps<'div'> {
  delay?: number;
}

// Rises into place the first time it scrolls into view.
export const Reveal: React.FC<RevealProps> = ({ delay = 0, children, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={IN_VIEW}
    transition={{ duration: 0.6, ease: EASE_OUT, delay }}
    {...props}
  >
    {children}
  </motion.div>
);
