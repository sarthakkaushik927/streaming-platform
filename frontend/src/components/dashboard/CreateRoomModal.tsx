import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../shared/Modal';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { roomService } from '../../services/room.service';
import { useToast } from '../../hooks/useToast';
import { getErrorMessage } from '../../utils/error';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const room = await roomService.createRoom({ 
        title: name.trim(), 
        name: name.trim(), 
        initialVideoId: '8vnrqEudzWQ',
      });
      
      showToast(`Watch Room "${name}" created!`, 'success');
      onClose();
      setName('');
      navigate(`/room/${room.id}`);
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to create room'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Watch Party Room">
      <form onSubmit={handleCreate} className="space-y-6">
        <Input label="Room name" placeholder="e.g. Friday Night Watch Party" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" className="flex-1" disabled={!name.trim() || isLoading}>
            {isLoading ? 'Creating...' : 'Create Room'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
