export enum Role {
  HOST = 'HOST',
  MODERATOR = 'MODERATOR',
  PARTICIPANT = 'PARTICIPANT',
}

export interface Participant {
  userId: string;
  username: string;
  avatarUrl?: string;
  role: Role;
  joinedAt: string;
}

export interface RawParticipant {
  userId?: string;
  id?: string;
  _id?: string;
  socketId?: string;
  username?: string;
  name?: string;
  user?: RawParticipant;
  role?: Role;
  joinedAt?: string;
  joined_at?: string;
}

export interface RawRoomParticipant extends RawParticipant {
  participants?: { role?: Role };
}

export interface RoleAssignPayload {
  userId: string;
  role: Role;
}

export interface ParticipantRemovePayload {
  userId: string;
}
