import { cache } from "react";
import { cookies } from "next/headers";

import { API_BASE_URL } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { MyPhoto } from "@/types/photo";
import type {
  ContributionStats,
  RecommendationWithRestaurant,
  SavedRestaurant,
} from "@/types/contribution";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "omomoom_session";

const EMPTY_STATS: ContributionStats = {
  recommendations: 0,
  photos: 0,
  placesTried: 0,
  wantToTry: 0,
};

async function asViewer<T>(path: string, fallback: T): Promise<T> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return fallback;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        Accept: "application/json",
        Cookie: `${SESSION_COOKIE}=${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return fallback;

    const body = (await response.json()) as ApiResponse<T>;
    return body.success ? body.data : fallback;
  } catch {
    return fallback;
  }
}

export const getMyStats = cache(() =>
  asViewer<ContributionStats>("/recommendations/mine/stats", EMPTY_STATS),
);

export const getMyRecommendations = cache(() =>
  asViewer<RecommendationWithRestaurant[]>("/recommendations/mine", []),
);

export const getMySaves = cache(() =>
  asViewer<SavedRestaurant[]>("/saves", []),
);

export const getMyPhotos = cache(() =>
  asViewer<{ photos: MyPhoto[] }>("/photos/mine", { photos: [] }),
);
