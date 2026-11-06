import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../shared/Modal';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { extractRoomId } from '../../utils/room';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRoomId = extractRoomId(input);
    if (cleanRoomId) {
      onClose();
      setInput('');
      navigate(`/room/${cleanRoomId}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Watch Party Room">
      <form onSubmit={handleJoin} className="space-y-6">
        <Input label="Room code or link" placeholder="Paste the room code or link" value={input} onChange={(e) => setInput(e.target.value)} autoFocus />
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" className="flex-1" disabled={!input.trim()}>
            Join Party
          </Button>
        </div>
      </form>
    </Modal>
  );
};
