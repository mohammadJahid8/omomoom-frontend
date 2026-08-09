"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { useFilterState } from "@/components/filters/filter-state";
import { RestaurantCardGrid } from "@/components/restaurant/restaurant-card-grid";
import { Button } from "@/components/ui/button";
import { RESTAURANTS_PER_PAGE, getRestaurants } from "@/lib/api/restaurants";
import { toSearchParams, type Filters } from "@/lib/filters";
import type { ApiMeta, RestaurantCardData } from "@/types/api";

type RestaurantGridProps = {
  filters: Filters;

  initial: RestaurantCardData[];
  meta: ApiMeta;

  ranked: boolean;
};

export function RestaurantGrid({
  filters,
  initial,
  meta,
  ranked,
}: RestaurantGridProps) {
  const { isPending } = useFilterState();

  const [extra, setExtra] = useState<RestaurantCardData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const signature = toSearchParams(filters).toString();
  const [lastSignature, setLastSignature] = useState(signature);
  if (signature !== lastSignature) {
    setLastSignature(signature);
    setExtra([]);
    setPage(1);
    setFailed(false);
  }

  const restaurants = [...initial, ...extra];
  const remaining = meta.total - restaurants.length;
  const hasMore = remaining > 0;

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    setFailed(false);

    const next = page + 1;
    try {
      const result = await getRestaurants(
        { ...filters, page: next },

        { limit: RESTAURANTS_PER_PAGE, facets: false },
      );
      setExtra((current) => [...current, ...result.restaurants]);
      setPage(next);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <RestaurantCardGrid restaurants={restaurants} ranked={ranked} />

      {hasMore ? (
        <div className="mt-10 flex flex-col items-center gap-3">
          <Button
            size="lg"
            variant="outline"
            onClick={loadMore}
            disabled={loading || isPending}
            className="rounded-full"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="size-4" aria-hidden="true" />
            )}
            Show more
          </Button>

          <p className="text-muted-foreground text-sm" aria-live="polite">
            {failed
              ? "That did not load. Try again."
              : `Showing ${restaurants.length} of ${meta.total.toLocaleString()}`}
          </p>
        </div>
      ) : null}
    </>
  );
}
