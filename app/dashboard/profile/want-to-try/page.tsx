import type { Metadata } from "next";
import { Compass } from "lucide-react";

import { EmptyState } from "@/components/dashboard/primitives";

export const metadata: Metadata = { title: "Want to try" };

export default function ProfileWantToTryPage() {
  return (
    <EmptyState
      icon={Compass}
      title="Nothing saved yet"
      body="Save a restaurant while you are browsing and it waits here until you get round to going. This is your shortlist."
      action={{ label: "Browse restaurants", href: "/restaurants" }}
      tint="clay"
    />
  );
}
