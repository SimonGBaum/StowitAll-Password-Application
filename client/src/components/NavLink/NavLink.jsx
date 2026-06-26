import { Link, useMatch } from 'react-router-dom';
import styles from './NavLink.module.css';

export function NavLink({ to, onClick, children }) {
  const match = useMatch(to ?? '___no_match___');
  const activeClass = match ? styles.active : '';

  if (to) {
    return (
      <Link to={to} className={`${styles.link} ${activeClass}`}>
        {children}
      </Link>
    );
  }


  return (
    <button type="button" className={`${styles.link} ${activeClass}`} onClick={handleClick}>
      {children}
    </button>
  );
}
