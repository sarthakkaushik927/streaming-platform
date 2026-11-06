import React, { useState } from 'react';
import { Role } from '../../types/participant';
import { Crown, MoreVertical, Shield, User, UserMinus } from 'lucide-react';
import { Avatar } from '../shared/Avatar';
import { Card } from '../shared/Card';
import { IconButton } from '../shared/IconButton';
import { RoleBadge } from '../shared/RoleBadge';

import { useRoom } from '../../hooks/useRoom';
import { useParticipants } from '../../hooks/useParticipants';

export const ParticipantList: React.FC = () => {
  const { participants, assignRole, selfId } = useRoom();
  const { removeParticipant, transferHost } = useParticipants();

  // Sort: Host first, then Moderators, then Participants
  const roleWeight = {
    [Role.HOST]: 1,
    [Role.MODERATOR]: 2,
    [Role.PARTICIPANT]: 3,
  };
  
  const sortedParticipants = [...participants].sort((a, b) => {
    return roleWeight[a.role] - roleWeight[b.role];
  });

  const currentUserRole = participants.find(p => String(p.userId) === String(selfId))?.role;
  const isCurrentUserHost = currentUserRole === Role.HOST;
  const canManage = isCurrentUserHost || currentUserRole === Role.MODERATOR;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'remove' | 'transfer' | null>(null);

  // Removing someone and transferring host can't be undone by the user, so each takes a second click.
  const handleConfirmedAction = (action: 'remove' | 'transfer', userId: string) => {
    if (confirmAction !== action) {
      setConfirmAction(action);
      return;
    }
    if (action === 'remove') removeParticipant(userId);
    else transferHost(userId);
    setConfirmAction(null);
    setOpenMenuId(null);
  };

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden border-t-4 border-t-curtain">
      <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-2xl">Participants</h2>
        <span className="rounded-sm bg-marquee px-2 py-0.5 font-mono text-xs font-bold text-marquee-ink">{participants.length}</span>
      </div>

      <ul className="thin-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
        {sortedParticipants.map((participant) => {
          const isSelf = String(participant.userId) === String(selfId);
          const isOpen = openMenuId === participant.userId;
          const canManageThis = canManage && participant.role !== Role.HOST && !isSelf;

          return (
            <li key={participant.userId} className="rounded-sm p-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={participant.username} />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold">
                      {participant.username}
                      {isSelf && <span className="ml-1 font-normal text-muted">(You)</span>}
                    </span>
                    <RoleBadge role={participant.role} />
                  </div>
                </div>
                {canManageThis && (
                  <IconButton
                    label={`Manage ${participant.username}`}
                    aria-expanded={isOpen}
                    onClick={() => {
                      setOpenMenuId(isOpen ? null : participant.userId);
                      setConfirmAction(null);
                    }}
                  >
                    <MoreVertical className="size-4" />
                  </IconButton>
                )}
              </div>

              {canManageThis && isOpen && (
                <div role="group" aria-label={`Actions for ${participant.username}`} className="mt-2 flex flex-col gap-1 border-t border-line pt-2">
                  {participant.role === Role.PARTICIPANT ? (
                    <MenuAction icon={<Shield />} onClick={() => { assignRole(participant.userId, Role.MODERATOR); setOpenMenuId(null); }}>
                      Make Moderator
                    </MenuAction>
                  ) : (
                    <MenuAction icon={<User />} onClick={() => { assignRole(participant.userId, Role.PARTICIPANT); setOpenMenuId(null); }}>
                      Demote to Participant
                    </MenuAction>
                  )}
                  {isCurrentUserHost && (
                    <MenuAction icon={<Crown />} onClick={() => handleConfirmedAction('transfer', participant.userId)}>
                      {confirmAction === 'transfer' ? 'Confirm transfer' : 'Transfer Host'}
                    </MenuAction>
                  )}
                  <MenuAction icon={<UserMinus />} danger onClick={() => handleConfirmedAction('remove', participant.userId)}>
                    {confirmAction === 'remove' ? 'Confirm remove' : 'Remove from room'}
                  </MenuAction>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
};

const MenuAction: React.FC<{ icon: React.ReactNode; danger?: boolean; onClick: () => void; children: React.ReactNode }> = ({ icon, danger, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex min-h-10 w-full items-center gap-2 rounded-sm px-2 text-left text-sm transition-colors hover:bg-subtle [&>svg]:size-4 ${danger ? 'text-danger' : 'text-ink'}`}
  >
    {icon}
    {children}
  </button>
);
