import { cookies } from "next/headers";

import { API_BASE_URL } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { StudioListing, StudioPhotos } from "@/types/studio";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "omomoom_session";

/**
 * One place decides which listing the Studio is showing. Ownership is already
 * a list in the database, so adding a switcher later means changing this
 * function and nothing else.
 */
export function currentRestaurantId(owned: string[]): string | null {
  return owned[0] ?? null;
}

async function readStudio<T>(path: string): Promise<T | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        Accept: "application/json",
        Cookie: `${SESSION_COOKIE}=${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const body = (await response.json()) as ApiResponse<T>;
    return body.success ? body.data : null;
  } catch {
    return null;
  }
}

export async function getStudioPhotosFor(
  restaurantId: string,
): Promise<StudioPhotos> {
  return (
    (await readStudio<StudioPhotos>(`/studio/${restaurantId}/photos`)) ?? {
      photos: [],
      max: 24,
    }
  );
}

export async function getStudioFor(
  restaurantId: string,
): Promise<StudioListing | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/studio/${restaurantId}`, {
      headers: {
        Accept: "application/json",
        Cookie: `${SESSION_COOKIE}=${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const body = (await response.json()) as ApiResponse<StudioListing>;
    return body.success ? body.data : null;
  } catch {
    return null;
  }
}
