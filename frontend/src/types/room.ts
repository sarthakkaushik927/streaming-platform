export interface Room {
  id: string;
  name: string;
  title?: string;
  hostId: string;
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
  hostId?: string;
  host?: string;
  owner?: string;
  createdAt?: string;
  created_at?: string;
  isPrivate?: boolean;
  participantCount?: number;
  initialVideoId?: string;
  currentVideoId?: string;
  currentPlaybackTime?: number;
  isPlaying?: boolean;
  videoId?: string;
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
  roomId: string;
  action: string;
  timestamp: string;
  details?: string;
}
