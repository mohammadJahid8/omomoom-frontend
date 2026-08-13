import { apiFetch } from "@/lib/api/client";
import type { ApiMeta } from "@/types/api";
import type {
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

export async function deleteRestaurant(id: string): Promise<void> {
  await apiFetch(`/restaurants/admin/${id}`, {
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
