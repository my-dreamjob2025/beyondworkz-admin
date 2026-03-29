import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getStoredUser } from "../services/api";
import { bootstrapSession, logout as clearSession, persistSession } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const restored = await bootstrapSession();
        if (cancelled) return;
        if (restored) {
          setUser(restored);
        } else {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((payload) => {
    persistSession(payload);
    setUser(payload.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, initializing, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook colocated with provider for this small app (fast-refresh prefers single-export files).
// eslint-disable-next-line react-refresh/only-export-components -- useAuth is the public API for AuthProvider
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
