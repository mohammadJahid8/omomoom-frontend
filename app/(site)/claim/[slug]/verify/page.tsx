import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ClaimVerify } from "@/components/claim/claim-verify";
import { getRestaurantBySlug } from "@/lib/api/restaurants";
import { getMyClaim } from "@/lib/auth/claims";
import { resolveStep } from "@/lib/claim-steps";

export const metadata: Metadata = {
  title: "Verify your connection",
  robots: { index: false, follow: false },
};

const HEADINGS: Record<string, { title: string; blurb: string }> = {
  details: {
    title: "Claim",
    blurb:
      "Two quick steps: tell us your role, then confirm you can reach the restaurant. Nothing is charged until both are done.",
  },
  method: {
    title: "Claim",
    blurb: "Pick how you would like us to confirm the connection.",
  },
  code: {
    title: "Claim",
    blurb: "Last step. Enter the code we sent.",
  },
  manual: {
    title: "Claim",
    blurb: "Tell us how you are connected and we will take it from there.",
  },
  review: { title: "Claim", blurb: "" },
  done: { title: "Claim", blurb: "" },
};

export default async function ClaimVerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const restaurant = await getRestaurantBySlug(slug, { fresh: true });

  if (!restaurant) notFound();

  const { claim, options } = await getMyClaim(restaurant.id);

  // Someone else got there first. An owner mid-flow keeps their own claim.
  if (restaurant.claimState === "CLAIMED" && claim?.status !== "APPROVED") {
    redirect(`/claim/${slug}`);
  }

  const step = resolveStep(query.step, claim);
  const copy = HEADINGS[step] ?? HEADINGS.details!;

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
          {copy.title} {restaurant.name}
        </h1>
        {copy.blurb ? (
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {copy.blurb}
          </p>
        ) : null}

        <div className="mt-7">
          <ClaimVerify
            step={step}
            claim={claim}
            options={options}
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
            restaurantSlug={restaurant.slug}
          />
        </div>
      </div>
    </div>
  );
}
