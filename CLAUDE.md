# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: StowitAll Password Application

Full-stack password manager. **There is no Django backend** — the project is a React + Vite SPA backed directly by Supabase (hosted PostgreSQL + auth).

## Stack

- **Frontend:** React 19, Vite, React Router v7, CSS Modules + CSS custom properties
- **Backend-as-a-service:** Supabase (auth, PostgreSQL, Row Level Security)
- **Encryption:** Web Crypto API (AES-GCM, PBKDF2 key derivation) — client-side, in `client/src/lib/crypto.js`
- **Password strength / breach checking:** `client/src/lib/hibp.js` — entropy scoring + SHA-1 k-anonymity check via a Supabase Edge Function (`supabase/supabase/functions/hibp-password-check/`)
- **HTTP client:** Axios (`client/src/services/api.js`) — currently a skeleton, not wired up; all data goes through the Supabase JS client

## Development Commands

All frontend commands run from `client/`:

```bash
cd client
npm install       # install dependencies
npm run dev       # Vite dev server on http://localhost:5174
npm run build     # production build → client/dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint
```

No test suite is configured — `npm test` will fail.

### Supabase CLI (run from `supabase/`)

Note: the Supabase workspace uses a nested layout — config lives in `supabase/supabase/` (migrations, functions, config.toml).

```bash
cd supabase
npx supabase status
npx supabase db diff                # diff local schema vs remote
npx supabase migration new <name>   # create a new migration
npx supabase db push                # push migrations to hosted project
npx supabase db pull                # pull remote schema changes
npx supabase gen types typescript --linked   # regenerate TS types
```

Edge Functions live in `supabase/supabase/functions/hibp-password-check/`. Deploy with `npx supabase functions deploy hibp-password-check`.

### Environment

`client/.env` must contain:

```
VITE_SUPABASE_URL=<project url>
VITE_SUPABASE_ANON_KEY=<anon key>
```

Vite only exposes `VITE_`-prefixed vars to the browser.

## Architecture

### Frontend layout

```
client/
  src/
    context/        # React Context providers (auth, passwords, toasts, animation)
    hooks/          # useDateTime.js (live timestamp, 1s interval), useSmokyVeil.js (veil wrapper)
    lib/            # supabaseClient.js, crypto.js, hibp.js
    components/     # Reusable UI (NavBar, FooterNav, GrandCrucible, SmokyVeil, …)
    pages/          # Route-level views
    services/       # api.js skeleton (unused — see note above)
    styles/         # tokens.css (design tokens), global.css
  vite.config.js
  index.html        # Google Fonts loaded here
```

### PageShell (layout wrapper)

Every authenticated page renders through `PageShell`, which composes the sticky NavBar + main content area + optional FooterNav:

```jsx
<PageShell
  navLeft={<AnvilLogo />}
  navCenter="Page Title"
  navRight={<DateTimeGroup />}
  footerLeft={<NavLink to="/contact">Contact</NavLink>}
  footerCenter={<NavLink to="/home">Home</NavLink>}
  footerRight={<button onClick={logout}>Logout</button>}
  noFooter={false}   // pass noFooter to suppress the footer entirely (used by Vault)
>
  {/* page content */}
</PageShell>
```

NavBar and FooterNav each accept `left`, `center`, and `right` slot props. Pass `noFooter` for pages that have no footer nav (The Vault).

### Context providers (state management)

Providers wrap the app in this order in `main.jsx`:

```
AuthProvider → PasswordProvider → ToastProvider → SmokyVeilProvider → App
```

| Context | Key state / methods |
|---|---|
| `AuthContext` | `user` (undefined/null/object), `loading`; `login`, `logout`, `signup`, `updateProfile` |
| `PasswordContext` | `records[]` (decrypted); `addRecord`, `updateRecord`, `deleteRecord`, `forgePassword` |
| `ToastContext` | `toasts[]`; `addToast(message, type)`, `removeToast(id)` — auto-dismiss 3500ms |
| `WalkingTransitionContext` | `phase`; `triggerWalk(callback, durationMs)` — corridor overlay for all page navigations |

Each context file exports a named hook — always use these instead of `useContext` directly:

