import { useEffect, useRef, useId } from 'react';
import { Button } from '../Button/Button';
import styles from './Modal.module.css';

export function Modal({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, isDestructive = false }) {
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);
  const baseId = useId();
  const titleId = `modal-title-${baseId}`;

  useEffect(() => {
    previousFocusRef.current = document.activeElement;

    const focusable = panelRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable?.length) focusable[0].focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onCancel(); return; }
      if (e.key !== 'Tab') return;
      const elements = Array.from(focusable || []);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [onCancel]);

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button variant="default" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={isDestructive ? 'destructive' : 'default'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
