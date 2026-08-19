import { apiFetch } from "@/lib/api/client";
import type { PublicProfile } from "@/types/profile";

/** Null when nobody has that username, or the account is disabled. */
export async function getPublicProfile(
  username: string,
): Promise<PublicProfile | null> {
  try {
    const { data } = await apiFetch<PublicProfile>(
      `/users/profile/${encodeURIComponent(username)}`,
      { revalidate: 60, tags: ["profiles", `profile:${username}`] },
    );
    return data;
  } catch {
    return null;
  }
}
