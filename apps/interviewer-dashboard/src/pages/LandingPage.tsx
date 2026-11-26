import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShaderBackground } from '../components/ShaderBackground.js';
import {
  Shield,
  ShieldCheck,
  EyeOff,
  Lock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Download,
  Layers,
  Terminal,
  AlertTriangle,
  RefreshCw,
  Play,
  RotateCcw,
  FileCode,
  ChevronDown,
  ChevronRight,
  Wifi,
  FileText,
  Activity,
  Monitor,
  Check,
} from 'lucide-react';

type CapabilityKey = 'evasion' | 'topmost' | 'processes' | 'velocity' | 'privacy';

export function LandingPage() {
  const navigate = useNavigate();

  const [quickInput, setQuickInput] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<'stealth_prompter' | 'pinned_overlay' | 'alt_tab' | 'clean'>('stealth_prompter');
  const [isSimulating, setIsSimulating] = useState(true);
  const [activeCapability, setActiveCapability] = useState<CapabilityKey>('evasion');
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

  const capabilities: Record<CapabilityKey, {
    label: string;
    badge: string;
    title: string;
    summary: string;
    items: { name: string; status: string; tag: string; alert?: boolean }[];
  }> = {
    evasion: {
      label: 'Screen-Share Evasion Detection',
      badge: 'RULE R-002',
      title: 'Expose windows hidden from Zoom & Meet',
      summary: 'Identifies processes using display-affinity masking to hide overlays from virtual meeting screen shares.',
      items: [
        { name: 'Ghostly.exe — AI Overlay', status: 'capture_affinity: exclude', tag: 'HIGH RISK', alert: true },
        { name: 'Code.exe — solution.py', status: 'capture_affinity: none', tag: 'STANDARD' },
        { name: 'Zoom.exe — Screen Share', status: 'capture_affinity: none', tag: 'STANDARD' },
      ],
    },
    topmost: {
      label: 'Always-On-Top Overlay Pinning',
      badge: 'RULE R-001',
      title: 'Flag persistent Z-order floating prompters',
      summary: 'Detects unauthorized applications pinned perpetually above the candidate IDE.',
      items: [
        { name: 'InterviewCopilot.exe', status: 'topmost: true • Z-Order locked', tag: 'FLAGGED', alert: true },
        { name: 'Chrome.exe — Coding Problem', status: 'topmost: false', tag: 'STANDARD' },
      ],
    },
    processes: {
      label: 'AI Assistant Process Enumeration',
      badge: 'LIVE SCANNER',
      title: 'Recognize known AI copilot & stealth tools',
      summary: 'Enumerates windowed processes every 3 seconds to surface Copilot, ChatGPT, Claude, Ghostly, and overlay tools.',
      items: [
        { name: 'copilotapp.exe', status: 'Copilot Quick View', tag: 'DETECTED', alert: true },
        { name: 'ghostly.exe', status: 'Hidden Assistant Window', tag: 'DETECTED', alert: true },
        { name: 'Code.exe', status: 'Visual Studio Code', tag: 'ALLOWED' },
      ],
    },
    velocity: {
      label: 'Abnormal Focus Switching Velocity',
      badge: 'RULE R-003',
      title: 'Spot rapid alt-tabbing to external prompts',
      summary: 'Tracks window focus transitions per minute to highlight suspicious off-task lookup bursts.',
      items: [
        { name: 'Focus Churn Rate', status: '19 switches / 60s (Threshold: 15)', tag: 'UNUSUAL', alert: true },
        { name: 'Brave.exe — Private Tab', status: 'Alternating with IDE every 2.4s', tag: 'MONITORED' },
      ],
    },
    privacy: {
      label: 'Zero-Knowledge Consent Architecture',
      badge: 'PRIVACY FIRST',
      title: 'Strict metadata only—zero personal capture',
      summary: 'Candidates explicitly consent before monitoring starts and can stop the agent at any second.',
      items: [
        { name: 'Webcam & Microphone', status: 'Physically excluded from binary', tag: '0 STREAMS' },
        { name: 'Keystrokes & Pixels', status: 'Never recorded or transmitted', tag: '0 LOGGED' },
      ],
    },
  };

  const scenarioData = {
    stealth_prompter: {
      name: 'Stealth AI Prompter (Capture Evasion)',
      riskScore: 96,
      riskLevel: 'CRITICAL ANOMALY',
      color: '#E11D48',
      statusText: 'SCREEN CAPTURE EVASION DETECTED',
      description: 'Candidate is running a hidden AI assistant masked from video feeds. Unmasked instantly by the integrity engine.',
      ruleFired: 'RULE R-002: Unauthorized application concealing its display layer from virtual meeting software.',
      windows: [
        { title: 'Ghostly.exe — "Live Interview Solver"', hwnd: '0x00E910', state: 'EXCLUDED_OVERLAY', captureStatus: 'MASKED / EVADING', topmost: true },
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
  const activeCap = capabilities[activeCapability];

  const faqs = [
    {
      q: 'Why can’t Zoom, Google Meet, or Microsoft Teams detect these cheat overlays?',
      a: 'Virtual meeting software only captures standard visual screen layers. Modern cheat tools exploit operating system composition features to render text exclusively on the candidate’s physical display while concealing it from the shared video stream. Our companion verifies workspace metadata at the OS level, exposing hidden assistants.',
    },
    {
      q: 'Does this record candidate webcams, audio, or keystrokes?',
      a: 'Never. Unlike invasive legacy proctoring tools that record bedrooms and log keystrokes, our agent inspects only window metadata and running process names. It operates with explicit candidate consent.',
    },
    {
      q: 'How does a candidate run the agent? Does it require administrator privileges?',
      a: 'The candidate agent is a standalone portable Windows .exe. It requires no installer and no administrator privileges. Before the interview, the candidate opens the executable, enters their single-use 6-character room code, reviews the privacy notice, and clicks "I Consent & Start Monitoring".',
    },
    {
      q: 'How do interviewers review what happened after the call ends?',
      a: 'Every session records a chronological audit trail of telemetry events, flagged processes, and heartbeats. Interviewers can review the full timeline and export it as CSV or JSON in one click.',
    },
  ];

  return (
    <div className="ref-page">
      {/* ── 1. SHADER HERO & TOP NAVIGATION ──────────────────────────────── */}
      <ShaderBackground style={{ paddingTop: '20px' }}>
        <div className="ref-container">
          {/* Clean Top Navbar */}
          <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '48px',
            gap: '16px',
          }}>
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shield size={18} color="#E54500" />
              </div>
              <span className="ref-heading" style={{ fontSize: '1.08rem', fontWeight: 700, color: '#FFFFFF' }}>
                Interview Integrity
              </span>
            </div>

            <nav className="ref-nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <a href="#capabilities" className="ref-nav-link">Capabilities</a>
              <a href="#blind-spot" className="ref-nav-link">The Blind Spot</a>
              <a href="#technical-overview" className="ref-nav-link">Technical Overview</a>
              <a href="#simulator" className="ref-nav-link">Live Simulator</a>
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

          {/* Hero Two-Column Content */}
          <div className="ref-hero-grid" style={{ alignItems: 'end' }}>
            {/* Left Copy & Actions */}
            <div style={{ paddingBottom: '64px' }}>
              <div className="ref-eyebrow" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '16px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#86EFAC' }} />
                <span>CONSENT-BASED INTERVIEW TELEMETRY</span>
              </div>

              <h1 className="ref-heading" style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.85rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '20px',
              }}>
                Expose hidden AI cheat overlays in live technical interviews.
              </h1>

              <p style={{
                fontSize: '1.08rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.88)',
                maxWidth: '520px',
                marginBottom: '28px',
              }}>
                A lightweight, consent-verified desktop companion that detects stealth AI teleprompters and capture-evading overlays—without recording webcams, audio, or keystrokes.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
                <button
                  onClick={() => navigate('/sessions')}
                  className="ref-btn ref-btn-white"
                >
                  <span>Launch Live Room</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate('/join')}
                  className="ref-btn ref-btn-ghost-light"
                >
                  <Download size={16} />
                  <span>Candidate Portal (.exe)</span>
                </button>
              </div>

              {/* Quick Room Code / Email Form */}
              <form onSubmit={handleQuickSubmit} style={{ maxWidth: '470px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(11, 45, 153, 0.55)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '10px',
                  padding: '5px 5px 5px 14px',
                  gap: '8px',
                }}>
                  <input
                    type="text"
                    placeholder="Enter 6-char room code or work email..."
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.88rem',
                      width: '100%',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    type="submit"
                    className="ref-btn ref-btn-white"
                    style={{ padding: '9px 16px', fontSize: '0.82rem', borderRadius: '7px' }}
                  >
                    Go <ArrowRight size={14} />
                  </button>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.72)', marginTop: '10px' }}>
                  Portable Windows 10/11 executable • Zero installation • 100% candidate consent
                </div>
              </form>
            </div>

            {/* Right Hero Laptop Cutout Image (weaves behind the S-wave ribbon) */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', position: 'relative', zIndex: 10 }}>
              <img
                src="/hero-laptop.png"
                alt="Live Interview Integrity Monitoring on Laptop"
                style={{
                  width: '100%',
                  maxWidth: '470px',
                  height: 'auto',
                  display: 'block',
                  filter: 'drop-shadow(0 28px 50px rgba(8, 24, 84, 0.45))',
                  marginBottom: '-56px',
                  position: 'relative',
                  zIndex: 10,
                }}
              />
            </div>
          </div>
        </div>

        {/* Signature Geometric Transition Ribbon */}
        <div className="ref-ribbon-blue-pink" />
      </ShaderBackground>

      {/* ── 2. BLUSH PINK SECTION: TRUST STRIP & INTERACTIVE CAPABILITIES ── */}
      <section id="capabilities" style={{ background: 'var(--ref-pink)', padding: '56px 0 88px' }}>
        <div className="ref-container">
          {/* Compatibility Strip */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '28px',
            paddingBottom: '48px',
            borderBottom: '1px solid rgba(17, 19, 21, 0.08)',
            marginBottom: '64px',
            color: '#4B5563',
            fontSize: '0.84rem',
            fontWeight: 600,
          }}>
            <span style={{ color: '#6B7280', fontWeight: 500 }}>Designed to run alongside:</span>
            <span>Zoom Meetings</span>
            <span>Google Meet</span>
            <span>Microsoft Teams</span>
            <span>Visual Studio Code</span>
            <span>Windows 10 / 11</span>
          </div>

          {/* Section Heading */}
          <div style={{ maxWidth: '640px', marginBottom: '40px' }}>
            <div className="ref-eyebrow" style={{ color: 'var(--ref-cobalt)', marginBottom: '12px' }}>
              CORE PLATFORM
            </div>
            <h2 className="ref-heading" style={{ fontSize: 'clamp(2rem, 3.8vw, 2.85rem)', fontWeight: 700, marginBottom: '14px' }}>
              Deterministic telemetry built for respectful engineering hiring.
            </h2>
            <p style={{ color: 'var(--ref-slate)', fontSize: '1.02rem', lineHeight: 1.6 }}>
              Inspect workspace composition and process metadata in real time—never personal files, cameras, or keystrokes.
            </p>
          </div>

          {/* Large White Elevated Split Card (Interactive Tabs Left + Live Preview Right) */}
          <div className="ref-card-elevated ref-split-card" style={{ overflow: 'hidden' }}>
            {/* Left Interactive List */}
            <div style={{ padding: '32px', borderRight: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 className="ref-heading" style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '10px' }}>
                  Explore Integrity Signals
                </h3>
                <p style={{ color: 'var(--ref-slate)', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: '20px' }}>
                  Select a detection capability below to preview how our engine evaluates candidate workspaces.
                </p>
                <button
                  onClick={() => navigate('/sessions')}
                  className="ref-btn ref-btn-cobalt"
                  style={{ padding: '10px 18px', fontSize: '0.85rem', marginBottom: '24px' }}
                >
                  <span>Open Interviewer Room</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9' }}>
                {(Object.keys(capabilities) as CapabilityKey[]).map((key) => {
                  const isActive = activeCapability === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveCapability(key)}
                      className={`ref-feature-row ${isActive ? 'active' : ''}`}
                    >
                      <span>{capabilities[key].label}</span>
                      <ChevronRight size={16} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Interactive Preview Canvas */}
            <div style={{ background: '#F8F9FB', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 30px rgba(17, 19, 21, 0.05)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#E54500',
                    background: '#FFF3EB',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    letterSpacing: '0.05em',
                  }}>
                    {activeCap.badge}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#6B7280' }}>
                    LIVE TELEMETRY
                  </span>
                </div>

                <h4 className="ref-heading" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111315', textTransform: 'none', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  {activeCap.title}
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.55, marginBottom: '20px' }}>
                  {activeCap.summary}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeCap.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: item.alert ? '#FFF1F2' : '#F9FAFB',
                        border: `1px solid ${item.alert ? '#FECDD3' : '#E5E7EB'}`,
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111315', fontFamily: 'JetBrains Mono, monospace' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#6B7280', marginTop: '2px' }}>
                          {item.status}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '999px',
                        background: item.alert ? '#FFE4E6' : '#ECFDF5',
                        color: item.alert ? '#E11D48' : '#059669',
                        flexShrink: 0,
                      }}>
                        {item.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. BLUSH PINK SECTION: SIDE-BY-SIDE BLIND SPOT COMPARISON ───── */}
      <section id="blind-spot" style={{ background: 'var(--ref-pink)', padding: '0 0 96px' }}>
        <div className="ref-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '36px' }}>
            <div style={{ maxWidth: '620px' }}>
              <div className="ref-eyebrow" style={{ color: 'var(--ref-cobalt)', marginBottom: '10px' }}>
                THE SCREEN-SHARE BLIND SPOT
              </div>
              <h2 className="ref-heading" style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.7rem)', fontWeight: 700 }}>
                Same laptop. Two completely different views.
              </h2>
            </div>
            <p style={{ maxWidth: '380px', color: 'var(--ref-slate)', fontSize: '0.94rem', lineHeight: 1.55 }}>
              Screen sharing only captures standard visual frames. Stealth AI overlays exclude themselves from capture while remaining visible to the candidate.
            </p>
          </div>

          <div className="ref-grid-2">
            {/* Left Card: White — What Zoom/Meet Sees */}
            <div>
              <div style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E5E7EB',
                padding: '28px',
                minHeight: '340px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 16px 40px -15px rgba(17, 19, 21, 0.08)',
              }}>
                <div>
                  <div style={{
                    background: '#16A34A',
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '18px',
                  }}>
                    <span>● YOU ARE SHARING YOUR SCREEN</span>
                    <span>ZOOM / MEET</span>
                  </div>

                  <div style={{
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '16px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.78rem',
                    color: '#1F2937',
                    lineHeight: 1.75,
                    marginBottom: '16px',
                  }}>
                    <div style={{ color: '#6B7280', marginBottom: '6px' }}>// solution.py — VS Code</div>
                    <div><span style={{ color: '#E54500' }}>def</span> solve(nums: list[int]) -&gt; int:</div>
                    <div style={{ paddingLeft: '16px', color: '#6B7280' }}># Looks completely normal on screen share</div>
                  </div>
                </div>

                <div style={{
                  border: '2px dashed #FB7185',
                  background: '#FFF1F2',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <EyeOff size={20} color="#E11D48" />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#9F1239' }}>
                      Hidden Overlay Invisible to Interviewer
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#4B5563' }}>
                      Meeting software receives zero pixels from excluded overlay windows.
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '14px' }}>
                <strong style={{ fontSize: '0.95rem', display: 'block' }}>What Video Call Screen Share Sees</strong>
                <span style={{ fontSize: '0.86rem', color: 'var(--ref-slate)' }}>
                  100% blind to capture-excluded AI teleprompters.
                </span>
              </div>
            </div>

            {/* Right Card: Vibrant Cobalt Blue — What Integrity Engine Sees */}
            <div>
              <div style={{
                background: 'var(--ref-cobalt)',
                color: '#FFFFFF',
                borderRadius: '20px',
                padding: '28px',
                minHeight: '340px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 20px 45px -12px rgba(16, 76, 255, 0.35)',
              }}>
                <div>
                  <div style={{
                    background: 'rgba(255,255,255,0.16)',
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '18px',
                  }}>
                    <span>● INTEGRITY AGENT TELEMETRY</span>
                    <span>EXPOSED &lt;50MS</span>
                  </div>

                  <div style={{
                    background: '#FFFFFF',
                    color: '#111315',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#E11D48' }}>
                        SUSPICIOUS PROCESS DETECTED
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280', fontFamily: 'JetBrains Mono, monospace' }}>
                        PID 14820
                      </span>
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                      Ghostly.exe — AI Assistant
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#4B5563', marginTop: '4px' }}>
                      capture_affinity: exclude • topmost: true
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.14)',
                  border: '1px solid rgba(255,255,255,0.28)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <ShieldCheck size={20} color="#86EFAC" />
                  <div style={{ fontSize: '0.82rem', color: '#FFFFFF' }}>
                    Streamed live via WebSocket to the Interviewer Room with severity <strong>HIGH</strong>.
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '14px' }}>
                <strong style={{ fontSize: '0.95rem', display: 'block' }}>What Interview Integrity Sees</strong>
                <span style={{ fontSize: '0.86rem', color: 'var(--ref-slate)' }}>
                  Detects stealth assistants, overlays, and AI tools automatically.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SHADER INTERSTITIAL BANNER ────────────────────────────────── */}
      <ShaderBackground style={{ padding: '56px 0' }}>
        <div className="ref-container">
          <div style={{ maxWidth: '720px' }}>
            <div className="ref-eyebrow" style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '10px' }}>
              DETERMINISTIC ARCHITECTURE
            </div>
            <h2 className="ref-heading" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 700, marginBottom: '12px' }}>
              Built for accuracy, low overhead, and zero false-positive noise.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem', lineHeight: 1.6 }}>
              Every observation is evaluated against deterministic rules and logged with full context so interviewers make fair, evidence-backed decisions.
            </p>
          </div>
        </div>
      </ShaderBackground>

      {/* ── 5. WHITE ARCHITECTURE & PIPELINE DIAGRAM ─────────────────────── */}
      <section style={{ background: '#FFFFFF', padding: '88px 0' }}>
        <div className="ref-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '40px' }}>
            <div style={{ maxWidth: '520px' }}>
              <div className="ref-eyebrow" style={{ color: 'var(--ref-cobalt)', marginBottom: '10px' }}>
                HOW IT WORKS
              </div>
              <h2 className="ref-heading" style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.65rem)', fontWeight: 700 }}>
                From candidate laptop to interviewer room in milliseconds.
              </h2>
            </div>
            <div style={{ maxWidth: '420px' }}>
              <p style={{ color: 'var(--ref-slate)', fontSize: '0.96rem', lineHeight: 1.6, marginBottom: '14px' }}>
                The portable desktop companion enumerates active windows and process titles every 3 seconds, checks them against risk rules, and streams results over secure WebSockets.
              </p>
              <button
                onClick={() => navigate('/join')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ref-cobalt)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'inherit',
                }}
              >
                <span>View candidate setup guide</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Rounded Light Stone Pipeline Showcase */}
          <div style={{
            background: 'var(--ref-stone)',
            borderRadius: '20px',
            padding: '36px',
            border: '1px solid #E5E7EB',
          }}>
            <div className="ref-grid-3" style={{ alignItems: 'stretch' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '24px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#E54500', marginBottom: '8px' }}>01 • CANDIDATE AGENT</div>
                <div style={{ fontWeight: 700, fontSize: '1.02rem', marginBottom: '8px' }}>Portable Windows .exe</div>
                <p style={{ fontSize: '0.86rem', color: 'var(--ref-slate)', lineHeight: 1.55 }}>
                  Runs without installation or admin privileges. Scans windowed processes (`tasklist`) and sends heartbeats every 10s.
                </p>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '24px', border: '2px solid #E54500' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#E54500', marginBottom: '8px' }}>02 • FASTIFY + RISK ENGINE</div>
                <div style={{ fontWeight: 700, fontSize: '1.02rem', marginBottom: '8px' }}>Real-Time Rule Evaluation</div>
                <p style={{ fontSize: '0.86rem', color: 'var(--ref-slate)', lineHeight: 1.55 }}>
                  Validates session tokens, flags suspicious keywords (`ghostly`, `copilot`, `chatgpt`, `cluely`, `overlay`), and broadcasts via WebSocket.
                </p>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '24px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#E54500', marginBottom: '8px' }}>03 • INTERVIEWER ROOM</div>
                <div style={{ fontWeight: 700, fontSize: '1.02rem', marginBottom: '8px' }}>Live Alerts &amp; Audit Export</div>
                <p style={{ fontSize: '0.86rem', color: 'var(--ref-slate)', lineHeight: 1.55 }}>
                  Displays High/Medium/Clear risk badges, active window lists, disconnect warnings, and 1-click CSV/JSON reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5B. TECHNICAL OVERVIEW (SIGNAL BY SIGNAL & SIDE-BY-SIDE) ─────── */}
      <section id="technical-overview" style={{ background: 'var(--ref-pink)', padding: '84px 0' }}>
        <div className="ref-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
            <div style={{ maxWidth: '640px' }}>
              <div className="ref-eyebrow" style={{ color: 'var(--ref-cobalt)', marginBottom: '10px' }}>
                TECHNICAL OVERVIEW
              </div>
              <h2 className="ref-heading" style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.65rem)', fontWeight: 700, marginBottom: '10px' }}>
                The desktop app, signal by signal.
              </h2>
              <p style={{ color: 'var(--ref-slate)', fontSize: '0.96rem', lineHeight: 1.6 }}>
                Every 3 seconds, the portable companion evaluates workspace signals and reports structured metadata without recording personal content.
              </p>
            </div>
            <button
              onClick={() => navigate('/technical-overview')}
              className="ref-btn ref-btn-outline-dark"
              style={{ padding: '10px 18px', fontSize: '0.85rem' }}
            >
              <span>Full Technical Overview</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* 6 Signal Cards */}
          <div className="ref-grid-3" style={{ marginBottom: '48px' }}>
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
              <div key={idx} className="ref-card-elevated" style={{ padding: '24px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FFF3EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  {sig.icon}
                </div>
                <h3 className="ref-heading" style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: '6px' }}>{sig.title}</h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--ref-slate)', lineHeight: 1.55 }}>{sig.desc}</p>
              </div>
            ))}
          </div>

          {/* Side-by-Side Comparison Table */}
          <div className="ref-card-elevated" style={{ overflow: 'hidden', marginBottom: '36px' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <strong className="ref-heading" style={{ fontSize: '1.08rem', color: '#111315' }}>
                Side by Side: Browser Extensions vs. Desktop Companion
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--ref-cobalt)', fontWeight: 700 }}>
                WHY A NATIVE .EXE IS REQUIRED
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
                    <th style={{ padding: '14px 20px', color: '#111315' }}>Capability</th>
                    <th style={{ padding: '14px 20px', color: '#6B7280' }}>Browser-Only Tools</th>
                    <th style={{ padding: '14px 20px', color: '#E54500' }}>Interview Integrity (.exe)</th>
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
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: '#111315' }}>{cap}</td>
                      <td style={{ padding: '14px 20px', color: '#6B7280' }}>{browser}</td>
                      <td style={{ padding: '14px 20px', color: '#059669', fontWeight: 600 }}>{ours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6 Compatibility Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {['Zoom', 'Google Meet', 'Microsoft Teams', 'VS Code', 'Windows 10', 'Windows 11'].map((tool) => (
              <div key={tool} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px', fontWeight: 700, fontSize: '0.88rem', color: '#111315', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Monitor size={15} color="#E54500" />
                <span>{tool}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. SHADER HEADER + PATTERNED RIBBON INTO SIMULATOR ───────────── */}
      <ShaderBackground style={{ paddingTop: '56px' }}>
        <div className="ref-container" style={{ paddingBottom: '48px' }}>
          <div style={{ maxWidth: '640px' }}>
            <div className="ref-eyebrow" style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '10px' }}>
              INTERACTIVE CONSOLE
            </div>
            <h2 className="ref-heading" style={{ fontSize: 'clamp(1.85rem, 3.6vw, 2.6rem)', fontWeight: 700 }}>
              Test every detection scenario live in your browser.
            </h2>
          </div>
        </div>
        <div className="ref-ribbon-blue-white" />
      </ShaderBackground>

      {/* ── 7. WHITE SECTION: LIVE TELEMETRY SIMULATOR IN TABLET FRAME ───── */}
      <section id="simulator" style={{ background: '#FFFFFF', padding: '80px 0 96px' }}>
        <div className="ref-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
            <div>
              <h2 className="ref-heading" style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.65rem)', fontWeight: 700, marginBottom: '10px' }}>
                Live Telemetry Command Studio
              </h2>
              <p style={{ color: 'var(--ref-slate)', fontSize: '1rem', maxWidth: '580px' }}>
                Toggle between attack scenarios below to see how the dashboard scores anomalies and displays workspace telemetry.
              </p>
            </div>
            <button
              onClick={() => navigate('/sessions')}
              className="ref-btn ref-btn-cobalt"
            >
              <span>Create Real Session</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Scenario Selector Pills */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <button
              onClick={() => { setSelectedScenario('stealth_prompter'); setIsSimulating(true); }}
              className={`light-scenario-tab ${selectedScenario === 'stealth_prompter' && isSimulating ? 'active' : ''}`}
            >
              <AlertTriangle size={15} color={selectedScenario === 'stealth_prompter' && isSimulating ? '#FDA4AF' : '#E11D48'} />
              <span>AI Screen-Share Evasion</span>
            </button>

            <button
              onClick={() => { setSelectedScenario('pinned_overlay'); setIsSimulating(true); }}
              className={`light-scenario-tab ${selectedScenario === 'pinned_overlay' && isSimulating ? 'active' : ''}`}
            >
              <Layers size={15} color={selectedScenario === 'pinned_overlay' && isSimulating ? '#FCD34D' : '#D97706'} />
              <span>Pinned Topmost Overlay</span>
            </button>

            <button
              onClick={() => { setSelectedScenario('alt_tab'); setIsSimulating(true); }}
              className={`light-scenario-tab ${selectedScenario === 'alt_tab' && isSimulating ? 'active' : ''}`}
            >
              <RefreshCw size={15} color={selectedScenario === 'alt_tab' && isSimulating ? '#FDBA74' : '#EA580C'} />
              <span>Rapid Focus Jitter</span>
            </button>

            <button
              onClick={() => { setSelectedScenario('clean'); setIsSimulating(true); }}
              className={`light-scenario-tab ${selectedScenario === 'clean' || !isSimulating ? 'active' : ''}`}
            >
              <CheckCircle2 size={15} color={selectedScenario === 'clean' || !isSimulating ? '#6EE7B7' : '#059669'} />
              <span>Clean Candidate</span>
            </button>
          </div>

          {/* Dark-Framed Console Mockup */}
          <div className="ref-console-frame">
            {/* Console Top Bar */}
            <div style={{
              background: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              padding: '14px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F43F5E' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
                </div>
                <span style={{ fontSize: '0.8rem', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                  MONITORING ROOM: <strong style={{ color: '#0F172A' }}>#7C9A4B</strong> (DEMO CANDIDATE)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.76rem', color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}>
                  LIVE FEED: {tickerTime}
                </span>
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  style={{
                    background: isSimulating ? (current.riskScore > 50 ? '#E11D48' : '#059669') : '#111315',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {isSimulating ? <RotateCcw size={13} /> : <Play size={13} />}
                  <span>{isSimulating ? 'Reset to Clean' : 'Re-Inject Scenario'}</span>
                </button>
              </div>
            </div>

            {/* Console Body */}
            <div className="ref-grid-2" style={{ padding: '26px', gap: '24px' }}>
              {/* Left Diagnostic Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  background: current.riskScore > 50 ? '#FFF1F2' : '#ECFDF5',
                  border: `1px solid ${current.riskScore > 50 ? '#FECDD3' : '#A7F3D0'}`,
                  borderRadius: '16px',
                  padding: '22px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, letterSpacing: '0.08em' }}>
                      INTEGRITY STATUS
                    </span>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: current.color }}>
                      ● {current.statusText}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: current.riskScore > 50 ? '#FFE4E6' : '#D1FAE5',
                      border: `3px solid ${current.color}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: current.color, lineHeight: 1 }}>
                        {current.riskScore}
                      </span>
                      <span style={{ fontSize: '0.62rem', color: '#475569', fontWeight: 600 }}>/ 100</span>
                    </div>
                    <div>
                      <div style={{ color: current.color, fontWeight: 700, fontSize: '1.1rem' }}>
                        {current.riskLevel}
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#334155', marginTop: '4px', lineHeight: 1.5 }}>
                        {current.description}
                      </div>
                    </div>
                  </div>

                  {current.ruleFired && (
                    <div style={{
                      marginTop: '14px',
                      padding: '10px 12px',
                      background: '#FFE4E6',
                      border: '1px solid #FECDD3',
                      borderRadius: '10px',
                      fontSize: '0.76rem',
                      color: '#9F1239',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      {current.ruleFired}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Active Windows</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111315', marginTop: '4px' }}>
                      {current.windows.length}
                    </div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Scan Interval</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669', marginTop: '4px' }}>
                      3.0s
                    </div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Heartbeat</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#E54500', marginTop: '4px' }}>
                      10.0s
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Workspace Stream */}
              <div style={{
                background: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '18px',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                <div style={{
                  fontSize: '0.74rem',
                  color: '#64748B',
                  borderBottom: '1px solid #E2E8F0',
                  paddingBottom: '10px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span>WORKSPACE INTEGRITY STREAM</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>● LIVE HOOK</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {current.windows.map((win, idx) => {
                    const isAnomaly = win.captureStatus.includes('MASKED') || win.topmost || win.state === 'RAPID_JITTER';
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '11px 13px',
                          background: isAnomaly ? '#FFF1F2' : '#FFFFFF',
                          border: `1px solid ${isAnomaly ? '#FECDD3' : '#E2E8F0'}`,
                          borderRadius: '10px',
                          fontSize: '0.76rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: isAnomaly ? '#E11D48' : '#111315', fontWeight: 600 }}>
                            {win.title}
                          </span>
                          <span style={{ color: '#64748B', fontSize: '0.68rem', flexShrink: 0 }}>
                            {win.hwnd}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '14px', fontSize: '0.68rem', color: '#475569', marginTop: '5px' }}>
                          <span>Affinity: <strong style={{ color: win.captureStatus.includes('MASKED') ? '#E11D48' : '#334155' }}>{win.captureStatus}</strong></span>
                          <span>Topmost: <strong style={{ color: win.topmost ? '#E11D48' : '#64748B' }}>{win.topmost ? 'YES' : 'NO'}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Two Clean Feature Highlights Under Console */}
          <div className="ref-grid-2" style={{ marginTop: '28px' }}>
            <div style={{ background: 'var(--ref-stone)', borderRadius: '16px', padding: '24px', border: '1px solid #E5E7EB', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Wifi size={18} color="#E54500" />
              </div>
              <div>
                <h4 className="ref-heading" style={{ fontSize: '1rem', fontWeight: 700, color: '#111315', textTransform: 'none', letterSpacing: '-0.01em', marginBottom: '6px' }}>
                  30-Second Disconnect Detection
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--ref-slate)', lineHeight: 1.55 }}>
                  If a candidate closes the agent or loses connectivity mid-interview, the live room immediately flags an offline warning banner.
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--ref-stone)', borderRadius: '16px', padding: '24px', border: '1px solid #E5E7EB', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={18} color="#E54500" />
              </div>
              <div>
                <h4 className="ref-heading" style={{ fontSize: '1rem', fontWeight: 700, color: '#111315', textTransform: 'none', letterSpacing: '-0.01em', marginBottom: '6px' }}>
                  1-Click CSV &amp; JSON Audit Export
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--ref-slate)', lineHeight: 1.55 }}>
                  Download full session logs with timestamps, severity tags, and detected process lists directly from the post-interview review page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. MID-PAGE SHADER CTA BANNER ────────────────────────────────── */}
      <ShaderBackground style={{ padding: '56px 0', textAlign: 'center' }}>
        <div className="ref-container">
          <h2 className="ref-heading" style={{ fontSize: 'clamp(1.8rem, 3.6vw, 2.5rem)', fontWeight: 700, marginBottom: '12px' }}>
            Run fairer technical interviews with your team.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem', marginBottom: '24px' }}>
            Create a live monitoring room in seconds and share a single-use 6-character code.
          </p>
          <button
            onClick={() => navigate('/sessions')}
            className="ref-btn ref-btn-white"
          >
            <span>Launch Interviewer Room</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </ShaderBackground>

      {/* ── 9. WHITE SECTION: LAUNCH IN SECONDS (CANDIDATE WORKFLOW) ──────── */}
      <section style={{ background: '#FFFFFF', padding: '88px 0' }}>
        <div className="ref-container">
          <div className="ref-hero-grid">
            <div>
              <div className="ref-eyebrow" style={{ color: 'var(--ref-cobalt)', marginBottom: '10px' }}>
                CANDIDATE EXPERIENCE
              </div>
              <h2 className="ref-heading" style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', fontWeight: 700, marginBottom: '16px' }}>
                Launch in seconds. Zero installation required.
              </h2>
              <p style={{ color: 'var(--ref-slate)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '28px' }}>
                Candidates don’t create accounts or install system drivers. They download the portable executable, enter their 6-character room code, review the transparency notice, and begin.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <button onClick={() => navigate('/join')} className="ref-btn ref-btn-cobalt">
                  <Download size={16} />
                  <span>Open Candidate Portal</span>
                </button>
                <button onClick={() => navigate('/login')} className="ref-btn ref-btn-outline-dark">
                  <span>One-Click Demo Access</span>
                </button>
              </div>
            </div>

            <div style={{
              background: 'var(--ref-pink)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid #F7D8E8',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { step: '01', title: 'Download Portable .exe', desc: 'Single Windows executable hosted on GitHub Releases.' },
                  { step: '02', title: 'Enter 6-Character Room Code', desc: 'Single-use code generated by your interviewer.' },
                  { step: '03', title: 'Explicit Consent & Live Status', desc: 'Candidate clicks "I Consent & Start Monitoring" and can stop anytime.' },
                ].map((s) => (
                  <div key={s.step} style={{ background: '#FFFFFF', borderRadius: '14px', padding: '18px', border: '1px solid #E5E7EB', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#E54500',
                      background: '#FFF3EB',
                      padding: '4px 8px',
                      borderRadius: '6px',
                    }}>
                      {s.step}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '3px' }}>{s.title}</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--ref-slate)' }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. SHADER SECTION: PRIVACY CHARTER GRID ─────────────────────── */}
      <ShaderBackground style={{ padding: '80px 0' }}>
        <div className="ref-container">
          <div style={{ maxWidth: '640px', marginBottom: '40px' }}>
            <div className="ref-eyebrow" style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '10px' }}>
              PRIVACY CHARTER
            </div>
            <h2 className="ref-heading" style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.6rem)', fontWeight: 700 }}>
              Built to respect candidate privacy.
            </h2>
          </div>

          <div className="ref-grid-3">
            {[
              { title: 'Zero Webcam Recording', desc: 'Never accesses cameras or captures candidate video feeds.' },
              { title: 'Zero Microphone Access', desc: 'Audio streams are completely untouched by the companion.' },
              { title: 'Zero Keystroke Logging', desc: 'Typed commands, code, and passwords are never recorded.' },
              { title: 'Zero Screen Screenshots', desc: 'No pixel buffers or desktop screenshots are ever captured.' },
              { title: 'Zero Admin Privileges', desc: 'Runs cleanly in user-space without modifying system registries.' },
              { title: 'Full Candidate Control', desc: 'Visible window status with an instant "Stop Monitoring" button.' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(17, 19, 21, 0.25)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '14px',
                  padding: '22px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CheckCircle2 size={17} color="#86EFAC" />
                  <span style={{ fontWeight: 700, fontSize: '0.96rem' }}>{item.title}</span>
                </div>
                <p style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ShaderBackground>

      {/* ── 11. DARK CHARCOAL SPOTLIGHT: AUDIT & COMPLIANCE ──────────────── */}
      <section style={{ background: 'var(--ref-charcoal)', color: '#FFFFFF', padding: '72px 0' }}>
        <div className="ref-container">
          <div className="ref-hero-grid">
            <div>
              <div className="ref-eyebrow" style={{ color: '#93C5FD', marginBottom: '12px' }}>
                POST-INTERVIEW AUDIT
              </div>
              <h2 className="ref-heading" style={{ fontSize: 'clamp(1.85rem, 3.4vw, 2.5rem)', fontWeight: 700, marginBottom: '14px' }}>
                Complete chronological evidence for hiring panels.
              </h2>
              <p style={{ color: '#D1D5DB', fontSize: '0.96rem', lineHeight: 1.6, marginBottom: '24px' }}>
                Every session ends with a structured review page summarizing high-severity flags, timeline events, and downloadable CSV/JSON audit logs.
              </p>
              <button
                onClick={() => navigate('/sessions')}
                className="ref-btn ref-btn-white"
              >
                <span>Open Sessions &amp; Audits</span>
                <ArrowRight size={15} />
              </button>
            </div>

            <div style={{
              background: '#27272A',
              border: '1px solid #3F3F46',
              borderRadius: '16px',
              padding: '22px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.78rem',
              color: '#E4E4E7',
              lineHeight: 1.8,
            }}>
              <div style={{ color: '#93C5FD', marginBottom: '8px' }}>interview_audit_session.csv</div>
              <div>"04:06:35Z", "session_started", "info", "agent"</div>
              <div style={{ color: '#FDA4AF' }}>
                "04:06:38Z", "suspicious_window_flagged", "high", "scanner", &#123;"suspicious_apps":["ghostly.exe"]&#125;
              </div>
              <div>"04:35:41Z", "agent_disconnected", "operational", "agent"</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. FAQ ACCORDION ────────────────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', padding: '88px 0' }}>
        <div className="ref-container" style={{ maxWidth: '880px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="ref-eyebrow" style={{ color: 'var(--ref-cobalt)', marginBottom: '10px' }}>
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="ref-heading" style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.6rem)', fontWeight: 700 }}>
              Clear answers before your next interview.
            </h2>
          </div>

          <div>
            {faqs.map((faq, idx) => (
              <div key={idx} className="light-accordion-item">
                <div
                  className="pro-accordion-header"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  style={{ padding: '20px 24px' }}
                >
                  <span className="ref-heading" style={{ fontSize: '1.02rem', fontWeight: 600, color: '#111315' }}>
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
                  <div style={{ color: '#4B5563', fontSize: '0.94rem', padding: '0 24px 20px', lineHeight: 1.65 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 13. FINAL CTA & CLEAN MULTI-COLUMN FOOTER ────────────────────── */}
      <section style={{ background: 'var(--ref-stone)', borderTop: '1px solid #E5E7EB', padding: '64px 0 48px' }}>
        <div className="ref-container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
            paddingBottom: '48px',
            borderBottom: '1px solid #E5E7EB',
            marginBottom: '40px',
          }}>
            <div>
              <h2 className="ref-heading" style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.3rem)', fontWeight: 700, marginBottom: '8px' }}>
                Verify your next technical interview.
              </h2>
              <p style={{ color: 'var(--ref-slate)', fontSize: '0.96rem' }}>
                Start a live monitoring session or share the candidate download portal.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/sessions')} className="ref-btn ref-btn-cobalt">
                <span>Launch Live Room</span>
                <ArrowRight size={15} />
              </button>
              <button onClick={() => navigate('/join')} className="ref-btn ref-btn-outline-dark">
                <Download size={15} />
                <span>Candidate Portal</span>
              </button>
            </div>
          </div>

          <footer style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '32px',
            fontSize: '0.86rem',
            color: 'var(--ref-slate)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: '#E54500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={13} color="#FFFFFF" />
                </div>
                <strong style={{ color: '#111315', fontSize: '0.95rem' }}>Interview Integrity</strong>
              </div>
              <p style={{ lineHeight: 1.55, color: '#6B7280' }}>
                Consent-based desktop telemetry for fair, transparent technical hiring.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <strong style={{ color: '#111315', marginBottom: '4px' }}>Platform</strong>
              <a href="/sessions" style={{ color: '#4B5563', textDecoration: 'none' }}>Interviewer Console</a>
              <a href="/join" style={{ color: '#4B5563', textDecoration: 'none' }}>Candidate Portal</a>
              <a href="/login" style={{ color: '#4B5563', textDecoration: 'none' }}>Demo Access</a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <strong style={{ color: '#111315', marginBottom: '4px' }}>Capabilities</strong>
              <a href="#capabilities" style={{ color: '#4B5563', textDecoration: 'none' }}>AI Assistant Detection</a>
              <a href="#blind-spot" style={{ color: '#4B5563', textDecoration: 'none' }}>Screen-Share Blind Spot</a>
              <a href="#simulator" style={{ color: '#4B5563', textDecoration: 'none' }}>Live Studio Simulator</a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <strong style={{ color: '#111315', marginBottom: '4px' }}>Downloads</strong>
              <a
                href="https://github.com/thewebguy-b/interview-integrity/releases/latest/download/Interview-Integrity-Agent.exe"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#E54500', fontWeight: 600, textDecoration: 'none' }}
              >
                Windows Portable .exe
              </a>
              <span style={{ color: '#6B7280', fontSize: '0.8rem' }}>Windows 10 / 11 • Zero Install</span>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
