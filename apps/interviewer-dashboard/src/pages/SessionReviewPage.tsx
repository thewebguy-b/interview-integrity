import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShaderBackground } from '../components/ShaderBackground.js';
import {
  ArrowLeft,
  Download,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldAlert,
  FileText,
  CheckCircle,
} from 'lucide-react';
import type { InterviewSession, MonitoringEvent } from '../types/schema.js';

interface Props {
  backendUrl?: string;
  token?: string;
}

export function SessionReviewPage({ backendUrl = 'https://interview-integrity-backend.onrender.com', token }: Props) {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        setLoading(true);
        const [resSession, resEvents] = await Promise.all([
          fetch(`${backendUrl}/api/sessions/${sessionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendUrl}/api/sessions/${sessionId}/events`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (resSession.ok) {
          const sData = await resSession.json();
          setSession(sData.session);
        }
        if (resEvents.ok) {
          const eData = await resEvents.json();
          setEvents(eData.events || []);
        }
      } catch (err) {
        console.warn('Failed to load session audit:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId && token) {
      fetchAudit();
    }
  }, [sessionId, token, backendUrl]);

  const exportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ session, events }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `interview_audit_${sessionId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCsv = () => {
    const headers = ['Timestamp', 'Event Type', 'Severity', 'Source', 'Details'];
    const rows = events.map((e) => [
      e.occurredAt || e.receivedAt,
      e.eventType,
      e.severity,
      e.source,
      JSON.stringify(e.eventPayload).replace(/"/g, '""'),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => `"${r.join('","')}"`)].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `interview_audit_${sessionId}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const highSeverityCount = events.filter((e) => e.severity === 'high').length;
  const medSeverityCount = events.filter((e) => e.severity === 'medium').length;

  return (
    <div className="ref-page" style={{ background: 'var(--ref-pink)', minHeight: '100vh' }}>
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
            <div>
              <h1 className="ref-heading" style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                Session Audit: {session?.candidateLabel || 'Candidate'}
              </h1>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>
                Completed Interview Review
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="ref-btn ref-btn-ghost-light" style={{ padding: '8px 14px', fontSize: '0.84rem' }} onClick={exportCsv}>
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <button className="ref-btn ref-btn-white" style={{ padding: '8px 16px', fontSize: '0.84rem' }} onClick={exportJson}>
              <Download size={14} />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
        <div className="ref-ribbon-blue-pink" />
      </ShaderBackground>

      <main className="ref-container" style={{ padding: '32px 24px 72px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#4B5563' }}>Loading audit record...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Summary Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="ref-card-elevated" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Candidate</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111315', marginTop: '4px' }}>
                  {session?.candidateLabel}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#6B7280', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
                  ID: {sessionId?.substring(0, 8)}...
                </div>
              </div>

              <div className="ref-card-elevated" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Total Integrity Events</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#E54500', marginTop: '4px' }}>{events.length}</div>
                <div style={{ fontSize: '0.78rem', color: '#4B5563', marginTop: '4px' }}>
                  High: {highSeverityCount} | Medium: {medSeverityCount}
                </div>
              </div>

              <div className="ref-card-elevated" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Audit Status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  {highSeverityCount > 0 ? (
                    <>
                      <ShieldAlert size={20} color="#E11D48" />
                      <span style={{ fontWeight: 700, color: '#E11D48' }}>Flagged for Review</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={20} color="#059669" />
                      <span style={{ fontWeight: 700, color: '#059669' }}>Clear / Consistent</span>
                    </>
                  )}
                </div>
              </div>

              <div className="ref-card-elevated" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Recorded Period</div>
                <div style={{ fontSize: '0.88rem', color: '#111315', fontWeight: 600, marginTop: '8px' }}>
                  {session?.startedAt ? new Date(session.startedAt).toLocaleTimeString() : 'N/A'} -{' '}
                  {session?.endedAt ? new Date(session.endedAt).toLocaleTimeString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="ref-card-elevated" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                <h2 className="ref-heading" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111315', margin: 0 }}>
                  Chronological Event Audit Trail
                </h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#FFFFFF' }}>
                      <th style={{ padding: '12px 18px', fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Time</th>
                      <th style={{ padding: '12px 18px', fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Severity</th>
                      <th style={{ padding: '12px 18px', fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Type</th>
                      <th style={{ padding: '12px 18px', fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '44px', color: '#6B7280' }}>
                          No events logged during this interview.
                        </td>
                      </tr>
                    ) : (
                      events.map((ev, i) => (
                        <tr key={ev.id || i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 18px', color: '#6B7280', fontSize: '0.82rem', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                            {new Date(ev.occurredAt || ev.receivedAt).toLocaleTimeString()}
                          </td>
                          <td style={{ padding: '12px 18px' }}>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '999px',
                              background: ev.severity === 'high' ? '#FFF1F2' : ev.severity === 'medium' ? '#FEF3C7' : '#FFF3EB',
                              color: ev.severity === 'high' ? '#E11D48' : ev.severity === 'medium' ? '#B45309' : '#E54500',
                            }}>
                              {ev.severity.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '12px 18px', fontWeight: 600, fontSize: '0.84rem', color: '#111315' }}>{ev.eventType}</td>
                          <td style={{ padding: '12px 18px', fontSize: '0.82rem', color: '#4B5563' }}>
                            {(ev.eventPayload as any)?.title ||
                              (ev.eventPayload as any)?.description ||
                              (Array.isArray((ev.eventPayload as any)?.suspicious_apps) && (ev.eventPayload as any).suspicious_apps.length > 0
                                ? `Flagged: ${(ev.eventPayload as any).suspicious_apps.join(', ')}`
                                : JSON.stringify(ev.eventPayload))}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
