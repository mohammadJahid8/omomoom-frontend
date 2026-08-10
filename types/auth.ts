export type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  emailVerified: boolean;
  ownedRestaurantIds: string[];
};

export type SessionStatus = "loading" | "authenticated" | "anonymous";

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}

export function isOwner(user: SessionUser | null): boolean {
  return (user?.ownedRestaurantIds.length ?? 0) > 0;
}
