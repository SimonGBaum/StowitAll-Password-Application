import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWalkingTransition } from '../../context/WalkingTransitionContext';
import { WALK_DURATION_LOGOUT, WALK_DURATION_CREATE } from '../../lib/animationConstants';
import { PageShell } from '../../components/PageShell/PageShell';
import { AnvilLogo } from '../../components/AnvilLogo/AnvilLogo';
import { DateTimeGroup } from '../../components/DateTimeGroup/DateTimeGroup';
import { NavLink } from '../../components/NavLink/NavLink';
import { Button } from '../../components/Button/Button';
import styles from './Home.module.css';

export function Home() {
  const { logout } = useAuth();
  const { triggerWalk } = useWalkingTransition();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    triggerWalk(() => navigate('/'), WALK_DURATION_LOGOUT);
  };

  return (
    <PageShell
      navLeft={<NavLink to="/profile">User Profile</NavLink>}
      navCenter={<AnvilLogo />}
      navRight={<DateTimeGroup />}
      footerLeft={<NavLink to="/contact">Contact Us</NavLink>}
      footerCenter={<NavLink to="/vault">My Vault</NavLink>}
      footerRight={<NavLink onClick={handleLogout}>Log Out</NavLink>}
    >
      <div className={styles.hero}>
        <span className={styles.heroTitle}>StowitAll</span>
        <span className={styles.heroSlogan}>One vault. Every password. Zero excuses.</span>
      </div>

      <p className={styles.quatrain}>
        One vault to hold them, forged in digital flame,<br />
        Where every key is locked beneath your name.<br />
        No prying eyes, no cracks, no breach of trust --<br />
        Your secrets sealed in iron, as they must.
      </p>

      <div className={styles.cta}>
        <Button variant="full-width" onClick={() => triggerWalk(() => navigate('/create'), WALK_DURATION_CREATE)}>
          Password Creation Room
        </Button>
      </div>
    </PageShell>
  );
}
