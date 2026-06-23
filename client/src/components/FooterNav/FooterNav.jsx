import styles from './FooterNav.module.css';

export function FooterNav({ left, center, right }) {
  return (
    <footer className={styles.bar}>
      <div className={styles.left}>{left}</div>
      <div className={styles.center}>{center}</div>
      <div className={styles.right}>{right}</div>
    </footer>
  );
}
