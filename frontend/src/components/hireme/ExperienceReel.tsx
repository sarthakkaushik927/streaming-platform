import React, { ReactNode, useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Card } from '../shared/Card';
import { EASE_OUT, IN_VIEW, hoverLift } from '../shared/motionPresets';
import { EXPERIENCE } from '../../data/profile';

interface ExperienceReelProps {
  renderLink: (href: string) => ReactNode;
}

/*
  Experience as a reel of film: a sprocketed strip down the side fills with yellow as you scroll through,
  and each job slides in from the right when it reaches the screen.
*/
export const ExperienceReel: React.FC<ExperienceReelProps> = ({ renderLink }) => {
  const reelRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: reelRef, offset: ['start 80%', 'end 60%'] });

  return (
    <ol ref={reelRef} className="relative space-y-6 md:pl-16">
      <li aria-hidden="true" className="film-strip absolute inset-y-0 left-0 hidden w-9 md:block">
        <motion.span style={{ scaleY: scrollYProgress }} className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 origin-top bg-marquee" />
      </li>

      {EXPERIENCE.map((job, index) => (
        <motion.li
          key={job.company}
          initial={{ opacity: 0, x: 80, rotate: 1.5 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={IN_VIEW}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <motion.div {...hoverLift}>
            <Card className="relative overflow-hidden border-l-4 border-l-marquee p-6 md:p-8">
              <span aria-hidden="true" className="pointer-events-none absolute -top-3 right-4 font-display text-[7rem] leading-none text-ink/6 md:text-[9rem]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="relative flex flex-col justify-between gap-2 md:flex-row md:items-start">
                <div>
                  <h3 className="text-3xl md:text-4xl">{job.company}</h3>
                  <p className="mt-2 text-base text-muted">{job.role}</p>
                </div>
                <p className="label-caps shrink-0 border border-line px-2 py-1 text-muted">{[job.date, job.location].filter(Boolean).join(' · ')}</p>
              </div>
              <ul className="relative mt-5 list-disc space-y-2 pl-5 text-base leading-relaxed marker:text-accent">
                {job.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <div className="relative mt-2">{renderLink(job.url)}</div>
            </Card>
          </motion.div>
        </motion.li>
      ))}
    </ol>
  );
};
