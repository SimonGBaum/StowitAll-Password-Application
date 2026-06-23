import { useToast } from '../../context/ToastContext';
import styles from './Toast.module.css';

const TYPE_LABELS = { success: 'Success', error: 'Error', info: 'Info' };

export function Toast() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toast} ${styles[t.type]}`}
          role="alert"
          aria-live="assertive"
          onClick={() => removeToast(t.id)}
        >
          <span className={styles.typeLabel}>{TYPE_LABELS[t.type]}</span>
          <span className={styles.message}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
