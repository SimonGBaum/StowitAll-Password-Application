import styles from './NavBar.module.css';

export function NavBar({ left, center, right }) {
  return (
    <header className={styles.bar}>
      <div className={styles.left}>{left}</div>
      <div className={styles.center}>{center}</div>
      <div className={styles.right}>{right}</div>
    </header>
  );
}
