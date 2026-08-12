import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";

import { EmptyState } from "@/components/dashboard/primitives";
import { getMyRecommendations } from "@/lib/auth/contributions";

export const metadata: Metadata = { title: "Places tried" };

export default async function ProfileTriedPage() {
  const recommendations = await getMyRecommendations();

  const places = new Map<
    string,
    { slug: string; name: string; where: string | null; dishes: string[] }
  >();

  for (const item of recommendations) {
    const existing = places.get(item.restaurant.slug);
    if (existing) {
      existing.dishes.push(item.dish);
      continue;
    }

    places.set(item.restaurant.slug, {
      slug: item.restaurant.slug,
      name: item.restaurant.name,
      where: item.restaurant.neighborhood?.name ?? item.restaurant.municipality,
      dishes: [item.dish],
    });
  }

  if (places.size === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="Nowhere marked as tried"
        body="Recommend a dish at any restaurant and it lands here. Over time this becomes the map of where you have actually eaten."
        action={{ label: "Find a restaurant", href: "/restaurants" }}
        tint="olive"
      />
    );
  }

  return (
    <ol className="grid gap-3">
      {[...places.values()].map((place) => (
        <li
          key={place.slug}
          className="bg-card rounded-2xl p-5 ring-1 ring-foreground/8"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className="font-heading text-base font-bold">
              <Link
                href={`/restaurants/${place.slug}`}
                className="hover:text-brand-ink transition-colors"
              >
                {place.name}
              </Link>
            </h3>
            {place.where ? (
              <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                <MapPin className="size-3.5" aria-hidden="true" />
                {place.where}
              </span>
            ) : null}
          </div>

          <p className="text-muted-foreground mt-2 text-sm">
            You recommended{" "}
            <span className="text-foreground font-medium">
              {place.dishes.join(", ")}
            </span>
          </p>
        </li>
      ))}
    </ol>
  );
}
