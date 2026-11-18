import { useEffect, useRef, useState, useCallback } from "react";

export interface WSEvent {
  event: string;
  project_id?: string;
  data: any;
}

export function useWebSocket(projectId?: string, onEvent?: (event: WSEvent) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WSEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const connect = useCallback(() => {
    // Clear any pending reconnect timer
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const channel = projectId ? `projects/${projectId}` : "global";
    const url = `ws://127.0.0.1:8000/ws/${channel}`;

    try {
      const socket = new WebSocket(url);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const parsed: WSEvent = JSON.parse(event.data);
          setLastEvent(parsed);
          if (onEventRef.current) {
            onEventRef.current(parsed);
          }
        } catch (e) {
          // ignore non-json messages (e.g. pong)
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        // Automatic reconnection after 3 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connect();
          }, 3000);
        }
      };

      socket.onerror = () => {
        socket.close();
      };
    } catch (err) {
      console.error("WebSocket connection error:", err);
    }
  }, [projectId]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { isConnected, lastEvent };
}

