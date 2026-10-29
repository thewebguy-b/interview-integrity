# Interview Integrity Monitoring System — API Reference

## Authentication
- **Interviewer Routes**: Require `Authorization: Bearer <supabase_jwt>`
- **Agent Routes**: Require `Authorization: Bearer <session_token>` (obtained via pairing endpoint)

---

## REST Endpoints

### 1. Pairing Endpoints
#### `POST /api/pairing/validate`
Validates a candidate pairing code and exchanges it for a single-session agent token.
- **Request Body**:
  ```json
  {
    "code": "A7X9K2"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "valid": true,
    "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "candidate_name": "Jane Doe",
    "token": "eyJhbGciOi...",
    "session_token": "eyJhbGciOi..."
  }
  ```
- **Error Response** (`400 Bad Request`):
  Returns identical error message for expired, consumed, or invalid codes to prevent timing/oracle attacks.

---

### 2. Session Management (Interviewer Only)
#### `POST /api/sessions`
Create a new interview session and generate a unique pairing code.
- **Request Body**:
  ```json
  {
    "candidateLabel": "Alex Smith"
  }
  ```

#### `GET /api/sessions`
List all sessions created by the authenticated interviewer.

#### `GET /api/sessions/:id`
Fetch session details and current monitoring status.

#### `POST /api/sessions/:id/end`
Terminate monitoring for the session.

#### `GET /api/sessions/:id/events`
Retrieve full chronological event audit trail.

---

### 3. Agent Telemetry Endpoints
#### `POST /api/agent/start`
Signal candidate has consented and monitoring has commenced.

#### `POST /api/agent/events`
Batch ingest window observations and scanner events.
- **Request Body**:
  ```json
  {
    "events": [
      {
        "event_type": "window_scan",
        "severity": "info",
        "title": "Periodic window scan observation",
        "metadata": { ... },
        "sequence_number": 1
      }
    ]
  }
  ```

#### `POST /api/agent/heartbeat`
Keep-alive ping sent every 10 seconds.
- **Request Body**:
  ```json
  {
    "agent_version": "0.1.0",
    "platform": "win32",
    "status": "healthy"
  }
  ```

#### `POST /api/agent/stop`
Signal graceful agent termination by the candidate.

---

## WebSocket API (`/api/ws`)
Full-duplex real-time channel for live interview monitoring.

### Client to Server Messages
1. **Auth Message**:
   ```json
   { "type": "auth", "token": "<supabase_jwt>" }
   ```
2. **Subscribe Message**:
   ```json
   { "type": "subscribe", "sessionId": "<session_uuid>" }
   ```

### Server to Client Broadcasts
1. `auth_ok`: JWT validated successfully.
2. `session_state`: Full initial state snapshot sent on subscription.
3. `event`: Real-time event relayed from candidate agent.
4. `heartbeat`: Heartbeat tick with component health status.
5. `alert`: Disconnection or anomaly alert.
