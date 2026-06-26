import { useState, useRef, useCallback } from 'react';
import styles from './ForgeAnvil.module.css';

// ── ForgeAnvil Timing Constants (must match ForgeAnvil.module.css) ──
const TIMING = {
  SWING_MS:       350,
  SWING_DELAY_MS:  80,
  IMPACT_HOLD_MS: 200,
  RETURN_MS:      400,
  SPARK_MS:       650,
  SCRAMBLE_MS:    500,
  TICK_MS:         45,
};

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
const FALLBACK_CHARS  = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

function randomString(len) {
  return Array.from({ length: len }, randomChar).join('');
}

function fallbackGenerate(len) {
  return Array.from({ length: len }, () => FALLBACK_CHARS[Math.floor(Math.random() * FALLBACK_CHARS.length)]).join('');
}

// Compute spark particle data: polar → cartesian with arc bias
function buildSparks() {
  const sparks = [];

  // Core burst — bright yellow-white
  const coreColors = ['#FFE566', '#FFDA2A', '#FFF0A0', '#FFE566', '#FFDA2A'];
  for (let i = 0; i < 11; i++) {
    const angle = (-82 + (152 / 10) * i) * (Math.PI / 180);
    const speed = 0.85 + Math.random() * 0.55;
    const arc   = 0.55 + Math.random() * 0.25;
    const dist  = 80 + Math.random() * 30;
    const sx    = Math.sin(angle) * dist * speed;
    const sy    = -(Math.cos(angle) * dist * speed * 0.35) - arc * 90;
    sparks.push({
      id: `c${i}`, cx: 150, cy: 112,
      r: 2 + Math.random() * 2.5,
      fill: coreColors[i % coreColors.length],
      sx, sy,
      dur: TIMING.SPARK_MS - 50 + Math.random() * 100,
      delay: i * 12,
    });
  }

  // Secondary ring — amber-orange
  const secColors = ['#FF8C00', '#FFA020', '#FFAA30'];
  for (let i = 0; i < 6; i++) {
    const angle = (-70 + (140 / 5) * i) * (Math.PI / 180);
    const speed = 0.6 + Math.random() * 0.25;
    const arc   = 0.42 + Math.random() * 0.18;
    const dist  = 55 + Math.random() * 20;
    const sx    = Math.sin(angle) * dist * speed;
    const sy    = -(Math.cos(angle) * dist * speed * 0.35) - arc * 90;
    sparks.push({
      id: `s${i}`, cx: 150, cy: 112,
      r: 1.5 + Math.random() * 1,
      fill: secColors[i % secColors.length],
      sx, sy,
      dur: TIMING.SPARK_MS - 100 + Math.random() * 80,
      delay: 30 + i * 12,
    });
  }

  // Trailing embers
  const emberColors = ['#FFE566', '#FFA020'];
  for (let i = 0; i < 4; i++) {
    const angle = (-50 + (100 / 3) * i) * (Math.PI / 180);
    const speed = 0.45 + Math.random() * 0.1;
    const arc   = 0.32 + Math.random() * 0.1;
    const dist  = 40 + Math.random() * 15;
    const sx    = Math.sin(angle) * dist * speed;
    const sy    = -(Math.cos(angle) * dist * speed * 0.35) - arc * 90;
    sparks.push({
      id: `e${i}`, cx: 150, cy: 112,
      r: 1 + Math.random() * 0.5,
      fill: emberColors[i % emberColors.length],
      sx, sy,
      dur: TIMING.SPARK_MS - 150 + Math.random() * 60,
      delay: 60 + i * 15,
    });
  }

  return sparks;
}

/**
 * ForgeAnvil — self-contained anvil with hammer animation, spark burst,
 * password scramble, and output display.
 *
 * Props:
 *   onForge        — async () => string  called at impact; returns new password
 *   passwordLength — number (default 16) used for scramble length + fallback generator
 *   className      — optional host layout class
 *   style          — optional host layout style
 */
