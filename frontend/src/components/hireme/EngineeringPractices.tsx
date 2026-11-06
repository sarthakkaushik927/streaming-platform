import React, { useEffect, useRef, useState } from 'react';

const practices = [
  'RESTful API Design',
  'Microservices & CQRS',
  'Event-Driven Architecture (Kafka, SQS)',
  'JWT, OAuth 2.0 & Role-Based Access',
  'Redis & BullMQ Async Queues',
  'Real-Time with WebSockets, Socket.io & SSE',
  'CI/CD with GitHub Actions',
  'Docker & Terraform',
  'Cloud Deployment (AWS)',
  'Load Testing (k6, Locust, Artillery, JMeter)',
];

export const EngineeringPractices: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef}>
      <p
        className="font-label-mono text-xs uppercase tracking-widest font-bold mb-3"
        style={{ color: 'var(--primary)' }}
      >
        Engineering Practices
      </p>
      <h2
        className="font-display-lg text-3xl md:text-4xl font-bold mb-10 tracking-tight"
        style={{ color: 'var(--on-surface)' }}
      >
        How I build software
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {practices.map((practice, idx) => (
          <div
            key={practice}
            className={`flex items-center gap-4 p-4 rounded-2xl border group transition-all duration-500 cursor-default hover:shadow-md ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{
              transitionDelay: `${idx * 70}ms`,
              background: 'var(--surface)',
              borderColor: 'var(--outline)',
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 font-label-mono text-sm font-bold"
              style={{
                background: 'var(--primary)',
                color: 'var(--on-primary)',
              }}
            >
              ✓
            </div>
            <span
              className="font-body-md text-sm font-medium"
              style={{ color: 'var(--on-surface)' }}
            >
              {practice}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
