import { useLocation } from 'react-router-dom';
import { useTorchTransition } from '../../hooks/useTorchTransition';
import styles from './NavLink.module.css';

export function NavLink({ to, onClick, duration = 1500, children }) {
  const { triggerTransition, isActive } = useTorchTransition();
  const location = useLocation();
  const isCurrentRoute = to ? location.pathname === to : false;
  const activeClass = isCurrentRoute ? styles.active : '';

  const handleClick = () => {
    if (isActive) return;
    if (onClick) { onClick(); return; }
    if (to) triggerTransition(to, duration);
  };

  return (
    <button type="button" className={`${styles.link} ${activeClass}`} onClick={handleClick}>
      {children}
    </button>
  );
}
