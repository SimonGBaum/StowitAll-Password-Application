/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

// TODO: back-end phase — replace mock with real Supabase auth
const MOCK_USER = {
  id: 'mock-1',
  email: 'jane@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  username: 'jsmith',
};

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(MOCK_USER);

  const login = async () => { // TODO: back-end phase — accepts (email, password)
    setUser(MOCK_USER);
  };

  const logout = async () => { // TODO: back-end phase
    setUser(null);
  };

  const signup = async () => { // TODO: back-end phase — accepts (fields)
    // noop stub — returns successfully
  };

  const updateProfile = async (changes) => { // TODO: back-end phase
    setUser((prev) => ({ ...prev, ...changes }));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
