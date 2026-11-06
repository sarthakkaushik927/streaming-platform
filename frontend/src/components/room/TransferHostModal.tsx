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
        <p className="text-sm text-muted">Choose who becomes the host. You will become a participant.</p>

        <div className="thin-scrollbar max-h-[40vh] space-y-2 overflow-y-auto">
          {eligibleParticipants.map((participant) => (
            <label
              key={participant.userId}
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-sm border px-3 py-2 transition-colors ${
                selectedUserId === participant.userId ? 'border-accent bg-accent-soft' : 'border-line hover:bg-subtle'
              }`}
            >
              <input
                type="radio"
                name="newHost"
                value={participant.userId}
                checked={selectedUserId === participant.userId}
                onChange={() => setSelectedUserId(participant.userId)}
                className="accent-(--accent)"
              />
              <span className="text-sm text-ink">{participant.username}</span>
            </label>
          ))}
          {eligibleParticipants.length === 0 && <p className="text-sm text-muted">Nobody else is in the room yet.</p>}
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={handleTransfer} disabled={!selectedUserId} className="flex-1">
            Transfer Host
          </Button>
        </div>
      </div>
    </Modal>
  );
};
