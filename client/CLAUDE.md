# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Canonical reference:** The root `../CLAUDE.md` is the authoritative guide for this project. This file adds client-specific detail only.

## Commands (run from this directory)

```bash
npm run dev       # Vite dev server on http://localhost:5174 (HMR)
npm run build     # production build → dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint over all .js/.jsx files
```

No test runner is configured — `npm test` will fail.

## Environment

`.env` must contain:

```
VITE_SUPABASE_URL=https://wjjwifbihxnujfvrxtfq.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

Vite only exposes `VITE_`-prefixed vars to the browser bundle.

## Architecture

This is a fully-built React 19 + Vite SPA. **There is no Django backend** — all data goes through the Supabase JS client directly. The `src/services/api.js` Axios skeleton is completely unused.

### Key libraries

- `@supabase/supabase-js` — auth + database (primary data layer)
- `react-router-dom` v7 — client-side routing via `createBrowserRouter` in `src/App.jsx`
- Web Crypto API — AES-GCM encryption in `src/lib/crypto.js`

### Component conventions

- Every component lives in its own folder under `src/components/` with a matching `.module.css`.
- Pages follow the same pattern under `src/pages/`.
- All authenticated pages wrap their content in `<PageShell>` — see root CLAUDE.md for the full prop API.
- The custom `<NavLink>` component (not React Router's) automatically triggers the walking transition on navigation; use it instead of `<Link>` or `<a>` for in-app links.

### Adding a new authenticated page

1. Create `src/pages/MyPage/MyPage.jsx` + `MyPage.module.css`
2. Wrap content in `<PageShell>` with the appropriate nav/footer slot props
3. Add the route inside the `<ProtectedRoute>` element in `src/App.jsx`

### Patterns

**CSS Modules** — every component pairs a `.jsx` with a `.module.css` for scoped styles. All color and spacing values must reference tokens from `src/styles/tokens.css` via CSS custom properties — never hardcode hex or pixel values.

**Consuming context** — use the named hooks, not `useContext` directly:

```js
import { useAuth }      from '../context/AuthContext';
import { usePasswords } from '../context/PasswordContext';
import { useToast }     from '../context/ToastContext';
import { useSmokyVeil } from '../hooks/useSmokyVeil';
```

`AuthContext.user` is `undefined` while the session is resolving, `null` when logged out, and a profile object when authenticated. Always check for `undefined` before `null` if you need to distinguish loading from logged-out.

**Unsaved-changes blocking** — `Profile.jsx` shows how to use React Router v7's `useBlocker()` to intercept navigation when a form has dirty state. Use the same pattern for any page with an editable form.

**GrandCrucible integration** — the component is self-contained and handles its own HIBP check and strength meter. Pass an `onPasswordForged(password)` callback to receive the generated password. The Forge animation runs ~400ms; the callback fires after it completes (or immediately if `prefers-reduced-motion` is set).

**Encryption** — the crypto key is derived fresh on every `encryptPassword` / `decryptPassword` call from `user.id` + a fixed salt. It is never stored in memory or state. Any code that needs to encrypt/decrypt must have access to `user.id` from `AuthContext`.

### Reference docs

Detailed interaction specs and wireframes:
- `skeleton/user_journey.md` — happy paths, error branches, nav map
- `skeleton/style_guide.md` — full component specs, animation timings
- `skeleton/pages/` — wireframe PNGs for each page state

