import { Room, RoomCreatePayload, RoomJoinPayload, RawList, RawRoomLogEntry, RawRoomResponse, RoomLogEntry } from '../types/room';
import { ChatMessage, RawChatMessage } from '../types/chat';
import { apiClient } from './api.client';
import { authService } from './auth.service';

class RoomService {
  private parseRoomObj(raw: RawRoomResponse): Room {
    const data = (raw?.data || raw) as RawRoomResponse;
    const fallbackId = `ROOM-${Math.floor(Math.random() * 1000)}`;
    const id = data?.id || data?._id || data?.roomId || fallbackId;
    const title = data?.title || data?.name || 'Watch Party';
    
    const rawHost = data?.hostId || data?.host_id || data?.host || data?.owner;
    let hostId = 'u1';
    if (typeof rawHost === 'object' && rawHost !== null) {
      hostId = rawHost.id || rawHost._id || rawHost.username || 'u1';
    } else if (rawHost) {
      hostId = String(rawHost);
    }
    
    return {
      id: String(id),
      name: String(title),
      title: String(title),
      hostId: String(hostId),
      createdBy: data?.createdBy,
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
    return room;
  }

  async joinRoom(payload: RoomJoinPayload): Promise<Room> {
    const res = await apiClient.get<RawRoomResponse>(`/rooms/${payload.roomId}`);
    return this.parseRoomObj(res);
  }
  
  // Only real rooms from the server. An empty list shows the empty state; a failed request throws to the page.
  async listAllRooms(): Promise<Room[]> {
    const res = await apiClient.get<RawList<RawRoomResponse>>('/rooms');
    const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    return list.map((item) => this.parseRoomObj(item));
  }

  async listMyRooms(): Promise<Room[]> {
    const user = await authService.getCurrentUser();
    const currentUserId = user?.id || user?.username || '';
    const all = await this.listAllRooms();
    if (!currentUserId) return all;
    return all.filter(r => String(r.hostId) === String(currentUserId) || String(r.createdBy) === String(currentUserId));
  }

  async getRoomChatHistory(roomId: string): Promise<ChatMessage[]> {
    if (!roomId || roomId === 'undefined') return [];
    try {
      const res = await apiClient.get<RawList<RawChatMessage>>(`/rooms/${roomId}/chat`);
      const list = Array.isArray(res) ? res : (res?.data || []);
      return list.map((item) => ({
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
      const res = await apiClient.get<RawList<RawRoomLogEntry>>(`/rooms/${roomId}/logs`);
      const list = Array.isArray(res) ? res : (res?.data || []);
      return list.map((item) => ({
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
    await apiClient.delete(`/rooms/${roomId}`);
  }
}

export const roomService = new RoomService();
