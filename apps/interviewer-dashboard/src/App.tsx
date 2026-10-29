import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import { LandingPage } from './pages/LandingPage.js';
import { CandidatePortalPage } from './pages/CandidatePortalPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { SessionsPage } from './pages/SessionsPage.js';
import { LiveSessionPage } from './pages/LiveSessionPage.js';
import { SessionReviewPage } from './pages/SessionReviewPage.js';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://interview-integrity-backend.onrender.com';

export function App() {
  const { session, loading, error, signIn, demoSignIn, signOut } = useAuth();

  const token = (session as any)?.access_token || 'demo-interviewer-jwt-token';
  const email = session?.user?.email || 'interviewer@integrity.io';

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Candidate Portal */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/join" element={<CandidatePortalPage />} />
        <Route path="/candidate" element={<CandidatePortalPage />} />

        {/* Interviewer Dashboard Routes (Protected by Auth / Login) */}
        <Route
          path="/login"
          element={
            session ? (
              <Navigate to="/sessions" replace />
            ) : (
              <LoginPage
                onSignIn={signIn}
                onDemoSignIn={demoSignIn}
                error={error}
                loading={loading}
              />
            )
          }
        />

        <Route
          path="/sessions"
          element={
            session ? (
              <SessionsPage
                interviewerEmail={email}
                onSignOut={signOut}
                backendUrl={BACKEND_URL}
                token={token}
              />
            ) : (
              <LoginPage
                onSignIn={signIn}
                onDemoSignIn={demoSignIn}
                error={error}
                loading={loading}
              />
            )
          }
        />

        <Route
          path="/sessions/:sessionId/live"
          element={
            session ? (
              <LiveSessionPage
                backendUrl={BACKEND_URL}
                token={token}
              />
            ) : (
              <LoginPage
                onSignIn={signIn}
                onDemoSignIn={demoSignIn}
                error={error}
                loading={loading}
              />
            )
          }
        />

        <Route
          path="/sessions/:sessionId/review"
          element={
            session ? (
              <SessionReviewPage
                backendUrl={BACKEND_URL}
                token={token}
              />
            ) : (
              <LoginPage
                onSignIn={signIn}
                onDemoSignIn={demoSignIn}
                error={error}
                loading={loading}
              />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
