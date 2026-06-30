import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import socketService from '../services/SocketService';
import { ChatMessage } from '../api/interfaces/ProjectTypes';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface SocketContextType {
  status: ConnectionStatus;
  messages: ChatMessage[];
  sendMessage: (projectId: string, message: string) => void;
  joinProject: (projectId: string) => void;
  leaveProject: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const currentProject = useRef<string | null>(null);

  const joinProject = useCallback((projectId: string) => {
    currentProject.current = projectId;
    setMessages([]);
    setStatus('connecting');
    socketService.connect(projectId);
  }, []);

  const leaveProject = useCallback(() => {
    currentProject.current = null;
    setMessages([]);
    socketService.disconnect();
    setStatus('disconnected');
  }, []);

  const sendMessage = useCallback((projectId: string, message: string) => {
    socketService.send('send_message', { projectId, message });
  }, []);

  useEffect(() => {
    const onConnection = (data: { status: string }) => {
      if (data.status === 'connected') {
        setStatus('connected');
      } else if (data.status === 'disconnected' || data.status === 'error') {
        setStatus('disconnected');
      }
    };

    const onChatHistory = (data: { messages: ChatMessage[] }) => {
      setMessages(data.messages);
    };

    const onNewMessage = (data: { message: ChatMessage }) => {
      setMessages((prev) => [...prev, data.message]);
    };

    socketService.on('connection', onConnection);
    socketService.on('chat_history', onChatHistory);
    socketService.on('new_message', onNewMessage);

    return () => {
      socketService.off('connection', onConnection);
      socketService.off('chat_history', onChatHistory);
      socketService.off('new_message', onNewMessage);
      socketService.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{ status, messages, sendMessage, joinProject, leaveProject }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};

export default SocketContext;
