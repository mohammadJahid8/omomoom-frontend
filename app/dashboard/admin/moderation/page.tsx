import type { Metadata } from "next";

import { PhotoModeration } from "@/components/dashboard/photo-moderation";
import { PageHeader } from "@/components/dashboard/primitives";

export const metadata: Metadata = { title: "Moderation" };

export default function AdminModerationPage() {
  return (
    <>
      <PageHeader
        title="Moderation"
        description="Photos from members, before they reach a restaurant's page. Owners publish their own without asking."
      />
      <PhotoModeration />
    </>
  );
}
