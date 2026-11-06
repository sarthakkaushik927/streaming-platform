import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';

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
      sendMessage(input.trim(), user.id, user.username);
      setInput('');
    }
  };

  const formatTime = (ts?: number | string) => {
    if (!ts) return '';
    const date = typeof ts === 'number' ? new Date(ts) : new Date(ts);
    return isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-room-card-bg text-room-card-text rounded-[24px] shadow-[0_0_15px_rgba(var(--color-primary),0.15)] overflow-hidden relative border border-outline dark:p-[3px]">
      <div className="flex flex-col h-full min-h-0 dark:bg-black dark:rounded-[21px] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-black/10 dark:border-white/10 dark:text-white flex justify-between items-center flex-shrink-0">
          <h3 className="font-headline-sm text-sm font-bold">Room Chat</h3>
          <span className="font-label-mono text-[10px] text-green-700 dark:text-green-400 bg-green-500/20 dark:bg-green-500/10 border border-green-500/30 dark:border-green-500/20 px-2 py-0.5 rounded-full font-bold">LIVE</span>
        </div>
        
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-4 flex flex-col">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-60 dark:text-white gap-3">
              <span className="material-symbols-outlined text-3xl opacity-50">chat_bubble</span>
              <p className="font-body-md text-xs">No messages yet. Start the conversation!</p>
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.userId === user?.id;
            const isSystem = msg.userId === 'system';
            
            if (isSystem) {
              return (
                <div key={msg.id} className="text-center font-label-mono text-[10px] dark:text-white/70 my-2 bg-white/10 border border-white/10 py-1 px-3 rounded-full mx-auto w-fit">
                  {msg.content}
                </div>
              );
            }
            
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="font-label-mono text-[10px] opacity-70 dark:text-primary font-bold">{msg.username}</span>
                  {msg.timestamp && (
                    <span className="font-label-mono text-[9px] opacity-50 dark:text-white/50">{formatTime(msg.timestamp)}</span>
                  )}
                </div>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] shadow-xs ${
                  isMe 
                    ? 'bg-black border-2 border-black text-white dark:bg-primary dark:border-primary dark:text-black font-medium rounded-tr-xs' 
                    : 'bg-black/5 border-2 border-black/20 text-room-card-text dark:bg-white/10 dark:border-white/20 dark:text-white rounded-tl-xs'
                }`}>
                  <p className="font-body-md text-[13px] leading-relaxed break-words">{msg.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-3 border-t border-black/10 dark:border-white/10 flex-shrink-0">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message..."
              className="w-full bg-black/5 dark:bg-white/10 border-2 border-black/20 dark:border-primary/50 rounded-full pl-4 pr-12 py-2.5 text-sm placeholder:text-room-card-text/40 dark:placeholder:text-white/40 focus:outline-none focus:border-black dark:focus:border-primary focus:ring-2 focus:ring-black/20 dark:focus:ring-primary/30 transition-all font-body-md text-room-card-text dark:text-white shadow-xs"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-1 top-1 bottom-1 aspect-square flex items-center justify-center rounded-full bg-black dark:bg-primary text-white dark:text-black disabled:opacity-40 hover:brightness-110 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
