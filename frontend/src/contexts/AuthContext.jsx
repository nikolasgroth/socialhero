import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { usePushNotifications } from '../hooks/usePushNotifications';
import * as storage from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  // Restore session from storage on mount (async für Native/Preferences)
  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const [storedToken, storedOnboarded] = await Promise.all([
        storage.getToken(),
        storage.getOnboarded(),
      ]);

      if (cancelled) return;

      setOnboarded(!!storedOnboarded);

      if (storedToken) {
        api.setToken(storedToken);
        setToken(storedToken);
        try {
          const u = await api.getMe();
          if (!cancelled) setUser(u);
        } catch {
          if (!cancelled) {
            setToken(null);
            api.clearToken();
            storage.removeToken();
          }
        }
      }

      if (!cancelled) setLoading(false);
    }

    loadSession();
    return () => { cancelled = true; };
  }, []);

  const handleAuth = useCallback(async (data) => {
    api.setToken(data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    await storage.setToken(data.access_token);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await api.register(name, email, password);
    await handleAuth(data);
    return data;
  }, [handleAuth]);

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    await handleAuth(data);
    return data;
  }, [handleAuth]);

  const socialLogin = useCallback(async (provider, idToken, name) => {
    const data = await api.socialLogin(provider, idToken, name);
    await handleAuth(data);
    return data;
  }, [handleAuth]);

  const logout = useCallback(async () => {
    api.clearToken();
    setToken(null);
    setUser(null);
    await storage.removeToken();
    await storage.setOnboarded(false);
    setOnboarded(false);
  }, []);

  const updateUser = useCallback(async (data) => {
    const updated = await api.updateMe(data);
    setUser(updated);
    return updated;
  }, []);

  const completeOnboarding = useCallback(async () => {
    setOnboarded(true);
    await storage.setOnboarded(true);
  }, []);

  usePushNotifications(!!user);

  return (
    <AuthContext.Provider value={{
      user, token, loading, onboarded,
      register, login, socialLogin, logout, updateUser, completeOnboarding,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
