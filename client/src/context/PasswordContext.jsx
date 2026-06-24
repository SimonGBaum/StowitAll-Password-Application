/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { encryptPassword, decryptPassword } from '../lib/crypto';
import { useAuth } from './AuthContext';

export const PasswordContext = createContext(null);

// Maps a DB row → the shape the UI expects
async function rowToRecord(row, userId) {
  let password = '';
  try {
    password = await decryptPassword(row.encrypted_password, userId);
  } catch {
    password = '[decryption error]';
  }
  return {
    id: row.id,
    passwordName: row.password_name,
    siteName: row.site_name,
    siteUrl: row.site_url ?? '',
    siteUsername: row.username,
    password,
    notes: row.notes ?? '',
    dateCreated: row.created_at.split('T')[0],
  };
}

export function PasswordProvider({ children }) {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (!user) { setRecords([]); return; }

    supabase
      .from('password_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .then(async ({ data, error }) => {
        if (error || !data) return;
        const mapped = await Promise.all(data.map((row) => rowToRecord(row, user.id)));
        setRecords(mapped);
      });
  }, [user]);

  const addRecord = async (record) => {
    const encrypted = await encryptPassword(record.password, user.id);
    const { data, error } = await supabase
      .from('password_entries')
      .insert({
        user_id: user.id,
        password_name: record.passwordName,
        site_name: record.siteName,
        site_url: record.siteUrl || null,
        username: record.siteUsername || '',
        encrypted_password: encrypted,
        notes: record.notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    const newRecord = await rowToRecord(data, user.id);
    setRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const updateRecord = async (id, changes) => {
    const updates = {};
    if (changes.passwordName !== undefined) updates.password_name = changes.passwordName;
    if (changes.siteName !== undefined)     updates.site_name     = changes.siteName;
    if (changes.siteUrl !== undefined)      updates.site_url      = changes.siteUrl || null;
    if (changes.siteUsername !== undefined) updates.username      = changes.siteUsername;
    if (changes.notes !== undefined)        updates.notes         = changes.notes || null;
    if (changes.password !== undefined) {
      updates.encrypted_password = await encryptPassword(changes.password, user.id);
    }

    const { error } = await supabase
      .from('password_entries')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...changes } : r))
    );
  };

  const deleteRecord = async (id) => {
    const { error } = await supabase
      .from('password_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const forgePassword = (components) => {
    const { length = 16, uppercase = true, lowercase = true, numbers = true, symbols = true } = components;
    const charSets = [];
    if (uppercase) charSets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (lowercase) charSets.push('abcdefghijklmnopqrstuvwxyz');
    if (numbers)   charSets.push('0123456789');
    if (symbols)   charSets.push('!@#$%^&*()-_=+[]{}|;:,.<>?');
    const pool = charSets.join('');
    if (!pool) return '';
    return Array.from({ length }, () => pool[Math.floor(Math.random() * pool.length)]).join('');
  };

  return (
    <PasswordContext.Provider value={{ records, addRecord, updateRecord, deleteRecord, forgePassword }}>
      {children}
    </PasswordContext.Provider>
  );
}

export function usePasswords() {
  return useContext(PasswordContext);
}
