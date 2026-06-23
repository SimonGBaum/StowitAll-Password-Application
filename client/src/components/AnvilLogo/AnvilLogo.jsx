import styles from './AnvilLogo.module.css';

export function AnvilLogo() {
  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.svgAnvil}
        viewBox="0 0 100 80"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="StowitAll"
        role="img"
      >
        <defs>
          <filter id="anvil-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Glow layer */}
        <g className={styles.glowLayer} filter="url(#anvil-glow)">
          <path
            d="M15 30 Q10 30 10 35 L10 45 L25 45 L25 55 L75 55 L75 45 L90 45 L90 35 Q90 30 85 30 L65 30 L60 20 L55 15 L50 13 L45 15 L40 20 L35 30 Z"
            fill="var(--color-glow-safe)"
            opacity="0.4"
          />
        </g>
        {/* Main anvil silhouette */}
        <path
          d="M15 30 Q10 30 10 35 L10 45 L25 45 L25 55 L75 55 L75 45 L90 45 L90 35 Q90 30 85 30 L65 30 L60 20 L55 15 L50 13 L45 15 L40 20 L35 30 Z"
          fill="var(--color-primary)"
        />
        {/* Base */}
        <rect x="30" y="55" width="40" height="8" rx="2" fill="var(--color-primary)" />
        <rect x="35" y="63" width="30" height="6" rx="2" fill="var(--color-primary)" />
      </svg>
      <span className={styles.wordmark} aria-hidden="true">StowitAll</span>
    </div>
  );
}
