import React, { useEffect, useRef, useState } from 'react';
import { SkillCategoryCard } from './SkillCategoryCard';

const skillCategories = [
  {
    title: 'Languages',
    skills: ['JavaScript (ES6+)', 'TypeScript', 'Python', 'Go', 'Java', 'C++', 'SQL', 'Data Structures & Algorithms'],
    variant: 'grid' as const,
  },
  {
    title: 'Frontend',
    skills: ['HTML5', 'CSS3', 'React.js', 'Next.js', 'React Native', 'Redux', 'Tailwind CSS', 'Framer Motion', 'Mapbox GL', 'Three.js'],
    variant: 'grid' as const,
  },
  {
    title: 'Backend',
    skills: ['Node.js', 'Express.js', 'FastAPI', 'REST APIs', 'GraphQL', 'WebSockets', 'Socket.io', 'SSE', 'BullMQ', 'JWT', 'OAuth 2.0', 'RBAC'],
    variant: 'grid' as const,
  },
  {
    title: 'Architecture',
    skills: ['Microservices', 'CQRS', 'DDD', 'Event-Driven Architecture', 'Serverless', 'Kafka', 'SQS', 'System Design'],
    variant: 'grid' as const,
  },
  {
    title: 'Databases',
    skills: ['MongoDB', 'PostgreSQL', 'Redis', 'Supabase', 'Database Indexing', 'Aggregation Pipelines'],
    variant: 'grid' as const,
  },
  {
    title: 'AI & GenAI',
    skills: ['Generative AI', 'RAG', 'Agentic AI', 'LangChain', 'LangGraph', 'Voice AI', 'Context Engineering', 'AI-Assisted Development', 'OpenCV'],
    variant: 'grid' as const,
  },
  {
    title: 'Cloud & DevOps',
    skills: ['AWS EC2', 'ECS', 'ALB', 'S3', 'SQS', 'RDS', 'ElastiCache', 'CloudFront', 'IAM', 'Terraform', 'CloudWatch', 'Docker', 'CI/CD'],
    variant: 'marquee' as const,
  },
  {
    title: 'Testing & Tools',
    skills: ['TestSprite', 'Jest', 'Locust', 'k6', 'Artillery', 'JMeter', 'Postman', 'Git', 'GitHub', 'Linux', 'Cursor AI', 'Codex', 'MCP'],
    variant: 'grid' as const,
  },
];

export const SkillsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll('[data-skill-card]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-skill-card'));
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
    <section ref={sectionRef} className="my-16 md:my-24">
      <p
        className="font-label-mono text-xs uppercase tracking-widest font-bold mb-3"
        style={{ color: 'var(--primary)' }}
      >
        Technical Arsenal
      </p>
      <h2
        className="font-display-lg text-3xl md:text-4xl font-bold mb-12 tracking-tight"
        style={{ color: 'var(--on-surface)' }}
      >
        Skills &amp; technologies
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {skillCategories.map((category, idx) => (
          <div key={category.title} data-skill-card={idx}>
            <SkillCategoryCard
              title={category.title}
              skills={category.skills}
              animationDelay={idx * 120}
              variant={category.variant}
              isVisible={visibleCards.has(idx)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
