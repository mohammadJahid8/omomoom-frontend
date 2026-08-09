import Link from "next/link";
import { Clock, MapPin } from "lucide-react";

import { MichelinBadge } from "@/components/restaurant/michelin-badge";
import { RestaurantImage } from "@/components/restaurant/restaurant-image";
import { PriceTier } from "@/components/shared/price-tier";
import { RatingBadge } from "@/components/shared/rating-badge";
import type { RestaurantCardData } from "@/types/api";
import { cn } from "@/lib/utils";

type RestaurantCardProps = {
  restaurant: RestaurantCardData;

  rank?: number;

  priority?: boolean;
  className?: string;
};

export function RestaurantCard({
  restaurant,
  rank,
  priority = false,
  className,
}: RestaurantCardProps) {
  const {
    slug,
    name,
    description,
    cuisine,
    neighborhood,
    municipality,
    priceTier,
    michelin,
    ratingAverage,
    reviewCount,
    imageUrl,
    signatureDishes,
    hoursText,
  } = restaurant;

  const place = neighborhood ?? municipality;

  return (
    <article
      className={cn(
        "group bg-card relative flex flex-col overflow-hidden rounded-2xl border",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out-soft",
        "hover:border-border-strong hover:-translate-y-1 hover:shadow-(--shadow-card-hover)",
        className,
      )}
    >
      <div className="bg-muted relative aspect-4/3 overflow-hidden">
        <RestaurantImage
          src={imageUrl}
          priority={priority}
          className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
        />

        {typeof rank === "number" ? (
          <span className="bg-foreground/85 text-background absolute top-3 left-3 flex size-7 items-center justify-center rounded-lg text-xs font-bold tabular-nums backdrop-blur-sm">
            {rank}
          </span>
        ) : null}

        <MichelinBadge rating={michelin} className="absolute top-3 right-3" />

        {signatureDishes.length > 0 ? (
          <>
            <div
              className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/70 to-transparent"
              aria-hidden="true"
            />
            <p className="absolute inset-x-3 bottom-3 truncate text-xs font-medium text-white">
              {signatureDishes.slice(0, 3).join(", ")}
            </p>
          </>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-base leading-snug font-bold sm:text-[1.0625rem]">
            <Link
              href={`/restaurants/${slug}`}
              className="before:absolute before:inset-0"
            >
              {name}
            </Link>
          </h3>

          {reviewCount > 0 ? (
            <RatingBadge
              rating={ratingAverage}
              reviewCount={reviewCount}
              className="mt-0.5 shrink-0"
            />
          ) : null}
        </div>

        {description ? (
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
            {description}
          </p>
        ) : null}

        <div className="text-muted-foreground mt-auto flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-4 text-sm">
          {priceTier ? (
            <>
              <PriceTier tier={priceTier} />
              <Dot />
            </>
          ) : null}

          {cuisine ? (
            <>
              <span className="text-foreground font-medium">{cuisine}</span>
              {place ? <Dot /> : null}
            </>
          ) : null}

          {place ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {place}
            </span>
          ) : null}
        </div>

        {hoursText ? (
          <p className="text-muted-foreground mt-2 inline-flex items-center gap-1.5 text-xs">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{hoursText}</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}

function Dot() {
  return (
    <span className="text-border-strong" aria-hidden="true">
      ·
    </span>
  );
}
