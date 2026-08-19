"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera, Clock, Loader2, Trash2, X } from "lucide-react";

import { EmptyState } from "@/components/dashboard/primitives";
import { ImageViewer } from "@/components/shared/image-viewer";
import { toFormError } from "@/lib/api/auth";
import { listMyPhotos, withdrawMyPhoto } from "@/lib/api/photos";
import { cn } from "@/lib/utils";
import type { MyPhoto } from "@/types/photo";

const STATE: Record<
  MyPhoto["status"],
  { label: string; className: string } | null
> = {
  APPROVED: null,
  PENDING: {
    label: "Waiting to be checked",
    className: "bg-tint-gold text-tint-gold-ink",
  },
  REJECTED: {
    label: "Not published",
    className: "bg-tint-clay text-tint-clay-ink",
  },
};

export function MyPhotos() {
  const [photos, setPhotos] = useState<MyPhoto[] | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);
  const [busy, start] = useTransition();

  useEffect(() => {
    let alive = true;

    listMyPhotos()
      .then((result) => alive && setPhotos(result.photos))
      .catch((error: unknown) => {
        if (!alive) return;
        setFailed(toFormError(error).message);
        setPhotos([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  const withdraw = (id: string) =>
    start(async () => {
      try {
        setPhotos((await withdrawMyPhoto(id)).photos);
        setFailed(null);
      } catch (error) {
        setFailed(toFormError(error).message);
      } finally {
        setConfirming(null);
      }
    });

  if (photos === null) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((n) => (
          <div key={n} className="bg-card aspect-4/3 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <EmptyState
        icon={Camera}
        title="No photos yet"
        body="Photos you add to a restaurant collect here, and stay credited to you wherever they appear on the site."
        action={{ label: "Find a restaurant", href: "/restaurants" }}
        tint="gold"
      />
    );
  }

  const visible = photos.filter((photo) => photo.status !== "REJECTED");

  return (
    <>
      {failed ? (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive mb-4 rounded-xl px-4 py-3 text-sm"
        >
          {failed}
        </p>
      ) : null}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => {
          const state = STATE[photo.status];
          const index = visible.indexOf(photo);

          return (
            <li key={photo.id} className="group relative">
              <div
                className={cn(
                  "bg-muted relative aspect-4/3 overflow-hidden rounded-2xl",
                  photo.status === "REJECTED" && "opacity-50",
                )}
              >
                {photo.status === "REJECTED" ? (
                  <div className="text-muted-foreground grid size-full place-items-center">
                    <X className="size-6" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setViewing(index)}
                    aria-label={`View your photo of ${photo.restaurant.name}`}
                    className="absolute inset-0 cursor-zoom-in"
                  >
                    <Image
                      src={photo.url}
                      alt={photo.caption ?? ""}
                      fill
                      sizes="(min-width: 640px) 30vw, 45vw"
                      className="object-cover"
                    />
                  </button>
                )}

                {confirming === photo.id ? (
                  <div className="absolute inset-0 grid place-content-center gap-2 bg-black/70 p-3 text-center">
                    <p className="text-xs font-semibold text-white">
                      Remove this photo?
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => withdraw(photo.id)}
                        disabled={busy}
                        className="bg-destructive rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
                      >
                        {busy ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          "Remove"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirming(null)}
                        className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold text-white"
                      >
                        Keep
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirming(photo.id)}
                    aria-label="Remove this photo"
                    className="absolute end-2 top-2 grid size-8 place-items-center rounded-lg bg-black/50 text-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>

              <Link
                href={`/restaurants/${photo.restaurant.slug}`}
                className="hover:text-brand-ink mt-2 block truncate text-sm font-semibold transition-colors"
              >
                {photo.restaurant.name}
              </Link>

              {state ? (
                <span
                  className={cn(
                    "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                    state.className,
                  )}
                >
                  {photo.status === "PENDING" ? (
                    <Clock className="size-3" />
                  ) : null}
                  {state.label}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      <ImageViewer
        images={visible}
        index={viewing}
        onIndexChange={setViewing}
        label="Your photos"
      />
    </>
  );
}
