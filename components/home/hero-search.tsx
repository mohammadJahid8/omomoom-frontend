"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Search } from "lucide-react";

import { useFilterState } from "@/components/filters/filter-state";

const STATIC_PLACEHOLDER = "Search sushi, dim sum, ramen, brunch...";

const SUGGESTIONS = [
  "ramen in Wynwood",
  "somewhere fancy for an anniversary",
  "cheap tacos in Little Havana",
  "vegan brunch in Coral Gables",
  "sushi for a date night",
];

const TYPE_MS = 55;
const DELETE_MS = 25;
const HOLD_MS = 1800;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function useTypedPlaceholder(active: boolean): string {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!active) return;

    const phrase = SUGGESTIONS[index] ?? "";
    const complete = text === phrase;

    const timer = setTimeout(
      () => {
        if (!deleting) {
          if (complete) setDeleting(true);
          else setText(phrase.slice(0, text.length + 1));
          return;
        }
        if (text.length > 1) {
          setText(phrase.slice(0, text.length - 1));
          return;
        }
        const next = (index + 1) % SUGGESTIONS.length;
        setIndex(next);
        setDeleting(false);
        setText((SUGGESTIONS[next] ?? "").slice(0, 1));
      },
      deleting ? DELETE_MS : complete ? HOLD_MS : TYPE_MS,
    );

    return () => clearTimeout(timer);
  }, [active, text, deleting, index]);

  return active ? text : "";
}

export function HeroSearch() {
  const { ask, aiBusy } = useFilterState();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const typed = useTypedPlaceholder(
    !focused && value === "" && !aiBusy && !reducedMotion,
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void ask(value);
  };

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label="Search restaurants"
      className="bg-media-surface focus-within:ring-brand/60 flex w-full items-center gap-3 rounded-full py-1.5 pr-1.5 pl-5 shadow-lg transition focus-within:ring-2 sm:max-w-xl"
    >
      <Search
        className="text-media-muted size-5 shrink-0"
        aria-hidden="true"
      />

      <label htmlFor="hero-search" className="sr-only">
        Search restaurants, dishes, cuisines and neighborhoods
      </label>
      <input
        id="hero-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={typed ? `${typed}|` : STATIC_PLACEHOLDER}
        className="text-media-foreground placeholder:text-media-muted min-w-0 flex-1 bg-transparent py-3 text-base outline-none"
      />

      <button
        type="submit"
        aria-label="Search"
        disabled={aiBusy || value.trim().length < 2}
        className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {aiBusy ? (
          <Loader2 className="size-4.5 animate-spin" aria-hidden="true" />
        ) : (
          <>
            <Search className="size-4.5 sm:hidden" aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
          </>
        )}
      </button>
    </form>
  );
}
