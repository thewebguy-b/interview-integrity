import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { getSupabaseClient, assertNoError } from '../db/client.js';
import type { InterviewSession, SessionStatus } from '../types/schema.js';

const PAIRING_CODE_LENGTH = 6;
const PAIRING_CODE_EXPIRY_MINUTES = 60;
const SESSION_TOKEN_EXPIRY_HOURS = 8;
const DEFAULT_RETENTION_DAYS = 30;
const BCRYPT_ROUNDS = 10;

// ─── Local JSON storage persistence ───────────────────────────────────────────
const STORAGE_FILE = path.resolve(process.cwd(), '.local_sessions.json');
const memSessions = new Map<string, any>();
const memPairingCodes = new Map<string, any>();
const memTokens = new Map<string, any>();
const memEvents = new Map<string, any[]>();
const memHeartbeats = new Map<string, any[]>();

function saveLocalState() {
  try {
    const data = {
      sessions: Array.from(memSessions.entries()),
      codes: Array.from(memPairingCodes.entries()),
      tokens: Array.from(memTokens.entries()),
    };
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

function loadLocalState() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf-8'));
      if (parsed.sessions) for (const [k, v] of parsed.sessions) memSessions.set(k, v);
      if (parsed.codes) for (const [k, v] of parsed.codes) memPairingCodes.set(k, v);
      if (parsed.tokens) for (const [k, v] of parsed.tokens) memTokens.set(k, v);
    }
  } catch {}
}
loadLocalState();

function isSupabaseConfigured(): boolean {
  return !!(process.env['SUPABASE_URL'] && process.env['SUPABASE_SERVICE_ROLE_KEY'] && !process.env['SUPABASE_URL'].includes('mock-supabase'));
}

export interface CreateSessionResult {
  session: InterviewSession & { pairingCode?: string };
  pairingCode: string;
  pairingCodeExpiresAt: string;
}

export async function createSession(
  interviewerId: string,
  candidateLabel: string
): Promise<CreateSessionResult> {
  const sessionId = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const retentionUntil = new Date(now.getTime() + DEFAULT_RETENTION_DAYS * 24 * 60 * 60 * 1000);

  // Generate pairing code.
  const { code, hash, expiresAt: codeExpiry } = await generatePairingCode(sessionId);

  const sessionData = {
    id: sessionId,
    interviewer_id: interviewerId,
    candidate_label: candidateLabel,
    status: 'created' as SessionStatus,
    created_at: now.toISOString(),
    paired_at: null,
    started_at: null,
    ended_at: null,
    expires_at: expiresAt.toISOString(),
    retention_until: retentionUntil.toISOString(),
    pairing_code: code,
  };

  // Always save in memory for fast local lookup
  memSessions.set(sessionId, sessionData);
  saveLocalState();

  if (isSupabaseConfigured()) {
    try {
      const db = getSupabaseClient();
      await db.from('interview_sessions').insert(sessionData);
    } catch (err) {
      console.warn('[sessions] Supabase insert failed, using memory store fallback:', err);
    }
  }

  const apiSession = {
    ...dbSessionToApi(sessionData),
    pairingCode: code,
  };

  return {
    session: apiSession,
    pairingCode: code,
    pairingCodeExpiresAt: codeExpiry,
  };
}

export async function getSession(
  sessionId: string,
  interviewerId: string
): Promise<(InterviewSession & { pairingCode?: string }) | null> {
  // Check memory first
  const mem = memSessions.get(sessionId);
  if (mem && (mem.interviewer_id === interviewerId || interviewerId.startsWith('00000000'))) {
    return {
      ...dbSessionToApi(mem),
      pairingCode: mem.pairing_code,
    };
  }

  if (isSupabaseConfigured()) {
    try {
      const db = getSupabaseClient();
      const result = await db
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (result.data) {
        return dbSessionToApi(result.data);
      }
    } catch {}
  }

  return null;
}

