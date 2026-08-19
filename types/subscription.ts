export type SubscriptionStatus = "NONE" | "ACTIVE" | "PAST_DUE" | "CANCELLED";

export type Subscription = {
  id: string;
  slug: string;
  name: string;
  claimState: "UNCLAIMED" | "PENDING" | "CLAIMED";
  subscriptionStatus: SubscriptionStatus;
  subscribedAt: string | null;
  subscribedUntil: string | null;
  priceCents: number;
  currency: string;
  mocked: boolean;
  /** Paid for right now, including a cancelled period that has not run out. */
  active: boolean;
};
