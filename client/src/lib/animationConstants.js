// ─── Walking Transition durations (milliseconds) ───────────────────────────
// These control how long the torch/corridor overlay stays visible per trigger.
export const WALK_DURATION_LOGIN   = 3000; // login form submit
export const WALK_DURATION_LOGOUT  = 3000; // any logout button
export const WALK_DURATION_HOME    = 1500; // navigating to /home
export const WALK_DURATION_CREATE  = 1000; // navigating to /create (Password Creation Room)
export const WALK_DURATION_DEFAULT = 1500; // all other page navigations (vault, profile, contact, etc.)

// Walking Transition fade in / fade out speed (ms) — bookends around the hold duration
export const WALK_FADE_IN  = 200;
export const WALK_FADE_OUT = 200;

// Route → duration lookup used by NavLink to auto-select duration from destination path
export const ROUTE_WALK_DURATIONS = {
  '/home':   WALK_DURATION_HOME,
  '/create': WALK_DURATION_CREATE,
};

// ─── Forge anvil timing (milliseconds) ──────────────────────────────────────
export const HAMMER_DURATION = 350; // hammer swing from raised to contact position

// ─── Smoky Veil forge effect (milliseconds) ─────────────────────────────────
export const VEIL_EXPAND_DURATION    = 2000; // smoke grows from center until it fully covers the screen
export const VEIL_SPARK_DURATION     =  400; // sparks appear at screen center before smoke overtakes them
export const VEIL_HOLD_DURATION      =  200; // brief pause at full coverage before dissipation starts
export const VEIL_DISSIPATE_DURATION =  600; // smoke clears to reveal the updated password

// Character scramble tick rate (ms) — how often the output field characters randomize during forge
export const SCRAMBLE_INTERVAL = 60;
