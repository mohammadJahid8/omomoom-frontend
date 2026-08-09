import type { MetadataRoute } from "next";

import { getRestaurants } from "@/lib/api/restaurants";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600;

async function allRestaurantSlugs(): Promise<
  { slug: string; updatedAt?: string }[]
> {
  const collected: { slug: string; updatedAt?: string }[] = [];

  for (let page = 1; page <= 20; page += 1) {
    const { restaurants, meta } = await getRestaurants(
      { page },
      { limit: 60, facets: false },
    );

    collected.push(...restaurants.map((r) => ({ slug: r.slug })));
    if (!meta.hasNextPage) break;
  }

  return collected;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/restaurants`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/asian-eats`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    const restaurants = await allRestaurantSlugs();

    entries.push(
      ...restaurants.map((restaurant) => ({
        url: `${siteConfig.url}/restaurants/${restaurant.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    );
  } catch {}

  return entries;
}
