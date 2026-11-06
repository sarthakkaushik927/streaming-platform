import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const WORDS = ['Play', 'Pause', 'Seek', 'Sync', 'Chat', 'React', 'Approve', 'Host'];

const Row: React.FC<{ outlined?: boolean }> = ({ outlined = false }) => (
  <>
    {[...WORDS, ...WORDS].map((word, index) => (
      <span key={`${word}-${index}`} className="flex items-center">
        <span
          className={`px-[0.35em] font-display text-[clamp(3rem,8vw,7rem)] leading-none whitespace-nowrap uppercase ${
            outlined ? 'text-transparent [-webkit-text-stroke:1.5px_var(--ink)]' : 'text-ink'
          }`}
        >
          {word}
        </span>
        <span className="text-[clamp(1.25rem,3vw,2.5rem)] text-accent">✦</span>
      </span>
    ))}
  </>
);

/*
  A band of big poster words between sections. The two rows slide in opposite directions as the band
  passes through the window, tied to scroll position rather than a timer.
*/
export const ScrollTicker: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const forward = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const backward = useTransform(scrollYProgress, [0, 1], ['-30%', '0%']);

  return (
    <div ref={ref} aria-hidden="true" className="overflow-hidden border-y border-line py-6 md:py-8">
      <motion.div style={{ x: forward }} className="flex w-max">
        <Row />
      </motion.div>
      <motion.div style={{ x: backward }} className="mt-2 flex w-max">
        <Row outlined />
      </motion.div>
    </div>
  );
};
