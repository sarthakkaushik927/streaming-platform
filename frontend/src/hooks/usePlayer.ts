import { useCallback } from 'react';
import { useRoom } from './useRoom';
import { socketService } from '../services/socket.service';

export const usePlayer = () => {
  const { playerState, setPlayerState } = useRoom();

  const play = useCallback((currentTime: number, videoId: string) => {
    setPlayerState({ state: 'playing', currentTime, videoId, timestamp: Date.now() });
    socketService.emit('play_state_change', { isPlaying: true, currentTime, videoId });
  }, [setPlayerState]);

  const pause = useCallback((currentTime: number, videoId?: string) => {
    setPlayerState({ state: 'paused', currentTime, videoId: videoId || playerState.videoId, timestamp: Date.now() });
    socketService.emit('play_state_change', { isPlaying: false, currentTime, videoId });
  }, [playerState.videoId, setPlayerState]);

  const seek = useCallback((currentTime: number, videoId?: string) => {
    setPlayerState({ currentTime, videoId: videoId || playerState.videoId, timestamp: Date.now() });
    socketService.emit('seek', { currentTime, videoId });
  }, [playerState.videoId, setPlayerState]);

  const changeVideo = useCallback((videoId: string) => {
    setPlayerState({ state: 'paused', currentTime: 0, videoId, timestamp: Date.now() });
    socketService.emit('change_video', { videoId });
  }, [setPlayerState]);

  return {
    playerState,
    play,
    pause,
    seek,
    changeVideo,
  };
};
