# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: StowitAll Password Application

Full-stack password manager using Django + DRF (backend) and React + Vite (frontend), backed by PostgreSQL.

## Stack

- **Backend:** Django, Django REST Framework, PostgreSQL
- **Frontend:** React, Vite
- **Environments:** `.venv/` (Python virtualenv), `node_modules/` (Node)

## Development Commands

### Backend

```bash
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment

Copy `.env.example` to `.env` and populate `DATABASE_URL`, `SECRET_KEY`, and any other required variables before starting.

## Testing

```bash
# Backend — all tests
python manage.py test

# Backend — single app or single test
python manage.py test <app>
python manage.py test <app>.<TestClass>.<test_method>

# Frontend
cd frontend && npm test
```

## Architecture

- DRF API is consumed by the React SPA; no server-side HTML rendering.
- PostgreSQL is the only supported database — no SQLite fallback.
- `manage.py` lives at the Django project root alongside the settings module.
- Frontend is a separate Vite SPA under `frontend/`, built to `frontend/dist/`.

### Backend layout (intended)

```
stowitall/          # Django project settings package
  settings.py
  urls.py
<app>/              # One Django app per domain (e.g. passwords/, users/)
  models.py
  serializers.py
  views.py
  urls.py
  tests.py
manage.py
requirements.txt
```

### Frontend layout (intended)

```
frontend/
  src/
    api/            # Axios/fetch wrappers for each DRF endpoint
    components/     # Reusable UI components
    pages/          # Route-level views
    App.jsx
    main.jsx
  vite.config.js
  package.json
```

### Key conventions

- DRF views should use class-based `APIView` or `ModelViewSet`; keep business logic out of views and serializers.
- All API routes are prefixed `/api/`; the frontend proxies to the Django dev server via Vite's `server.proxy`.
- **Authentication:** JWT via `djangorestframework-simplejwt` — record the decision here once implemented.
- Passwords stored in the database must be encrypted at the application layer (not just hashed) — this is a password *manager*, not an auth system.
- Environment variables are loaded via `django-environ` or `python-decouple`; never hardcode secrets.

## Pages & Navigation

Seven page states (all in one SPA). See `app_outline/user_journey.md` for full interaction specs.

| Page | Route to it from |
|---|---|
| Login / Sign-Up | App entry; post-logout |
| Home | Post-login; "Home" links everywhere |
| Password Creation Room | Home CTA |
| The Vault | Home secondary nav |
| Profile | Home header "User Profile" link |
| Contact Us | Home, Password Creation Room, Profile |
| Error | Any unhandled exception / broken route |

Navigation constraints to enforce:
- The Vault has **no footer nav** — only a "Home" header link. No direct path to Create, Profile, or Contact Us.
- Profile and Contact Us have no direct path to The Vault or Password Creation Room — must go via Home.
- The Error Page has a single "Home" button and no Log Out. Clear the session before rendering so "Home" routes to Login if the session was the cause.

## Design System

Full spec in `app_outline/style_guide.md`. Critical rules summarized here.

### Color tokens (always use CSS custom properties — never hardcode hex)

```css
:root {
  --color-bg-main:      #1A222A;  /* Deep Slate — universal page canvas */
  --color-primary:      #2D6A4F;  /* Imperial Forest Green — borders, accents, nav */
  --color-secondary:    #E0A96D;  /* Burnished Brass/Gold — headers, active states */
  --color-glow-safe:    #52B788;  /* Magical Aura Green — glows, hover, active */
  --color-bg-error:     #221E1F;  /* Error page canvas ONLY */
  --color-accent-error: #E63946;  /* Error alerts, error page glow ONLY */
}
```

`--color-bg-error` and `--color-accent-error` must not appear on any page except Error.

### Typography

- **Headers / structural titles:** `Cinzel` (700 weight), `color: var(--color-secondary)`. Never below 0.85rem.
- **Everything else (buttons, forms, body, nav):** `Inter`, `color: #FFFFFF`.
- Load both from Google Fonts.

### Buttons

All action buttons use the `.forge-btn` brushed-metal treatment (dark gradient base, `--color-secondary` border, `--color-glow-safe` inner glow). Destructive actions (Delete) swap inner glow to `--color-accent-error` only — base texture stays the same.

### Animations (Three trigger points only for The Smoky Veil)

1. Successful login
2. Logout
3. Successful password generation (post-Forge)

Always respect `prefers-reduced-motion` — skip all animations and transition instantly.

The Grand Crucible forge sequence: character-swirl SVG animation (~400ms) → credential resolves → Smoky Veil fires. Must be cancellable via Escape or click-outside.

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
