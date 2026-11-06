import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, Mail, MapPin } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { Footer } from '../components/shared/Footer';
import { buttonClasses } from '../components/shared/buttonStyles';
import { Reveal } from '../components/shared/Motion';
import { EASE_OUT, hoverLift, staggerItem, staggerOnScroll } from '../components/shared/motionPresets';
import { ExperienceReel } from '../components/hireme/ExperienceReel';
import { SkillsMarquee } from '../components/hireme/SkillsMarquee';
import { EXPERIENCE, PROFILE, PROJECTS, STATS } from '../data/profile';

const Section: React.FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
  <section className="border-t border-line">
    <div className="page-x py-10 md:py-14">
      <Reveal>
        <h2 className="mb-8 text-5xl md:text-7xl">{title}</h2>
      </Reveal>
      {children}
    </div>
  </section>
);

// The same two actions sit on the red poster and on the plain page, so each surface picks matching buttons.
const ContactActions: React.FC<{ onCurtain?: boolean }> = ({ onCurtain = false }) => (
  <div className="flex flex-wrap gap-4">
    <a href={`mailto:${PROFILE.email}`} className={buttonClasses(onCurtain ? 'marquee' : 'primary')}>
      <Mail className="size-4" /> Hire me
    </a>
    <a href={PROFILE.resume} download className={buttonClasses(onCurtain ? 'curtain-outline' : 'outline')}>
      <Download className="size-4" /> Download resume
    </a>
  </div>
);

const ExternalAnchor: React.FC<{ href: string; children: ReactNode; className?: string }> = ({ href, children, className = 'text-accent' }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={`label-caps inline-flex min-h-11 items-center gap-1 hover:underline ${className}`}>
    {children}
    <ExternalLink className="size-3.5" />
  </a>
);

const Tags: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="flex flex-wrap gap-1.5">
    {items.map((item) => (
      <li key={item} className="rounded-sm border border-line px-2 py-1 font-mono text-xs text-ink">{item}</li>
    ))}
  </ul>
);

export const HireMePage: React.FC = () => (
  <div className="flex flex-col">

    <main className="flex-1">
      {/* A one-sheet movie poster: headline and billing on the curtain, the photo framed on the right, credits along the bottom. */}
      <section className="page-x pt-6 pb-10 md:pt-8 md:pb-12 lg:pt-[3vh] lg:pb-[4vh]">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          className="curtain relative text-curtain-ink shadow-[10px_10px_0_rgba(0,0,0,0.5)]"
        >
          <div aria-hidden="true" className="marquee-bulbs" />

          <div className="grid md:grid-cols-[1fr_minmax(14rem,20rem)] lg:grid-cols-[1fr_auto]">
            <div className="spotlight flex flex-col p-6 sm:p-8 lg:px-[3vw] lg:py-[3.5vh]">
              <p className="label-caps text-curtain-ink">{PROFILE.role}</p>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.2 }}
                className="mt-3 text-[clamp(3.5rem,11vw,7rem)] leading-[0.85] lg:text-[clamp(3.5rem,min(7vw,12vh),8rem)]"
              >
                I'm {PROFILE.firstName}
              </motion.h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-curtain-ink/90 lg:mt-[2.5vh]">{PROFILE.summary}</p>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-curtain-ink/80">
                <MapPin className="size-4" /> {PROFILE.location}
              </p>
              <div className="mt-5 lg:mt-[2.5vh]">
                <ContactActions onCurtain />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-6">
                {PROFILE.links.map((link) => (
                  <ExternalAnchor key={link.label} href={link.href} className="text-curtain-ink">{link.label}</ExternalAnchor>
                ))}
              </div>
              <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-curtain-ink/25 pt-4 md:mt-auto lg:pt-[2.5vh]">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <dd className="font-display text-4xl leading-none text-marquee lg:text-[clamp(2.25rem,min(3.6vw,6.5vh),4rem)]">{stat.value}</dd>
                    <dt className="label-caps mt-2 text-curtain-ink/80">{stat.label}</dt>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative bg-black/25 p-4 sm:p-5 lg:p-[2.5vh]">
              <motion.div
                initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.3 }}
                whileHover={{ rotate: -1, scale: 1.015 }}
                className="border-4 border-ticket bg-ticket"
              >
                <img src={PROFILE.photo} alt={PROFILE.name} className="aspect-3/4 w-full object-cover grayscale-[30%] sepia-[20%] lg:h-[50vh] lg:w-auto" />
                <p className="py-1.5 text-center font-display text-xl tracking-wide text-ticket-ink">{PROFILE.name.toUpperCase()}</p>
              </motion.div>
              <motion.span
                aria-hidden="true"
                initial={{ opacity: 0, scale: 1.8, rotate: -24 }}
                animate={{ opacity: 1, scale: 1, rotate: -6 }}
                transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.75 }}
                className="absolute top-2 left-1 bg-marquee px-3 py-1 font-display text-xl tracking-wider text-marquee-ink sm:top-3"
              >
                STARRING
              </motion.span>
            </div>
          </div>

          {/* The small print every poster has, filled from the real resume data. */}
          <p className="border-t border-curtain-ink/25 px-6 py-3 text-center font-display text-sm leading-relaxed tracking-[0.12em] text-curtain-ink/80 uppercase sm:px-10">
            {PROFILE.name} <span aria-hidden="true">·</span> {PROFILE.role} <span aria-hidden="true">·</span> featuring work at{' '}
            {EXPERIENCE.map((job) => job.company).join(' · ')}
          </p>

          <div aria-hidden="true" className="marquee-bulbs" />
        </motion.div>
      </section>

      <Section title="Experience">
        <ExperienceReel renderLink={(href) => <ExternalAnchor href={href}>Visit</ExternalAnchor>} />
      </Section>

      <Section title="Projects">
        <motion.div {...staggerOnScroll} className="grid gap-5 md:grid-cols-2">
          {PROJECTS.map((project) => (
            <motion.div key={project.title} {...staggerItem}>
              <motion.div {...hoverLift} className="h-full">
                <Card className="flex h-full flex-col border-t-4 border-t-curtain p-6 md:p-8">
                  <h3 className="text-3xl md:text-4xl">{project.title}</h3>
                  <p className="mt-3 mb-5 flex-1 text-base leading-relaxed text-muted">{project.description}</p>
                  <Tags items={project.tech} />
                  <div className="mt-3 flex gap-6">
                    <ExternalAnchor href={project.demo}>Live demo</ExternalAnchor>
                    <ExternalAnchor href={project.github}>GitHub</ExternalAnchor>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section title="Skills">
        <SkillsMarquee />
      </Section>

      <Section title="Get in touch">
        <Reveal className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 font-display text-3xl md:text-4xl">
            <a href={`mailto:${PROFILE.email}`} className="w-fit py-1 break-all transition-colors hover:text-accent">{PROFILE.email}</a>
            <a href={`tel:${PROFILE.phone.replace(/\s/g, '')}`} className="w-fit py-1 transition-colors hover:text-accent">{PROFILE.phone}</a>
          </div>
          <ContactActions />
        </Reveal>
      </Section>
    </main>

    <Footer />
  </div>
);
