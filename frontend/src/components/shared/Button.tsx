import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'icon' | 'outline';
  children: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  icon,
  fullWidth = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary text-on-primary rounded-full px-6 py-2.5 shadow-[0_2px_12px_-4px_rgba(217,134,47,0.4)] hover:shadow-[0_4px_20px_-4px_rgba(217,134,47,0.5)] hover:brightness-105',
    ghost: 'hover:bg-surface-container-high rounded-xl px-4 py-2 text-on-surface',
    danger: 'bg-error/10 hover:bg-error/20 text-error border border-error/20 rounded-full px-4 py-2',
    icon: 'p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-primary',
    outline: 'border-2 border-black/20 dark:border-primary/50 text-on-surface hover:bg-primary hover:text-black dark:hover:bg-primary dark:hover:text-black rounded-full px-6 py-2.5 transition-colors shadow-xs',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2 flex items-center">{icon}</span>}
      {children}
    </button>
  );
};
