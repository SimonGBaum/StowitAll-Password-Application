-- Migration 3: audit_log table + password_entries audit trigger
--
-- audit_log is an immutable append-only table written exclusively by a
-- SECURITY DEFINER trigger. No client role can INSERT, UPDATE, or DELETE rows
-- directly. Only SELECT (own rows) is exposed via RLS.
--
-- Cascade conflict note: entry_id has ON DELETE CASCADE to password_entries.
-- When a password entry is deleted, its audit rows are also deleted by the
-- cascade. An AFTER DELETE trigger inserting into audit_log would reference
-- a deleted parent and fail the FK check. Therefore, only INSERT and UPDATE
-- events are audited; DELETE is acknowledged in the CHECK constraint but
-- never written by this trigger.

-- ============================================================
-- audit_log table
-- ============================================================
CREATE TABLE public.audit_log (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id     uuid         NOT NULL REFERENCES public.password_entries(id) ON DELETE CASCADE,
  action       VARCHAR(20)  NOT NULL,
  performed_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT audit_log_action_check CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- ============================================================
-- Indexes
-- ============================================================

-- FK column indexes: required for FK enforcement and RLS predicate lookups
CREATE INDEX audit_log_user_id_idx  ON public.audit_log (user_id);
CREATE INDEX audit_log_entry_id_idx ON public.audit_log (entry_id);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own audit rows only
CREATE POLICY "audit_log_select_own"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: no policy — handled exclusively by SECURITY DEFINER trigger below.
-- UPDATE: no policy — audit records are immutable.
-- DELETE: no policy — rows are removed only via ON DELETE CASCADE from password_entries.
-- No anon access on any operation.

-- ============================================================
-- Audit trigger: logs INSERT and UPDATE on password_entries
-- SECURITY DEFINER so the function runs with owner privileges and
-- bypasses RLS on audit_log (clients cannot write here directly).
-- ============================================================
CREATE OR REPLACE FUNCTION log_password_entry_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (user_id, entry_id, action)
    VALUES (NEW.user_id, NEW.id, 'INSERT');
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (user_id, entry_id, action)
    VALUES (NEW.user_id, NEW.id, 'UPDATE');
  END IF;
  -- DELETE is intentionally not handled: ON DELETE CASCADE removes existing
  -- audit rows for the entry, and a new row referencing the deleted entry_id
  -- would fail the FK check.
  RETURN NEW;
END;
$$;

CREATE TRIGGER password_entries_audit_trigger
  AFTER INSERT OR UPDATE ON public.password_entries
  FOR EACH ROW EXECUTE FUNCTION log_password_entry_change();
