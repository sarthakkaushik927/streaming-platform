import { RawParticipant, Role } from './participant';
import { PlaybackState } from './player';

export interface RawPlaybackState {
  videoId?: string | null;
  currentTime?: number;
  isPlaying?: boolean;
  state?: PlaybackState;
  updatedBy?: string;
}

export interface PlaybackPayload extends Omit<RawPlaybackState, 'state'> {
  playbackState?: RawPlaybackState;
  state?: RawPlaybackState | PlaybackState;
}

export interface ParticipantListFields {
  participants?: RawParticipant[];
  users?: RawParticipant[];
  activeList?: RawParticipant[];
}

export type ParticipantListPayload = ParticipantListFields | RawParticipant[];

export interface UserJoinedFields extends PlaybackPayload, ParticipantListFields, RawParticipant {
  participant?: RawParticipant;
}

export interface UserLeftPayload {
  userId?: string;
  id?: string;
}

export interface RoleAssignedPayload {
  targetUserId?: string;
  target?: string;
  userId?: string;
  id?: string;
  newRole?: Role;
  role?: Role;
  participants?: RawParticipant[];
}

export interface ParticipantRemovedPayload {
  targetUserId?: string;
  userId?: string;
  id?: string;
  participants?: RawParticipant[];
}

export interface ReactionPayload {
  emoji?: string;
  username?: string;
}

export interface HostTransferredPayload {
  newHostId?: string;
  previousHostId?: string;
  participants?: RawParticipant[];
}

export interface KickedPayload {
  message?: string;
}

export interface ErrorEventPayload {
  message?: string;
}

export type PlaybackAction = 'PLAY' | 'PAUSE' | 'SEEK' | 'CHANGE_VIDEO';

export interface PlaybackChange {
  action: PlaybackAction;
  currentTime?: number;
  videoId?: string;
}

export interface ChangeRequest extends PlaybackChange {
  id: string;
  requesterId: string;
  requesterName: string;
  createdAt: string;
}

export interface ChangeRequestsPayload {
  requests?: ChangeRequest[];
}

export interface ChangeRequestStatusPayload extends PlaybackChange {
  requestId: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'CANCELLED';
}
