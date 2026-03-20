/**
 * WebSocket Hook for ForgeLab Real-Time Updates
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

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

export interface WSMessage {
  type: 'blackboard:message' | 'task:update' | 'agent:status' | 'context:updated' | 'human:approval_required';
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
const COMMON_PORTS = ['8000', '8001', '3001', '8080', '5000'];

async function detectBackendUrl(): Promise<string> {
  // Try provided baseUrl first, then common ports
  for (const port of COMMON_PORTS) {
    const url = `ws://localhost:${port}`;
    try {
      const ws = new WebSocket(url);
      await new Promise((resolve, reject) => {
        ws.onopen = () => {
          ws.close();
          resolve(url);
        };
        ws.onerror = () => reject(new Error('Connection failed'));
        setTimeout(() => reject(new Error('Timeout')), 500);
      });
      return url;
    } catch {
      continue;
    }
  }
  return 'ws://localhost:8000'; // Default fallback
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    baseUrl,
    teamId,
    onMessage,
    reconnectAttempts = 5,
    reconnectInterval = 1000,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [detectedUrl, setDetectedUrl] = useState<string>(baseUrl || 'ws://localhost:8000');
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const [blackboardMessages, setBlackboardMessages] = useState<BlackboardMessage[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Connection status label
  const connectionLabel = status === 'connected' ? 'Live' : 
                          status === 'connecting' || status === 'reconnecting' ? 'Connecting...' : 
                          status === 'error' ? 'Error' : 'Offline';

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setStatus('connecting');

    // Auto-detect backend URL on first connection
    const url = baseUrl || await detectBackendUrl();
    setDetectedUrl(url);

    try {
      const ws = new WebSocket(`${url}${teamId ? `/team/${teamId}` : ''}`);

      ws.onopen = () => {
        console.log('[WS] Connected to', url);
        setStatus('connected');
        reconnectCountRef.current = 0;

        // Start heartbeat
        heartbeatTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
          }
        }, 30000); // 30 second heartbeat
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          setLastMessage(message);
          setMessages(prev => [...prev.slice(-49), message]); // Keep last 50 messages
          onMessage?.(message);

          // Handle blackboard messages specifically
          if (message.type === 'blackboard:message') {
            setBlackboardMessages(prev => [...prev, {
              id: message.payload.id || Date.now().toString(),
              agentId: message.payload.agentId,
              agentName: message.payload.agentName,
              content: message.payload.content,
              type: message.payload.type,
              timestamp: message.payload.timestamp || new Date().toISOString(),
            }].slice(-20)); // Keep last 20 blackboard messages
          }
        } catch (error) {
          console.error('[WS] Parse error:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('[WS] Closed:', event.code, event.reason);
        setStatus('disconnected');

        // Clear heartbeat
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
        }

        // Attempt reconnect
        if (reconnectCountRef.current < reconnectAttempts) {
          setStatus('reconnecting');
          reconnectCountRef.current += 1;

          const delay = reconnectInterval * Math.pow(2, reconnectCountRef.current - 1); // Exponential backoff
          console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectCountRef.current}/${reconnectAttempts})`);

          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setStatus('error');
          console.error('[WS] Max reconnect attempts reached');
        }
      };

      ws.onerror = (error) => {
        console.error('[WS] Error:', error);
        setStatus('error');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[WS] Connection error:', error);
      setStatus('error');
    }
  }, [baseUrl, teamId, onMessage, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    // Clear timers
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }

    setStatus('disconnected');
  }, []);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = { type, payload, timestamp: new Date().toISOString() };
      wsRef.current.send(JSON.stringify(message));
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
    // Apply update immediately
    const result = updateFn();

    // Try to send to server
    const sent = sendMessage(message.type, message.payload);

    // If send failed, rollback after timeout
    if (!sent) {
      setTimeout(() => {
        rollbackFn(result);
      }, 1000);
    }

    return result;
  }, [sendMessage]);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Reconnect when teamId changes
  useEffect(() => {
    if (teamId) {
      disconnect();
      connect();
    }
  }, [teamId]);

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
