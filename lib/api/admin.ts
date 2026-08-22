import { apiFetch } from "@/lib/api/client";
import type { ApiMeta } from "@/types/api";
import type {
  AdminClaim,
  ClaimCounts,
  AdminRestaurant,
  AdminRestaurantInput,
  AdminRestaurantRow,
  AdminUser,
} from "@/types/admin";
import type { Role } from "@/types/auth";

/* ----------------------------------------------------------- restaurants */

export type RestaurantQuery = {
  q?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export async function listAdminRestaurants(query: RestaurantQuery = {}) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status && query.status !== "ALL") params.set("status", query.status);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 25));

  const { data, meta } = await apiFetch<AdminRestaurantRow[]>(
    `/restaurants/admin?${params.toString()}`,
    { session: true },
  );

  return { restaurants: data, meta: meta as ApiMeta };
}

export async function getAdminRestaurant(id: string): Promise<AdminRestaurant> {
  const { data } = await apiFetch<AdminRestaurant>(`/restaurants/admin/${id}`, {
    session: true,
  });
  return data;
}

export async function createRestaurant(
  input: AdminRestaurantInput,
): Promise<AdminRestaurant> {
  const { data } = await apiFetch<AdminRestaurant>("/restaurants/admin", {
    method: "POST",
    body: input,
    session: true,
  });
  return data;
}

export async function updateRestaurant(
  id: string,
  input: Partial<AdminRestaurantInput>,
): Promise<AdminRestaurant> {
  const { data } = await apiFetch<AdminRestaurant>(
    `/restaurants/admin/${id}`,
    { method: "PATCH", body: input, session: true },
  );
  return data;
}

/**
 * Refused with a 409 when the restaurant has a running subscription, so the
 * admin is told what deleting would end before it happens. `force` is the
 * second, deliberate press.
 */
export async function deleteRestaurant(
  id: string,
  force = false,
): Promise<void> {
  await apiFetch(`/restaurants/admin/${id}${force ? "?force=true" : ""}`, {
    method: "DELETE",
    session: true,
  });
}

/* ----------------------------------------------------------------- users */

export type UserQuery = {
  q?: string;
  role?: string;
  state?: string;
  page?: number;
  limit?: number;
};

export async function listAdminUsers(query: UserQuery = {}) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.role && query.role !== "ALL") params.set("role", query.role);
  if (query.state && query.state !== "ALL") params.set("state", query.state);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 25));

  const { data, meta } = await apiFetch<AdminUser[]>(
    `/users?${params.toString()}`,
    { session: true },
  );

  return { users: data, meta: meta as ApiMeta };
}

export async function updateUser(
  id: string,
  input: { role?: Role; isActive?: boolean },
): Promise<AdminUser> {
  const { data } = await apiFetch<AdminUser>(`/users/${id}`, {
    method: "PATCH",
    body: input,
    session: true,
  });
  return data;
}

/* ---------------------------------------------------------------- claims */

export type ClaimQuery = {
  view?: "OPEN" | "WAITING" | "DECIDED" | "ALL";
  q?: string;
  page?: number;
  limit?: number;
};

export async function listAdminClaims(query: ClaimQuery = {}) {
  const params = new URLSearchParams();
  params.set("view", query.view ?? "OPEN");
  if (query.q) params.set("q", query.q);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));

  const { data, meta } = await apiFetch<AdminClaim[]>(
    `/claims/admin?${params.toString()}`,
    { session: true },
  );

  return {
    claims: data,
    meta: meta as ApiMeta & { counts: ClaimCounts },
  };
}

export async function decideClaim(
  id: string,
  input: { action: "APPROVE" | "REJECT"; note?: string },
): Promise<AdminClaim> {
  const { data } = await apiFetch<AdminClaim>(`/claims/admin/${id}`, {
    method: "PATCH",
    body: input,
    session: true,
  });
  return data;
}

export async function revokeOwnership(input: {
  restaurantId: string;
  userId: string;
  note: string;
}): Promise<{ restaurantId: string; ownersLeft: number }> {
  const { data } = await apiFetch<{
    restaurantId: string;
    ownersLeft: number;
  }>("/claims/admin/revoke", { method: "POST", body: input, session: true });
  return data;
}
