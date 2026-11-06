import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Mail, Download, ChevronDown, MapPin, Briefcase, Code, Globe } from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const statCounters = [
  { label: 'APIs Built', value: 150 },
  { label: 'Concurrent Users Tested', value: 500 },
  { label: 'Registrations Managed', value: 180 },
];

const roles = [
  'Full Stack Developer',
  'AI Developer',
  'Web Developer',
  'Open Source Contributor',
];

const TypewriterRole: React.FC = () => {
  const [text, setText] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = roles[roleIndex];
    const speed = isDeleting ? 40 : 80;

    if (!isDeleting && text === currentRole) {
      const pause = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(pause);
    }

    if (isDeleting && text === '') {
      const nextRole = setTimeout(() => {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      }, speed);
      return () => clearTimeout(nextRole);
    }

    const timer = setTimeout(() => {
      setText(
        isDeleting
          ? currentRole.substring(0, text.length - 1)
          : currentRole.substring(0, text.length + 1)
      );
    }, speed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, roleIndex]);

  return (
    <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-tertiary">
      {text}
      <span
        className="inline-block w-0.75 h-[0.85em] ml-1 align-middle rounded-sm"
        style={{
          background: 'var(--primary)',
          animation: 'hireme-blink-cursor 0.8s step-end infinite',
        }}
      />
    </span>
  );
};

const AnimatedCounter: React.FC<{ target: number; suffix?: string; isVisible: boolean }> = ({
  target,
  suffix = '+',
  isVisible,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let frame: number;
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isVisible, target]);

  return (
    <span>{count}{suffix}</span>
  );
};

