import type { Variants } from 'framer-motion';

// One easing curve for the whole app: quick start, soft landing.
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Animations start a little before an element is fully on screen, and only run once.
export const IN_VIEW = { once: true, margin: '0px 0px -80px 0px' } as const;

const staggerParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 26 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
};

/** Spread on a motion list (motion.ol, motion.div...) so its children reveal one after another on scroll. */
export const staggerOnScroll = { variants: staggerParent, initial: 'hidden', whileInView: 'shown', viewport: IN_VIEW } as const;

/** Same as staggerOnScroll, but starts as soon as the element mounts. For things already on screen. */
export const staggerOnMount = { variants: staggerParent, initial: 'hidden', animate: 'shown' } as const;

/** Spread on each child of a stagger list. */
export const staggerItem = { variants: staggerChild } as const;

/** A gentle lift for cards that react to the pointer. */
export const hoverLift = { whileHover: { y: -6 }, transition: { type: 'spring', stiffness: 320, damping: 22 } } as const;
