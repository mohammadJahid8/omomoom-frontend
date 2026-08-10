"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { FilterChip } from "@/components/filters/filter-chip";
import { useFilterState } from "@/components/filters/filter-state";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FILTER_GROUPS, countActiveFilters, facetsFor } from "@/lib/filters";
import type { RestaurantFacets } from "@/types/api";
import { cn } from "@/lib/utils";

type FilterDrawerProps = {
  facets: RestaurantFacets | undefined;

  total: number;

  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FilterDrawer({
  facets,
  total,
  open,
  onOpenChange,
}: FilterDrawerProps) {
  const { filters, clear } = useFilterState();
  const activeCount = countActiveFilters(filters);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <SlidersHorizontal className="size-4" />
          All filters
          {activeCount > 0 ? (
            <span className="bg-brand-ink text-brand-ink-foreground ml-0.5 inline-flex size-5 items-center justify-center rounded-full text-[11px] font-bold tabular-nums">
              {activeCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle className="font-heading text-lg font-bold">
            Filters
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-2">
          {FILTER_GROUPS.map((group) => {
            const options = facetsFor(facets, group.key);
            if (options.length === 0) return null;

            const selected = filters[group.key] ?? [];

            return (
              <FilterSection
                key={group.key}
                title={group.label}
                selectedCount={selected.length}

                defaultOpen={selected.length > 0 || group.key === "cuisine"}
              >
                {options.map((option) => (
                  <FilterChip
                    key={option.slug}
                    group={group.key}
                    slug={option.slug}
                    label={option.label}
                    prefix={option.code ?? option.emoji}
                    count={option.count}
                    className={
                      group.key === "price"
                        ? "min-w-14 justify-center tabular-nums"
                        : undefined
                    }
                  />
                ))}
              </FilterSection>
            );
          })}
        </div>

        <div className="flex items-center gap-3 border-t px-5 py-4">
          {activeCount > 0 ? (
            <Button variant="ghost" className="shrink-0" onClick={clear}>
              Clear all
            </Button>
          ) : null}

          <SheetClose asChild>
            <Button className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-11 flex-1 rounded-full">
              Show {total.toLocaleString()} {total === 1 ? "result" : "results"}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FilterSection({
  title,
  selectedCount,
  defaultOpen,
  children,
}: {
  title: string;
  selectedCount: number;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          {title}
          {selectedCount > 0 ? (
            <span className="bg-brand-subtle text-brand-ink rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums">
              {selectedCount}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "text-muted-foreground size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="mt-3 flex flex-wrap gap-1.5">{children}</div>
      ) : null}
    </section>
  );
}
