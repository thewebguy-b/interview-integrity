import React from 'react';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  onSignIn: (email: string, password: string) => Promise<void>;
  onDemoSignIn?: () => void;
  error: string | null;
  loading: boolean;
}

export function LoginPage({ onSignIn, onDemoSignIn, error, loading }: Props) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSignIn(email, password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 60% 0%, rgba(59,130,246,0.12) 0%, var(--bg-base) 60%)',
      padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo and Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}>
            <img
              src="/logo.svg"
              alt="Interview Integrity Logo"
              style={{ width: 68, height: 68, filter: 'drop-shadow(0 8px 16px rgba(59,130,246,0.3))' }}
            />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            Interview Integrity
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Consent-based desktop telemetry &amp; live monitoring
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.4)', borderRadius: 16 }}>
          <div className="card-body" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              Interviewer Access
            </h2>

            {/* Quick Demo Sign In Button */}
            {onDemoSignIn && (
              <div style={{ marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onDemoSignIn}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '12px',
                    fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
                  }}
                >
                  <Zap size={18} />
                  <span>One-Click Demo Access</span>
                  <ArrowRight size={16} />
                </button>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '1.25rem 0',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ padding: '0 12px' }}>or sign in with credentials</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="interviewer@company.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                disabled={loading}
                style={{ marginTop: '0.5rem', justifyContent: 'center' }}
              >
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : null}
                {loading ? 'Signing in…' : 'Sign In With Supabase'}
              </button>
            </form>
          </div>
        </div>

        {/* Privacy Notice */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-success)', fontSize: '0.8rem', marginBottom: 4 }}>
            <ShieldCheck size={14} />
            <span>Privacy-First Architecture</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Consented window metadata only. No keystrokes, webcam, microphone, or screen recordings.
          </p>
        </div>
      </div>
    </div>
  );
}
