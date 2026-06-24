# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this directory is

This is the Supabase workspace for the StowitAll password manager. The Supabase CLI is installed locally via npm and this workspace is already linked to a hosted Supabase project.

- **Linked project:** StowitAll Password Project (`wjjwifbihxnujfvrxtfq`)
- **Frontend:** `../client/` — React + Vite SPA

## Commands

```bash
# Run Supabase CLI commands via npx (from this directory)
npx supabase status
npx supabase db diff
npx supabase migration new <name>
npx supabase db push                # push local migrations to linked project
npx supabase db pull                # pull remote schema into local migrations
npx supabase gen types typescript --linked > ../client/src/types/supabase.ts
```

## Current state

All three migrations have been pushed and confirmed working:

| Migration | File | Status |
|---|---|---|
| 1 | `supabase/migrations/20260623203619_create_profiles.sql` | pushed ✓ |
| 2 | `supabase/migrations/20260623204050_create_password_entries.sql` | pushed ✓ |
| 3 | `supabase/migrations/20260623204151_create_audit_log.sql` | pushed ✓ |

The frontend Supabase client is wired up at `../client/src/lib/supabaseClient.js`.
Auth context (`../client/src/context/AuthContext.jsx`) and password context (`../client/src/context/PasswordContext.jsx`) call Supabase directly — no mocks remain.

## Schema (live on hosted project)

| Table | Key columns | Notes |
|---|---|---|
| `public.profiles` | `user_id` (PK/FK → auth.users), `first_name`, `last_name`, `username` | Auto-created by `handle_new_user` trigger on auth sign-up |
| `public.password_entries` | `id`, `user_id` (FK → auth.users), `password_name`, `site_name`, `site_url`, `username`, `encrypted_password`, `notes` | `encrypted_password` is AES-GCM ciphertext from app layer |
| `public.audit_log` | `id`, `user_id`, `entry_id` (FK → password_entries), `action` | Written by `log_password_entry_change` SECURITY DEFINER trigger; INSERT/UPDATE only — DELETE cascades |

All three tables have RLS enabled. Only authenticated users can access their own rows.

## Application-layer encryption

`../client/src/lib/crypto.js` implements AES-GCM encrypt/decrypt using the Web Crypto API.
- Key is derived per-user via PBKDF2 from `userId` + fixed app salt (`stowitall-v1-salt`), 100k iterations, SHA-256
- Ciphertext stored as base64: `iv[12 bytes] || ciphertext[n bytes]`
- Key is never persisted — re-derived on every operation

## Sign-up flow

`supabase.auth.signUp` passes `first_name`, `last_name`, `username` in `options.data`.
The `handle_new_user` DB trigger reads `raw_user_meta_data` and inserts into `public.profiles` automatically.
The client does **not** manually insert into `profiles`.

## Frontend environment variables

The client reads from `../client/.env`:

```
VITE_SUPABASE_URL=https://wjjwifbihxnujfvrxtfq.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-anon-key>
```

## Reference docs

- `reference/stowitall_testing_schema.sql` — original design DDL (reference only; not the live schema)
- `reference/StowitAll_User_Journey_v2.md` — full interaction spec for all seven page states
- `../client/skeleton/` — wireframes and style guide
