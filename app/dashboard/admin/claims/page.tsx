import type { Metadata } from "next";

import { ClaimsDesk } from "@/components/dashboard/claims-desk";
import { PageHeader } from "@/components/dashboard/primitives";

export const metadata: Metadata = { title: "Claims" };

export default function AdminClaimsPage() {
  return (
    <>
      <PageHeader
        title="Claims"
        description="A code that arrives at the restaurant's own phone approves itself. This is everything a code could not settle."
      />
      <ClaimsDesk />
    </>
  );
}
