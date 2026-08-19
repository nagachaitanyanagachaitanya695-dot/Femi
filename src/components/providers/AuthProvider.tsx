"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  mobile: string;
  role: "customer" | "admin";
}

interface AuthApi {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<SessionUser | null>;
  signOut: () => Promise<void>;
  setUser: (user: SessionUser | null) => void;
}

const AuthContext = createContext<AuthApi>({
  user: null,
  loading: true,
  refresh: async () => null,
  signOut: async () => {},
  setUser: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Session state for the UI only.
 *
 * This is a convenience mirror of the http-only session cookie so the header
 * can show the right thing — it is never the thing that grants access. Every
 * protected action is re-checked on the server.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await response.json()) as { user: SessionUser | null };
      setUser(data.user ?? null);
      return data.user ?? null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, refresh, signOut, setUser }),
    [user, loading, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
