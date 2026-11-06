import React, { useEffect, useState } from 'react';
import { Modal } from '../shared/Modal';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { roomService } from '../../services/room.service';
import { RoomLogEntry } from '../../types/room';
import { formatClock } from '../../utils/changeRequest';

interface PlaybackLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

const ACTION_LABELS: Record<string, string> = {
  PLAY: 'Played',
  PAUSE: 'Paused',
  SEEK: 'Jumped',
  CHANGE_VIDEO: 'Changed video',
};

// Modal mounts its children only while open, so each open starts a fresh fetch.
const PlaybackLogsList: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [logs, setLogs] = useState<RoomLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(roomId));

  useEffect(() => {
    if (!roomId) return;
    let isActive = true;

    roomService.getRoomPlaybackLogs(roomId)
      .then((data) => {
        if (isActive && Array.isArray(data)) setLogs(data);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [roomId]);

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (logs.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">No playback actions yet.</p>;
  }

  return (
    <ul className="thin-scrollbar max-h-72 divide-y divide-line overflow-y-auto">
      {logs.map((log) => (
        <li key={log.id} className="flex items-center justify-between gap-3 py-2 text-sm">
          <span className="min-w-0 truncate">
            <span className="font-semibold">{log.username}</span> {(ACTION_LABELS[log.action] ?? log.action).toLowerCase()}
          </span>
          <span className="shrink-0 font-mono text-xs text-muted">{formatClock(Number(log.timestamp) || 0)}</span>
        </li>
      ))}
    </ul>
  );
};

export const PlaybackLogsModal: React.FC<PlaybackLogsModalProps> = ({ isOpen, onClose, roomId }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Playback history">
    <PlaybackLogsList roomId={roomId} />
  </Modal>
);
