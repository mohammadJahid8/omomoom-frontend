import type { Metadata } from "next";
import { Compass } from "lucide-react";

import { EmptyState } from "@/components/dashboard/primitives";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import { getMySaves } from "@/lib/auth/contributions";

export const metadata: Metadata = { title: "Want to try" };

export default async function ProfileWantToTryPage() {
  const saved = await getMySaves();

  if (saved.length === 0) {
    return (
      <EmptyState
        icon={Compass}
        title="Nothing saved yet"
        body="Tap the bookmark on any restaurant while you are browsing and it waits here until you get round to going."
        action={{ label: "Browse restaurants", href: "/restaurants" }}
        tint="clay"
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {saved.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  );
}
