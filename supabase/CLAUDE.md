# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this directory is

This is the Supabase workspace for the StowitAll password manager. The Supabase CLI is installed locally via npm and this workspace is already linked to a hosted Supabase project.

- **Linked project:** StowitAll Password Project (`wjjwifbihxnujfvrxtfq`)
- **Frontend:** `../client/` — React + Vite SPA that must be wired to Supabase once the back-end phase begins

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

The frontend (`../client/`) is fully built with mock data stubs. Every context file in `../client/src/context/` has `// TODO: back-end phase` comments marking where real Supabase calls must replace the mocks:

- `AuthContext.jsx` — hardcoded `MOCK_USER`; needs `supabase.auth.signIn/signUp/signOut`
- `PasswordContext.jsx` — hardcoded `MOCK_RECORDS`; needs encrypted read/write to the `password_entries` table

No migrations have been created yet. The reference schema lives in `reference/stowitall_testing_schema.sql` — treat it as the design target, not a file to run directly.

## Intended schema

Three tables (see `reference/stowitall_testing_schema.sql`):

| Table | Key columns |
|---|---|
| `users` | `id` (UUID), `email` (unique), `username` (unique), `password_hash` |
| `password_entries` | `id`, `user_id` (FK → users), `site_name`, `site_url`, `username`, `encrypted_password`, `notes` |
| `audit_log` | `id`, `user_id` (FK → users), `entry_id`, `action`, `performed_at` |

Passwords stored in `password_entries.encrypted_password` must be **application-layer encrypted** — this is a password *manager*, not just an auth system. Do not store plaintext or only hash them.

## Frontend environment variables

The client reads these from `../client/.env`:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-anon-key>
```

Retrieve both from the Supabase dashboard (Project Settings → API) or via `npx supabase status` once local dev is running.

## Reference docs

- `reference/stowitall_testing_schema.sql` — target schema DDL
- `reference/StowitAll_User_Journey_v2.md` — full interaction spec for all seven page states
- `../client/skeleton/` — wireframes and style guide
