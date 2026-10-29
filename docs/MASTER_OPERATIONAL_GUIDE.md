# Interview Integrity Monitoring System
## The Complete Master Operational & Deployment Guide

---

### Table of Contents
1. **System Overview & The "Screen-Share Blind Spot"**
2. **Repository Architecture & What Lives Where**
3. **Phase 1: Running & Testing Locally (Right Now)**
4. **Phase 2: Cloud Deployment (Vercel + Render)**
5. **Phase 3: Packaging the Candidate Desktop App (`.exe`)**
6. **Phase 4: Running a Real Live Interview (Step-by-Step)**
7. **Phase 5: The 2-Minute Investor & Recruiter Pitch**

---

## 1. System Overview & The "Screen-Share Blind Spot"

### The Core Problem
In remote technical interviews, candidates frequently use undetectable AI cheat tools (e.g. Cluely, Ghostwriter, secondary monitors, transparent overlay prompts).
When candidates share their screen on **Zoom, Google Meet, or Teams**, they appear to be coding normally. In reality:
* Windows allows applications to set `SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)`.
* This renders text physically on the candidate's monitor, but Windows **erases the window from Zoom/Meet screen sharing**.
* Interviewers on screen share are **100% blind** to these tools.

### Our Solution
A **privacy-first, consent-based desktop companion**:
* **NO webcam recording, NO keystroke logging, NO audio capture**.
* Communicates directly with the Windows Desktop Window Manager (DWM) via low-level native Win32 APIs.
* Detects hidden capture-excluded windows, always-on-top overlays (`WS_EX_TOPMOST`), and unauthorized background apps.
* Streams real-time alerts to the Interviewer Dashboard in under 50ms via WebSockets.

---

## 2. Repository Architecture & What Lives Where

```
Find the cheater/
├── apps/
│   ├── interviewer-dashboard/  --> [DEPLOY ON VERCEL]
│   │                               React + Vite Single-Page Application
│   │                               Public Landing Page, Candidate Portal,
│   │                               Live Monitoring Room, Audit Reports.
│   │
│   ├── backend/                --> [DEPLOY ON RENDER / RAILWAY]
│   │                               Fastify + TypeScript + WebSocket Engine
│   │                               Session generator, pairing validator,
│   │                               in-memory & Supabase database sync.
│   │
│   └── candidate-agent/        --> [PACKAGED AS STANDALONE .EXE]
│                                   Electron + Node.js visible companion app
│                                   Prompts for 6-char code, transparency consent,
│                                   invokes Rust scanner every 3s.
│
├── crates/                     --> [NATIVE RUST ENGINE]
│   ├── window-scanner/             Direct Win32 EnumWindows & GetWindowDisplayAffinity.
│   ├── risk-engine/                Deterministic rules (R-000 to R-003) & allowlists.
│   ├── event-schema/               Strongly typed data contracts.
│   └── fixture-app/                Test harness creating controlled cheat windows.
│
├── docs/                       --> Architecture, API reference, platform limitations.
└── scripts/                    --> verify-integrity.ps1, run-dev.ps1.
```

---

## 3. Phase 1: Running & Testing Locally (Right Now)

Everything is currently operational on your computer. Here is how to test all 3 pieces:

### Terminal 1: Start the Backend Server (Port 3000)
```powershell
npm run dev:backend
```

### Terminal 2: Start the Web Dashboard (Port 5173)
```powershell
npm run dev:dashboard
```
* Open **`http://localhost:5173`** in your browser.
* Click **"One-Click Demo Access"** to enter.
* Click **"+ Create Session"** (e.g. `Test Candidate`).
* Copy the generated **6-character Pairing Code** (e.g. `GKBXCQ`).

### Terminal 3: Start the Candidate Desktop Agent
```powershell
npm run dev:agent
```
* Enter the 6-character Pairing Code into the agent window.
* Click **"Connect to Interview"** -> Click **"I Consent & Start Monitoring"**.
* The agent status turns **LIVE** (green pulse).