```js
import { useAuth }               from '../context/AuthContext';
import { usePasswords }          from '../context/PasswordContext';
import { useWalkingTransition }  from '../context/WalkingTransitionContext';
```

**`AuthContext.user` has three distinct states:** `undefined` = session not yet resolved (show nothing / spinner), `null` = unauthenticated, object = authenticated. `ProtectedRoute` and `RootRedirect` both depend on this distinction — treat `undefined` as "still loading", not as "logged out".

### Encryption

`client/src/lib/crypto.js` — AES-GCM 256-bit, key derived via PBKDF2 (100k iterations, SHA-256). Key material is the user's Supabase UUID; salt is the fixed string `"stowitall-v1-salt"`. Key is re-derived on every call and never stored. Ciphertext stored as base64 (`iv[12 bytes] || ciphertext`) in `password_entries.encrypted_password`.

`PasswordContext.forgePassword()` uses `Math.random()`, not the Web Crypto API — intentional for speed, but passwords are not cryptographically random. Do not change this to `crypto.getRandomValues` without updating the strength-scoring logic.

`rowToRecord()` in `PasswordContext` is the only place that maps DB snake_case column names to the camelCase shape the UI uses (`password_name` → `passwordName`, etc.). When adding a new DB column, update this function and the insert/update calls alongside it.

### Breach Detection & Password Strength (HIBP)

The HIBP integration uses a **k-anonymity proxy pattern** — the plaintext password never leaves the browser, and the full SHA-1 hash never reaches HIBP.

**Flow:**
1. `client/src/lib/hibp.js` → `computeSHA1Prefix(password)` hashes the password with `crypto.subtle.digest('SHA-1')` and splits the result into a 5-char `prefix` and the remaining `suffix`
2. Client calls `supabase.functions.invoke('hibp-password-check', { body: { hashPrefix: prefix } })` — the Supabase JS client automatically attaches the user's JWT
3. Edge Function (`supabase/supabase/functions/hibp-password-check/index.ts`) validates the JWT, then proxies the prefix to `api.pwnedpasswords.com/range/{prefix}` with `Add-Padding: true`
4. HIBP returns ~500–1000 `SUFFIX:COUNT` lines; the Edge Function forwards them to the client
5. Client checks whether its own `suffix` appears in the list to get the breach count
6. `computePasswordStrength(password, breachCount)` scores by entropy (charset size × log₂ × length); a non-zero `breachCount` overrides to "Compromised" regardless of entropy

**Where it runs:**
- `GrandCrucible` — fires automatically after every Forge; shows a 4-segment strength bar + breach warning
- `Vault` — runs on mount for every record (staggered 200ms per record to avoid rate limiting); shows a colored badge in the "Strength" column

**Never call `api.pwnedpasswords.com` directly from the browser** — always go through the Edge Function so the user's JWT is required and the proxy headers are set correctly.

### Database schema (Supabase, all migrations live)

| Table | Purpose | RLS |
|---|---|---|
| `public.profiles` | name + username, 1:1 with `auth.users` | own row only |
| `public.password_entries` | encrypted credentials | own rows only |
| `public.audit_log` | INSERT/UPDATE/DELETE log (written by SECURITY DEFINER trigger) | SELECT own rows only; clients cannot write |

`profiles` rows are auto-created by the `handle_new_user` trigger — no frontend INSERT needed on signup.

## Pages & Navigation

| Route | Page | Auth required | Footer nav |
|---|---|---|---|
| `/` | Login / Sign-Up | No | — |
| `/home` | Home | Yes | Contact, Vault, Logout |
| `/create` | The Password Creation Room | Yes | Contact, Home, Logout |
| `/vault` | The Vault | Yes | **None** — Home header link only |
| `/profile` | Profile | Yes | Contact, Home, Logout |
| `/contact` | Contact Us | Yes | Home button only |
| `*` | Error | No | Single "Home" button; no Logout |

Navigation constraints:
- The Vault has **no footer nav** — no direct path to Create, Profile, or Contact Us.
- Profile and Contact Us have no direct path to The Vault or The Password Creation Room — must go via Home.
- Error page logs out the user before rendering so "Home" routes to Login if the session was the cause.
- `/` renders `RootRedirect`: authenticated users go to `/home`, unauthenticated users see the LoginSignUp page.

