import type { Metadata } from "next";
import { Suspense } from "react";

import { FilterPanel } from "@/components/filters/filter-panel";
import { FilterStateProvider } from "@/components/filters/filter-state";
import { EmptyState } from "@/components/home/empty-state";
import { FinderSkeleton } from "@/components/home/finder-skeleton";
import { Pagination } from "@/components/restaurant/pagination";
import { RestaurantCardGrid } from "@/components/restaurant/restaurant-card-grid";
import { RESTAURANTS_PER_PAGE, getRestaurants } from "@/lib/api/restaurants";
import {
  FILTER_GROUPS,
  countActiveFilters,
  labelFor,
  parseFilters,
  toSearchParams,
  type Filters,
  type SearchParams,
} from "@/lib/filters";
import { siteConfig } from "@/lib/site-config";
import { RESULTS_ID } from "@/lib/smooth-scroll";
import type { RestaurantFacets } from "@/types/api";

const PATH = "/restaurants";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

function describe(filters: Filters, facets: RestaurantFacets | undefined) {
  const parts = FILTER_GROUPS.flatMap((group) =>
    (filters[group.key] ?? []).map((slug) =>
      group.key === "price" ? slug : labelFor(facets, group.key, slug),
    ),
  );
  return parts;
}

function activeGroupCount(filters: Filters): number {
  return FILTER_GROUPS.filter((group) => (filters[group.key] ?? []).length > 0)
    .length;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const filters = parseFilters(await searchParams);
  const { facets, meta } = await getRestaurants(filters, {
    limit: RESTAURANTS_PER_PAGE,
  });

  const groups = activeGroupCount(filters);
  const words = describe(filters, facets);
  const page = filters.page ?? 1;

  const title = words.length
    ? `${words.join(", ")} restaurants in ${siteConfig.city}`
    : `All ${siteConfig.city} restaurants`;

  const description = words.length
    ? `${meta.total.toLocaleString()} ${words.join(", ")} restaurants in ${siteConfig.city}, filterable by cuisine, neighborhood, price and dietary needs.`
    : `Browse every restaurant on Omomoom. ${meta.total.toLocaleString()} places across ${siteConfig.city}, filterable by cuisine, neighborhood, price, occasion and dietary needs.`;

  const indexable = groups <= 1 && !filters.q.trim();

  const query = toSearchParams({ ...filters, page }).toString();
  const canonical = query ? `${PATH}?${query}` : PATH;

  return {
    title,
    description,
    ...(indexable
      ? { alternates: { canonical } }
      : { robots: { index: false, follow: true } }),
    openGraph: {
      type: "website",
      title,
      description,
      siteName: siteConfig.name,
      url: `${siteConfig.url}${canonical}`,
    },
  };
}

export default async function RestaurantsPage({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams);

  return (
    <FilterStateProvider filters={filters}>
      <Suspense fallback={<FinderSkeleton />}>
        <Listing filters={filters} />
      </Suspense>
    </FilterStateProvider>
  );
}

async function Listing({ filters }: { filters: Filters }) {
  const { restaurants, facets, meta } = await getRestaurants(filters, {
    limit: RESTAURANTS_PER_PAGE,
  });

  const activeCount = countActiveFilters(filters);
  const words = describe(filters, facets);
  const page = meta.page;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: words.length
      ? `${words.join(", ")} restaurants in ${siteConfig.city}`
      : `Restaurants in ${siteConfig.city}`,
    numberOfItems: meta.total,
    itemListElement: restaurants.map((restaurant, index) => ({
      "@type": "ListItem",
      position: (page - 1) * meta.limit + index + 1,
      url: `${siteConfig.url}/restaurants/${restaurant.slug}`,
      name: restaurant.name,
    })),
  };

  return (
    <div className="section-y">
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="container-page">
        <header className="max-w-3xl">
          <p className="text-brand-ink text-xs font-semibold tracking-[0.16em] uppercase">
            The directory
          </p>
          <h1 className="font-heading mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            {words.length
              ? `${words.join(", ")} restaurants`
              : `Every restaurant in ${siteConfig.city}`}
          </h1>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            {meta.total.toLocaleString()}{" "}
            {meta.total === 1 ? "place" : "places"}, and nobody pays to appear
            here. Filter by cuisine, neighborhood, price, dish, occasion and
            dietary needs.
          </p>
        </header>

        <div className="mt-10">
          <FilterPanel facets={facets} total={meta.total} />
        </div>

        <div id={RESULTS_ID} className="mt-14 lg:mt-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">
              {activeCount > 0 ? "Matching restaurants" : "All restaurants"}
            </h2>
            <p className="text-muted-foreground text-sm" aria-live="polite">
              {meta.totalPages > 1
                ? `Page ${page} of ${meta.totalPages} · ${meta.total.toLocaleString()} total`
                : `${meta.total.toLocaleString()} ${meta.total === 1 ? "result" : "results"}`}
            </p>
          </div>

          {restaurants.length > 0 ? (
            <>
              <RestaurantCardGrid restaurants={restaurants} />
              <Pagination
                filters={filters}
                page={page}
                totalPages={meta.totalPages}
                pathname={PATH}
              />
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
