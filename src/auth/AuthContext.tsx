import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchCurrentUser, login as loginRequest, logout as logoutRequest } from "@/api/auth";
import { onUnauthorized, tokenStore } from "@/api/tokenStore";
import type { CurrentUser } from "@/api/types";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: CurrentUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    if (!tokenStore.get()) {
      setStatus("unauthenticated");
      return;
    }
    fetchCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        setStatus("authenticated");
      })
      .catch(() => {
        setStatus("unauthenticated");
      });
  }, []);

  useEffect(() => {
    return onUnauthorized(() => {
      setUser(null);
      setStatus("unauthenticated");
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      async login(username, password) {
        const { access_token } = await loginRequest({ username, password });
        tokenStore.set(access_token);
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
        setStatus("authenticated");
      },
      async logout() {
        try {
          await logoutRequest();
        } finally {
          tokenStore.clear();
          setUser(null);
          setStatus("unauthenticated");
        }
      },
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
