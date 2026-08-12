"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSession } from "@/components/auth/session-provider";
import { saveRestaurant, savedRestaurantIds, unsaveRestaurant } from "@/lib/api/contributions";

type SavedContextValue = {
  isSaved: (restaurantId: string) => boolean;
  toggle: (restaurantId: string) => Promise<void>;
  ready: boolean;
};

const SavedContext = createContext<SavedContextValue | null>(null);

const EMPTY: ReadonlySet<string> = new Set();

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const { user, status } = useSession();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status === "loading" || !user) return;

    const controller = new AbortController();

    savedRestaurantIds(controller.signal)
      .then((found) => {
        setIds(new Set(found));
        setReady(true);
      })
      .catch(() => setReady(true));

    return () => controller.abort();
  }, [user, status]);

  // Derived rather than reset in the effect, so signing out clears the marks
  // without a second render pass.
  const saved = user ? ids : EMPTY;

  const toggle = useCallback(
    async (restaurantId: string) => {
      const wasSaved = saved.has(restaurantId);

      setIds((current) => {
        const next = new Set(current);
        if (wasSaved) next.delete(restaurantId);
        else next.add(restaurantId);
        return next;
      });

      try {
        if (wasSaved) await unsaveRestaurant(restaurantId);
        else await saveRestaurant(restaurantId);
      } catch {
        setIds((current) => {
          const next = new Set(current);
          if (wasSaved) next.add(restaurantId);
          else next.delete(restaurantId);
          return next;
        });
      }
    },
    [saved],
  );

  const value = useMemo(
    () => ({
      isSaved: (id: string) => saved.has(id),
      toggle,
      ready: status !== "loading" && (!user || ready),
    }),
    [saved, toggle, ready, status, user],
  );

  return <SavedContext value={value}>{children}</SavedContext>;
}

export function useSaved(): SavedContextValue {
  const value = useContext(SavedContext);
  if (!value) throw new Error("useSaved must be used inside <SavedProvider>");
  return value;
}
