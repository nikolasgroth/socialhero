import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { WS_URL } from '../config';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const pingTimer = useRef(null);
  const listenersRef = useRef(new Map());

  const connect = useCallback(() => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(`${WS_URL}/ws?token=${token}`);

      ws.onopen = () => {
        setConnected(true);
        // Start ping interval
        pingTimer.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);

          // Notify all listeners for this message type
          const typeListeners = listenersRef.current.get(data.type) || [];
          typeListeners.forEach((cb) => cb(data.payload));
        } catch {}
      };

      ws.onclose = () => {
        setConnected(false);
        if (pingTimer.current) clearInterval(pingTimer.current);
        // Auto-reconnect after 3 seconds
        if (isAuthenticated) {
          reconnectTimer.current = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch {}
  }, [token, isAuthenticated]);

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      connect();
    }
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (pingTimer.current) clearInterval(pingTimer.current);
    };
  }, [isAuthenticated, token, connect]);

  const send = useCallback((type, payload = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  const subscribe = useCallback((type, callback) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, []);
    }
    listenersRef.current.get(type).push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = listenersRef.current.get(type) || [];
      listenersRef.current.set(type, listeners.filter((cb) => cb !== callback));
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ connected, lastMessage, send, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within WebSocketProvider');
  return ctx;
}
