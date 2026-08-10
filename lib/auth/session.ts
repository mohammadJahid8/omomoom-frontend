import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { API_BASE_URL } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { Role, SessionUser } from "@/types/auth";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "omomoom_session";

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Accept: "application/json",
        Cookie: `${SESSION_COOKIE}=${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const body = (await response.json()) as ApiResponse<SessionUser>;
    return body.success ? body.data : null;
  } catch {
    return null;
  }
});

export async function requireSession(returnTo: string): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

export async function requireRole(
  returnTo: string,
  ...roles: Role[]
): Promise<SessionUser> {
  const user = await requireSession(returnTo);
  if (!roles.includes(user.role)) redirect("/");
  return user;
}
