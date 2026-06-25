<<<<<<< HEAD
import { Link, useMatch, useNavigate } from 'react-router-dom';
import { useWalkingTransition } from '../../context/WalkingTransitionContext';
import { ROUTE_WALK_DURATIONS, WALK_DURATION_DEFAULT } from '../../lib/animationConstants';
import styles from './NavLink.module.css';

export function NavLink({ to, onClick, children }) {
  const navigate = useNavigate();
  const { triggerWalk } = useWalkingTransition();
=======
import { Link, useMatch } from 'react-router-dom';
import styles from './NavLink.module.css';

export function NavLink({ to, onClick, children }) {
>>>>>>> 5ee6f70 (save everything)
  const match = useMatch(to ?? '___no_match___');
  const activeClass = match ? styles.active : '';

  if (to) {
<<<<<<< HEAD
    const handleClick = (e) => {
      e.preventDefault();
      // React Router's Link also checks e.defaultPrevented; our preventDefault stops it
      const duration = ROUTE_WALK_DURATIONS[to] ?? WALK_DURATION_DEFAULT;
      triggerWalk(() => navigate(to), duration);
    };

    return (
      <Link to={to} className={`${styles.link} ${activeClass}`} onClick={handleClick}>
=======
    return (
      <Link to={to} className={`${styles.link} ${activeClass}`}>
>>>>>>> 5ee6f70 (save everything)
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={styles.link} onClick={onClick}>
      {children}
    </button>
  );
}
