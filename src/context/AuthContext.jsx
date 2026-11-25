import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as auth from '../services/authService';
import { ROLES } from '../utils/constants';
import Splash from '../components/Splash';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await auth.ensureSeeded();
        const session = await auth.restoreSession();
        if (!active) return;
        setUser(session.user);
        setToken(session.token);
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await auth.login(email, password);
    setUser(res.user);
    setToken(res.token);
    return res.user;
  }, []);

  const signup = useCallback(async (details) => {
    const res = await auth.signup(details);
    setUser(res.user);
    setToken(res.token);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
    setToken(null);
  }, []);

  const updateProfile = useCallback(
    async (patch) => {
      const next = await auth.updateProfile(user.id, patch, token);
      setUser(next);
      return next;
    },
    [user, token],
  );

  const changePassword = useCallback(
    (current, next) => auth.changePassword(user.id, current, next, token),
    [user, token],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === ROLES.ADMIN,
      login,
      signup,
      logout,
      updateProfile,
      changePassword,
    }),
    [user, token, login, signup, logout, updateProfile, changePassword],
  );

  if (!ready) return <Splash />;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
