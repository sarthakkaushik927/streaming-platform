import React, { useState } from 'react';
import { History } from 'lucide-react';
import { useRoom } from '../../hooks/useRoom';
import { Button } from '../shared/Button';
import { PlaybackLogsModal } from './PlaybackLogsModal';

export const SyncTelemetry: React.FC = () => {
  const { room, participants } = useRoom();
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  if (!room) return null;

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-1 text-sm text-muted md:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <span className="truncate font-mono text-xs" title={room.id}>{room.id}</span>
          <span className="label-caps shrink-0">{participants.length} in room</span>
        </div>
        <Button variant="ghost" onClick={() => setIsLogsOpen(true)} icon={<History className="size-4" />}>
          Playback Logs
        </Button>
      </div>

      <PlaybackLogsModal isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} roomId={room.id} />
    </>
  );
};
