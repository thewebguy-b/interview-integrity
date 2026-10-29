import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    <div className="dashboard-container">
      <header className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/sessions')}>
            <ArrowLeft size={16} />
            <span>All Sessions</span>
          </button>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Session Audit: {session?.candidateLabel || 'Candidate'}
            </h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Completed Interview Review
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={exportCsv}>
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={exportJson}>
            <Download size={14} />
            <span>Export JSON</span>
          </button>
        </div>
      </header>

      <main className="main-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading audit record...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Summary Metrics */}
            <div className="stats-grid">
              <div className="card">
                <div className="card-body">
                  <div className="stat-label">Candidate</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '4px' }}>
                    {session?.candidateLabel}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Session ID: {sessionId?.substring(0, 8)}...
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="stat-label">Total Integrity Events</div>
                  <div className="stat-val">{events.length}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    High: {highSeverityCount} | Medium: {medSeverityCount}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="stat-label">Audit Status</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    {highSeverityCount > 0 ? (
                      <>
                        <ShieldAlert size={20} color="var(--color-danger)" />
                        <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>Flagged for Review</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={20} color="var(--color-success)" />
                        <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>Clear / Consistent</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="stat-label">Recorded Period</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {session?.startedAt ? new Date(session.startedAt).toLocaleTimeString() : 'N/A'} -{' '}
                    {session?.endedAt ? new Date(session.endedAt).toLocaleTimeString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Chronological Event Audit Trail</h2>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Severity</th>
                        <th>Type</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            No events logged during this interview.
                          </td>
                        </tr>
                      ) : (
                        events.map((ev, i) => (
                          <tr key={ev.id || i}>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                              {new Date(ev.occurredAt || ev.receivedAt).toLocaleTimeString()}
                            </td>
                            <td>
                              <span className={`badge badge-${ev.severity}`}>
                                {ev.severity.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ev.eventType}</td>
                            <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              {(ev.eventPayload as any)?.title ||
                                (ev.eventPayload as any)?.description ||
                                JSON.stringify(ev.eventPayload)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
