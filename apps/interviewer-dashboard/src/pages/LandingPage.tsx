import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Cpu,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Download,
  Activity,
  Layers,
  Terminal,
  AlertTriangle,
  Radio,
  Sliders,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  Check,
  ExternalLink,
  Monitor,
  Video,
  Mic,
  Key,
  Flame,
  FileCode,
  Fingerprint,
  RefreshCw,
  HelpCircle,
  ArrowDown,
  Compass,
  Feather,
  Sun,
  ShieldCheck,
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  // Quick action code / email state
  const [quickInput, setQuickInput] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<'stealth_prompter' | 'pinned_overlay' | 'alt_tab' | 'clean'>('stealth_prompter');
  const [isSimulating, setIsSimulating] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [tickerTime, setTickerTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = quickInput.trim();
    if (!val) {
      navigate('/sessions');
      return;
    }
    if (val.length >= 6 && val.length <= 8 && !val.includes('@')) {
      navigate('/join');
    } else {
      navigate('/sessions');
    }
  };

  // Scenario telemetry configuration (Internal Win32 secrets sanitized)
  const scenarioData = {
    stealth_prompter: {
      name: 'Stealth AI Prompter (Capture Evasion)',
      riskScore: 96,
      riskLevel: 'CRITICAL ANOMALY',
      color: '#E11D48',
      statusText: 'SCREEN CAPTURE EVASION DETECTED',
      description: 'Candidate is running a hidden AI assistant masked from video feeds. Unmasked instantly by our proprietary integrity engine.',
      ruleFired: 'RULE R-002: Unauthorized application concealing its display layer from virtual meeting software.',
      windows: [
        { title: 'GhostPrompt.exe — "Live Interview Solver"', hwnd: '0x00E910', state: 'EXCLUDED_OVERLAY', captureStatus: 'MASKED / EVADING', topmost: true },
        { title: 'Code.exe — solution.py [Python 3.11]', hwnd: '0x0041F2', state: 'FOCUS', captureStatus: 'STANDARD', topmost: false },
        { title: 'Chrome.exe — LeetCode #42: Trapping Rain Water', hwnd: '0x0019A8', state: 'BACKGROUND', captureStatus: 'STANDARD', topmost: false },
        { title: 'Zoom.exe — Technical Screen Share (Candidate)', hwnd: '0x0078B4', state: 'BACKGROUND', captureStatus: 'STANDARD', topmost: false },
      ],
    },
    pinned_overlay: {
      name: 'Pinned Stealth Overlay (Perpetual Z-Order)',
      riskScore: 84,
      riskLevel: 'HIGH PROBABILITY',
      color: '#D97706',
      statusText: 'PERPETUAL TOPMOST OVERLAY DETECTED',
      description: 'Candidate has an always-on-top transparent prompter pinned above their coding IDE.',
      ruleFired: 'RULE R-001: Unauthorized application retains perpetual priority over active coding workspace.',
      windows: [
        { title: 'InterviewCopilot.exe — "Live Copilot Window"', hwnd: '0x00B290', state: 'TOPMOST_PINNED', captureStatus: 'STANDARD', topmost: true },
        { title: 'Code.exe — solution.py [Python 3.11]', hwnd: '0x0041F2', state: 'FOCUS', captureStatus: 'STANDARD', topmost: false },
        { title: 'Zoom.exe — Technical Screen Share', hwnd: '0x0078B4', state: 'BACKGROUND', captureStatus: 'STANDARD', topmost: false },
      ],
    },
    alt_tab: {
      name: 'Rapid Focus Jitter (Abnormal Velocity)',
      riskScore: 72,
      riskLevel: 'UNUSUAL VELOCITY',
      color: '#EA580C',
      statusText: 'ANOMALOUS SWITCHING VELOCITY',
      description: 'Candidate switched window focus 19 times in the last 60 seconds, indicating secret external searching.',
      ruleFired: 'RULE R-003: Focus churn exceeds standard technical interview threshold (>15 switches/min).',
      windows: [
        { title: 'Brave.exe — "Private Tab: ChatGPT Prompting"', hwnd: '0x00D410', state: 'RAPID_JITTER', captureStatus: 'STANDARD', topmost: false },
        { title: 'Code.exe — solution.py [Python 3.11]', hwnd: '0x0041F2', state: 'FOCUS', captureStatus: 'STANDARD', topmost: false },
        { title: 'Zoom.exe — Technical Screen Share', hwnd: '0x0078B4', state: 'BACKGROUND', captureStatus: 'STANDARD', topmost: false },
      ],
    },
    clean: {
      name: 'Clean Standard Interview',
      riskScore: 0,
      riskLevel: 'VERIFIED INTEGRITY',
      color: '#059669',
      statusText: 'ALL CHECKS PASSED • ZERO ANOMALIES',
      description: 'Standard coding environment: Visual Studio Code, Chrome (LeetCode), and Zoom meeting active.',
      ruleFired: null,
      windows: [
        { title: 'Code.exe — solution.py [Python 3.11]', hwnd: '0x0041F2', state: 'FOCUS', captureStatus: 'STANDARD', topmost: false },
        { title: 'Chrome.exe — LeetCode #42: Trapping Rain Water', hwnd: '0x0019A8', state: 'BACKGROUND', captureStatus: 'STANDARD', topmost: false },
        { title: 'Zoom.exe — Technical Screen Share (Candidate)', hwnd: '0x0078B4', state: 'BACKGROUND', captureStatus: 'STANDARD', topmost: false },
      ],
    },
  };

  const current = isSimulating ? scenarioData[selectedScenario] : scenarioData.clean;

  const faqs = [
    {
      q: 'Why can’t Zoom, Google Meet, or Microsoft Teams detect these cheat overlays?',
      a: 'Virtual meeting software only captures standard visual screen layers. Modern cheat tools exploit operating system composition features to render text exclusively on the candidate’s physical display while concealing it from the shared video stream. Our proprietary companion verifies workspace integrity at the hardware and operating system level, exposing hidden assistants deterministically.',
    },
    {
      q: 'Does this record candidate webcams, audio, or keystrokes?',
      a: 'Never. Unlike invasive legacy proctoring platforms (Honorlock, Proctorio) that record candidate bedrooms and log personal keystrokes, our engine inspects ONLY operating system workspace metadata. It operates under strict zero-knowledge principles with 100% candidate consent.',
    },
    {
      q: 'How does a candidate run the agent? Does it require administrator privileges?',
      a: 'The candidate agent is a lightweight, portable Windows .exe (~18MB). It requires NO installer and NO administrator or root privileges. Before the interview call, the candidate simply runs the executable, enters their single-use 6-character room code, and clicks "Connect & Verify". When the interview ends, closing the app leaves zero system residue.',
    },
    {
      q: 'What if a cheat tool renames its executable or masks its window title?',
      a: 'Our engine does NOT rely on blacklisted window titles. The primary detection mechanism is structural: analyzing deep workspace layer properties, display masking, and artificial z-order pinning during an active session. Renaming the process has zero effect on our proprietary detection engine.',
    },
  ];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', color: '#0F172A', overflowX: 'hidden' }}>

      {/* ── 1. The Hero Canvas Frame (Full Edge-to-Edge Bleed) ────────── */}
      <div className="editorial-hero-full" style={{
        backgroundImage: `linear-gradient(180deg, rgba(3, 7, 18, 0.22) 0%, rgba(3, 7, 18, 0.04) 35%, rgba(3, 7, 18, 0.6) 100%), url('/hero-bg.jpg')`,
      }}>

        {/* Floating Capsule Island Navbar */}
        <header style={{ width: '100%', display: 'flex', justifyContent: 'center', zIndex: 30, marginBottom: 'auto' }}>
          <nav className="pill-capsule-nav" style={{
            maxWidth: '880px',
            width: '100%',
            padding: '8px 12px 8px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Minimalist Logo Glyph */}
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px rgba(255, 255, 255, 0.3)',
              }}>
                <Shield size={16} color="white" />
              </div>
              <span className="font-heading" style={{ fontSize: '0.98rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                Integrity
              </span>
            </div>

            {/* Centered Navigation Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-links">
              <a href="#simulator" style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>
                Telemetry
              </a>
              <a href="#zoom-blind-spot" style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>
                The Blind Spot
              </a>
              <a href="#architecture" style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>
                Technology
              </a>
              <a href="/join" style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>
                Candidate App
              </a>
            </div>

            {/* White Capsule Action Button */}
            <button
              className="pill-white-btn"
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              onClick={() => navigate('/sessions')}
            >
              <span>Interviewer Room</span>
              <ArrowRight size={14} />
            </button>
          </nav>
        </header>

        {/* Center Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: '920px', margin: 'auto auto 40px', zIndex: 10, width: '100%' }}>
          <h1 className="font-heading" style={{
            fontSize: 'clamp(2.8rem, 6.5vw, 5.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            color: '#FFFFFF',
            textShadow: '0 6px 32px rgba(0, 0, 0, 0.55)',
            marginBottom: '20px',
          }}>
            A little more <span className="font-editorial" style={{ fontSize: '1.24em', fontWeight: 400 }}>honest,</span><br />
            every interview.
          </h1>

          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'rgba(255, 255, 255, 0.92)',
            maxWidth: '640px',
            margin: '0 auto 36px',
            lineHeight: 1.6,
            fontWeight: 400,
            textShadow: '0 2px 16px rgba(0, 0, 0, 0.6)',
          }}>
            An anti-cheat telemetry companion that detects hidden AI teleprompters—without recording webcams, audio, or keystrokes.
          </p>

          {/* Frosted Glass Pill Input Container */}
          <form onSubmit={handleQuickSubmit} style={{ maxWidth: '540px', margin: '0 auto 18px' }}>
            <div className="pill-glass-input" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px 6px 22px',
            }}>
              <input
                type="text"
                placeholder="Enter 6-char code or work email..."
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                className="pill-white-btn"
                style={{
                  padding: '12px 24px',
                  fontSize: '0.9rem',
                  flexShrink: 0,
                }}
              >
                <span>Launch Live Room</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </form>

          <div style={{
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.8)',
            letterSpacing: '0.02em',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)',
          }}>
            Instant 15-second setup • 100% consent verified • Portable .exe
          </div>
        </div>
      </div>

      {/* ── 2. The Philosophy & Values Section (Clean White Background) ── */}
      <section id="philosophy" style={{ maxWidth: '1200px', margin: '100px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{
            fontSize: '0.82rem',
            color: '#059669',
            background: '#ECFDF5',
            border: '1px solid #D1FAE5',
            padding: '4px 14px',
            borderRadius: 99,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Respectful By Design
          </span>
          <h2 className="font-heading" style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            margin: '16px 0 16px',
          }}>
            Engineering talent, <span className="font-editorial" style={{ fontSize: '1.2em', color: '#0F172A' }}>unmasked</span> with dignity.
          </h2>
          <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
            Traditional proctoring treats engineers like criminals with webcams and keyloggers. We built a quiet, deterministic companion that monitors only OS workspace composition.
          </p>
        </div>

        {/* 3 Serene Cards on White */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
        }}>
          <div className="light-glass-card" style={{ padding: '36px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Feather size={22} color="#059669" />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
              Zero Personal Infiltration
            </h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.65 }}>
              No webcam peering into bedrooms. No microphone recording private conversations. No keystroke recording capturing passwords.
            </p>
          </div>

          <div className="light-glass-card" style={{ padding: '36px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Sun size={22} color="#0284C7" />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
              Proprietary Layer Attestation
            </h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.65 }}>
              Direct workspace integrity verification. Exposes hidden applications using screen-share evasion in under 50 milliseconds.
            </p>
          </div>

          <div className="light-glass-card" style={{ padding: '36px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Compass size={22} color="#9333EA" />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
              Single-Use 6-Character Pairing
            </h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.65 }}>
              Zero account creation required for candidates. Enter an ephemeral 6-character room token, verify consent, and close the app cleanly after the call.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. The Live Telemetry Command Studio (Light Mode Console) ──── */}
      <section id="simulator" style={{ maxWidth: '1240px', margin: '0 auto 130px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{
            fontSize: '0.82rem',
            color: '#2563EB',
            background: '#EFF6FF',
            border: '1px solid #DBEAFE',
            padding: '4px 14px',
            borderRadius: 99,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Live Studio Simulator
          </span>
          <h2 className="font-heading" style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            margin: '16px 0 16px',
          }}>
            Real-time telemetry, <span className="font-editorial" style={{ fontSize: '1.2em', color: '#0F172A' }}>observable</span> at a glance.
          </h2>
          <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
            Toggle between attack scenarios below to see our proprietary risk heuristics evaluate workspace integrity in real time.
          </p>
        </div>

        {/* Interactive Scenario Tabs (Light Mode) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '28px',
        }}>
          <button
            onClick={() => { setSelectedScenario('stealth_prompter'); setIsSimulating(true); }}
            className={`light-scenario-tab ${selectedScenario === 'stealth_prompter' && isSimulating ? 'active' : ''}`}
          >
            <AlertTriangle size={15} color={selectedScenario === 'stealth_prompter' && isSimulating ? '#FDA4AF' : '#E11D48'} />
            <span>AI Screen-Share Evasion (Stealth Prompter)</span>
          </button>

          <button
            onClick={() => { setSelectedScenario('pinned_overlay'); setIsSimulating(true); }}
            className={`light-scenario-tab ${selectedScenario === 'pinned_overlay' && isSimulating ? 'active' : ''}`}
          >
            <Layers size={15} color={selectedScenario === 'pinned_overlay' && isSimulating ? '#FCD34D' : '#D97706'} />
            <span>Perpetual Pinned Overlay (Z-Order Priority)</span>
          </button>

          <button
            onClick={() => { setSelectedScenario('alt_tab'); setIsSimulating(true); }}
            className={`light-scenario-tab ${selectedScenario === 'alt_tab' && isSimulating ? 'active' : ''}`}
          >
            <RefreshCw size={15} color={selectedScenario === 'alt_tab' && isSimulating ? '#FDBA74' : '#EA580C'} />
            <span>Rapid Focus Jitter (Alt-Tab Swapping)</span>
          </button>

          <button
            onClick={() => { setSelectedScenario('clean'); setIsSimulating(true); }}
            className={`light-scenario-tab ${selectedScenario === 'clean' || !isSimulating ? 'active' : ''}`}
          >
            <CheckCircle2 size={15} color={selectedScenario === 'clean' || !isSimulating ? '#6EE7B7' : '#059669'} />
            <span>Clean Candidate (Zero Anomalies)</span>
          </button>
        </div>

        {/* The Studio Console Panel (White Elevated Card) */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 24,
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
        }}>
          {/* Top Bar */}
          <div style={{
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', gap: 7 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F43F5E' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
              </div>
              <span style={{ fontSize: '0.82rem', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                MONITORING ROOM: <strong style={{ color: '#0F172A' }}>#7C9A4B</strong> (ALEX CHEN)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}>
                LIVE FEED: {tickerTime}
              </span>
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                style={{
                  background: isSimulating ? (current.riskScore > 50 ? '#E11D48' : '#059669') : '#0F172A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '6px 16px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  boxShadow: isSimulating && current.riskScore > 50 ? '0 4px 14px rgba(225, 29, 72, 0.35)' : 'none',
                }}
              >
                {isSimulating ? <RotateCcw size={13} /> : <Play size={13} />}
                <span>{isSimulating ? 'Reset to Clean' : 'Re-Inject Scenario'}</span>
              </button>
            </div>
          </div>

          {/* Console Grid Body */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            padding: '28px',
            gap: '28px',
          }}>
            {/* Left Box: Diagnostic */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                background: current.riskScore > 50 ? '#FFF1F2' : '#ECFDF5',
                border: `1px solid ${current.riskScore > 50 ? '#FECDD3' : '#A7F3D0'}`,
                borderRadius: 20,
                padding: '24px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Integrity Status
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: current.color, display: 'inline-block' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: current.color }}>
                      {current.statusText}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    background: current.riskScore > 50 ? '#FFE4E6' : '#D1FAE5',
                    border: `3px solid ${current.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '1.45rem', fontWeight: 800, color: current.color, lineHeight: 1 }}>
                      {current.riskScore}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 600 }}>/ 100</span>
                  </div>

                  <div>
                    <div style={{ color: current.color, fontWeight: 700, fontSize: '1.15rem' }}>
                      {current.riskLevel}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: 4, lineHeight: 1.5 }}>
                      {current.description}
                    </div>
                  </div>
                </div>

                {current.ruleFired && (
                  <div style={{
                    marginTop: 18,
                    padding: '10px 14px',
                    background: '#FFE4E6',
                    border: '1px solid #FECDD3',
                    borderRadius: 12,
                    fontSize: '0.78rem',
                    color: '#9F1239',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    🚨 {current.ruleFired}
                  </div>
                )}
              </div>

              {/* Hardware & Network Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 14, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Monitored Windows</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                    {current.windows.length}
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 14, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Telemetry Ping</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#059669', marginTop: 4 }}>
                    14ms
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 14, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>CPU Overhead</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#2563EB', marginTop: 4 }}>
                    &lt; 0.15%
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Live Window Composition Stream */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: 20,
              border: '1px solid #E2E8F0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: '#64748B',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: 12,
                marginBottom: 14,
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span>WORKSPACE INTEGRITY STREAM</span>
                <span style={{ color: '#059669', fontWeight: 600 }}>● LIVE HOOK</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {current.windows.map((win, idx) => {
                  const isAnomaly = win.captureStatus.includes('MASKED') || win.topmost || win.state === 'RAPID_JITTER';
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        background: isAnomaly ? '#FFF1F2' : '#FFFFFF',
                        border: `1px solid ${isAnomaly ? '#FECDD3' : '#E2E8F0'}`,
                        borderRadius: 12,
                        fontSize: '0.78rem',
                        transition: 'all 0.25s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            color: isAnomaly ? '#E11D48' : win.state === 'FOCUS' ? '#059669' : '#64748B',
                            fontWeight: 700,
                          }}>
                            [{win.state}]
                          </span>
                          <span style={{ color: isAnomaly ? '#9F1239' : '#0F172A', fontWeight: 600 }}>
                            {win.title}
                          </span>
                        </div>
                        <span style={{ color: '#64748B', fontSize: '0.7rem' }}>ID: {win.hwnd}</span>
                      </div>

                      <div style={{ display: 'flex', gap: 14, fontSize: '0.7rem', color: '#475569', marginTop: 6 }}>
                        <span>Capture Status: <strong style={{ color: win.captureStatus.includes('MASKED') ? '#E11D48' : '#334155' }}>{win.captureStatus}</strong></span>
                        <span>Pinning: <strong style={{ color: win.topmost ? '#E11D48' : '#64748B' }}>{win.topmost ? 'ALWAYS ON TOP' : 'STANDARD'}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. The Screen-Share Blind Spot Visualizer ──────────────────── */}
      <section id="zoom-blind-spot" style={{ maxWidth: '1240px', margin: '0 auto 130px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{
            fontSize: '0.82rem',
            color: '#7C3AED',
            background: '#F5F3FF',
            border: '1px solid #EDE9FE',
            padding: '4px 14px',
            borderRadius: 99,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            The Root Vulnerability
          </span>
          <h2 className="font-heading" style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            marginTop: 14,
          }}>
            The screen-sharing <span className="font-editorial" style={{ fontSize: '1.2em', color: '#0F172A' }}>blind spot,</span> revealed.
          </h2>
          <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: '700px', margin: '14px auto 0', lineHeight: 1.6 }}>
            Modern AI assistants exploit low-level graphics composition layers to conceal their windows. When candidates share their screen on Zoom, the meeting software only receives standard desktop layers, actively missing the hidden overlay.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '32px',
        }}>
          {/* Zoom Side (Light Card) */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.05)',
          }}>
            <div className="zoom-green-banner">
              <span>● YOU ARE SHARING YOUR SCREEN (ZOOM MEETING #892-410)</span>
              <span>STOP SHARE</span>
            </div>

            <div style={{ padding: '24px', background: '#F8FAFC', minHeight: '320px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <FileCode size={16} color="#2563EB" />
                <span style={{ fontSize: '0.85rem', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                  solution.py — Visual Studio Code
                </span>
              </div>

              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#1E293B', lineHeight: 1.8 }}>
                <div><span style={{ color: '#2563EB' }}>def</span> <span style={{ color: '#D97706' }}>trapRainWater</span>(height: List[int]) -&gt; int:</div>
                <div style={{ paddingLeft: '20px' }}>left, right = 0, len(height) - 1</div>
                <div style={{ paddingLeft: '20px' }}>left_max, right_max = 0, 0</div>
                <div style={{ paddingLeft: '20px', color: '#64748B' }}># Candidate is calmly coding...</div>
              </div>

              <div style={{
                position: 'absolute',
                top: '80px',
                right: '24px',
                width: '260px',
                height: '130px',
                border: '2px dashed #F43F5E',
                borderRadius: 14,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#FFF1F2',
                textAlign: 'center',
                padding: '14px',
              }}>
                <EyeOff size={22} color="#E11D48" style={{ marginBottom: 6 }} />
                <span style={{ fontSize: '0.76rem', color: '#9F1239', fontWeight: 700 }}>
                  INVISIBLE ON SCREEN SHARE
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748B', marginTop: 4 }}>
                  Meeting software receives zero pixels for concealed overlay applications.
                </span>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              padding: '14px 20px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.82rem', color: '#475569' }}>Interviewer Visual Experience:</span>
              <span style={{
                fontSize: '0.75rem',
                color: '#E11D48',
                background: '#FFF1F2',
                border: '1px solid #FECDD3',
                padding: '3px 12px',
                borderRadius: 99,
                fontWeight: 700,
              }}>
                ❌ ZERO VISIBILITY (BLIND SPOT)
              </span>
            </div>
          </div>

          {/* Our Engine Side (Light Card) */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 24,
            border: '2px solid #059669',
            boxShadow: '0 20px 40px -10px rgba(5, 150, 105, 0.12)',
            overflow: 'hidden',
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #059669, #0D9488)',
              color: 'white',
              padding: '6px 14px',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>● OUR PROPRIETARY INTEGRITY SENTINEL (WORKSPACE ATTESTATION)</span>
              <span>ACTIVE SCAN</span>
            </div>

            <div style={{ padding: '24px', background: '#F8FAFC', minHeight: '320px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Terminal size={16} color="#059669" />
                <span style={{ fontSize: '0.85rem', color: '#059669', fontFamily: 'JetBrains Mono, monospace' }}>
                  Workspace Composition Telemetry Stream
                </span>
              </div>

              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.76rem', color: '#334155', lineHeight: 1.8 }}>
                <div>&gt; Inspecting active workspace processes... [OK]</div>
                <div>&gt; Verifying display layer composition... [OK]</div>
                <div style={{ color: '#E11D48', fontWeight: 700 }}>
                  &gt; [ALERT] HWND 0x00E910: DISPLAY EVASION MASK DETECTED
                </div>
              </div>

              <div style={{
                position: 'absolute',
                top: '80px',
                right: '24px',
                width: '260px',
                height: '140px',
                border: '2px solid #E11D48',
                borderRadius: 14,
                background: '#FFF1F2',
                boxShadow: '0 8px 24px rgba(225, 29, 72, 0.2)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <AlertTriangle size={16} color="#E11D48" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9F1239' }}>
                    UNMASKED AI PROMPTER
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                  ID: 0x00E910 (GhostPrompt.exe)
                </div>
                <div style={{ fontSize: '0.68rem', color: '#E11D48', marginTop: 4 }}>
                  STATUS: SCREEN-SHARE EVASION DETECTED<br />
                  WORKSPACE PINNING: ACTIVE OVERLAY
                </div>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              padding: '14px 20px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.82rem', color: '#475569' }}>Integrity Engine Telemetry:</span>
              <span style={{
                fontSize: '0.75rem',
                color: '#059669',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                padding: '3px 12px',
                borderRadius: 99,
                fontWeight: 700,
              }}>
                ✓ 100% EXPOSED (&lt; 50MS)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Technical Architecture Bento Grid (Crisp Light Cards) ─── */}
      <section id="architecture" style={{ maxWidth: '1240px', margin: '0 auto 130px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{
            fontSize: '0.82rem',
            color: '#0284C7',
            background: '#E0F2FE',
            border: '1px solid #BAE6FD',
            padding: '4px 14px',
            borderRadius: 99,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Systems Engineering
          </span>
          <h2 className="font-heading" style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            marginTop: 14,
          }}>
            Native engine core, <span className="font-editorial" style={{ fontSize: '1.2em', color: '#0F172A' }}>quietly</span> powerful.
          </h2>
          <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: '680px', margin: '14px auto 0' }}>
            High-performance systems programming combined with zero-knowledge privacy guarantees.
          </p>
        </div>

        <div className="pro-bento-grid">
          <div className="light-glass-card" style={{ gridColumn: 'span 7', padding: '36px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <ShieldCheck size={24} color="#0284C7" />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
              Proprietary Display-Layer Attestation Engine
            </h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 20 }}>
              Our closed-source companion engine continuously evaluates workspace window composition, process hierarchy, and hardware layer state without capturing video, audio, or keystrokes.
            </p>
            <div className="light-code-block">
              <div style={{ color: '#0284C7', fontWeight: 700, marginBottom: 6 }}>
                [INTEGRITY ENGINE v2.4 • SYSTEM TELEMETRY]
              </div>
              <div>▸ Workspace Composition Analysis: <span style={{ color: '#059669', fontWeight: 600 }}>VERIFIED ACTIVE</span></div>
              <div>▸ Screen-Share Evasion Detection: <span style={{ color: '#059669', fontWeight: 600 }}>ACTIVE (&lt; 50MS)</span></div>
              <div>▸ System Overhead: <span style={{ color: '#0F172A', fontWeight: 600 }}>&lt; 0.15% CPU | 14.2 MB RAM</span></div>
              <div>▸ Privacy Attestation: <span style={{ color: '#059669', fontWeight: 600 }}>ZERO SURVEILLANCE (0 Cameras / 0 Keylogs)</span></div>
              <div>▸ Cryptographic Session Verification: <span style={{ color: '#7C3AED', fontWeight: 600 }}>VALIDATED (SHA-256)</span></div>
            </div>
          </div>

          <div className="light-glass-card" style={{ gridColumn: 'span 5', padding: '36px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Lock size={24} color="#059669" />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
              Zero-Knowledge Privacy Charter
            </h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 20 }}>
              Engineers hate invasive proctoring that records webcams and logs personal files. Our agent inspects zero personal content:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: '#0F172A' }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>0 Webcam or Microphone streams captured</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: '#0F172A' }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>0 Keystrokes or Password inputs logged</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: '#059669' }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>0 Kernel rootkits or permanent drivers installed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FAQ Accordion (Clean Light Cards) ───────────────────────── */}
      <section style={{ maxWidth: '960px', margin: '0 auto 130px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{
            fontSize: '0.82rem',
            color: '#7C3AED',
            background: '#F5F3FF',
            border: '1px solid #EDE9FE',
            padding: '4px 14px',
            borderRadius: 99,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Inquiries &amp; Clarity
          </span>
          <h2 className="font-heading" style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            marginTop: 14,
          }}>
            Everything you need to <span className="font-editorial" style={{ fontSize: '1.2em', color: '#0F172A' }}>know.</span>
          </h2>
        </div>

        <div>
          {faqs.map((faq, idx) => (
            <div key={idx} className="light-accordion-item">
              <div
                className="pro-accordion-header"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                style={{ padding: '22px 28px' }}
              >
                <span className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0F172A' }}>
                  {faq.q}
                </span>
                <ChevronDown
                  size={20}
                  color="#64748B"
                  style={{
                    transform: activeFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                  }}
                />
              </div>
              {activeFaq === idx && (
                <div className="pro-accordion-content" style={{ color: '#475569', fontSize: '0.94rem', padding: '0 28px 24px' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. The Closing Editorial CTA ───────────────────────────────── */}
      <section style={{ maxWidth: '1040px', margin: '0 auto 120px', padding: '0 24px', textAlign: 'center' }}>
        <div style={{
          padding: '70px 36px',
          borderRadius: 32,
          background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2F6 100%)',
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
        }}>
          <h2 className="font-heading" style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            marginBottom: 16,
          }}>
            Begin your next interview with <span className="font-editorial" style={{ fontSize: '1.2em', color: '#0F172A' }}>clarity.</span>
          </h2>
          <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 36px', lineHeight: 1.6 }}>
            Launch a live session in 10 seconds. Invite candidates with a single-use 6-character code. Experience genuine, fair technical evaluation.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              className="pill-white-btn"
              style={{ padding: '14px 34px', fontSize: '0.95rem', background: '#0F172A', color: '#FFFFFF' }}
              onClick={() => navigate('/sessions')}
            >
              <span>Launch Interviewer Room</span>
              <ArrowRight size={16} />
            </button>
            <button
              className="pill-white-btn"
              style={{ padding: '14px 30px', fontSize: '0.95rem', background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1' }}
              onClick={() => navigate('/join')}
            >
              <Download size={16} />
              <span>Candidate Join Portal</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 8. Minimalist Editorial Footer ────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid #E2E8F0',
        padding: '48px 24px',
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        color: '#64748B',
        fontSize: '0.88rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Shield size={14} color="white" />
          </div>
          <span style={{ color: '#475569', fontWeight: 500 }}>
            Interview Integrity Platform • Built for thoughtful engineering teams
          </span>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          <a href="/join" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}>Candidate Portal</a>
          <a href="/sessions" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}>Interviewer Console</a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
