import { useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTorchTransition } from '../../hooks/useTorchTransition';
import { useToast } from '../../context/ToastContext';
import { PageShell } from '../../components/PageShell/PageShell';
import { AnvilLogo } from '../../components/AnvilLogo/AnvilLogo';
import { DateTimeGroup } from '../../components/DateTimeGroup/DateTimeGroup';
import { NavLink } from '../../components/NavLink/NavLink';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Modal } from '../../components/Modal/Modal';
import styles from './Profile.module.css';

export function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const { triggerTransition } = useTorchTransition();
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);
  const [fields, setFields] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    username:  user?.username  || '',
    email:     user?.email     || '',
    password:  '••••••••',
    confirmPassword: '',
  });
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [errors, setErrors] = useState({});

  const blocker = useBlocker(isEditing);

  const set = (key) => (e) => {
    if (key === 'password') setPasswordChanged(true);
    setFields((p) => ({ ...p, [key]: e.target.value }));
  };

  const handleEdit = () => {
    setFields((p) => ({ ...p, password: '', confirmPassword: '' }));
    setPasswordChanged(false);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const errs = {};
    if (passwordChanged && fields.password !== fields.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const changes = {
      firstName: fields.firstName,
      lastName:  fields.lastName,
      username:  fields.username,
      email:     fields.email,
    };
    if (passwordChanged && fields.password) changes.password = fields.password;

    await updateProfile(changes);
    setIsEditing(false);
    setPasswordChanged(false);
    setErrors({});
    addToast('Your identity has been updated.', 'success');
  };

  const handleLogout = () => {
    if (isEditing) return;
    logout();
    triggerTransition('/', 3000);
  };

  const handleNavAttempt = (dest, dur) => {
    if (isEditing) { setPendingNav({ dest, dur }); return; }
    triggerTransition(dest, dur);
  };

  const handleBlockerConfirm = () => {
    setIsEditing(false);
    if (pendingNav) {
      triggerTransition(pendingNav.dest, pendingNav.dur);
      setPendingNav(null);
    } else if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  };

  const handleBlockerCancel = () => {
    setPendingNav(null);
    if (blocker.state === 'blocked') blocker.reset();
  };

  return (
    <PageShell
      navCenter={<AnvilLogo />}
      navRight={<DateTimeGroup />}
      footerLeft={<NavLink to="/contact" onClick={() => handleNavAttempt('/contact', 3000)}>Contact Us</NavLink>}
      footerCenter={<NavLink to="/home" onClick={() => handleNavAttempt('/home', 3000)}>Home</NavLink>}
      footerRight={<NavLink onClick={handleLogout}>Log Out</NavLink>}
    >
      <h1 className={styles.pageTitle}>My Profile</h1>

      <div className={styles.fields}>
        <Input id="profile-firstname" label="First Name"  value={fields.firstName} onChange={set('firstName')} disabled={!isEditing} />
        <Input id="profile-lastname"  label="Last Name"   value={fields.lastName}  onChange={set('lastName')}  disabled={!isEditing} />
        <Input id="profile-username"  label="Username"    value={fields.username}  onChange={set('username')}  disabled={!isEditing} />
        <Input id="profile-email"     label="Email"       value={fields.email}     onChange={set('email')}     disabled={!isEditing} type="email" />
        <Input id="profile-password"  label="Password"    value={isEditing ? fields.password : '••••••••'}
          onChange={set('password')} disabled={!isEditing} type={isEditing ? 'password' : 'text'} />

        <div className={`${styles.confirmPwField} ${isEditing && passwordChanged ? styles.visible : ''}`}>
          <Input id="profile-confirm" label="Confirm Password" value={fields.confirmPassword}
            onChange={set('confirmPassword')} type="password" error={errors.confirmPassword} />
        </div>

        <div className={styles.actions}>
          <Button onClick={handleEdit} disabled={isEditing}>Edit</Button>
          <Button onClick={handleSave} disabled={!isEditing}>Save</Button>
        </div>
      </div>

      {(pendingNav !== null || blocker.state === 'blocked') && (
        <Modal
          title="Unsaved Changes"
          message="You have unsaved changes on your profile. Leave without saving?"
          confirmLabel="Leave"
          cancelLabel="Stay & Save"
          isDestructive={false}
          onConfirm={handleBlockerConfirm}
          onCancel={handleBlockerCancel}
        />
      )}
    </PageShell>
  );
}
