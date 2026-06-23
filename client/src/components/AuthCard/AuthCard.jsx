import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSmokyVeil } from '../../context/SmokyVeilContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../Input/Input';
import { Button } from '../Button/Button';
import styles from './AuthCard.module.css';

const EMPTY = { email: '', password: '', confirmPassword: '', firstName: '', lastName: '', username: '' };
const EMPTY_ERRORS = { email: '', password: '', confirmPassword: '', firstName: '', lastName: '', username: '', form: '' };

export function AuthCard() {
  const [mode, setMode] = useState('login');
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState(EMPTY_ERRORS);

  const { login, signup } = useAuth();
  const { triggerVeil } = useSmokyVeil();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const set = (key) => (e) => setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const switchMode = (next) => {
    setMode(next);
    setFields(EMPTY);
    setErrors(EMPTY_ERRORS);
  };

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = { ...EMPTY_ERRORS };
    if (!fields.email)    errs.email    = 'Email is required.';
    if (!fields.password) errs.password = 'Password is required.';
    if (errs.email || errs.password) { setErrors(errs); return; }

    try {
      await login(fields.email, fields.password);
      triggerVeil(() => navigate('/home'));
    } catch {
      setErrors((prev) => ({ ...prev, form: 'Incorrect email or password.' }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const errs = { ...EMPTY_ERRORS };
    if (!fields.email)           errs.email           = 'Email is required.';
    else if (!validateEmail(fields.email)) errs.email = 'Enter a valid email address.';
    if (!fields.firstName)       errs.firstName       = 'First name is required.';
    if (!fields.lastName)        errs.lastName        = 'Last name is required.';
    if (!fields.username)        errs.username        = 'Username is required.';
    if (!fields.password)        errs.password        = 'Password is required.';
    if (!fields.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (fields.password !== fields.confirmPassword) {
      errs.password        = 'Passwords do not match.';
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (Object.values(errs).some(Boolean)) { setErrors(errs); return; }

    try {
      await signup(fields);
      addToast('Account created. Now sign in to enter the vault.', 'info');
      switchMode('login');
    } catch {
      setErrors((prev) => ({ ...prev, form: 'Something went sideways. Try that again.' }));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.brand}>
        <span className={styles.brandName}>StowitAll</span>
        <span className={styles.slogan}>One vault. Every password. Zero excuses.</span>
      </div>

      <div className={styles.card}>
        {mode === 'login' ? (
          <form onSubmit={handleLogin} noValidate>
            <div className={styles.fields}>
              <Input id="login-email" label="Email Address" type="email" value={fields.email}
                onChange={set('email')} placeholder="you@example.com" autoComplete="email"
                error={errors.email} />
              <Input id="login-password" label="Password" type="password" value={fields.password}
                onChange={set('password')} autoComplete="current-password" error={errors.password} />
              {errors.form && <p className={styles.inlineError}>{errors.form}</p>}
            </div>
            <Button variant="full-width" type="submit">Submit</Button>
            <button type="button" className={styles.toggle} onClick={() => switchMode('signup')}>
              I do not have an account
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} noValidate>
            <div className={styles.fields}>
              <Input id="signup-email"     label="Email Address"    type="email"    value={fields.email}           onChange={set('email')}           autoComplete="email"         error={errors.email} />
              <Input id="signup-firstname" label="First Name"       type="text"     value={fields.firstName}       onChange={set('firstName')}       autoComplete="given-name"    error={errors.firstName} />
              <Input id="signup-lastname"  label="Last Name"        type="text"     value={fields.lastName}        onChange={set('lastName')}        autoComplete="family-name"   error={errors.lastName} />
              <Input id="signup-username"  label="Username"         type="text"     value={fields.username}        onChange={set('username')}        autoComplete="username"      error={errors.username} />
              <Input id="signup-password"  label="Password"         type="password" value={fields.password}        onChange={set('password')}        autoComplete="new-password"  error={errors.password} />
              <Input id="signup-confirm"   label="Confirm Password" type="password" value={fields.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password"  error={errors.confirmPassword} />
              {errors.form && <p className={styles.inlineError}>{errors.form}</p>}
            </div>
            <Button variant="full-width" type="submit">Submit</Button>
            <button type="button" className={styles.toggle} onClick={() => switchMode('login')}>
              I have an account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
