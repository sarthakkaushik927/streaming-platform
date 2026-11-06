import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { MessageSquare, Send } from 'lucide-react';
import { Card } from '../shared/Card';
import { IconButton } from '../shared/IconButton';
import { Input } from '../shared/Input';

export const ChatPanel: React.FC = () => {
  const { messages, sendMessage } = useChat();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && user) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const formatTime = (ts?: number | string) => {
    if (!ts) return '';
    const date = typeof ts === 'number' ? new Date(ts) : new Date(ts);
    return isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden border-t-4 border-t-curtain">
      <h2 className="shrink-0 border-b border-line px-4 py-3 text-2xl">Room chat</h2>

      <div className="thin-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted">
            <MessageSquare className="size-6 text-accent" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}

        {messages.map((msg) => {
          if (msg.userId === 'system') {
            return (
              <p key={msg.id} className="mx-auto w-fit border-y border-line px-3 py-1 text-center font-mono text-xs text-muted">
                {msg.content}
              </p>
            );
          }

          const isMe = msg.userId === user?.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="mb-1 flex items-center gap-2 px-1 text-xs text-muted">
                <span className="font-semibold text-ink">{msg.username}</span>
                {msg.timestamp && <span>{formatTime(msg.timestamp)}</span>}
              </div>
              <p className={`max-w-[85%] rounded-sm px-3 py-2 text-sm leading-relaxed wrap-break-word ${isMe ? 'bg-accent text-accent-ink' : 'bg-subtle text-ink'}`}>
                {msg.content}
              </p>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex shrink-0 items-center gap-2 border-t border-line p-3">
        <Input aria-label="Message" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Send a message..." />
        <IconButton label="Send message" type="submit" disabled={!input.trim()} className="bg-accent text-accent-ink hover:bg-accent hover:text-accent-ink hover:opacity-90">
          <Send className="size-4" />
        </IconButton>
      </form>
    </Card>
  );
};
