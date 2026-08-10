import type { Metadata } from "next";

import { NotBuiltYet, PageHeader } from "@/components/dashboard/primitives";

export const metadata: Metadata = { title: "Moderation" };

export default function AdminModerationPage() {
  return (
    <>
      <PageHeader
        title="Moderation"
        description="Anything a member contributed that needs a second pair of eyes."
      />
      <NotBuiltYet
        title="Waiting on contributions"
        body="There is nothing to moderate until people can post reviews and photos. This queue ships with them, not before, so it is built against the real shape of the data."
        bullets={[
          "Photos waiting on approval before they appear publicly",
          "Reported reviews, with the reason given",
          "Edits an owner suggested to their own listing",
          "One place to approve, hide or remove",
        ]}
      />
    </>
  );
}
