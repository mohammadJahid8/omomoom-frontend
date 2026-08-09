import { FilterPanel } from "@/components/filters/filter-panel";
import { RestaurantGrid } from "@/components/home/restaurant-grid";
import { EmptyState } from "@/components/home/empty-state";
import { getRestaurants } from "@/lib/api/restaurants";
import { countActiveFilters, type Filters } from "@/lib/filters";
import { FINDER_ID, RESULTS_ID } from "@/lib/smooth-scroll";

type RestaurantFinderProps = {
  filters: Filters;

  limit?: number;
};

export async function RestaurantFinder({
  filters,
  limit,
}: RestaurantFinderProps) {
  const { restaurants, facets, meta } = await getRestaurants(filters, {
    limit,
  });

  const isFiltered = countActiveFilters(filters) > 0;

  return (
    <section className="bg-surface section-y border-b" id={FINDER_ID}>
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-brand text-xs font-semibold tracking-[0.16em] uppercase">
            The Omomoom filter
          </p>
          <h2 className="font-heading mt-3 text-3xl font-extrabold sm:text-4xl">
            What are you craving today?
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-relaxed">
            Narrow {meta.total.toLocaleString()} Miami restaurants by cuisine,
            neighborhood and price. Ranked by real reviews, never by paid
            placement.
          </p>
        </div>

        <div className="mt-10">
          <FilterPanel facets={facets} total={meta.total} />
        </div>

        <div id={RESULTS_ID} className="mt-14 scroll-mt-24 lg:mt-16">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between lg:mb-10">
            <div>
              <p className="text-brand text-xs font-semibold tracking-[0.14em] uppercase">
                Foodie charts
              </p>
              <h3 className="font-heading mt-2 text-2xl font-bold sm:text-3xl">
                {isFiltered ? "Matching restaurants" : "Trending this week"}
              </h3>
            </div>

            <p className="text-muted-foreground text-sm" aria-live="polite">
              {meta.total.toLocaleString()}{" "}
              {meta.total === 1 ? "restaurant" : "restaurants"}
              {isFiltered
                ? meta.total === 1
                  ? " matches your filters"
                  : " match your filters"
                : ""}
            </p>
          </div>

          {restaurants.length > 0 ? (
            <RestaurantGrid
              filters={filters}
              initial={restaurants}
              meta={meta}
              ranked={!isFiltered}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </section>
  );
}
