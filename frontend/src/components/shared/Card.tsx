import React, { HTMLAttributes } from 'react';

export const Card: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`rounded-sm border border-line bg-card ${className}`} {...props}>
    {children}
  </div>
);
