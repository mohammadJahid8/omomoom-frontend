import Link from "next/link";
import { BadgeCheck, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function OwnerCta({
  name,
  slug,
  claimed = false,
  className,
}: {
  name: string;
  slug: string;
  claimed?: boolean;
  className?: string;
}) {
  if (claimed) {
    return (
      <section className={cn("bg-surface rounded-2xl border p-6", className)}>
        <div className="flex gap-3.5">
          <BadgeCheck
            className="text-brand-ink mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-heading text-base font-bold">
              Managed by {name}
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
              The hours, menu links and description here come from the
              restaurant itself. Ratings and reviews stay with the people who
              ate here.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("bg-surface rounded-2xl border p-6", className)}>
      <div className="flex gap-3.5">
        <Store
          className="text-brand-ink mt-0.5 size-5 shrink-0"
          aria-hidden="true"
        />
        <div>
          <h2 className="font-heading text-base font-bold">
            Do you own {name}?
          </h2>
          <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
            Claim it to keep your hours right, show the dishes worth ordering
            and add your own photos.
          </p>
          <Button
            asChild
            size="sm"
            className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 mt-4 rounded-full"
          >
            <Link href={`/claim/${slug}`}>Claim this restaurant</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
