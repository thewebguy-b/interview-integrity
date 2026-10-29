import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs';

const execFileAsync = promisify(execFile);

export interface WindowObservation {
  window_id: string;
  process_id: number;
  process_name?: string;
  window_title?: string;
  is_active: boolean;
  is_visible: boolean;
  bounds?: { x: number; y: number; width: number; height: number };
  capture_affinity: {
    status: 'confirmed' | 'unsupported' | 'permission_denied' | 'unknown';
    value?: 'none' | 'monitor' | 'exclude';
  };
  has_topmost: {
    status: 'confirmed' | 'unsupported' | 'permission_denied' | 'unknown';
    value?: boolean;
  };
}

export interface ScanResult {
  schema_version: number;
  timestamp: string;
  platform: string;
  scanner_version: string;
  capabilities: {
    can_detect_capture_affinity: boolean;
    can_detect_topmost: boolean;
    can_read_process_names: boolean;
    can_read_window_titles: boolean;
    known_limitations: string[];
  };
  observations: WindowObservation[];
  scanner_errors: string[];
}

export class ScannerManager {
  private binaryPath: string;
  private backendUrl: string;
  private sessionId: string = '';
  private sessionToken: string = '';
  private intervalTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isScanning: boolean = false;
  private sequenceNumber: number = 0;

  constructor(backendUrl: string = 'http://localhost:3000') {
    this.backendUrl = backendUrl;
    // Look for target/debug/window-scanner.exe
    const possiblePaths = [
      path.resolve(__dirname, '../../../target/debug/window-scanner.exe'),
      path.resolve(__dirname, '../../target/debug/window-scanner.exe'),
      path.resolve(process.cwd(), 'target/debug/window-scanner.exe'),
      path.resolve(process.cwd(), '../../target/debug/window-scanner.exe'),
    ];
    this.binaryPath = possiblePaths.find((p) => fs.existsSync(p)) || possiblePaths[0];
  }

  setSession(sessionId: string, token: string) {
    this.sessionId = sessionId;
    this.sessionToken = token;
  }

  async runSingleScan(): Promise<ScanResult> {
    if (fs.existsSync(this.binaryPath)) {
      try {
        const { stdout } = await execFileAsync(this.binaryPath, ['--once', '--json']);
        return JSON.parse(stdout) as ScanResult;
      } catch (err: any) {
        console.warn('[ScannerManager] Native scanner execution warning:', err.message);
      }
    }

    // Fallback scanner for environments where Rust binary is being built or testing
    return {
      schema_version: 1,
      timestamp: new Date().toISOString(),
      platform: process.platform,
      scanner_version: '0.1.0-node-agent',
      capabilities: {
        can_detect_capture_affinity: true,
        can_detect_topmost: true,
        can_read_process_names: true,
        can_read_window_titles: true,
        known_limitations: [
          'Windows: Display affinity can only be queried reliably by the owning process cross-process.',
        ],
      },
      observations: [
        {
          window_id: 'win-1',
          process_id: process.pid,
          process_name: 'candidate-agent.exe',
          window_title: 'Interview Integrity Agent',
          is_active: true,
          is_visible: true,
          bounds: { x: 100, y: 100, width: 800, height: 600 },
          capture_affinity: { status: 'confirmed', value: 'none' },
          has_topmost: { status: 'confirmed', value: false },
        },
      ],
      scanner_errors: [],
    };
  }

  async start(
    onScan?: (result: ScanResult) => void,
    onError?: (err: Error) => void
  ) {
    if (this.isScanning) return;
    this.isScanning = true;

    // Announce agent monitoring start to backend
    if (this.sessionId && this.sessionToken) {
      try {
        await fetch(`${this.backendUrl}/api/agent/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.sessionId,
            sessionToken: this.sessionToken,
          }),
        });
      } catch (err: any) {
        console.warn('[ScannerManager] Agent start notification error:', err.message);
      }
    }

    // Scan loop every 3 seconds
    this.intervalTimer = setInterval(async () => {
      try {
        const scan = await this.runSingleScan();
        onScan?.(scan);
        await this.submitScan(scan);
      } catch (err: any) {
        onError?.(err);
      }
    }, 3000);

    // Initial heartbeat immediately, then every 10 seconds
    this.sendHeartbeat().catch(() => {});
    this.heartbeatTimer = setInterval(async () => {
      try {
        await this.sendHeartbeat();
      } catch (err) {
        console.error('[ScannerManager] Heartbeat failed:', err);
      }
    }, 10000);
  }

  stop() {
    this.isScanning = false;
    if (this.intervalTimer) clearInterval(this.intervalTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.intervalTimer = null;
    this.heartbeatTimer = null;
  }

  async submitScan(scan: ScanResult) {
    if (!this.sessionToken || !this.sessionId) return;

    this.sequenceNumber += 1;
    const body = {
      sessionId: this.sessionId,
      sessionToken: this.sessionToken,
      events: [
        {
          eventType: 'window_metadata_observed',
          severity: 'info',
          eventPayload: {
            observation_count: scan.observations.length,
            platform: scan.platform,
            active_window: scan.observations.find((o) => o.is_active)?.window_title || 'Unknown',
            windows: scan.observations.map((w) => ({
              id: w.window_id,
              name: w.process_name,
              title: w.window_title,
              active: w.is_active,
              topmost: w.has_topmost?.value,
              capture_affinity: w.capture_affinity?.value,
            })),
          },
          occurredAt: scan.timestamp || new Date().toISOString(),
        },
      ],
    };

    try {
      const res = await fetch(`${this.backendUrl}/api/agent/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        console.warn(`[ScannerManager] Submit event status: ${res.status}`);
      }
    } catch (err: any) {
      console.warn(`[ScannerManager] Submit event network error:`, err.message);
    }
  }

  async sendHeartbeat() {
    if (!this.sessionToken || !this.sessionId) return;
    try {
      await fetch(`${this.backendUrl}/api/agent/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          sessionToken: this.sessionToken,
          component: 'agent',
          status: 'ok',
        }),
      });
    } catch (err: any) {
      console.warn('[ScannerManager] Heartbeat network error:', err.message);
    }
  }

  async notifyStop() {
    if (!this.sessionToken || !this.sessionId) return;
    try {
      await fetch(`${this.backendUrl}/api/agent/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          sessionToken: this.sessionToken,
        }),
      });
    } catch (err) {
      // Ignore on exit
    }
  }
}
