import React, { useState } from 'react';
import { useParticipants } from '../../hooks/useParticipants';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types/participant';
import { RoleBadge } from '../shared/RoleBadge';

import { useRoom } from '../../hooks/useRoom';

export const ParticipantList: React.FC = () => {
  const { participants, assignRole, selfId } = useRoom();
  const { user } = useAuth();
  
  // Sort: Host first, then Mods, then Participants, then Viewers
  const roleWeight = {
    [Role.HOST]: 1,
    [Role.MODERATOR]: 2,
    [Role.PARTICIPANT]: 3,
    [Role.VIEWER]: 4,
  };
  
  const sortedParticipants = [...participants].sort((a, b) => {
    return roleWeight[a.role] - roleWeight[b.role];
  });

  const currentUserRole = participants.find(p => String(p.userId) === String(selfId))?.role;
  const isCurrentUserHost = currentUserRole === Role.HOST;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full min-h-0 bg-room-card-bg text-room-card-text rounded-[24px] shadow-[0_0_15px_rgba(var(--color-primary),0.15)] overflow-hidden border border-outline dark:p-[3px]">
      <div className="flex flex-col h-full min-h-0 dark:bg-black dark:rounded-[21px] overflow-hidden">
        <div className="p-4 border-b border-black/10 dark:border-white/10 dark:text-white flex justify-between items-center flex-shrink-0">
          <h3 className="font-headline-sm text-sm font-bold">Participants</h3>
          <span className="bg-primary/20 text-primary border border-primary/30 text-xs font-bold px-2.5 py-0.5 rounded-full font-label-mono">
            {participants.length}
          </span>
        </div>
        
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2 space-y-2">
          {sortedParticipants.map(participant => (
            <div key={participant.userId} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 border-2 border-black/20 dark:border-white/20 transition-all group dark:text-white shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black dark:bg-primary dark:text-black text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {participant.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-body-md text-sm flex items-center gap-2 dark:text-primary">
                    {participant.username}
                    {String(participant.userId) === String(selfId) && (
                      <span className="opacity-60 dark:text-white/60 text-[10px]">(You)</span>
                    )}
                  </span>
                  <RoleBadge role={participant.role} />
                </div>
              </div>
              {isCurrentUserHost && String(participant.userId) !== String(selfId) && (
                <div className="relative">
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === participant.userId ? null : participant.userId)}
                    className="p-1 rounded hover:bg-surface-container-highest text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined text-sm">more_vert</span>
                  </button>
                  {openMenuId === participant.userId && (
                    <div className="absolute right-8 top-0 w-36 bg-surface-container-highest border border-outline-variant/60 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                      <button 
                        onClick={() => { assignRole(participant.userId, Role.MODERATOR); setOpenMenuId(null); }}
                        className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-surface-container-high transition-colors flex items-center gap-2 text-on-surface"
                      >
                        <span className="material-symbols-outlined text-xs text-primary">shield</span>
                        Make Moderator
                      </button>
                      <button 
                        onClick={() => { assignRole(participant.userId, Role.PARTICIPANT); setOpenMenuId(null); }}
                        className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-surface-container-high transition-colors flex items-center gap-2 text-on-surface"
                      >
                        <span className="material-symbols-outlined text-xs text-on-surface-variant">group</span>
                        Make Participant
                      </button>
                      <button 
                        onClick={() => { assignRole(participant.userId, Role.VIEWER); setOpenMenuId(null); }}
                        className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-surface-container-high transition-colors flex items-center gap-2 text-on-surface"
                      >
                        <span className="material-symbols-outlined text-xs text-on-surface-variant">visibility</span>
                        Make Viewer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
