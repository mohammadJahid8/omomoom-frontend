import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NotBuiltYet, PageHeader } from "@/components/dashboard/primitives";
import { requireSession } from "@/lib/auth/session";
import { isAdmin, isOwner } from "@/types/auth";

export const metadata: Metadata = { title: "Your restaurant" };

export default async function OwnerRestaurantPage() {
  const user = await requireSession("/dashboard/restaurant");
  if (!isOwner(user) && !isAdmin(user)) redirect("/dashboard");

  const count = user.ownedRestaurantIds.length;

  return (
    <>
      <PageHeader
        title="Your restaurant"
        description={
          count === 0
            ? "You do not have a claimed listing yet."
            : `${count} listing${count === 1 ? "" : "s"} under your control.`
        }
      />
      <NotBuiltYet
        title="Owner tools land after claims"
        body="Ownership is a relationship in the database, not a role, so one person can look after several restaurants and still be an ordinary member who writes reviews. The permission check already works; the screens it protects come next."
        bullets={[
          "Update hours, phone, website and description",
          "Upload photos, which go to the moderation queue",
          "Reply to reviews of your restaurant",
          "Switch between listings if you look after more than one",
        ]}
      />
    </>
  );
}
