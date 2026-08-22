import Link from "next/link";
import { BookOpen, Camera, Clock, Compass } from "lucide-react";

import { Panel, PanelTitle } from "@/components/dashboard/primitives";
import { formatMiami } from "@/lib/miami-time";
import { cn } from "@/lib/utils";
import type { RecommendationWithRestaurant } from "@/types/contribution";
import type { MyPhoto } from "@/types/photo";

type Entry = {
  id: string;
  at: string;
  icon: typeof BookOpen;
  tint: string;
  what: React.ReactNode;
  where: { slug: string; name: string };
  pending?: boolean;
};

/**
 * Reviews and photos are separate things everywhere else, but a person did
 * them in one order, so the feed merges them back into that order.
 */
function merge(
  reviews: RecommendationWithRestaurant[],
  photos: MyPhoto[],
): Entry[] {
  const entries: Entry[] = [
    ...reviews.map((review) => ({
      id: `r-${review.id}`,
      at: review.createdAt,
      icon: BookOpen,
      tint: "bg-tint-rose text-tint-rose-ink",
      what: (
        <>
          Recommended the{" "}
          <span className="text-foreground font-semibold">{review.dish}</span>
        </>
      ),
      where: review.restaurant,
    })),
    ...photos
      .filter((photo) => photo.status !== "REJECTED")
      .map((photo) => ({
        id: `p-${photo.id}`,
        at: photo.createdAt,
        icon: Camera,
        tint: "bg-tint-gold text-tint-gold-ink",
        what: <>Added a photo</>,
        where: photo.restaurant,
        pending: photo.status === "PENDING",
      })),
  ];

  return entries
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6);
}

export function ActivityFeed({
  reviews,
  photos,
}: {
  reviews: RecommendationWithRestaurant[];
  photos: MyPhoto[];
}) {
  const entries = merge(reviews, photos);

  return (
    <Panel>
      <PanelTitle
        title="Recently from you"
        description="What you have added, newest first."
      />

      {entries.length === 0 ? (
        <div className="border-border/70 rounded-2xl border border-dashed px-6 py-10 text-center">
          <Compass className="text-muted-foreground mx-auto size-6" />
          <p className="mt-3 text-sm font-semibold">Nothing yet</p>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm leading-relaxed">
            Tell people what to order somewhere you have eaten, and it shows up
            here and on your public profile.
          </p>
          <Link
            href="/restaurants"
            className="text-brand-ink mt-3 inline-block text-sm font-semibold hover:underline"
          >
            Find a restaurant
          </Link>
        </div>
      ) : (
        <ol className="grid gap-1">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/restaurants/${entry.where.slug}`}
                className="hover:bg-muted/70 flex items-center gap-3.5 rounded-2xl p-3 transition-colors"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    entry.tint,
                  )}
                >
                  <entry.icon className="size-4.5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm">
                    {entry.what} at{" "}
                    <span className="text-foreground font-semibold">
                      {entry.where.name}
                    </span>
                  </span>
                  <span className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                    {formatMiami(entry.at, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {entry.pending ? (
                      <>
                        <Clock className="size-3" />
                        Waiting to be checked
                      </>
                    ) : null}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
