import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trash2, Users } from 'lucide-react';
import { Room } from '../../types/room';
import { IconButton } from '../shared/IconButton';
import { Ticket } from '../shared/Ticket';

interface RoomCardProps {
  room: Room;
  actionLabel?: string;
  onDelete?: (roomId: string) => void;
}

// Each room is a paper ticket: room details on the ticket, the way in on the stub.
export const RoomCard: React.FC<RoomCardProps> = ({ room, actionLabel = 'Enter Room', onDelete }) => {
  const count = room.participantCount ?? 0;

  const handleDelete = () => {
    if (window.confirm(`Delete "${room.name}"? This can't be undone.`)) {
      onDelete?.(room.id);
    }
  };

  const stub = (
    <div className="flex w-full items-center justify-between gap-2">
      <Link
        to={`/room/${room.id}`}
        className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-ticket-ink px-4 text-sm font-semibold tracking-wide text-ticket transition-colors hover:bg-curtain hover:text-curtain-ink"
      >
        {actionLabel}
        <ArrowRight className="size-4" />
      </Link>
      {onDelete && (
        <IconButton label="Delete Room" onClick={handleDelete} className="text-ticket-muted hover:bg-transparent hover:text-curtain">
          <Trash2 className="size-4" />
        </IconButton>
      )}
    </div>
  );

  return (
    <Ticket stub={stub} className="bg-ticket text-ticket-ink">
      <div className="label-caps flex items-center justify-between gap-2 text-ticket-muted">
        <span>Admit one</span>
        <span className="truncate">No. {room.id.slice(0, 6).toUpperCase()}</span>
      </div>
      <h2 className="mt-5 text-4xl wrap-break-word">{room.name}</h2>
      <p className="mt-4 flex items-center gap-1.5 text-sm text-ticket-muted">
        <Users className="size-4" />
        {count} {count === 1 ? 'participant' : 'participants'}
      </p>
      <p className="mt-1 truncate font-mono text-xs text-ticket-muted" title={room.id}>
        {room.id}
      </p>
    </Ticket>
  );
};
