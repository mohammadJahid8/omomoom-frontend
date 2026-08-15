import { AlertCircle, Check } from "lucide-react";

import type { ListingGap } from "@/lib/claim";
import { cn } from "@/lib/utils";

export function ListingAudit({ gaps }: { gaps: ListingGap[] }) {
  const missing = gaps.filter((gap) => gap.missing);

  return (
    <div className="border-foreground/15 bg-card overflow-hidden rounded-2xl border">
      <div className="border-foreground/15 border-b px-5 py-4 sm:px-6">
        <h2 className="font-heading text-base font-bold">
          What Miami sees right now
        </h2>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          {missing.length === 0
            ? "Everything is filled in. Claiming lets you keep it that way and add your story and photos."
            : `${missing.length} of ${gaps.length} things are missing from your listing. Guests are deciding without them.`}
        </p>
      </div>

      <ul className="divide-foreground/10 divide-y">
        {gaps.map((gap) => (
          <li
            key={gap.key}
            className="flex items-start gap-3 px-5 py-3.5 sm:px-6"
          >
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                gap.missing
                  ? "bg-tint-gold text-tint-gold-ink"
                  : "bg-tint-olive text-tint-olive-ink",
              )}
            >
              {gap.missing ? (
                <AlertCircle className="size-3.5" aria-hidden="true" />
              ) : (
                <Check className="size-3.5" aria-hidden="true" />
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{gap.label}</span>
              <span
                className={cn(
                  "mt-0.5 block text-sm",
                  gap.missing
                    ? "text-tint-gold-ink"
                    : "text-muted-foreground truncate",
                )}
              >
                {gap.missing ? "Missing" : gap.current}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
