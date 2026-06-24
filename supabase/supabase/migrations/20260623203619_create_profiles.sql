-- Migration 1: profiles table
-- Creates the shared updated_at trigger function, the profiles table (extending
-- auth.users), and a trigger that auto-creates a profile row on auth sign-up.

-- ============================================================
-- Shared trigger function: keeps updated_at current on UPDATE.
-- Reused by password_entries in Migration 2.
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- profiles table
-- One row per auth.users account. user_id is both PK and FK.
-- ============================================================
CREATE TABLE public.profiles (
  user_id     uuid          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name  VARCHAR(100)  NOT NULL,
  last_name   VARCHAR(100)  NOT NULL,
  username    VARCHAR(50)   NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT profiles_username_unique UNIQUE (username)
);

-- updated_at trigger
CREATE TRIGGER profiles_updated_at_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own row
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Authenticated users can insert their own row
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Authenticated users can update their own row
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- No DELETE policy: row deletion cascades from auth.users only.
-- No anon access on any operation.

-- ============================================================
-- Auto-create profile on auth sign-up
-- The frontend must pass first_name, last_name, username via
-- supabase.auth.signUp({ options: { data: { ... } } }).
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
