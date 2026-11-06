export type PlaybackState = 'playing' | 'paused' | 'buffering' | 'ended' | 'unstarted';

export interface PlayerState {
  videoId: string | null;
  state: PlaybackState;
  currentTime: number;
  timestamp: number; // Server timestamp of the state
  updatedBy: string; // User ID who last updated the state
}

export interface SyncPayload {
  state: PlaybackState;
  currentTime: number;
  videoId?: string;
}
