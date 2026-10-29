import type { FastifyInstance } from 'fastify';
import {
  validateSessionToken,
  updateSessionStatus,
  storeEvent,
  storeHeartbeat,
  getSession,
} from '../services/sessions.js';
import {
  AgentAuthSchema,
  AgentEventsSchema,
  AgentHeartbeatSchema,
  AgentStopSchema,
  ScanResultSchema,
} from '../types/validation.js';
import { broadcastToSession } from '../ws/hub.js';
import { getSupabaseClient } from '../db/client.js';

export async function agentRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/agent/start — agent announces it's starting monitoring.
  app.post('/agent/start', async (request, reply) => {
    const body = AgentAuthSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request' });
    }

    const valid = await validateSessionToken(
      body.data.sessionId,
      body.data.sessionToken
    );
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid session credentials' });
    }

    await updateSessionStatus(body.data.sessionId, 'monitoring', {
      started_at: new Date().toISOString(),
    });

    await storeEvent({
      sessionId: body.data.sessionId,
      eventType: 'session_started',
      severity: 'info',
      source: 'agent',
      eventPayload: {},
      occurredAt: new Date().toISOString(),
    });

    broadcastToSession(body.data.sessionId, {
      type: 'event',
      payload: { eventType: 'agent_connected', sessionId: body.data.sessionId },
    });

    return reply.status(200).send({ status: 'monitoring_started' });
  });

  // POST /api/agent/heartbeat — periodic health ping from agent.
  app.post('/agent/heartbeat', async (request, reply) => {
    const body = AgentHeartbeatSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request' });
    }

    const valid = await validateSessionToken(
      body.data.sessionId,
      body.data.sessionToken
    );
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid session credentials' });
    }

    await storeHeartbeat({
      sessionId: body.data.sessionId,
      component: body.data.component,
      status: body.data.status,
    });

    broadcastToSession(body.data.sessionId, {
      type: 'heartbeat',
      payload: {
        sessionId: body.data.sessionId,
        component: body.data.component,
        status: body.data.status,
        timestamp: new Date().toISOString(),
      },
    });

    return reply.status(200).send({ acknowledged: true });
  });

  // POST /api/agent/events — batch of monitoring events from scanner.
  app.post('/agent/events', async (request, reply) => {
    const body = AgentEventsSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        error: 'Validation error',
        details: body.error.flatten(),
      });
    }

    const valid = await validateSessionToken(
      body.data.sessionId,
      body.data.sessionToken
    );
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid session credentials' });
    }

    // Verify session exists and activate monitoring
    const session = await getSession(body.data.sessionId, '');
    if (!session) {
      return reply.status(404).send({ error: 'Session not found' });
    }

    if (session.status !== 'monitoring') {
      await updateSessionStatus(body.data.sessionId, 'monitoring', {
        started_at: session.startedAt || new Date().toISOString(),
      });
    }

    const storedIds: string[] = [];
    for (const event of body.data.events) {
      const e = event as any;
      const eventType = (e.eventType || e.event_type || 'window_metadata_observed') as string;
      const severity = (e.severity || 'info') as string;
      const eventPayload = (e.eventPayload || e.metadata || e) as Record<string, unknown>;
      const occurredAt = (e.occurredAt || e.occurred_at || e.timestamp || new Date().toISOString()) as string;

      const id = await storeEvent({
        sessionId: body.data.sessionId,
        eventType,
        severity,
        source: 'scanner',
        eventPayload,
        occurredAt,
      });
      storedIds.push(id);

      broadcastToSession(body.data.sessionId, {
        type: 'event',
        payload: {
          id,
          sessionId: body.data.sessionId,
          eventType,
          severity,
          eventPayload,
          occurredAt,
          receivedAt: new Date().toISOString(),
        },
      });
    }

    return reply.status(200).send({ stored: storedIds.length, ids: storedIds });
  });

  // POST /api/agent/stop — agent announces monitoring has stopped.
  app.post('/agent/stop', async (request, reply) => {
    const body = AgentStopSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request' });
    }

    const valid = await validateSessionToken(
      body.data.sessionId,
      body.data.sessionToken
    );
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid session credentials' });
    }

    await storeEvent({
      sessionId: body.data.sessionId,
      eventType: 'agent_disconnected',
      severity: 'operational',
      source: 'agent',
      eventPayload: { reason: 'candidate_stopped' },
      occurredAt: new Date().toISOString(),
    });

    broadcastToSession(body.data.sessionId, {
      type: 'event',
      payload: { eventType: 'agent_disconnected', sessionId: body.data.sessionId },
    });

    return reply.status(200).send({ acknowledged: true });
  });
}
