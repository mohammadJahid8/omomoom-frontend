"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  RotateCcw,
  Star,
  Trash2,
  X,
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
import {
  checkImage,
  IMAGE_ACCEPT,
  imageSize,
  inBatches,
  MAX_IMAGE_LABEL,
  uploadImage,
} from "@/lib/api/uploads";
import { cn } from "@/lib/utils";
import type { StudioPhoto, StudioPhotos } from "@/types/studio";

/** An upload in flight. Keeps its key so a retry never re-sends the bytes. */
type Pending = {
  id: string;
  preview: string;
  file: File;
  key?: string;
  error?: string;
};

const UPLOADS_AT_ONCE = 3;

export function StudioPhotosPanel({
  restaurantId,
  slug,
  initial,
  locked,
}: {
  restaurantId: string;
  slug: string;
  initial: StudioPhotos;
  locked: boolean;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<StudioPhoto[]>(initial.photos);
  const [pending, setPending] = useState<Pending[]>([]);
  const [failed, setFailed] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [dropping, setDropping] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);

  const max = initial.max;
  const room = max - photos.length - pending.length;

  // Previews are object URLs. They must outlive every render but not the
  // component, so the list is mirrored into a ref and released on unmount.
  const live = useRef<Pending[]>([]);

  useEffect(() => {
    live.current = pending;
  }, [pending]);

  useEffect(
    () => () => {
      live.current.forEach((item) => URL.revokeObjectURL(item.preview));
    },
    [],
  );

  const settle = (next: StudioPhotos) => {
    setPhotos(next.photos);
    void refreshRestaurant(slug);
    router.refresh();
  };

  async function send(item: Pending) {
    try {
      const key =
        item.key ??
        (await uploadImage(item.file, "RESTAURANT_PHOTO", restaurantId)).key;

      setPending((list) =>
        list.map((one) => (one.id === item.id ? { ...one, key } : one)),
      );

      const size = await imageSize(item.file);
      const photo = await addStudioPhoto(restaurantId, { key, ...size });

      setPhotos((list) => [...list, photo]);
      setPending((list) => list.filter((one) => one.id !== item.id));
      URL.revokeObjectURL(item.preview);
      void refreshRestaurant(slug);
      router.refresh();
    } catch (error) {
      const message = toFormError(error).message;
      setPending((list) =>
        list.map((one) =>
          one.id === item.id ? { ...one, key: item.key, error: message } : one,
        ),
      );
    }
  }

  function take(files: FileList | File[]) {
    setFailed(null);

    const rejected: string[] = [];
    const good: File[] = [];

    for (const file of Array.from(files)) {
      const problem = checkImage(file);
      if (problem) rejected.push(`${file.name}: ${problem}`);
      else good.push(file);
    }

    const allowed = good.slice(0, Math.max(0, room));
    if (good.length > allowed.length) {
      rejected.push(
        `Only ${max} photos are allowed, so ${good.length - allowed.length} were skipped.`,
      );
    }

    if (rejected.length > 0) setFailed(rejected.join(" "));
    if (allowed.length === 0) return;

    const queued: Pending[] = allowed.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      preview: URL.createObjectURL(file),
      file,
    }));

    setPending((list) => [...list, ...queued]);
    void inBatches(queued, UPLOADS_AT_ONCE, send);
  }

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

  const retry = (item: Pending) => {
    setPending((list) =>
      list.map((one) =>
        one.id === item.id ? { ...one, error: undefined } : one,
      ),
    );
    void send({ ...item, error: undefined });
  };

  const discard = (item: Pending) => {
    URL.revokeObjectURL(item.preview);
    setPending((list) => list.filter((one) => one.id !== item.id));
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
              : `${photos.length} of ${max}. The cover is what people see on every card.`}
          </p>
        </div>

        <input
          ref={input}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          className="sr-only"
          onChange={(event) => {
            // Copy the files out before resetting the input. `event.target.files`
            // is the input's own live FileList, so clearing the value empties
            // the very list we were about to read.
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            if (files.length > 0) take(files);
          }}
        />

        <Button
          type="button"
          disabled={locked || room <= 0}
          onClick={() => input.current?.click()}
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-10 shrink-0 rounded-xl px-4 font-semibold"
        >
          <ImagePlus className="size-4" />
          Add photos
        </Button>
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
          if (dropped.length > 0) take(dropped);
        }}
        className={cn(
          "border-foreground/15 border-t p-4 transition-colors sm:p-5",
          dropping && "bg-tint-gold/40",
        )}
      >
        {photos.length === 0 && pending.length === 0 ? (
          <button
            type="button"
            disabled={locked}
            onClick={() => input.current?.click()}
            className="border-border/70 hover:border-foreground/30 flex w-full flex-col items-center rounded-2xl border border-dashed px-6 py-12 text-center transition-colors disabled:opacity-60"
          >
            <ImagePlus className="text-muted-foreground size-7" />
            <span className="mt-3 text-sm font-semibold">
              Drag photos here, or click to choose
            </span>
            <span className="text-muted-foreground mt-1 text-sm">
              JPEG, PNG, WebP or AVIF, up to {MAX_IMAGE_LABEL} each
            </span>
          </button>
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

            {pending.map((item) => (
              <li
                key={item.id}
                className="bg-muted relative aspect-4/3 overflow-hidden rounded-xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.preview}
                  alt=""
                  className="size-full object-cover opacity-50"
                />

                {item.error ? (
                  <div className="absolute inset-0 grid place-content-center gap-2 bg-black/75 p-3 text-center">
                    <p className="text-[11px] leading-snug text-white">
                      {item.error}
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => retry(item)}
                        className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold text-white"
                      >
                        <RotateCcw className="size-3" />
                        Retry
                      </button>
                      <button
                        type="button"
                        onClick={() => discard(item)}
                        aria-label="Discard this upload"
                        className="rounded-lg bg-white/20 px-2 py-1 text-white"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="absolute inset-0 grid place-items-center bg-black/30">
                    <Loader2 className="size-5 animate-spin text-white" />
                  </span>
                )}
              </li>
            ))}
          </ul>
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
