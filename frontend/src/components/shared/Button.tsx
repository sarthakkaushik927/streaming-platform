import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { ButtonVariant, buttonClasses } from './buttonStyles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
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
  type = 'button',
  ...props
}) => (
  <button type={type} className={buttonClasses(variant, fullWidth, className)} {...props}>
    {icon}
    {children}
  </button>
);
