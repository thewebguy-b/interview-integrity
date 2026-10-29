import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

export interface Session {
  user: { id: string; email: string | undefined };
  access_token?: string;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(() => {
    const saved = localStorage.getItem('demo_session');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const s: Session = {
          user: { id: data.session.user.id, email: data.session.user.email },
          access_token: data.session.access_token,
        };
        setSession(s);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      if (s?.user) {
        const sess: Session = {
          user: { id: s.user.id, email: s.user.email },
          access_token: s.access_token,
        };
        setSession(sess);
      } else if (!localStorage.getItem('demo_session')) {
        setSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
    }
  }, []);

  const demoSignIn = useCallback(() => {
    const demo: Session = {
      user: { id: '00000000-0000-0000-0000-000000000001', email: 'interviewer@integrity.io' },
      access_token: 'demo-interviewer-jwt-token',
    };
    localStorage.setItem('demo_session', JSON.stringify(demo));
    setSession(demo);
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem('demo_session');
    try {
      await supabase.auth.signOut();
    } catch {}
    setSession(null);
  }, []);

  return { session, loading, error, signIn, demoSignIn, signOut };
}
