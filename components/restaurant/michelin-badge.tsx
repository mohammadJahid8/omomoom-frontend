import type { MichelinRating } from "@/types/api";
import { cn } from "@/lib/utils";

type MichelinBadgeProps = {
  rating: MichelinRating | null;
  className?: string;
};

const LABEL: Record<MichelinRating, string> = {
  SELECTED: "Michelin Selected",
  BIB_GOURMAND: "Bib Gourmand",
  ONE_STAR: "1 Michelin Star",
  TWO_STARS: "2 Michelin Stars",
  THREE_STARS: "3 Michelin Stars",
};

const IS_STARRED: Record<MichelinRating, boolean> = {
  SELECTED: false,
  BIB_GOURMAND: false,
  ONE_STAR: true,
  TWO_STARS: true,
  THREE_STARS: true,
};

export function MichelinBadge({ rating, className }: MichelinBadgeProps) {
  if (!rating) return null;

  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm",
        IS_STARRED[rating]
          ? "bg-brand-ink text-brand-ink-foreground"
          : "bg-background/90 text-foreground",
        className,
      )}
    >
      {LABEL[rating]}
    </span>
  );
}
