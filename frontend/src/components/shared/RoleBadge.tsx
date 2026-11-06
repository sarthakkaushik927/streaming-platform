import React from 'react';
import { Crown, Shield, User } from 'lucide-react';
import { Role } from '../../types/participant';

const ROLE_STYLES = {
  [Role.HOST]: { label: 'Host', Icon: Crown, className: 'bg-marquee text-marquee-ink' },
  [Role.MODERATOR]: { label: 'Moderator', Icon: Shield, className: 'border border-accent text-accent' },
  [Role.PARTICIPANT]: { label: 'Participant', Icon: User, className: 'border border-line text-muted' },
};

export const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  const { label, Icon, className } = ROLE_STYLES[role] ?? ROLE_STYLES[Role.PARTICIPANT];

  return (
    <span className={`inline-flex w-fit items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[0.625rem] tracking-[0.14em] uppercase ${className}`}>
      <Icon className="size-3" />
      {label}
    </span>
  );
};
