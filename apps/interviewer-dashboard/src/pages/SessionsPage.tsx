import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShaderBackground } from '../components/ShaderBackground.js';
import {
  Plus,
  Play,
  Copy,
  ExternalLink,
  Shield,
  Search,
  LogOut,
  Check,
} from 'lucide-react';
import type { InterviewSession } from '../types/schema.js';

interface Props {
  interviewerEmail: string;
  onSignOut: () => void;
  backendUrl?: string;
  token?: string;
}

export function SessionsPage({ interviewerEmail, onSignOut, backendUrl = 'https://interview-integrity-backend.onrender.com', token }: Props) {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [candidateLabel, setCandidateLabel] = useState('');
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.warn('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [backendUrl, token]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateLabel.trim()) return;

    try {
      setCreating(true);
      const res = await fetch(`${backendUrl}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidateLabel: candidateLabel.trim() }),
      });

      if (res.ok) {
        setCandidateLabel('');
        setShowCreateModal(false);
        fetchSessions();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to create session (${res.status}): ${errData.error || errData.message || 'Server error'}`);
      }
    } catch (err: any) {
      alert(`Cannot reach backend at ${backendUrl}. Please make sure 'npm run dev:backend' is running!`);
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredSessions = sessions.filter((s) =>
    s.candidateLabel.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'monitoring':
        return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' };
      case 'paired':
        return { bg: '#FFF3EB', color: '#E54500', border: '#FED7AA' };
      case 'ended':
        return { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' };
      default:
        return { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
    }
  };

  return (
    <div className="ref-page" style={{ background: 'var(--ref-pink)', minHeight: '100vh' }}>
      {/* Shader Top Navbar */}
      <ShaderBackground style={{ paddingTop: '16px' }}>
        <div className="ref-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={18} color="#E54500" />
              </div>
              <span className="ref-heading" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                Interview Integrity
              </span>
            </div>

            <nav className="ref-nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <a href="/" className="ref-nav-link">Home</a>
              <a href="/technical-overview" className="ref-nav-link">Technical Overview</a>
              <a href="/join" className="ref-nav-link">Candidate Portal</a>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.9)',
              background: 'rgba(255,255,255,0.14)',
              padding: '6px 12px',
              borderRadius: '999px',
            }}>
              {interviewerEmail}
            </span>
            <button
              className="ref-btn ref-btn-ghost-light"
              style={{ padding: '7px 14px', fontSize: '0.84rem' }}
              onClick={onSignOut}
              title="Sign Out"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
        <div className="ref-ribbon-blue-pink" />
      </ShaderBackground>

      {/* Main Content */}
      <main className="ref-container" style={{ padding: '36px 24px 72px' }}>
        {/* Header Row */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div>
            <div className="ref-eyebrow" style={{ color: 'var(--ref-cobalt)', marginBottom: '6px' }}>
              INTERVIEWER WORKSPACE
            </div>
            <h1 className="ref-heading" style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.35rem)', fontWeight: 700, color: '#111315', marginBottom: '6px' }}>
              Interview Sessions
            </h1>
            <p style={{ color: 'var(--ref-slate)', fontSize: '0.96rem' }}>
              Generate 6-character pairing codes, monitor live sessions, and export audit reports.
            </p>
          </div>

          <button className="ref-btn ref-btn-cobalt" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            <span>Create Session</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '460px' }}>
          <Search
            size={17}
            color="#6B7280"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input
            type="text"
            placeholder="Search by candidate name or session ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px 11px 40px',
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '10px',
              fontSize: '0.9rem',
              color: '#111315',
              outline: 'none',
              fontFamily: 'inherit',
              boxShadow: '0 2px 8px rgba(17,19,21,0.04)',
            }}
          />
        </div>

        {/* Elevated White Sessions Table Card */}
        <div className="ref-card-elevated" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ padding: '14px 20px', fontSize: '0.74rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Candidate</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.74rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.74rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pairing Code</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.74rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Created</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.74rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '56px 20px' }}>
                      <div className="spinner" style={{ margin: '0 auto 12px' }} />
                      <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Loading sessions...</span>
                    </td>
                  </tr>
                ) : filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '56px 20px' }}>
                      <p style={{ color: '#4B5563', marginBottom: '16px', fontSize: '0.95rem' }}>
                        No interview sessions found.
                      </p>
                      <button className="ref-btn ref-btn-cobalt" style={{ padding: '10px 18px', fontSize: '0.86rem' }} onClick={() => setShowCreateModal(true)}>
                        <Plus size={16} />
                        <span>Create First Session</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session: any) => {
                    const st = getStatusStyle(session.status);
                    return (
                      <tr key={session.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 700, color: '#111315', fontSize: '0.94rem' }}>{session.candidateLabel}</div>
                          <div style={{ fontSize: '0.76rem', color: '#6B7280', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
                            ID: {session.id.substring(0, 8)}...
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: st.bg,
                            color: st.color,
                            border: `1px solid ${st.border}`,
                            letterSpacing: '0.04em',
                          }}>
                            {session.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          {session.pairingCode ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <code style={{
                                background: '#FFF3EB',
                                color: '#E54500',
                                border: '1px solid #FED7AA',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '0.88rem',
                                letterSpacing: '0.08em',
                              }}>
                                {session.pairingCode}
                              </code>
                              <button
                                onClick={() => copyToClipboard(session.pairingCode)}
                                title="Copy Pairing Code"
                                style={{
                                  background: '#F9FAFB',
                                  border: '1px solid #E5E7EB',
                                  borderRadius: '6px',
                                  padding: '5px 8px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  color: '#4B5563',
                                }}
                              >
                                {copiedCode === session.pairingCode ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: '#6B7280', fontSize: '0.84rem' }}>Used / Expired</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px', color: '#4B5563', fontSize: '0.85rem' }}>
                          {new Date(session.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          {session.status === 'monitoring' || session.status === 'paired' || session.status === 'created' ? (
                            <button
                              className="ref-btn ref-btn-cobalt"
                              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                              onClick={() => navigate(`/sessions/${session.id}/live`)}
                            >
                              <Play size={14} />
                              <span>Live Monitor</span>
                            </button>
                          ) : (
                            <button
                              className="ref-btn ref-btn-outline-dark"
                              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                              onClick={() => navigate(`/sessions/${session.id}/review`)}
                            >
                              <ExternalLink size={14} />
                              <span>Audit Log</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 19, 21, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div className="ref-card-elevated" style={{ width: '100%', maxWidth: '460px', padding: '28px' }}>
            <h2 className="ref-heading" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111315', marginBottom: '6px' }}>
              Create New Interview Session
            </h2>
            <p style={{ color: 'var(--ref-slate)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Generates a secure, single-use 6-character pairing code for the candidate.
            </p>

            <form onSubmit={handleCreateSession}>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="candidateName" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#111315', marginBottom: '6px' }}>
                  Candidate Name / Identifier
                </label>
                <input
                  id="candidateName"
                  type="text"
                  placeholder="e.g. Jane Doe (Frontend Role)"
                  value={candidateLabel}
                  onChange={(e) => setCandidateLabel(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '11px 13px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.92rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="ref-btn ref-btn-outline-dark"
                  style={{ padding: '10px 16px', fontSize: '0.86rem' }}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ref-btn ref-btn-cobalt"
                  style={{ padding: '10px 18px', fontSize: '0.86rem' }}
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create & Generate Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
