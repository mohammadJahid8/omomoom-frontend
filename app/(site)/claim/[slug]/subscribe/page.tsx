import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";

import { SubscribePanel } from "@/components/claim/subscribe-panel";
import { Button } from "@/components/ui/button";
import { getRestaurantBySlug } from "@/lib/api/restaurants";
import { getSubscriptionFor } from "@/lib/auth/subscription";

export const metadata: Metadata = {
  title: "Subscribe",
  robots: { index: false, follow: false },
};

export default async function ClaimSubscribePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug, { fresh: true });

  if (!restaurant) notFound();

  const subscription = await getSubscriptionFor(restaurant.id);

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto w-full max-w-lg">
        <Link
          href={`/claim/${slug}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Link>

        <h1 className="font-heading mt-6 text-3xl leading-tight font-extrabold">
          {restaurant.name}
        </h1>

        <div className="mt-7">
          {subscription ? (
            <SubscribePanel subscription={subscription} />
          ) : (
            <div className="border-foreground/15 rounded-2xl border border-dashed p-6 text-center">
              <span className="bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-2xl">
                <Lock className="size-5.5" aria-hidden="true" />
              </span>
              <h2 className="font-heading mt-5 text-lg font-bold">
                Verify first
              </h2>
              <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-relaxed">
                Confirm your connection to {restaurant.name} before subscribing.
                Nothing is charged until that is done.
              </p>
              <Button
                asChild
                className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 mt-5 h-11 rounded-xl px-5 font-semibold"
              >
                <Link href={`/claim/${slug}/verify`}>Verify your connection</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
