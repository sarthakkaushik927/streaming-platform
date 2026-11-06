import React from 'react';
import { Link as LinkIcon, LogOut, MessageSquare, Repeat } from 'lucide-react';
import { Role } from '../../types/participant';
import { Button } from '../shared/Button';
import { ButtonVariant } from '../shared/buttonStyles';
import { RoleBadge } from '../shared/RoleBadge';

interface RoomToolbarProps {
  roomName: string;
  role: Role;
  onCopyLink: () => void;
  onTransferHost: () => void;
  onLeave: () => void;
  onOpenChat: () => void;
}

// Labels hide on small screens, so each button keeps its name for screen readers.
const ToolbarButton: React.FC<{ label: string; icon: React.ReactNode; variant?: ButtonVariant; className?: string; onClick: () => void }> = ({
  label,
  icon,
  variant = 'curtain-ghost',
  className = '',
  onClick,
}) => (
  <Button variant={variant} aria-label={label} title={label} icon={icon} onClick={onClick} className={`px-3 ${className}`}>
    <span className="hidden xl:inline">{label}</span>
  </Button>
);

// The room's title sits on the red curtain, like the name over a cinema screen.
export const RoomToolbar: React.FC<RoomToolbarProps> = ({ roomName, role, onCopyLink, onTransferHost, onLeave, onOpenChat }) => (
  <div className="curtain shrink-0 text-curtain-ink">
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 md:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <h1 className="min-w-0 truncate text-3xl" title={roomName}>{roomName}</h1>
        <span className="rounded-sm bg-canvas p-0.5">
          <RoleBadge role={role} />
        </span>
      </div>
      <div className="flex items-center gap-1">
        <ToolbarButton label="Copy Link" icon={<LinkIcon className="size-4" />} onClick={onCopyLink} />
        {role === Role.HOST && <ToolbarButton label="Transfer Host" icon={<Repeat className="size-4" />} onClick={onTransferHost} />}
        <ToolbarButton label="Open chat" icon={<MessageSquare className="size-4" />} onClick={onOpenChat} className="lg:hidden" />
        <ToolbarButton label="Leave" variant="curtain-outline" icon={<LogOut className="size-4" />} onClick={onLeave} />
      </div>
    </div>
    <div aria-hidden="true" className="marquee-bulbs" />
  </div>
);
