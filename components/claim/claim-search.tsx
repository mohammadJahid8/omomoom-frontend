import Form from "next/form";
import Link from "next/link";
import { ArrowRight, MapPin, Search, Store } from "lucide-react";

import { RestaurantImage } from "@/components/restaurant/restaurant-image";
import { Button } from "@/components/ui/button";
import type { RestaurantCardData } from "@/types/api";

export function ClaimSearch({
  query,
  results,
  total,
}: {
  query: string;
  results: RestaurantCardData[];
  total: number;
}) {
  return (
    <div>
      <Form action="/claim" className="flex gap-2">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute inset-y-0 start-4 my-auto size-5"
          />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by name or neighborhood"
            aria-label="Search for your restaurant"
            autoComplete="off"
            className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 h-14 w-full rounded-2xl border ps-12 pe-4 text-base outline-none focus-visible:ring-3"
          />
        </div>
        <Button
          type="submit"
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-14 shrink-0 rounded-2xl px-6 font-semibold"
        >
          Search
        </Button>
      </Form>

      {query ? (
        <div className="mt-8">
          <p className="text-muted-foreground text-sm">
            {total === 0
              ? `Nothing matched “${query}”.`
              : `${total.toLocaleString()} ${total === 1 ? "match" : "matches"} for “${query}”.`}
          </p>

          {results.length > 0 ? (
            <ul className="mt-4 grid gap-3">
              {results.map((restaurant) => (
                <li key={restaurant.id}>
                  <Link
                    href={`/claim/${restaurant.slug}`}
                    className="border-foreground/15 bg-card hover:border-foreground/35 group flex items-center gap-4 rounded-2xl border p-3 transition-colors sm:p-4"
                  >
                    <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-xl sm:size-20">
                      <RestaurantImage
                        src={restaurant.imageUrl}
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-heading truncate text-base font-bold">
                        {restaurant.name}
                      </p>
                      <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                        {restaurant.cuisine ? (
                          <span>{restaurant.cuisine}</span>
                        ) : null}
                        {restaurant.neighborhood ?? restaurant.municipality ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3.5" aria-hidden="true" />
                            {restaurant.neighborhood ??
                              restaurant.municipality}
                          </span>
                        ) : null}
                      </p>
                      {restaurant.claimState === "CLAIMED" ? (
                        <p className="text-muted-foreground mt-1.5 text-xs">
                          Already claimed
                        </p>
                      ) : null}
                    </div>

                    <ArrowRight className="text-muted-foreground group-hover:text-foreground size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="border-foreground/15 mt-6 rounded-2xl border border-dashed p-5">
            <p className="flex items-start gap-3 text-sm">
              <Store
                className="text-muted-foreground mt-0.5 size-4.5 shrink-0"
                aria-hidden="true"
              />
              <span>
                <span className="block font-semibold">
                  Can&rsquo;t find your restaurant?
                </span>
                <span className="text-muted-foreground mt-1 block leading-relaxed">
                  Tell us about it and we will add it, usually within two
                  business days. Adding a listing is free.
                </span>
              </span>
            </p>
            <Button
              asChild
              variant="outline"
              className="border-foreground/25 hover:border-foreground mt-4 h-11 rounded-xl font-semibold"
            >
              <Link href="/claim/add">Add your restaurant</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
