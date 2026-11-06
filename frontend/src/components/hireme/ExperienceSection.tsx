import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, MapPin, Calendar, ChevronRight } from 'lucide-react';

const experiences: {
  company: string;
  role: string;
  date: string;
  location?: string;
  siteUrl: string;
  points: { area: string; detail: string }[];
}[] = [
  {
    company: 'AxioraPeople',
    role: 'Full Stack & AI Developer Intern',
    date: 'Sep 2026 – Present',
    location: 'Remote',
    siteUrl: 'https://axiorapeople.com',
    points: [
      { area: 'AI Hiring Platform', detail: 'Built EdTalent on React 19, FastAPI and PostgreSQL (150+ APIs), with agentic AI resume screening at Rs 0.09 per resume and proctored voice AI interviews at Rs 4.87 each' },
      { area: 'Product Features', detail: 'Added LangGraph sourcing, a calling bot, WhatsApp and email alerts, and 5-tier pricing' },
      { area: 'Cloud & DevOps', detail: 'Deployed on AWS (ECS, ALB, SQS, RDS, ElastiCache, CloudFront) with Terraform and CI/CD for Rs 12.5k/month at 1,000 users' },
      { area: 'Load Testing', detail: 'Load-tested 500+ concurrent users and 47,000+ requests with 0 server errors' },
      { area: 'SEO, AEO & GEO', detail: 'Used prerendered pages (SSG), structured data, sitemaps and AI-crawler access to cut first page load by 64% and rank EdTalent #1 on Google for its brand search' },
    ],
  },
  {
    company: 'Cloud Computing Cell, AKGEC',
    role: 'Web Developer (Part-time)',
    date: 'Oct 2025 – Present',
    location: 'Ghaziabad, India',
    siteUrl: 'https://www.cccakgec.in/',
    points: [
      { area: 'Portals', detail: 'Developed the Nimbus 3.0 Registration Portal & Verification Dashboard, the Probation Management Portal, and the NextGen Assessment coding platform, and contributed to the official CCC website' },
      { area: 'Stack', detail: 'Worked with React.js, Next.js, Node.js/Express.js and MongoDB/PostgreSQL' },
      { area: 'Auth & Roles', detail: 'Added secure authentication, role-based access for 3+ user roles, and automated email notifications' },
      { area: 'Impact', detail: 'Managed 180+ registrations at 100% accuracy and enabled trainees, admins and senior developers to track progress evaluations across six domains' },
    ],
  },
  {
    company: 'Podman (Red Hat), stdlib, Zulip',
    role: 'Open Source Contributor',
    date: 'Sep 2026 – Oct 2026',
    siteUrl: 'https://github.com/sarthakkaushik927',
    points: [
      { area: 'Podman', detail: 'Fixed a broken docs link, 8 typos and missing image alt text across React/TypeScript components, improving screen reader accessibility (PR #668, #674)' },
      { area: 'stdlib', detail: 'Fixed a data-integrity bug where the array with() method mutated its source and misplaced writes on buffer views, and added regression tests for 3 cases (PR #16346)' },
      { area: 'Zulip', detail: 'Corrected incorrect user-list settings in the status help documentation, merged into main (PR #40479)' },
    ],
  },
];

export const ExperienceSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll('[data-exp-card]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-exp-card'));
            setVisibleCards((prev) => new Set(prev).add(idx));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef}>
      <p
        className="font-label-mono text-xs uppercase tracking-widest font-bold mb-3"
        style={{ color: 'var(--primary)' }}
      >
        Experience
      </p>
      <h2
        className="font-display-lg text-3xl md:text-4xl font-bold mb-12 tracking-tight"
        style={{ color: 'var(--on-surface)' }}
      >
        Where I've worked
      </h2>

      <div className="flex flex-col gap-8">
        {experiences.map((exp, idx) => (
          <div
            key={exp.company}
            data-exp-card={idx}
            className={`glass-card rounded-3xl p-8 relative overflow-hidden transition-all duration-700 ${
              visibleCards.has(idx) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: `${idx * 200}ms` }}
          >
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] pointer-events-none"
              style={{ background: 'var(--primary)', opacity: 0.05 }}
            />

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3
                    className="font-display-lg text-xl font-bold"
                    style={{ color: 'var(--on-surface)' }}
                  >
                    {exp.company}
                  </h3>
                  <a
                    href={exp.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${exp.company}`}
                    className="p-1.5 rounded-lg border transition-colors hover:text-primary"
                    style={{
                      borderColor: 'var(--outline)',
                      color: 'var(--on-surface-variant)',
                    }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p
                  className="font-label-mono text-sm font-bold"
                  style={{ color: 'var(--primary)' }}
                >
                  {exp.role}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--on-surface-variant)' }} />
                  <span className="font-label-mono text-xs" style={{ color: 'var(--on-surface-variant)' }}>
                    {exp.date}
                  </span>
                </div>
                {exp.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--on-surface-variant)' }} />
                    <span className="font-label-mono text-xs" style={{ color: 'var(--on-surface-variant)' }}>
                      {exp.location}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
              {exp.points.map((point, pIdx) => (
                <div
                  key={point.area}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-500 ${
                    visibleCards.has(idx) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{
                    transitionDelay: `${idx * 200 + pIdx * 80}ms`,
                    background: 'var(--surface-container)',
                    borderColor: 'var(--outline-variant)',
                  }}
                >
                  <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                  <div>
                    <span
                      className="font-label-mono text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: 'var(--primary)' }}
                    >
                      {point.area}
                    </span>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--on-surface-variant)' }}>
                      {point.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
