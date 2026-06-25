import styles from './ForgeAnvil.module.css';

// Spark trajectories — add/remove entries here to change spark count
const SPARKS = [
  { dx: '-15px', dy: '-19px', delay: '0ms'  },
  { dx:   '0px', dy: '-23px', delay: '18ms' },
  { dx:  '15px', dy: '-19px', delay: '9ms'  },
  { dx: '-10px', dy: '-13px', delay: '32ms' },
  { dx:  '10px', dy: '-13px', delay: '23ms' },
];

export function ForgeAnvil({ forgePhase = 'idle', onClick, disabled = false, swingMs = 350, sparkMs = 380 }) {
  const handleKeyDown = (e) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={styles.wrapper}
      data-phase={forgePhase}
      data-disabled={disabled}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Forge password"
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      style={{
        '--forge-swing-dur': `${swingMs}ms`,
        '--forge-spark-dur': `${sparkMs}ms`,
      }}
    >
      <svg
        className={styles.svg}
        viewBox="0 0 100 120"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Unique ID — only one ForgeAnvil renders per page */}
          <filter id="forgeAnvilGlowFilter" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── Anvil glow layer (behind body) ── */}
        <g className={styles.anvilGlow} filter="url(#forgeAnvilGlowFilter)" transform="translate(0, 40)">
          <path
            d="M15 30 Q10 30 10 35 L10 45 L25 45 L25 55 L75 55 L75 45 L90 45 L90 35 Q90 30 85 30 L65 30 L60 20 L55 15 L50 13 L45 15 L40 20 L35 30 Z"
            fill="var(--color-glow-safe)"
            opacity="0.35"
          />
        </g>

        {/* ── Anvil body (translated down 40px to leave room above for hammer) ── */}
        <g transform="translate(0, 40)">
          <path
            d="M15 30 Q10 30 10 35 L10 45 L25 45 L25 55 L75 55 L75 45 L90 45 L90 35 Q90 30 85 30 L65 30 L60 20 L55 15 L50 13 L45 15 L40 20 L35 30 Z"
            fill="var(--color-primary)"
          />
          <rect x="30" y="55" width="40" height="8"  rx="2" fill="var(--color-primary)" />
          <rect x="35" y="63" width="30" height="6"  rx="2" fill="var(--color-primary)" />
        </g>

        {/* ── Hammer (pivot at handle top, handle center x=55 y=5) ──
            At 0 deg the head bottom rests at y=69, just above anvil face at y=70.
            SVG overflow:visible lets the head extend beyond viewBox when raised. */}
        <g className={styles.hammerGroup}>
          {/* handle */}
          <rect x="51" y="5"  width="8"  height="56" rx="3" fill="var(--color-secondary)" />
          {/* grip band */}
          <rect x="51" y="42" width="8"  height="6"  rx="1" fill="rgba(0,0,0,0.30)" />
          {/* head */}
          <rect x="39" y="57" width="32" height="12" rx="3" fill="var(--color-secondary)" />
        </g>

        {/* ── Sparks (radiate from contact zone at strike) ── */}
        <g className={styles.sparkGroup}>
          {SPARKS.map(({ dx, dy, delay }, i) => (
            <circle
              key={i}
              cx="55" cy="67"
              r={i === 1 ? 1.5 : 2.5}
              className={styles.spark}
              fill="var(--color-secondary)"
              style={{ '--dx': dx, '--dy': dy, '--spark-delay': delay }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
