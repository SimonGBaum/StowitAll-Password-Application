/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AuthContext = createContext(null);

async function fetchProfile(authUser) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, username')
    .eq('user_id', authUser.id)
    .single();

  return {
    id: authUser.id,
    email: authUser.email,
    firstName: profile?.first_name ?? '',
    lastName: profile?.last_name ?? '',
    username: profile?.username ?? '',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = session not yet resolved
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setUser(await fetchProfile(session.user));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(await fetchProfile(session.user));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // onAuthStateChange handles setUser
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signup = async (fields) => {
    const { error } = await supabase.auth.signUp({
      email: fields.email,
      password: fields.password,
      options: {
        data: {
          first_name: fields.firstName,
          last_name: fields.lastName,
          username: fields.username,
        },
      },
    });
    if (error) throw error;
    // handle_new_user DB trigger auto-inserts the profiles row
  };

  const updateProfile = async (changes) => {
    const authUpdates = {};
    if (changes.email) authUpdates.email = changes.email;
    if (changes.password) authUpdates.password = changes.password;

    if (Object.keys(authUpdates).length) {
      const { error } = await supabase.auth.updateUser(authUpdates);
      if (error) throw error;
    }

    const profileUpdates = {};
    if (changes.firstName) profileUpdates.first_name = changes.firstName;
    if (changes.lastName)  profileUpdates.last_name  = changes.lastName;
    if (changes.username)  profileUpdates.username   = changes.username;

    if (Object.keys(profileUpdates).length) {
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('user_id', user.id);
      if (error) throw error;
    }

    setUser((prev) => ({
      ...prev,
      email:     changes.email     ?? prev.email,
      firstName: changes.firstName ?? prev.firstName,
      lastName:  changes.lastName  ?? prev.lastName,
      username:  changes.username  ?? prev.username,
    }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
