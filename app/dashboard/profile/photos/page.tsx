import type { Metadata } from "next";
import { Camera } from "lucide-react";

import { EmptyState } from "@/components/dashboard/primitives";

export const metadata: Metadata = { title: "Photos" };

export default function ProfilePhotosPage() {
  return (
    <EmptyState
      icon={Camera}
      title="No photos yet"
      body="Photos you add to a restaurant's page collect here, and stay credited to you wherever they appear on the site."
      action={{ label: "Find a restaurant", href: "/restaurants" }}
      tint="gold"
    />
  );
}
