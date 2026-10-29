/// Shared TypeScript types for the dashboard (mirrors backend schema types).

export const SCHEMA_VERSION = 1 as const;

export type SessionStatus = 'created' | 'paired' | 'monitoring' | 'ended' | 'expired';
export type EventSeverity = 'info' | 'low' | 'medium' | 'high' | 'operational';
export type HeartbeatStatus = 'ok' | 'degraded' | 'failed';
export type HeartbeatComponent = 'agent' | 'scanner' | 'connection';
export type WsMessageType = 'session_state' | 'event' | 'heartbeat' | 'alert' | 'error' | 'auth_ok';

export interface InterviewSession {
  id: string;
  interviewerId: string;
  candidateLabel: string;
  status: SessionStatus;
  createdAt: string;
  pairedAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  expiresAt: string;
  retentionUntil: string;
}

export interface MonitoringEvent {
  id: string;
  sessionId: string;
  eventType: string;
  severity: EventSeverity;
  source: string;
  schemaVersion: number;
  eventPayload: Record<string, unknown>;
  occurredAt: string;
  receivedAt: string;
}

export interface SessionHeartbeat {
  id: string;
  sessionId: string;
  component: HeartbeatComponent;
  status: HeartbeatStatus;
  occurredAt: string;
}

export interface WsMessage {
  type: WsMessageType;
  payload: unknown;
}

export interface WsSessionState {
  session: InterviewSession;
  events: MonitoringEvent[];
  heartbeats: SessionHeartbeat[];
  agentConnected: boolean;
  scannerHealth: HeartbeatStatus;
}
