import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';

import { sessionRoutes } from './routes/sessions.js';
import { pairingRoutes } from './routes/pairing.js';
import { agentRoutes } from './routes/agent.js';
import { wsRoutes } from './ws/handler.js';

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);
const HOST = process.env['HOST'] ?? '0.0.0.0';

async function bootstrap(): Promise<void> {
  const app = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
    },
  });

  // ── Security plugins ──────────────────────────────────────────────────────

  await app.register(helmet, {
    contentSecurityPolicy: false, // Managed separately for API-only server.
  });

  await app.register(cors, {
    origin: process.env['CORS_ORIGIN'] ? process.env['CORS_ORIGIN'].split(',').map((o) => o.trim()) : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    // Stricter limit for pairing validation to prevent brute-force.
    keyGenerator: (request) => {
      if (request.url.includes('/pairing/validate')) {
        return `pairing:${request.ip}`;
      }
      return request.ip;
    },
  });

  // ── WebSocket ─────────────────────────────────────────────────────────────

  await app.register(websocket);

  // ── Routes ────────────────────────────────────────────────────────────────

  await app.register(sessionRoutes, { prefix: '/api' });
  await app.register(pairingRoutes, { prefix: '/api' });
  await app.register(agentRoutes, { prefix: '/api' });
  await app.register(wsRoutes, { prefix: '/api' });

  // ── Health check & Root ───────────────────────────────────────────────────

  app.get('/', async () => ({
    name: 'Interview Integrity Telemetry Backend',
    status: 'online',
    version: '1.0.0',
    health: '/health',
    api: '/api/sessions',
  }));

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  }));

  // ── Start ─────────────────────────────────────────────────────────────────

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Backend listening on ${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
