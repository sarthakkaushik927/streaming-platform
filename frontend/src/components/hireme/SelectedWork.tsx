import React from 'react';
import { ProjectCard } from './ProjectCard';

const projects = [
  {
    title: 'NextGen Assessment Systems',
    description: 'Full-stack assessment platform for 300+ candidates and 250+ concurrent sessions, with an admin console for bulk ingestion, live monitoring and auto-evaluation, plus self-hosted Judge0 behind a custom load balancer.',
    techStack: ['React 19', 'TypeScript', 'Node.js', 'MongoDB', 'Redis', 'BullMQ', 'AWS ECS'],
    githubUrl: 'https://github.com/sarthakkaushik927/Coding-Plateform',
    demoUrl: 'https://coding-plateform-egyb.vercel.app',
  },
  {
    title: 'Fire Detection System',
    description: 'Ranks regions by fire probability from NASA FIRMS satellite data on a Mapbox GL dashboard, verifies detections with OpenCV and Python AI, and sends Socket.io alerts in under 1 second.',
    techStack: ['React.js', 'Express.js', 'Mapbox GL', 'Socket.io', 'Supabase'],
    githubUrl: 'https://github.com/sarthakkaushik927/Fire-Detection-System',
    demoUrl: 'https://fire-detection-system-one.vercel.app/',
  },
];

export const SelectedWork: React.FC = () => {
  return (
    <section className="my-16 md:my-24">
      <p
        className="font-label-mono text-xs uppercase tracking-widest font-bold mb-3"
        style={{ color: 'var(--primary)' }}
      >
        Selected Work
      </p>
      <h2
        className="font-display-lg text-3xl md:text-4xl font-bold mb-12 tracking-tight"
        style={{ color: 'var(--on-surface)' }}
      >
        Real projects, real impact
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.title}
            title={project.title}
            description={project.description}
            techStack={project.techStack}
            githubUrl={project.githubUrl}
            demoUrl={project.demoUrl}
          />
        ))}
      </div>
    </section>
  );
};
