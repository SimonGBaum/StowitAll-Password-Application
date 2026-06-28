# StowitAll — Application Documentation

**Version:** 1.0 | **Date:** June 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Application Entry Points](#3-application-entry-points)
4. [State Management](#4-state-management)
5. [Pages & Routes](#5-pages--routes)
6. [Reusable Components](#6-reusable-components)
7. [Custom Hooks](#7-custom-hooks)
8. [Libraries](#8-libraries)
9. [Services](#9-services)
10. [Styles & Design Tokens](#10-styles--design-tokens)
11. [Database](#11-database)
12. [Edge Functions](#12-edge-functions)
13. [Security Model](#13-security-model)
14. [Dependencies](#14-dependencies)

---

## 1. Project Overview

StowitAll is a client-side encrypted password manager built as a React 19 + Vite Single Page Application (SPA). All user passwords are encrypted on the user's device using AES-GCM 256-bit encryption before being transmitted to the server — the backend stores only ciphertext and cannot read user credentials under any circumstance.

The backend is Supabase, a hosted Backend-as-a-Service platform that provides PostgreSQL, authentication, Row Level Security, and serverless Edge Functions. There is no custom application server.

**Repository root:** `stowitall/`

```
stowitall/
├── client/          # React + Vite SPA
├── supabase/        # Supabase workspace (migrations, Edge Functions)
└── app_outline/     # Product specifications, wireframes, and style guide
```

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| UI Framework | React | 19.2.6 | Component-based SPA |
| Build Tool | Vite | 8.0.12 | Dev server and bundling (port 5174) |
| Routing | React Router DOM | 7.18.0 | Client-side routing |
| Backend-as-a-Service | Supabase JS SDK | 2.108.2 | Auth + database client |
| Database | PostgreSQL (Supabase hosted) | — | Relational data storage |
| Authentication | Supabase Auth | — | Email/password sessions, JWT |
| Encryption | Web Crypto API | Native browser API | AES-GCM 256-bit client-side encryption |
| Password Breach Check | Have I Been Pwned (HIBP) | via Edge Function | k-anonymity SHA-1 prefix lookup |
| HTTP Client | Axios | 1.18.1 | Skeleton only — currently unused |
| Styling | CSS Modules + CSS Custom Properties | — | Scoped component styles + design tokens |
| Runtime (Edge Functions) | Deno (Supabase-managed) | — | Serverless function execution |

---

## 3. Application Entry Points

### `client/index.html`
**Location:** `client/index.html`
**Type:** HTML Shell
**Function:** Root HTML document. Mounts the React application into `<div id="root">`. Loads Google Fonts (Cinzel and Inter) which are required by the design system.
**Interactions:** UI only — no database or API calls.

---

### `client/src/main.jsx`
**Location:** `client/src/main.jsx`
**Type:** React Entry Point
**Function:** Bootstraps the application in React 19 `StrictMode`. Wraps the entire application in the context provider chain that governs all global state.

**Provider order:** `AuthProvider → PasswordProvider → ToastProvider → SmokyVeilProvider → App`

**Interactions:** UI only — orchestrates context providers.

---

### `client/src/App.jsx`
**Location:** `client/src/App.jsx`
**Type:** Router Definition
**Function:** Defines all application routes using React Router v7's `createBrowserRouter`. Contains `RootRedirect` — a component that reads authentication state and redirects authenticated users to `/home` or renders the login screen for unauthenticated users.
**Interactions:** UI (routing), AuthContext (session check).

---

## 4. State Management

All global state is managed via React Context. Providers must remain in the nesting order defined in `main.jsx` — child providers may depend on the data exposed by parent providers.

### `AuthContext` — `client/src/context/AuthContext.jsx`
**Type:** React Context Provider
**Function:** Manages the entire authentication lifecycle. Fetches the current session on mount, subscribes to Supabase Auth state changes, and maintains the `user` object (undefined while loading, null when logged out, populated object when authenticated). The user object exposes: `id`, `email`, `firstName`, `lastName`, `username`.

| Method | Operation | Interacts With |
|---|---|---|
| `login(email, password)` | Authenticate | Supabase Auth |
| `logout()` | Destroy session | Supabase Auth |
| `signup(fields)` | Create account | Supabase Auth → `handle_new_user` trigger → `profiles` table |
| `updateProfile(changes)` | Update user record | Supabase Auth + `public.profiles` table |

**Interactions:** Supabase Auth, `public.profiles` table, all pages and components that need user identity.

---

### `PasswordContext` — `client/src/context/PasswordContext.jsx`
**Type:** React Context Provider
**Function:** Manages the full CRUD lifecycle for password entries. On mount (and whenever `user` changes), loads all records from `password_entries`, decrypts each one via `crypto.js`, and exposes the decrypted array as `records[]`. Before writing to the database, encrypts plaintext passwords via `crypto.js`.

| Method | Operation | Interacts With |
|---|---|---|
| `addRecord(record)` | CREATE | Encrypts via `crypto.js` → inserts into `password_entries` |
| `updateRecord(id, changes)` | UPDATE | Re-encrypts if password changed → updates `password_entries` |
| `deleteRecord(id)` | DELETE | Removes from `password_entries`; FK cascade removes audit log row |
| `forgePassword(components)` | Generate | Pure client-side — no DB or API call |

**Interactions:** `public.password_entries` table, `crypto.js`, PasswordCreationRoom page, Vault page.

---

### `ToastContext` — `client/src/context/ToastContext.jsx`
**Type:** React Context Provider
**Function:** Manages a queue of notification messages. Each toast carries a `message`, `type` (`info`, `success`, `error`), and auto-generated `id`. Toasts automatically dismiss after 3,500ms.
**Interactions:** UI only. Consumed by the `Toast` component and called from any page that needs user feedback.

---

### `SmokyVeilContext` — `client/src/context/SmokyVeilContext.jsx`
**Type:** React Context Provider
**Function:** Controls the full-screen page transition animation ("The Smoky Veil"). Manages a `phase` state (`idle → fade-in → hold → fade-out`). The `triggerVeil(callback)` method fires the animation sequence and executes the callback during the hold phase. Automatically skips animation and runs the callback immediately when `prefers-reduced-motion` is active.

**Three trigger points:** Successful login, logout, successful password Forge.
**Interactions:** UI only. Consumed by `SmokyVeil` component and called from AuthCard, page logout buttons, and GrandCrucible.

---

## 5. Pages & Routes

| Route | Page | Auth Required | Footer Nav |
|---|---|---|---|
| `/` | LoginSignUp | No | None |
| `/home` | Home | Yes | Contact, Vault, Logout |
| `/create` | PasswordCreationRoom | Yes | Contact, Home, Logout |
| `/vault` | Vault | Yes | None (Home link in header only) |
| `/profile` | Profile | Yes | Contact, Home, Logout |
| `/contact` | ContactUs | Yes | Home only |
| `*` | ErrorPage | No | Single Home button |

---

### LoginSignUp — `client/src/pages/LoginSignUp/LoginSignUp.jsx`
**Type:** Page (unauthenticated)
**Function:** Entry point for the application. Renders the `AuthCard` component, which handles both login and new account registration flows in a single view.
**Interactions:** AuthContext (login/signup) → Supabase Auth.

---

### Home — `client/src/pages/Home/Home.jsx`
**Type:** Page (authenticated)
**Function:** Authenticated landing page. Displays the StowitAll hero section (brand name, slogan, thematic quatrain) and a CTA button linking to The Password Creation Room. Provides the primary logout point via the footer nav.
**Interactions:** AuthContext (logout via footer), UI routing.

---

### PasswordCreationRoom — `client/src/pages/PasswordCreationRoom/PasswordCreationRoom.jsx`
**Type:** Page (authenticated) — Primary CRUD Interface
**Function:** The main interface for creating, editing, and deleting password entries. Features:
- Filter panel (by password name and company name)
- Record list with password reveal/hide toggle
- Inline form for creating new records and editing existing ones (Save / Cancel)
- GrandCrucible component for password generation
- Delete confirmation modal

**Interactions:** PasswordContext (CREATE, READ, UPDATE, DELETE) → `public.password_entries` via `crypto.js`.

---

### Vault — `client/src/pages/Vault/Vault.jsx`
**Type:** Page (authenticated) — Read + Strength Analysis
**Function:** Password storage and review page. Displays all entries in a table (password name, site name, date created, strength badge). Runs HIBP breach checks on load with staggered 200ms intervals to avoid rate limiting. Provides inline edit and delete. Has no footer navigation — intentionally isolated from Create, Profile, and Contact.
**Interactions:** PasswordContext (READ, UPDATE, DELETE) → `public.password_entries`; `hibp.js` → Supabase Edge Function (`hibp-password-check`) → HIBP external API.

---

### Profile — `client/src/pages/Profile/Profile.jsx`
**Type:** Page (authenticated) — Account Management
**Function:** Displays and edits the authenticated user's profile (first name, last name, username, email, password). Operates in read/edit toggle mode. Confirms password changes with a second input field that only appears when editing with a changed password. Uses `useBlocker` (React Router v7) to prevent accidental navigation away with unsaved changes.
**Interactions:** AuthContext (READ + UPDATE) → Supabase Auth + `public.profiles` table.

---

### ContactUs — `client/src/pages/ContactUs/ContactUs.jsx`
**Type:** Page (authenticated) — Static
**Function:** Displays StowitAll contact information: email, phone, GitHub, and LinkedIn links. No data interactions.
**Interactions:** UI only.

---

### ErrorPage — `client/src/pages/ErrorPage/ErrorPage.jsx`
**Type:** Page (catch-all)
**Function:** Renders for any unmatched route. Calls `logout()` on mount to clear any active session, since a 404 likely indicates a broken or stale session. Displays a branded error message with a single Home button.
**Interactions:** AuthContext (logout) → Supabase Auth.

---

## 6. Reusable Components

### Layout

#### `PageShell` — `client/src/components/PageShell/PageShell.jsx`
**Type:** Layout Wrapper Component
**Function:** Composes every authenticated page. Accepts slot props for NavBar (`navLeft`, `navCenter`, `navRight`) and FooterNav (`footerLeft`, `footerCenter`, `footerRight`). Pass `noFooter` to suppress the footer entirely (used by Vault).
**Interactions:** Renders `NavBar` + `<main>` + optional `FooterNav`.

#### `NavBar` — `client/src/components/NavBar/NavBar.jsx`
**Type:** Layout Component
**Function:** Sticky 64px application header with left, center, and right slot props. Uses `position: sticky; top: 0; z-index: 100`. Border and background use design tokens.
**Interactions:** UI only — receives slot content from parent pages via PageShell.

#### `FooterNav` — `client/src/components/FooterNav/FooterNav.jsx`
**Type:** Layout Component
**Function:** Sticky 52px application footer with left, center, and right slot props. Uses `position: sticky; bottom: 0; z-index: 100`.
**Interactions:** UI only — receives slot content from parent pages via PageShell.

---

### Navigation

#### `NavLink` — `client/src/components/NavLink/NavLink.jsx`
**Type:** Navigation Component
**Function:** Renders either a React Router `<Link>` (when `to` prop is provided) or a `<button>` (for actions like logout). Uses `useMatch` from React Router to apply an active style class when the current route matches.
**Interactions:** React Router DOM (routing + active state detection).

#### `AnvilLogo` — `client/src/components/AnvilLogo/AnvilLogo.jsx`
**Type:** Brand Component
**Function:** Renders an inline SVG anvil illustration with a glow filter layer and the "StowitAll" wordmark. Purely decorative.
**Interactions:** UI only.

---

### Forms & Inputs

#### `Input` — `client/src/components/Input/Input.jsx`
**Type:** Form Component
**Function:** Labeled text input field with full accessibility support. Accepts an `error` prop to display an error message below the field and sets `aria-invalid` + `aria-describedby` on the underlying `<input>` element. Supports `type`, `placeholder`, `disabled`, `readOnly`, and `autoComplete`.
**Interactions:** UI only — consumed by AuthCard, PasswordCreationRoom form, and Profile form.

#### `Button` — `client/src/components/Button/Button.jsx`
**Type:** UI Component
**Function:** Styled action button with three variants: `default` (forge-btn brushed-metal treatment with brass border and green inner glow), `destructive` (same base texture, red inner glow for delete actions), and `full-width`. Accepts `type` for form submission use.
**Interactions:** UI only — consumed throughout the application.

#### `AuthCard` — `client/src/components/AuthCard/AuthCard.jsx`
**Type:** Feature Component (Authentication)
**Function:** Self-contained login and sign-up form. Manages its own local field and error state. Toggles between login and sign-up modes. Performs client-side validation (required fields, email format, password match) before calling context methods. On successful login, triggers The Smoky Veil animation before navigating to `/home`.

| Action | Operation | Calls |
|---|---|---|
| Login submit | Authenticate | AuthContext.login → Supabase Auth |
| Sign-up submit | Create account | AuthContext.signup → Supabase Auth → `handle_new_user` trigger → `profiles` |
| Successful login | Navigation | SmokyVeilContext.triggerVeil → React Router navigate('/home') |

**Interactions:** AuthContext, SmokyVeilContext, ToastContext, React Router DOM.

---

### Feedback

#### `Toast` — `client/src/components/Toast/Toast.jsx`
**Type:** Feedback Component
**Function:** Reads from `ToastContext` and renders all active notifications as an overlay stack. Each toast shows a type label (`Success`, `Error`, `Info`) and message text. Clicking a toast dismisses it immediately. Uses `aria-live="assertive"` for screen reader accessibility.
**Interactions:** ToastContext (reads state, calls removeToast).

#### `Modal` — `client/src/components/Modal/Modal.jsx`
**Type:** Dialog Component
**Function:** Accessible confirmation modal dialog. Implements full focus-trapping (Tab / Shift+Tab cycles within the dialog), Escape to cancel, and returns focus to the triggering element on close. Uses `role="dialog"` and `aria-modal="true"`. Accepts `isDestructive` to style the confirm button with a red glow. Used for delete confirmations and unsaved-changes warnings.
**Interactions:** UI only — communicates results via `onConfirm` / `onCancel` callbacks.

---

### Feature

#### `GrandCrucible` — `client/src/components/GrandCrucible/GrandCrucible.jsx`
**Type:** Feature Component (Password Generator)
**Function:** The password generation widget on The Password Creation Room. Accepts parameter inputs controlling length, character sets (uppercase, lowercase, numbers, symbols), and other component controls. Calls `PasswordContext.forgePassword` to generate a password, then triggers The Smoky Veil animation on success. Forge sequence: character-swirl SVG animation (~400ms) → credential resolves → Smoky Veil fires. Cancellable via Escape or click-outside.
**Interactions:** PasswordContext (forgePassword), SmokyVeilContext (triggerVeil), ToastContext (success feedback).

#### `VaultDoorIcon` — `client/src/components/VaultDoorIcon/VaultDoorIcon.jsx`
**Type:** Decorative Component
**Function:** Inline SVG vault door illustration. Accepts an `isOpen` prop — when `true`, the lock ring transitions from Forest Green to Magical Aura Green via CSS color transition. Used as a visual state indicator in the Vault page header.
**Interactions:** UI only.

#### `DateTimeGroup` — `client/src/components/DateTimeGroup/DateTimeGroup.jsx`
**Type:** Display Component
**Function:** Renders the live Date-Time Group timestamp that appears in the top-right corner of all authenticated pages. Consumes the `useDateTime` hook which updates the formatted string every 1,000ms via `setInterval`.
**Interactions:** `useDateTime` hook (live browser clock data).

---

### Security

#### `ProtectedRoute` — `client/src/components/ProtectedRoute/ProtectedRoute.jsx`
**Type:** Route Guard Component
**Function:** Auth guard for all authenticated routes. Uses React Router v7's `<Outlet>` pattern — renders child routes when authenticated, or redirects to `/` when not. While session is loading (`loading === true`), renders nothing to prevent redirect flicker before the session check completes.
**Interactions:** AuthContext (reads `user` + `loading` state).

---

## 7. Custom Hooks

### `useDateTime` — `client/src/hooks/useDateTime.js`
**Type:** Custom Hook
**Function:** Returns a formatted date-time string that updates every 1,000ms via `setInterval`. Cleans up the interval on component unmount. Consumed exclusively by `DateTimeGroup`.
**Interactions:** UI only (browser clock — `Date`).

### `useSmokyVeil` — `client/src/hooks/useSmokyVeil.js`
**Type:** Custom Hook (Convenience Wrapper)
**Function:** Re-exports `useSmokyVeilContext` from `SmokyVeilContext.jsx`. Provides a stable named export so components can import from the hooks directory rather than directly reaching into the context module.
**Interactions:** SmokyVeilContext.

---

## 8. Libraries

### `supabaseClient.js` — `client/src/lib/supabaseClient.js`
**Type:** Client Singleton
**Function:** Instantiates and exports the Supabase JS client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the Vite environment. This singleton is the single connection point between the frontend and Supabase — all database and auth operations in `AuthContext` and `PasswordContext` flow through it.
**Interactions:** Supabase Auth, `public.profiles`, `public.password_entries`, `public.audit_log`.

---

### `crypto.js` — `client/src/lib/crypto.js`
**Type:** Encryption Library
**Function:** Provides client-side AES-GCM 256-bit encryption and decryption using the browser's native Web Crypto API. The encryption key is derived on every call via PBKDF2 and is never stored in memory or on disk between operations.

| Parameter | Value |
|---|---|
| Algorithm | AES-GCM 256-bit |
| Key derivation | PBKDF2, 100,000 iterations, SHA-256 |
| Key material | User's Supabase UUID |
| Salt | Fixed string `"stowitall-v1-salt"` |
| IV | 12 random bytes, freshly generated per encryption |
| Ciphertext format | `base64( iv[12 bytes] \|\| ciphertext )` |

| Function | Purpose |
|---|---|
| `encryptPassword(plaintext, userId)` | Returns base64 ciphertext string for database storage |
| `decryptPassword(encoded, userId)` | Returns original plaintext string |

**Interactions:** Called exclusively by `PasswordContext` — on every read from and write to `password_entries`.

---

### `hibp.js` — `client/src/lib/hibp.js`
**Type:** Security Library
**Function:** Computes password strength and checks for known data breaches. Strength is scored by calculating entropy bits (`log2(charsetSize) × length`) and classifying the result into five bands. Breach checking uses k-anonymity: only the first 5 characters of the SHA-1 hash are sent to the Edge Function — the full hash and the plaintext password never leave the device.

| Strength Band | Entropy Threshold | Display Color |
|---|---|---|
| Very Weak | < 28 bits | `--color-accent-error` (red) |
| Weak | < 36 bits | `--color-strength-weak` (orange) |
| Fair | < 60 bits | `--color-strength-fair` (amber) |
| Strong | < 128 bits | `--color-glow-safe` (green) |
| Very Strong | ≥ 128 bits | `--color-glow-safe` (green) |
| Compromised | breachCount > 0 | `--color-accent-error` (red) + ⚠ icon |

| Function | Purpose |
|---|---|
| `computeSHA1Prefix(password)` | Returns `{ prefix, suffix }` for k-anonymity lookup |
| `computePasswordStrength(password, breachCount)` | Returns `{ score, label, color, breached, breachCount, entropyBits }` |

**Interactions:** Called by Vault page; calls Supabase Edge Function `hibp-password-check`; result displayed as strength badge in Vault table.

---

## 9. Services

### `api.js` — `client/src/services/api.js`
**Type:** HTTP Client Skeleton (Unused)
**Function:** Defines an Axios instance with a base URL. Currently a placeholder — no application code calls it. All data operations go through the Supabase JS SDK directly via `supabaseClient.js`.
**Interactions:** None (unused in the current application).

---

## 10. Styles & Design Tokens

### `tokens.css` — `client/src/styles/tokens.css`
**Type:** CSS Custom Properties (Design Token System)
**Function:** Single source of truth for all visual constants. All component CSS files reference these tokens exclusively — no hardcoded hex values appear in component stylesheets.

**Color tokens:**

| Token | Value | Usage |
|---|---|---|
| `--color-bg-main` | `#1A222A` | Universal page canvas |
| `--color-primary` | `#2D6A4F` | Borders, accents, nav elements |
| `--color-secondary` | `#E0A96D` | Headers, active states |
| `--color-glow-safe` | `#52B788` | Glows, hover states, safe indicators |
| `--color-bg-error` | `#221E1F` | Error page canvas only |
| `--color-accent-error` | `#E63946` | Error alerts and error page only |
| `--color-strength-weak` | `#E07B39` | Password strength — Weak |
| `--color-strength-fair` | `#C9A84C` | Password strength — Fair |

**Typography tokens:** `--font-display` (Cinzel), `--font-ui` (Inter). Eight text-size steps: `--text-meta` (0.8125rem) through `--text-page-title` (2.5rem).

**Layout tokens:** `--header-height` (64px), `--footer-height` (52px), `--max-content` (960px), `--space-page-x` (48px), `--space-page-y` (32px), `--space-lg` (32px), `--space-md` (16px), `--space-sm` (8px).

### `global.css` — `client/src/styles/global.css`
**Type:** Global Stylesheet
**Function:** Universal resets (box-sizing, margin), base body background and font, and scrollbar styling. Imports `tokens.css`.
**Interactions:** Applied globally via import in `main.jsx`.

---

## 11. Database

All tables live in the `public` schema on the Supabase-hosted PostgreSQL instance. Row Level Security (RLS) is enabled on all three tables — users can only access their own rows.

### Tables

#### `public.profiles`
**Migration:** `supabase/supabase/migrations/20260623203619_create_profiles.sql`
**Type:** Database Table — User Identity
**Function:** Stores user display information. One row per authenticated user, linked to `auth.users` by `user_id`. Rows are auto-created by the `handle_new_user` trigger on signup — the frontend never directly INSERTs into this table.

| Column | Type | Constraints |
|---|---|---|
| `user_id` | uuid (PK) | FK → `auth.users(id)` ON DELETE CASCADE |
| `first_name` | varchar(100) | NOT NULL |
| `last_name` | varchar(100) | NOT NULL |
| `username` | varchar(50) | NOT NULL, UNIQUE |
| `created_at` | timestamptz | DEFAULT `now()` |
| `updated_at` | timestamptz | Auto-stamped by trigger |

**RLS:** SELECT, UPDATE own row only. INSERT via trigger only. DELETE cascades from `auth.users`.
**Interactions:** AuthContext (READ, UPDATE), `handle_new_user` trigger (INSERT).

---

#### `public.password_entries`
**Migration:** `supabase/supabase/migrations/20260623204050_create_password_entries.sql`
**Type:** Database Table — Primary Data Store
**Function:** Stores encrypted password records. `encrypted_password` contains the AES-GCM ciphertext — the server cannot decrypt this value. Also fires `password_entries_audit_trigger` on every INSERT and UPDATE.

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid (PK) | DEFAULT `gen_random_uuid()` |
| `user_id` | uuid | FK → `auth.users(id)` ON DELETE CASCADE |
| `password_name` | varchar(255) | NOT NULL |
| `site_name` | varchar(255) | NOT NULL |
| `site_url` | varchar(2048) | NULL |
| `username` | varchar(255) | NOT NULL |
| `encrypted_password` | text | AES-GCM ciphertext (base64). NOT NULL |
| `notes` | text | NULL |
| `created_at` | timestamptz | DEFAULT `now()` |
| `updated_at` | timestamptz | Auto-stamped by trigger |

**Indexes:** `password_entries_user_id_idx`, `password_entries_site_name_idx`
**RLS:** SELECT, INSERT, UPDATE, DELETE own rows only.
**Interactions:** PasswordContext (full CRUD), `crypto.js` (encrypt before write / decrypt after read), `password_entries_audit_trigger` (fires on INSERT and UPDATE).

---

#### `public.audit_log`
**Migration:** `supabase/supabase/migrations/20260623204151_create_audit_log.sql`
**Type:** Database Table — Immutable Audit Trail
**Function:** Records every INSERT and UPDATE on `password_entries`. Written exclusively by the `password_entries_audit_trigger` SECURITY DEFINER function — clients have no INSERT, UPDATE, or DELETE access. DELETE events on `password_entries` are captured implicitly via the FK `ON DELETE CASCADE`.

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid (PK) | DEFAULT `gen_random_uuid()` |
| `user_id` | uuid | FK → `auth.users(id)` ON DELETE CASCADE |
| `entry_id` | uuid | FK → `password_entries(id)` ON DELETE CASCADE |
| `action` | varchar(20) | CHECK: `'INSERT'`, `'UPDATE'`, or `'DELETE'` |
| `performed_at` | timestamptz | DEFAULT `now()` |

**RLS:** SELECT own rows only. No client write access — trigger-only.
**Interactions:** `password_entries_audit_trigger` (INSERT), AuthContext via Supabase (SELECT).

---

### Database Triggers & Functions

#### `handle_new_user`
**Type:** Database Trigger Function (SECURITY DEFINER)
**Fires:** AFTER INSERT on `auth.users`
**Function:** Auto-creates a row in `public.profiles` using signup metadata from `raw_user_meta_data` (first name, last name, username). Eliminates the need for any frontend INSERT on signup — the profile row exists by the time the client receives the auth response.
**Interactions:** `auth.users` (trigger source) → `public.profiles` (INSERT).

#### `profiles_updated_at_trigger`
**Type:** Database Trigger Function
**Fires:** BEFORE UPDATE on `public.profiles`
**Function:** Automatically stamps the `updated_at` column with `now()` on every profile update.
**Interactions:** `public.profiles` only.

#### `password_entries_audit_trigger`
**Type:** Database Trigger Function (SECURITY DEFINER)
**Fires:** AFTER INSERT or UPDATE on `public.password_entries`
**Function:** Writes a record to `public.audit_log` capturing `user_id`, `entry_id`, and the action type. SECURITY DEFINER bypasses RLS so the trigger can write to `audit_log` regardless of the calling user's own permissions.
**Interactions:** `public.password_entries` (trigger source) → `public.audit_log` (INSERT).

---

## 12. Edge Functions

### `hibp-password-check` — `supabase/supabase/functions/hibp-password-check/index.ts`
**Type:** Supabase Edge Function (Deno / TypeScript)
**Function:** Serverless proxy between the React client and the Have I Been Pwned Pwned Passwords API. The client never contacts HIBP directly — all external API traffic is routed through this function, which allows adding authentication, rate limiting, and CORS control at the function layer.

**Request flow:**
1. The Vault page calls `hibp.js` for each password entry
2. `hibp.js` computes the SHA-1 hash of the password and sends only the first 5 characters (the "prefix") to this function
3. The Edge Function queries HIBP: `GET https://api.pwnedpasswords.com/range/{prefix}`
4. HIBP returns all hash suffixes matching that prefix
5. The Edge Function returns the suffix list to the client
6. `hibp.js` checks whether the user's full hash suffix appears in the returned list and reads the breach count

This k-anonymity pattern ensures the full password (and its full hash) never leaves the user's device.

**Interactions:** Called by `hibp.js` (Vault page) → proxies to HIBP external API → returns suffix list → Vault page renders strength badges.

---

## 13. Security Model

| Layer | Mechanism | Purpose |
|---|---|---|
| Client-side encryption | AES-GCM 256-bit (Web Crypto API) | Passwords encrypted before leaving the browser |
| Key derivation | PBKDF2, 100,000 iterations, SHA-256 | Derives encryption key from user UUID; resistant to brute force |
| Key storage | None — re-derived per operation | Key material never persists in memory or local storage |
| Breach checking | SHA-1 k-anonymity via Edge Function | Full password hash never sent to any external service |
| Database isolation | Row Level Security (all tables) | Users cannot access other users' data at the DB layer |
| Authentication | Supabase Auth (JWT sessions) | Session tokens managed by the Supabase SDK |
| Audit trail | SECURITY DEFINER trigger | Immutable log clients cannot modify or delete |
| Route guards | `ProtectedRoute` component | Redirects unauthenticated access at the UI layer |

**Threat model note:** Encryption keys are currently derived from the user's Supabase UUID (not their master password). In the event of a Supabase breach exposing both ciphertexts and UUIDs, an attacker could decrypt stored passwords. Future hardening would incorporate the user's master password into key derivation so that the server never holds all the material needed to decrypt.

---

## 14. Dependencies

### Production

| Package | Version | Role |
|---|---|---|
| `react` | 19.2.6 | UI framework |
| `react-dom` | 19.2.6 | React DOM renderer |
| `react-router-dom` | 7.18.0 | Client-side routing |
| `@supabase/supabase-js` | 2.108.2 | Auth + database client |
| `axios` | 1.18.1 | HTTP client (skeleton — unused) |

### Development

| Package | Role |
|---|---|
| `vite` | Build tool and dev server |
| `@vitejs/plugin-react` | React Fast Refresh and JSX transform |
| `eslint` | Code linting |
| `@eslint/js` | ESLint JS core ruleset |
| `eslint-plugin-react-hooks` | Hooks linting rules |
| `eslint-plugin-react-refresh` | HMR safety linting |
| `globals` | Browser globals definition for ESLint |
