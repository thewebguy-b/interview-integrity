import type { FastifyInstance } from 'fastify';
import { validatePairingCode } from '../services/sessions.js';
import { ValidatePairingSchema } from '../types/validation.js';

export async function pairingRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/pairing/validate — validate a pairing code, return session token.
  // Rate limited by global rate-limit plugin (10 req/min per IP).
  app.post('/pairing/validate', async (request, reply) => {
    const body = ValidatePairingSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        error: 'Validation error',
        details: body.error.flatten(),
      });
    }

    // Validate and consume the code.
    const result = await validatePairingCode(body.data.code);
    if (!result) {
      // Return the same error for invalid and expired codes to prevent oracle attacks.
      return reply.status(400).send({
        error: 'Invalid code',
        message: 'The pairing code is invalid, expired, or has already been used.',
      });
    }

    return reply.status(200).send({
      sessionId: result.sessionId,
      sessionToken: result.sessionToken,
      expiresAt: result.expiresAt,
      candidateName: result.candidateName || 'Candidate',
    });
  });
}
