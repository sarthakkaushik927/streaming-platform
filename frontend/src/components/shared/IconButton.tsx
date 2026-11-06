import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

// The label is required so every icon-only button has a name for screen readers.
export const IconButton: React.FC<IconButtonProps> = ({ label, children, className = '', type = 'button', ...props }) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={`inline-flex size-11 shrink-0 items-center justify-center rounded-sm text-muted transition-colors hover:bg-subtle hover:text-ink active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);
