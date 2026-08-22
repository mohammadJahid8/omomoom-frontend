"use client";

import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";

import { StudioPhotosPanel } from "@/components/dashboard/studio-photos";
import { toFormError } from "@/lib/api/auth";
import { listStudioPhotos } from "@/lib/api/studio";
import type { StudioPhotos } from "@/types/studio";

/**
 * The same photo grid owners use, loaded on demand because the admin editor
 * has no server pass to fetch it in. Never locked: an admin is curating the
 * site, not paying for a listing.
 */
export function RestaurantPhotosEditor({
  restaurantId,
  slug,
}: {
  restaurantId: string;
  slug: string;
}) {
  const [photos, setPhotos] = useState<StudioPhotos | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    listStudioPhotos(restaurantId)
      .then((result) => alive && setPhotos(result))
      .catch((error: unknown) => alive && setFailed(toFormError(error).message));

    return () => {
      alive = false;
    };
  }, [restaurantId]);

  if (failed) {
    return (
      <p className="border-foreground/15 text-muted-foreground flex items-center gap-2.5 rounded-2xl border border-dashed p-5 text-sm">
        <TriangleAlert className="size-4 shrink-0" />
        Could not load the photos. {failed}
      </p>
    );
  }

  if (!photos) {
    return (
      <div className="bg-card ring-foreground/8 h-40 animate-pulse rounded-2xl ring-1" />
    );
  }

  return (
    <StudioPhotosPanel
      restaurantId={restaurantId}
      slug={slug}
      initial={photos}
      locked={false}
      unlimited
    />
  );
}
