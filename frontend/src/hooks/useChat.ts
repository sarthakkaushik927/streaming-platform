import { useCallback } from 'react';
import { useRoom } from './useRoom';
import { socketService } from '../services/socket.service';

export const useChat = () => {
  const { messages, room } = useRoom();

  const sendMessage = useCallback((content: string, _userId?: string, _username?: string) => {
    if (!room) return;
    
    socketService.emit('send_chat', { message: content });
  }, [room]);

  return {
    messages,
    sendMessage,
  };
};
