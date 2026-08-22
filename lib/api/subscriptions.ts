import { apiFetch } from "@/lib/api/client";
import type { Subscription } from "@/types/subscription";

export async function getSubscription(
  restaurantId: string,
): Promise<Subscription> {
  const { data } = await apiFetch<Subscription>(
    `/subscriptions/${restaurantId}`,
    { session: true },
  );
  return data;
}

/**
 * With Stripe this returns somewhere to send the browser rather than a
 * finished subscription: the card is taken on Stripe's page, and the result
 * reaches us by webhook.
 */
export async function startSubscription(restaurantId: string): Promise<{
  checkoutUrl: string | null;
  subscription: Subscription;
}> {
  const { data } = await apiFetch<{
    checkoutUrl: string | null;
    subscription: Subscription;
  }>(`/subscriptions/${restaurantId}`, { method: "POST", session: true });
  return data;
}

export async function billingPortalUrl(restaurantId: string): Promise<string> {
  const { data } = await apiFetch<{ url: string }>(
    `/subscriptions/${restaurantId}/portal`,
    { method: "POST", session: true },
  );
  return data.url;
}

export async function cancelSubscription(
  restaurantId: string,
): Promise<Subscription> {
  const { data } = await apiFetch<Subscription>(
    `/subscriptions/${restaurantId}`,
    { method: "DELETE", session: true },
  );
  return data;
}

export async function resumeSubscription(
  restaurantId: string,
): Promise<Subscription> {
  const { data } = await apiFetch<Subscription>(
    `/subscriptions/${restaurantId}/resume`,
    { method: "POST", session: true },
  );
  return data;
}
