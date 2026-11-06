import { io, Socket } from 'socket.io-client';
import env from '../config/env';
import { getCookie } from '../utils/cookie';

type EventHandler = (...args: unknown[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Record<string, EventHandler[]> = {};

  connect(): Socket {
    if (!this.socket) {
      console.log(`[Socket] Connecting to real WebSocket server at ${env.WS_URL}...`);
      const token = getCookie('syncstream-token') || localStorage.getItem('syncstream-token');
      
      this.socket = io(env.WS_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnection: true,
        auth: { token },
        extraHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      this.socket.on('connect', () => {
        console.log(`[Socket Connected] Socket ID: ${this.socket?.id}`);
      });

      this.socket.on('disconnect', (reason) => {
        console.log(`[Socket Disconnected] Reason: ${reason}`);
      });

      this.socket.on('connect_error', (err) => {
        console.warn(`[Socket Connection Error] ${err.message}`);
      });

      // Re-attach registered listeners to new socket instance
      Object.entries(this.listeners).forEach(([event, handlers]) => {
        handlers.forEach(handler => {
          this.socket?.on(event, handler);
        });
      });
    }
    return this.socket;
  }

  isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }

  disconnect(): void {
    if (this.socket) {
      console.log('[Socket] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on<Args extends unknown[]>(event: string, handler: (...args: Args) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    const registered = handler as EventHandler;
    this.listeners[event].push(registered);
    if (this.socket) {
      this.socket.on(event, registered);
    }
  }

  off<Args extends unknown[]>(event: string, handler: (...args: Args) => void): void {
    if (!this.listeners[event]) return;
    const registered = handler as EventHandler;
    this.listeners[event] = this.listeners[event].filter(h => h !== registered);
    if (this.socket) {
      this.socket.off(event, registered);
    }
  }

  emit(event: string, payload?: unknown): void {
    console.log(`[Socket Emit] ${event}:`, payload);
    if (!this.socket) {
      this.connect();
    }
    this.socket?.emit(event, payload);
  }
}

export const socketService = new SocketService();
