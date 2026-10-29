import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Wifi,
  WifiOff,
  StopCircle,
  Eye,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useSessionWs } from '../hooks/useSessionWs.js';
import type { MonitoringEvent } from '../types/schema.js';

interface Props {
  backendUrl?: string;
  token?: string;
}

export function LiveSessionPage({ backendUrl = 'https://interview-integrity-backend.onrender.com', token }: Props) {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const {
    connected,
    sessionState,
    liveEvents,
    liveHeartbeats,
    agentOfflineAlert,
    subscribe,
    disconnect,
  } = useSessionWs(backendUrl);

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'events' | 'windows'>('events');
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    if (sessionId && token) {
      subscribe(sessionId, token);
    }
    return () => {
      disconnect();
    };
  }, [sessionId, token, subscribe, disconnect]);

  const handleEndSession = async () => {
    if (!window.confirm('Are you sure you want to end this interview monitoring session?')) return;
    try {
      setEnding(true);
      await fetch(`${backendUrl}/api/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(`/sessions/${sessionId}/review`);
    } catch (err) {
      alert('Failed to end session');
    } finally {
      setEnding(false);
    }
  };

  // Extract latest window scan observation
  const latestScanEvent = [...liveEvents]
    .reverse()
    .find((e) => e.eventType === 'window_scan' || (e.eventPayload as any)?.windows);
  const currentWindows: any[] = (latestScanEvent?.eventPayload as any)?.windows || [];

  // Filter events
  const filteredEvents = liveEvents.filter((ev) => {
    if (severityFilter === 'all') return true;
    return ev.severity === severityFilter;
  });

  // Calculate highest risk severity
  const hasHighRisk = liveEvents.some((e) => e.severity === 'high');
  const hasMedRisk = liveEvents.some((e) => e.severity === 'medium');

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <header className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/sessions')}>
            <ArrowLeft size={16} />
            <span>All Sessions</span>
          </button>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Live Session: {sessionState?.session.candidateLabel || 'Candidate'}
            </h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ID: {sessionId?.substring(0, 8)}...
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Agent connection badge */}
          <div className="agent-status-pill">
            {connected && !agentOfflineAlert ? (
              <>
                <span className="status-indicator-live" />
                <Wifi size={14} color="var(--color-success)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>
                  Agent Connected
                </span>
              </>
            ) : (
              <>
                <WifiOff size={14} color="var(--color-danger)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-danger)', fontWeight: 600 }}>
                  Agent Disconnected / Heartbeat Stale
                </span>
              </>
            )}
          </div>

          <button
            className="btn btn-danger btn-sm"
            onClick={handleEndSession}
            disabled={ending}
          >
            <StopCircle size={16} />
            <span>{ending ? 'Ending...' : 'End Interview'}</span>
          </button>
        </div>
      </header>

      {/* Disconnection Banner */}
      {agentOfflineAlert && (
        <div className="alert-banner alert-banner-danger">
          <AlertOctagon size={20} />
          <div>
            <strong>Candidate Agent Offline Warning:</strong> No heartbeat received in the last 30 seconds.
            The desktop agent may have been terminated, minimized, or lost network connectivity.
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="live-grid">
        {/* Left Col: Risk Overview & Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Risk Level Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Integrity Risk Assessment</h2>
            </div>
            <div className="card-body">
              <div className="risk-meter-container">
                {hasHighRisk ? (
                  <div className="risk-badge risk-high">
                    <ShieldAlert size={32} />
                    <div>
                      <div className="risk-title">High Risk Detected</div>
                      <div className="risk-desc">Suspicious window manipulation or excluded capture detected</div>
                    </div>
                  </div>
                ) : hasMedRisk ? (
                  <div className="risk-badge risk-medium">
                    <AlertTriangle size={32} />
                    <div>
                      <div className="risk-title">Moderate Signals</div>
                      <div className="risk-desc">Anomalous window attributes observed during interview</div>
                    </div>
                  </div>
                ) : (
                  <div className="risk-badge risk-clear">
                    <ShieldCheck size={32} />
                    <div>
                      <div className="risk-title">Clear / No Anomalies</div>
                      <div className="risk-desc">All observed window metadata conforms to expected interview bounds</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Verified Capabilities & Limitations */}
              <div className="capability-box">
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>
                  Platform Transparency Notice:
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Signals are gathered via native OS window APIs with candidate consent.
                  Windows OS limits cross-process display affinity reads to the owning process boundary.
                  No keystrokes, webcam, microphone, or screen contents are inspected.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Session Telemetry</h2>
            </div>
            <div className="card-body">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Total Events</div>
                  <div className="stat-val">{liveEvents.length}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Active Windows</div>
                  <div className="stat-val">{currentWindows.length}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Heartbeats</div>
                  <div className="stat-val">{liveHeartbeats.length}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Status</div>
                  <div className="stat-val" style={{ textTransform: 'uppercase', fontSize: '0.9rem' }}>
                    {sessionState?.session.status || 'Active'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Event Feed & Active Windows */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
                onClick={() => setActiveTab('events')}
              >
                Event Stream ({filteredEvents.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'windows' ? 'active' : ''}`}
                onClick={() => setActiveTab('windows')}
              >
                Window Focus ({currentWindows.length})
              </button>
            </div>

            {activeTab === 'events' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={14} color="var(--text-muted)" />
                <select
                  className="input input-sm"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <option value="all">All Severities</option>
                  <option value="high">High Only</option>
                  <option value="medium">Medium Only</option>
                  <option value="low">Low Only</option>
                  <option value="info">Info Only</option>
                </select>
              </div>
            )}
          </div>

          <div className="card-body" style={{ flex: 1, overflowY: 'auto', maxHeight: '600px' }}>
            {activeTab === 'events' ? (
              <div className="timeline-container">
                {filteredEvents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    No events received yet. Waiting for candidate agent telemetry...
                  </div>
                ) : (
                  [...filteredEvents].reverse().map((ev, idx) => (
                    <div key={ev.id || idx} className={`timeline-entry severity-${ev.severity}`}>
                      <div className="timeline-time">
                        {new Date(ev.occurredAt || ev.receivedAt).toLocaleTimeString()}
                      </div>
                      <div className="timeline-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge badge-${ev.severity}`}>
                            {ev.severity.toUpperCase()}
                          </span>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ev.eventType}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {(ev.eventPayload as any)?.title ||
                            (ev.eventPayload as any)?.description ||
                            JSON.stringify(ev.eventPayload)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Process Name</th>
                      <th>Window Title</th>
                      <th>Affinity</th>
                      <th>Topmost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentWindows.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                          No window observations reported yet.
                        </td>
                      </tr>
                    ) : (
                      currentWindows.map((win, idx) => (
                        <tr key={win.id || idx}>
                          <td>
                            {win.active ? (
                              <span className="badge badge-success">ACTIVE FOCUS</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Background</span>
                            )}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                            {win.name || 'system'}
                          </td>
                          <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {win.title || '(untitled)'}
                          </td>
                          <td>
                            {win.capture_affinity && win.capture_affinity !== 'none' ? (
                              <span className="badge badge-danger">{win.capture_affinity}</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                            )}
                          </td>
                          <td>
                            {win.topmost ? (
                              <span className="badge badge-warning">YES</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
