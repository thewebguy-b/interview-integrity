import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShaderBackground } from '../components/ShaderBackground.js';
import {
  Shield,
  ShieldCheck,
  ArrowRight,
  Download,
  CheckCircle2,
  XCircle,
  Lock,
  Cpu,
  Layers,
  EyeOff,
  Activity,
  ChevronDown,
  Wifi,
  Terminal,
  Monitor,
  FileText,
} from 'lucide-react';

export function TechnicalOverviewPage() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Can a candidate hide an AI overlay using screen-share evasion?',
      a: 'No. While video call apps like Zoom and Google Meet only capture standard visual display buffers, the Interview Integrity desktop agent inspects active processes and window metadata directly on the candidate’s OS—exposing Ghostly, Cluely, Copilot, ChatGPT, and capture-excluded overlays.',
    },
    {
      q: 'Does the agent ever capture audio, webcam video, or keystrokes?',
      a: 'Never. The companion binary physically excludes audio, camera, and keyboard hooks. Only window titles, process names, capture-affinity flags, and topmost status are transmitted with explicit candidate consent.',
    },
    {
      q: 'Why can’t a browser tab or extension detect desktop cheat apps?',
      a: 'Browsers run inside a strict OS sandbox and have zero visibility into native desktop applications or floating always-on-top overlays. A standalone user-space desktop companion (.exe) is required to observe desktop processes.',
    },
  ];

  return (
    <div className="ref-page">
      {/* ── 1. TOP NAVIGATION & HERO (SHADER GRADIENT) ───────────────────── */}
      <ShaderBackground style={{ paddingTop: '20px' }}>
        <div className="ref-container">
          <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '52px',
            gap: '16px',
          }}>
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={18} color="#E54500" />
              </div>
              <span className="ref-heading" style={{ fontSize: '1.08rem', fontWeight: 700, color: '#FFFFFF' }}>
                Interview Integrity
              </span>
            </div>

            <nav className="ref-nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <a href="/" className="ref-nav-link">Overview</a>
              <a href="/technical-overview" className="ref-nav-link" style={{ color: '#FFFFFF', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '6px' }}>
                Technical Overview
              </a>
              <a href="/join" className="ref-nav-link">Candidate App</a>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Sign in
              </button>
              <button
                onClick={() => navigate('/sessions')}
                className="ref-btn ref-btn-white"
                style={{ padding: '9px 18px', fontSize: '0.85rem' }}
              >
                <span>Interviewer Room</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </header>

          {/* Centered Technical Overview Hero */}
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto', paddingBottom: '68px' }}>
            <div className="ref-eyebrow" style={{ color: 'rgba(255,255,255,0.82)', marginBottom: '14px' }}>
              TECHNICAL OVERVIEW &amp; PRIVACY ARCHITECTURE
            </div>
            <h1 className="ref-heading" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 700, marginBottom: '18px' }}>
              Why Interview Integrity stays private &amp; deterministic.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '1.06rem', lineHeight: 1.6, marginBottom: '28px' }}>
              A transparent look at how our portable desktop companion enumerates workspace signals, blocks stealth AI overlays, and protects candidate privacy.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/sessions')} className="ref-btn ref-btn-white">
                <span>Launch Live Room</span>
                <ArrowRight size={15} />
              </button>
              <button onClick={() => navigate('/join')} className="ref-btn ref-btn-ghost-light">
                <Download size={15} />
                <span>Download Portable .exe</span>
              </button>
            </div>
          </div>
        </div>
        <div className="ref-ribbon-blue-white" />
      </ShaderBackground>

      {/* ── 2. "NOTHING LEAVES YOUR CALL" / ZERO-SURVEILLANCE PIPELINE ───── */}
      <section style={{ background: '#FFFFFF', padding: '80px 0' }}>
        <div className="ref-container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <div className="ref-eyebrow" style={{ color: 'var(--ref-cobalt)', marginBottom: '10px' }}>
              PRIVACY BOUNDARY
            </div>
            <h2 className="ref-heading" style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.6rem)', fontWeight: 700, marginBottom: '12px' }}>
              Zero personal content leaves the call.
            </h2>
            <p style={{ color: 'var(--ref-slate)', fontSize: '0.98rem', lineHeight: 1.6 }}>
              Only lightweight workspace metadata is ever inspected—no video, no audio, and no keystrokes.
            </p>
          </div>

          <div className="ref-grid-3" style={{ marginBottom: '28px' }}>
            {[
              {
                icon: <Lock size={18} color="#E54500" />,
                title: 'No Audio or Webcam',
                desc: 'Microphone and camera APIs are never accessed or requested by the desktop companion.',
              },
              {
                icon: <Terminal size={18} color="#E54500" />,
                title: 'No Keystroke Logging',
                desc: 'Typed code, chat messages, and passwords remain completely invisible to the scanner.',
              },
              {
                icon: <Cpu size={18} color="#E54500" />,
                title: 'No Kernel Rootkits',
                desc: 'Runs as a portable user-space executable with zero admin rights and zero registry edits.',
              },
            ].map((card, i) => (
              <div key={i} className="ref-card-elevated" style={{ padding: '24px' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FFF3EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  {card.icon}
                </div>
                <h3 className="ref-heading" style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--ref-slate)', lineHeight: 1.55 }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          {/* 4-Step Pipeline Flow Diagram */}
          <div style={{
            background: 'var(--ref-stone)',
            border: '1px solid #E5E7EB',
            borderRadius: '18px',
            padding: '28px',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              {[
                { step: '1', label: 'Process Enumeration', detail: 'Windows tasklist & metadata scan every 3s' },
                { step: '2', label: 'Keyword & Flag Match', detail: 'Detects Ghostly, Copilot, ChatGPT, overlays' },
                { step: '3', label: 'Risk Engine Scoring', detail: 'Assigns High / Medium / Info severity' },
                { step: '4', label: 'Live Room Stream', detail: 'WebSocket alert + immutable CSV audit log' },
              ].map((node) => (
                <div key={node.step} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '18px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#E54500', marginBottom: '6px' }}>
                    STEP 0{node.step}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.94rem', marginBottom: '4px' }}>{node.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ref-slate)', lineHeight: 1.45 }}>{node.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. "WHAT THE OTHER SIDE SEES" (BLUSH PINK) ───────────────────── */}
      <section style={{ background: 'var(--ref-pink)', padding: '80px 0' }}>
        <div className="ref-container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 44px' }}>
            <div className="ref-eyebrow" style={{ color: 'var(--ref-cobalt)', marginBottom: '10px' }}>
              VISIBILITY COMPARISON
            </div>
            <h2 className="ref-heading" style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.6rem)', fontWeight: 700, marginBottom: '12px' }}>
              What the interviewer sees vs. what screen share misses.
            </h2>
            <p style={{ color: 'var(--ref-slate)', fontSize: '0.96rem', lineHeight: 1.6 }}>
              Compare standard video call screen sharing with the telemetry surfaced inside your Interview Integrity room.
            </p>
          </div>

          <div className="ref-grid-2">
            <div className="ref-card-elevated" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <EyeOff size={20} color="#E11D48" />
                <h3 className="ref-heading" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  Zoom / Google Meet Screen Share
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--ref-slate)' }}>
                <div style={{ display: 'flex', gap: '10px' }}><XCircle size={17} color="#E11D48" /><span>Blind to capture-excluded overlay windows</span></div>
                <div style={{ display: 'flex', gap: '10px' }}><XCircle size={17} color="#E11D48" /><span>Cannot see always-on-top AI teleprompters</span></div>
                <div style={{ display: 'flex', gap: '10px' }}><XCircle size={17} color="#E11D48" /><span>No visibility into background AI assistants</span></div>
                <div style={{ display: 'flex', gap: '10px' }}><XCircle size={17} color="#E11D48" /><span>No structured post-interview audit trail</span></div>
              </div>
            </div>

            <div className="ref-card-elevated" style={{ padding: '28px', border: '2px solid var(--ref-cobalt)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <ShieldCheck size={20} color="#E54500" />
                <h3 className="ref-heading" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  Interview Integrity Live Room
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#111315' }}>
                <div style={{ display: 'flex', gap: '10px' }}><CheckCircle2 size={17} color="#059669" /><span>Flags Ghostly, Copilot, ChatGPT, Claude &amp; overlays</span></div>
                <div style={{ display: 'flex', gap: '10px' }}><CheckCircle2 size={17} color="#059669" /><span>Displays live process names &amp; window titles</span></div>
                <div style={{ display: 'flex', gap: '10px' }}><CheckCircle2 size={17} color="#059669" /><span>Alerts within 30s if the agent is closed or killed</span></div>
                <div style={{ display: 'flex', gap: '10px' }}><CheckCircle2 size={17} color="#059669" /><span>1-click CSV &amp; JSON audit export for hiring teams</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. "THE DESKTOP APP, SIGNAL BY SIGNAL" (CRISP WHITE) ─────────── */}
      <section style={{ background: '#FFFFFF', padding: '84px 0' }}>
        <div className="ref-container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 44px' }}>
            <div className="ref-eyebrow" style={{ color: 'var(--ref-cobalt)', marginBottom: '10px' }}>
              SIGNAL ARCHITECTURE
            </div>
            <h2 className="ref-heading" style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.6rem)', fontWeight: 700, marginBottom: '12px' }}>
              The desktop app, signal by signal.
            </h2>
            <p style={{ color: 'var(--ref-slate)', fontSize: '0.96rem', lineHeight: 1.6 }}>
              Every 3 seconds, the companion evaluates workspace signals and reports structured metadata.
            </p>
          </div>

          <div className="ref-grid-3">
            {[
              {
                icon: <Layers size={18} color="#E54500" />,
                title: 'Process & Window Enumeration',
                desc: 'Captures active windowed processes and their titles via native Windows tasklist enumeration.',
              },
              {
                icon: <EyeOff size={18} color="#E54500" />,
                title: 'Capture-Affinity Flags',
                desc: 'Marks detected stealth tools with capture_affinity: exclude so interviewers see evasion attempts.',
              },
              {
                icon: <Activity size={18} color="#E54500" />,
                title: 'AI Signature Detection',
                desc: 'Matches 20+ known AI interview tools including Ghostly, Cluely, Copilot, ChatGPT, and Claude.',
              },
              {
                icon: <Wifi size={18} color="#E54500" />,
                title: '10s Heartbeat Keep-Alive',
                desc: 'Continuous health pings trigger an immediate offline banner if the agent disconnects for 30 seconds.',
              },
              {
                icon: <FileText size={18} color="#E54500" />,
                title: 'Immutable Audit Trail',
                desc: 'Every scan, risk flag, and connection event is timestamped and exportable to CSV or JSON.',
              },
              {
                icon: <ShieldCheck size={18} color="#E54500" />,
                title: 'Explicit Consent Gate',
                desc: 'Candidates review exact data boundaries and click "I Consent & Start Monitoring" before any scan runs.',
              },
            ].map((sig, idx) => (
              <div key={idx} style={{ background: 'var(--ref-stone)', borderRadius: '16px', padding: '24px', border: '1px solid #E5E7EB' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  {sig.icon}
                </div>
                <h3 className="ref-heading" style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: '6px' }}>{sig.title}</h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--ref-slate)', lineHeight: 1.55 }}>{sig.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. SIDE-BY-SIDE COMPARISON TABLE (LIGHT STONE) ───────────────── */}
      <section style={{ background: 'var(--ref-stone)', padding: '80px 0' }}>
        <div className="ref-container" style={{ maxWidth: '940px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div className="ref-eyebrow" style={{ color: 'var(--ref-cobalt)', marginBottom: '10px' }}>
              SIDE BY SIDE
            </div>
            <h2 className="ref-heading" style={{ fontSize: 'clamp(1.85rem, 3.4vw, 2.5rem)', fontWeight: 700 }}>
              Browser extensions vs. Desktop Companion
            </h2>
          </div>

          <div className="ref-card-elevated" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ padding: '16px 20px', color: '#111315' }}>Capability</th>
                  <th style={{ padding: '16px 20px', color: '#6B7280' }}>Browser-Only Tools</th>
                  <th style={{ padding: '16px 20px', color: '#E54500' }}>Interview Integrity (.exe)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Detects desktop AI overlays (Ghostly, Cluely)', 'No (Sandboxed)', 'Yes — Real-time'],
                  ['Detects Copilot & standalone AI apps', 'No', 'Yes — Process scan'],
                  ['Requires zero webcam / mic recording', 'Often required', 'Yes — Metadata only'],
                  ['30s disconnect & kill detection', 'Tab close only', 'Yes — Heartbeat monitor'],
                  ['Installation required', 'Browser extension', 'Zero-install portable .exe'],
                ].map(([cap, browser, ours], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '15px 20px', fontWeight: 600, color: '#111315' }}>{cap}</td>
                    <td style={{ padding: '15px 20px', color: '#6B7280' }}>{browser}</td>
                    <td style={{ padding: '15px 20px', color: '#059669', fontWeight: 600 }}>{ours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 6. COMPATIBILITY GRID (BLUSH PINK) ───────────────────────────── */}
      <section style={{ background: 'var(--ref-pink)', padding: '68px 0' }}>
        <div className="ref-container" style={{ textAlign: 'center' }}>
          <div className="ref-eyebrow" style={{ color: 'var(--ref-cobalt)', marginBottom: '10px' }}>
            COMPATIBILITY
          </div>
          <h2 className="ref-heading" style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.3rem)', fontWeight: 700, marginBottom: '28px' }}>
            Works alongside your existing interview stack.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', maxWidth: '900px', margin: '0 auto' }}>
            {['Zoom', 'Google Meet', 'Microsoft Teams', 'VS Code', 'Windows 10', 'Windows 11'].map((tool) => (
              <div key={tool} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px 14px', fontWeight: 700, fontSize: '0.92rem', color: '#111315', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Monitor size={16} color="#E54500" />
                <span>{tool}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FAQ & FINAL CTA (CRISP WHITE) ─────────────────────────────── */}
      <section style={{ background: '#FFFFFF', padding: '80px 0' }}>
        <div className="ref-container" style={{ maxWidth: '860px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 className="ref-heading" style={{ fontSize: 'clamp(1.85rem, 3.4vw, 2.5rem)', fontWeight: 700 }}>
              Technical Questions
            </h2>
          </div>

          <div style={{ marginBottom: '56px' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} className="light-accordion-item">
                <div
                  className="pro-accordion-header"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  style={{ padding: '18px 24px' }}
                >
                  <span className="ref-heading" style={{ fontSize: '1rem', fontWeight: 600, color: '#111315' }}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    color="#6B7280"
                    style={{
                      transform: activeFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                    }}
                  />
                </div>
                {activeFaq === idx && (
                  <div style={{ color: '#4B5563', fontSize: '0.92rem', padding: '0 24px 20px', lineHeight: 1.65 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', background: 'var(--ref-cobalt)', color: '#FFFFFF', borderRadius: '20px', padding: '44px 28px' }}>
            <h2 className="ref-heading" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: '10px' }}>
              Ready to test it live?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.86)', marginBottom: '24px' }}>
              Create a session in 10 seconds and monitor workspace telemetry in real time.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/sessions')} className="ref-btn ref-btn-white">
                <span>Launch Live Room</span>
                <ArrowRight size={15} />
              </button>
              <button onClick={() => navigate('/join')} className="ref-btn ref-btn-ghost-light">
                <Download size={15} />
                <span>Candidate Portal</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TechnicalOverviewPage;
