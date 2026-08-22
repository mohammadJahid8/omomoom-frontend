import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CommunityRail } from "@/components/asian-eats/community-rail";
import { CuisineFilter } from "@/components/asian-eats/cuisine-filter";
import { EditorsPicks } from "@/components/asian-eats/editors-picks";
import { pickTrendingDishes } from "@/components/asian-eats/trending-dishes";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import { Button } from "@/components/ui/button";
import { getRecentRecommendations } from "@/lib/api/contributions";
import { getUpcomingEvents } from "@/lib/api/events";
import { getRestaurants } from "@/lib/api/restaurants";
import {
  ASIAN_CUISINES,
  ASIAN_CUISINE_SLUGS,
  asianCuisineLabel,
} from "@/lib/asian-eats";
import type { SearchParams } from "@/lib/filters";
import { siteConfig } from "@/lib/site-config";
import heroBanner from "@/public/brand/omomoom-banner.webp";

const PATH = "/asian-eats";
const DISCOVER_ID = "discover";

type PageProps = { searchParams: Promise<SearchParams> };

export const metadata: Metadata = {
  title: "Asian Eats Miami",
  description:
    "Where Miami's Asian food community shares what they are eating. Editor's picks, upcoming events, and every Asian restaurant in the city.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    title: "Asian Eats Miami",
    description:
      "Editor's picks, community events and every Asian restaurant in Miami.",
    siteName: siteConfig.name,
    url: `${siteConfig.url}${PATH}`,
  },
};

function activeCuisine(raw: string | string[] | undefined): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && ASIAN_CUISINE_SLUGS.includes(value) ? value : null;
}

export default async function AsianEatsPage({ searchParams }: PageProps) {
  const selected = activeCuisine((await searchParams).cuisine);

  const [featuredResult, discoverResult, events, saying] = await Promise.all([
    getRestaurants(
      { cuisine: ASIAN_CUISINE_SLUGS, sortBy: "featured" },
      { limit: 40, facets: false },
    ),
    getRestaurants(
      { cuisine: selected ? [selected] : ASIAN_CUISINE_SLUGS },
      { limit: 12 },
    ),
    getUpcomingEvents(3),
    getRecentRecommendations(8, ASIAN_CUISINE_SLUGS),
  ]);

  const picks = pickTrendingDishes(featuredResult.restaurants, 6);
  const total = featuredResult.meta.total;

  const counts = new Map(
    (discoverResult.facets?.cuisine ?? []).map((f) => [f.slug, f.count]),
  );
  const available = ASIAN_CUISINES.filter((c) => (counts.get(c.slug) ?? 0) > 0);

  return (
    <>
      <section className="relative isolate -mt-16 flex min-h-128 items-end overflow-hidden lg:-mt-18 lg:min-h-152">
        <Image
          src={heroBanner}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div
          className="absolute inset-0 -z-10 bg-linear-to-t from-black/92 via-black/65 to-black/40"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 top-0 -z-10 h-36 bg-linear-to-b from-black/60 to-transparent"
          aria-hidden="true"
        />

        <div className="container-page relative pt-32 pb-10 sm:pt-36 sm:pb-12 lg:pb-14">
          <h1 className="font-heading max-w-3xl text-5xl leading-[0.98] font-extrabold text-white sm:text-6xl lg:text-7xl">
            Asian Eats Miami
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            The flavours, the people and the stories behind South Florida&rsquo;s
            Asian food scene. Family kitchens, chef-driven rooms, and the dish to
            order when you get there.
          </p>

          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
            <span>
              <strong className="font-semibold text-white">
                {total.toLocaleString()}
              </strong>{" "}
              restaurants
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="font-semibold text-white">
                {available.length}
              </strong>{" "}
              cuisines
            </span>
            <span aria-hidden="true">·</span>
            <span>Updated weekly</span>
          </p>

          <div className="mt-8">
            <CuisineFilter
              cuisines={available}
              counts={counts}
              selected={selected}
              basePath={PATH}
              anchor={DISCOVER_ID}
            />
          </div>
        </div>
      </section>

      {picks.length > 0 ? (
        <section className="pt-14 sm:pt-16 lg:pt-20">
          <div className="container-page">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">
                  Where we would send you first
                </h2>
                <p className="text-muted-foreground mt-2 max-w-lg">
                  A handful of places worth crossing town for, and the dish to
                  order when you get there.
                </p>
              </div>
            </div>

            <EditorsPicks picks={picks} />
          </div>
        </section>
      ) : null}

      <section
        id={DISCOVER_ID}
        className="scroll-mt-24 pt-14 pb-20 sm:pt-16 lg:pt-20 lg:pb-28"
      >
        <div className="container-page">
          <div className="grid gap-y-12 lg:grid-cols-[18rem_1fr] lg:gap-x-8 lg:gap-y-7 xl:gap-x-10">
            <div className="border-foreground/15 order-1 hidden grid-cols-[18rem_1fr] gap-x-8 border-b pb-3 lg:col-span-2 lg:grid xl:gap-x-10">
              <h2 className="font-heading text-xl font-extrabold">
                Upcoming events
              </h2>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-heading text-xl font-extrabold">
                  {selected
                    ? `${asianCuisineLabel(selected)} in Miami`
                    : "Every Asian restaurant"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Showing{" "}
                  <strong className="text-foreground font-semibold">
                    {discoverResult.meta.total.toLocaleString()}
                  </strong>{" "}
                  {discoverResult.meta.total === 1
                    ? "restaurant"
                    : "restaurants"}
                </p>
              </div>
            </div>

            <aside className="order-3 lg:sticky lg:top-24 lg:order-2 lg:self-start">
              <CommunityRail events={events} recommendations={saying} />
            </aside>

            <div className="order-2 min-w-0 lg:order-3">
              <div className="border-foreground/15 mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b pb-3 lg:hidden">
                <h2 className="font-heading text-xl font-extrabold">
                  {selected
                    ? `${asianCuisineLabel(selected)} in Miami`
                    : "Every Asian restaurant"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Showing{" "}
                  <strong className="text-foreground font-semibold">
                    {discoverResult.meta.total.toLocaleString()}
                  </strong>{" "}
                  {discoverResult.meta.total === 1
                    ? "restaurant"
                    : "restaurants"}
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {discoverResult.restaurants.map((restaurant, index) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    priority={index < 3}
                  />
                ))}
              </div>

              <div className="mt-10">
                <Button
                  asChild
                  variant="outline"
                  className="border-foreground/25 hover:border-foreground h-12 w-full rounded-full text-[0.95rem] font-semibold sm:w-auto sm:px-7"
                >
                  <Link
                    href={
                      selected
                        ? `/restaurants?cuisine=${selected}`
                        : `/restaurants?${ASIAN_CUISINE_SLUGS.map((s) => `cuisine=${s}`).join("&")}`
                    }
                  >
                    See all {discoverResult.meta.total.toLocaleString()} in the
                    directory
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
