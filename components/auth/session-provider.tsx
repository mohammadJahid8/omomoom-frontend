"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { fetchSession, signOut as signOutRequest } from "@/lib/api/auth";
import type { SessionStatus, SessionUser } from "@/types/auth";

type SessionContextValue = {
  user: SessionUser | null;
  status: SessionStatus;
  setUser: (user: SessionUser | null) => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();

    fetchSession(controller.signal)
      .then((found) => {
        setUser(found);
        setStatus(found ? "authenticated" : "anonymous");
      })
      .catch(() => setStatus("anonymous"));

    return () => controller.abort();
  }, []);

  const applyUser = useCallback((next: SessionUser | null) => {
    setUser(next);
    setStatus(next ? "authenticated" : "anonymous");
  }, []);

  const refresh = useCallback(async () => {
    applyUser(await fetchSession());
  }, [applyUser]);

  const signOut = useCallback(async () => {
    await signOutRequest().catch(() => null);
    applyUser(null);
  }, [applyUser]);

  const value = useMemo(
    () => ({ user, status, setUser: applyUser, refresh, signOut }),
    [user, status, applyUser, refresh, signOut],
  );

  return (
    <SessionContext value={value}>{children}</SessionContext>
  );
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used inside <SessionProvider>");
  }
  return value;
}
