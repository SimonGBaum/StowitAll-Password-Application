import { useSmokyVeil } from '../../context/SmokyVeilContext';
import styles from './SmokyVeil.module.css';

export function SmokyVeil() {
  const { phase } = useSmokyVeil();
  const visible = phase === 'fade-in' || phase === 'hold' || phase === 'fade-out';

  return (
    <div
      className={`${styles.veil} ${visible ? styles.visible : ''}`}
      aria-hidden="true"
    />
  );
}
