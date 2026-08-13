import Link from "next/link";

import { CuisineFlag } from "@/components/shared/cuisine-flag";
import type { AsianCuisine } from "@/lib/asian-eats";
import { cn } from "@/lib/utils";

export function CuisineFilter({
  cuisines,
  counts,
  selected,
  basePath,
  anchor,
}: {
  cuisines: AsianCuisine[];
  counts: Map<string, number>;
  selected: string | null;
  basePath: string;
  anchor: string;
}) {
  return (
    <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <li className="shrink-0">
        <Chip href={`${basePath}#${anchor}`} active={selected === null}>
          All
        </Chip>
      </li>

      {cuisines.map((cuisine) => {
        const active = selected === cuisine.slug;
        return (
          <li key={cuisine.slug} className="shrink-0">
            <Chip
              href={`${basePath}?cuisine=${cuisine.slug}#${anchor}`}
              active={active}
            >
              <CuisineFlag code={cuisine.code} label={cuisine.label} />
              {cuisine.label}
              <span
                className={cn(
                  "text-xs tabular-nums",
                  active ? "text-neutral-500" : "text-white/50",
                )}
              >
                {counts.get(cuisine.slug)}
              </span>
            </Chip>
          </li>
        );
      })}
    </ul>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200",
        active
          ? "bg-white text-neutral-900"
          : "border border-white/25 bg-black/30 text-white/90 backdrop-blur-sm hover:border-white/60 hover:bg-black/45 hover:text-white",
      )}
    >
      {children}
    </Link>
  );
}
