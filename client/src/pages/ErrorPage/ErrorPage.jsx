import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTorchTransition } from '../../hooks/useTorchTransition';
import { DateTimeGroup } from '../../components/DateTimeGroup/DateTimeGroup';
import { Button } from '../../components/Button/Button';
import styles from './ErrorPage.module.css';

export function ErrorPage() {
  const { user, logout } = useAuth();
  const { triggerTransition } = useTorchTransition();

  useEffect(() => {
    if (user) logout();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleHome = () => triggerTransition(user ? '/home' : '/', 1500);

  return (
    <div className={styles.dungeonScope}>
      <div className={styles.dtgWrapper}>
        <DateTimeGroup />
      </div>

      <div className={styles.header}>
        <span className={styles.brandName}>StowitAll</span>
        <span className={styles.slogan}>One vault. Every password. Zero excuses.</span>
      </div>

      <div className={styles.errorPanel}>
        <p className={styles.errorMessage}>
          Error: Thou hast broken the Ancient Laws of computer applications and have been sent to the DUNGEON!
        </p>
      </div>

      <div className={styles.justKidding}>
        <p className={styles.jkTitle}>Just Kidding!</p>
        <p className={styles.jkBody}>
          We are truly sorry for the inconvenience this may have caused. Please accept our humble
          apologies and we will get this taken care of in no time.
        </p>
      </div>

      <div className={styles.homeBtn}>
        <Button onClick={handleHome}>Home</Button>
      </div>
    </div>
  );
}
