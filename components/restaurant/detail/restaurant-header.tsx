import Link from "next/link";
import type { ReactNode } from "react";
import { MapPin } from "lucide-react";

import { RestaurantGallery } from "@/components/restaurant/detail/restaurant-gallery";
import { MichelinBadge } from "@/components/restaurant/michelin-badge";
import { RestaurantImage } from "@/components/restaurant/restaurant-image";
import { PriceTier } from "@/components/shared/price-tier";
import type { RestaurantDetailData } from "@/types/api";

export function RestaurantHeader({
  restaurant,
}: {
  restaurant: RestaurantDetailData;
}) {
  const {
    name,
    imageUrl,
    michelin,
    cuisine,
    subCuisine,
    neighborhood,
    neighborhoodSlug,
    municipality,
    priceTier,
    reviewCount,
    ratingAverage,
    photos,
  } = restaurant;

  return (
    <header>
      <div className="bg-muted relative aspect-video overflow-hidden rounded-2xl sm:aspect-21/9">
        <RestaurantImage
          src={imageUrl}
          alt={name}
          priority
          sizes="(min-width: 1280px) 1152px, 100vw"
          className="object-cover"
        />

        {michelin ? (
          <div className="absolute top-4 left-4">
            <MichelinBadge rating={michelin} />
          </div>
        ) : null}
      </div>

      <RestaurantGallery name={name} photos={photos} coverUrl={imageUrl} />

      <h1 className="font-heading mt-7 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
        {name}
      </h1>

      <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm sm:text-base">
        {cuisine ? (
          <span className="text-foreground font-semibold">{cuisine}</span>
        ) : null}

        {subCuisine ? <Segment>{subCuisine}</Segment> : null}

        {neighborhood ? (
          <Segment>
            <Link
              href={`/restaurants?area=${neighborhoodSlug}`}
              className="hover:text-brand-ink inline-flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {neighborhood}
              {municipality && municipality !== neighborhood
                ? `, ${municipality}`
                : ""}
            </Link>
          </Segment>
        ) : null}

        {priceTier ? (
          <Segment>
            <PriceTier tier={priceTier} />
          </Segment>
        ) : null}
      </div>

      <p className="text-muted-foreground mt-2 text-sm">
        {reviewCount > 0
          ? `${ratingAverage.toFixed(1)} from ${reviewCount.toLocaleString()} ${
              reviewCount === 1 ? "review" : "reviews"
            }`
          : "No reviews yet"}
      </p>
    </header>
  );
}

function Segment({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-x-3">
      <span className="text-border-strong" aria-hidden="true">
        &middot;
      </span>
      {children}
    </span>
  );
}
