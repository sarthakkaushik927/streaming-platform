import React, { useRef, useCallback } from 'react';

interface SkillCategoryCardProps {
  title: string;
  skills: string[];
  animationDelay: number;
  variant: 'grid' | 'marquee';
  isVisible: boolean;
}

export const SkillCategoryCard: React.FC<SkillCategoryCardProps> = ({
  title,
  skills,
  animationDelay,
  variant,
  isVisible,
}) => {
  return (
    <div
      className="hireme-clip-reveal glass-card rounded-[20px] p-6 overflow-hidden"
      style={{ transitionDelay: `${animationDelay}ms` }}
      data-visible={isVisible || undefined}
      ref={useCallback(
        (node: HTMLDivElement | null) => {
          if (node && isVisible) node.classList.add('is-visible');
          if (node && !isVisible) node.classList.remove('is-visible');
        },
        [isVisible]
      )}
    >
      <h3
        className="font-label-mono text-xs font-bold tracking-widest uppercase mb-5"
        style={{ color: 'var(--primary)' }}
      >
        {title}
      </h3>

      {variant === 'marquee' ? (
        <MarqueeStrip skills={skills} isVisible={isVisible} />
      ) : (
        <ChipGrid skills={skills} isVisible={isVisible} baseDelay={animationDelay} />
      )}
    </div>
  );
};

const ChipGrid: React.FC<{ skills: string[]; isVisible: boolean; baseDelay: number }> = ({
  skills,
  isVisible,
  baseDelay,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, idx) => (
        <MagneticChip
          key={skill}
          label={skill}
          isVisible={isVisible}
          delay={baseDelay + 100 + idx * 60}
        />
      ))}
    </div>
  );
};

const MarqueeStrip: React.FC<{ skills: string[]; isVisible: boolean }> = ({
  skills,
  isVisible,
}) => {
  const doubled = [...skills, ...skills];
  return (
    <div className="overflow-hidden">
      <div
        className={`hireme-marquee-track ${isVisible ? '' : 'paused'}`}
        style={{ animationPlayState: isVisible ? 'running' : 'paused' }}
      >
        {doubled.map((skill, idx) => (
          <span
            key={`${skill}-${idx}`}
            className="shrink-0 px-4 py-2 rounded-full text-xs font-label-mono font-medium border whitespace-nowrap"
            style={{
              background: 'var(--surface-container)',
              color: 'var(--on-surface)',
              borderColor: 'var(--outline)',
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

const MagneticChip: React.FC<{ label: string; isVisible: boolean; delay: number }> = ({
  label,
  isVisible,
  delay,
}) => {
  const chipRef = useRef<HTMLSpanElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    const el = chipRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = chipRef.current;
    if (!el) return;
    el.style.transform = 'translate(0, 0)';
  }, []);

  return (
    <span
      ref={chipRef}
      className={`hireme-chip px-4 py-2 rounded-full text-xs font-label-mono font-medium border cursor-default inline-block ${
        isVisible ? 'is-visible' : ''
      }`}
      style={{
        transitionDelay: `${delay}ms`,
        background: 'var(--surface-container)',
        color: 'var(--on-surface)',
        borderColor: 'var(--outline)',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {label}
    </span>
  );
};
