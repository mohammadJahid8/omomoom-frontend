import { cookies } from "next/headers";

import { API_BASE_URL } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { Claim, VerificationOption } from "@/types/claim";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "omomoom_session";

export type ClaimState = {
  claim: Claim | null;
  options: VerificationOption[];
};

const EMPTY: ClaimState = { claim: null, options: [] };

export async function getMyClaim(restaurantId: string): Promise<ClaimState> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return EMPTY;

  try {
    const response = await fetch(`${API_BASE_URL}/claims/mine/${restaurantId}`, {
      headers: {
        Accept: "application/json",
        Cookie: `${SESSION_COOKIE}=${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return EMPTY;

    const body = (await response.json()) as ApiResponse<ClaimState>;
    return body.success && body.data ? body.data : EMPTY;
  } catch {
    return EMPTY;
  }
}
