import React from 'react';
import { Modal } from '../shared/Modal';
import { useParticipants } from '../../hooks/useParticipants';
import { Role } from '../../types/participant';
import { RoleBadge } from '../shared/RoleBadge';

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleManagementModal: React.FC<RoleManagementModalProps> = ({ isOpen, onClose }) => {
  const { participants, assignRole } = useParticipants();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Roles" size="lg">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
        {participants.map(participant => (
          <div key={participant.userId} className="flex items-center justify-between p-4 bg-surface-container-low border border-outline-variant/30 rounded-xl">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface">
                 {participant.username.charAt(0).toUpperCase()}
               </div>
               <div>
                 <p className="font-body-md text-on-surface">{participant.username}</p>
                 <div className="mt-1">
                   <RoleBadge role={participant.role} />
                 </div>
               </div>
            </div>
            
            {participant.role !== Role.HOST && (
              <select 
                className="bg-surface-container border border-outline-variant/50 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                value={participant.role}
                onChange={(e) => assignRole(participant.userId, e.target.value as Role)}
              >
                <option value={Role.MODERATOR}>Moderator</option>
                <option value={Role.PARTICIPANT}>Participant</option>
                <option value={Role.VIEWER}>Viewer</option>
              </select>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};
