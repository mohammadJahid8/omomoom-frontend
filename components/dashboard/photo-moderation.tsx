"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, ChevronLeft, ChevronRight, Inbox, Loader2, X } from "lucide-react";

import { EmptyState } from "@/components/dashboard/primitives";
import { ImageViewer } from "@/components/shared/image-viewer";
import { Button } from "@/components/ui/button";
import { toFormError } from "@/lib/api/auth";
import { decidePhoto, listPhotoQueue } from "@/lib/api/photos";
import { cn } from "@/lib/utils";
import type { ApiMeta } from "@/types/api";
import type { PhotoStatus, QueuePhoto } from "@/types/photo";

const TABS: { value: PhotoStatus; label: string }[] = [
  { value: "PENDING", label: "Waiting" },
  { value: "APPROVED", label: "Published" },
  { value: "REJECTED", label: "Rejected" },
];

const day = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(iso));

export function PhotoModeration() {
  const [status, setStatus] = useState<PhotoStatus>("PENDING");
  const [page, setPage] = useState(1);
  const [photos, setPhotos] = useState<QueuePhoto[] | null>(null);
  const [meta, setMeta] = useState<(ApiMeta & { pending: number }) | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [working, setWorking] = useState<string | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);
  const [reloads, setReloads] = useState(0);
  const [busy, start] = useTransition();

  useEffect(() => {
    let alive = true;

    listPhotoQueue({ status, page })
      .then((result) => {
        if (!alive) return;
        setPhotos(result.photos);
        setMeta(result.meta);
        setFailed(null);
      })
      .catch((error: unknown) => {
        if (!alive) return;
        setFailed(toFormError(error).message);
        setPhotos([]);
      });

    return () => {
      alive = false;
    };
  }, [status, page, reloads]);

  const decide = (id: string, action: "APPROVE" | "REJECT") =>
    start(async () => {
      setWorking(id);
      try {
        await decidePhoto(id, action);
        // Drop it from view straight away rather than waiting for the reload.
        setPhotos((list) => list?.filter((photo) => photo.id !== id) ?? null);
        setReloads((n) => n + 1);
        setFailed(null);
      } catch (error) {
        setFailed(toFormError(error).message);
      } finally {
        setWorking(null);
      }
    });

  return (
    <>
      <div className="bg-muted/60 mb-5 inline-flex gap-1 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            aria-pressed={status === tab.value}
            onClick={() => {
              setPage(1);
              setStatus(tab.value);
            }}
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
              status === tab.value
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {tab.value === "PENDING" && meta && meta.pending > 0 ? (
              <span className="bg-brand-ink text-brand-ink-foreground ms-2 rounded-full px-1.5 py-0.5 text-[11px] tabular-nums">
                {meta.pending}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {failed ? (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive mb-4 rounded-xl px-4 py-3 text-sm"
        >
          {failed}
        </p>
      ) : null}

      {photos === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((n) => (
            <div
              key={n}
              className="bg-card ring-foreground/8 h-72 animate-pulse rounded-2xl ring-1"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={
            status === "PENDING" ? "Nothing waiting on you" : "Nothing here"
          }
          body={
            status === "PENDING"
              ? "Photos from members appear here before they go on a restaurant's page. Owners publish their own without asking."
              : "No photos with this outcome yet."
          }
          tint="olive"
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <li
              key={photo.id}
              className="bg-card ring-foreground/8 overflow-hidden rounded-2xl ring-1"
            >
              <button
                type="button"
                onClick={() => setViewing(index)}
                aria-label="View full size"
                className="bg-muted relative block aspect-4/3 w-full cursor-zoom-in"
              >
                <Image
                  src={photo.url}
                  alt={photo.caption ?? ""}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                />
              </button>

              <div className="p-4">
                <Link
                  href={`/restaurants/${photo.restaurant.slug}`}
                  className="hover:text-brand-ink font-heading block truncate text-base font-bold transition-colors"
                >
                  {photo.restaurant.name}
                </Link>

                <p className="text-muted-foreground mt-1 truncate text-sm">
                  {photo.uploadedBy
                    ? `${photo.uploadedBy.name} (@${photo.uploadedBy.username})`
                    : "Account deleted"}
                  {photo.uploadedBy
                    ? `, joined ${day(photo.uploadedBy.createdAt)}`
                    : ""}
                </p>

                {photo.caption ? (
                  <p className="bg-muted/60 mt-2.5 rounded-xl px-3 py-2 text-sm leading-relaxed">
                    {photo.caption}
                  </p>
                ) : null}

                {status === "PENDING" ? (
                  <div className="mt-3 flex gap-2">
                    <Button
                      disabled={busy}
                      onClick={() => decide(photo.id, "APPROVE")}
                      className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-10 flex-1 rounded-xl font-semibold"
                    >
                      {busy && working === photo.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Check className="size-4" />
                      )}
                      Publish
                    </Button>
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => decide(photo.id, "REJECT")}
                      className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive h-10 rounded-xl px-4 font-semibold"
                    >
                      <X className="size-4" />
                      Reject
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-3 text-sm">
                    Added {day(photo.createdAt)}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ImageViewer
        images={photos ?? []}
        index={viewing}
        onIndexChange={setViewing}
        label="Photo under review"
      />

      {meta && meta.totalPages > 1 ? (
        <nav
          aria-label="Pages"
          className="mt-6 flex items-center justify-between gap-4"
        >
          <p className="text-muted-foreground text-sm">
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!meta.hasPrevPage}
              onClick={() => setPage((n) => Math.max(1, n - 1))}
              className="h-10 rounded-xl"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((n) => n + 1)}
              className="h-10 rounded-xl"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </nav>
      ) : null}
    </>
  );
}
