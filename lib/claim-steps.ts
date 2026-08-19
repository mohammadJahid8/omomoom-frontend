import type { Claim } from "@/types/claim";

export const CLAIM_STEPS = [
  "details",
  "method",
  "code",
  "manual",
  "review",
  "done",
] as const;

export type ClaimStep = (typeof CLAIM_STEPS)[number];

const isStep = (value: unknown): value is ClaimStep =>
  typeof value === "string" && (CLAIM_STEPS as readonly string[]).includes(value);

const codeIsLive = (claim: Claim): boolean =>
  Boolean(
    claim.codeSentTo &&
      claim.codeExpiresAt &&
      new Date(claim.codeExpiresAt) > new Date(),
  );

/**
 * Where the flow actually is, read from the claim rather than from memory.
 * A refresh, a shared link or the back button all land somewhere truthful.
 */
export function defaultStep(claim: Claim | null): ClaimStep {
  if (!claim) return "details";
  if (claim.status === "APPROVED") return "done";
  if (claim.verificationMethod === "MANUAL" && claim.status === "PENDING") {
    return "review";
  }
  if (codeIsLive(claim)) return "code";
  return "method";
}

/**
 * A step in the URL is a request, not an instruction. Anything the claim
 * cannot support falls back to where the flow really is, so a hand-typed
 * `?step=done` never fakes a verified restaurant.
 */
export function resolveStep(
  requested: string | string[] | undefined,
  claim: Claim | null,
): ClaimStep {
  const fallback = defaultStep(claim);
  const value = Array.isArray(requested) ? requested[0] : requested;

  if (!isStep(value)) return fallback;
  if (claim?.status === "APPROVED") return "done";

  switch (value) {
    case "details":
      return "details";
    case "method":
    case "manual":
      return claim ? value : "details";
    case "code":
      return claim && codeIsLive(claim) ? "code" : fallback;
    case "review":
      return claim?.verificationMethod === "MANUAL" ? "review" : fallback;
    case "done":
      return fallback;
    default:
      return fallback;
  }
}

/**
 * Always explicit, `details` included. A bare URL means "no preference", which
 * the server answers with the default step, so omitting the param here would
 * bounce someone straight back off the step they asked for.
 */
export function stepHref(pathname: string, step: ClaimStep): string {
  return `${pathname}?step=${step}`;
}
