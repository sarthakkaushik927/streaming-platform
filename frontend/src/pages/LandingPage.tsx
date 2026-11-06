import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Footer } from '../components/shared/Footer';
import { LinkButton } from '../components/shared/LinkButton';
import { Ticket } from '../components/shared/Ticket';
import { Reveal } from '../components/shared/Motion';
import { EASE_OUT, hoverLift, staggerItem, staggerOnScroll } from '../components/shared/motionPresets';
import { HeroPoster } from '../components/landing/HeroPoster';

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

  return (
    <div className="flex flex-col">

      <main className="flex-1">
        <section className="page-x grid items-center gap-12 pt-10 pb-8 sm:pt-12 lg:grid-cols-[1fr_1fr] lg:gap-10 lg:pt-[6vh] lg:pb-[4vh] xl:gap-14">
          <div className="min-w-0">
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
          </div>

          <HeroPoster />
        </section>

        <Section title="Built for watching together">
          <motion.ol {...staggerOnScroll} className="grid gap-10 md:grid-cols-3 md:gap-8">
            {FEATURES.map(({ title, text }, index) => (
              <motion.li key={title} {...staggerItem} className="border-t-2 border-accent pt-5">
                <motion.span {...hoverLift} className="inline-block font-display text-6xl leading-none text-accent">
                  {String(index + 1).padStart(2, '0')}
                </motion.span>
                <h3 className="mt-4 text-3xl">{title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted">{text}</p>
              </motion.li>
            ))}
          </motion.ol>
        </Section>

        <Section title="Start in three steps">
          <motion.ol {...staggerOnScroll} className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <motion.li key={step.title} {...staggerItem}>
                <Ticket
                  className="bg-ticket text-ticket-ink"
                  stub={<span className="label-caps text-ticket-muted">Step {index + 1} of {STEPS.length}</span>}
                >
                  <h3 className="text-4xl">{step.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-ticket-muted">{step.text}</p>
                </Ticket>
              </motion.li>
            ))}
          </motion.ol>
        </Section>

        <section className="curtain overflow-hidden text-curtain-ink">
          <Reveal className="page-x flex flex-col items-start justify-between gap-8 py-12 md:flex-row md:items-end md:py-16">
            <h2 className="max-w-3xl text-[clamp(3rem,9vw,6rem)] leading-[0.9]">Save everyone a seat.</h2>
            <LinkButton to={primaryPath} variant="marquee" className="shrink-0">Create your first room</LinkButton>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
};
