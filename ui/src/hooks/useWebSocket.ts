/**
 * WebSocket Hook for ForgeLab Real-Time Updates (using Socket.IO)
 *
 * Features:
 * - Auto-detect backend URL (tries common ports)
 * - Auto-reconnect with exponential backoff
 * - Connection status tracking
 * - Message type handling
 * - Optimistic updates
 * - Error recovery
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

export interface WSMessage {
  type: string;
  payload: any;
  timestamp: string;
}

export interface BlackboardMessage {
  id: string;
  agentId: string;
  agentName: string;
  content: string;
  type: 'proposal' | 'review' | 'handoff' | 'decision';
  timestamp: string;
}

interface UseWebSocketOptions {
  baseUrl?: string;
  teamId?: string;
  onMessage?: (message: WSMessage) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

// Common backend ports to try
const COMMON_PORTS = ['3001', '8000', '8001', '8080', '5000'];

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    baseUrl,
    teamId,
    onMessage,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [detectedUrl, setDetectedUrl] = useState<string>(baseUrl || 'http://localhost:3001');
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const [blackboardMessages, setBlackboardMessages] = useState<BlackboardMessage[]>([]);

  const socketRef = useRef<Socket | null>(null);

  // Connection status label
  const connectionLabel = status === 'connected' ? 'Live' :
                          status === 'connecting' || status === 'reconnecting' ? 'Connecting...' :
                          status === 'error' ? 'Error' : 'Offline';

  const connect = useCallback(async () => {
    if (socketRef.current?.connected) {
      return;
    }

    setStatus('connecting');

    // Use default or provided URL
    const url = baseUrl || 'http://localhost:3001';
    setDetectedUrl(url);

    try {
      const socket = io(url, {
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      socket.on('connect', () => {
        console.log('[WS] Connected to', url, 'ID:', socket.id);
        setStatus('connected');
      });

      socket.on('disconnect', (reason) => {
        console.log('[WS] Disconnected:', reason);
        setStatus('disconnected');
        if (reason === 'io server disconnect') {
          // the disconnection was initiated by the server, you need to reconnect manually
          socket.connect();
        }
      });

      socket.on('connect_error', (error) => {
        console.error('[WS] Connection error:', error);
        setStatus('error');
      });

      // Listen for all events (Socket.IO doesn't have a catch-all listener by default in v4, but we can emit specific events)
      // For ForgeLab, we use specific events like 'transcript', 'run:status', etc.
      
      const handleGenericMessage = (type: string, payload: any) => {
        const message: WSMessage = {
          type,
          payload,
          timestamp: new Date().toISOString()
        };
        setLastMessage(message);
        setMessages(prev => [...prev.slice(-49), message]);
        onMessage?.(message);

        // Handle blackboard messages specifically
        if (type === 'blackboard:message') {
          setBlackboardMessages(prev => [...prev, {
            id: payload.id || Date.now().toString(),
            agentId: payload.agentId,
            agentName: payload.agentName,
            content: payload.content,
            type: payload.type,
            timestamp: payload.timestamp || new Date().toISOString(),
          }].slice(-20));
        }
      };

      // Register specific listeners
      socket.on('transcript', (data) => handleGenericMessage('transcript', data));
      socket.on('run:status', (data) => handleGenericMessage('run:status', data));
      socket.on('blackboard:message', (data) => handleGenericMessage('blackboard:message', data));
      socket.on('human:approval_required', (data) => handleGenericMessage('human:approval_required', data));

      socketRef.current = socket;
    } catch (error) {
      console.error('[WS] Setup error:', error);
      setStatus('error');
    }
  }, [baseUrl, onMessage]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  const sendMessage = useCallback((event: string, payload: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, payload);
      return true;
    }
    console.warn('[WS] Cannot send message - not connected');
    return false;
  }, []);

  // Optimistic update helper
  const optimisticUpdate = useCallback(<T,>(
    updateFn: () => T,
    rollbackFn: (value: T) => void,
    message: { type: string; payload: any }
  ) => {
    const result = updateFn();
    const sent = sendMessage(message.type, message.payload);
    if (!sent) {
      setTimeout(() => rollbackFn(result), 1000);
    }
    return result;
  }, [sendMessage]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    // State
    status,
    connectionLabel,
    detectedUrl,
    lastMessage,
    messages,
    blackboardMessages,

    // Actions
    connect,
    disconnect,
    sendMessage,
    optimisticUpdate,

    // Helpers
    isConnected: status === 'connected',
    isConnecting: status === 'connecting' || status === 'reconnecting',
    isError: status === 'error',
  };
}

