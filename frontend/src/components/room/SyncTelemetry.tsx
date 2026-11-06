import React, { useState } from 'react';
import { useRoom } from '../../hooks/useRoom';
import { PlaybackLogsModal } from './PlaybackLogsModal';

export const SyncTelemetry: React.FC = () => {
  const { room, playerState, participants } = useRoom();
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  if (!room) return null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between py-2.5 px-6 bg-frame border-t border-white/10 font-label-mono text-[10px] text-cream-on-frame/70 uppercase tracking-wider z-20 relative">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-primary">cell_tower</span>
            WS Connected
          </div>
          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <span>Room: {room.id}</span>
          </div>
          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <span>Peers: {participants.length}</span>
          </div>
          {playerState.videoId && (
            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <span className="material-symbols-outlined text-[14px]">movie</span>
              {playerState.videoId}
            </div>
          )}
          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Sync OK
          </div>
        </div>

        <button 
          onClick={() => setIsLogsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 hover:bg-white/[0.07] transition-colors text-cream-on-frame font-bold"
        >
          <span className="material-symbols-outlined text-[14px]">history</span>
          Playback Logs
        </button>
      </div>

      <PlaybackLogsModal 
        isOpen={isLogsOpen} 
        onClose={() => setIsLogsOpen(false)} 
        roomId={room.id} 
      />
    </>
  );
};
