import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { ExternalLink, Search, Store } from "lucide-react";

import {
  EmptyState,
  NotBuiltYet,
  PageHeader,
  Panel,
} from "@/components/dashboard/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRestaurants } from "@/lib/api/restaurants";
import { EMPTY_FILTERS } from "@/lib/filters";

export const metadata: Metadata = { title: "Restaurants" };

const CLAIM_LABEL: Record<string, string> = {
  UNCLAIMED: "Unclaimed",
  PENDING: "Claim pending",
  CLAIMED: "Claimed",
};

export default async function AdminRestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";

  const { restaurants, meta } = await getRestaurants(
    { ...EMPTY_FILTERS, q },
    { limit: 25, facets: false },
  );

  return (
    <>
      <PageHeader
        title="Restaurants"
        description={`${meta.total.toLocaleString()} listings in the directory.`}
        action={
          <Button
            disabled
            className="bg-brand-ink text-brand-ink-foreground h-10 rounded-xl px-4 font-semibold"
          >
            Add a restaurant
          </Button>
        }
      />

      <Panel className="p-0 sm:p-0">
        <Form
          className="flex gap-2 border-b p-4"
          action="/dashboard/admin/restaurants"
        >
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name, dish or neighborhood"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-xl border bg-transparent px-3.5 text-sm outline-none focus-visible:ring-3 sm:max-w-sm"
          />
          <Button
            type="submit"
            variant="outline"
            className="h-10 shrink-0 rounded-xl px-4 font-semibold"
          >
            <Search />
            <span className="sr-only sm:not-sr-only">Search</span>
          </Button>
        </Form>

        {restaurants.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Store}
              title="Nothing matched"
              body={`No restaurant matches "${q}". Try a shorter search.`}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-176 text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-left">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Neighborhood</th>
                  <th className="px-4 py-2.5 font-medium">Cuisine</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium sr-only">Open</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((restaurant) => (
                  <tr
                    key={restaurant.id}
                    className="hover:bg-muted/50 border-b last:border-0"
                  >
                    <td className="px-4 py-2.5 font-medium">
                      {restaurant.name}
                    </td>
                    <td className="text-muted-foreground px-4 py-2.5">
                      {restaurant.neighborhood ?? restaurant.municipality ?? "—"}
                    </td>
                    <td className="text-muted-foreground px-4 py-2.5">
                      {restaurant.cuisine ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge
                        variant={
                          restaurant.claimState === "CLAIMED"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {CLAIM_LABEL[restaurant.claimState] ??
                          restaurant.claimState}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href={`/restaurants/${restaurant.slug}`}
                        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
                      >
                        <ExternalLink className="size-3.5" />
                        <span className="sr-only sm:not-sr-only">View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="mt-4">
        <NotBuiltYet
          title="Editing is read-only for now"
          body="This list reads the public directory endpoint, so it is real data. Writing to it needs admin-only endpoints that do not exist yet."
          bullets={[
            "Create, edit and archive a listing",
            "Reassign neighborhoods, cuisines and tags",
            "Approve the photos an owner uploads",
            "Full pagination and sorting across all 430 listings",
          ]}
        />
      </div>
    </>
  );
}
