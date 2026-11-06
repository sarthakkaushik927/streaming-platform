import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import env from '../../config/env';

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
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 group"
        style={{
          background: 'var(--primary)',
          color: 'var(--on-primary)',
        }}
      >
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--tertiary))' }}
        />
        {isOpen ? (
          <X className="w-6 h-6 relative z-10" />
        ) : (
          <Bot className="w-6 h-6 relative z-10" />
        )}
        {!isOpen && (
          <span
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
            style={{ background: 'var(--tertiary)' }}
          />
        )}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-0 right-0 md:bottom-24 md:right-6 z-60 w-full h-dvh md:w-90 md:h-130 rounded-none md:rounded-3xl border-0 md:border overflow-hidden shadow-2xl flex flex-col transition-all animate-in fade-in slide-in-from-bottom-10"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--outline)',
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{
              background: 'var(--frame)',
              borderColor: 'var(--outline)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-label-mono text-xs font-bold"
                style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}
              >
                W3
              </div>
              <div>
                <p className="font-label-mono text-sm font-bold" style={{ color: 'var(--cream-on-frame)' }}>
                  SyncStream Assistant
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--tertiary)' }} />
                  <span className="font-label-mono text-[10px]" style={{ color: 'var(--cream-on-frame)', opacity: 0.6 }}>
                    Online
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearHistory}
                className="p-2 rounded-xl transition-colors hover:bg-white/10"
                style={{ color: 'var(--cream-on-frame)' }}
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="md:hidden p-2 rounded-xl transition-colors hover:bg-white/10"
                style={{ color: 'var(--cream-on-frame)' }}
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar"
            style={{ background: 'var(--surface)' }}
          >
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--surface-container)', color: 'var(--on-surface-variant)' }}
                >
                  <Bot className="w-6 h-6" />
                </div>
                <p className="font-body-md text-sm text-center max-w-50" style={{ color: 'var(--on-surface-variant)' }}>
                  Ask me anything about SyncStream or the team
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[80%] px-4 py-3 rounded-2xl font-body-md text-sm leading-relaxed"
                  style={
                    msg.role === 'user'
                      ? {
                          background: 'var(--primary)',
                          color: 'var(--on-primary)',
                          borderBottomRightRadius: '6px',
                        }
                      : {
                          background: 'var(--surface-container)',
                          color: 'var(--on-surface)',
                          borderBottomLeftRadius: '6px',
                        }
                  }
                >
                  {msg.role === 'user' ? (
                    <span>{msg.content}</span>
                  ) : (
                    <div className="chatbot-markdown">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                  style={{
                    background: 'var(--surface-container)',
                    borderBottomLeftRadius: '6px',
                  }}
                >
                  <span className="chatbot-dot" style={{ background: 'var(--on-surface-variant)', animationDelay: '0ms' }} />
                  <span className="chatbot-dot" style={{ background: 'var(--on-surface-variant)', animationDelay: '200ms' }} />
                  <span className="chatbot-dot" style={{ background: 'var(--on-surface-variant)', animationDelay: '400ms' }} />
                </div>
              </div>
            )}

            {error && (
              <div
                className="mx-auto max-w-[90%] px-4 py-3 rounded-2xl text-center font-body-md text-xs"
                style={{
                  background: 'var(--error-container)',
                  color: 'var(--error)',
                }}
              >
                {error}. Try again.
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div
            className="px-4 py-3 border-t flex items-center gap-2"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--outline)',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 rounded-xl font-body-md text-sm outline-none border transition-colors focus:border-primary"
              style={{
                background: 'var(--surface-container)',
                color: 'var(--on-surface)',
                borderColor: 'var(--outline)',
              }}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
              style={{
                background: 'var(--primary)',
                color: 'var(--on-primary)',
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
