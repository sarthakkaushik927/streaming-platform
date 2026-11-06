import React from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT, IN_VIEW } from '../shared/motionPresets';
import { SKILLS } from '../../data/profile';

const SkillRun: React.FC<{ items: string[]; hidden?: boolean }> = ({ items, hidden = false }) => (
  <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
    {items.map((item, index) => (
      <li key={item} className="flex items-center">
        <span
          className={`px-5 font-display text-4xl whitespace-nowrap md:text-6xl ${
            index % 2 ? 'text-transparent [-webkit-text-stroke:1px_var(--ink)]' : 'text-ink'
          }`}
        >
          {item}
        </span>
        <span aria-hidden="true" className="text-xl text-accent">✦</span>
      </li>
    ))}
  </ul>
);

/*
  Each skill group is a theatre-marquee ticker: big poster letters scrolling sideways, rows alternating direction.
  The list is drawn twice so the loop is seamless; screen readers only get the first copy. Hovering pauses a row.
*/
export const SkillsMarquee: React.FC = () => (
  <div className="space-y-4">
    {SKILLS.map((group, index) => (
      <motion.div
        key={group.title}
        initial={{ opacity: 0, x: index % 2 ? 60 : -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={IN_VIEW}
        transition={{ duration: 0.7, ease: EASE_OUT }}
        className="grid items-center border-y border-line md:grid-cols-[14rem_1fr]"
      >
        <h3 className="px-1 pt-4 text-2xl text-accent md:border-r md:border-line md:py-6 md:text-3xl">{group.title}</h3>
        <div className="ticker overflow-hidden py-4 md:py-6">
          <div className={`ticker-track flex w-max ${index % 2 ? 'ticker-reverse' : ''}`}>
            <SkillRun items={group.items} />
            <SkillRun items={group.items} hidden />
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);
