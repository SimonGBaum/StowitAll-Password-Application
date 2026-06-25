import { useTorchTransitionContext } from '../../context/TorchTransitionContext';
import styles from './TorchTransition.module.css';

export function TorchTransition() {
  const { isActive, duration } = useTorchTransitionContext();

  if (!isActive) return null;

  return (
    <div
      className={styles.overlay}
      style={{ '--torch-dur': `${duration}ms` }}
      aria-hidden="true"
    >
      <div className={styles.wallLeft} />
      <div className={styles.wallRight} />
      <div className={styles.floorLine} />
      <div className={styles.vanishingPoint} />
      <div className={styles.torchGlow} />
    </div>
  );
}
