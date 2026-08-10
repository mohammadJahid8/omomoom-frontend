import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";

import { RestaurantImage } from "@/components/restaurant/restaurant-image";
import { PriceTier } from "@/components/shared/price-tier";
import { Button } from "@/components/ui/button";
import type { RestaurantCardData } from "@/types/api";

export function EditorsPick({
  restaurant,
  dish,
}: {
  restaurant: RestaurantCardData;
  dish: string | null;
}) {
  const place = restaurant.neighborhood ?? restaurant.municipality;
  const dishes = restaurant.signatureDishes.slice(0, 2).join(", ") || dish;

  return (
    <article className="border-foreground/15 bg-card grid overflow-hidden rounded-3xl border lg:grid-cols-[1.15fr_1fr]">
      <div className="bg-muted relative aspect-4/3 lg:aspect-auto lg:min-h-[26rem]">
        <RestaurantImage
          src={restaurant.imageUrl}
          priority
          className="object-cover"
        />
        <p className="absolute top-4 left-4 rounded-full bg-white/95 px-3.5 py-1.5 text-[11px] font-bold tracking-widest text-neutral-900 uppercase shadow-sm">
          Editor&rsquo;s pick
        </p>
      </div>

      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
        {restaurant.cuisine ? (
          <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
            {restaurant.cuisine}
          </p>
        ) : null}

        <h3 className="font-heading mt-3 text-2xl leading-tight font-extrabold sm:text-3xl lg:text-[2.125rem]">
          <Link
            href={`/restaurants/${restaurant.slug}`}
            className="hover:text-brand-ink transition-colors"
          >
            {restaurant.name}
          </Link>
        </h3>

        {dishes ? (
          <p className="text-brand-ink mt-3 flex items-start gap-2 text-sm font-semibold">
            <Star
              className="fill-brand-ink mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            {dishes}
          </p>
        ) : null}

        {restaurant.description ? (
          <p className="text-muted-foreground mt-5 line-clamp-5 leading-relaxed">
            {restaurant.description}
          </p>
        ) : null}

        <div className="text-muted-foreground mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {place ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {place}
            </span>
          ) : null}
          {restaurant.priceTier ? (
            <PriceTier tier={restaurant.priceTier} />
          ) : null}
        </div>

        <Button
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/85 mt-7 h-12 w-fit rounded-full px-6 text-[0.95rem] font-semibold"
        >
          <Link href={`/restaurants/${restaurant.slug}`}>
            View restaurant
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
