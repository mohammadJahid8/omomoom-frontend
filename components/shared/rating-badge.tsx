import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type RatingBadgeProps = {
  rating: number;
  reviewCount?: number;
  className?: string;
};

export function RatingBadge({
  rating,
  reviewCount,
  className,
}: RatingBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <Star
        className="fill-brand text-brand size-3.5 shrink-0"
        aria-hidden="true"
      />
      <span className="font-semibold tabular-nums">{rating.toFixed(1)}</span>
      {typeof reviewCount === "number" ? (
        <span className="text-muted-foreground tabular-nums">
          ({reviewCount})
        </span>
      ) : null}
      <span className="sr-only">
        out of 5
        {typeof reviewCount === "number" ? `, ${reviewCount} reviews` : ""}
      </span>
    </span>
  );
}
