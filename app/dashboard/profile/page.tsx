import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { EmptyState } from "@/components/dashboard/primitives";

export const metadata: Metadata = { title: "Reviews" };

export default function ProfileReviewsPage() {
  return (
    <EmptyState
      icon={BookOpen}
      title="No reviews yet"
      body="Write about a place you have eaten at and it shows up here, credited to your username. Reviews are the backbone of your food map."
      action={{ label: "Find a restaurant", href: "/restaurants" }}
      tint="rose"
    />
  );
}
