import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShaderBackground } from '../components/ShaderBackground.js';
import {
  ArrowLeft,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  Wifi,
  WifiOff,
  StopCircle,
  Filter,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import { useSessionWs } from '../hooks/useSessionWs.js';

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

  const formatEventSummary = (payload: any) => {
    if (!payload) return 'Telemetry event recorded';
    if (payload.title) return payload.title;
    if (payload.description) return payload.description;
    if (Array.isArray(payload.suspicious_apps) && payload.suspicious_apps.length > 0) {
      return `Flagged processes: ${payload.suspicious_apps.join(', ')}`;
    }
    if (typeof payload.observation_count === 'number') {
      return `${payload.observation_count} active windows observed • Active: ${payload.active_window || 'Desktop'}`;
    }
    return JSON.stringify(payload);
  };

  const getSeverityBadgeStyle = (severity: string) => {
    switch (severity) {
      case 'high':
        return { bg: '#FFF1F2', color: '#E11D48', border: '#FECDD3' };
      case 'medium':
        return { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
      case 'low':
        return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' };
      default:
        return { bg: '#FFF3EB', color: '#E54500', border: '#FED7AA' };
    }
  };

  return (
    <div className="ref-page" style={{ background: 'var(--ref-pink)', minHeight: '100vh' }}>
      {/* Shader Live Header */}
      <ShaderBackground style={{ paddingTop: '16px' }}>
        <div className="ref-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className="ref-btn ref-btn-ghost-light"
              style={{ padding: '7px 14px', fontSize: '0.84rem' }}
              onClick={() => navigate('/sessions')}
            >
              <ArrowLeft size={15} />
              <span>All Sessions</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={16} color="#E54500" />
              </div>
              <div>
                <h1 className="ref-heading" style={{ fontSize: '1.08rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  Live Session: {sessionState?.session.candidateLabel || 'Candidate'}
                </h1>
                <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.78)', fontFamily: 'JetBrains Mono, monospace' }}>
                  ID: {sessionId?.substring(0, 8)}...
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Agent Connection Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FFFFFF',
              padding: '7px 14px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: connected && !agentOfflineAlert ? '#059669' : '#E11D48',
              boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
            }}>
              {connected && !agentOfflineAlert ? (
                <>
                  <Wifi size={14} color="#059669" />
                  <span>Agent Connected</span>
                </>
              ) : (
                <>
                  <WifiOff size={14} color="#E11D48" />
                  <span>Agent Disconnected / Heartbeat Stale</span>
                </>
              )}
            </div>

            <button
              onClick={handleEndSession}
              disabled={ending}
              className="ref-btn"
              style={{
                background: '#E11D48',
                color: '#FFFFFF',
                padding: '8px 16px',
                fontSize: '0.84rem',
              }}
            >
              <StopCircle size={15} />
              <span>{ending ? 'Ending...' : 'End Interview'}</span>
            </button>
          </div>
        </div>
        <div className="ref-ribbon-blue-pink" />
      </ShaderBackground>

      <main className="ref-container" style={{ padding: '28px 24px 72px' }}>
        {/* Disconnection Banner */}
        {agentOfflineAlert && (
          <div style={{
            background: '#FFF1F2',
            border: '1px solid #FECDD3',
            color: '#9F1239',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            fontSize: '0.9rem',
          }}>
            <AlertOctagon size={20} color="#E11D48" style={{ flexShrink: 0 }} />
            <div>
              <strong>Candidate Agent Offline Warning:</strong> No heartbeat received in the last 30 seconds.
              The desktop agent may have been terminated, minimized, or lost network connectivity.
            </div>
          </div>
        )}

        {/* Main 2-Column Live Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}>
          {/* Left Column: Risk Assessment & Telemetry Counters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Integrity Risk Assessment Card */}
            <div className="ref-card-elevated" style={{ padding: '24px' }}>
              <h2 className="ref-heading" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111315', marginBottom: '16px' }}>
                Integrity Risk Assessment
              </h2>

              {hasHighRisk ? (
                <div style={{
                  background: '#FFF1F2',
                  border: '1px solid #FECDD3',
                  borderRadius: '14px',
                  padding: '18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  marginBottom: '18px',
                }}>
                  <ShieldAlert size={28} color="#E11D48" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#E11D48' }}>High Risk Detected</div>
                    <div style={{ fontSize: '0.86rem', color: '#9F1239', marginTop: '4px', lineHeight: 1.45 }}>
                      Suspicious window manipulation, AI assistant, or excluded capture detected.
                    </div>
                  </div>
                </div>
              ) : hasMedRisk ? (
                <div style={{
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  borderRadius: '14px',
                  padding: '18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  marginBottom: '18px',
                }}>
                  <AlertTriangle size={28} color="#B45309" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#B45309' }}>Moderate Signals</div>
                    <div style={{ fontSize: '0.86rem', color: '#92400E', marginTop: '4px', lineHeight: 1.45 }}>
                      Anomalous window attributes observed during interview.
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '14px',
                  padding: '18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  marginBottom: '18px',
                }}>
                  <ShieldCheck size={28} color="#059669" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#059669' }}>Clear / No Anomalies</div>
                    <div style={{ fontSize: '0.86rem', color: '#065F46', marginTop: '4px', lineHeight: 1.45 }}>
                      All observed window metadata conforms to expected interview bounds.
                    </div>
                  </div>
                </div>
              )}

              <div style={{
                background: '#F8F9FB',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '14px 16px',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#111315', marginBottom: '4px' }}>
                  Platform Transparency Notice
                </div>
                <p style={{ fontSize: '0.78rem', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
                  Signals are gathered via native OS window APIs with candidate consent. No keystrokes, webcam, microphone, or screen contents are inspected.
                </p>
              </div>
            </div>

            {/* Session Telemetry Card */}
            <div className="ref-card-elevated" style={{ padding: '24px' }}>
              <h2 className="ref-heading" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111315', marginBottom: '16px' }}>
                Session Telemetry
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ background: '#F8F9FB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 600 }}>Total Events</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111315', marginTop: '4px' }}>{liveEvents.length}</div>
                </div>
                <div style={{ background: '#F8F9FB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 600 }}>Active Windows</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#E54500', marginTop: '4px' }}>{currentWindows.length}</div>
                </div>
                <div style={{ background: '#F8F9FB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 600 }}>Heartbeats</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669', marginTop: '4px' }}>{liveHeartbeats.length}</div>
                </div>
                <div style={{ background: '#F8F9FB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 600 }}>Status</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111315', marginTop: '10px', textTransform: 'uppercase' }}>
                    {sessionState?.session.status || 'Active'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Event Stream & Active Windows */}
          <div className="ref-card-elevated" style={{ overflow: 'hidden' }}>
            {/* Tabs Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E5E7EB',
              background: '#F9FAFB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('events')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    background: activeTab === 'events' ? '#E54500' : '#FFFFFF',
                    color: activeTab === 'events' ? '#FFFFFF' : '#4B5563',
                    boxShadow: activeTab === 'events' ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  Event Stream ({filteredEvents.length})
                </button>
                <button
                  onClick={() => setActiveTab('windows')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    background: activeTab === 'windows' ? '#E54500' : '#FFFFFF',
                    color: activeTab === 'windows' ? '#FFFFFF' : '#4B5563',
                    boxShadow: activeTab === 'windows' ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  Window Focus ({currentWindows.length})
                </button>
              </div>

              {activeTab === 'events' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={14} color="#6B7280" />
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      background: '#FFFFFF',
                      fontSize: '0.82rem',
                      color: '#111315',
                      outline: 'none',
                    }}
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

            {/* Tab Body */}
            <div style={{ padding: '20px', maxHeight: '620px', overflowY: 'auto' }}>
              {activeTab === 'events' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredEvents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: '#6B7280', fontSize: '0.92rem' }}>
                      No events received yet. Waiting for candidate agent telemetry...
                    </div>
                  ) : (
                    [...filteredEvents].reverse().map((ev, idx) => {
                      const badge = getSeverityBadgeStyle(ev.severity);
                      return (
                        <div
                          key={ev.id || idx}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            background: ev.severity === 'high' ? '#FFF1F2' : '#F8F9FB',
                            border: `1px solid ${ev.severity === 'high' ? '#FECDD3' : '#E5E7EB'}`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '999px',
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                              }}>
                                {ev.severity.toUpperCase()}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#111315' }}>
                                {ev.eventType}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'JetBrains Mono, monospace' }}>
                              {new Date(ev.occurredAt || ev.receivedAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.45 }}>
                            {formatEventSummary(ev.eventPayload)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <th style={{ padding: '10px 12px', fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '10px 12px', fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Process Name</th>
                        <th style={{ padding: '10px 12px', fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Window Title</th>
                        <th style={{ padding: '10px 12px', fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Affinity</th>
                        <th style={{ padding: '10px 12px', fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Topmost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentWindows.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                            No window observations reported yet.
                          </td>
                        </tr>
                      ) : (
                        currentWindows.map((win, idx) => (
                          <tr key={win.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '10px 12px' }}>
                              {win.active ? (
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '3px 8px', borderRadius: '999px' }}>
                                  ACTIVE FOCUS
                                </span>
                              ) : (
                                <span style={{ color: '#6B7280', fontSize: '0.78rem' }}>Background</span>
                              )}
                            </td>
                            <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: '#111315', fontWeight: 600 }}>
                              {win.name || 'system'}
                            </td>
                            <td style={{ padding: '10px 12px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#4B5563', fontSize: '0.84rem' }}>
                              {win.title || '(untitled)'}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              {win.capture_affinity && win.capture_affinity !== 'none' ? (
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#E11D48', background: '#FFF1F2', padding: '3px 8px', borderRadius: '999px' }}>
                                  {win.capture_affinity}
                                </span>
                              ) : (
                                <span style={{ color: '#6B7280', fontSize: '0.78rem' }}>None</span>
                              )}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              {win.topmost ? (
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '3px 8px', borderRadius: '999px' }}>
                                  YES
                                </span>
                              ) : (
                                <span style={{ color: '#6B7280', fontSize: '0.78rem' }}>No</span>
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
      </main>
    </div>
  );
}
