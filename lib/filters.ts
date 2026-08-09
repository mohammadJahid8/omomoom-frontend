import type { RestaurantFacets } from "@/types/api";

export const FILTER_GROUPS = [
  { key: "cuisine", label: "Cuisine" },
  { key: "area", label: "Neighborhood" },
  { key: "price", label: "Price" },
  { key: "dish", label: "Dish" },
  { key: "occasion", label: "Good for" },
  { key: "dietary", label: "Dietary" },
] as const;

export type FilterKey = (typeof FILTER_GROUPS)[number]["key"];

export type Filters = Record<FilterKey, string[]> & {
  q: string;
  sortBy?: string;
  page?: number;
};

export const EMPTY_FILTERS: Filters = {
  q: "",
  cuisine: [],
  area: [],
  price: [],
  dish: [],
  occasion: [],
  dietary: [],
};

export type SearchParams = Record<string, string | string[] | undefined>;

const toArray = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value])
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
};

export function parseFilters(searchParams: SearchParams): Filters {
  const page = Number(searchParams.page);

  return {
    q: typeof searchParams.q === "string" ? searchParams.q : "",
    sortBy:
      typeof searchParams.sortBy === "string" ? searchParams.sortBy : undefined,
    page: Number.isFinite(page) && page > 1 ? page : undefined,
    ...(Object.fromEntries(
      FILTER_GROUPS.map((group) => [
        group.key,
        toArray(searchParams[group.key]),
      ]),
    ) as Record<FilterKey, string[]>),
  };
}

export function toSearchParams(
  filters: Partial<Filters>,
  extra: Record<string, string | number | boolean | undefined> = {},
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.page && filters.page > 1)
    params.set("page", String(filters.page));

  for (const group of FILTER_GROUPS) {
    for (const value of filters[group.key] ?? []) {
      params.append(group.key, value);
    }
  }

  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined) params.set(key, String(value));
  }

  return params;
}

export function countActiveFilters(filters: Filters): number {
  const groups = FILTER_GROUPS.reduce(
    (total, group) => total + (filters[group.key]?.length ?? 0),
    0,
  );
  return groups + (filters.q.trim() ? 1 : 0);
}

export function toggleFilter(
  filters: Filters,
  key: FilterKey,
  value: string,
): Filters {
  const current = filters[key] ?? [];
  return {
    ...filters,

    page: undefined,
    [key]: current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value],
  };
}

export function facetsFor(
  facets: RestaurantFacets | undefined,
  key: FilterKey,
) {
  return facets?.[key] ?? [];
}

export function hrefForToggle(
  filters: Filters,
  key: FilterKey,
  value: string,
  pathname = "/",
): string {
  const query = toSearchParams(toggleFilter(filters, key, value)).toString();
  return query ? `${pathname}?${query}#find` : `${pathname}#find`;
}

export function labelFor(
  facets: RestaurantFacets | undefined,
  key: FilterKey,
  slug: string,
): string {
  return facets?.[key]?.find((option) => option.slug === slug)?.label ?? slug;
}
