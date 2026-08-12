import { apiFetch } from "@/lib/api/client";
import type {
  ContributionStats,
  Recommendation,
  RecommendationWithRestaurant,
  SavedRestaurant,
} from "@/types/contribution";

export async function savedRestaurantIds(
  signal?: AbortSignal,
): Promise<string[]> {
  const { data } = await apiFetch<string[]>("/saves/status", {
    session: true,
    signal,
  });
  return data;
}

export async function saveRestaurant(restaurantId: string): Promise<void> {
  await apiFetch("/saves", {
    method: "POST",
    body: { restaurantId },
    session: true,
  });
}

export async function unsaveRestaurant(restaurantId: string): Promise<void> {
  await apiFetch(`/saves/${restaurantId}`, { method: "DELETE", session: true });
}

export async function mySavedRestaurants(): Promise<SavedRestaurant[]> {
  const { data } = await apiFetch<SavedRestaurant[]>("/saves", {
    session: true,
  });
  return data;
}

export type RecommendationInput = {
  restaurantId: string;
  dish: string;
  rating: number;
  comment?: string | null;
};

export async function recommendDish(
  input: RecommendationInput,
): Promise<Recommendation> {
  const { data } = await apiFetch<Recommendation>("/recommendations", {
    method: "POST",
    body: input,
    session: true,
  });
  return data;
}

export async function getRecommendations(
  restaurantId: string,
  limit = 10,
): Promise<Recommendation[]> {
  try {
    const { data } = await apiFetch<Recommendation[]>(
      `/recommendations?restaurantId=${restaurantId}&limit=${limit}`,
      { revalidate: 30, tags: ["recommendations"] },
    );
    return data;
  } catch {
    return [];
  }
}

export async function getRecentRecommendations(
  limit = 6,
): Promise<RecommendationWithRestaurant[]> {
  try {
    const { data } = await apiFetch<RecommendationWithRestaurant[]>(
      `/recommendations/recent?limit=${limit}`,
      { revalidate: 60, tags: ["recommendations"] },
    );
    return data;
  } catch {
    return [];
  }
}

export async function myRecommendations(): Promise<
  RecommendationWithRestaurant[]
> {
  const { data } = await apiFetch<RecommendationWithRestaurant[]>(
    "/recommendations/mine",
    { session: true },
  );
  return data;
}

export async function myContributionStats(): Promise<ContributionStats> {
  const { data } = await apiFetch<ContributionStats>(
    "/recommendations/mine/stats",
    { session: true },
  );
  return data;
}

export async function deleteRecommendation(id: string): Promise<void> {
  await apiFetch(`/recommendations/${id}`, {
    method: "DELETE",
    session: true,
  });
}
