import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Store } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/dashboard/primitives";
import { SubscriptionManager } from "@/components/dashboard/subscription-manager";
import { requireSession } from "@/lib/auth/session";
import { currentRestaurantId } from "@/lib/auth/studio";
import { getSubscriptionFor } from "@/lib/auth/subscription";
import { isAdmin, isOwner } from "@/types/auth";

export const metadata: Metadata = { title: "Subscription" };

export default async function SubscriptionPage() {
  const user = await requireSession("/dashboard/restaurant/subscription");
  if (!isOwner(user) && !isAdmin(user)) redirect("/dashboard");

  const restaurantId = currentRestaurantId(user.ownedRestaurantIds);
  const subscription = restaurantId
    ? await getSubscriptionFor(restaurantId)
    : null;

  if (!subscription) {
    return (
      <>
        <PageHeader title="Subscription" />
        <EmptyState
          icon={Store}
          title="No listing under your control yet"
          body="A subscription belongs to a restaurant, so there is nothing to bill until you have claimed one."
          action={{ label: "Claim your restaurant", href: "/claim" }}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Subscription"
        description={`Billing for ${subscription.name}.`}
      />
      <SubscriptionManager subscription={subscription} />
    </>
  );
}
