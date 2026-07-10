import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearCashierToken,
  getCashierToken,
  setCashierToken,
} from "../utils/cashierAuth";

const API_BASE = "http://localhost:5000";

const CashierAuthContext = createContext(null);

export function useCashierAuth() {
  const ctx = useContext(CashierAuthContext);
  if (!ctx) {
    throw new Error("useCashierAuth must be used within CashierAuthProvider");
  }
  return ctx;
}

export function CashierAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const verifySession = useCallback(async () => {
    const token = getCashierToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        clearCashierToken();
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser({ username: data.username, displayName: data.displayName });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = useCallback(async (username, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "خطا در ورود");
    }

    setCashierToken(data.token);
    setUser({ username: data.username, displayName: data.displayName });
    return data;
  }, []);

  const logout = useCallback(async () => {
    const token = getCashierToken();
    if (token) {
      fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    clearCashierToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout]
  );

  return (
    <CashierAuthContext.Provider value={value}>
      {children}
    </CashierAuthContext.Provider>
  );
}
