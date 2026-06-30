import { MOCK_CHAT_MESSAGES } from './ProjectService';
import { ChatMessage } from '../api/interfaces/ProjectTypes';

type EventHandler = (data: any) => void;

const SOCKET_URL = 'wss://api.example.com/socket';

const MOCK_RESPONDERS: Record<string, string[]> = {
  prj1: ['Rahul Sharma', 'Priya Patel', 'Ananya Gupta', 'Vikram Singh'],
  prj2: ['Arun Kumar', 'Meera Nair'],
  prj3: ['Suman Rao', 'Karthik Menon'],
  prj4: ['Deepa Iyer'],
};

const MOCK_REPLIES = [
  'Noted, will check and update.',
  'That makes sense. I will incorporate it.',
  'Can we discuss this in the next standup?',
  'Good point. Let me review and get back.',
  'Agreed. Proceeding with the changes.',
  'Thanks for the update. Will coordinate accordingly.',
];

class SocketService {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private connected = false;
  private mockMode = true;
  private mockTimers: ReturnType<typeof setTimeout>[] = [];
  private reconnectAttempts = 0;

  connect(projectId: string): void {
    if (this.connected) return;

    if (this.mockMode) {
      this.simulateConnection(projectId);
      return;
    }

    try {
      this.ws = new WebSocket(`${SOCKET_URL}?project=${projectId}`);

      this.ws.onopen = () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        this.emit('connection', { status: 'connected', projectId });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.event, data.payload);
        } catch {
          // ignore parse errors
        }
      };

      this.ws.onerror = () => {
        this.emit('connection', { status: 'error' });
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.emit('connection', { status: 'disconnected' });
        this.attemptReconnect(projectId);
      };
    } catch {
      this.mockMode = true;
      this.simulateConnection(projectId);
    }
  }

  disconnect(): void {
    this.mockTimers.forEach(clearTimeout);
    this.mockTimers = [];

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }

    this.connected = false;
    this.reconnectAttempts = 0;
    this.emit('connection', { status: 'disconnected' });
  }

  send(event: string, payload: Record<string, unknown>): void {
    if (this.mockMode) {
      this.simulateSend(event, payload);
      return;
    }

    if (this.ws && this.connected) {
      this.ws.send(JSON.stringify({ event, payload }));
    }
  }

  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  isConnected(): boolean {
    return this.connected;
  }

  private emit(event: string, data: any): void {
    this.handlers.get(event)?.forEach((handler) => {
      try {
        handler(data);
      } catch {
        // handler error, safe to ignore
      }
    });
  }

  /* ── Mock simulation ──────────────────────────────────────────────── */

  private simulateConnection(projectId: string): void {
    this.connected = true;
    this.reconnectAttempts = 0;

    this.emit('connection', { status: 'connected', projectId });

    const history = MOCK_CHAT_MESSAGES.filter(
      (m) => m.projectId === projectId,
    );

    this.emit('chat_history', { messages: history });

    const wait = 4000 + Math.random() * 3000;
    this.mockTimers.push(
      setTimeout(() => {
        if (!this.connected) return;
        this.simulateIncoming(projectId);
      }, wait),
    );
  }

  private simulateSend(event: string, payload: Record<string, unknown>): void {
    if (event === 'send_message') {
      const msg: ChatMessage = {
        id: `chat_${Date.now()}`,
        projectId: payload.projectId as string,
        senderName: 'You',
        senderInitials: 'YO',
        message: payload.message as string,
        timestamp: new Date().toISOString(),
      };

      this.emit('new_message', { message: msg });

      const delay = 1500 + Math.random() * 2000;
      this.mockTimers.push(
        setTimeout(() => {
          if (!this.connected) return;
          this.simulateIncoming(msg.projectId);
        }, delay),
      );
    }
  }

  private simulateIncoming(projectId: string): void {
    const team = MOCK_RESPONDERS[projectId];
    if (!team) return;

    const randomMember = team[Math.floor(Math.random() * team.length)];
    const initials = randomMember
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    const reply =
      MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];

    const msg: ChatMessage = {
      id: `chat_${Date.now()}`,
      projectId,
      senderName: randomMember,
      senderInitials: initials,
      message: reply,
      timestamp: new Date().toISOString(),
    };

    this.emit('new_message', { message: msg });
  }

  private attemptReconnect(projectId: string): void {
    if (this.reconnectAttempts >= 3) return;
    this.reconnectAttempts++;

    const delay = 2000 * this.reconnectAttempts;
    setTimeout(() => {
      if (!this.connected) {
        this.connect(projectId);
      }
    }, delay);
  }
}

export default new SocketService();
