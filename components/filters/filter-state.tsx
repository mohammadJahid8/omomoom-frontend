"use client";

import {
  createContext,
  useContext,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { askAi } from "@/lib/api/ai";

import {
  EMPTY_FILTERS,
  toSearchParams,
  toggleFilter,
  type FilterKey,
  type Filters,
} from "@/lib/filters";
import { scrollToResults } from "@/lib/smooth-scroll";

type FilterState = {
  filters: Filters;
  toggle: (key: FilterKey, value: string) => void;
  clear: () => void;
  search: (q: string, options?: { scroll?: boolean }) => void;

  apply: (next: Partial<Filters>, options?: { scroll?: boolean }) => void;
  isPending: boolean;

  ask: (phrase: string) => Promise<void>;
  aiBusy: boolean;
  aiNote: string | null;
  clearAiNote: () => void;
};

const FilterStateContext = createContext<FilterState | null>(null);

export function FilterStateProvider({
  filters: serverFilters,
  children,
}: {
  filters: Filters;
  children: ReactNode;
}) {
  const router = useRouter();

  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [filters, setOptimistic] = useOptimistic(serverFilters);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  const wantsScroll = useRef(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && wantsScroll.current) {
      wantsScroll.current = false;
      scrollToResults();
    }
    wasPending.current = isPending;
  }, [isPending]);

  const navigate = (next: Filters, href: string, scroll: boolean) => {
    if (scroll) wantsScroll.current = true;

    startTransition(() => {
      setOptimistic(next);
      router.replace(href, { scroll: false });
      router.refresh();
    });
  };

  const hrefFor = (next: Filters) => {
    const query = toSearchParams(next).toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const applyFilters = (partial: Partial<Filters>, scroll = true) => {
    const next: Filters = { ...EMPTY_FILTERS, ...partial };
    navigate(next, hrefFor(next), scroll);
  };

  const value: FilterState = {
    filters,
    isPending,
    aiBusy,
    aiNote,
    clearAiNote: () => setAiNote(null),

    ask: async (phrase) => {
      const query = phrase.trim();
      if (query.length < 2 || aiBusy) return;

      setAiBusy(true);
      setAiNote(null);
      try {
        const result = await askAi(query);
        applyFilters(result.filters);
        setAiNote(result.explanation);
      } catch {
        setAiNote("Could not interpret that, showing a plain search instead.");
        applyFilters({ q: query });
      } finally {
        setAiBusy(false);
      }
    },

    toggle: (key, val) => {
      const isAdding = !(filters[key] ?? []).includes(val);
      const next = toggleFilter(filters, key, val);
      navigate(next, hrefFor(next), isAdding);
    },

    clear: () => navigate(EMPTY_FILTERS, hrefFor(EMPTY_FILTERS), false),

    search: (q, options) => {
      const next = { ...filters, q, page: undefined };
      navigate(next, hrefFor(next), options?.scroll ?? false);
    },

    apply: (partial, options) => applyFilters(partial, options?.scroll ?? true),
  };

  return (
    <FilterStateContext.Provider value={value}>
      {children}
    </FilterStateContext.Provider>
  );
}

export function useFilterState(): FilterState {
  const context = useContext(FilterStateContext);
  if (!context) {
    throw new Error("useFilterState must be used inside a FilterStateProvider");
  }
  return context;
}
