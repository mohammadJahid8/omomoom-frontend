"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

import { useFilterState } from "@/components/filters/filter-state";
import { hrefForToggle, type FilterKey } from "@/lib/filters";
import { cn } from "@/lib/utils";

type FilterChipProps = {
  group: FilterKey;
  slug: string;
  label: string;

  prefix?: string | null;

  count?: number;
  className?: string;
};

export function FilterChip({
  group,
  slug,
  label,
  prefix,
  count,
  className,
}: FilterChipProps) {
  const { filters, toggle } = useFilterState();

  const pathname = usePathname();

  const selected = (filters[group] ?? []).includes(slug);
  const href = hrefForToggle(filters, group, slug, pathname);

  if (count === 0 && !selected) {
    return (
      <span
        aria-disabled="true"
        className={cn(
          "border-border/60 text-muted-foreground/45 inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
          className,
        )}
      >
        {label}
      </span>
    );
  }

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
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
    toggle(group, slug);
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150",
        selected
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border-strong/50 hover:border-brand hover:bg-brand-subtle hover:text-brand",
        className,
      )}
    >
      {selected ? (
        <Check className="size-3.5 shrink-0" aria-hidden="true" />
      ) : prefix ? (
        <span
          className="text-muted-foreground text-[10px] font-semibold tracking-wider"
          aria-hidden="true"
        >
          {prefix}
        </span>
      ) : null}

      {label}

      {typeof count === "number" && !selected ? (
        <span className="text-muted-foreground text-xs tabular-nums">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
