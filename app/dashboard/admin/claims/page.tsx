import type { Metadata } from "next";

import { NotBuiltYet, PageHeader } from "@/components/dashboard/primitives";

export const metadata: Metadata = { title: "Claims" };

export default function AdminClaimsPage() {
  return (
    <>
      <PageHeader
        title="Claims"
        description="Restaurant owners asking for control of their listing."
      />
      <NotBuiltYet
        title="The model exists, the queue does not"
        body="RestaurantClaim already stores who claimed what, their work email and phone, and the review decision. It needs a submission form on the site and this queue to work through them."
        bullets={[
          "Pending claims, oldest first",
          "Approve, which creates the ownership link and unlocks their dashboard",
          "Reject with a note the claimant actually sees",
          "A record of who reviewed each one and when",
        ]}
      />
    </>
  );
}
