import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { useParticipants } from '../../hooks/useParticipants';
import { Role } from '../../types/participant';

interface TransferHostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferHostModal: React.FC<TransferHostModalProps> = ({ isOpen, onClose }) => {
  const { participants, transferHost } = useParticipants();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const handleTransfer = () => {
    if (selectedUserId) {
      transferHost(selectedUserId);
      onClose();
    }
  };

  const eligibleParticipants = participants.filter(p => p.role !== Role.HOST);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer Host Role">
      <div className="space-y-6">
        <p className="font-body-md text-on-surface-variant">
          Select a participant to transfer your Host role to. You will become a Moderator.
        </p>
        
        <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar">
          {eligibleParticipants.map(participant => (
            <label 
              key={participant.userId} 
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                selectedUserId === participant.userId 
                  ? 'border-primary bg-primary/10' 
                  : 'border-outline-variant/30 hover:bg-surface-container-high'
              }`}
            >
              <input 
                type="radio" 
                name="newHost" 
                value={participant.userId}
                checked={selectedUserId === participant.userId}
                onChange={() => setSelectedUserId(participant.userId)}
                className="text-primary focus:ring-primary bg-surface-container"
              />
              <span className="font-body-md text-on-surface">{participant.username}</span>
            </label>
          ))}
          {eligibleParticipants.length === 0 && (
             <p className="text-sm text-outline italic">No eligible participants in the room.</p>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button 
            variant="danger" 
            onClick={handleTransfer} 
            disabled={!selectedUserId} 
            className="flex-1"
          >
            Transfer Host
          </Button>
        </div>
      </div>
    </Modal>
  );
};
