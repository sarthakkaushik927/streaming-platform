import React, { ReactNode } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { ButtonVariant, buttonClasses } from './buttonStyles';

interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const LinkButton: React.FC<LinkButtonProps> = ({
  variant = 'primary',
  icon,
  fullWidth = false,
  className = '',
  children,
  ...props
}) => (
  <Link className={buttonClasses(variant, fullWidth, className)} {...props}>
    {icon}
    {children}
  </Link>
);
