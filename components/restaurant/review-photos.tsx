"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, RotateCcw, X } from "lucide-react";

import { FieldLabel } from "@/components/shared/field";
import { toFormError } from "@/lib/api/auth";
import {
  checkImage,
  IMAGE_ACCEPT,
  imageSize,
  inBatches,
  MAX_IMAGE_LABEL,
  uploadImage,
} from "@/lib/api/uploads";
import { cn } from "@/lib/utils";

/** One picked file, uploading in the background while the review is written. */
export type ReviewPhoto = {
  id: string;
  preview: string;
  file: File;
  key?: string;
  width?: number;
  height?: number;
  error?: string;
};

/**
 * Photos start uploading the moment they are chosen, not when the review is
 * submitted. By the time someone has finished typing their comment, the files
 * are already in storage and posting is instant.
 */
export function ReviewPhotos({
  photos,
  onChange,
  restaurantId,
  disabled,
}: {
  photos: ReviewPhoto[];
  onChange: (next: ReviewPhoto[]) => void;
  restaurantId: string;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [failed, setFailed] = useState<string | null>(null);

  // The list is mirrored so the uploader always writes against what is current,
  // rather than the snapshot it closed over when it started.
  const live = useRef<ReviewPhoto[]>(photos);
  useEffect(() => {
    live.current = photos;
  }, [photos]);

  const patch = (id: string, changes: Partial<ReviewPhoto>) =>
    onChange(
      live.current.map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    );

  const send = async (item: ReviewPhoto) => {
    try {
      // Read the shape here rather than on the server: the browser already has
      // the file, and a gallery needs the ratio to lay out before the image
      // has loaded.
      const [{ key }, size] = await Promise.all([
        uploadImage(item.file, "USER_PHOTO", restaurantId),
        imageSize(item.file),
      ]);
      patch(item.id, { key, ...size, error: undefined });
    } catch (error) {
      patch(item.id, { error: toFormError(error).message });
    }
  };

  const take = (files: File[]) => {
    setFailed(null);

    const rejected: string[] = [];
    const good: File[] = [];

    for (const file of files) {
      const problem = checkImage(file);
      if (problem) rejected.push(`${file.name}: ${problem}`);
      else good.push(file);
    }

    if (rejected.length > 0) setFailed(rejected.join(" "));
    if (good.length === 0) return;

    const queued: ReviewPhoto[] = good.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      preview: URL.createObjectURL(file),
      file,
    }));

    onChange([...photos, ...queued]);
    void inBatches(queued, 3, send);
  };

  const drop = (item: ReviewPhoto) => {
    URL.revokeObjectURL(item.preview);
    onChange(live.current.filter((one) => one.id !== item.id));
  };

  const uploading = photos.filter((item) => !item.key && !item.error).length;

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <FieldLabel htmlFor="review-photos">Photos</FieldLabel>
        <span className="text-muted-foreground text-xs">
          {photos.length > 0
            ? `${photos.length} ${photos.length === 1 ? "photo" : "photos"}`
            : "Optional"}
        </span>
      </div>

      <input
        id="review-photos"
        ref={input}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        className="sr-only"
        onChange={(event) => {
          // Copy before clearing: the FileList belongs to the input.
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length > 0) take(files);
        }}
      />

      <ul className="flex flex-wrap gap-2.5">
        {photos.map((item) => (
          <li
            key={item.id}
            className="bg-muted relative size-20 overflow-hidden rounded-xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.preview}
              alt=""
              className={cn(
                "size-full object-cover",
                !item.key && "opacity-50",
              )}
            />

            {item.error ? (
              <button
                type="button"
                onClick={() => {
                  patch(item.id, { error: undefined });
                  void send(item);
                }}
                title={item.error}
                aria-label={`Retry: ${item.error}`}
                className="absolute inset-0 grid place-items-center bg-black/70 text-white"
              >
                <RotateCcw className="size-4" />
              </button>
            ) : !item.key ? (
              <span className="absolute inset-0 grid place-items-center bg-black/25">
                <Loader2 className="size-4 animate-spin text-white" />
              </span>
            ) : null}

            <button
              type="button"
              onClick={() => drop(item)}
              aria-label="Remove this photo"
              className="absolute end-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            >
              <X className="size-3.5" />
            </button>
          </li>
        ))}

        <li>
          <button
            type="button"
            disabled={disabled}
            onClick={() => input.current?.click()}
            className="border-input hover:border-foreground/40 text-muted-foreground hover:text-foreground focus-visible:ring-ring grid size-20 place-items-center rounded-xl border border-dashed transition-colors outline-none focus-visible:ring-3 disabled:opacity-50"
          >
            <Camera className="size-5" />
            <span className="sr-only">Add photos</span>
          </button>
        </li>
      </ul>

      <p className="text-muted-foreground text-xs">
        {uploading > 0
          ? `Uploading ${uploading}…`
          : `Up to ${MAX_IMAGE_LABEL} each. Photos appear once someone has checked them.`}
      </p>

      {failed ? (
        <p role="alert" className="text-destructive text-xs">
          {failed}
        </p>
      ) : null}
    </div>
  );
}
