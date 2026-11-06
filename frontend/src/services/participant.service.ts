import { Participant, RoleAssignPayload, ParticipantRemovePayload } from '../types/participant';
import { apiClient } from './api.client';

class ParticipantService {
  async getParticipants(roomId: string): Promise<Participant[]> {
    try {
      const res: any = await apiClient.get(`/rooms/${roomId}`);
      const room = res?.data || res?.room || res;
      const list = room?.participants || room?.Participants || room?.users || [];
      if (Array.isArray(list) && list.length > 0) {
        return list.map((item: any) => ({
          userId: String(item.userId || item.id || item.user?.id || item._id),
          username: item.username || item.user?.username || 'User',
          role: item.role || item.participants?.role || 'PARTICIPANT',
          joinedAt: item.joinedAt || item.joined_at || new Date().toISOString(),
        }));
      }
    } catch (e) {
      // Socket events will populate active participants after join_room.
    }
    return [];
  }

  async assignRole(payload: RoleAssignPayload): Promise<void> {
    try {
      await apiClient.post(`/rooms/${payload.userId}/role`, payload);
    } catch (e) {
      console.warn('Backend assignRole API call not active, using WebSocket', e);
    }
  }

  async removeParticipant(payload: ParticipantRemovePayload): Promise<void> {
    try {
      await apiClient.post(`/rooms/${payload.userId}/remove`, payload);
    } catch (e) {
      console.warn('Backend removeParticipant API call not active, using WebSocket', e);
    }
  }

  async transferHost(userId: string): Promise<void> {
    try {
      await apiClient.post(`/rooms/transfer-host`, { userId });
    } catch (e) {
      console.warn('Backend transferHost API call not active, using WebSocket', e);
    }
  }
}

export const participantService = new ParticipantService();
