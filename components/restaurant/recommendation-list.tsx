"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageViewer } from "@/components/shared/image-viewer";
import { cn } from "@/lib/utils";
import type { OrderAgain, Recommendation } from "@/types/contribution";

const AGAIN_LABEL: Record<OrderAgain, string> = {
  DEFINITELY: "Would order again",
  MAYBE: "Might order again",
  NO: "Would not order again",
};

const AGAIN_TONE: Record<OrderAgain, string> = {
  DEFINITELY: "bg-tint-olive text-tint-olive-ink",
  MAYBE: "bg-tint-gold text-tint-gold-ink",
  NO: "bg-muted text-muted-foreground",
};

function aspectsOf(item: Recommendation): [string, number][] {
  return (
    [
      ["Taste", item.taste],
      ["Service", item.service],
      ["Value", item.value],
      ["Ambience", item.ambience],
      ["Hygiene", item.hygiene],
    ] as [string, number | null][]
  ).filter((entry): entry is [string, number] => entry[1] !== null);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function when(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(iso));
}

export function Stars({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex gap-0.5", className)}
      aria-label={`${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          aria-hidden="true"
          className={cn(
            "size-3.5",
            value <= rating
              ? "text-brand-ink fill-current"
              : "text-border-strong",
          )}
        />
      ))}
    </span>
  );
}

export function RecommendationList({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  if (recommendations.length === 0) {
    return (
      <p className="border-foreground/15 text-muted-foreground rounded-2xl border border-dashed p-6 text-sm leading-relaxed">
        Nobody has said what to order here yet. Be the first, it is the
        most useful thing you can leave for the next person.
      </p>
    );
  }

  return (
    <ol className="grid gap-3">
      {recommendations.map((item) => (
        <li
          key={item.id}
          className="border-foreground/15 bg-card rounded-2xl border p-5"
        >
          <div className="flex items-start gap-3.5">
            <Avatar className="size-10 shrink-0">
              {item.user.avatarUrl ? (
                <AvatarImage src={item.user.avatarUrl} alt="" />
              ) : null}
              <AvatarFallback className="bg-tint-rose text-tint-rose-ink text-xs font-bold">
                {initials(item.user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <Link
                  href={`/u/${item.user.username}`}
                  className="hover:text-brand-ink text-sm font-semibold transition-colors"
                >
                  @{item.user.username}
                </Link>
                <span className="text-muted-foreground text-xs">
                  {when(item.createdAt)}
                </span>
              </div>

              <p className="font-heading mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-base font-bold">
                {item.dish}
                <Stars rating={item.rating} />
                {item.wouldOrderAgain ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      AGAIN_TONE[item.wouldOrderAgain],
                    )}
                  >
                    {AGAIN_LABEL[item.wouldOrderAgain]}
                  </span>
                ) : null}
              </p>

              {item.comment ? (
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {item.comment}
                </p>
              ) : null}

              {item.aiSummary ? (
                <p className="text-muted-foreground/90 mt-2.5 flex items-start gap-1.5 text-sm italic">
                  <Sparkles
                    className="text-brand mt-0.5 size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  {item.aiSummary}
                </p>
              ) : null}

              {item.photos.length > 0 ? (
                <ReviewGallery photos={item.photos} who={item.user.username} />
              ) : null}

              {aspectsOf(item).length > 0 ? (
                <dl className="text-muted-foreground mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                  {item.visitScore !== null ? (
                    <div className="bg-tint-rose text-tint-rose-ink flex items-center gap-1.5 rounded-full px-2.5 py-1">
                      <dt className="font-semibold">Score</dt>
                      <dd className="font-bold tabular-nums">
                        {item.visitScore.toFixed(1)}/5
                      </dd>
                    </div>
                  ) : null}
                  {aspectsOf(item).map(([label, score]) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <dt>{label}</dt>
                      <dd className="text-foreground font-semibold tabular-nums">
                        {score}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** The photos someone took on the visit, sitting with what they wrote. */
function ReviewGallery({
  photos,
  who,
}: {
  photos: { id: string; url: string; caption: string | null }[];
  who: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  // A review is mostly its words. However many photos come with it, the card
  // shows a handful and the rest live one click away.
  const SHOWN = 5;
  const visible = photos.slice(0, SHOWN);
  const hidden = photos.length - visible.length;

  return (
    <>
      <ul className="mt-3 flex flex-wrap gap-2">
        {visible.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setOpen(index)}
              aria-label={`Open photo ${index + 1} from @${who}`}
              className="bg-muted focus-visible:ring-ring relative block size-20 cursor-zoom-in overflow-hidden rounded-xl outline-none focus-visible:ring-3 sm:size-24"
            >
              <Image
                src={photo.url}
                alt={photo.caption ?? ""}
                fill
                sizes="96px"
                className="object-cover transition-transform duration-300 hover:scale-105"
              />

              {hidden > 0 && index === SHOWN - 1 ? (
                <span className="absolute inset-0 grid place-items-center bg-black/60 text-sm font-bold text-white">
                  +{hidden}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      <ImageViewer
        images={photos}
        index={open}
        onIndexChange={setOpen}
        label={`Photos from @${who}`}
      />
    </>
  );
}
