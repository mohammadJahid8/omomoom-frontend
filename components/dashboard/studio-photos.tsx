"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
} from "lucide-react";

import { ImageViewer } from "@/components/shared/image-viewer";
import { Button } from "@/components/ui/button";
import { refreshRestaurant } from "@/lib/actions/restaurants";
import { toFormError } from "@/lib/api/auth";
import {
  addStudioPhoto,
  deleteStudioPhoto,
  makeStudioCover,
  reorderStudioPhotos,
} from "@/lib/api/studio";
import { imageSize, inBatches, uploadImage } from "@/lib/api/uploads";
import {
  PhotoStage,
  stagePhotos,
  type StagedPhoto,
} from "@/components/dashboard/photo-stage";
import { cn } from "@/lib/utils";
import type { StudioPhoto, StudioPhotos } from "@/types/studio";

const UPLOADS_AT_ONCE = 3;

export function StudioPhotosPanel({
  restaurantId,
  slug,
  initial,
  locked,
  unlimited = false,
}: {
  restaurantId: string;
  slug: string;
  initial: StudioPhotos;
  locked: boolean;
  /** Admins are curating the catalogue, not filling one listing's allowance. */
  unlimited?: boolean;
}) {
  const router = useRouter();

  const [photos, setPhotos] = useState<StudioPhoto[]>(initial.photos);
  const [staged, setStaged] = useState<StagedPhoto[]>([]);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [dropping, setDropping] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);

  const max = unlimited ? Number.POSITIVE_INFINITY : initial.max;
  const room = max - photos.length - staged.length;

  const settle = (next: StudioPhotos) => {
    setPhotos(next.photos);
    void refreshRestaurant(slug);
    router.refresh();
  };

  /** Nothing has left the browser until this runs. */
  const save = async () => {
    setSaving(true);
    setFailed(null);

    const added: StudioPhoto[] = [];
    let firstProblem: string | null = null;

    await inBatches(staged, UPLOADS_AT_ONCE, async (item) => {
      try {
        const { key } = await uploadImage(
          item.file,
          "RESTAURANT_PHOTO",
          restaurantId,
        );
        const size = await imageSize(item.file);
        added.push(await addStudioPhoto(restaurantId, { key, ...size }));
      } catch (error) {
        firstProblem ??= toFormError(error).message;
      }
    });

    setPhotos((list) => [...list, ...added]);
    setStaged([]);
    setFailed(firstProblem);
    setSaving(false);
    void refreshRestaurant(slug);
    router.refresh();
  };

  const act = async (id: string, work: () => Promise<StudioPhotos>) => {
    setBusy(id);
    setFailed(null);
    try {
      settle(await work());
    } catch (error) {
      setFailed(toFormError(error).message);
      setPhotos(initial.photos);
    } finally {
      setBusy(null);
      setConfirming(null);
    }
  };

  const move = (id: string, by: number) => {
    const from = photos.findIndex((photo) => photo.id === id);
    const to = from + by;
    if (from < 0 || to < 0 || to >= photos.length) return;

    const next = [...photos];
    const [moved] = next.splice(from, 1);
    if (moved) next.splice(to, 0, moved);

    setPhotos(next);
    void act(id, () =>
      reorderStudioPhotos(
        restaurantId,
        next.map((photo) => photo.id),
      ),
    );
  };

  const drop = (targetId: string) => {
    if (!dragging || dragging === targetId) return;
    const from = photos.findIndex((photo) => photo.id === dragging);
    const to = photos.findIndex((photo) => photo.id === targetId);
    if (from < 0 || to < 0) return;
    move(dragging, to - from);
  };

  return (
    <section className="border-foreground/15 bg-card overflow-hidden rounded-2xl border">
      <div className="flex flex-wrap items-center gap-3.5 p-4 sm:p-5">
        <span className="bg-tint-gold text-tint-gold-ink flex size-10 shrink-0 items-center justify-center rounded-2xl">
          <ImagePlus className="size-5" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">Photos</h3>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {photos.length === 0
              ? "None yet. The first one becomes your cover."
              : unlimited
                ? `${photos.length}. The cover is what people see on every card.`
                : `${photos.length} of ${max}. The cover is what people see on every card.`}
          </p>
          {initial.fromGuests > 0 ? (
            <p className="text-muted-foreground mt-0.5 text-sm">
              {initial.fromGuests} more from guests are on your page. Those are
              theirs, not yours to edit.
            </p>
          ) : null}
        </div>

      </div>

      {failed ? (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive mx-4 mb-4 rounded-xl px-3.5 py-3 text-sm sm:mx-5"
        >
          {failed}
        </p>
      ) : null}

      <div
        onDragOver={(event) => {
          if (locked || dragging) return;
          event.preventDefault();
          setDropping(true);
        }}
        onDragLeave={() => setDropping(false)}
        onDrop={(event) => {
          if (locked || dragging) return;
          event.preventDefault();
          setDropping(false);
          const dropped = Array.from(event.dataTransfer.files);
          if (dropped.length === 0) return;
          const { staged: next, rejected } = stagePhotos(dropped, room);
          setFailed(rejected.length > 0 ? rejected.join(" ") : null);
          if (next.length > 0) setStaged((list) => [...list, ...next]);
        }}
        className={cn(
          "border-foreground/15 border-t p-4 transition-colors sm:p-5",
          dropping && "bg-tint-gold/40",
        )}
      >
        {photos.length === 0 ? (
          <p className="border-border/70 text-muted-foreground rounded-2xl border border-dashed px-6 py-10 text-center text-sm">
            No photos yet. Choose some below, then save.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo, index) => (
              <li
                key={photo.id}
                draggable={!locked}
                onDragStart={() => setDragging(photo.id)}
                onDragEnd={() => {
                  setDragging(null);
                  setOver(null);
                }}
                onDragOver={(event) => {
                  if (!dragging) return;
                  event.preventDefault();
                  setOver(photo.id);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  drop(photo.id);
                  setDragging(null);
                  setOver(null);
                }}
                className={cn(
                  "group bg-muted relative aspect-4/3 overflow-hidden rounded-xl",
                  !locked && "cursor-grab",
                  dragging === photo.id && "opacity-40",
                  over === photo.id &&
                    dragging !== photo.id &&
                    "ring-brand-ink ring-2",
                )}
              >
                <button
                  type="button"
                  onClick={() => setViewing(index)}
                  aria-label={`View photo ${index + 1} full size`}
                  className="absolute inset-0 cursor-zoom-in"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.caption ?? ""}
                    loading="lazy"
                    draggable={false}
                    className="size-full object-cover"
                  />
                </button>

                {photo.isCover ? (
                  <span className="bg-brand-ink text-brand-ink-foreground absolute start-2 top-2 rounded-full px-2 py-1 text-[11px] font-bold">
                    Cover
                  </span>
                ) : null}

                {busy === photo.id ? (
                  <span className="absolute inset-0 grid place-items-center bg-black/40">
                    <Loader2 className="size-5 animate-spin text-white" />
                  </span>
                ) : null}

                {confirming === photo.id ? (
                  <div className="absolute inset-0 grid place-content-center gap-2 bg-black/70 p-3 text-center">
                    <p className="text-xs font-semibold text-white">
                      Delete this photo?
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          act(photo.id, () =>
                            deleteStudioPhoto(restaurantId, photo.id),
                          )
                        }
                        className="bg-destructive rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
                      >
                        Delete
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
                ) : locked ? null : (
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-linear-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                    <div className="flex gap-1">
                      <TileButton
                        label="Move earlier"
                        disabled={index === 0 || Boolean(busy)}
                        onClick={() => move(photo.id, -1)}
                      >
                        <ArrowLeft className="size-3.5" />
                      </TileButton>
                      <TileButton
                        label="Move later"
                        disabled={index === photos.length - 1 || Boolean(busy)}
                        onClick={() => move(photo.id, 1)}
                      >
                        <ArrowRight className="size-3.5" />
                      </TileButton>
                    </div>

                    <div className="flex gap-1">
                      {photo.isCover ? null : (
                        <TileButton
                          label="Make this the cover"
                          disabled={Boolean(busy)}
                          onClick={() =>
                            act(photo.id, () =>
                              makeStudioCover(restaurantId, photo.id),
                            )
                          }
                        >
                          <Star className="size-3.5" />
                        </TileButton>
                      )}
                      <TileButton
                        label="Delete this photo"
                        disabled={Boolean(busy)}
                        onClick={() => setConfirming(photo.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </TileButton>
                    </div>
                  </div>
                )}
              </li>
            ))}

          </ul>
        )}

        {locked ? null : (
          <div className="border-foreground/10 mt-5 border-t pt-5">
            <PhotoStage
              photos={staged}
              onChange={setStaged}
              room={room + staged.length}
              busy={saving}
              onProblem={setFailed}
              label="Add photos"
            />

            {staged.length > 0 ? (
              <Button
                type="button"
                disabled={saving}
                onClick={() => void save()}
                className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 mt-3 h-10 rounded-xl px-4 font-semibold"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                {saving
                  ? "Saving"
                  : `Save ${staged.length} photo${staged.length === 1 ? "" : "s"}`}
              </Button>
            ) : null}
          </div>
        )}

        <ImageViewer
          images={photos}
          index={viewing}
          onIndexChange={setViewing}
          label="Your photos"
        />

        {photos.length > 1 && !locked ? (
          <p className="text-muted-foreground mt-3 text-xs">
            Drag a photo to reorder, or use the arrows. Ordering does not set
            the cover, so pick that with the star.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function TileButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-7 place-items-center rounded-lg bg-white/25 text-white backdrop-blur-sm transition-colors hover:bg-white/40 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
