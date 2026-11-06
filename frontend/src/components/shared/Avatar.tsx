import React from 'react';

const SIZES = { sm: 'size-9 text-base', lg: 'size-20 text-4xl' };

interface AvatarProps {
  name: string;
  size?: keyof typeof SIZES;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'sm' }) => (
  <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center rounded-sm bg-subtle font-display leading-none text-accent ${SIZES[size]}`}>
    {name.charAt(0).toUpperCase() || '?'}
  </span>
);