## Design System

Full spec in `app_outline/style_guide.md`. Tokens live in `client/src/styles/tokens.css`.

### Color tokens (always use CSS custom properties — never hardcode hex)

```css
:root {
  --color-bg-main:      #1A222A;  /* Deep Slate — universal page canvas */
  --color-primary:      #2D6A4F;  /* Imperial Forest Green — borders, accents, nav */
  --color-secondary:    #E0A96D;  /* Burnished Brass/Gold — headers, active states */
  --color-glow-safe:    #52B788;  /* Magical Aura Green — glows, hover, active */
  --color-bg-error:        #221E1F;  /* Error page canvas ONLY */
  --color-accent-error:    #E63946;  /* Error alerts, error page glow ONLY */
  --color-strength-weak:   #E07B39;  /* Password strength — Weak */
  --color-strength-fair:   #C9A84C;  /* Password strength — Fair */
}
```

`--color-bg-error` and `--color-accent-error` must not appear on any page except Error.

### Typography

- **Headers / structural titles:** `Cinzel` (700 weight), `color: var(--color-secondary)`. Never below 0.85rem.
- **Everything else (buttons, forms, body, nav):** `Inter`, `color: #FFFFFF`.
- Both loaded from Google Fonts in `index.html`.

### Buttons

All action buttons use the `.forge-btn` brushed-metal treatment (dark gradient base, `--color-secondary` border, `--color-glow-safe` inner glow). Destructive actions (Delete) swap inner glow to `--color-accent-error` only — base texture stays the same.

### Animations

**Walking Transition** — fires on every page navigation (login, logout, NavLink clicks, CTA buttons). Dark stone-corridor overlay with torch flicker and a walking jog. Duration varies by destination — all values in `client/src/lib/animationConstants.js`. `triggerWalk(callback, durationMs)` from `useWalkingTransition()`. The `NavLink` component (with a `to` prop) triggers it automatically; manual navigations (logout, CTA buttons) call `triggerWalk` explicitly.

**Smoky Veil (Forge)** — fires only when the anvil is struck in The Grand Crucible. Organic smoke erupts from viewport center, covers the screen, then dissipates. Implemented entirely inside `GrandCrucible` as a local `ForgeSmoke` component (`position: fixed`) — no context needed.

**Grand Crucible forge sequence:**
1. Click anvil → hammer swings down (`HAMMER_DURATION` = 350ms)
2. Hammer contact → sparks, smoke expansion, character scramble all start simultaneously
3. Smoke covers screen → scramble stops, new password placed in output field
4. Smoke dissipates → password revealed

All timing constants live in `client/src/lib/animationConstants.js` — the single place to tune any animation duration.

Always respect `prefers-reduced-motion` — `triggerWalk` and GrandCrucible both skip animation and execute callbacks immediately when the media query matches. The forge instantly shows the password with no smoke or hammer animation.

### Layout

- Target: desktop only (1080p–1440p). Mobile is out of scope for v1.
- Sticky 64px header, sticky 52px footer. Content area fills between them with `overflow-y: auto`.
- Max content column: 960px, centered.
- Use CSS flexbox/grid. No fixed pixel widths on containers.

## In-World Terminology

Use these terms consistently in all UI strings, labels, and copy. Never substitute plain-English equivalents in the UI.

| StowitAll Term | Meaning |
|---|---|
| The Grand Crucible | Password generation widget on the Create page |
| Components | Parameter inputs inside The Grand Crucible |
| Forge / Forged | Generate a password / post-generation confirmation state |
| The Vault | Password storage and retrieval page |
| The Password Creation Room | The Create page |
| The Smoky Veil | Full-screen page transition animation |
| Date-Time Group | Live timestamp, top-right of all authenticated pages |

## Brand Voice

Written at 12th-grade level — intelligent, casual, witty. Users who hit errors should feel amused, not anxious. Active voice throughout. Confirm vocabulary is consistent end-to-end (a button labeled "Forge" produces a toast that says "Forged").
