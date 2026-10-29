import { useState, useEffect, useRef, useCallback } from 'react';
import type { WsMessage, WsSessionState, MonitoringEvent, SessionHeartbeat } from '../types/schema.js';

const HEARTBEAT_TIMEOUT_MS = 30000; // 30s

interface UseSessionWsResult {
  connected: boolean;
  sessionState: WsSessionState | null;
  liveEvents: MonitoringEvent[];
  liveHeartbeats: SessionHeartbeat[];
  agentOfflineAlert: boolean;
  subscribe: (sessionId: string, token: string) => void;
  disconnect: () => void;
}

export function useSessionWs(backendUrl: string): UseSessionWsResult {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [connected, setConnected] = useState(false);
  const [sessionState, setSessionState] = useState<WsSessionState | null>(null);
  const [liveEvents, setLiveEvents] = useState<MonitoringEvent[]>([]);
  const [liveHeartbeats, setLiveHeartbeats] = useState<SessionHeartbeat[]>([]);
  const [agentOfflineAlert, setAgentOfflineAlert] = useState(false);

  const resetHeartbeatTimer = useCallback(() => {
    if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
    setAgentOfflineAlert(false);
    heartbeatTimerRef.current = setTimeout(() => {
      setAgentOfflineAlert(true);
    }, HEARTBEAT_TIMEOUT_MS);
  }, []);

  const subscribe = useCallback((sessionId: string, token: string) => {
    if (wsRef.current) wsRef.current.close();

    const wsUrl = backendUrl.replace(/^http/, 'ws') + '/api/ws';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = (e: MessageEvent) => {
      let msg: WsMessage;
      try { msg = JSON.parse(e.data as string); }
      catch { return; }

      switch (msg.type) {
        case 'auth_ok':
          ws.send(JSON.stringify({ type: 'subscribe', sessionId }));
          break;

        case 'session_state': {
          const state = msg.payload as WsSessionState;
          setSessionState(state);
          setLiveEvents(state.events ?? []);
          setLiveHeartbeats(state.heartbeats ?? []);
          resetHeartbeatTimer();
          break;
        }

        case 'event': {
          const event = msg.payload as MonitoringEvent;
          setLiveEvents((prev) => [...prev, event]);
          if (event.eventType === 'agent_disconnected') {
            setAgentOfflineAlert(true);
          }
          break;
        }

        case 'heartbeat': {
          const hb = msg.payload as SessionHeartbeat;
          setLiveHeartbeats((prev) => [hb, ...prev.slice(0, 49)]);
          resetHeartbeatTimer();
          break;
        }

        case 'alert':
          setAgentOfflineAlert(true);
          break;
      }
    };

    ws.onclose = () => {
      setConnected(false);
      // Attempt reconnect after 5s.
      reconnectTimerRef.current = setTimeout(() => {
        subscribe(sessionId, token);
      }, 5000);
    };

    ws.onerror = () => {
      setConnected(false);
    };
  }, [backendUrl, resetHeartbeatTimer]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
    setAgentOfflineAlert(false);
  }, []);

  useEffect(() => () => disconnect(), [disconnect]);

  return { connected, sessionState, liveEvents, liveHeartbeats, agentOfflineAlert, subscribe, disconnect };
}
