import { create } from 'zustand';
import { Room } from '../types/room';
import { Participant, Role } from '../types/participant';
import { PlayerState } from '../types/player';
import { ChatMessage } from '../types/chat';
import { socketService } from '../services/socket.service';
import { roomService } from '../services/room.service';
import { participantService } from '../services/participant.service';
import { authService } from '../services/auth.service';

import { ReactionItem } from '../components/room/FloatingReactions';

const normalizeParticipant = (p: any): Participant => ({
  userId: String(p?.userId || p?.id || p?._id || p?.socketId),
  username: p?.username || p?.name || p?.user?.username || 'User',
  role: p?.role || Role.PARTICIPANT,
  joinedAt: p?.joinedAt || p?.joined_at || new Date().toISOString(),
});

const normalizePlaybackState = (payload: any): Partial<PlayerState> => {
  const source = payload?.playbackState || payload?.state || payload;
  const isPlaying = source?.isPlaying;
  const state = typeof isPlaying === 'boolean'
    ? (isPlaying ? 'playing' : 'paused')
    : source?.state;

  return {
    videoId: source?.videoId ?? undefined,
    currentTime: source?.currentTime ?? 0,
    state: state || undefined,
    timestamp: Date.now(),
    updatedBy: source?.updatedBy || 'server',
  };
};

interface RoomState {
  room: Room | null;
  participants: Participant[];
  selfId: string | null;
  playerState: PlayerState;
  messages: ChatMessage[];
  reactions: ReactionItem[];
  isLoading: boolean;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => void;
  assignRole: (userId: string, role: Role) => void;
  transferHost: (newHostId: string) => void;
  setPlayerState: (state: Partial<PlayerState>) => void;
  sendEmojiReaction: (emoji: string) => void;
  removeReaction: (id: string) => void;
}

