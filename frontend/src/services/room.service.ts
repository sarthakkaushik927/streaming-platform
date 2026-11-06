import { Room, RoomCreatePayload, RoomJoinPayload, RawRoomResponse, RoomLogEntry } from '../types/room';
import { ChatMessage } from '../types/chat';
import { apiClient } from './api.client';
import { authService } from './auth.service';

class RoomService {
  private mockRooms: Record<string, Room> = {
    'ROOM-7721': {
      id: 'ROOM-7721',
      name: 'Interstellar Watch Party',
      title: 'Interstellar Watch Party',
      hostId: 'u1',
      createdAt: new Date().toISOString(),
      isPrivate: false,
      participantCount: 12,
      initialVideoId: '8vnrqEudzWQ',
    },
  };

  private parseRoomObj(raw: any): Room {
    const data = raw?.data || raw;
    const fallbackId = `ROOM-${Math.floor(Math.random() * 1000)}`;
    const id = data?.id || data?._id || data?.roomId || fallbackId;
    const title = data?.title || data?.name || 'Watch Party';
    
    const rawHost = data?.hostId || data?.host_id || data?.host || data?.owner;
    let hostId = 'u1';
    if (typeof rawHost === 'object' && rawHost !== null) {
      hostId = (rawHost as any).id || (rawHost as any)._id || (rawHost as any).username || 'u1';
    } else if (rawHost) {
      hostId = String(rawHost);
    }
    
    return {
      id: String(id),
      name: String(title),
      title: String(title),
      hostId: String(hostId),
      createdAt: data?.createdAt || data?.created_at || new Date().toISOString(),
      isPrivate: data?.isPrivate ?? false,
      participantCount: data?.participantCount ?? data?.participants?.length ?? 0,
      initialVideoId: data?.initialVideoId || data?.videoId || data?.currentVideoId || data?.current_video_id || 'dQw4w9WgXcQ',
    };
  }

  async createRoom(payload: RoomCreatePayload): Promise<Room> {
    const user = await authService.getCurrentUser();
    const currentHostId = user?.id || user?.username || 'u1';

    const res = await apiClient.post<RawRoomResponse>('/rooms', {
      title: payload.title || payload.name || 'Watch Party',
      initialVideoId: payload.initialVideoId || 'dQw4w9WgXcQ',
    });
    const room = this.parseRoomObj(res);
    if (!room.hostId || room.hostId === 'u1') {
      room.hostId = String(currentHostId);
    }
    this.mockRooms[room.id] = room;
    return room;
  }

  async joinRoom(payload: RoomJoinPayload): Promise<Room> {
    const res = await apiClient.get<RawRoomResponse>(`/rooms/${payload.roomId}`);
    return this.parseRoomObj(res);
  }
  
  async getRoomDetails(roomId: string): Promise<Room> {
    if (!roomId || roomId === 'undefined') {
      return this.mockRooms['ROOM-7721'];
    }

    try {
      const res = await apiClient.get<RawRoomResponse>(`/rooms/${roomId}`);
      return this.parseRoomObj(res);
    } catch (err) {
      console.warn('Real getRoomDetails API call failed, using fallback', err);
      const user = await authService.getCurrentUser();
      const currentHostId = user?.id || user?.username || 'u1';
      return this.mockRooms[roomId] || {
        id: roomId,
        name: `Room ${roomId}`,
        title: `Room ${roomId}`,
        hostId: String(currentHostId),
        createdAt: new Date().toISOString(),
        isPrivate: false,
        participantCount: 1,
        initialVideoId: 'dQw4w9WgXcQ',
      };
    }
  }

  async listAllRooms(): Promise<Room[]> {
    try {
      const res: any = await apiClient.get('/rooms');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      if (list.length > 0) {
        return list.map((item: RawRoomResponse) => this.parseRoomObj(item));
      }
      return Object.values(this.mockRooms);
    } catch (err) {
      console.warn('Real listAllRooms API call failed, using local list', err);
      return Object.values(this.mockRooms);
    }
  }

  async listMyRooms(): Promise<Room[]> {
    try {
      const user = await authService.getCurrentUser();
      const currentUserId = user?.id || user?.username || '';
      const all = await this.listAllRooms();
      if (!currentUserId) return all;
      const mine = all.filter(r => String(r.hostId) === String(currentUserId));
      return mine.length > 0 ? mine : all.filter(r => String(r.hostId) === String(currentUserId));
    } catch (err) {
      console.warn('listMyRooms failed', err);
      return Object.values(this.mockRooms);
    }
  }

  async getRoomChatHistory(roomId: string): Promise<ChatMessage[]> {
    if (!roomId || roomId === 'undefined') return [];
    try {
      const res: any = await apiClient.get(`/rooms/${roomId}/chat`);
      const list = res?.data || (Array.isArray(res) ? res : []);
      return list.map((item: any) => ({
        id: String(item.id || item._id || `msg-${Date.now()}`),
        userId: String(item.userId || item.user?.id || 'sys'),
        username: item.user?.username || item.username || 'User',
        content: item.message || item.content || '',
        timestamp: item.created_at || item.createdAt || new Date().toISOString(),
      }));
    } catch (err) {
      console.warn(`Failed to fetch chat history for room ${roomId}`, err);
      return [];
    }
  }

  async getRoomPlaybackLogs(roomId: string): Promise<RoomLogEntry[]> {
    if (!roomId || roomId === 'undefined') return [];
    try {
      const res: any = await apiClient.get(`/rooms/${roomId}/logs`);
      const list = res?.data || (Array.isArray(res) ? res : []);
      return list.map((item: any) => ({
        id: String(item.id || item._id || `log-${Date.now()}`),
        action: item.action || 'PLAY',
        videoId: item.videoId || '',
        timestamp: item.actionTimestamp || item.timestamp || item.created_at || new Date().toISOString(),
        userId: String(item.userId || item.user?.id || 'sys'),
        username: item.user?.username || item.username || 'User',
      }));
    } catch (err) {
      console.warn(`Failed to fetch playback logs for room ${roomId}`, err);
      return [];
    }
  }

  async deleteRoom(roomId: string): Promise<void> {
    if (!roomId || roomId === 'undefined') return;
    try {
      await apiClient.delete(`/rooms/${roomId}`);
    } catch (err) {
      console.warn(`Real deleteRoom API call failed, using local list`, err);
    } finally {
      delete this.mockRooms[roomId];
    }
  }
}

export const roomService = new RoomService();
