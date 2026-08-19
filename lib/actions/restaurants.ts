"use server";

import { updateTag } from "next/cache";

/**
 * The Studio and the claim flow write straight to the API from the browser, so
 * Next never sees the mutation and would keep serving the cached page for five
 * more minutes. `updateTag` rather than `revalidateTag` because the person who
 * just saved goes straight to their public page to look at it: stale-while-
 * revalidate would show them the old version on exactly the visit that matters.
 */
export async function refreshRestaurant(slug: string) {
  updateTag(`restaurant:${slug}`);
  updateTag("restaurants");
}
