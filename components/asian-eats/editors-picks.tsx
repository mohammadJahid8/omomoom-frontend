"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";

import { RestaurantImage } from "@/components/restaurant/restaurant-image";
import { SaveButton } from "@/components/restaurant/save-button";
import { PriceTier } from "@/components/shared/price-tier";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { RestaurantCardData } from "@/types/api";

export type EditorsPick = {
  dish: string;
  restaurant: RestaurantCardData;
};

export function EditorsPicks({ picks }: { picks: EditorsPick[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const sync = () => setCurrent(api.selectedScrollSnap());
    sync();
    api.on("select", sync);

    return () => {
      api.off("select", sync);
    };
  }, [api]);

  if (picks.length === 0) return null;

  return (
    <Carousel setApi={setApi} opts={{ loop: picks.length > 1 }}>
      <div className="border-foreground/15 bg-card overflow-hidden rounded-3xl border">
        <CarouselContent className="ml-0">
          {picks.map(({ dish, restaurant }, index) => (
            <CarouselItem key={restaurant.id} className="h-auto pl-0">
              <Slide dish={dish} restaurant={restaurant} priority={index === 0} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </div>

      {picks.length > 1 ? (
        <div className="mt-5 flex items-center justify-between gap-4">
          <ol className="flex items-center gap-2" aria-label="Editor's picks">
            {picks.map((pick, index) => (
              <li key={pick.restaurant.id}>
                <button
                  type="button"
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`Go to ${pick.restaurant.name}`}
                  aria-current={index === current ? "true" : undefined}
                  className={cn(
                    "focus-visible:ring-ring/60 h-1.5 rounded-full transition-all duration-300 outline-none focus-visible:ring-3",
                    index === current
                      ? "bg-brand-ink w-7"
                      : "bg-border-strong hover:bg-foreground/40 w-1.5",
                  )}
                />
              </li>
            ))}
          </ol>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground mr-1 text-sm tabular-nums">
              {current + 1} / {picks.length}
            </span>
            <CarouselPrevious
              variant="outline"
              className="static size-10 translate-y-0 rounded-full border-foreground/20 hover:border-foreground" />
            <CarouselNext
              variant="outline"
              className="static size-10 translate-y-0 rounded-full border-foreground/20 hover:border-foreground"
            />
          </div>
        </div>
      ) : null}
    </Carousel>
  );
}

function Slide({
  dish,
  restaurant,
  priority,
}: {
  dish: string;
  restaurant: RestaurantCardData;
  priority: boolean;
}) {
  const place = restaurant.neighborhood ?? restaurant.municipality;
  const dishes = restaurant.signatureDishes.slice(0, 2).join(", ") || dish;

  return (
    <article className="grid h-full lg:grid-cols-[1.15fr_1fr]">
      <div className="bg-muted relative aspect-4/3 lg:aspect-auto lg:h-full lg:min-h-104">
        <RestaurantImage
          src={restaurant.imageUrl}
          priority={priority}
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover"
        />
        <p className="absolute top-4 left-4 rounded-full bg-white/95 px-3.5 py-1.5 text-[11px] font-bold tracking-widest text-neutral-900 uppercase shadow-sm">
          Editor&rsquo;s pick
        </p>
        <SaveButton
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          className="absolute top-4 right-4"
        />
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
          <p className="text-muted-foreground mt-5 line-clamp-4 leading-relaxed">
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
