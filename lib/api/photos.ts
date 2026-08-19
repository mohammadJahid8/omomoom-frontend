import { apiFetch } from "@/lib/api/client";
import type { ApiMeta } from "@/types/api";
import type { MyPhoto, PhotoStatus, QueuePhoto } from "@/types/photo";

export async function addCommunityPhoto(input: {
  restaurantId: string;
  key: string;
  caption?: string;
  width?: number;
  height?: number;
}): Promise<MyPhoto> {
  const { data } = await apiFetch<MyPhoto>("/photos", {
    method: "POST",
    body: input,
    session: true,
  });
  return data;
}

export async function listMyPhotos(): Promise<{ photos: MyPhoto[] }> {
  const { data } = await apiFetch<{ photos: MyPhoto[] }>("/photos/mine", {
    session: true,
    noStore: true,
  });
  return data;
}

export async function withdrawMyPhoto(
  id: string,
): Promise<{ photos: MyPhoto[] }> {
  const { data } = await apiFetch<{ photos: MyPhoto[] }>(`/photos/${id}`, {
    method: "DELETE",
    session: true,
  });
  return data;
}

export async function listPhotoQueue(query: {
  status?: PhotoStatus;
  page?: number;
}) {
  const params = new URLSearchParams();
  params.set("status", query.status ?? "PENDING");
  params.set("page", String(query.page ?? 1));

  const { data, meta } = await apiFetch<QueuePhoto[]>(
    `/photos/moderation?${params.toString()}`,
    { session: true },
  );

  return { photos: data, meta: meta as ApiMeta & { pending: number } };
}

export async function decidePhoto(
  id: string,
  action: "APPROVE" | "REJECT",
): Promise<void> {
  await apiFetch(`/photos/moderation/${id}`, {
    method: "PATCH",
    body: { action },
    session: true,
  });
}
