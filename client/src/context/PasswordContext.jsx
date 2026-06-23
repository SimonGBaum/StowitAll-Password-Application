/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

// TODO: back-end phase — replace with real encrypted API calls
const MOCK_RECORDS = [
  { id: '1', passwordName: 'GitHub',   siteName: 'GitHub, Inc.',  password: '••••••••', dateCreated: '2026-01-14' },
  { id: '2', passwordName: 'Netflix',  siteName: 'Netflix, Inc.', password: '••••••••', dateCreated: '2026-03-02' },
  { id: '3', passwordName: 'Work VPN', siteName: 'Acme Corp.',    password: '••••••••', dateCreated: '2026-06-01' },
];

export const PasswordContext = createContext(null);

export function PasswordProvider({ children }) {
  const [records, setRecords] = useState(MOCK_RECORDS);

  const addRecord = async (record) => { // TODO: back-end phase
    const newRecord = {
      id: String(Date.now()),
      ...record,
      dateCreated: new Date().toISOString().split('T')[0],
    };
    setRecords((prev) => [...prev, newRecord]);
    return newRecord;
  };

  const updateRecord = async (id, changes) => { // TODO: back-end phase
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...changes } : r))
    );
  };

  const deleteRecord = async (id) => { // TODO: back-end phase
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const forgePassword = (components) => { // TODO: back-end phase — calls encryption API
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
