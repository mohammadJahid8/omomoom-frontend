import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import type { RestaurantCardData } from "@/types/api";

type RestaurantCardGridProps = {
  restaurants: RestaurantCardData[];

  priorityCount?: number;
};

export function RestaurantCardGrid({
  restaurants,
  priorityCount = 3,
}: RestaurantCardGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {restaurants.map((restaurant, index) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