export function ForgeAnvil({ onForge, passwordLength = 16, className, style }) {
  const [hammerPhase, setHammerPhase] = useState('idle'); // idle | swing | impact | return
  const [sparks, setSparks]           = useState(null);   // null | spark array
  const [busy, setBusy]               = useState(false);
  const [display, setDisplay]         = useState('');     // '' | scramble string | real password
  const [scrambling, setScrambling]   = useState(false);

  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const scrambleRef = useRef(null);

  const hammerClass = {
    idle:   styles.hammerIdle,
    swing:  styles.hammerSwing,
    impact: styles.hammerImpact,
    return: styles.hammerReturn,
  }[hammerPhase] ?? styles.hammerIdle;

  const handleClick = useCallback(async () => {
    if (busy) return;
    setBusy(true);

    if (prefersReduced) {
      const pw = onForge ? await onForge() : fallbackGenerate(passwordLength);
      setDisplay(pw);
      setBusy(false);
      return;
    }

    // ── Phase 1: Swing ──────────────────────────────────────────────────────
    setHammerPhase('swing');
    await sleep(TIMING.SWING_MS + 30);

    // ── Phase 2: Impact — sparks + scramble start simultaneously ────────────
    setHammerPhase('impact');
    setSparks(buildSparks());
    setScrambling(true);
    setDisplay(randomString(passwordLength));

    // Fire onForge in parallel with scramble
    const forgePromise = onForge ? onForge() : Promise.resolve(fallbackGenerate(passwordLength));

    // Scramble interval
    scrambleRef.current = setInterval(() => {
      setDisplay(randomString(passwordLength));
    }, TIMING.TICK_MS);

    // Resolve scramble after SCRAMBLE_MS, snapping real pw when both are ready
    const [realPassword] = await Promise.all([
      forgePromise,
      sleep(TIMING.SCRAMBLE_MS),
    ]);

    clearInterval(scrambleRef.current);
    scrambleRef.current = null;
    setScrambling(false);
    setDisplay(realPassword);

    // ── Phase 3: Clear sparks after spark lifetime ──────────────────────────
    await sleep(TIMING.SPARK_MS - TIMING.SCRAMBLE_MS > 0
      ? TIMING.SPARK_MS - TIMING.SCRAMBLE_MS
      : 0);
    setSparks(null);

    // ── Phase 4: Brief hold, then return ───────────────────────────────────
    await sleep(TIMING.IMPACT_HOLD_MS);
    setHammerPhase('return');
    await sleep(TIMING.RETURN_MS);

    // ── Phase 5: Idle ───────────────────────────────────────────────────────
    setHammerPhase('idle');
    setBusy(false);
  }, [busy, onForge, passwordLength, prefersReduced]);

  return (
    <div
      className={`${styles.forgeAnvilRoot}${className ? ` ${className}` : ''}`}
      style={style}
    >
      {/* ── Anvil button ──────────────────────────────────────────────────── */}
      <button
        type="button"
        className={styles.forgeAnvilBtn}
        aria-label="Generate password"
        aria-busy={busy}
        disabled={busy}
        onClick={handleClick}
      >
        {/* Anvil SVG */}
        <svg
          className={styles.forgeAnvilSvg}
          viewBox="0 0 220 200"
          width="220"
          height="200"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            {/* Base gradient — deep iron */}
            <linearGradient id="fa-grad-base" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#3a3a36" />
              <stop offset="100%" stopColor="#1a1a16" />
            </linearGradient>
            {/* Waist gradient */}
            <linearGradient id="fa-grad-waist" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#2e2e2a" />
              <stop offset="100%" stopColor="#1a1a16" />
            </linearGradient>
            {/* Body gradient */}
            <linearGradient id="fa-grad-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#4a4a44" />
              <stop offset="100%" stopColor="#2a2a26" />
            </linearGradient>
            {/* Top face gradient — lighter to suggest a work surface */}
            <linearGradient id="fa-grad-face" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#7a7a72" />
              <stop offset="60%"  stopColor="#5a5a54" />
              <stop offset="100%" stopColor="#3a3a36" />
            </linearGradient>
            {/* Horn gradient */}
            <linearGradient id="fa-grad-horn" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#2a2a26" />
              <stop offset="100%" stopColor="#4a4a44" />
            </linearGradient>
          </defs>

          {/* Base — wide foot */}
          <rect x="30" y="162" width="160" height="22" rx="5"
            fill="url(#fa-grad-base)" stroke="#4a4a44" strokeWidth="1.5" />

          {/* Waist — trapezoid narrowing */}
          <path d="M 55 138 L 45 162 L 175 162 L 165 138 Z"
            fill="url(#fa-grad-waist)" stroke="#3a3a36" strokeWidth="1" />

          {/* Body — thick mid section */}
          <path d="M 40 112 L 55 138 L 165 138 L 180 112 Z"
            fill="url(#fa-grad-body)" stroke="#4a4a44" strokeWidth="1.5" />

          {/* Top face / work surface */}
          <rect x="32" y="100" width="156" height="14" rx="3"
            fill="url(#fa-grad-face)" stroke="#6a6a62" strokeWidth="1.5" />

          {/* Work surface highlight — subtle bright rim at top edge */}
          <rect x="34" y="101" width="152" height="3" rx="1"
            fill="rgba(180,180,160,0.25)" />

          {/* Horn — tapers left */}
          <path d="M 32 112 Q 14 109 8 114 Q 14 118 32 114 Z"
            fill="url(#fa-grad-horn)" stroke="#3a3a36" strokeWidth="1" />

          {/* Step ledge — right end */}
          <rect x="176" y="108" width="16" height="6" rx="1"
            fill="#3a3a36" stroke="#4a4a44" strokeWidth="1" />

          {/* Hardy hole — rectangular cut-out on face */}
          <rect x="90" y="101" width="10" height="10" rx="1"
            fill="#111110" stroke="#3a3a36" strokeWidth="0.75" />

          {/* Pritchel hole — small circle */}
          <circle cx="148" cy="107" r="4"
            fill="#111110" stroke="#3a3a36" strokeWidth="0.75" />
        </svg>

        {/* Hammer wrapper — absolutely positioned overlay */}
        <div className={`${styles.forgeHammerWrap} ${hammerClass}`}>
          <svg
            viewBox="0 0 72 90"
            width="72"
            height="90"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="fa-grad-steel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#7a7a72" />
                <stop offset="50%"  stopColor="#5a5a54" />
                <stop offset="100%" stopColor="#3a3a36" />
              </linearGradient>
              <linearGradient id="fa-grad-wood" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#8B6338" />
                <stop offset="50%"  stopColor="#A07840" />
                <stop offset="100%" stopColor="#6B4C28" />
              </linearGradient>
            </defs>

            {/* Handle */}
            <rect x="31" y="22" width="10" height="62" rx="3"
              fill="url(#fa-grad-wood)" stroke="#5A3A18" strokeWidth="1" />
            {/* Grip wrap lines */}
            <line x1="31" y1="52" x2="41" y2="52" stroke="#5A3A18" strokeWidth="1" opacity="0.6" />
            <line x1="31" y1="60" x2="41" y2="60" stroke="#5A3A18" strokeWidth="1" opacity="0.6" />
            <line x1="31" y1="68" x2="41" y2="68" stroke="#5A3A18" strokeWidth="1" opacity="0.6" />
            <line x1="31" y1="76" x2="41" y2="76" stroke="#5A3A18" strokeWidth="1" opacity="0.5" />

            {/* Head */}
            <rect x="4" y="8" width="64" height="22" rx="3"
              fill="url(#fa-grad-steel)" stroke="#2a2a26" strokeWidth="1.5" />
            {/* Peen end — slightly tapered right side */}
            <rect x="60" y="10" width="8" height="18" rx="2"
              fill="#4a4a44" />
            {/* Strike face highlight */}
            <rect x="5" y="9" width="56" height="5" rx="1"
              fill="rgba(200,200,180,0.18)" />
            {/* Eye */}
            <ellipse cx="36" cy="19" rx="5" ry="4"
              fill="#1a1a16" stroke="#3a3a36" strokeWidth="0.75" />
          </svg>
        </div>

        {/* Spark overlay */}
        {sparks && (
          <svg
            className={styles.forgeSparksLayer}
            viewBox="0 0 220 200"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Impact flash */}
            <circle
              className={styles.forgeImpactFlash}
              cx="150" cy="112" r="12"
              fill="#FFE566"
            />
            {/* Spark particles */}
            {sparks.map((sp) => (
              <circle
                key={sp.id}
                className={styles.forgeSpark}
                cx={sp.cx}
                cy={sp.cy}
                r={sp.r}
                fill={sp.fill}
                style={{
                  '--sx': `${sp.sx}px`,
                  '--sy': `${sp.sy}px`,
                  '--dur': `${sp.dur}ms`,
                  animationDelay: `${sp.delay}ms`,
                }}
              />
            ))}
          </svg>
        )}
      </button>

      {/* ── Password output field ─────────────────────────────────────────── */}
      <div
        className={[
          styles.forgePasswordField,
          scrambling ? styles.scrambling : '',
          !display    ? styles.empty      : '',
        ].filter(Boolean).join(' ')}
      >
        {display || 'Strike the anvil to Forge.'}
      </div>
    </div>
  );
}
