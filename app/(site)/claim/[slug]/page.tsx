import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  MapPin,
  MessageSquare,
  PencilLine,
  UtensilsCrossed,
} from "lucide-react";

import { ListingAudit } from "@/components/claim/listing-audit";
import { RestaurantImage } from "@/components/restaurant/restaurant-image";
import { Button } from "@/components/ui/button";
import { getRestaurantBySlug } from "@/lib/api/restaurants";
import {
  CLAIM_PERIOD,
  CLAIM_PRICE,
  COMMUNITY_CONTROLS,
  listingGaps,
} from "@/lib/claim";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug, { fresh: true });

  if (!restaurant) return { title: "Claim your restaurant" };

  return {
    title: `Claim ${restaurant.name}`,
    description: `Take control of ${restaurant.name} on Omomoom. Keep your hours, menu and photos accurate.`,
    alternates: { canonical: `/claim/${slug}` },
    robots: { index: false, follow: true },
  };
}

const OUTCOMES = [
  {
    icon: PencilLine,
    title: "Correct what's wrong",
    body: "Hours, phone, menu and reservation links, updated by you the moment they change.",
    tint: "bg-tint-rose text-tint-rose-ink",
  },
  {
    icon: UtensilsCrossed,
    title: "Show what you're proud of",
    body: "Your signature dishes, your story, and photos of the food as you plate it.",
    tint: "bg-tint-gold text-tint-gold-ink",
  },
  {
    icon: MessageSquare,
    title: "Answer what guests ask",
    body: "Parking, accessibility, dress code and private dining, before they call to ask.",
    tint: "bg-tint-olive text-tint-olive-ink",
  },
];

export default async function ClaimRestaurantPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug, { fresh: true });

  if (!restaurant) notFound();

  const gaps = listingGaps(restaurant);
  const place = restaurant.neighborhood ?? restaurant.municipality;
  const claimed = restaurant.claimState === "CLAIMED";

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/claim"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All restaurants
        </Link>

        <div className="mt-6 flex items-start gap-4">
          <div className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-2xl sm:size-24">
            <RestaurantImage
              src={restaurant.imageUrl}
              priority
              sizes="96px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-2xl leading-tight font-extrabold sm:text-3xl">
              {restaurant.name}
            </h1>
            <p className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {restaurant.cuisine ? <span>{restaurant.cuisine}</span> : null}
              {place ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {place}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        {claimed ? (
          <div className="border-foreground/15 mt-8 rounded-2xl border border-dashed p-5">
            <h2 className="font-heading text-base font-bold">
              This listing is already claimed
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
              Someone has already verified their connection to{" "}
              {restaurant.name}, so it is not open to claim.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8">
              <ListingAudit gaps={gaps} />
            </div>

            <div className="mt-8">
              <h2 className="font-heading text-xl font-extrabold sm:text-2xl">
                What claiming gives you
              </h2>

              <ul className="mt-5 grid gap-3">
                {OUTCOMES.map(({ icon: Icon, title, body, tint }) => (
                  <li
                    key={title}
                    className="border-foreground/15 bg-card flex items-start gap-3.5 rounded-2xl border p-4 sm:p-5"
                  >
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${tint}`}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {title}
                      </span>
                      <span className="text-muted-foreground mt-1 block text-sm leading-relaxed">
                        {body}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-foreground/15 bg-surface mt-8 rounded-2xl border p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-heading text-3xl font-extrabold">
                  {CLAIM_PRICE}
                </span>
                <span className="text-muted-foreground text-sm">
                  per {CLAIM_PERIOD}, cancel any time
                </span>
              </div>

              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                We verify you are connected to {restaurant.name} first. Nothing
                is charged until that is done, and your listing stays on
                Omomoom whether you subscribe or not.
              </p>

              <Button
                asChild
                className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 mt-5 h-12 w-full rounded-xl text-[0.95rem] font-semibold sm:w-auto sm:px-7"
              >
                <Link href={`/claim/${slug}/verify`}>
                  Claim {restaurant.name}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </>
        )}

        <div className="border-foreground/15 mt-8 rounded-2xl border p-5 sm:p-6">
          <h2 className="font-heading flex items-center gap-2 text-base font-bold">
            <Lock className="text-muted-foreground size-4.5" aria-hidden="true" />
            What you cannot change
          </h2>
          <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
            Claiming gives you the restaurant&rsquo;s own information. It never
            touches what diners say.
          </p>

          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {COMMUNITY_CONTROLS.map((item) => (
              <li
                key={item}
                className="text-muted-foreground flex gap-2.5 text-sm"
              >
                <span
                  className="bg-border-strong mt-2 size-1.5 shrink-0 rounded-full"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-muted-foreground mt-6 flex items-start gap-2 text-sm">
          <CheckCircle2 className="text-brand-ink mt-0.5 size-4 shrink-0" />
          Verification usually takes a minute. We send a code to the phone or
          email already on this listing.
        </p>
      </div>
    </div>
  );
}
