import { useLocation } from 'react-router-dom';
import { useTorchTransition } from '../../hooks/useTorchTransition';
import styles from './NavLink.module.css';

export function NavLink({ to, onClick, duration = 1500, children }) {
  const location = useLocation();
  const { triggerTransition } = useTorchTransition();

  const isCurrentPage = to ? location.pathname === to : false;
  const activeClass   = isCurrentPage ? styles.active : '';

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      triggerTransition(to, duration);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.link} ${activeClass}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
