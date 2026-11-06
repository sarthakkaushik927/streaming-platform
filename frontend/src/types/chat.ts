export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
}

export interface RawChatMessage {
  id?: string;
  _id?: string;
  userId?: string;
  user?: { id?: string; username?: string };
  username?: string;
  message?: string;
  text?: string;
  content?: string;
  created_at?: string;
  createdAt?: string;
  timestamp?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
}
