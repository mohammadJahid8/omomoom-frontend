import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/primitives";
import { RestaurantsManager } from "@/components/dashboard/restaurants-manager";

export const metadata: Metadata = { title: "Restaurants" };

export default function AdminRestaurantsPage() {
  return (
    <>
      <PageHeader
        title="Restaurants"
        description="Every listing in the directory. Published ones are live on the site; drafts and hidden ones are not."
      />

      <RestaurantsManager />
    </>
  );
}
