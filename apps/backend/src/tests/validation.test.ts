import { describe, it, expect } from 'vitest';
import {
  CreateSessionSchema,
  ValidatePairingSchema,
  AgentEventsSchema,
  ScanResultSchema,
} from '../types/validation.js';

describe('CreateSessionSchema', () => {
  it('accepts valid candidate label', () => {
    const r = CreateSessionSchema.safeParse({ candidateLabel: 'Alice B.' });
    expect(r.success).toBe(true);
  });

  it('rejects empty label', () => {
    const r = CreateSessionSchema.safeParse({ candidateLabel: '' });
    expect(r.success).toBe(false);
  });

  it('rejects label over 256 chars', () => {
    const r = CreateSessionSchema.safeParse({ candidateLabel: 'a'.repeat(257) });
    expect(r.success).toBe(false);
  });
});

describe('ValidatePairingSchema', () => {
  it('accepts 8-char uppercase code', () => {
    const r = ValidatePairingSchema.safeParse({ code: 'ABC23456' });
    expect(r.success).toBe(true);
  });

  it('rejects lowercase', () => {
    const r = ValidatePairingSchema.safeParse({ code: 'abc23456' });
    expect(r.success).toBe(false);
  });

  it('rejects wrong length', () => {
    const r = ValidatePairingSchema.safeParse({ code: 'ABCD' });
    expect(r.success).toBe(false);
  });

  it('rejects special chars', () => {
    const r = ValidatePairingSchema.safeParse({ code: 'ABC!@#$%' });
    expect(r.success).toBe(false);
  });
});

describe('AgentEventsSchema', () => {
  const base = {
    sessionId: '00000000-0000-0000-0000-000000000001',
    sessionToken: 'a'.repeat(64),
    events: [
      {
        eventType: 'window_metadata_observed',
        severity: 'info',
        eventPayload: { windowId: 'hwnd-1' },
        occurredAt: new Date().toISOString(),
      },
    ],
  };

  it('accepts valid batch', () => {
    const r = AgentEventsSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it('rejects empty events array', () => {
    const r = AgentEventsSchema.safeParse({ ...base, events: [] });
    expect(r.success).toBe(false);
  });

  it('rejects oversized payload', () => {
    const r = AgentEventsSchema.safeParse({
      ...base,
      events: [
        {
          ...base.events[0],
          eventPayload: { data: 'x'.repeat(70000) }, // > 64KB
        },
      ],
    });
    expect(r.success).toBe(false);
  });

  it('rejects unknown event type', () => {
    const r = AgentEventsSchema.safeParse({
      ...base,
      events: [{ ...base.events[0], eventType: 'spooky_event' }],
    });
    expect(r.success).toBe(false);
  });
});

describe('ScanResultSchema', () => {
  const validResult = {
    schemaVersion: 1,
    timestamp: new Date().toISOString(),
    platform: 'windows',
    scannerVersion: '0.1.0',
    observations: [],
    scannerErrors: [],
    capabilities: {
      captureAffinityInspection: 'requires_elevation',
      executableHashReading: 'requires_elevation',
      opacityInspection: 'unsupported',
      ownerProcessInspection: 'supported',
      alwaysOnTopInspection: 'supported',
    },
  };

  it('accepts valid scan result', () => {
    const r = ScanResultSchema.safeParse(validResult);
    expect(r.success).toBe(true);
  });

  it('rejects wrong schema version', () => {
    const r = ScanResultSchema.safeParse({ ...validResult, schemaVersion: 2 });
    expect(r.success).toBe(false);
  });

  it('rejects oversized observation array', () => {
    const obs = {
      windowId: 'hwnd-1',
      processName: { status: 'confirmed', value: 'test.exe' },
      executableHash: { status: 'unsupported' },
      captureAffinity: { status: 'confirmed', value: 'none' },
      alwaysOnTop: { status: 'confirmed', value: false },
      opacity: { status: 'unsupported' },
      ownerProcessId: { status: 'confirmed', value: 1234 },
      isVisible: { status: 'confirmed', value: true },
      sourceApi: 'EnumWindows',
    };
    const r = ScanResultSchema.safeParse({
      ...validResult,
      observations: Array(1001).fill(obs),
    });
    expect(r.success).toBe(false);
  });

  it('requires captureAffinity to be a known status', () => {
    const r = ScanResultSchema.safeParse({
      ...validResult,
      capabilities: { ...validResult.capabilities, captureAffinityInspection: 'unknown_value' },
    });
    expect(r.success).toBe(false);
  });
});
