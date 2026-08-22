"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Camera, Compass, MapPin, Sparkles, Star } from "lucide-react";

import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import { ImageViewer } from "@/components/shared/image-viewer";
import { cn } from "@/lib/utils";
import type { PublicProfile } from "@/types/profile";
import { formatMiami } from "@/lib/miami-time";

const when = (iso: string) =>
  formatMiami(iso, { month: "short", year: "numeric" });

/** All four lists arrive with the page; the tab lives in the URL so it is shareable. */
export function ProfileTabs({
  profile,
  tab,
}: {
  profile: PublicProfile;
  tab: string;
}) {
  const { user, counts } = profile;

  const tabs = [
    { key: "reviews", label: "Reviews", icon: BookOpen, count: counts.reviews },
    { key: "photos", label: "Photos", icon: Camera, count: counts.photos },
    {
      key: "tried",
      label: "Places tried",
      icon: MapPin,
      count: counts.placesTried,
    },
    {
      key: "want-to-try",
      label: "Want to try",
      icon: Compass,
      count: counts.wantToTry,
    },
  ];

  return (
    <>
      {/*
        The line lives on the wrapper, not on the scroller. A scroller clips in
        both axes, so an active underline drawn at its edge disappears until you
        happen to scroll.
      */}
      <div className="border-foreground/10 mt-8 border-b">
        <nav
          aria-label="What this person has shared"
          className="scrollbar-none -mb-px flex gap-1 overflow-x-auto"
        >
          {tabs.map((item) => {
            const active = tab === item.key;

            return (
              <Link
                key={item.key}
                href={`/u/${user.username}?tab=${item.key}`}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
                  active
                    ? "border-brand-ink text-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent",
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
                <span className="text-muted-foreground tabular-nums">
                  {item.count}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8">
        {tab === "photos" ? (
          <PhotoGrid profile={profile} />
        ) : tab === "tried" ? (
          <Cards
            items={profile.placesTried}
            empty={`${user.name} has not reviewed anywhere yet.`}
          />
        ) : tab === "want-to-try" ? (
          <Cards
            items={profile.wantToTry}
            empty={`${user.name} has not saved anywhere yet.`}
          />
        ) : (
          <Reviews profile={profile} />
        )}
      </div>
    </>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-foreground/15 text-muted-foreground rounded-2xl border border-dashed px-6 py-14 text-center text-sm">
      {children}
    </p>
  );
}

function Cards({
  items,
  empty,
}: {
  items: PublicProfile["placesTried"];
  empty: string;
}) {
  if (items.length === 0) return <Empty>{empty}</Empty>;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {items.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  );
}

/** Clamped at both ends: no slivers from panoramas, no runaway portraits. */
function ratioOf(photo: { width: number | null; height: number | null }) {
  if (!photo.width || !photo.height) return 4 / 3;
  return Math.min(Math.max(photo.width / photo.height, 0.62), 1.9);
}

function PhotoGrid({ profile }: { profile: PublicProfile }) {
  const [open, setOpen] = useState<number | null>(null);
  const { photos, user } = profile;

  if (photos.length === 0) {
    return <Empty>{user.name} has not had a photo published yet.</Empty>;
  }

  return (
    <>
      {/* Columns, not a grid, so each photo keeps its own proportions. */}
      <ul className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {photos.map((photo, index) => (
          <li key={photo.id} className="mb-3 break-inside-avoid">
            <button
              type="button"
              onClick={() => setOpen(index)}
              aria-label={`Open photo of ${photo.restaurant.name}`}
              style={{ aspectRatio: ratioOf(photo) }}
              className="group bg-muted focus-visible:ring-ring relative block w-full cursor-zoom-in overflow-hidden rounded-2xl outline-none focus-visible:ring-3"
            >
              <Image
                src={photo.url}
                alt={photo.caption ?? ""}
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-2.5 text-start text-xs font-semibold text-white">
                {photo.restaurant.name}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <ImageViewer
        images={photos.map((photo) => ({
          url: photo.url,
          caption: photo.caption ?? photo.restaurant.name,
        }))}
        index={open}
        onIndexChange={setOpen}
        label={`Photos by @${user.username}`}
      />
    </>
  );
}

function Reviews({ profile }: { profile: PublicProfile }) {
  const [open, setOpen] = useState<number | null>(null);
  const { reviews, user } = profile;

  if (reviews.length === 0) {
    return <Empty>{user.name} has not written a review yet.</Empty>;
  }

  // One flat list so the viewer walks every photo on the page, not just one card's.
  const all = reviews.flatMap((review) =>
    review.photos.map((photo) => ({
      url: photo.url,
      caption: photo.caption ?? `${review.dish} at ${review.restaurant.name}`,
    })),
  );

  // Where each review's photos begin in that flat list, worked out up front so
  // nothing is being counted while the list renders.
  const startAt = new Map<string, number>();
  let seen = 0;
  for (const review of reviews) {
    startAt.set(review.id, seen);
    seen += review.photos.length;
  }

  return (
    <>
      <ol className="grid gap-4">
        {reviews.map((review) => {
          const first = startAt.get(review.id) ?? 0;

          return (
            <li
              key={review.id}
              className="border-foreground/15 bg-card rounded-2xl border p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <Link
                  href={`/restaurants/${review.restaurant.slug}`}
                  className="font-heading hover:text-brand-ink text-lg font-bold transition-colors"
                >
                  {review.restaurant.name}
                </Link>
                <span className="text-muted-foreground text-sm">
                  {when(review.createdAt)}
                </span>
              </div>

              {review.restaurant.neighborhood ? (
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {review.restaurant.neighborhood.name}
                </p>
              ) : null}

              <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-base font-semibold">
                {review.dish}
                <span className="text-brand-ink inline-flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={cn(
                        "size-3.5",
                        index < review.rating
                          ? "fill-current"
                          : "text-foreground/15 fill-current",
                      )}
                    />
                  ))}
                </span>
              </p>

              {review.comment ? (
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {review.comment}
                </p>
              ) : null}

              {review.aiSummary ? (
                <p className="text-muted-foreground/90 mt-2.5 flex items-start gap-1.5 text-sm italic">
                  <Sparkles
                    className="text-brand mt-0.5 size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  {review.aiSummary}
                </p>
              ) : null}

              {review.photos.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {review.photos.map((photo, index) => (
                    <li key={photo.id}>
                      <button
                        type="button"
                        onClick={() => setOpen(first + index)}
                        aria-label={`Open photo of ${review.dish}`}
                        className="bg-muted focus-visible:ring-ring relative block size-20 cursor-zoom-in overflow-hidden rounded-xl outline-none focus-visible:ring-3 sm:size-24"
                      >
                        <Image
                          src={photo.url}
                          alt={photo.caption ?? ""}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {review.visitScore !== null ? (
                <p className="bg-tint-rose text-tint-rose-ink mt-3.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs">
                  <span className="font-semibold">Omomoom score</span>
                  <span className="font-bold tabular-nums">
                    {review.visitScore.toFixed(1)}/5
                  </span>
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <ImageViewer
        images={all}
        index={open}
        onIndexChange={setOpen}
        label={`Photos by @${user.username}`}
      />
    </>
  );
}
