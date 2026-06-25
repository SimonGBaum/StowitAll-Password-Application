import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePasswords } from '../../context/PasswordContext';
<<<<<<< HEAD
import { useWalkingTransition } from '../../context/WalkingTransitionContext';
=======
import { useSmokyVeil } from '../../context/SmokyVeilContext';
>>>>>>> 5ee6f70 (save everything)
import { useToast } from '../../context/ToastContext';
import { WALK_DURATION_LOGOUT } from '../../lib/animationConstants';
import { PageShell } from '../../components/PageShell/PageShell';
import { AnvilLogo } from '../../components/AnvilLogo/AnvilLogo';
import { DateTimeGroup } from '../../components/DateTimeGroup/DateTimeGroup';
import { NavLink } from '../../components/NavLink/NavLink';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Modal } from '../../components/Modal/Modal';
import { GrandCrucible } from '../../components/GrandCrucible/GrandCrucible';
import styles from './PasswordCreationRoom.module.css';

const EMPTY_FORM = { passwordName: '', siteName: '', password: '' };

export function PasswordCreationRoom() {
  const { logout } = useAuth();
  const { records, addRecord, updateRecord, deleteRecord } = usePasswords();
<<<<<<< HEAD
  const { triggerWalk } = useWalkingTransition();
=======
  const { triggerVeil } = useSmokyVeil();
>>>>>>> 5ee6f70 (save everything)
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [filterName, setFilterName] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('new');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [deleteModal, setDeleteModal] = useState(false);

<<<<<<< HEAD
  const handleLogout = () => { logout(); triggerWalk(() => navigate('/'), WALK_DURATION_LOGOUT); };
=======
  const handleLogout = () => { logout(); triggerVeil(() => navigate('/')); };
>>>>>>> 5ee6f70 (save everything)

  const filtered = records.filter((r) =>
    r.passwordName.toLowerCase().includes(filterName.toLowerCase()) &&
    r.siteName.toLowerCase().includes(filterSite.toLowerCase())
  );

  const setField = (key) => (e) => setFormData((p) => ({ ...p, [key]: e.target.value }));

  const openNew = () => {
    setFormMode('new');
    setFormData(EMPTY_FORM);
    setSelectedId(null);
    setFormOpen(true);
  };

  const openEdit = () => {
    if (!selectedId) { addToast('Select a record first, then give the order.', 'info'); return; }
    const rec = records.find((r) => r.id === selectedId);
    setFormMode('edit');
    setFormData({ passwordName: rec.passwordName, siteName: rec.siteName, password: rec.password });
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!selectedId) { addToast('Select a record first, then give the order.', 'info'); return; }
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    await deleteRecord(selectedId);
    setSelectedId(null);
    setDeleteModal(false);
    setFormOpen(false);
    addToast('That credential has been unmade.', 'success');
  };

  const handleSave = async () => {
    if (!formData.passwordName || !formData.siteName || !formData.password) return;
    if (formMode === 'new') {
      await addRecord(formData);
      addToast('Credential forged and sealed in the vault.', 'success');
    } else {
      await updateRecord(selectedId, formData);
      addToast('The record has been reforged.', 'success');
    }
    setFormOpen(false);
    setFormData(EMPTY_FORM);
    setSelectedId(null);
  };

  const toggleReveal = (id) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handlePasswordForged = (pw) => {
    if (formOpen) setFormData((p) => ({ ...p, password: pw }));
  };

  return (
    <PageShell
      navLeft={<AnvilLogo />}
      navRight={<DateTimeGroup />}
      footerLeft={<NavLink to="/contact">Contact Us</NavLink>}
      footerCenter={<NavLink to="/home">Home</NavLink>}
      footerRight={<NavLink onClick={handleLogout}>Log Out</NavLink>}
    >
      <h1 className={styles.pageTitle}>The Password Creation Room</h1>

      <div className={styles.actionRow}>
        <Button onClick={openNew}>New</Button>
        <Button onClick={openEdit}>Edit</Button>
        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
      </div>

      <div className={styles.filterRow}>
        <Input id="filter-name" label="Password Name" value={filterName}
          onChange={(e) => setFilterName(e.target.value)} placeholder="Filter by name…" />
        <Input id="filter-site" label="Company Name" value={filterSite}
          onChange={(e) => setFilterSite(e.target.value)} placeholder="Filter by company…" />
      </div>

      <div className={`${styles.inlineForm} ${formOpen ? styles.open : ''}`}>
        <div className={styles.inlineFormInner}>
          <Input id="form-pwname" label="Password Name" value={formData.passwordName}
            onChange={setField('passwordName')} />
          <Input id="form-site" label="Company Name" value={formData.siteName}
            onChange={setField('siteName')} />
          <Input id="form-pw" label="Password" value={formData.password}
            onChange={setField('password')} />
          <div className={styles.inlineFormActions}>
            <Button onClick={handleSave}>Save</Button>
            <NavLink onClick={() => { setFormOpen(false); setFormData(EMPTY_FORM); }}>Cancel</NavLink>
          </div>
        </div>
      </div>

      {records.length === 0 ? (
        <p className={styles.emptyState}>
          The vault is empty. Forge your first credential below.
        </p>
      ) : filtered.length === 0 ? (
        <p className={styles.noMatch}>No credentials match that description.</p>
      ) : (
        <div className={styles.recordList}>
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`${styles.recordRow} ${selectedId === r.id ? styles.selected : ''}`}
              onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}
            >
              <span className={styles.recordName}>{r.passwordName}</span>
              <span className={styles.recordSite}>{r.siteName}</span>
              <span className={styles.recordPassword}>
                {revealedIds.has(r.id) ? r.password : '••••••••'}
              </span>
              <button
                type="button"
                className={styles.revealBtn}
                onClick={(e) => { e.stopPropagation(); toggleReveal(r.id); }}
                aria-label={revealedIds.has(r.id) ? 'Hide password' : 'Reveal password'}
              >
                {revealedIds.has(r.id) ? 'Hide' : 'Show'}
              </button>
            </div>
          ))}
        </div>
      )}

      <hr className={styles.divider} />

      <GrandCrucible onPasswordForged={handlePasswordForged} />

      {deleteModal && (
        <Modal
          title="Unmake This Credential?"
          message="This action cannot be undone. The credential will be gone from the vault permanently."
          confirmLabel="Unmake It"
          cancelLabel="Keep It"
          isDestructive
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal(false)}
        />
      )}
    </PageShell>
  );
}
