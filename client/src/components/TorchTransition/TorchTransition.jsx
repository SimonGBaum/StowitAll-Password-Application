import { useTorchTransition } from '../../context/TorchTransitionContext';
import styles from './TorchTransition.module.css';

export function TorchTransition() {
  const { isActive, duration } = useTorchTransition();

  if (!isActive) return null;

  return (
    <div className={styles.overlay} style={{ '--dur': `${duration}ms` }}>
      <div className={styles.torchWrapper}>
        <div className={styles.torchLight} />
      </div>
      <div className={styles.wallLeft} />
      <div className={styles.wallRight} />
      <div className={styles.floor} />
      <div className={styles.vanishingPoint} />
    </div>
  );
}
