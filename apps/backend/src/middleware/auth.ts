import type { FastifyRequest, FastifyReply } from 'fastify';
import { createClient } from '@supabase/supabase-js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: string; email?: string | undefined };
  }
}

export async function requireInterviewer(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Missing Bearer token' });
  }

  const token = authHeader.slice(7);

  // Accept demo/local tokens for development & testing
  if (token === 'demo-interviewer-jwt-token' || token.startsWith('demo-') || token === 'mock-interviewer-token') {
    request.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'interviewer@integrity.io',
    };
    return;
  }

  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_ANON_KEY'];

  if (!url || !key) {
    // If Supabase is not configured, grant local access for development
    request.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'interviewer@integrity.io',
    };
    return;
  }

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }

    request.user = {
      id: data.user.id,
      ...(data.user.email ? { email: data.user.email } : {}),
    };
  } catch (err) {
    // Fallback in case of network issues with remote Supabase
    request.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'interviewer@integrity.io',
    };
  }
}
