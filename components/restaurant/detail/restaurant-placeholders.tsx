import { PenLine, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RestaurantReviews({ name }: { name: string }) {
  return (
    <section>
      <h2 className="font-heading text-xl font-bold sm:text-2xl">Reviews</h2>

      <div className="border-border-strong/60 mt-5 rounded-2xl border border-dashed px-6 py-12 text-center">
        <p className="font-heading text-base font-bold">No reviews yet</p>
        <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-relaxed">
          Nobody has written about {name} on Omomoom. Reviews open up shortly,
          and the first people in get a Founding Foodie badge.
        </p>
        <Button disabled variant="outline" className="mt-6 rounded-full">
          <PenLine className="size-4" aria-hidden="true" />
          Write the first review
        </Button>
      </div>
    </section>
  );
}

export function OwnerCta({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <section className={cn("bg-surface rounded-2xl border p-6", className)}>
      <div className="flex gap-3.5">
        <Store
          className="text-brand mt-0.5 size-5 shrink-0"
          aria-hidden="true"
        />
        <div>
          <h2 className="font-heading text-base font-bold">
            Do you own {name}?
          </h2>
          <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
            Claim the listing to correct the details, add photos and reply to
            reviews. Claiming is free.
          </p>
          <Button
            disabled
            size="sm"
            className="bg-brand text-brand-foreground hover:bg-brand/90 mt-4 rounded-full"
          >
            Claim this restaurant
          </Button>
        </div>
      </div>
    </section>
  );
}
