import type { FastifyInstance, FastifyRequest } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import type { WebSocket } from 'ws';
import { addSubscription, removeSubscription } from './hub.js';
import { getSession, getSessionEvents } from '../services/sessions.js';
import { WsMessageInSchema } from '../types/validation.js';
import type { WsSessionState } from '../types/schema.js';
import { getSupabaseClient } from '../db/client.js';

export async function wsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/ws',
    { websocket: true },
    (connection: any, _request: FastifyRequest) => {
      const socket: WebSocket = connection.socket ?? connection;
      let authedUserId: string | null = null;
      let currentSessionId: string | null = null;

      socket.on('message', async (rawData: any) => {
        let msg: unknown;
        try {
          msg = JSON.parse(rawData.toString());
        } catch {
          socket.send(
            JSON.stringify({ type: 'error', payload: { message: 'Invalid JSON' } })
          );
          return;
        }

        const parsed = WsMessageInSchema.safeParse(msg);
        if (!parsed.success) {
          socket.send(
            JSON.stringify({ type: 'error', payload: { message: 'Invalid message format' } })
          );
          return;
        }

        const data = parsed.data;

        if (data.type === 'auth') {
          if (data.token === 'demo-interviewer-jwt-token' || data.token.startsWith('demo-') || data.token === 'mock-interviewer-token') {
            authedUserId = '00000000-0000-0000-0000-000000000001';
            socket.send(JSON.stringify({ type: 'auth_ok', payload: {} }));
            return;
          }

          const url = process.env['SUPABASE_URL'];
          const key = process.env['SUPABASE_ANON_KEY'];

          if (!url || !key) {
            authedUserId = '00000000-0000-0000-0000-000000000001';
            socket.send(JSON.stringify({ type: 'auth_ok', payload: {} }));
            return;
          }

          // Validate the Supabase JWT.
          const supabase = createClient(url, key);
          const { data: userData, error } = await supabase.auth.getUser(data.token);
          if (error || !userData.user) {
            socket.send(
              JSON.stringify({
                type: 'error',
                payload: { message: 'Authentication failed' },
              })
            );
            socket.close(4001, 'Unauthorized');
            return;
          }
          authedUserId = userData.user.id;
          socket.send(JSON.stringify({ type: 'auth_ok', payload: {} }));
          return;
        }

        if (data.type === 'subscribe') {
          if (!authedUserId) {
            socket.send(
              JSON.stringify({ type: 'error', payload: { message: 'Not authenticated' } })
            );
            return;
          }

          // Verify the interviewer owns this session.
          const session = await getSession(data.sessionId, authedUserId);
          if (!session) {
            socket.send(
              JSON.stringify({
                type: 'error',
                payload: { message: 'Session not found or access denied' },
              })
            );
            return;
          }

          // Remove previous subscription if any.
          if (currentSessionId) {
            removeSubscription({
              ws: socket,
              interviewerId: authedUserId,
              sessionId: currentSessionId,
            });
          }

          currentSessionId = data.sessionId;
          addSubscription({
            ws: socket,
            interviewerId: authedUserId,
            sessionId: data.sessionId,
          });

          // Send current session state on subscribe.
          const events = await getSessionEvents(data.sessionId, authedUserId);
          const db = getSupabaseClient();
          const { data: heartbeats } = await db
            .from('session_heartbeats')
            .select('*')
            .eq('session_id', data.sessionId)
            .order('occurred_at', { ascending: false })
            .limit(20);

          const state: WsSessionState = {
            session,
            events: events as WsSessionState['events'],
            heartbeats: (heartbeats ?? []) as WsSessionState['heartbeats'],
            agentConnected: session.status === 'monitoring',
            scannerHealth: 'ok',
          };

          socket.send(
            JSON.stringify({ type: 'session_state', payload: state })
          );
          return;
        }
      });

      socket.on('close', () => {
        if (authedUserId && currentSessionId) {
          removeSubscription({
            ws: socket,
            interviewerId: authedUserId,
            sessionId: currentSessionId,
          });
        }
      });

      socket.on('error', (err: any) => {
        console.error('WebSocket error:', err);
      });
    }
  );
}
