import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import env from '../../config/env';
import { IconButton } from './IconButton';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  success: boolean;
  reply: string;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${env.API_BASE_URL.replace('/api/v1', '')}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      if (data.success && data.reply) {
        setMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
        className="fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-sm bg-accent text-accent-ink shadow-[3px_3px_0_var(--curtain)] transition-transform hover:-translate-y-0.5 active:translate-y-px md:right-6 md:bottom-6"
      >
        {isOpen ? <X className="size-6" /> : <Bot className="size-6" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-60 flex flex-col overflow-hidden bg-card md:inset-auto md:right-6 md:bottom-24 md:h-130 md:w-90 md:rounded-sm md:border md:border-t-4 md:border-line md:border-t-marquee md:shadow-[8px_8px_0_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between border-b border-line py-2 pr-2 pl-4">
            <div className="flex items-center gap-2">
              <Bot className="size-5 text-accent" />
              <h2 className="text-2xl">SyncStream assistant</h2>
            </div>
            <div className="flex items-center">
              <IconButton label="Clear conversation" onClick={clearHistory}>
                <Trash2 className="size-4" />
              </IconButton>
              <IconButton label="Close chat" className="md:hidden" onClick={() => setIsOpen(false)}>
                <X className="size-5" />
              </IconButton>
            </div>
          </div>

          <div className="thin-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && !isLoading && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted">
                <Bot className="size-6" />
                <p className="max-w-50 text-sm">Ask me anything about SyncStream or the team</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-sm px-3 py-2 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-accent text-accent-ink' : 'bg-subtle text-ink'}`}>
                  {msg.role === 'user' ? (
                    <span>{msg.content}</span>
                  ) : (
                    <div className="assistant-markdown">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex w-fit items-center gap-1.5 rounded-sm bg-subtle px-3 py-3" aria-label="Assistant is typing">
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: '200ms' }} />
                <span className="typing-dot" style={{ animationDelay: '400ms' }} />
              </div>
            )}

            {error && <p className="rounded-sm bg-danger-soft px-3 py-2 text-center text-sm text-danger">{error}. Try again.</p>}

            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-line p-3">
            <input
              ref={inputRef}
              type="text"
              aria-label="Message the assistant"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isLoading}
              className="min-h-11 w-full rounded-sm border border-line bg-canvas px-3 text-base text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none sm:text-sm"
            />
            <IconButton label="Send message" onClick={sendMessage} disabled={!input.trim() || isLoading} className="bg-accent text-accent-ink hover:bg-accent hover:text-accent-ink hover:opacity-90">
              <Send className="size-4" />
            </IconButton>
          </div>
        </div>
      )}
    </>
  );
};
