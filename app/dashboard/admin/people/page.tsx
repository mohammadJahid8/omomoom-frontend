import type { Metadata } from "next";

import { NotBuiltYet, PageHeader } from "@/components/dashboard/primitives";

export const metadata: Metadata = { title: "People" };

export default function AdminPeoplePage() {
  return (
    <>
      <PageHeader
        title="People"
        description="Everyone with an Omomoom account, and what they can do."
      />
      <NotBuiltYet
        title="Needs admin user endpoints"
        body="The accounts, roles and sessions all exist in the database already. What is missing is the admin-only API to read and change them."
        bullets={[
          "List and search every account",
          "Promote a member to admin, or step one back down",
          "Disable an account without deleting what they contributed",
          "End every session for a person, immediately",
        ]}
      />
    </>
  );
}
