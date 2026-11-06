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
        <Input
          label="ROOM CODE OR FULL LINK"
          icon="link"
          placeholder="e.g. ROOM-624 or http://localhost:5173/room/ROOM-624"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
        <div className="flex gap-4 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={!input.trim()}>
            Join Party
          </Button>
        </div>
      </form>
    </Modal>
  );
};
