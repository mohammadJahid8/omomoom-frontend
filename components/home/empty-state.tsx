"use client";

import { useFilterState } from "@/components/filters/filter-state";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  const { clear } = useFilterState();

  return (
    <div className="border-border-strong/60 rounded-2xl border border-dashed py-16 text-center">
      <p className="font-heading text-lg font-bold">
        Nothing matches all of those
      </p>
      <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
        Try removing a filter, or widen the search. There are plenty of other
        places worth eating at.
      </p>
      <Button
        onClick={clear}
        className="bg-brand text-brand-foreground hover:bg-brand/90 mt-6 rounded-full"
      >
        Clear all filters
      </Button>
    </div>
  );
}
