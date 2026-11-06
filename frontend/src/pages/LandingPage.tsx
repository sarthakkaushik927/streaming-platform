import React, { useRef } from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Footer } from '../components/shared/Footer';
import { LinkButton } from '../components/shared/LinkButton';
import { Ticket } from '../components/shared/Ticket';
import { Reveal } from '../components/shared/Motion';
import { EASE_OUT, IN_VIEW } from '../components/shared/motionPresets';
import { HeroPoster } from '../components/landing/HeroPoster';
import { ScrollProgress } from '../components/landing/ScrollProgress';
import { ScrollTicker } from '../components/landing/ScrollTicker';
import { CurtainReveal } from '../components/landing/CurtainReveal';

const FEATURES = [
  { title: 'Everyone stays in sync', text: 'Play, pause, seek or change the video, and every screen in the room follows.' },
  { title: 'Clear roles', text: 'Hosts and moderators run the room. Participants ask, and a host or moderator approves.' },
  { title: 'Chat and reactions', text: 'Talk during the video and send emoji reactions everyone in the room can see.' },
];

const STEPS = [
  { title: 'Create a room', text: 'Sign up and name your room. You start as the host.' },
  { title: 'Share the link', text: 'Send the link or room code to the people you want to watch with.' },
  { title: 'Press play', text: 'Paste any YouTube link and watch together.' },
];

const BILLING = ['Play', 'Pause', 'Seek', 'Change video', 'Chat', 'Reactions'];

const HEADLINE = [
  { text: 'Watch YouTube', accent: false },
  { text: 'together,', accent: false },
  { text: 'in sync.', accent: true },
];

// Features come in from the sides and the middle one rises, so the row assembles like a poster being hung.
const FEATURE_ENTRANCES = [{ x: -70, y: 0 }, { x: 0, y: 70 }, { x: 70, y: 0 }];
// The three tickets fan in tilted, then straighten.
const STEP_TILTS = [-9, 3, 10];

// The headline rises in phrase by phrase, like poster lettering being put up.
const headlineParent: Variants = { hidden: {}, shown: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
const headlinePhrase: Variants = {
  hidden: { opacity: 0, y: '55%' },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="border-t border-line">
    <div className="page-x py-10 md:py-14">
      <Reveal>
        <h2 className="text-5xl md:text-7xl">{title}</h2>
      </Reveal>
      <div className="mt-8 md:mt-10">{children}</div>
    </div>
  </section>
);

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const primaryPath = user ? '/dashboard' : '/register';

  // As the hero scrolls away, its text drifts up and fades while the poster keeps its own slower parallax.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroTextY = useTransform(heroProgress, [0, 1], [0, -90]);
  const heroTextOpacity = useTransform(heroProgress, [0, 0.85], [1, 0.15]);

  return (
    <div className="flex flex-col">
      <ScrollProgress />

      <main className="flex-1">
        <section
          ref={heroRef}
          className="page-x grid items-center gap-12 pt-10 pb-8 sm:pt-12 lg:grid-cols-[1fr_1fr] lg:gap-10 lg:pt-[6vh] lg:pb-[4vh] xl:gap-14"
        >
          <motion.div className="min-w-0" style={{ y: heroTextY, opacity: heroTextOpacity }}>
            <motion.h1
              variants={headlineParent}
              initial="hidden"
              animate="shown"
              className="text-[clamp(3rem,10vw,6rem)] leading-[0.9] lg:text-[clamp(3.25rem,min(5.6vw,10.5vh),6.75rem)]"
            >
              {HEADLINE.map(({ text, accent }) => (
                <motion.span key={text} variants={headlinePhrase} className={`mr-[0.22em] inline-block ${accent ? 'text-accent' : ''}`}>
                  {text}
                </motion.span>
              ))}
            </motion.h1>
            <Reveal delay={0.45}>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted lg:mt-[3vh] xl:text-lg">
                Create a room, share the link, and everyone sees the same moment. Play, pause and seek stay matched for the whole room.
              </p>
            </Reveal>
            <Reveal delay={0.55} className="mt-7 flex flex-col gap-4 sm:flex-row lg:mt-[4vh]">
              <LinkButton to={primaryPath} className="sm:w-auto" fullWidth>Start a room</LinkButton>
              <LinkButton to="/explore" variant="outline" className="sm:w-auto" fullWidth>Explore rooms</LinkButton>
            </Reveal>
            <Reveal delay={0.65}>
              <p className="label-caps mt-7 flex flex-wrap gap-x-3 gap-y-1 text-muted lg:mt-[4vh]">
                {BILLING.map((item, index) => (
                  <span key={item}>
                    {index > 0 && <span aria-hidden="true" className="mr-3 text-accent">✦</span>}
                    {item}
                  </span>
                ))}
              </p>
            </Reveal>
          </motion.div>

          <HeroPoster />
        </section>

        <ScrollTicker />

        <Section title="Built for watching together">
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
            {FEATURES.map(({ title, text }, index) => (
              <motion.li
                key={title}
                className="border-t-2 border-accent pt-5"
                initial={{ opacity: 0, ...FEATURE_ENTRANCES[index] }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={IN_VIEW}
                transition={{ duration: 0.7, ease: EASE_OUT, delay: index * 0.1 }}
              >
                <motion.span
                  className="inline-block origin-bottom-left font-display text-6xl leading-none text-accent"
                  initial={{ scale: 0.4, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  whileHover={{ y: -6 }}
                  viewport={IN_VIEW}
                  transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.25 + index * 0.1 }}
                >
                  {String(index + 1).padStart(2, '0')}
                </motion.span>
                <h3 className="mt-4 text-3xl">{title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted">{text}</p>
              </motion.li>
            ))}
          </ol>
        </Section>

        <Section title="Start in three steps">
          <ol className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 90, rotate: STEP_TILTS[index] }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={IN_VIEW}
                transition={{ type: 'spring', stiffness: 140, damping: 18, delay: index * 0.12 }}
              >
                <Ticket
                  className="bg-ticket text-ticket-ink"
                  stub={<span className="label-caps text-ticket-muted">Step {index + 1} of {STEPS.length}</span>}
                >
                  <h3 className="text-4xl">{step.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-ticket-muted">{step.text}</p>
                </Ticket>
              </motion.li>
            ))}
          </ol>
        </Section>

        <CurtainReveal>
          <div className="page-x flex flex-col items-start justify-between gap-8 py-16 md:flex-row md:items-end md:py-24">
            <h2 className="max-w-3xl text-[clamp(3rem,9vw,6rem)] leading-[0.9]">Save everyone a seat.</h2>
            <LinkButton to={primaryPath} variant="marquee" className="shrink-0">Create your first room</LinkButton>
          </div>
        </CurtainReveal>
      </main>

      <Footer />
    </div>
  );
};
