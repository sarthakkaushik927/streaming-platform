import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Mail, Download } from 'lucide-react';

export const HireCTA: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const magneticRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
    return () => observer.disconnect();
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
      ref={sectionRef}
      className="my-16 md:my-24 rounded-4xl overflow-hidden relative" 
      style={{ background: 'var(--frame)' }}
    >
      {/* Animated Background Orbs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] md:w-3/4 h-48 blur-[120px] pointer-events-none transition-opacity duration-1000"
        style={{ 
          background: 'var(--primary)', 
          opacity: isVisible ? 0.12 : 0 
        }}
      />
      
      <div
        className="absolute -bottom-20 -left-20 w-64 h-64 blur-[100px] rounded-full pointer-events-none hireme-float-accent-1"
        style={{ background: 'var(--tertiary)', opacity: 0.1 }}
      />
      
      <div
        className="absolute top-20 -right-20 w-72 h-72 blur-[100px] rounded-full pointer-events-none hireme-float-accent-2"
        style={{ background: 'var(--primary)', opacity: 0.08 }}
      />

      <div className="relative z-10 px-8 md:px-16 py-16 md:py-24 text-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p
            className="font-label-mono text-xs uppercase tracking-widest mb-4 font-bold"
            style={{ color: 'var(--primary)' }}
          >
            Available for opportunities
          </p>

          <h2
            className="font-display-lg text-4xl md:text-5xl font-bold mb-6 tracking-tight"
            style={{ color: 'var(--cream-on-frame)' }}
          >
            Let's build something great
          </h2>
        </div>

        <p
          className={`font-body-md text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ color: 'var(--cream-on-frame)', opacity: 0.7 }}
        >
          Looking for a full stack and AI developer who has shipped production platforms and tested them under real load?
        </p>

        <div 
          className={`flex flex-wrap items-center justify-center gap-5 mb-12 transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <a
            ref={magneticRef}
            href="mailto:sarthakkaushik927@gmail.com"
            className="hireme-magnetic-btn inline-flex items-center gap-2 px-8 py-4 rounded-full font-label-mono text-sm font-bold transition-all shadow-[0_0_20px_rgba(var(--color-primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--color-primary),0.4)] relative overflow-hidden group"
            style={{
              background: 'var(--primary)',
              color: 'var(--on-primary)',
            }}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--tertiary))' }}
            />
            <Mail className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Hire Me</span>
          </a>
          <a
            href="/resume/resume_sarthak.pdf"
            download
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-label-mono text-sm font-bold transition-all border group"
            style={{
              background: 'transparent',
              color: 'var(--cream-on-frame)',
              borderColor: 'rgba(255,255,255,0.15)',
            }}
          >
            <Download className="w-4 h-4 transition-transform group-hover:-translate-y-1" />
            Download Resume
          </a>
        </div>

        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-6 font-label-mono text-sm transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ color: 'var(--cream-on-frame)', opacity: 0.6 }}
        >
          <a
            href="mailto:sarthakkaushik927@gmail.com"
            className="hover:opacity-100 hover:text-primary transition-colors flex items-center gap-2"
          >
            sarthakkaushik927@gmail.com
          </a>
          <span className="hidden sm:inline opacity-30">·</span>
          <a
            href="tel:+917060321453"
            className="hover:opacity-100 hover:text-primary transition-colors flex items-center gap-2"
          >
            +91 7060321453
          </a>
        </div>
      </div>
    </section>
  );
};
