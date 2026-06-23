import { useDateTime } from '../../hooks/useDateTime';
import styles from './DateTimeGroup.module.css';

export function DateTimeGroup() {
  const dateTime = useDateTime();
  return (
    <span className={styles.dtg} aria-label="Current date and time" aria-live="off">
      {dateTime}
    </span>
  );
}
