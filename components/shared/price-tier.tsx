import type { PriceTier as PriceTierValue } from "@/types/api";
import { cn } from "@/lib/utils";

type PriceTierProps = {
  tier: PriceTierValue | null;
  className?: string;
};

const TIERS: PriceTierValue[] = ["ONE", "TWO", "THREE", "FOUR"];

const TIER_LABEL: Record<PriceTierValue, string> = {
  ONE: "Inexpensive",
  TWO: "Moderate",
  THREE: "Upscale",
  FOUR: "Fine dining",
};

export function PriceTier({ tier, className }: PriceTierProps) {
  if (!tier) return null;

  const level = TIERS.indexOf(tier) + 1;

  return (
    <span
      className={cn("font-medium tabular-nums", className)}
      title={TIER_LABEL[tier]}
    >
      <span className="sr-only">{TIER_LABEL[tier]}</span>
      {TIERS.map((_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={index < level ? "text-foreground" : "text-foreground/25"}
        >
          $
        </span>
      ))}
    </span>
  );
}
