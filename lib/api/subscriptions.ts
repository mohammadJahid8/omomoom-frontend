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

export async function startSubscription(
  restaurantId: string,
): Promise<Subscription> {
  const { data } = await apiFetch<Subscription>(
    `/subscriptions/${restaurantId}`,
    { method: "POST", session: true },
  );
  return data;
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
