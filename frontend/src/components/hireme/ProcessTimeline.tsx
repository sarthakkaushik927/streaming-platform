import React, { useEffect, useRef, useState } from 'react';

const steps = [
  {
    label: 'Discover',
    description: 'Gather requirements, map domain models, define scope',
  },
  {
    label: 'Design',
    description: 'Schema design, API contracts, system architecture',
  },
  {
    label: 'Build',
    description: 'Full-stack development with React, Node.js and FastAPI',
  },
  {
    label: 'Test',
    description: 'Jest, Postman and load testing with k6 and Locust',
  },
  {
    label: 'Deploy',
    description: 'AWS ECS and ALB, Docker, Terraform and CI/CD',
  },
  {
    label: 'Iterate',
    description: 'Monitor, optimize, scale based on real usage patterns',
  },
];

export const ProcessTimeline: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const stepEls = section.querySelectorAll('[data-step]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-step'));
            setVisibleSteps((prev) => {
              const next = new Set(prev).add(idx);
              setProgress(next.size / steps.length);
              return next;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -80px 0px' }
    );

    stepEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const totalLength = 1000;
  const dashOffset = totalLength * (1 - progress);

  return (
    <section ref={sectionRef} className="my-16 md:my-24">
      <p
        className="font-label-mono text-xs uppercase tracking-widest font-bold mb-3"
        style={{ color: 'var(--primary)' }}
      >
        How I Work
      </p>
      <h2
        className="font-display-lg text-3xl md:text-4xl font-bold mb-16 tracking-tight"
        style={{ color: 'var(--on-surface)' }}
      >
        Process &amp; principles
      </h2>

      <div className="hidden md:block relative">
        <svg
          className="absolute top-6 left-0 w-full h-3 overflow-visible"
          viewBox="0 0 1000 12"
          preserveAspectRatio="none"
        >
          <line
            x1="0" y1="6" x2="1000" y2="6"
            className="hireme-timeline-line-bg"
            strokeWidth="3"
          />
          <line
            x1="0" y1="6" x2="1000" y2="6"
            className="hireme-timeline-line"
            strokeWidth="3"
            strokeDasharray={totalLength}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>

        <div className="grid grid-cols-6 gap-4 relative z-10">
          {steps.map((step, idx) => (
            <div
              key={step.label}
              data-step={idx}
              className={`hireme-timeline-step flex flex-col items-center text-center ${
                visibleSteps.has(idx) ? 'is-visible' : ''
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-label-mono text-sm font-bold mb-4 border-2 transition-colors relative"
                style={{
                  background: visibleSteps.has(idx) ? 'var(--primary)' : 'var(--surface-container)',
                  color: visibleSteps.has(idx) ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  borderColor: visibleSteps.has(idx) ? 'var(--primary)' : 'var(--outline)',
                }}
              >
                {idx + 1}
              </div>
              <h4
                className="font-label-mono text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: 'var(--on-surface)' }}
              >
                {step.label}
              </h4>
              <p
                className="text-xs font-body-md leading-relaxed"
                style={{ color: 'var(--on-surface-variant)' }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="md:hidden relative pl-8">
        <svg
          className="absolute left-3 top-0 w-3 h-full overflow-visible"
          viewBox="0 0 12 600"
          preserveAspectRatio="none"
        >
          <line
            x1="6" y1="0" x2="6" y2="600"
            className="hireme-timeline-line-bg"
            strokeWidth="3"
          />
          <line
            x1="6" y1="0" x2="6" y2="600"
            className="hireme-timeline-line"
            strokeWidth="3"
            strokeDasharray={600}
            strokeDashoffset={600 * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>

        <div className="flex flex-col gap-10">
          {steps.map((step, idx) => (
            <div
              key={step.label}
              data-step={idx}
              className={`hireme-timeline-step relative ${
                visibleSteps.has(idx) ? 'is-visible' : ''
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div
                className="absolute -left-8 top-0 w-8 h-8 rounded-full flex items-center justify-center font-label-mono text-xs font-bold border-2 transition-colors"
                style={{
                  background: visibleSteps.has(idx) ? 'var(--primary)' : 'var(--surface-container)',
                  color: visibleSteps.has(idx) ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  borderColor: visibleSteps.has(idx) ? 'var(--primary)' : 'var(--outline)',
                }}
              >
                {idx + 1}
              </div>
              <div className="pl-4">
                <h4
                  className="font-label-mono text-xs font-bold uppercase tracking-wider mb-1"
                  style={{ color: 'var(--on-surface)' }}
                >
                  {step.label}
                </h4>
                <p
                  className="text-sm font-body-md leading-relaxed"
                  style={{ color: 'var(--on-surface-variant)' }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
