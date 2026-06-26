import styles from './ForgeAnvil.module.css';

/**
 * ForgeAnvil — stylised SVG blacksmith's anvil with a descending hammer.
 *
 * Props:
 *   onStrike   — called when the user clicks / activates the anvil
 *   swinging   — true while the hammer animation plays
 *   disabled   — prevents interaction (e.g. during smoke phase)
 */
export function ForgeAnvil({ onStrike, swinging, disabled }) {
  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      onStrike();
    }
  };

  return (
    <div
      className={`${styles.wrapper} ${disabled ? styles.disabled : ''}`}
      role="button"
      aria-label="Generate password"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onStrike}
      onKeyDown={handleKeyDown}
    >
      <svg
        className={styles.scene}
        viewBox="0 0 160 120"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* ── Hammer ─────────────────────────────────────────────────────
            Origin for rotation is the butt of the handle (top-right corner).
            swinging prop drives the hammerStrike CSS animation class.
        ─────────────────────────────────────────────────────────────────── */}
        <g
          className={swinging ? styles.hammerStrike : styles.hammerRest}
          style={{ transformOrigin: '128px 28px' }}
        >
          {/* Handle */}
          <rect x="114" y="28" width="8" height="38" rx="2"
            fill="#8B6914" stroke="#5A4210" strokeWidth="1" />
          {/* Head — wide face, shorter cheeks */}
          <rect x="100" y="16" width="32" height="16" rx="3"
            fill="#C8A030" stroke="#8B6914" strokeWidth="1.5" />
          {/* Face highlight */}
          <rect x="102" y="18" width="28" height="5" rx="1"
            fill="rgba(255,255,200,0.25)" />
        </g>

        {/* ── Anvil body ─────────────────────────────────────────────────
            Classic silhouette: bick (horn) on left, wide flat face, thick
            waist stepping down to a base pad.
        ─────────────────────────────────────────────────────────────────── */}

        {/* Base pad */}
        <rect x="28" y="96" width="96" height="14" rx="4"
          fill="#1A3020" stroke="#2D6A4F" strokeWidth="1.5" />

        {/* Waist */}
        <rect x="44" y="80" width="64" height="18" rx="2"
          fill="#1E3828" stroke="#2D6A4F" strokeWidth="1" />

        {/* Main face (top surface) */}
        <path d="M 36 52 L 44 80 L 108 80 L 116 52 Z"
          fill="#2D5040" stroke="#2D6A4F" strokeWidth="1.5" />

        {/* Flat top face */}
        <rect x="36" y="46" width="80" height="8" rx="2"
          fill="#3A6A50" stroke="#52B788" strokeWidth="1.5" />

        {/* Face highlight — thin rim of glow-safe at the strike surface */}
        <rect x="38" y="47" width="76" height="3" rx="1"
          fill="rgba(82,183,136,0.35)" />

        {/* Bick (horn) — tapers to a rounded point on the left */}
        <path d="M 36 52 Q 16 50 8 54 Q 16 58 36 54 Z"
          fill="#2D5040" stroke="#2D6A4F" strokeWidth="1" />

        {/* Pritchel hole — small dark circle on the face */}
        <circle cx="96" cy="50" r="3" fill="#0E1E14" stroke="#2D6A4F" strokeWidth="1" />

        {/* Hardy hole — square punch near centre */}
        <rect x="70" y="47" width="7" height="7" rx="1"
          fill="#0E1E14" stroke="#2D6A4F" strokeWidth="1" />
      </svg>

      {/* Click-hint label underneath — shown only at rest */}
      {!swinging && (
        <span className={styles.hint}>Strike to Forge</span>
      )}
    </div>
  );
}
