import { Socket } from 'socket.io-client';
import io from 'socket.io-client';

export interface AccountUpdate {
  accountId: string;
  balance: {
    current: number;
    available: number;
  };
  updatedAt: string;
}

export interface TransactionUpdate {
  accountId: string;
  transaction: {
    id: string;
    amount: number;
    date: string;
    name: string;
    category: string;
    pending: boolean;
  };
}

type WebSocketEventMap = {
  'account_update': AccountUpdate;
  'transaction_update': TransactionUpdate;
  'error': Error;
};

type WebSocketCallback<T> = (data: T) => void;

interface WebSocketMessage {
  type: string;
  payload: any;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, ((payload: any) => void)[]> = new Map();

  private constructor(private baseUrl: string) {
    // Private constructor for singleton pattern
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
    }
    return WebSocketService.instance;
  }

  connect(token: string): void {
    try {
      this.socket = new WebSocket(`${this.baseUrl}?token=${token}`);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.handleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    setTimeout(() => {
      this.reconnectAttempts++;
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.connect(token);
      }
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
  }

  subscribe(messageType: string, handler: (payload: any) => void): void {
    const handlers = this.messageHandlers.get(messageType) || [];
    handlers.push(handler);
    this.messageHandlers.set(messageType, handlers);
  }

  unsubscribe(messageType: string, handler: (payload: any) => void): void {
    const handlers = this.messageHandlers.get(messageType) || [];
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
      if (handlers.length === 0) {
        this.messageHandlers.delete(messageType);
      } else {
        this.messageHandlers.set(messageType, handlers);
      }
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => {
      try {
        handler(message.payload);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  send(type: string, payload: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
} 