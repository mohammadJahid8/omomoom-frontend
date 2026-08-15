export type ClaimStatus = "PENDING" | "VERIFIED" | "APPROVED" | "REJECTED";

export type VerificationMethod = "PHONE" | "EMAIL_DOMAIN" | "MANUAL";

export type VerificationOption = {
  method: VerificationMethod;
  label: string;
  detail: string;
  target: string | null;
};

export type Claim = {
  id: string;
  status: ClaimStatus;
  claimantRole: string;
  workEmail: string;
  mobilePhone: string;
  verificationMethod: string | null;
  verifiedAt: string | null;
  codeSentTo: string | null;
  codeExpiresAt: string | null;
  createdAt: string;
  restaurant: { id: string; slug: string; name: string };
};

export const CLAIMANT_ROLES = [
  "Owner",
  "Co-owner or partner",
  "General manager",
  "Manager",
  "Marketing or PR",
  "Other authorised representative",
] as const;
