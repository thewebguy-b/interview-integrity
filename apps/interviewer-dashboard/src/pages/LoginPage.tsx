import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShaderBackground } from '../components/ShaderBackground.js';
import { ArrowLeft, ArrowRight, Shield, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  onSignIn: (email: string, password: string) => Promise<void>;
  onDemoSignIn?: () => void;
  error: string | null;
  loading: boolean;
}

export function LoginPage({ onSignIn, onDemoSignIn, error, loading }: Props) {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSignIn(email, password);
  };

  return (
    <div className="ref-page" style={{ background: 'var(--ref-pink)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Shader Bar */}
      <ShaderBackground style={{ padding: '16px 24px' }}>
        <div className="ref-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} color="#E54500" />
            </div>
            <span className="ref-heading" style={{ fontWeight: 700, fontSize: '1rem' }}>Interview Integrity</span>
          </div>

          <button
            onClick={() => navigate('/')}
            className="ref-btn ref-btn-ghost-light"
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>
        </div>
      </ShaderBackground>

      {/* Centered Auth Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '430px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 className="ref-heading" style={{ fontSize: '1.85rem', fontWeight: 700, color: '#111315', marginBottom: '6px' }}>
              Interviewer Access
            </h1>
            <p style={{ color: 'var(--ref-slate)', fontSize: '0.92rem' }}>
              Consent-based desktop telemetry &amp; live monitoring
            </p>
          </div>

          <div className="ref-card-elevated" style={{ padding: '32px' }}>
            {onDemoSignIn && (
              <div style={{ marginBottom: '20px' }}>
                <button
                  type="button"
                  className="ref-btn ref-btn-cobalt"
                  onClick={onDemoSignIn}
                  style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }}
                >
                  <Zap size={17} />
                  <span>One-Click Demo Access</span>
                  <ArrowRight size={15} />
                </button>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '20px 0 4px',
                  color: 'var(--ref-muted)',
                  fontSize: '0.78rem',
                }}>
                  <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
                  <span style={{ padding: '0 12px' }}>or sign in with credentials</span>
                  <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
                </div>
              </div>
            )}

            {error && (
              <div style={{
                background: '#FFF1F2',
                border: '1px solid #FECDD3',
                color: '#9F1239',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '0.85rem',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="email" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#111315', marginBottom: '6px' }}>
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="interviewer@company.com"
                  required
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label htmlFor="password" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#111315', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <button
                type="submit"
                className="ref-btn ref-btn-outline-dark"
                disabled={loading}
                style={{ width: '100%', marginTop: '4px' }}
              >
                {loading ? 'Signing in…' : 'Sign In With Supabase'}
              </button>
            </form>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
              <ShieldCheck size={14} />
              <span>Privacy-First Architecture</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--ref-muted)', lineHeight: 1.5 }}>
              Consented window metadata only. No keystrokes, webcam, microphone, or screen recordings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
