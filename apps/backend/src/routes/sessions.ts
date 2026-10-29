import type { FastifyInstance } from 'fastify';
import { requireInterviewer } from '../middleware/auth.js';
import {
  createSession,
  getSessions,
  getSession,
  endSession,
  getSessionEvents,
} from '../services/sessions.js';
import { CreateSessionSchema, EndSessionSchema } from '../types/validation.js';

export async function sessionRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/sessions — create a new interview session.
  app.post(
    '/sessions',
    { preHandler: requireInterviewer },
    async (request, reply) => {
      const user = request.user!;
      const body = CreateSessionSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          error: 'Validation error',
          details: body.error.flatten(),
        });
      }

      const result = await createSession(user.id, body.data.candidateLabel);
      return reply.status(201).send(result);
    }
  );

  // GET /api/sessions — list sessions for the authenticated interviewer.
  app.get(
    '/sessions',
    { preHandler: requireInterviewer },
    async (request, reply) => {
      const user = request.user!;
      const sessions = await getSessions(user.id);
      return reply.send({ sessions });
    }
  );

  // GET /api/sessions/:id — get a specific session.
  app.get<{ Params: { id: string } }>(
    '/sessions/:id',
    { preHandler: requireInterviewer },
    async (request, reply) => {
      const user = request.user!;
      const session = await getSession(request.params.id, user.id);
      if (!session) {
        return reply.status(404).send({ error: 'Session not found' });
      }
      return reply.send({ session });
    }
  );

  // POST /api/sessions/:id/end — end a session.
  app.post<{ Params: { id: string } }>(
    '/sessions/:id/end',
    { preHandler: requireInterviewer },
    async (request, reply) => {
      const user = request.user!;
      const ended = await endSession(request.params.id, user.id);
      if (!ended) {
        return reply.status(404).send({
          error: 'Session not found or already ended',
        });
      }
      return reply.send({ success: true });
    }
  );

  // GET /api/sessions/:id/events — retrieve event history for a session.
  app.get<{ Params: { id: string } }>(
    '/sessions/:id/events',
    { preHandler: requireInterviewer },
    async (request, reply) => {
      const user = request.user!;
      const events = await getSessionEvents(request.params.id, user.id);
      return reply.send({ events });
    }
  );
}
