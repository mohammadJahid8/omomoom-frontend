import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Construction } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getRestaurantBySlug } from "@/lib/api/restaurants";
import { CLAIM_PERIOD, CLAIM_PRICE } from "@/lib/claim";

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

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto w-full max-w-lg">
        <Link
          href={`/claim/${slug}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Link>

        <div className="border-foreground/15 mt-6 rounded-2xl border border-dashed p-6 text-center sm:p-8">
          <span className="bg-tint-gold text-tint-gold-ink mx-auto flex size-12 items-center justify-center rounded-2xl">
            <Construction className="size-5.5" aria-hidden="true" />
          </span>

          <h1 className="font-heading mt-5 text-xl font-extrabold">
            Subscription is being built
          </h1>
          <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-relaxed">
            You are verified as managing {restaurant.name}. Taking the{" "}
            {CLAIM_PRICE} a {CLAIM_PERIOD} payment, and the Studio it unlocks,
            land in the next release. Nothing has been charged.
          </p>

          <Button
            asChild
            variant="outline"
            className="border-foreground/25 hover:border-foreground mt-6 h-11 rounded-xl font-semibold"
          >
            <Link href={`/restaurants/${slug}`}>View the listing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
