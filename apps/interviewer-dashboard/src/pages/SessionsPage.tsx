import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  Copy,
  ExternalLink,
  Shield,
  Search,
  LogOut,
} from 'lucide-react';
import type { InterviewSession } from '../types/schema.js';

interface Props {
  interviewerEmail: string;
  onSignOut: () => void;
  backendUrl?: string;
  token?: string;
}

export function SessionsPage({ interviewerEmail, onSignOut, backendUrl = 'http://localhost:3000', token }: Props) {
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

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-brand">
          <img src="/logo.svg" alt="Logo" style={{ width: 30, height: 30, borderRadius: 8 }} />
          <span className="brand-title">Interview Integrity System</span>
        </div>

        <div className="navbar-actions">
          <span className="user-email">{interviewerEmail}</span>
          <button className="btn btn-secondary btn-sm" onClick={onSignOut} title="Sign Out">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Interview Sessions</h1>
            <p className="page-subtitle">Manage candidate monitoring sessions and review live integrity events</p>
          </div>

          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            <span>Create Session</span>
          </button>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="input search-input"
              placeholder="Search by candidate name or session ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Sessions Table */}
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Status</th>
                  <th>Pairing Code</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="spinner" style={{ margin: '0 auto 12px' }} />
                      <span style={{ color: 'var(--text-muted)' }}>Loading sessions...</span>
                    </td>
                  </tr>
                ) : filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '48px' }}>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                        No interview sessions found.
                      </p>
                      <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
                        <Plus size={16} /> Create First Session
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session: any) => (
                    <tr key={session.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{session.candidateLabel}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          ID: {session.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${session.status}`}>
                          {session.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {session.pairingCode ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <code className="code-badge">{session.pairingCode}</code>
                            <button
                              className="btn btn-secondary btn-icon-only"
                              onClick={() => copyToClipboard(session.pairingCode)}
                              title="Copy Pairing Code"
                            >
                              <Copy size={14} />
                            </button>
                            {copiedCode === session.pairingCode && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>Copied!</span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Used / Expired</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {new Date(session.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {session.status === 'monitoring' || session.status === 'paired' || session.status === 'created' ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => navigate(`/sessions/${session.id}/live`)}
                            >
                              <Play size={14} />
                              <span>Live Monitor</span>
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => navigate(`/sessions/${session.id}/review`)}
                            >
                              <ExternalLink size={14} />
                              <span>Audit Log</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Create New Interview Session</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Generates a secure, single-use 6-character pairing code for the candidate.
            </p>

            <form onSubmit={handleCreateSession}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" htmlFor="candidateName">Candidate Name / Identifier</label>
                <input
                  id="candidateName"
                  type="text"
                  className="input"
                  placeholder="e.g. Jane Doe (Frontend Role)"
                  value={candidateLabel}
                  onChange={(e) => setCandidateLabel(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
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
