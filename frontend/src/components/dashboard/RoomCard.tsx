import React from 'react';
import { Room } from '../../types/room';
import { GlassCard } from '../shared/GlassCard';
import { Button } from '../shared/Button';
import { useNavigate } from 'react-router-dom';

interface RoomCardProps {
  room: Room;
  onDelete?: (roomId: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onDelete }) => {
  const navigate = useNavigate();

  return (
    <GlassCard className="p-6 hover:border-primary/30 transition-colors flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-headline-sm text-on-surface text-lg">{room.name}</h3>
          <div className="flex items-center gap-2">
            {room.isPrivate && (
              <span className="material-symbols-outlined text-outline text-[18px]">lock</span>
            )}
            {onDelete && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this room?')) {
                    onDelete(room.id);
                  }
                }}
                className="text-error/70 hover:text-error transition-colors p-1"
                title="Delete Room"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            )}
          </div>
        </div>
        <p className="font-label-mono text-sm text-on-surface-variant mb-4">ID: {room.id}</p>
        <div className="flex items-center gap-2 text-on-surface-variant font-label-mono text-[12px]">
          <span className="material-symbols-outlined text-[16px]">group</span>
          {room.participantCount ?? 0} participant(s)
        </div>
      </div>
      <div className="mt-6">
        <Button variant="outline" fullWidth onClick={() => navigate(`/room/${room.id}`)}>Enter Room</Button>
      </div>
    </GlassCard>
  );
};
