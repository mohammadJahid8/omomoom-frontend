"use client";

import { X } from "lucide-react";

import { FilterChip } from "@/components/filters/filter-chip";
import { FilterDrawer } from "@/components/filters/filter-drawer";
import { useFilterState } from "@/components/filters/filter-state";
import { SearchField } from "@/components/filters/search-field";
import {
  FILTER_GROUPS,
  countActiveFilters,
  facetsFor,
  type FilterKey,
} from "@/lib/filters";
import type { RestaurantFacets } from "@/types/api";
import { cn } from "@/lib/utils";

type FilterPanelProps = {
  facets: RestaurantFacets | undefined;
  total: number;
};

const INLINE_GROUPS: { key: FilterKey; take: number }[] = [
  { key: "cuisine", take: 10 },
  { key: "area", take: 8 },
  { key: "price", take: 4 },
];

export function FilterPanel({ facets, total }: FilterPanelProps) {
  const { filters, clear, isPending } = useFilterState();
  const activeCount = countActiveFilters(filters);

  return (
    <div
      className={cn(
        "bg-card mx-auto max-w-4xl rounded-2xl border p-4 shadow-(--shadow-card) sm:p-6",

        isPending && "opacity-95",
      )}
    >
      <SearchField />

      <div className="mt-5 space-y-4">
        {INLINE_GROUPS.map(({ key, take }) => {
          const options = facetsFor(facets, key);
          if (options.length === 0) return null;

          const group = FILTER_GROUPS.find((entry) => entry.key === key);
          const selected = filters[key] ?? [];

          const shown = [
            ...options.filter((option) => selected.includes(option.slug)),
            ...options
              .filter((option) => !selected.includes(option.slug))
              .slice(0, take),
          ];
          const hidden = options.length - shown.length;

          return (
            <div key={key}>
              <h3 className="text-muted-foreground mb-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase">
                {group?.label}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {shown.map((option) => (
                  <FilterChip
                    key={option.slug}
                    group={key}
                    slug={option.slug}
                    label={option.label}
                    prefix={option.code ?? option.emoji}
                    count={option.count}
                    className={
                      key === "price"
                        ? "min-w-14 justify-center tabular-nums"
                        : undefined
                    }
                  />
                ))}

                {hidden > 0 ? (
                  <span className="text-muted-foreground inline-flex items-center px-2 text-xs">
                    +{hidden} more
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="text-brand inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:underline"
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear {activeCount} {activeCount === 1 ? "filter" : "filters"}
          </button>
        ) : (
          <p className="text-muted-foreground text-sm">
            Dishes, occasions and dietary needs are in the full filters.
          </p>
        )}

        <FilterDrawer facets={facets} total={total} />
      </div>
    </div>
  );
}
