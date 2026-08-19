import { apiFetch } from "@/lib/api/client";
import type {
  StudioListing,
  StudioPhoto,
  StudioPhotos,
  StudioUpdate,
} from "@/types/studio";

export async function getStudioListing(
  restaurantId: string,
): Promise<StudioListing> {
  const { data } = await apiFetch<StudioListing>(`/studio/${restaurantId}`, {
    session: true,
  });
  return data;
}

export async function saveStudioListing(
  restaurantId: string,
  input: StudioUpdate,
): Promise<StudioListing> {
  const { data } = await apiFetch<StudioListing>(`/studio/${restaurantId}`, {
    method: "PATCH",
    body: input,
    session: true,
  });
  return data;
}

/* ---------------------------------------------------------------- photos */

export async function addStudioPhoto(
  restaurantId: string,
  input: { key: string; caption?: string; width?: number; height?: number },
): Promise<StudioPhoto & { isCover: boolean }> {
  const { data } = await apiFetch<StudioPhoto>(
    `/studio/${restaurantId}/photos`,
    { method: "POST", body: input, session: true },
  );
  return data;
}

export async function makeStudioCover(
  restaurantId: string,
  photoId: string,
): Promise<StudioPhotos> {
  const { data } = await apiFetch<StudioPhotos>(
    `/studio/${restaurantId}/photos/${photoId}`,
    { method: "PATCH", body: { isCover: true }, session: true },
  );
  return data;
}

export async function deleteStudioPhoto(
  restaurantId: string,
  photoId: string,
): Promise<StudioPhotos> {
  const { data } = await apiFetch<StudioPhotos>(
    `/studio/${restaurantId}/photos/${photoId}`,
    { method: "DELETE", session: true },
  );
  return data;
}

export async function reorderStudioPhotos(
  restaurantId: string,
  ids: string[],
): Promise<StudioPhotos> {
  const { data } = await apiFetch<StudioPhotos>(
    `/studio/${restaurantId}/photos/order`,
    { method: "PATCH", body: { ids }, session: true },
  );
  return data;
}
