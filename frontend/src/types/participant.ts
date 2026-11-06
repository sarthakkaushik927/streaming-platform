export enum Role {
  HOST = 'HOST',
  MODERATOR = 'MODERATOR',
  PARTICIPANT = 'PARTICIPANT',
  VIEWER = 'VIEWER',
}

export interface Participant {
  userId: string;
  username: string;
  avatarUrl?: string;
  role: Role;
  joinedAt: string;
}

export interface RoleAssignPayload {
  userId: string;
  role: Role;
}

export interface ParticipantRemovePayload {
  userId: string;
}
