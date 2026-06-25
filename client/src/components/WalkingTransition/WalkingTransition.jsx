import { useWalkingTransition } from '../../context/WalkingTransitionContext';
import styles from './WalkingTransition.module.css';

export function WalkingTransition() {
  const { phase } = useWalkingTransition();

  if (phase === 'idle') return null;

  return (
    <div
      className={styles.overlay}
      data-phase={phase}
      aria-hidden="true"
    >
      {/* Stone corridor base with vignette edges */}
      <div className={styles.corridor} />

      {/* Torch flame light — left and right sources for depth */}
      <div className={styles.torchLeft} />
      <div className={styles.torchRight} />

      {/* Centre glow — dim sphere of light the walker carries */}
      <div className={styles.carriedLight} />
    </div>
  );
}
