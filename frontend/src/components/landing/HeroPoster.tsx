import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play } from 'lucide-react';
import { EASE_OUT } from '../shared/motionPresets';

const SEATS = ['Asha', 'Ravi', 'Meera'];

/*
  The hero's right side: a red-curtain poster. Its three little screens share one CSS animation,
  so their progress bars move exactly together, which is what the app does for a room.
  It slides in on load, the stamp and ticket land after it, and it drifts slightly slower than the page on scroll.
*/
export const HeroPoster: React.FC = () => {
  const { scrollY } = useScroll();
  const drift = useTransform(scrollY, [0, 700], [0, -70]);

  return (
    <motion.div style={{ y: drift }} className="relative mx-auto w-full max-w-xl pb-8 lg:max-w-none">
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: 2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.2 }}
        whileHover={{ rotate: -0.8, scale: 1.01 }}
        className="curtain relative p-3 text-curtain-ink shadow-[10px_10px_0_rgba(0,0,0,0.5)]"
      >
        <div aria-hidden="true" className="marquee-bulbs" />
        <div className="spotlight px-4 pt-8 pb-7 sm:px-8 lg:px-[2.5vw] lg:pt-[5vh] lg:pb-[4vh]">
          <p className="label-caps text-curtain-ink">SyncStream presents</p>
          <p className="mt-3 font-display text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.92] lg:text-[clamp(2.5rem,min(4vw,7.5vh),4.75rem)]">
            The show starts when you press play.
          </p>

          <div aria-hidden="true" className="mt-8 grid grid-cols-3 gap-2 sm:gap-3 lg:mt-[4.5vh]">
            {SEATS.map((name) => (
              <div key={name}>
                <div className="relative flex aspect-video items-center justify-center overflow-hidden border border-black/40 bg-screen">
                  <Play className="size-4 text-white/30 sm:size-5" />
                  <div className="absolute inset-x-1.5 bottom-1.5 h-0.5 bg-white/20">
                    <div className="sync-progress h-full bg-marquee" />
                  </div>
                </div>
                <p className="mt-1.5 flex items-center justify-between gap-1 font-mono text-[0.625rem] tracking-wider text-curtain-ink/85 uppercase">
                  <span className="truncate">{name}</span>
                  <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-marquee" /> Sync
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
        <div aria-hidden="true" className="marquee-bulbs" />
      </motion.div>

      <motion.span
        aria-hidden="true"
        initial={{ opacity: 0, scale: 1.8, rotate: 24 }}
        animate={{ opacity: 1, scale: 1, rotate: 6 }}
        transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.85 }}
        className="absolute -top-4 right-3 border-2 border-curtain bg-canvas px-3 py-1 font-display text-lg tracking-wider text-curtain sm:-right-4 sm:text-xl"
      >
        NOW SHOWING
      </motion.span>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, x: -50, rotate: -22 }}
        animate={{ opacity: 1, x: 0, rotate: -6 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 1 }}
        whileHover={{ rotate: -2, y: -4 }}
        className="ticket ticket-notch-mid absolute bottom-0 left-3 flex items-stretch bg-ticket text-ticket-ink sm:-left-6"
      >
        <div className="px-4 py-2.5">
          <p className="font-mono text-[0.625rem] tracking-[0.18em] text-ticket-muted uppercase">Admit one</p>
          <p className="font-display text-2xl leading-none sm:text-3xl">ROOM 42</p>
        </div>
        <div className="border-l-2 border-dashed border-ticket-muted/40 px-3 py-2.5 font-mono text-[0.625rem] leading-tight tracking-[0.18em] text-ticket-muted uppercase [writing-mode:vertical-rl]">
          Row A
        </div>
      </motion.div>
    </motion.div>
  );
};
