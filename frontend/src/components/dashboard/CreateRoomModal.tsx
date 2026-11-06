import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../shared/Modal';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { roomService } from '../../services/room.service';
import { useToast } from '../shared/Toast';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
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
        isPrivate 
      });
      
      const targetId = room.id || (room as any)._id || (room as any).roomId || 'ROOM-7721';

      showToast(`Watch Room "${name}" created!`, 'success');
      onClose();
      setName('');
      navigate(`/room/${targetId}`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to create room', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Watch Party Room">
      <form onSubmit={handleCreate} className="space-y-6">
        <Input
          label="ROOM NAME"
          icon="meeting_room"
          placeholder="e.g. Friday Night Watch Party"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
          <div>
            <p className="font-label-caps text-[12px] text-on-surface">PRIVATE ROOM</p>
            <p className="font-label-mono text-[10px] text-on-surface-variant">Require room link or code to join</p>
          </div>
          <button 
            type="button"
            className={`w-12 h-6 rounded-full transition-colors relative ${isPrivate ? 'bg-primary' : 'bg-surface-container-high border border-outline-variant/50'}`}
            onClick={() => setIsPrivate(!isPrivate)}
          >
             <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="flex gap-4 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={!name.trim() || isLoading}>
            {isLoading ? 'Creating...' : 'Create Room'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
