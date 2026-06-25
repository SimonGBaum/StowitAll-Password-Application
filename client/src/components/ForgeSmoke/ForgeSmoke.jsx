import styles from './ForgeSmoke.module.css';

// Fixed spark positions so they don't shift on re-render (Math.random() banned in modules)
const SPARKS = [
  { dx: -18, dy: -22, delay: 0   },
  { dx:  14, dy: -28, delay: 40  },
  { dx:  28, dy:  -8, delay: 80  },
  { dx:  -6, dy:  24, delay: 20  },
  { dx: -30, dy:   4, delay: 60  },
  { dx:  20, dy:  18, delay: 100 },
  { dx:  -4, dy: -14, delay: 140 },
  { dx:  10, dy:  30, delay: 30  },
];

function ForgeSparks() {
  return (
    <div className={styles.sparksContainer} aria-hidden="true">
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className={styles.spark}
          style={{
            '--spark-tx': `calc(-50% + ${s.dx}px)`,
            '--spark-ty': `calc(-50% + ${s.dy}px)`,
            animationDelay: `${s.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * ForgeSmoke — the Smoky Veil that fires when the Forge anvil is struck.
 *
 * phase: 'idle' | 'expanding' | 'covered' | 'dissipating'
 *
 * Renders nothing when idle. Covers the full viewport when active via
 * position: fixed so it sits above all page content regardless of stacking context.
 */
export function ForgeSmoke({ phase }) {
  if (phase === 'idle') return null;

  return (
    <div className={styles.veil} data-phase={phase} aria-hidden="true">
      {/* SVG filter that gives smoke its organic, turbulent edge */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter
            id="forge-smoke-filter"
            x="-50%" y="-50%"
            width="200%" height="200%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.013 0.009"
              numOctaves="4"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="90"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="12" result="blurred" />
            <feComposite in="blurred" in2="SourceGraphic" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* Three smoke layers, staggered sizes + animation delays for depth */}
      <div className={`${styles.smokeLayer} ${styles.layer1}`} />
      <div className={`${styles.smokeLayer} ${styles.layer2}`} />
      <div className={`${styles.smokeLayer} ${styles.layer3}`} />

      {/* Sparks: only visible at the very start of expansion */}
      {phase === 'expanding' && <ForgeSparks />}
    </div>
  );
}
