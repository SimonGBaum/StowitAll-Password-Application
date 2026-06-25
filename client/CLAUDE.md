# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Canonical reference:** The root `../CLAUDE.md` is the authoritative guide for this project (stack, design system, in-world terminology, database schema, encryption details, HIBP flow, page/route map). This file adds client-implementation detail only.

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

### Router structure

`App.jsx` uses a wrapping `AppLayout` route that mounts `TorchTransitionProvider` and the `<TorchTransition>` overlay. `TorchTransitionProvider` must live inside the router (it calls `useNavigate`), which is why it's in `AppLayout` rather than `main.jsx`.

```
AppLayout (TorchTransitionProvider + TorchTransition overlay)
  ├── /                  RootRedirect
  ├── ProtectedRoute
  │   ├── /home, /create, /vault, /profile, /contact
  └── *                  ErrorPage
```

### Adding a new authenticated page

1. Create `src/pages/MyPage/MyPage.jsx` + `MyPage.module.css`
2. Wrap content in `<PageShell>` with the appropriate nav/footer slot props (see root CLAUDE.md)
3. Add the route inside the `<ProtectedRoute>` element in `src/App.jsx`

## Context Hooks

Import from their context files — all contexts export a named `use*` hook:

```js
import { useAuth }           from './context/AuthContext'
import { usePasswords }      from './context/PasswordContext'
import { useToast }          from './context/ToastContext'
import { useSmokyVeil }      from './context/SmokyVeilContext'
import { useTorchTransition } from './hooks/useTorchTransition'  // re-export of context hook
```

| Hook | Returns |
|---|---|
| `useAuth()` | `{ user, loading, login, logout, signup, updateProfile }` |
| `usePasswords()` | `{ records, addRecord, updateRecord, deleteRecord, forgePassword }` |
| `useToast()` | `{ toasts, addToast(message, type), removeToast(id) }` |
| `useSmokyVeil()` | `{ phase, triggerVeil(callback) }` |
| `useTorchTransition()` | `{ isActive, duration, triggerTransition(destination, duration?) }` |

`user` shape: `{ id, email, firstName, lastName, username }` (null when signed out, undefined while the initial session check is in flight).

`addToast` types: `'success'` | `'error'` | `'info'` (default `'info'`). Toasts auto-dismiss after 3500 ms.

### Two animation systems — use the right one

**TorchTransition** (`useTorchTransition`) — all page navigation. Call `triggerTransition(destination, duration?)` instead of `navigate()` directly. The overlay renders a stone-corridor effect then fades out over the new page. Per-route default durations are centralized in `TorchTransitionContext.jsx`; pass an explicit `duration` (ms) to override. Respects `prefers-reduced-motion` by skipping the overlay and navigating immediately.

**SmokyVeil** (`useSmokyVeil`) — non-navigation events only. Currently used exclusively by `GrandCrucible` for the post-Forge visual beat (`triggerVeil(() => {})`). Do not use for page navigation.

## Reusable Component APIs

### Button
```jsx
<Button
  variant="default"      // 'default' | 'destructive' | 'full-width'
  onClick={handler}
  disabled={false}
>
  Label
</Button>
```
`destructive` swaps the inner glow to `--color-accent-error`; base texture is identical.

### Input
```jsx
<Input
  id="field-id"
  label="Display Label"
  type="text"            // any HTML input type
  value={value}
  onChange={handler}
  error="Validation msg" // renders below field in red; omit when no error
  disabled={false}
  readOnly={false}
  autoComplete="off"
/>
```

### Modal (confirmation dialog)
```jsx
<Modal
  title="Confirm Action"
  message="Are you sure?"
  confirmLabel="Delete"
  cancelLabel="Cancel"
  onConfirm={handler}
  onCancel={handler}
  isDestructive={true}   // swaps confirm button to destructive variant
/>
```
Modal traps focus (Tab cycles, Escape calls `onCancel`).

### NavLink
```jsx
<NavLink to="/home">Home</NavLink>                      // triggers TorchTransition
<NavLink to="/home" duration={3000}>Login</NavLink>     // explicit duration override
<NavLink onClick={handler}>Action</NavLink>              // always renders as <button>
```
NavLink always renders as a `<button>` (never `<Link>`). When `to` is provided it calls `triggerTransition`; when `onClick` is provided it calls the handler directly. Active state is determined by `location.pathname === to`.

## Animation Inventory

All CSS animations in the project — reference before adding new ones to avoid duplicates:

| File | Keyframe name | Duration | Usage |
|---|---|---|---|
| `AnvilLogo.module.css` | `glowPulse` | 4s infinite | Logo brand glow |
| `GrandCrucible.module.css` | `swirlFlicker` | 60ms linear | Character-swirl during forge |
| `Toast.module.css` | `slideIn` | 250ms | Toast enter from right |
| `ErrorPage.module.css` | `emberPulse` | 3.5s infinite | Error page radial pulse |
| `TorchTransition.module.css` | `torchFadeIn` | 80ms | Overlay cover (hides old page) |
| `TorchTransition.module.css` | `torchFadeOut` | `--torch-dur` (variable) | Overlay reveal over new page |
| `TorchTransition.module.css` | `torchFlicker` | 1.8s infinite | Torch glow organic flicker |
| `TorchTransition.module.css` | `walkingBob` | 0.9s infinite | Overlay walking-motion bob |
| `TorchTransition.module.css` | `vanishingZoom` | `--torch-dur` (variable) | Corridor vanishing-point zoom |

CSS transitions (not keyframes) exist on Button (box-shadow), NavLink (underline width), Input (border/shadow), SmokyVeil (opacity 150ms), Vault expand/collapse panels (max-height 0.3s), and VaultDoorIcon fill (0.4s).

`prefers-reduced-motion` is respected in `TorchTransitionContext` (skips overlay, navigates immediately), `SmokyVeilContext` (skips veil entirely), and `GrandCrucible` (skips swirl). `global.css` also includes a blanket `animation: none` rule for reduced-motion.

## HIBP / Strength Checks

`hibp.js` exports two functions:

- `computeSHA1Prefix(password)` → `{ prefix, suffix }` (prefix = first 5 hex chars of SHA-1)
- `computePasswordStrength(password, breachCount)` → `{ score, label, color, breached, breachCount, entropyBits }`

**Never call `api.pwnedpasswords.com` directly from the browser.** Always proxy through `supabase.functions.invoke('hibp-password-check', { body: { hashPrefix: prefix } })`. The Edge Function validates the user's JWT and handles padding headers.

HIBP checks fire in two places: `GrandCrucible` (after every Forge) and `Vault` (on mount, staggered 200 ms per record).

## Reference docs

Detailed interaction specs and wireframes:
- `skeleton/user_journey.md` — happy paths, error branches, nav map
- `skeleton/style_guide.md` — full component specs, animation timings
- `skeleton/pages/` — wireframe PNGs for each page state
