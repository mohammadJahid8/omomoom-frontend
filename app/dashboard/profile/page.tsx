import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { EmptyState } from "@/components/dashboard/primitives";
import { Stars } from "@/components/restaurant/recommendation-list";
import { getMyRecommendations } from "@/lib/auth/contributions";

export const metadata: Metadata = { title: "Reviews" };

export default async function ProfileReviewsPage() {
  const recommendations = await getMyRecommendations();

  if (recommendations.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No recommendations yet"
        body="Find a place you have eaten at, say what to order, and it shows up here credited to your username."
        action={{ label: "Find a restaurant", href: "/restaurants" }}
        tint="rose"
      />
    );
  }

  return (
    <ol className="grid gap-3">
      {recommendations.map((item) => (
        <li
          key={item.id}
          className="bg-card rounded-2xl p-5 ring-1 ring-foreground/8"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className="font-heading text-base font-bold">
              <Link
                href={`/restaurants/${item.restaurant.slug}`}
                className="hover:text-brand-ink transition-colors"
              >
                {item.restaurant.name}
              </Link>
            </h3>
            <span className="text-muted-foreground text-xs">
              {item.restaurant.neighborhood?.name ??
                item.restaurant.municipality}
            </span>
          </div>

          <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-semibold">
            {item.dish}
            <Stars rating={item.rating} />
          </p>

          {item.comment ? (
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {item.comment}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
