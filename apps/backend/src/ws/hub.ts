/// WebSocket hub: manages authenticated connections from interviewers
/// and broadcasts session events to authorized subscribers.

import type { WebSocket } from 'ws';
import type { WsMessage } from '../types/schema.js';

interface SessionSubscription {
  ws: WebSocket;
  interviewerId: string;
  sessionId: string;
}

// In-memory session→subscribers map. Replace with Redis for multi-node.
const subscriptions = new Map<string, Set<SessionSubscription>>();

export function addSubscription(sub: SessionSubscription): void {
  if (!subscriptions.has(sub.sessionId)) {
    subscriptions.set(sub.sessionId, new Set());
  }
  subscriptions.get(sub.sessionId)!.add(sub);
}

export function removeSubscription(sub: SessionSubscription): void {
  subscriptions.get(sub.sessionId)?.delete(sub);
}

export function broadcastToSession(
  sessionId: string,
  message: WsMessage
): void {
  const subs = subscriptions.get(sessionId);
  if (!subs) return;

  const payload = JSON.stringify(message);
  const dead: SessionSubscription[] = [];

  for (const sub of subs) {
    if (sub.ws.readyState === sub.ws.OPEN) {
      sub.ws.send(payload, (err) => {
        if (err) {
          console.error('WS send error:', err);
        }
      });
    } else {
      dead.push(sub);
    }
  }

  // Prune dead connections.
  for (const d of dead) {
    subs.delete(d);
  }
}

export function getSubscriberCount(sessionId: string): number {
  return subscriptions.get(sessionId)?.size ?? 0;
}
