import styles from './VaultDoorIcon.module.css';

export function VaultDoorIcon({ isOpen = false }) {
  const stateClass = isOpen ? styles.unlocked : styles.locked;
  const label = isOpen ? 'Vault is open and accessible' : 'Vault is locked';

  return (
    <svg
      className={`${styles.icon} ${stateClass}`}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={label}
      role="img"
    >
      {/* Outer door frame */}
      <rect x="5" y="5" width="90" height="90" rx="8" fill="none" stroke="var(--color-primary)" strokeWidth="4" />
      {/* Door face */}
      <rect x="12" y="12" width="76" height="76" rx="5" fill="#1E2D24" stroke="var(--color-primary)" strokeWidth="2" />
      {/* Outer ring */}
      <circle cx="50" cy="50" r="28" fill="none" stroke="var(--color-primary)" strokeWidth="3" />
      {/* Lock ring — color transitions based on isOpen */}
      <circle cx="50" cy="50" r="18" fill="none" className={styles.lockRing} strokeWidth="5" stroke="currentColor"
        style={{ stroke: isOpen ? 'var(--color-glow-safe)' : 'var(--color-primary)', opacity: isOpen ? 1 : 0.6 }}
      />
      {/* Center hub */}
      <circle cx="50" cy="50" r="6" fill="var(--color-primary)" />
      {/* Spokes */}
      <line x1="50" y1="22" x2="50" y2="32" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="68" x2="50" y2="78" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
      <line x1="22" y1="50" x2="32" y2="50" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
      <line x1="68" y1="50" x2="78" y2="50" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
      {/* Handle */}
      <rect x="60" y="46" width="18" height="8" rx="4" fill="var(--color-primary)" />
    </svg>
  );
}
