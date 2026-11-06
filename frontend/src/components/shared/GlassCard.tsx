import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  withLuminousBorder?: boolean;
  withDotGrid?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  withLuminousBorder = false,
  withDotGrid = false 
}) => {
  return (
    <div className={`glass-card rounded-[20px] overflow-hidden border-2 border-black/20 dark:border-primary/50 shadow-md ${withLuminousBorder ? 'luminous-border' : ''} ${className}`}>
      {withDotGrid && (
        <div className="absolute inset-0 dot-grid pointer-events-none opacity-20" />
      )}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
