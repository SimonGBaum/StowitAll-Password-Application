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

`client/.env` must contain:

```
VITE_SUPABASE_URL=https://wjjwifbihxnujfvrxtfq.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

Vite only exposes `VITE_`-prefixed vars to the browser bundle.

## Architecture

This is a fully-built React 19 + Vite SPA. **There is no Django backend** — all data goes through the Supabase JS client directly. The `src/services/api.js` Axios skeleton is unused.

### Key libraries

- `@supabase/supabase-js` — auth + database (primary data layer)
- `react-router-dom` v7 — client-side routing via `createBrowserRouter`
- Web Crypto API — AES-GCM encryption in `src/lib/crypto.js`

### Adding a new authenticated page

1. Create `src/pages/MyPage/MyPage.jsx` + `MyPage.module.css`
2. Wrap content in `<PageShell>` with the appropriate nav/footer slot props (see root CLAUDE.md)
3. Add the route inside the `<ProtectedRoute>` element in `src/App.jsx`

### Reference docs

Detailed interaction specs and wireframes:
- `skeleton/user_journey.md` — happy paths, error branches, nav map
- `skeleton/style_guide.md` — full component specs, animation timings
- `skeleton/pages/` — wireframe PNGs for each page state
