import { toSearchParams, type Filters } from "@/lib/filters";
import type {
  ApiMeta,
  NeighborhoodOption,
  RestaurantCardData,
  RestaurantDetailData,
  RestaurantListData,
  TagOption,
} from "@/types/api";

import { ApiError, apiFetch } from "./client";

export type RestaurantListResult = {
  restaurants: RestaurantCardData[];
  facets: RestaurantListData["facets"];
  meta: ApiMeta;
};

export const RESTAURANTS_PER_PAGE = 24;

const EMPTY_META: ApiMeta = {
  page: 1,
  limit: 0,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

export async function getRestaurants(
  filters: Partial<Filters>,
  options: { limit?: number; facets?: boolean } = {},
): Promise<RestaurantListResult> {
  const params = toSearchParams(filters, {
    limit: options.limit ?? RESTAURANTS_PER_PAGE,
    facets: options.facets === false ? false : undefined,
  });

  const { data, meta } = await apiFetch<RestaurantListData>(
    `/restaurants?${params.toString()}`,
    { revalidate: 60, tags: ["restaurants"] },
  );

  return {
    restaurants: data.restaurants,
    facets: data.facets,
    meta: meta ?? EMPTY_META,
  };
}

export async function getRestaurantBySlug(
  slug: string,
): Promise<RestaurantDetailData | null> {
  try {
    const { data } = await apiFetch<RestaurantDetailData>(
      `/restaurants/${encodeURIComponent(slug)}`,
      { revalidate: 300, tags: ["restaurants", `restaurant:${slug}`] },
    );
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getRelatedRestaurants(slug: string) {
  const { data } = await apiFetch<RestaurantCardData[]>(
    `/restaurants/${encodeURIComponent(slug)}/related`,
    { revalidate: 300, tags: ["restaurants"] },
  );
  return data;
}

const TAXONOMY_REVALIDATE = 3600;

export async function getTags(type?: string) {
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  const { data } = await apiFetch<TagOption[] | Record<string, TagOption[]>>(
    `/tags${query}`,
    { revalidate: TAXONOMY_REVALIDATE, tags: ["taxonomy"] },
  );
  return data;
}

export async function getNeighborhoods() {
  const { data } = await apiFetch<NeighborhoodOption[]>("/neighborhoods", {
    revalidate: TAXONOMY_REVALIDATE,
    tags: ["taxonomy"],
  });
  return data;
}

export async function getSiteStats() {
  const [list, areas, cuisines] = await Promise.all([
    apiFetch<RestaurantListData>("/restaurants?limit=1&facets=false", {
      revalidate: TAXONOMY_REVALIDATE,
      tags: ["restaurants"],
    }),
    getNeighborhoods(),
    apiFetch<TagOption[]>("/tags?type=CUISINE", {
      revalidate: TAXONOMY_REVALIDATE,
      tags: ["taxonomy"],
    }),
  ]);

  return {
    restaurants: list.meta?.total ?? 0,
    neighborhoods: areas.length,
    cuisines: cuisines.data.length,
  };
}
