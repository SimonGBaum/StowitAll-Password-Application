# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server (HMR)
npm run build     # production build → dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint over all .js/.jsx files
```

No test runner is configured yet — `npm test` will fail.

## Environment

Copy `.env` and fill in the two required variables before starting:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Vite exposes only variables prefixed `VITE_` to the browser bundle.

## Architecture

This is the React + Vite SPA (client) for the StowitAll password manager. The backend is a Django + DRF API (one directory up). The Vite dev server should proxy `/api/` requests to Django — configure `server.proxy` in `vite.config.js` once the backend is running.

**`src/` is a blank scaffold** — `App.jsx` is the default Vite starter. All application pages, routing, and API wiring still need to be built.

### Intended layout (from project spec)

```
src/
  api/           # Axios/fetch wrappers for each DRF endpoint
  components/    # Reusable UI components
  pages/         # Route-level page components (see below)
  App.jsx        # Root component — owns the router
  main.jsx       # ReactDOM.createRoot entry point
```

### Routing

React Router v7 (`react-router-dom`) is installed. Seven routes map to page states:

| Route | Page |
|---|---|
| `/` | Login / Sign-Up (two-state single component) |
| `/home` | Home |
| `/create` | The Password Creation Room |
| `/vault` | The Vault |
| `/profile` | Profile |
| `/contact` | Contact Us |
| `*` | Error |

### Navigation constraints

- **The Vault** has no footer nav — only a "Home" header link. No path to Create, Profile, or Contact Us.
- **Profile** and **Contact Us** have no direct path to The Vault or Create — must go via Home.
- **Error Page** has a single "Home" button and no Log Out. Clear the session before rendering so "Home" routes to Login if the session was the cause.

### Smoky Veil transition

Fires on exactly three events: successful Login, Logout, and successful password Forge. Respect `prefers-reduced-motion` — skip animation entirely and switch instantly.

## Design system

Full spec lives in `skeleton/style_guide.md`. Critical rules:

**Color tokens** — always use CSS custom properties, never hardcode hex:

```css
:root {
  --color-bg-main:      #1A222A;
  --color-primary:      #2D6A4F;
  --color-secondary:    #E0A96D;
  --color-glow-safe:    #52B788;
  --color-bg-error:     #221E1F;  /* Error page ONLY */
  --color-accent-error: #E63946;  /* Error page ONLY */
}
```

**Typography** — two fonts only, loaded from Google Fonts:
- `Cinzel` 700 + `color: var(--color-secondary)` → all structural headers/page titles
- `Inter` 400 + `color: #FFFFFF` → everything else (buttons, forms, nav, body)

**Buttons** — all action buttons use `.forge-btn` (brushed-metal gradient, `--color-secondary` border, `--color-glow-safe` inner glow). Destructive actions swap inner glow to `--color-accent-error` only.

**Layout** — sticky 64px header, sticky 52px footer, 960px max content column, CSS flex/grid only (no fixed pixel widths on containers). Desktop-only (1080p–1440p), no mobile for v1.

## In-world terminology

Always use these terms in UI copy — never substitute plain-English equivalents:

| Term | Meaning |
|---|---|
| The Grand Crucible | Password generation widget on the Create page |
| Components | Parameter inputs inside The Grand Crucible |
| Forge / Forged | Generate a password / post-generation state |
| The Vault | Password storage page |
| The Password Creation Room | The Create page |
| The Smoky Veil | Full-screen page transition animation |
| Date-Time Group | Live timestamp, top-right of all authenticated pages |

## Reference docs

Detailed interaction specs and wireframes live in `skeleton/`:
- `skeleton/user_journey.md` — happy paths, error branches, and nav map for every page
- `skeleton/style_guide.md` — full component specs, animation timings, spacing scale
- `skeleton/app_outline.md` — product requirements and data model overview
- `skeleton/pages/` — wireframe PNGs for each page state
