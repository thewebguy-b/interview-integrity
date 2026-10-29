/// Shared TypeScript types for the event schema.
/// Mirrors the Rust event-schema crate. Keep in sync with crates/event-schema/src/lib.rs.

export const SCHEMA_VERSION = 1 as const;

export type Platform = 'windows' | 'macos' | 'linux' | 'unknown';

export type ObservedValueStatus =
  | 'confirmed'
  | 'unsupported'
  | 'permission_denied'
  | 'unknown';

export type ObservedValue<T> =
  | { status: 'confirmed'; value: T }
  | { status: 'unsupported' }
  | { status: 'permission_denied' }
  | { status: 'unknown' };

export type CaptureAffinity =
  | 'none'
  | 'monitor_only'
  | 'exclude_from_capture'
  | { unrecognized_value: number };

export type CapabilityStatus =
  | 'supported'
  | 'unsupported'
  | 'requires_elevation'
  | 'unknown';

export interface PlatformCapabilities {
  captureAffinityInspection: CapabilityStatus;
  executableHashReading: CapabilityStatus;
  opacityInspection: CapabilityStatus;
  ownerProcessInspection: CapabilityStatus;
  alwaysOnTopInspection: CapabilityStatus;
}

export interface WindowObservation {
  windowId: string;
  processName: ObservedValue<string>;
  executableHash: ObservedValue<string>;
  captureAffinity: ObservedValue<CaptureAffinity>;
  alwaysOnTop: ObservedValue<boolean>;
  opacity: ObservedValue<number>;
  ownerProcessId: ObservedValue<number>;
  isVisible: ObservedValue<boolean>;
  sourceApi: string;
}

export type ScannerErrorType =
  | 'enumeration_failed'
  | 'permission_denied'
  | 'api_unsupported'
  | 'parse_error'
  | 'process_query_failed'
  | 'hash_computation_failed'
  | 'unknown';

export interface ScannerError {
  errorType: ScannerErrorType;
  message: string;
  windowId?: string;
  apiCall?: string;
  osErrorCode?: number;
}

export interface ScanResult {
  schemaVersion: number;
  timestamp: string; // ISO 8601 UTC
  platform: Platform;
  scannerVersion: string;
  observations: WindowObservation[];
  scannerErrors: ScannerError[];
  capabilities: PlatformCapabilities;
}

// ─── Monitoring event types ───────────────────────────────────────────────────

export type MonitoringEventType =
  | 'window_metadata_observed'
  | 'capture_affinity_observed'
  | 'transparency_observed'
  | 'always_on_top_observed'
  | 'scanner_error'
  | 'permission_limited'
  | 'agent_connected'
  | 'agent_disconnected'
  | 'heartbeat_missing'
  | 'session_started'
  | 'session_ended'
  | 'consent_accepted'
  | 'consent_declined';

export type EventSeverity = 'info' | 'low' | 'medium' | 'high' | 'operational';

export interface MonitoringEvent {
  id: string;
  sessionId: string;
  eventType: MonitoringEventType;
  severity: EventSeverity;
  source: 'scanner' | 'agent' | 'backend' | 'system';
  schemaVersion: number;
  eventPayload: Record<string, unknown>;
  occurredAt: string; // ISO 8601 UTC
  receivedAt: string; // ISO 8601 UTC
}

// ─── Session types ────────────────────────────────────────────────────────────

export type SessionStatus =
  | 'created'
  | 'paired'
  | 'monitoring'
  | 'ended'
  | 'expired';

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

// ─── Heartbeat types ──────────────────────────────────────────────────────────

export type HeartbeatComponent = 'agent' | 'scanner' | 'connection';
export type HeartbeatStatus = 'ok' | 'degraded' | 'failed';

export interface SessionHeartbeat {
  id: string;
  sessionId: string;
  component: HeartbeatComponent;
  status: HeartbeatStatus;
  occurredAt: string;
}

// ─── API request/response types ───────────────────────────────────────────────

export interface CreateSessionRequest {
  candidateLabel: string;
}

export interface CreateSessionResponse {
  session: InterviewSession;
  pairingCode: string;
  pairingCodeExpiresAt: string;
}

export interface ValidatePairingRequest {
  code: string;
}

export interface ValidatePairingResponse {
  sessionId: string;
  sessionToken: string;
  expiresAt: string;
}

export interface AgentStartRequest {
  sessionId: string;
  sessionToken: string;
}

export interface AgentHeartbeatRequest {
  sessionId: string;
  sessionToken: string;
  component: HeartbeatComponent;
  status: HeartbeatStatus;
}

export interface AgentEventsRequest {
  sessionId: string;
  sessionToken: string;
  events: Array<{
    eventType: MonitoringEventType;
    severity: EventSeverity;
    eventPayload: Record<string, unknown>;
    occurredAt: string;
  }>;
}

export interface AgentStopRequest {
  sessionId: string;
  sessionToken: string;
}

// ─── WebSocket message types ──────────────────────────────────────────────────

export type WsMessageType =
  | 'session_state'
  | 'event'
  | 'heartbeat'
  | 'alert'
  | 'error';

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
