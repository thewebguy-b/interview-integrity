import { z } from 'zod';

// ─── Observed value schemas ───────────────────────────────────────────────────

const ObservedValueSchema = <T extends z.ZodTypeAny>(inner: T) =>
  z.discriminatedUnion('status', [
    z.object({ status: z.literal('confirmed'), value: inner }),
    z.object({ status: z.literal('unsupported') }),
    z.object({ status: z.literal('permission_denied') }),
    z.object({ status: z.literal('unknown') }),
  ]);

// ─── Window observation schema ────────────────────────────────────────────────

export const WindowObservationSchema = z.object({
  windowId: z.string().min(1).max(256),
  processName: ObservedValueSchema(z.string().max(512)),
  executableHash: ObservedValueSchema(z.string().max(128)),
  captureAffinity: ObservedValueSchema(
    z.union([
      z.literal('none'),
      z.literal('monitor_only'),
      z.literal('exclude_from_capture'),
      z.object({ unrecognized_value: z.number().int() }),
    ])
  ),
  alwaysOnTop: ObservedValueSchema(z.boolean()),
  opacity: ObservedValueSchema(z.number().min(0).max(1)),
  ownerProcessId: ObservedValueSchema(z.number().int().nonnegative()),
  isVisible: ObservedValueSchema(z.boolean()),
  sourceApi: z.string().max(256),
});

export type WindowObservationInput = z.infer<typeof WindowObservationSchema>;

// ─── Scanner error schema ─────────────────────────────────────────────────────

export const ScannerErrorSchema = z.object({
  errorType: z.enum([
    'enumeration_failed',
    'permission_denied',
    'api_unsupported',
    'parse_error',
    'process_query_failed',
    'hash_computation_failed',
    'unknown',
  ]),
  message: z.string().max(2048),
  windowId: z.string().max(256).optional(),
  apiCall: z.string().max(256).optional(),
  osErrorCode: z.number().int().optional(),
});

// ─── Scan result schema ───────────────────────────────────────────────────────

export const ScanResultSchema = z
  .object({
    schemaVersion: z.literal(1),
    timestamp: z.string().datetime(),
    platform: z.enum(['windows', 'macos', 'linux', 'unknown']),
    scannerVersion: z.string().max(32),
    observations: z.array(WindowObservationSchema).max(1000),
    scannerErrors: z.array(ScannerErrorSchema).max(100),
    capabilities: z.object({
      captureAffinityInspection: z.enum([
        'supported',
        'unsupported',
        'requires_elevation',
        'unknown',
      ]),
      executableHashReading: z.enum([
        'supported',
        'unsupported',
        'requires_elevation',
        'unknown',
      ]),
      opacityInspection: z.enum([
        'supported',
        'unsupported',
        'requires_elevation',
        'unknown',
      ]),
      ownerProcessInspection: z.enum([
        'supported',
        'unsupported',
        'requires_elevation',
        'unknown',
      ]),
      alwaysOnTopInspection: z.enum([
        'supported',
        'unsupported',
        'requires_elevation',
        'unknown',
      ]),
    }),
  })
  .strict();

export type ScanResultInput = z.infer<typeof ScanResultSchema>;

// ─── API request schemas ──────────────────────────────────────────────────────

export const CreateSessionSchema = z.object({
  candidateLabel: z.string().min(1).max(256).trim(),
});

export const ValidatePairingSchema = z.object({
  code: z
    .string()
    .min(6)
    .max(8)
    .regex(/^[A-Z0-9]+$/, 'Code must be uppercase alphanumeric'),
});

export const AgentAuthSchema = z.object({
  sessionId: z.string().min(1).max(256),
  sessionToken: z.string().min(16).max(256),
});

export const AgentHeartbeatSchema = AgentAuthSchema.extend({
  component: z.enum(['agent', 'scanner', 'connection']).default('agent'),
  status: z.enum(['ok', 'degraded', 'failed']).default('ok'),
});

export const AgentEventSchema = z.object({
  eventType: z.string().min(1).max(128).default('window_metadata_observed'),
  severity: z.enum(['info', 'low', 'medium', 'high', 'operational']).default('info'),
  eventPayload: z.record(z.unknown()).default({}),
  occurredAt: z.string().default(() => new Date().toISOString()),
});

export const AgentEventsSchema = AgentAuthSchema.extend({
  events: z.array(z.record(z.unknown())).min(1).max(50),
});

export const AgentStopSchema = AgentAuthSchema;

export const EndSessionSchema = z.object({
  sessionId: z.string().uuid(),
});

// ─── WebSocket auth schema ────────────────────────────────────────────────────

export const WsAuthSchema = z.object({
  type: z.literal('auth'),
  token: z.string().min(1), // Supabase JWT
});

export const WsSubscribeSchema = z.object({
  type: z.literal('subscribe'),
  sessionId: z.string().uuid(),
});

export const WsMessageInSchema = z.discriminatedUnion('type', [
  WsAuthSchema,
  WsSubscribeSchema,
]);
