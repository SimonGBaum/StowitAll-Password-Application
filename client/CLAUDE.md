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

This is a React 19 + Vite SPA. **There is no Django backend** — all data goes through the Supabase JS client directly. `src/services/api.js` is an unused Axios skeleton.

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

### Reference docs

Detailed interaction specs and wireframes live in `../app_outline/`:
- `app_outline/user_journey.md` — happy paths, error branches, nav map
- `app_outline/style_guide.md` — full component specs, animation timings
- `app_outline/pages/` — wireframe PNGs for each page state
