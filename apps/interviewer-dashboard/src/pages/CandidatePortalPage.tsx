import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShaderBackground } from '../components/ShaderBackground.js';
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Shield,
  ArrowLeft,
} from 'lucide-react';

export function CandidatePortalPage() {
  const navigate = useNavigate();

  return (
    <div className="ref-page" style={{ background: 'var(--ref-pink)' }}>
      {/* Shader Top Banner */}
      <ShaderBackground style={{ padding: '24px 0 0' }}>
        <div className="ref-container" style={{ maxWidth: '820px', paddingBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <button
              onClick={() => navigate('/')}
              className="ref-btn ref-btn-ghost-light"
              style={{ padding: '8px 14px', fontSize: '0.84rem' }}
            >
              <ArrowLeft size={15} />
              <span>Return to Overview</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={14} color="#E54500" />
              </div>
              <span className="ref-heading" style={{ fontWeight: 700, fontSize: '0.95rem' }}>Interview Integrity</span>
            </div>
          </div>

          <div className="ref-eyebrow" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '10px' }}>
            CANDIDATE PORTAL
          </div>
          <h1 className="ref-heading" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, marginBottom: '10px' }}>
            Candidate Interview Companion
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '1.02rem', maxWidth: '560px', lineHeight: 1.55 }}>
            A lightweight, consent-based desktop utility for your upcoming technical interview. Zero installation and zero admin rights required.
          </p>
        </div>
        <div className="ref-ribbon-blue-pink" />
      </ShaderBackground>

      {/* Main Content Cards */}
      <main className="ref-container" style={{ maxWidth: '820px', padding: '40px 24px 72px' }}>
        {/* Download Card */}
        <div className="ref-card-elevated" style={{ padding: '36px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <span style={{
                display: 'inline-block',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#059669',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: '12px',
              }}>
                ✓ WINDOWS 10 / 11 COMPATIBLE • PORTABLE .EXE
              </span>
              <h2 className="ref-heading" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111315' }}>
                Download Candidate Agent
              </h2>
              <p style={{ color: 'var(--ref-slate)', fontSize: '0.92rem', marginTop: '4px' }}>
                Single standalone executable • Zero system installation • No admin rights required
              </p>
            </div>
          </div>

          <a
            href="https://github.com/thewebguy-b/interview-integrity/releases/latest/download/Interview-Integrity-Agent.exe"
            className="ref-btn ref-btn-cobalt"
            target="_blank"
            rel="noopener noreferrer"
            style={{ width: '100%', padding: '15px 24px', fontSize: '1rem' }}
          >
            <Download size={18} />
            <span>Download for Windows (Portable .exe)</span>
          </a>

          {/* 3-Step Guide */}
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: '#F8F9FB',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            fontSize: '0.9rem',
          }}>
            <strong style={{ color: '#111315', display: 'block', marginBottom: '8px' }}>
              3-Step Quick Setup:
            </strong>
            <ol style={{ paddingLeft: '20px', margin: 0, lineHeight: 1.8, color: 'var(--ref-slate)' }}>
              <li>Double-click the downloaded <code>Interview-Integrity-Agent.exe</code> (if SmartScreen appears, click <em>More info &rarr; Run anyway</em>).</li>
              <li>Enter the single-use 6-character room code from your interview invite.</li>
              <li>Click <strong>&quot;I Consent &amp; Start Monitoring&quot;</strong> right before your video call begins.</li>
            </ol>
          </div>
        </div>

        {/* Privacy Guarantee Card */}
        <div className="ref-card-elevated" style={{ padding: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck size={22} color="#059669" />
            </div>
            <div>
              <h3 className="ref-heading" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111315' }}>
                Candidate Privacy Guarantee
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--ref-muted)' }}>Zero surveillance • Absolute transparency</span>
            </div>
          </div>

          <p style={{ color: 'var(--ref-slate)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Technical interviews should be fair, respectful, and non-intrusive. This companion operates strictly under zero-knowledge privacy boundaries:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: '#111315' }}>Only Window Metadata:</strong>
                <span style={{ color: 'var(--ref-slate)' }}> Reads active window titles, process names, and display-capture flags.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <XCircle size={18} color="#E11D48" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: '#111315' }}>Zero Keystroke Logging:</strong>
                <span style={{ color: 'var(--ref-slate)' }}> Passwords, terminal commands, and typed text are never accessed.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <XCircle size={18} color="#E11D48" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: '#111315' }}>Zero Camera or Audio Surveillance:</strong>
                <span style={{ color: 'var(--ref-slate)' }}> Webcam feeds and microphone inputs are excluded from this binary.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <XCircle size={18} color="#E11D48" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: '#111315' }}>Zero Screen Capturing:</strong>
                <span style={{ color: 'var(--ref-slate)' }}> Does not capture screenshots, video feeds, or screen buffer pixels.</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CandidatePortalPage;
