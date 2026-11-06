import { RawRoomParticipant } from './participant';

export type RawList<T> = T[] | { data?: T[] };

export interface RawRoomHost {
  id?: string;
  _id?: string;
  username?: string;
}

export interface Room {
  id: string;
  name: string;
  title?: string;
  hostId: string;
  createdBy?: string;
  createdAt: string;
  isPrivate: boolean;
  participantCount?: number;
  initialVideoId?: string;
}

export interface RawRoomResponse {
  id?: string;
  _id?: string;
  roomId?: string;
  name?: string;
  title?: string;
  hostId?: string | RawRoomHost;
  host_id?: string | RawRoomHost;
  host?: string | RawRoomHost;
  owner?: string | RawRoomHost;
  createdBy?: string;
  createdAt?: string;
  created_at?: string;
  isPrivate?: boolean;
  participantCount?: number;
  initialVideoId?: string;
  currentVideoId?: string;
  current_video_id?: string;
  currentPlaybackTime?: number;
  isPlaying?: boolean;
  videoId?: string;
  participants?: RawRoomParticipant[];
  Participants?: RawRoomParticipant[];
  users?: RawRoomParticipant[];
  data?: RawRoomResponse | RawRoomResponse[];
  room?: RawRoomResponse;
}

export interface RoomCreatePayload {
  title: string;
  name?: string;
  isPrivate?: boolean;
  initialVideoId?: string;
  initialVideoUrl?: string;
}

export interface RoomJoinPayload {
  roomId: string;
  password?: string;
}

export interface RoomLogEntry {
  id: string;
  roomId?: string;
  action: string;
  timestamp: string;
  details?: string;
  videoId?: string;
  userId?: string;
  username?: string;
}

export interface RawRoomLogEntry {
  id?: string;
  _id?: string;
  action?: string;
  videoId?: string;
  actionTimestamp?: string;
  timestamp?: string;
  created_at?: string;
  userId?: string;
  user?: { id?: string; username?: string };
  username?: string;
}
