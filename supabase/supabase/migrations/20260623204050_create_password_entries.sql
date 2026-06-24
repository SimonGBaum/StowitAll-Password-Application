-- Migration 2: password_entries table
-- Stores one encrypted credential record per row. All columns are required
-- except site_url (not all entries have a URL) and notes (optional free-text).
-- encrypted_password is an opaque TEXT blob — the DB never transforms it.

-- ============================================================
-- password_entries table
-- ============================================================
CREATE TABLE public.password_entries (
  id                 uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_name      VARCHAR(255)   NOT NULL,
  site_name          VARCHAR(255)   NOT NULL,
  site_url           VARCHAR(2048)  NULL,  -- nullable: not all entries have a URL
  username           VARCHAR(255)   NOT NULL,  -- external-site login name
  encrypted_password TEXT           NOT NULL,  -- opaque blob; app layer handles encryption
  notes              TEXT           NULL,  -- nullable: optional free-text
  created_at         TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- updated_at trigger (reuses set_updated_at() created in Migration 1)
CREATE TRIGGER password_entries_updated_at_trigger
BEFORE UPDATE ON public.password_entries
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Indexes
-- ============================================================

-- FK column index: required for FK enforcement and RLS predicate lookups
CREATE INDEX password_entries_user_id_idx ON public.password_entries (user_id);

-- site_name index: per implementation standards, low-cost, supports future
-- server-side filtering without requiring a migration later
CREATE INDEX password_entries_site_name_idx ON public.password_entries (site_name);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.password_entries ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own records
CREATE POLICY "password_entries_select_own"
  ON public.password_entries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Authenticated users can insert their own records
CREATE POLICY "password_entries_insert_own"
  ON public.password_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Authenticated users can update their own records
CREATE POLICY "password_entries_update_own"
  ON public.password_entries FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Authenticated users can delete their own records (hard delete; UI must confirm)
CREATE POLICY "password_entries_delete_own"
  ON public.password_entries FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- No anon access on any operation.
