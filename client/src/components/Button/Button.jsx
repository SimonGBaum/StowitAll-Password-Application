import styles from './Button.module.css';

export function Button({ children, variant = 'default', onClick, disabled, type = 'button', className = '' }) {
  const classes = [
    styles.btn,
    variant === 'destructive' ? styles.destructive : '',
    variant === 'full-width' ? styles.fullWidth : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