### Terminal 4: Test Anomaly Detection with the Fixture
```powershell
npm run fixture
```
* This spawns 3 test windows including an always-on-top window and a capture-excluded window.
* Check your dashboard at `http://localhost:5173/sessions/:id/live` — it will immediately turn **High Risk** with detailed telemetry!

---

## 4. Phase 2: Cloud Deployment (Vercel + Render)

```
[Candidate's Laptop]            [Render.com (Backend)]         [Vercel (Dashboard)]
candidate-agent.exe   ──────►  Fastify + WebSockets   ──────►  https://your-app.vercel.app
```

### Step 1: Deploy the Backend to Render.com (Free Tier)
1. Push your project to GitHub.
2. Go to **[render.com](https://render.com)** -> Click **"New Web Service"** -> Select your repo.
3. Settings:
   * **Root Directory**: `apps/backend`
   * **Environment**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `node dist/index.js`
4. Click **Deploy**. Render will generate a public URL:
   `https://interview-backend.onrender.com`

### Step 2: Deploy the Interviewer Dashboard to Vercel
1. Go to **[vercel.com](https://vercel.com)** -> Click **"Add New Project"** -> Select your repo.
2. Settings:
   * **Root Directory**: `apps/interviewer-dashboard`
   * **Framework Preset**: `Vite`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. In **Environment Variables**, add:
   * `VITE_BACKEND_URL` = `https://interview-backend.onrender.com` (from Step 1)
4. Click **Deploy**. Vercel will give you your live URL:
   `https://interview-integrity.vercel.app`

*(Note: We already created `apps/interviewer-dashboard/vercel.json` with SPA routing so page refreshes never 404).*

---

## 5. Phase 3: Packaging the Candidate Desktop App (`.exe`)

Candidates do not use terminals or Node.js; they double-click an `.exe`.

### Packaging the Standalone App
In `apps/candidate-agent`, we package the app into a single executable using `electron-builder`:
```powershell
cd apps/candidate-agent
npx electron-builder --win portable
```
* This creates `dist/Interview-Integrity-Agent.exe` (a portable, zero-install program).
* Upload this `.exe` once to **Google Drive**, **Dropbox**, or **GitHub Releases**.
* Candidates can also download it with 1 click from your Vercel site at **`/join`**.

---

## 6. Phase 4: Running a Real Live Interview (Step-by-Step)

```
[1] YOU (Interviewer)               [2] CANDIDATE (On Laptop)
Opens Vercel Website                Receives Email Invite
Clicks "+ Create Session"           Downloads Agent from /join or Drive
Gets Code: "K7X9B2"                 Opens .exe & enters "K7X9B2"
Opens "Live Monitor"                Clicks "I Consent & Start"
         │                                      │
         ▼                                      ▼
[3] BOTH IN CALL (Google Meet / Zoom)
Interviewer sees live window focus, background switching, and cheat alerts in real time.
Candidate codes normally.
         │
         ▼
[4] INTERVIEW FINISHES
Interviewer clicks "End Interview".
Downloads timestamped CSV/JSON compliance audit log.
```

---

## 7. Phase 5: The 2-Minute Pitch Script

When pitching this platform to investors, HR heads, or engineering leaders:

1. **The Hook**:
   > *"Over 60% of technical interviews today involve AI cheating or hidden overlays. The worst part? Zoom and Google Meet screen shares are completely blind to modern cheat tools that use Windows capture exclusion."*
2. **The Contrast**:
   > *"Old proctoring tools record webcams, bedrooms, and keystrokes. Candidates hate them and walk away from interviews. We built the first privacy-first integrity companion."*
3. **The Proof**:
   > *"Show them the Live Dashboard. Trigger `npm run fixture`. Show how our Win32 engine catches hidden windows that Zoom cannot see."*
4. **The Business Model**:
   > *"B2B SaaS per-seat or per-interview pricing for recruitment agencies, tech companies, and university hiring."*
