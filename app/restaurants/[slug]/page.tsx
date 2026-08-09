import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { RestaurantActions } from "@/components/restaurant/detail/restaurant-actions";
import { RestaurantHeader } from "@/components/restaurant/detail/restaurant-header";
import { RestaurantInfo } from "@/components/restaurant/detail/restaurant-info";
import {
  OwnerCta,
  RestaurantReviews,
} from "@/components/restaurant/detail/restaurant-placeholders";
import { RestaurantTags } from "@/components/restaurant/detail/restaurant-tags";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import {
  getRelatedRestaurants,
  getRestaurantBySlug,
} from "@/lib/api/restaurants";
import { siteConfig } from "@/lib/site-config";
import type { RestaurantDetailData } from "@/types/api";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const PRICE_RANGE: Record<string, string> = {
  ONE: "$",
  TWO: "$$",
  THREE: "$$$",
  FOUR: "$$$$",
};

function summarise(restaurant: RestaurantDetailData): string {
  if (restaurant.description) return restaurant.description.slice(0, 300);

  const parts = [
    restaurant.cuisine,
    "restaurant",
    restaurant.neighborhood ? `in ${restaurant.neighborhood}` : null,
    restaurant.municipality ? `, ${restaurant.municipality}` : null,
  ].filter(Boolean);

  return `${restaurant.name} is a ${parts.join(" ")}. Hours, menu, address and photos on Omomoom.`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return { title: "Restaurant not found" };
  }

  const where = [restaurant.neighborhood, restaurant.municipality]
    .filter(Boolean)
    .join(", ");
  const title = where ? `${restaurant.name} · ${where}` : restaurant.name;
  const description = summarise(restaurant);
  const url = `${siteConfig.url}/restaurants/${restaurant.slug}`;

  return {
    title,
    description,
    alternates: { canonical: `/restaurants/${restaurant.slug}` },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: siteConfig.name,
      ...(restaurant.imageUrl
        ? { images: [{ url: restaurant.imageUrl, alt: restaurant.name }] }
        : {}),
    },
    twitter: {
      card: restaurant.imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(restaurant.imageUrl ? { images: [restaurant.imageUrl] } : {}),
    },
  };
}

function structuredData(restaurant: RestaurantDetailData) {
  const url = `${siteConfig.url}/restaurants/${restaurant.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": url,
    name: restaurant.name,
    url,
    ...(restaurant.description ? { description: restaurant.description } : {}),
    ...(restaurant.imageUrl ? { image: restaurant.imageUrl } : {}),
    ...(restaurant.cuisine ? { servesCuisine: restaurant.cuisine } : {}),
    ...(restaurant.priceTier
      ? { priceRange: PRICE_RANGE[restaurant.priceTier] }
      : {}),
    ...(restaurant.phone ? { telephone: restaurant.phone } : {}),
    ...(restaurant.menuUrl ? { hasMenu: restaurant.menuUrl } : {}),
    ...(restaurant.reservationUrl
      ? {
          acceptsReservations: "True",
          potentialAction: {
            "@type": "ReserveAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: restaurant.reservationUrl,
            },
          },
        }
      : {}),
    ...(restaurant.addressLine
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: restaurant.addressLine,
            addressLocality: restaurant.municipality ?? siteConfig.city,
            addressRegion: "FL",
            addressCountry: "US",
            ...(restaurant.postalCode
              ? { postalCode: restaurant.postalCode }
              : {}),
          },
        }
      : {}),
    ...(restaurant.latitude !== null && restaurant.longitude !== null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
          },
        }
      : {}),
  };
}

export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) notFound();

  const related = await getRelatedRestaurants(slug).catch(() => []);
  const dishes = restaurant.signatureDishes;
  const summary = summarise(restaurant);

  return (
    <article>
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData(restaurant)),
        }}
      />

      <div className="container-page section-y">
        <Link
          href="/"
          className="text-muted-foreground hover:text-brand inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to restaurants
        </Link>

        <div className="mt-6">
          <RestaurantHeader restaurant={restaurant} />
          <RestaurantActions restaurant={restaurant} summary={summary} />
        </div>

        <div className="mt-12 grid gap-x-14 gap-y-12 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="contents lg:block lg:space-y-12">
            {restaurant.description ? (
              <section className="order-1">
                <h2 className="font-heading text-xl font-bold sm:text-2xl">
                  About {restaurant.name}
                </h2>
                <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
                  {restaurant.description}
                </p>
              </section>
            ) : null}

            <div className="order-3 space-y-12">
              {dishes.length > 0 ? (
                <section>
                  <h2 className="font-heading text-xl font-bold sm:text-2xl">
                    What to order
                  </h2>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {dishes.map((dish) => (
                      <li
                        key={dish}
                        className="bg-brand-subtle text-brand rounded-full px-4 py-2 text-sm font-semibold"
                      >
                        {dish}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <RestaurantTags tags={restaurant.tags} />
              <RestaurantReviews name={restaurant.name} />
            </div>
          </div>

          <div className="contents lg:block lg:space-y-6">
            <aside className="order-2">
              <RestaurantInfo restaurant={restaurant} />
            </aside>
            <OwnerCta name={restaurant.name} className="order-4" />
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="bg-surface section-y border-t">
          <div className="container-page">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">
              More {restaurant.cuisine ? `${restaurant.cuisine} ` : ""}
              restaurants
              {restaurant.neighborhood
                ? ` near ${restaurant.neighborhood}`
                : ""}
            </h2>
            <p className="text-muted-foreground mt-2">
              Similar places worth a look.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {related.slice(0, 6).map((item) => (
                <RestaurantCard key={item.id} restaurant={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
