import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  Laptop,
  ArrowRight,
  Shield,
  Lock,
  ArrowLeft,
  Terminal,
  Feather,
} from 'lucide-react';

export function CandidatePortalPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      background: 'linear-gradient(180deg, #070B12 0%, #0A121A 40%, #0F1A1E 100%)',
      minHeight: '100vh',
      color: '#F8FAFC',
      padding: '40px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
    }}>
      
      {/* Ambient background glow */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        backgroundImage: `radial-gradient(circle at 50% 10%, rgba(68, 120, 80, 0.15) 0%, transparent 60%), radial-gradient(circle at 80% 60%, rgba(56, 189, 248, 0.08) 0%, transparent 50%)`,
      }} />

      {/* Top Bar Back Link */}
      <div style={{ maxWidth: '680px', width: '100%', marginBottom: '28px', position: 'relative', zIndex: 10 }}>
        <button
          onClick={() => navigate('/')}
          className="pill-capsule-nav"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.18)',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#F8FAFC',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            transition: 'all 0.2s',
          }}
        >
          <ArrowLeft size={15} />
          <span>Return to Overview</span>
        </button>
      </div>

      <div style={{ maxWidth: '680px', width: '100%', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
            marginBottom: '16px',
          }}>
            <Shield size={24} color="white" />
          </div>

          <h1 className="font-heading" style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '10px' }}>
            Candidate Interview <span className="font-editorial" style={{ fontSize: '1.2em' }}>Companion</span>
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
            A lightweight, consent-based companion utility for your upcoming technical interview.
          </p>
        </div>

        {/* Download Card */}
        <div className="pro-glass-panel" style={{
          padding: '40px 36px',
          marginBottom: '28px',
          borderRadius: 28,
          background: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'inline-flex', marginBottom: '16px' }}>
              <span style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34D399',
                padding: '4px 16px',
                borderRadius: 99,
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}>
                ✓ WINDOWS 10 / 11 COMPATIBLE • PORTABLE .EXE
              </span>
            </div>

            <h2 className="font-heading" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
              Download Candidate Agent
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.92rem' }}>
              Single standalone executable (~18MB) • Zero system installation • No admin rights required
            </p>
          </div>

          <a
            href="/downloads/Interview-Integrity-Agent.exe"
            download
            className="pill-white-btn"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1.05rem',
              justifyContent: 'center',
            }}
          >
            <Download size={19} />
            <span>Download for Windows (Portable .exe)</span>
          </a>

          {/* Quick Steps */}
          <div style={{
            marginTop: '24px',
            padding: '18px 20px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 16,
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.88rem',
            color: '#CBD5E1',
          }}>
            <strong style={{ color: '#F8FAFC', display: 'block', marginBottom: '8px' }}>
              3-Step Quick Setup:
            </strong>
            <ol style={{ paddingLeft: '20px', margin: 0, lineHeight: 1.8, color: '#94A3B8' }}>
              <li>Double-click the downloaded <code>Interview-Integrity-Agent.exe</code>.</li>
              <li>Enter the single-use 6-character room code from your interview invite.</li>
              <li>Click <strong>"Connect &amp; Start Monitoring"</strong> right before your Zoom call begins.</li>
            </ol>
          </div>
        </div>

        {/* Candidate Privacy Guarantee Card */}
        <div className="pro-glass-panel" style={{
          padding: '36px',
          borderRadius: 28,
          background: 'rgba(255, 255, 255, 0.04)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck size={20} color="#34D399" />
            </div>
            <div>
              <h3 className="font-heading" style={{ fontSize: '1.18rem', fontWeight: 700, margin: 0 }}>
                Candidate Privacy Guarantee
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Zero surveillance • Absolute transparency</span>
            </div>
          </div>

          <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.65', marginBottom: '20px' }}>
            We believe technical interviews should be fair, respectful, and non-intrusive. This tool operates strictly under zero-knowledge privacy boundaries:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} color="#34D399" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: '#F1F5F9' }}>Only Window Metadata:</strong>
                <span style={{ color: '#94A3B8' }}> Reads active window titles, HWND handles, and DWM display affinities.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <XCircle size={18} color="#F43F5E" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: '#F1F5F9' }}>Zero Keystroke Logging:</strong>
                <span style={{ color: '#94A3B8' }}> Passwords, terminal commands, and typed text are strictly inaccessible.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <XCircle size={18} color="#F43F5E" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: '#F1F5F9' }}>Zero Camera or Audio Surveillance:</strong>
                <span style={{ color: '#94A3B8' }}> Webcam feeds and microphone inputs are physically excluded from this binary.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <XCircle size={18} color="#F43F5E" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: '#F1F5F9' }}>Zero Screen Capturing:</strong>
                <span style={{ color: '#94A3B8' }}> Does not capture screenshots, video feeds, or screen buffer pixels.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: '36px', color: '#64748B', fontSize: '0.84rem' }}>
          Interview Integrity Platform • Cryptographic Zero-Knowledge Architecture
        </div>
      </div>
    </div>
  );
}

export default CandidatePortalPage;
