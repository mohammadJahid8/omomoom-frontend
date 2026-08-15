import { apiFetch } from "@/lib/api/client";
import type { Claim, VerificationOption } from "@/types/claim";

export type StartClaimInput = {
  restaurantId: string;
  claimantRole: string;
  workEmail: string;
  mobilePhone: string;
  authorised: true;
};

export async function startClaim(input: StartClaimInput) {
  const { data } = await apiFetch<{
    claim: Claim;
    options: VerificationOption[];
  }>("/claims", { method: "POST", body: input, session: true });
  return data;
}

export async function sendClaimCode(claimId: string, method: string) {
  const { data } = await apiFetch<{ sentTo: string; mocked: boolean }>(
    `/claims/${claimId}/code`,
    { method: "POST", body: { method }, session: true },
  );
  return data;
}

export async function verifyClaimCode(claimId: string, code: string) {
  const { data } = await apiFetch<Claim>(`/claims/${claimId}/verify`, {
    method: "POST",
    body: { code },
    session: true,
  });
  return data;
}

export async function requestManualReview(claimId: string, note: string) {
  const { data } = await apiFetch<Claim>(`/claims/${claimId}/manual`, {
    method: "POST",
    body: { note },
    session: true,
  });
  return data;
}
