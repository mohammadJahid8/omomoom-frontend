import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Lock,
  MessageSquareQuote,
  Star,
  Store,
} from "lucide-react";

import { StudioPhotosPanel } from "@/components/dashboard/studio-photos";
import { StudioSections } from "@/components/dashboard/studio-sections";
import {
  EmptyState,
  PageHeader,
  Panel,
  PanelTitle,
} from "@/components/dashboard/primitives";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import {
  currentRestaurantId,
  getStudioFor,
  getStudioPhotosFor,
} from "@/lib/auth/studio";
import { isAdmin, isOwner } from "@/types/auth";

export const metadata: Metadata = { title: "Your restaurant" };

const renews = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "America/New_York",
      }).format(new Date(iso))
    : null;

export default async function OwnerRestaurantPage() {
  const user = await requireSession("/dashboard/restaurant");
  if (!isOwner(user) && !isAdmin(user)) redirect("/dashboard");

  const restaurantId = currentRestaurantId(user.ownedRestaurantIds);

  if (!restaurantId) {
    return (
      <>
        <PageHeader title="Your restaurant" />
        <EmptyState
          icon={Store}
          title="No listing under your control yet"
          body="Claiming proves you are connected to the restaurant. Once that is done this page becomes the place you keep its hours, links and story right."
          action={{ label: "Claim your restaurant", href: "/claim" }}
        />
      </>
    );
  }

  const [listing, gallery] = await Promise.all([
    getStudioFor(restaurantId),
    getStudioPhotosFor(restaurantId),
  ]);

  if (!listing) {
    return (
      <>
        <PageHeader title="Your restaurant" />
        <EmptyState
          icon={Store}
          title="We could not load your listing"
          body="Your ownership is recorded, but the listing did not come back. Refresh the page, and tell us if it keeps happening."
          tint="clay"
        />
      </>
    );
  }

  const locked = !listing.subscriptionActive;

  return (
    <>
      <PageHeader
        title={listing.name}
        description={
          [listing.neighborhood?.name, listing.subCuisine]
            .filter(Boolean)
            .join(" · ") || undefined
        }
        action={
          <Button
            asChild
            variant="outline"
            className="border-foreground/25 hover:border-foreground h-11 rounded-xl px-4 font-semibold"
          >
            <Link href={`/restaurants/${listing.slug}`}>
              View public page
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        }
      />

      {locked ? (
        <div className="border-foreground/15 bg-card mb-4 flex flex-wrap items-center gap-4 rounded-2xl border p-4 sm:p-5">
          <span className="bg-tint-gold text-tint-gold-ink flex size-11 shrink-0 items-center justify-center rounded-2xl">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {listing.claimState === "CLAIMED"
                ? "Your subscription is not running"
                : "Finish claiming to unlock editing"}
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
              You can see everything below, but nothing saves until the
              subscription is active. $49 a month, cancel any time.
            </p>
          </div>
          <Button
            asChild
            className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-11 rounded-xl px-5 font-semibold"
          >
            <Link href={`/claim/${listing.slug}/subscribe`}>
              {listing.claimState === "CLAIMED" ? "Restart" : "Continue"}
            </Link>
          </Button>
        </div>
      ) : listing.subscriptionStatus === "CANCELLED" ? (
        <p className="bg-tint-gold text-tint-gold-ink mb-4 rounded-2xl px-4 py-3 text-sm leading-relaxed">
          Cancelled. You keep editing until {renews(listing.subscribedUntil)},
          and the listing stays on Omomoom either way.
        </p>
      ) : null}

      <StudioSections listing={listing} locked={locked} />

      <div className="mt-3">
        <StudioPhotosPanel
          restaurantId={listing.id}
          slug={listing.slug}
          initial={gallery}
          locked={locked}
        />
      </div>

      <div className="mt-4">
        <Panel>
          <PanelTitle
            title="What you cannot change"
            description="Restaurant information is yours. Community opinion is not."
          />
          <ul className="grid gap-3">
            {[
              {
                icon: Star,
                text: `Your ${listing.ratingAverage.toFixed(1)} rating and where you sit in the rankings`,
              },
              {
                icon: MessageSquareQuote,
                text: `The ${listing._count.recommendations} review${listing._count.recommendations === 1 ? "" : "s"} guests have written`,
              },
              {
                icon: Store,
                text: "Your name and neighbourhood, so ask us if either is wrong",
              },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3 text-sm leading-relaxed">
                <Icon
                  className="text-muted-foreground mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                {text}
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            Nobody can pay to have a review removed. If one breaks the rules,
            email us and a person will read it.
          </p>
        </Panel>
      </div>
    </>
  );
}