export const useRoomStore = create<RoomState>((set, get) => {
  // Socket event listeners can be initialized later or handled via a setup function
  // But since we need to attach them once, we can do it inside a custom hook or directly here
  
  const handleSyncState = (payload: any) => {
    set((state) => ({ playerState: { ...state.playerState, ...normalizePlaybackState(payload) } }));
  };
  
  const handleUserJoined = (payload: any) => {
    // Flow A: Emit user_joined (Playback State + active list)
    if (payload?.playbackState || payload?.state) {
      set((state) => ({ playerState: { ...state.playerState, ...normalizePlaybackState(payload) } }));
    }
    
    const rawList = payload?.participants || payload?.users || payload?.activeList || (Array.isArray(payload) ? payload : null);
    if (rawList && Array.isArray(rawList)) {
      const normalized = rawList.map(normalizeParticipant);
      set({ participants: normalized });
      return;
    }
    
    // Fallback for single user join
    const incoming = payload?.user || payload?.participant || payload;
    const userId = incoming?.userId || incoming?.id || incoming?._id || incoming?.socketId;
    const username = incoming?.username || incoming?.name || incoming?.user?.username || 'User';
    const role = incoming?.role || Role.PARTICIPANT;

    if (!userId) return;

    set((state) => {
      if (state.participants.some(p => String(p.userId) === String(userId))) return state;
      return {
        participants: [...state.participants, {
          userId: String(userId),
          username,
          role,
          joinedAt: new Date().toISOString()
        }]
      };
    });
  };

  const handleParticipantsUpdated = (payload: any) => {
    const rawList = payload?.participants || payload?.users || payload?.activeList || (Array.isArray(payload) ? payload : null);
    if (Array.isArray(rawList)) {
      const normalized = rawList.map(normalizeParticipant);
      set({ participants: normalized });
    }
  };

  const handleUserLeft = (payload: any) => {
    const userId = payload?.userId || payload?.id;
    if (!userId) return;
    
    const currentState = get();
    const leavingParticipant = currentState.participants.find(p => String(p.userId) === String(userId));
    
    if (leavingParticipant?.role === Role.HOST) {
      currentState.leaveRoom();
      return;
    }

    set((state) => ({ participants: state.participants.filter(p => String(p.userId) !== String(userId)) }));
  };

  const handleRoleAssigned = (payload: any) => {
    const userId = payload?.targetUserId || payload?.target || payload?.userId || payload?.id;
    const newRole = payload?.newRole || payload?.role;
    if (!userId || !newRole) return;
    
    if (payload?.participants && Array.isArray(payload.participants)) {
      const normalized = payload.participants.map(normalizeParticipant);
      set({ participants: normalized });
    } else {
      set((state) => ({
        participants: state.participants.map(p => String(p.userId) === String(userId) ? { ...p, role: newRole } : p)
      }));
    }
  };

  const handleParticipantRemoved = (payload: any) => {
    const userId = payload?.targetUserId || payload?.userId || payload?.id;
    if (payload?.participants && Array.isArray(payload.participants)) {
      const normalized = payload.participants.map(normalizeParticipant);
      set({ participants: normalized });
    } else if (userId) {
      set((state) => ({
        participants: state.participants.filter(p => String(p.userId) !== String(userId))
      }));
    }
  };

  const handleChatMessage = (payload: any) => {
    if (!payload) return;
    const content = payload.message || payload.text || payload.content || '';
    const username = payload.user?.username || payload.username || 'User';

    const msgObj: ChatMessage = {
      id: payload.id || `msg-${Date.now()}`,
      userId: String(payload.userId || payload.user?.id || 'sys'),
      username,
      content,
      timestamp: payload.created_at || payload.timestamp || new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, msgObj] }));
  };

  const handleReaction = (payload: any) => {
    if (!payload?.emoji || !payload?.username) return;
    const reactionItem: ReactionItem = {
      id: `react-${Date.now()}-${Math.random()}`,
      emoji: payload.emoji,
      username: payload.username,
      leftPercent: Math.floor(Math.random() * 60) + 20,
    };
    set((state) => ({ reactions: [...state.reactions.slice(-15), reactionItem] }));
  };

  const handleKicked = () => {
    get().leaveRoom();
  };

  const handleHostTransferred = (payload: any) => {
    if (!payload?.newHostId || !Array.isArray(payload.participants)) return;
    set((state) => ({
      participants: payload.participants.map(normalizeParticipant),
      room: state.room ? { ...state.room, hostId: String(payload.newHostId) } : null,
    }));
  };

  const connectAndJoinSocketRoom = (roomId: string) => {
    socketService.connect();
    socketService.emit('join_room', { roomId });
  };

  // Attach listeners
  socketService.on('sync_state', handleSyncState);
  socketService.on('user_joined', handleUserJoined);
  socketService.on('user_left', handleUserLeft);
  socketService.on('role_assigned', handleRoleAssigned);
  socketService.on('participants_updated', handleParticipantsUpdated);
  socketService.on('participant_removed', handleParticipantRemoved);
  socketService.on('chat_message', handleChatMessage);
  socketService.on('reaction', handleReaction);
  socketService.on('kicked', handleKicked);
  socketService.on('host_transferred', handleHostTransferred);

  return {
    room: null,
    participants: [],
    selfId: null,
    messages: [],
    reactions: [],
    isLoading: false,
    playerState: {
      videoId: null,
      state: 'unstarted',
      currentTime: 0,
      timestamp: Date.now(),
      updatedBy: 'system',
    },

    removeReaction: (id: string) => {
      set((state) => ({ reactions: state.reactions.filter((r) => r.id !== id) }));
    },

    sendEmojiReaction: (emoji: string) => {
      if (!get().room) return;
      const selfId = get().selfId;
      const participants = get().participants;
      const currentUser = participants.find((p) => String(p.userId) === String(selfId));
      const username = currentUser?.username || 'User';
      socketService.emit('reaction', { emoji, userId: selfId, username });
    },

    setPlayerState: (newState) => {
      set((state) => ({ playerState: { ...state.playerState, ...newState } }));
    },

    joinRoom: async (roomId: string) => {
      if (!roomId || roomId === 'undefined') return;
      
      const currentRoom = get().room;
      if (currentRoom && currentRoom.id === roomId) {
        connectAndJoinSocketRoom(roomId);
        return;
      }

      set({ isLoading: true });
      try {
        const roomData = await roomService.joinRoom({ roomId });
        set({ room: roomData });
        
        const currentUser = await authService.getCurrentUser();
        const realUsername = currentUser?.username || currentUser?.emailAddress?.split('@')[0] || 'SyncStream User';
        const realUserId = currentUser?.id || `u-${Date.now()}`;
        set({ selfId: realUserId });
        
        const selfParticipant: Participant = {
          userId: realUserId,
          username: realUsername,
          role: Role.PARTICIPANT,
          joinedAt: new Date().toISOString(),
        };
        
        const parts = await participantService.getParticipants(roomId);
        if (Array.isArray(parts) && parts.length > 0) {
          const normalizedParts = parts.map(normalizeParticipant);
          
          const updatedParts = normalizedParts;
          if (!updatedParts.find(p => String(p.userId) === String(realUserId))) {
             updatedParts.push(selfParticipant);
          }
          set({ participants: updatedParts });
        } else {
          set({ participants: [selfParticipant] });
        }
        
        connectAndJoinSocketRoom(roomId);
      } catch (error) {
        console.error('Failed to join room', error);
set({ room: null, participants: [], messages: [], selfId: null, reactions: [] });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    leaveRoom: () => {
      const currentRoom = get().room;
      if (currentRoom) {
        socketService.emit('leave_room', { roomId: currentRoom.id });
        socketService.disconnect();
      }
      set({ room: null, participants: [], messages: [], selfId: null });
    },

    assignRole: (userId: string, role: Role) => {
      socketService.emit('assign_role', { 
        targetUserId: userId, 
        newRole: role,
        target: userId, 
        role 
      });
    },

    removeParticipant: (userId: string) => {
      socketService.emit('remove_participant', { 
        targetUserId: userId,
        userId 
      });
    },

    transferHost: (newHostId: string) => {
      // Roles update when the server confirms with host_transferred
      socketService.emit('transfer_host', { userId: newHostId, targetUserId: newHostId });
    }
  };
});
