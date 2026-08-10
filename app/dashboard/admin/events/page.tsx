import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { EventsManager } from "@/components/dashboard/events-manager";
import { PageHeader } from "@/components/dashboard/primitives";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Events" };

export default function AdminEventsPage() {
  return (
    <>
      <PageHeader
        title="Events"
        description="The community calendar on Asian Eats. Published events appear there in date order and drop off once they finish."
        action={
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-xl font-semibold"
          >
            <Link href="/asian-eats#discover" target="_blank">
              View the page
              <ExternalLink className="size-4" />
            </Link>
          </Button>
        }
      />

      <EventsManager />
    </>
  );
}
