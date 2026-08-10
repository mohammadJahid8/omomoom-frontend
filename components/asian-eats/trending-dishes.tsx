import Link from "next/link";
import { MapPin } from "lucide-react";

import { RestaurantImage } from "@/components/restaurant/restaurant-image";
import { PriceTier } from "@/components/shared/price-tier";
import type { RestaurantCardData } from "@/types/api";
import { cn } from "@/lib/utils";

type TrendingDish = {
  dish: string;
  restaurant: RestaurantCardData;
};

export function pickTrendingDishes(
  restaurants: RestaurantCardData[],
  limit = 5,
): TrendingDish[] {
  const seen = new Set<string>();
  const picked: TrendingDish[] = [];

  for (const restaurant of restaurants) {
    if (!restaurant.imageUrl || restaurant.signatureDishes.length === 0) continue;

    const dish = restaurant.signatureDishes.find(
      (d) => !seen.has(d.toLowerCase()),
    );
    if (!dish) continue;

    seen.add(dish.toLowerCase());
    picked.push({ dish, restaurant });
    if (picked.length === limit) break;
  }

  return picked;
}

export function TrendingDishes({ dishes }: { dishes: TrendingDish[] }) {
  if (dishes.length === 0) return null;

  const [lead, ...rest] = dishes;
  if (!lead) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
      <DishCard entry={lead} featured />
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:gap-5">
        {rest.map((entry) => (
          <DishCard key={entry.restaurant.id + entry.dish} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function DishCard({
  entry,
  featured = false,
}: {
  entry: TrendingDish;
  featured?: boolean;
}) {
  const { dish, restaurant } = entry;

  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className={cn(
        "group bg-card relative flex flex-col overflow-hidden rounded-2xl border shadow-(--shadow-card) transition-shadow hover:shadow-(--shadow-card-hover)",
        featured && "lg:h-full",
      )}
    >
      <div
        className={cn(
          "bg-muted relative overflow-hidden",
          featured ? "aspect-4/3 lg:aspect-auto lg:flex-1" : "aspect-4/3",
        )}
      >
        <RestaurantImage
          src={restaurant.imageUrl}
          alt={dish}
          sizes={
            featured
              ? "(min-width: 1024px) 33vw, 100vw"
              : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          }
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent"
          aria-hidden="true"
        />

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="text-brand-on-dark text-[10px] font-bold tracking-[0.18em] uppercase">
            Order this
          </p>
          <p
            className={cn(
              "font-heading mt-1.5 leading-tight font-extrabold text-white",
              featured ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl",
            )}
          >
            {dish}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 p-4 text-sm">
        <span className="font-semibold">{restaurant.name}</span>
        {restaurant.cuisine ? (
          <>
            <Dot />
            <span className="text-muted-foreground">{restaurant.cuisine}</span>
          </>
        ) : null}
        {restaurant.neighborhood ? (
          <>
            <Dot />
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {restaurant.neighborhood}
            </span>
          </>
        ) : null}
        {restaurant.priceTier ? (
          <>
            <Dot />
            <PriceTier tier={restaurant.priceTier} className="text-xs" />
          </>
        ) : null}
      </div>
    </Link>
  );
}

function Dot() {
  return (
    <span className="text-border-strong" aria-hidden="true">
      &middot;
    </span>
  );
}
