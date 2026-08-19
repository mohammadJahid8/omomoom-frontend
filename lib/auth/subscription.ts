import { cookies } from "next/headers";

import { API_BASE_URL } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { Subscription } from "@/types/subscription";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "omomoom_session";

/** Null when signed out, or when the viewer does not own that restaurant. */
export async function getSubscriptionFor(
  restaurantId: string,
): Promise<Subscription | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const response = await fetch(
      `${API_BASE_URL}/subscriptions/${restaurantId}`,
      {
        headers: {
          Accept: "application/json",
          Cookie: `${SESSION_COOKIE}=${token}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) return null;

    const body = (await response.json()) as ApiResponse<Subscription>;
    return body.success ? body.data : null;
  } catch {
    return null;
  }
}
