# Interview Integrity Monitoring System — Architecture & Threat Model

## 1. System Overview
The Interview Integrity Monitoring System is a consent-based, visible desktop monitoring and telemetry system for high-stakes technical interviews.

Unlike intrusive surveillance platforms, this system operates strictly on **window metadata** and **process telemetry**, adhering to privacy-first principles:
- **NO Keystroke logging**
- **NO Webcam or audio capture**
- **NO Screen recordings or pixel screenshots**
- **Explicit candidate consent required before monitoring starts**
- **Visible, floating/pinned agent with immediate exit capability**

---

## 2. High-Level Architecture

```mermaid
graph TD
    subgraph Candidate Device
        CA[Candidate Desktop Agent] -->|Spawns / Runs| WS[Window Scanner Engine (Rust)]
        WS -->|OS API Queries| WIN[Windows Win32 EnumWindows / GetWindowInfo]
        CA -->|Consent & Telemetry| REST[Fastify REST API]
    end

    subgraph Backend Services
        REST --> SEC[Zod Validation & Auth Guard]
        SEC --> DB[(Supabase Postgres & Audit Log)]
        REST --> HUB[WebSocket Hub]
    end

    subgraph Interviewer Workspace
        DASH[React Interviewer Dashboard] -->|Real-time WS Events| HUB
        DASH -->|Session Management| REST
    end
```

---

## 3. Core Components

### 3.1 Rust Engine (`crates/`)
- **`event-schema`**: Strongly-typed Rust data structures mirroring the JSON schema specification.
- **`window-scanner`**: Native Win32 window scanner enumerating top-level visible windows, active window focus, topmost styling (`WS_EX_TOPMOST`), and display capture affinity flags.
- **`risk-engine`**: Deterministic rule evaluation evaluating observed window metadata against known anomaly patterns (e.g. unallowlisted capture exclusion, hidden assistance tools) while strictly accounting for documented false positive scenarios (password managers, meeting controls).
- **`fixture-app`**: Native Win32 test harness creating controlled window configurations with `WS_EX_TOPMOST` and `WDA_EXCLUDEFROMCAPTURE` for automated verification.

### 3.2 Backend Service (`apps/backend`)
- Built on Fastify with TypeScript.
- REST endpoints for session lifecycle, single-use pairing code generation/validation, agent telemetry intake, and audit reviews.
- WebSocket broadcaster (`/api/ws`) streaming real-time events and heartbeats to authenticated interviewers.
- Rate-limiting, Helmet security headers, and CORS restrictions.

### 3.3 Interviewer Dashboard (`apps/interviewer-dashboard`)
- Built with React, TypeScript, and Vite.
- Dark-mode interface with glassmorphism design tokens.
- Live session view with real-time WebSocket connection, 30-second heartbeat monitor with disconnect alerts, severity filtering, and window focus tracking.
- Post-interview audit log with chronological replay and JSON/CSV export.

### 3.4 Candidate Desktop Agent (`apps/candidate-agent`)
- Visible desktop application built with Electron and TypeScript.
- Step-by-step pairing and transparent privacy consent workflow.
- Transmits periodic window observations and keep-alive heartbeats.
- Displays live status with a "Stop Monitoring & Exit" button for candidate autonomy.
