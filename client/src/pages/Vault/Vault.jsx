import { useState } from 'react';
import { usePasswords } from '../../context/PasswordContext';
import { useToast } from '../../context/ToastContext';
import { PageShell } from '../../components/PageShell/PageShell';
import { AnvilLogo } from '../../components/AnvilLogo/AnvilLogo';
import { DateTimeGroup } from '../../components/DateTimeGroup/DateTimeGroup';
import { NavLink } from '../../components/NavLink/NavLink';
import { VaultDoorIcon } from '../../components/VaultDoorIcon/VaultDoorIcon';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Modal } from '../../components/Modal/Modal';
import styles from './Vault.module.css';

export function Vault() {
  const { records, updateRecord, deleteRecord } = usePasswords();
  const { addToast } = useToast();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchSite, setSearchSite] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ passwordName: '', siteName: '', password: '' });
  const [deleteModal, setDeleteModal] = useState(false);

  const handleSearch = () => {
    setIsSearchOpen((p) => !p);
    if (isSearchOpen) { setSearchName(''); setSearchSite(''); setSearchDate(''); }
  };

  const filtered = records.filter((r) => {
    if (searchName && !r.passwordName.toLowerCase().includes(searchName.toLowerCase())) return false;
    if (searchSite && !r.siteName.toLowerCase().includes(searchSite.toLowerCase())) return false;
    if (searchDate && !r.dateCreated.includes(searchDate)) return false;
    return true;
  });

  const setField = (key) => (e) => setEditData((p) => ({ ...p, [key]: e.target.value }));

  const handleEdit = () => {
    if (!selectedId) { addToast('Select a record first, then give the order.', 'info'); return; }
    const rec = records.find((r) => r.id === selectedId);
    setEditData({ passwordName: rec.passwordName, siteName: rec.siteName, password: rec.password });
    setEditOpen(true);
  };

  const handleSave = async () => {
    await updateRecord(selectedId, editData);
    addToast('The record has been reforged.', 'success');
    setEditOpen(false);
    setSelectedId(null);
  };

  const handleDelete = () => {
    if (!selectedId) { addToast('Select a record first, then give the order.', 'info'); return; }
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    await deleteRecord(selectedId);
    setSelectedId(null);
    setDeleteModal(false);
    addToast('That credential has been unmade.', 'success');
  };

  return (
    <PageShell
      navLeft={<NavLink to="/home">Home</NavLink>}
      navCenter={<AnvilLogo />}
      navRight={<DateTimeGroup />}
      noFooter
    >
      <div className={styles.titleRow}>
        <VaultDoorIcon isOpen />
        <h1 className={styles.pageTitle}>The Vault</h1>
      </div>

      <div className={styles.actionRow}>
        <Button onClick={handleSearch}>{isSearchOpen ? 'Close Search' : 'Search'}</Button>
        <Button onClick={handleEdit}>Edit</Button>
        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
      </div>

      <div className={`${styles.searchPanel} ${isSearchOpen ? styles.open : ''}`}>
        <div className={styles.searchPanelInner}>
          <Input id="vault-search-name" label="Password Name" value={searchName}
            onChange={(e) => setSearchName(e.target.value)} />
          <Input id="vault-search-site" label="Site Name" value={searchSite}
            onChange={(e) => setSearchSite(e.target.value)} />
          <Input id="vault-search-date" label="Date Created" value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)} placeholder="YYYY-MM-DD" />
        </div>
      </div>

      <div className={`${styles.inlineForm} ${editOpen ? styles.open : ''}`}>
        <div className={styles.inlineFormInner}>
          <Input id="vault-edit-name" label="Password Name" value={editData.passwordName}
            onChange={setField('passwordName')} />
          <Input id="vault-edit-site" label="Site Name" value={editData.siteName}
            onChange={setField('siteName')} />
          <Input id="vault-edit-pw" label="Password" value={editData.password}
            onChange={setField('password')} />
          <div className={styles.inlineFormActions}>
            <Button onClick={handleSave}>Save</Button>
            <NavLink onClick={() => setEditOpen(false)}>Cancel</NavLink>
          </div>
        </div>
      </div>

      {records.length === 0 ? (
        <p className={styles.emptyState}>
          The vault awaits its first secret. Head to the Password Creation Room to begin.
        </p>
      ) : (
        <div className={styles.tableWrapper}>
          <div className={styles.tableHeader}>
            <span>Password Name</span>
            <span>Site Name</span>
            <span>Date Created</span>
          </div>
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`${styles.tableRow} ${selectedId === r.id ? styles.selected : ''}`}
              onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}
            >
              <span>{r.passwordName}</span>
              <span>{r.siteName}</span>
              <span>{r.dateCreated}</span>
            </div>
          ))}
        </div>
      )}

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
