import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { toSearchParams, type Filters } from "@/lib/filters";
import { cn } from "@/lib/utils";

type PaginationProps = {
  filters: Filters;
  page: number;
  totalPages: number;

  pathname: string;
};

export function Pagination({
  filters,
  page,
  totalPages,
  pathname,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const href = (target: number) => {
    const query = toSearchParams({
      ...filters,
      page: target > 1 ? target : undefined,
    }).toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-center gap-1.5"
    >
      <Step
        href={href(page - 1)}
        disabled={page <= 1}
        label="Previous page"
        icon={<ChevronLeft className="size-4" aria-hidden="true" />}
      />

      {pageWindow(page, totalPages).map((entry, index) =>
        entry === "gap" ? (
          <span
            key={`gap-${index}`}
            className="text-muted-foreground px-1 text-sm"
            aria-hidden="true"
          >
            &hellip;
          </span>
        ) : (
          <Link
            key={entry}
            href={href(entry)}
            aria-current={entry === page ? "page" : undefined}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full text-sm font-medium tabular-nums transition-colors",
              entry === page
                ? "bg-brand-ink text-brand-ink-foreground"
                : "hover:border-brand-ink hover:text-brand-ink border border-transparent",
            )}
          >
            {entry}
          </Link>
        ),
      )}

      <Step
        href={href(page + 1)}
        disabled={page >= totalPages}
        label="Next page"
        icon={<ChevronRight className="size-4" aria-hidden="true" />}
      />
    </nav>
  );
}

function Step({
  href,
  disabled,
  label,
  icon,
}: {
  href: string;
  disabled: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  const shared =
    "inline-flex size-10 items-center justify-center rounded-full border";

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        aria-label={label}
        className={cn(shared, "border-border/60 text-muted-foreground/55")}
      >
        {icon}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        shared,
        "border-border-strong/50 hover:border-brand-ink hover:text-brand-ink transition-colors",
      )}
    >
      {icon}
    </Link>
  );
}

function pageWindow(page: number, total: number): (number | "gap")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, total, page]);
  if (page - 1 > 1) pages.add(page - 1);
  if (page + 1 < total) pages.add(page + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];

  sorted.forEach((value, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && value - previous > 1) out.push("gap");
    out.push(value);
  });

  return out;
}
