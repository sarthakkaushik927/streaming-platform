import { useCallback } from 'react';
import { useRoom } from './useRoom';
import { socketService } from '../services/socket.service';
import { Role } from '../types/participant';

export const useParticipants = () => {
  const { participants, assignRole, transferHost } = useRoom();

  const removeParticipant = useCallback((userId: string) => {
    socketService.emit('remove_participant', { targetUserId: userId, userId });
  }, []);

  return {
    participants,
    assignRole,
    removeParticipant,
    transferHost,
  };
};
