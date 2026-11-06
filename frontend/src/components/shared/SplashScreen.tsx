import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const SEEN_KEY = 'syncstream-splash-seen';
const SHOW_MS = 1900;
const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const;

// Session storage can throw in private windows or when site data is blocked, so treat that as "not seen".
const hasSeenSplash = (): boolean => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
};

const markSplashSeen = () => {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Without storage the splash just plays again next visit.
  }
};

/*
  Opening titles: a closed red curtain, the name lights up, then the curtain parts on the app.
  Plays once per browser session and never for people who ask for reduced motion.
*/
export const SplashScreen: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const [isShowing, setIsShowing] = useState(() => !hasSeenSplash());

  useEffect(() => {
    if (!isShowing) return;
    // With reduced motion the splash never renders (see below), so there is nothing to time; just remember it.
    if (reduceMotion) {
      markSplashSeen();
      return;
    }
    const timer = window.setTimeout(() => {
      markSplashSeen();
      setIsShowing(false);
    }, SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [isShowing, reduceMotion]);

  return (
    <AnimatePresence>
      {isShowing && !reduceMotion && (
        <motion.div
          key="splash"
          role="presentation"
          className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden"
          exit={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
        >
          {/* Each half carries its own bulbs, so they slide away with it */}
          {(['left', 'right'] as const).map((side) => (
            <motion.div
              key={side}
              aria-hidden="true"
              className={`curtain absolute inset-y-0 w-1/2 ${side === 'left' ? 'left-0' : 'right-0'}`}
              exit={{ x: side === 'left' ? '-100%' : '100%' }}
              transition={{ duration: 0.9, ease: CURTAIN_EASE }}
            >
              <div className="marquee-bulbs absolute inset-x-0 top-0" />
              <div className="marquee-bulbs absolute inset-x-0 bottom-0" />
            </motion.div>
          ))}

          <motion.div className="relative flex flex-col items-center gap-4 px-4" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <motion.p
              className="label-caps text-curtain-ink"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              Now showing
            </motion.p>
            <motion.span
              className="font-display text-[clamp(4rem,15vw,10rem)] leading-none tracking-wide whitespace-nowrap text-curtain-ink [text-shadow:6px_6px_0_rgba(0,0,0,0.35)]"
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.2 }}
            >
              SYNC<span className="text-marquee">STREAM</span>
            </motion.span>
            <motion.div
              aria-hidden="true"
              className="h-1 bg-marquee"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 1.05, duration: 0.6, ease: 'easeOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
