import type { Metadata } from "next";
import { MapPin } from "lucide-react";

import { EmptyState } from "@/components/dashboard/primitives";

export const metadata: Metadata = { title: "Places tried" };

export default function ProfileTriedPage() {
  return (
    <EmptyState
      icon={MapPin}
      title="Nowhere marked as tried"
      body="Mark a restaurant as tried, or write a review, and it lands here. Over time this becomes the map of where you have actually eaten."
      action={{ label: "Find a restaurant", href: "/restaurants" }}
      tint="olive"
    />
  );
}
