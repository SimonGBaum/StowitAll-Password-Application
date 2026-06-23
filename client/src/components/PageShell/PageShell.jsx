import { NavBar } from '../NavBar/NavBar';
import { FooterNav } from '../FooterNav/FooterNav';
import styles from './PageShell.module.css';

export function PageShell({ navLeft, navCenter, navRight, footerLeft, footerCenter, footerRight, noFooter, children }) {
  return (
    <div className={`${styles.shell} page-canvas`}>
      <NavBar left={navLeft} center={navCenter} right={navRight} />
      <main className={styles.main}>
        {children}
      </main>
      {!noFooter && (
        <FooterNav left={footerLeft} center={footerCenter} right={footerRight} />
      )}
    </div>
  );
}
