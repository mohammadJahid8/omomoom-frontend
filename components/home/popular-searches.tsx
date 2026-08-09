"use client";

import type { MouseEvent } from "react";

import { useFilterState } from "@/components/filters/filter-state";
import { POPULAR_SEARCHES } from "@/lib/static-content";
import { toSearchParams } from "@/lib/filters";

export function PopularSearches() {
  const { apply } = useFilterState();

  const onClick = (
    event: MouseEvent<HTMLAnchorElement>,
    entry: (typeof POPULAR_SEARCHES)[number],
  ) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    apply(entry.dish ? { dish: [entry.dish] } : { q: entry.q ?? "" });
  };

  return (
    <ul className="flex flex-wrap gap-2">
      {POPULAR_SEARCHES.map((entry) => {
        const query = toSearchParams(
          entry.dish ? { dish: [entry.dish] } : { q: entry.q ?? "" },
        ).toString();

        return (
          <li key={entry.label}>
            <a
              href={`/?${query}`}
              onClick={(event) => onClick(event, entry)}
              className="hover:border-brand hover:bg-brand inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors"
            >
              <span aria-hidden="true">{entry.emoji}</span>
              {entry.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
