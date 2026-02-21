import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginApi, logout as logoutApi, getMe } from "../services/auth.service.js";

const AuthContext = createContext(null);

const LS_TOKEN_KEY = "token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(LS_TOKEN_KEY) || "");
  const [loading, setLoading] = useState(true);

  const setTokenPersisted = (nextToken) => {
    const t = nextToken || "";
    setToken(t);
    if (t) localStorage.setItem(LS_TOKEN_KEY, t);
    else localStorage.removeItem(LS_TOKEN_KEY);
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginApi(email, password);

      // Expecting backend returns something like:
      // { token: "...", user: {...} }  OR { token: "..." } then call /me
      const nextToken = res?.data?.token;
      const nextUser = res?.data?.user;

      if (!nextToken) {
        throw new Error("Login response missing token");
      }

      setTokenPersisted(nextToken);

      if (nextUser) {
        setUser(nextUser);
      } else {
        const me = await getMe();
        setUser(me.data.user);
      }

      return { ok: true };
    } catch (err) {
      // keep state clean on failed login
      setTokenPersisted("");
      setUser(null);
      return { ok: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {

      await logoutApi();
    } catch {
      // ignore logout errors
    } finally {
      setTokenPersisted("");
      setUser(null);
      setLoading(false);
    }
  };

  const bootstrapAuth = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem(LS_TOKEN_KEY);
      if (!stored) {
        setTokenPersisted("");
        setUser(null);
        return;
      }

      // token exists; validate it by calling /auth/me
      setTokenPersisted(stored);
      const me = await getMe();
      setUser(me.data.user);
    } catch (err) {
      // invalid/expired token
      setTokenPersisted("");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrapAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      signIn,
      signOut,
      bootstrapAuth,
      isAuthenticated: !!token && !!user,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}