export const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const magneticRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMagneticMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = magneticRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  }, []);

  const handleMagneticLeave = useCallback(() => {
    const btn = magneticRef.current;
    if (!btn) return;
    btn.style.transform = 'translate(0, 0)';
  }, []);

  return (
    <section
      ref={heroRef}
      className="min-h-[85vh] flex flex-col justify-center relative pt-8 pb-16"
    >
      <div className="absolute inset-0 mesh-gradient pointer-events-none opacity-60" />

      <div
        className={`flex flex-col lg:flex-row items-center gap-10 lg:gap-16 relative z-10 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="relative w-full max-w-75 lg:max-w-95 shrink-0">
          <div className="relative group">
            <img
              src="/images/sarthak.jpg"
              alt="Sarthak Sharma"
              className="rounded-4xl border w-full h-auto relative z-10 transition-transform duration-500 group-hover:scale-[1.02]"
              style={{ borderColor: 'var(--outline)' }}
            />

            <div
              className="absolute -inset-3 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 blur-xl"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--tertiary))', opacity: 0 }}
            />

            <div
              className="absolute bottom-4 left-4 right-4 backdrop-blur-md border p-3 rounded-2xl flex items-center justify-between z-20"
              style={{
                background: 'var(--glass-bg)',
                borderColor: 'var(--glass-border)',
              }}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                <span className="font-label-mono text-[11px] font-bold" style={{ color: 'var(--on-surface)' }}>
                  Ghaziabad, India
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--tertiary)' }} />
                  <div className="absolute inset-0 w-2 h-2 rounded-full hireme-pulse-ring" style={{ background: 'var(--tertiary)' }} />
                </div>
                <span className="font-label-mono text-[10px]" style={{ color: 'var(--tertiary)' }}>
                  Available
                </span>
              </div>
            </div>
          </div>

          <div
            className="absolute -top-5 -right-5 w-14 h-14 rounded-2xl rotate-12 hireme-float-accent-1"
            style={{ background: 'var(--primary)', opacity: 0.15 }}
          />
          <div
            className="absolute -bottom-3 -left-3 w-10 h-10 rounded-full hireme-float-accent-2"
            style={{ background: 'var(--tertiary)', opacity: 0.15 }}
          />
          <div
            className="absolute top-1/4 -right-6 w-6 h-6 rounded-lg rotate-45 hireme-float-accent-3"
            style={{ background: 'var(--secondary)', opacity: 0.12 }}
          />
        </div>

        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{
              background: 'var(--surface-container)',
              borderColor: 'var(--outline)',
            }}
          >
            <Briefcase className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
            <span className="font-label-mono text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--primary)' }}>
              Open to Opportunities
            </span>
          </div>

          <div
            className={`transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <h1 className="font-display-lg font-bold tracking-tight leading-tight" style={{ color: 'var(--on-surface)' }}>
              <span className="text-3xl lg:text-4xl block mb-2" style={{ color: 'var(--on-surface-variant)' }}>Hello, </span>
              <span className="text-6xl lg:text-8xl block mb-4">I'm Sarthak</span>
              <span className="text-3xl lg:text-5xl block">
                <TypewriterRole />
              </span>
            </h1>
          </div>

          <p
            className={`text-lg max-w-xl leading-relaxed font-body-md mx-auto lg:mx-0 transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ color: 'var(--on-surface-variant)' }}
          >
            Full stack and AI developer working with MERN, Next.js, FastAPI, Python and AWS. I've shipped a production AI hiring platform load-tested at 500 concurrent users, and portals used by 180+ people.
          </p>

          <div
            className={`flex flex-wrap items-center gap-4 justify-center lg:justify-start pt-2 transition-all duration-700 delay-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <a
              ref={magneticRef}
              href="mailto:sarthakkaushik927@gmail.com"
              className="hireme-magnetic-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-label-mono text-sm font-bold shadow-lg transition-shadow hover:shadow-xl relative overflow-hidden group"
              style={{
                background: 'var(--primary)',
                color: 'var(--on-primary)',
              }}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--tertiary))' }}
              />
              <Mail className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Hire Me</span>
            </a>

            <a
              href="/resume/resume_sarthak.pdf"
              download
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-label-mono text-sm font-bold border transition-all hover:shadow-md"
              style={{
                background: 'var(--surface-container)',
                color: 'var(--on-surface)',
                borderColor: 'var(--outline)',
              }}
            >
              <Download className="w-4 h-4" />
              Download Resume
            </a>
          </div>

          <div
            className={`flex items-center gap-3 justify-center lg:justify-start pt-2 transition-all duration-700 delay-900 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <SocialIcon href="https://github.com/sarthakkaushik927" label="GitHub">
              <GithubIcon className="w-5 h-5" />
            </SocialIcon>
            <SocialIcon href="https://linkedin.com/in/sarthak-sharma-323652318" label="LinkedIn">
              <LinkedinIcon className="w-5 h-5" />
            </SocialIcon>
            <SocialIcon href="https://leetcode.com/u/sarthakkaushik927" label="LeetCode">
              <Code className="w-5 h-5" />
            </SocialIcon>
            <SocialIcon href="https://os.sarthaksharma927.me" label="Portfolio">
              <Globe className="w-5 h-5" />
            </SocialIcon>
          </div>

          <div
            className={`grid grid-cols-3 gap-4 pt-4 max-w-md mx-auto lg:mx-0 transition-all duration-700 delay-1100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {statCounters.map((stat) => (
              <div
                key={stat.label}
                className="text-center lg:text-left p-3 rounded-2xl border"
                style={{
                  background: 'var(--surface-container)',
                  borderColor: 'var(--outline)',
                }}
              >
                <p className="font-display-lg text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                  <AnimatedCounter target={stat.value} isVisible={isVisible} />
                </p>
                <p className="font-label-mono text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--on-surface-variant)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hireme-scroll-indicator">
        <ChevronDown className="w-6 h-6" style={{ color: 'var(--on-surface-variant)' }} />
      </div>
    </section>
  );
};

const SocialIcon: React.FC<{
  href: string;
  label: string;
  children: React.ReactNode;
}> = ({ href, label, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:text-primary hover:scale-110 hover:shadow-md"
    style={{
      background: 'var(--surface-container)',
      borderColor: 'var(--outline)',
      color: 'var(--on-surface-variant)',
    }}
  >
    {children}
  </a>
);
