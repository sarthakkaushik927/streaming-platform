export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
}

export interface Reaction {
  emoji: string;
  count: number;
}
