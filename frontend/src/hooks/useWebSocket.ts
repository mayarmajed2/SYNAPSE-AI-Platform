import { useEffect, useRef, useState, useCallback } from "react";
import { isDemoMode } from "../services/demoData";

export interface WSEvent {
  event: string;
  project_id?: string;
  data: any;
}

export function useWebSocket(projectId?: string, onEvent?: (event: WSEvent) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WSEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalCloseRef = useRef(false);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const connect = useCallback(() => {
    if (isDemoMode()) {
      setIsConnected(true);
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const channel = projectId ? `projects/${projectId}` : "global";
    const wsOrigin = import.meta.env.VITE_WS_ORIGIN || "ws://127.0.0.1:8000";
    const url = `${wsOrigin}/ws/${channel}`;

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
        } catch {
          // ignore non-JSON messages (e.g. pong)
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        if (intentionalCloseRef.current) return;
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            if (!intentionalCloseRef.current) {
              connect();
            }
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
    intentionalCloseRef.current = false;
    connect();
    return () => {
      intentionalCloseRef.current = true;
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