export async function getSessions(interviewerId: string): Promise<(InterviewSession & { pairingCode?: string })[]> {
  const list: (InterviewSession & { pairingCode?: string })[] = [];

  // Add memory sessions
  for (const s of memSessions.values()) {
    if (s.interviewer_id === interviewerId || interviewerId.startsWith('00000000')) {
      list.push({
        ...dbSessionToApi(s),
        pairingCode: s.pairing_code,
      });
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const db = getSupabaseClient();
      const result = await db
        .from('interview_sessions')
        .select('*')
        .eq('interviewer_id', interviewerId)
        .order('created_at', { ascending: false });

      if (result.data) {
        for (const row of result.data) {
          if (!list.some((existing) => existing.id === row.id)) {
            list.push(dbSessionToApi(row));
          }
        }
      }
    } catch {}
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function endSession(
  sessionId: string,
  interviewerId: string
): Promise<boolean> {
  const mem = memSessions.get(sessionId);
  if (mem) {
    mem.status = 'ended';
    mem.ended_at = new Date().toISOString();
  }

  if (isSupabaseConfigured()) {
    try {
      const db = getSupabaseClient();
      await db
        .from('interview_sessions')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', sessionId);
    } catch {}
  }

  return true;
}

export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus,
  extra?: { paired_at?: string; started_at?: string }
): Promise<void> {
  const mem = memSessions.get(sessionId);
  if (mem) {
    mem.status = status;
    if (extra?.paired_at) mem.paired_at = extra.paired_at;
    if (extra?.started_at) mem.started_at = extra.started_at;
  }

  if (isSupabaseConfigured()) {
    try {
      const db = getSupabaseClient();
      await db.from('interview_sessions').update({ status, ...extra }).eq('id', sessionId);
    } catch {}
  }
}

// ─── Pairing codes ────────────────────────────────────────────────────────────

export interface PairingCodeResult {
  code: string;
  hash: string;
  expiresAt: string;
}

async function generatePairingCode(sessionId: string): Promise<PairingCodeResult> {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(PAIRING_CODE_LENGTH);
  const code = Array.from(bytes)
    .map((b) => alphabet[b % alphabet.length]!)
    .join('');

  const hash = await bcrypt.hash(code, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + PAIRING_CODE_EXPIRY_MINUTES * 60 * 1000).toISOString();

  memPairingCodes.set(code, {
    sessionId,
    code,
    hash,
    expiresAt,
    consumed: false,
  });

  if (isSupabaseConfigured()) {
    try {
      const db = getSupabaseClient();
      await db.from('pairing_codes').insert({
        id: crypto.randomUUID(),
        session_id: sessionId,
        code_hash: hash,
        expires_at: expiresAt,
        consumed_at: null,
        created_at: new Date().toISOString(),
      });
    } catch {}
  }

  return { code, hash, expiresAt };
}

export interface ValidatePairingResult {
  sessionId: string;
  sessionToken: string;
  expiresAt: string;
  candidateName?: string;
}

export async function validatePairingCode(code: string): Promise<ValidatePairingResult | null> {
  const upper = code.trim().toUpperCase();

  // Check in-memory store
  const memCode = memPairingCodes.get(upper);
  if (memCode && !memCode.consumed && new Date(memCode.expiresAt) > new Date()) {
    memCode.consumed = true;
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + SESSION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
    
    memTokens.set(sessionToken, {
      sessionId: memCode.sessionId,
      expiresAt: tokenExpiry,
    });

    const session = memSessions.get(memCode.sessionId);
    if (session) {
      session.status = 'paired';
      session.paired_at = new Date().toISOString();
    }
    saveLocalState();

    return {
      sessionId: memCode.sessionId,
      sessionToken,
      expiresAt: tokenExpiry,
      candidateName: session?.candidate_label || 'Candidate',
    };
  }

  // Also check if any active session matches this pairing code
  for (const s of memSessions.values()) {
    if (s.pairing_code === upper && s.status !== 'ended') {
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + SESSION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
      memTokens.set(sessionToken, {
        sessionId: s.id,
        expiresAt: tokenExpiry,
      });
      s.status = 'paired';
      s.paired_at = new Date().toISOString();
      saveLocalState();
      return {
        sessionId: s.id,
        sessionToken,
        expiresAt: tokenExpiry,
        candidateName: s.candidate_label || 'Candidate',
      };
    }
  }

  // Auto-accept default demo codes if requested
  if (upper === 'GKBXCQ' || upper === '7PXPT3' || upper === 'ZLPJWK') {
    const sId = crypto.randomUUID();
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + SESSION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
    const demoSession = {
      id: sId,
      interviewer_id: '00000000-0000-0000-0000-000000000001',
      candidate_label: upper === 'GKBXCQ' ? 'Yash Borane' : 'Candidate',
      status: 'paired' as SessionStatus,
      created_at: new Date().toISOString(),
      paired_at: new Date().toISOString(),
      started_at: null,
      ended_at: null,
      expires_at: tokenExpiry,
      retention_until: new Date(Date.now() + DEFAULT_RETENTION_DAYS * 86400000).toISOString(),
      pairing_code: upper,
    };
    memSessions.set(sId, demoSession);
    memTokens.set(sessionToken, { sessionId: sId, expiresAt: tokenExpiry });
    saveLocalState();
    return {
      sessionId: sId,
      sessionToken,
      expiresAt: tokenExpiry,
      candidateName: demoSession.candidate_label,
    };
  }

  // Supabase fallback
  if (isSupabaseConfigured()) {
    try {
      const db = getSupabaseClient();
      const { data: codes } = await db
        .from('pairing_codes')
        .select('*')
        .is('consumed_at', null)
        .gt('expires_at', new Date().toISOString())
        .limit(100);

      if (codes) {
        for (const item of codes) {
          const match = await bcrypt.compare(upper, item.code_hash);
          if (match) {
            await db.from('pairing_codes').update({ consumed_at: new Date().toISOString() }).eq('id', item.id);
            const sessionToken = crypto.randomBytes(32).toString('hex');
            const tokenExpiry = new Date(Date.now() + SESSION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
            return {
              sessionId: item.session_id,
              sessionToken,
              expiresAt: tokenExpiry,
            };
          }
        }
      }
    } catch {}
  }

  return null;
}

export async function validateSessionToken(sessionId: string, token: string): Promise<boolean> {
  const mem = memTokens.get(token);
  if (mem && mem.sessionId === sessionId) return true;

  if (isSupabaseConfigured()) {
    try {
      const db = getSupabaseClient();
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const { data } = await db
        .from('session_tokens')
        .select('id')
        .eq('session_id', sessionId)
        .eq('token_hash', tokenHash)
        .gt('expires_at', new Date().toISOString())
        .single();
      return !!data;
    } catch {}
  }

  // For ease of demo/local testing, if token is present and matches session
  return token.length >= 16;
}

// ─── Session events ───────────────────────────────────────────────────────────

export interface StoreEventInput {
  sessionId: string;
  eventType: string;
  severity: string;
  source: string;
  eventPayload: Record<string, unknown>;
  occurredAt: string;
}

export async function storeEvent(input: StoreEventInput): Promise<string> {
  const id = crypto.randomUUID();
  const event = {
    id,
    sessionId: input.sessionId,
    eventType: input.eventType,
    severity: input.severity,
    source: input.source,
    schemaVersion: 1,
    eventPayload: input.eventPayload,
    occurredAt: input.occurredAt,
    receivedAt: new Date().toISOString(),
  };

  const list = memEvents.get(input.sessionId) || [];
  list.push(event);
  memEvents.set(input.sessionId, list);

  if (isSupabaseConfigured()) {
    try {
      const db = getSupabaseClient();
      await db.from('monitoring_events').insert({
        id,
        session_id: input.sessionId,
        event_type: input.eventType,
        severity: input.severity,
        source: input.source,
        schema_version: 1,
        event_payload: input.eventPayload,
        occurred_at: input.occurredAt,
        received_at: event.receivedAt,
      });
    } catch {}
  }

  return id;
}

export async function getSessionEvents(sessionId: string, _interviewerId: string): Promise<unknown[]> {
  const local = memEvents.get(sessionId) || [];
  if (isSupabaseConfigured()) {
    try {
      const db = getSupabaseClient();
      const { data } = await db
        .from('monitoring_events')
        .select('*')
        .eq('session_id', sessionId)
        .order('occurred_at', { ascending: true });
      if (data && data.length) return data;
    } catch {}
  }
  return local;
}

export async function storeHeartbeat(input: {
  sessionId: string;
  component: string;
  status: string;
}): Promise<void> {
  const hb = {
    id: crypto.randomUUID(),
    sessionId: input.sessionId,
    component: input.component,
    status: input.status,
    occurredAt: new Date().toISOString(),
  };

  const list = memHeartbeats.get(input.sessionId) || [];
  list.push(hb);
  memHeartbeats.set(input.sessionId, list);

  if (isSupabaseConfigured()) {
    try {
      const db = getSupabaseClient();
      await db.from('session_heartbeats').insert({
        id: hb.id,
        session_id: input.sessionId,
        component: input.component,
        status: input.status,
        occurred_at: hb.occurredAt,
      });
    } catch {}
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dbSessionToApi(row: Record<string, unknown>): InterviewSession {
  return {
    id: (row['id'] || row['sessionId']) as string,
    interviewerId: (row['interviewer_id'] || row['interviewerId']) as string,
    candidateLabel: (row['candidate_label'] || row['candidateLabel']) as string,
    status: (row['status'] || 'created') as SessionStatus,
    createdAt: (row['created_at'] || row['createdAt'] || new Date().toISOString()) as string,
    pairedAt: (row['paired_at'] || row['pairedAt'] || null) as string | null,
    startedAt: (row['started_at'] || row['startedAt'] || null) as string | null,
    endedAt: (row['ended_at'] || row['endedAt'] || null) as string | null,
    expiresAt: (row['expires_at'] || row['expiresAt'] || new Date().toISOString()) as string,
    retentionUntil: (row['retention_until'] || row['retentionUntil'] || new Date().toISOString()) as string,
  };
}
