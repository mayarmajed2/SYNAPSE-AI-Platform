import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, getStoredToken, setStoredToken } from "../services/api";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  workspace?: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  } | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; full_name: string; password: string; workspace_name?: string }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setStoredToken(res.access_token);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (payload: { email: string; full_name: string; password: string; workspace_name?: string }) => {
      const res = await api.register(payload);
      setStoredToken(res.access_token);
      setUser(res.user);
    },
    []
  );

  const demoLogin = useCallback(async () => {
    const res = await api.demoLogin();
    setStoredToken(res.access_token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
