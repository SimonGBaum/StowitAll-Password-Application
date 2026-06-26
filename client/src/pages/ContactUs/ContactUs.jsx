import { useAuth } from '../../context/AuthContext';
import { useTorchTransition } from '../../hooks/useTorchTransition';
import { PageShell } from '../../components/PageShell/PageShell';
import { AnvilLogo } from '../../components/AnvilLogo/AnvilLogo';
import { DateTimeGroup } from '../../components/DateTimeGroup/DateTimeGroup';
import { Button } from '../../components/Button/Button';
import styles from './ContactUs.module.css';

const CONTACTS = [
  { label: 'Email',    value: 'contact@stowitall.dev',              href: 'mailto:contact@stowitall.dev',              external: false },
  { label: 'Phone',    value: '+1 (555) 867-5309',                  href: 'tel:+15558675309',                          external: false },
  { label: 'GitHub',   value: 'github.com/stowitall',               href: 'https://github.com/stowitall',              external: true  },
  { label: 'LinkedIn', value: 'linkedin.com/company/stowitall',     href: 'https://linkedin.com/company/stowitall',    external: true  },
];

export function ContactUs() {
  const { user } = useAuth();
  const { triggerTransition } = useTorchTransition();

  const usernameDisplay = (
    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-nav)', color: 'var(--color-secondary)' }}>
      {user?.username || ''}
    </span>
  );

  return (
    <PageShell
      navLeft={usernameDisplay}
      navCenter={<AnvilLogo />}
      navRight={<DateTimeGroup />}
    >
      <div className={styles.homeBtn}>
        <Button onClick={() => triggerTransition('/home', 3000)}>Home</Button>
      </div>

      <p className={styles.intro}>
        Here are some ways that you can contact us.<br />
        Please feel free to reach out anytime.
      </p>

      <div className={styles.contactList}>
        {CONTACTS.map(({ label, value, href, external }) => (
          <div key={label} className={styles.contactItem}>
            <span className={styles.contactLabel}>{label}</span>
            <a
              href={href}
              className={styles.contactValue}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {value}
            </a>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
