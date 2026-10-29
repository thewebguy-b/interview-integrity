-- Migration: 001_initial_schema
-- Creates all tables for the Interview Integrity Monitoring System.
-- Apply via: supabase db push or supabase migration up

-- Enable UUID extension.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles: Extends auth.users with display metadata.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.profiles (
    id          UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT   NOT NULL DEFAULT '',
    role        TEXT    NOT NULL DEFAULT 'interviewer' CHECK (role IN ('interviewer', 'admin')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Interviewers can only read and update their own profile.
CREATE POLICY "profiles: select own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles: update own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Auto-create a profile when a user is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- interview_sessions
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.interview_sessions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    interviewer_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    candidate_label TEXT        NOT NULL CHECK (length(candidate_label) BETWEEN 1 AND 256),
    status          TEXT        NOT NULL DEFAULT 'created'
                                CHECK (status IN ('created','paired','monitoring','ended','expired')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    paired_at       TIMESTAMPTZ,
    started_at      TIMESTAMPTZ,
    ended_at        TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '24 hours',
    retention_until TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '30 days'
);

CREATE INDEX idx_sessions_interviewer ON public.interview_sessions(interviewer_id);
CREATE INDEX idx_sessions_status      ON public.interview_sessions(status);
CREATE INDEX idx_sessions_expires_at  ON public.interview_sessions(expires_at);

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- Interviewers can only see their own sessions.
CREATE POLICY "sessions: select own" ON public.interview_sessions
    FOR SELECT USING (auth.uid() = interviewer_id);

CREATE POLICY "sessions: insert own" ON public.interview_sessions
    FOR INSERT WITH CHECK (auth.uid() = interviewer_id);

CREATE POLICY "sessions: update own" ON public.interview_sessions
    FOR UPDATE USING (auth.uid() = interviewer_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- pairing_codes: Single-use, short-lived, stored as bcrypt hashes.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.pairing_codes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID        NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    code_hash   TEXT        NOT NULL,           -- bcrypt hash; never plain text
    expires_at  TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,                    -- NULL = unused; non-NULL = consumed
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pairing_session ON public.pairing_codes(session_id);
CREATE INDEX idx_pairing_expires  ON public.pairing_codes(expires_at) WHERE consumed_at IS NULL;

-- No client-side RLS on pairing_codes: accessed server-side only via service role key.
ALTER TABLE public.pairing_codes ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- session_tokens: Short-lived agent authentication tokens.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.session_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID        NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    token_hash  TEXT        NOT NULL,           -- SHA-256 of the plain token
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tokens_session  ON public.session_tokens(session_id);
CREATE INDEX idx_tokens_hash     ON public.session_tokens(token_hash);
CREATE INDEX idx_tokens_expires  ON public.session_tokens(expires_at);

ALTER TABLE public.session_tokens ENABLE ROW LEVEL SECURITY;
-- Server-side only; no client RLS policies needed.

-- ─────────────────────────────────────────────────────────────────────────────
-- monitoring_events: All scanner and agent events, retained per policy.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.monitoring_events (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID        NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    event_type      TEXT        NOT NULL,
    severity        TEXT        NOT NULL CHECK (severity IN ('info','low','medium','high','operational')),
    source          TEXT        NOT NULL CHECK (source IN ('scanner','agent','backend','system')),
    schema_version  INTEGER     NOT NULL DEFAULT 1,
    event_payload   JSONB       NOT NULL DEFAULT '{}',
    occurred_at     TIMESTAMPTZ NOT NULL,
    received_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_session    ON public.monitoring_events(session_id);
CREATE INDEX idx_events_occurred   ON public.monitoring_events(occurred_at);
CREATE INDEX idx_events_severity   ON public.monitoring_events(severity);
CREATE INDEX idx_events_type       ON public.monitoring_events(event_type);
CREATE INDEX idx_events_payload    ON public.monitoring_events USING gin(event_payload);

ALTER TABLE public.monitoring_events ENABLE ROW LEVEL SECURITY;

-- Interviewers can read events for their own sessions.
CREATE POLICY "events: select own session" ON public.monitoring_events
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM public.interview_sessions WHERE interviewer_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- session_heartbeats: Agent and scanner health pings.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.session_heartbeats (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID        NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    component   TEXT        NOT NULL CHECK (component IN ('agent','scanner','connection')),
    status      TEXT        NOT NULL CHECK (status IN ('ok','degraded','failed')),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_heartbeats_session  ON public.session_heartbeats(session_id);
CREATE INDEX idx_heartbeats_occurred ON public.session_heartbeats(occurred_at);

ALTER TABLE public.session_heartbeats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "heartbeats: select own session" ON public.session_heartbeats
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM public.interview_sessions WHERE interviewer_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- allowlist_entries: Interviewer-managed application allowlist.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.allowlist_entries (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    interviewer_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    normalized_name TEXT        NOT NULL CHECK (length(normalized_name) BETWEEN 1 AND 256),
    executable_hash TEXT,                               -- Optional SHA-256 for stronger verification
    reason          TEXT        NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (interviewer_id, normalized_name)            -- No duplicates per interviewer
);

CREATE INDEX idx_allowlist_interviewer ON public.allowlist_entries(interviewer_id);

ALTER TABLE public.allowlist_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allowlist: select own" ON public.allowlist_entries
    FOR SELECT USING (auth.uid() = interviewer_id);

CREATE POLICY "allowlist: insert own" ON public.allowlist_entries
    FOR INSERT WITH CHECK (auth.uid() = interviewer_id);

CREATE POLICY "allowlist: update own" ON public.allowlist_entries
    FOR UPDATE USING (auth.uid() = interviewer_id);

CREATE POLICY "allowlist: delete own" ON public.allowlist_entries
    FOR DELETE USING (auth.uid() = interviewer_id);

-- Audit log for allowlist changes.
CREATE TABLE public.allowlist_audit (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    interviewer_id  UUID        NOT NULL,
    action          TEXT        NOT NULL CHECK (action IN ('added','updated','removed')),
    entry_snapshot  JSONB       NOT NULL,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_allowlist_audit_interviewer ON public.allowlist_audit(interviewer_id);

ALTER TABLE public.allowlist_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allowlist_audit: select own" ON public.allowlist_audit
    FOR SELECT USING (auth.uid() = interviewer_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Retention: automated deletion function.
-- ─────────────────────────────────────────────────────────────────────────────

-- Function to delete events past their session's retention_until date.
-- Invoke periodically (e.g. via pg_cron or Supabase scheduled functions).
CREATE OR REPLACE FUNCTION public.purge_expired_events()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.monitoring_events
    WHERE session_id IN (
        SELECT id FROM public.interview_sessions
        WHERE retention_until < now()
    );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Also expire sessions that have passed their expires_at without being consumed.
CREATE OR REPLACE FUNCTION public.expire_old_sessions()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.interview_sessions
    SET status = 'expired'
    WHERE expires_at < now()
      AND status NOT IN ('ended', 'expired');
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;
