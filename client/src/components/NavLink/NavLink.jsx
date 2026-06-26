import { useMatch } from 'react-router-dom';
import { useTorchTransition } from '../../context/TorchTransitionContext';
import { ROUTE_WALK_DURATIONS, WALK_DURATION_DEFAULT } from '../../lib/animationConstants';
import styles from './NavLink.module.css';

export function NavLink({ to, onClick, children, duration }) {
  const { triggerTransition } = useTorchTransition();
  const match = useMatch(to ?? '___no_match___');
  const activeClass = match ? styles.active : '';

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      const dur = duration ?? ROUTE_WALK_DURATIONS[to] ?? WALK_DURATION_DEFAULT;
      triggerTransition(to, dur);
    }
  };

  return (
    <button type="button" className={`${styles.link} ${activeClass}`} onClick={handleClick}>
      {children}
    </button>
  );
}
