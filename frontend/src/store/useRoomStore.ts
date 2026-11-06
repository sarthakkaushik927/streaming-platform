import { create } from 'zustand';
import { Room } from '../types/room';
import { Participant, RawParticipant, Role } from '../types/participant';
import { PlayerState } from '../types/player';
import { ChatMessage, RawChatMessage } from '../types/chat';
import { ToastType } from '../components/shared/toastContext';
import {
  ChangeRequest,
  ChangeRequestsPayload,
  ChangeRequestStatusPayload,
  ErrorEventPayload,
  HostTransferredPayload,
  KickedPayload,
  ParticipantListPayload,
  ParticipantRemovedPayload,
  PlaybackChange,
  PlaybackPayload,
  RawPlaybackState,
  ReactionPayload,
  RoleAssignedPayload,
  UserJoinedFields,
  UserLeftPayload,
} from '../types/socket';
import { socketService } from '../services/socket.service';
import { roomService } from '../services/room.service';
import { participantService } from '../services/participant.service';
import { authService } from '../services/auth.service';

import { ReactionItem } from '../components/room/FloatingReactions';

const extractParticipants = (payload: ParticipantListPayload): RawParticipant[] | null => {
  const list = Array.isArray(payload)
    ? payload
    : payload?.participants || payload?.users || payload?.activeList;
  return Array.isArray(list) ? list : null;
};

const normalizeParticipant = (p: RawParticipant): Participant => ({
  userId: String(p?.userId || p?.id || p?._id || p?.socketId),
  username: p?.username || p?.name || p?.user?.username || 'User',
  role: p?.role || Role.PARTICIPANT,
  joinedAt: p?.joinedAt || p?.joined_at || new Date().toISOString(),
});

const normalizePlaybackState = (payload: PlaybackPayload): Partial<PlayerState> => {
  const source = (payload?.playbackState || payload?.state || payload) as RawPlaybackState;
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
  changeRequests: ChangeRequest[];
  myPendingRequest: PlaybackChange | null;
  notice: { message: string; type: ToastType } | null;
  wasRemoved: boolean;
  requestChange: (change: PlaybackChange) => void;
  reviewChange: (requestId: string, approved: boolean) => void;
  clearNotice: () => void;
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
  
  const handleSyncState = (payload: PlaybackPayload) => {
    set((state) => ({ playerState: { ...state.playerState, ...normalizePlaybackState(payload) } }));
  };
  
  const handleUserJoined = (payload: UserJoinedFields | RawParticipant[]) => {
    if (Array.isArray(payload)) {
      set({ participants: payload.map(normalizeParticipant) });
      return;
    }

    // Flow A: Emit user_joined (Playback State + active list)
    if (payload?.playbackState || payload?.state) {
      set((state) => ({ playerState: { ...state.playerState, ...normalizePlaybackState(payload) } }));
    }

    const rawList = extractParticipants(payload);
    if (rawList) {
      set({ participants: rawList.map(normalizeParticipant) });
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

  const handleParticipantsUpdated = (payload: ParticipantListPayload) => {
    const rawList = extractParticipants(payload);
    if (rawList) {
      set({ participants: rawList.map(normalizeParticipant) });
    }
  };

  const handleUserLeft = (payload: UserLeftPayload) => {
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

  const handleRoleAssigned = (payload: RoleAssignedPayload) => {
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

  const handleParticipantRemoved = (payload: ParticipantRemovedPayload) => {
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

  const handleChatMessage = (payload: RawChatMessage) => {
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

  const handleReaction = (payload: ReactionPayload) => {
    if (!payload?.emoji || !payload?.username) return;
    const reactionItem: ReactionItem = {
      id: `react-${Date.now()}-${Math.random()}`,
      emoji: payload.emoji,
      username: payload.username,
      leftPercent: Math.floor(Math.random() * 60) + 20,
    };
    set((state) => ({ reactions: [...state.reactions.slice(-15), reactionItem] }));
  };

  const handleKicked = (payload?: KickedPayload) => {
    get().leaveRoom();
    set({
      wasRemoved: true,
      notice: { message: payload?.message || 'You were removed from this room by the host.', type: 'error' },
    });
  };

  const handleErrorEvent = (payload: ErrorEventPayload) => {
    if (payload?.message) set({ notice: { message: payload.message, type: 'error' } });
  };

  const handleChangeRequests = (payload: ChangeRequestsPayload) => {
    set({ changeRequests: payload?.requests || [] });
  };

  const handleChangeRequestStatus = (payload: ChangeRequestStatusPayload) => {
    if (payload.status === 'PENDING') {
      const { action, currentTime, videoId } = payload;
      set({ myPendingRequest: { action, currentTime, videoId } });
      return;
    }

    set({ myPendingRequest: null });
    if (payload.status === 'APPROVED') {
      set({ notice: { message: 'Your request was approved.', type: 'success' } });
    } else if (payload.status === 'DECLINED') {
      set({ notice: { message: 'Your request was declined.', type: 'error' } });
    }
  };

  const handleHostTransferred = (payload: HostTransferredPayload) => {
    const newHostId = payload?.newHostId;
    const participants = payload?.participants;
    if (!newHostId || !Array.isArray(participants)) return;
    set((state) => ({
      participants: participants.map(normalizeParticipant),
      room: state.room ? { ...state.room, hostId: String(newHostId) } : null,
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
  socketService.on('error_event', handleErrorEvent);
  socketService.on('change_requests_updated', handleChangeRequests);
  socketService.on('change_request_status', handleChangeRequestStatus);

  return {
    room: null,
    participants: [],
    selfId: null,
    messages: [],
    reactions: [],
    isLoading: false,
    changeRequests: [],
    myPendingRequest: null,
    notice: null,
    wasRemoved: false,

    requestChange: (change: PlaybackChange) => {
      socketService.emit('request_change', change);
    },

    reviewChange: (requestId: string, approved: boolean) => {
      socketService.emit('review_change', { requestId, approved });
    },

    clearNotice: () => {
      set({ notice: null });
    },

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

      set({ isLoading: true, wasRemoved: false });
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
      set({ room: null, participants: [], messages: [], selfId: null, changeRequests: [], myPendingRequest: null });
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
