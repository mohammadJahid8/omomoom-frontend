import { API_BASE_URL, ApiError, apiFetch } from "@/lib/api/client";
import type { SessionUser } from "@/types/auth";

export const googleSignInUrl = `${API_BASE_URL}/auth/google`;

export type FormError = {
  message: string;
  fields: Record<string, string>;
};

export function toFormError(error: unknown): FormError {
  if (error instanceof ApiError) {
    const fields: Record<string, string> = {};
    for (const detail of error.details) {
      if (detail.path && !fields[detail.path]) fields[detail.path] = detail.message;
    }
    return { message: error.message, fields };
  }

  return {
    message:
      error instanceof Error
        ? error.message
        : "Something went wrong. Try again.",
    fields: {},
  };
}

export async function registerAccount(input: {
  name: string;
  email: string;
  password: string;
}): Promise<SessionUser> {
  const { data } = await apiFetch<SessionUser>("/auth/register", {
    method: "POST",
    body: input,
    session: true,
  });
  return data;
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<SessionUser> {
  const { data } = await apiFetch<SessionUser>("/auth/login", {
    method: "POST",
    body: input,
    session: true,
  });
  return data;
}

export async function signOut(): Promise<void> {
  await apiFetch<null>("/auth/logout", { method: "POST", session: true });
}

export async function fetchSession(
  signal?: AbortSignal,
): Promise<SessionUser | null> {
  try {
    const { data } = await apiFetch<SessionUser | null>("/auth/session", {
      session: true,
      signal,
    });
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export async function updateProfile(input: {
  name?: string;
  username?: string;
  avatarUrl?: string | null;
}): Promise<SessionUser> {
  const { data } = await apiFetch<SessionUser>("/auth/me", {
    method: "PATCH",
    body: input,
    session: true,
  });
  return data;
}
