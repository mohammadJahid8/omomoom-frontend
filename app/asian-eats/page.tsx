import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles, Users } from "lucide-react";

import { CommunityCalendar } from "@/components/asian-eats/community-calendar";
import { CommunityRecommendations } from "@/components/asian-eats/community-recommendations";
import {
  TrendingDishes,
  pickTrendingDishes,
} from "@/components/asian-eats/trending-dishes";
import { RestaurantCardGrid } from "@/components/restaurant/restaurant-card-grid";
import { Button } from "@/components/ui/button";
import { getRestaurants } from "@/lib/api/restaurants";
import {
  ASIAN_CUISINES,
  ASIAN_CUISINE_SLUGS,
  asianCuisineLabel,
} from "@/lib/asian-eats";
import type { SearchParams } from "@/lib/filters";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import heroBanner from "@/public/brand/omomoom-banner.webp";

const PATH = "/asian-eats";
const DISCOVER_ID = "discover";

type PageProps = { searchParams: Promise<SearchParams> };

export const metadata: Metadata = {
  title: "Asian Eats Miami",
  description:
    "Where Miami's Asian food community shares what they are eating. Trending dishes, recommendations from real diners, upcoming events, and every Asian restaurant in the city.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    title: "Asian Eats Miami",
    description:
      "Trending dishes, community recommendations, events and every Asian restaurant in Miami.",
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

  const [featuredResult, discoverResult] = await Promise.all([
    getRestaurants(
      { cuisine: ASIAN_CUISINE_SLUGS, sortBy: "featured" },
      { limit: 40, facets: false },
    ),
    getRestaurants({ cuisine: selected ? [selected] : ASIAN_CUISINE_SLUGS }, {
      limit: 12,
    }),
  ]);

  const trending = pickTrendingDishes(featuredResult.restaurants);
  const total = featuredResult.meta.total;

  const counts = new Map(
    (discoverResult.facets?.cuisine ?? []).map((f) => [f.slug, f.count]),
  );
  const available = ASIAN_CUISINES.filter((c) => (counts.get(c.slug) ?? 0) > 0);

  return (
    <>
      <section className="relative isolate -mt-16 flex min-h-[30rem] items-end overflow-hidden lg:-mt-18 lg:min-h-[36rem]">
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
          className="absolute inset-0 -z-10 bg-linear-to-t from-black/92 via-black/70 to-black/45"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 top-0 -z-10 h-32 bg-linear-to-b from-black/55 to-transparent"
          aria-hidden="true"
        />

        <div className="container-page relative pt-28 pb-12 sm:pt-32 sm:pb-16 lg:pb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[10px] font-bold tracking-[0.22em] text-white uppercase backdrop-blur-sm">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Omomoom community
          </span>

          <h1 className="font-heading mt-5 max-w-3xl text-4xl leading-[1.02] font-extrabold text-white sm:text-5xl lg:text-6xl">
            Asian Eats Miami
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            Where Miami&rsquo;s Asian food community shares what we&rsquo;re
            eating, what to order when you get there, and what&rsquo;s happening
            around the city.
          </p>

          <dl className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            {[
              { label: "Restaurants", value: total.toLocaleString() },
              { label: "Cuisines", value: String(available.length) },
              { label: "Events this season", value: "6" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="font-heading block text-xl font-extrabold text-white">
                    {stat.value}
                  </span>
                  <span className="text-xs text-white/60">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <SectionHead
            eyebrow="Trending right now"
            title="Go here and order this"
            blurb="The dishes people are actually talking about, not just the restaurants they came from."
          />
          <div className="mt-8 lg:mt-10">
            <TrendingDishes dishes={trending} />
          </div>
        </div>
      </section>

      <section className="bg-surface section-y border-y">
        <div className="container-page">
          <SectionHead
            eyebrow="From the community"
            icon={<Users className="size-3.5" aria-hidden="true" />}
            title="What people are recommending"
            blurb="Recent notes from diners around the city. Reviews open to everyone shortly."
          />
          <div className="mt-8 lg:mt-10">
            <CommunityRecommendations />
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <SectionHead
            eyebrow="Community calendar"
            icon={<CalendarDays className="size-3.5" aria-hidden="true" />}
            title="What’s on"
            blurb="Festivals, night markets, pop-ups and tastings across Miami."
          />
          <div className="mt-8 lg:mt-10">
            <CommunityCalendar />
          </div>
        </div>
      </section>

      <section id={DISCOVER_ID} className="bg-surface section-y border-t">
        <div className="container-page">
          <SectionHead
            eyebrow="Restaurants to discover"
            title={
              selected
                ? `${asianCuisineLabel(selected)} in Miami`
                : "Every Asian restaurant in Miami"
            }
            blurb="Filter by kitchen, then keep narrowing in the full directory."
          />

          <ul className="mt-7 flex flex-wrap gap-2">
            <li>
              <CuisinePill href={PATH} active={selected === null}>
                All
              </CuisinePill>
            </li>
            {available.map((cuisine) => (
              <li key={cuisine.slug}>
                <CuisinePill
                  href={`${PATH}?cuisine=${cuisine.slug}#${DISCOVER_ID}`}
                  active={selected === cuisine.slug}
                >
                  <span aria-hidden="true">{cuisine.emoji}</span>
                  {cuisine.label}
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      selected === cuisine.slug
                        ? "text-brand-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {counts.get(cuisine.slug)}
                  </span>
                </CuisinePill>
              </li>
            ))}
          </ul>

          <p className="text-muted-foreground mt-6 text-sm">
            {discoverResult.meta.total.toLocaleString()}{" "}
            {discoverResult.meta.total === 1 ? "restaurant" : "restaurants"}
            {selected ? ` serving ${asianCuisineLabel(selected)}` : ""}
          </p>

          <div className="mt-6">
            <RestaurantCardGrid restaurants={discoverResult.restaurants} />
          </div>

          <div className="mt-10 text-center">
            <Button asChild size="lg" variant="outline" className="rounded-full">
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
      </section>
    </>
  );
}

function SectionHead({
  eyebrow,
  title,
  blurb,
  icon,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-brand inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.16em] uppercase">
        {icon}
        {eyebrow}
      </p>
      <h2 className="font-heading mt-3 text-2xl font-extrabold sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      <p className="text-muted-foreground mt-3 leading-relaxed">{blurb}</p>
    </div>
  );
}

function CuisinePill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border-strong/50 bg-card hover:border-brand hover:text-brand",
      )}
    >
      {children}
    </Link>
  );
}
