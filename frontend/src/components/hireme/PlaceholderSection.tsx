import React from 'react';

interface PlaceholderSectionProps {
  label?: string;
  id?: string;
}

export const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({
  label = 'More coming soon',
  id = 'upcoming-work',
}) => {
  return (
    <section
      id={id}
      className="my-16 md:my-24 mx-auto w-full max-w-4xl rounded-3xl border-2 border-dashed py-20 px-8 flex items-center justify-center"
      style={{ borderColor: 'var(--outline)' }}
    >
      <p
        className="font-label-mono text-sm tracking-wide text-center"
        style={{ color: 'var(--on-surface-variant)' }}
      >
        {label}
      </p>
    </section>
  );
};
