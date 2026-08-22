"use client";

import { useEffect, useRef } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  checkImage,
  IMAGE_ACCEPT,
  MAX_IMAGE_LABEL,
} from "@/lib/api/uploads";
import { cn } from "@/lib/utils";

/** A file chosen but not yet sent anywhere. Nothing leaves the browser until save. */
export type StagedPhoto = {
  id: string;
  preview: string;
  file: File;
};

export function stagePhotos(
  files: File[],
  room: number,
): { staged: StagedPhoto[]; rejected: string[] } {
  const rejected: string[] = [];
  const good: File[] = [];

  for (const file of files) {
    const problem = checkImage(file);
    if (problem) rejected.push(`${file.name}: ${problem}`);
    else good.push(file);
  }

  const allowed = Number.isFinite(room) ? good.slice(0, Math.max(0, room)) : good;
  if (good.length > allowed.length) {
    rejected.push(`${good.length - allowed.length} skipped, no room left.`);
  }

  return {
    staged: allowed.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      preview: URL.createObjectURL(file),
      file,
    })),
    rejected,
  };
}

/**
 * Picking a photo used to start uploading it. It now waits for save, so
 * abandoning a form costs nothing and leaves no stray files in storage.
 */
export function PhotoStage({
  photos,
  onChange,
  room = Number.POSITIVE_INFINITY,
  disabled,
  busy,
  onProblem,
  label = "Photos",
}: {
  photos: StagedPhoto[];
  onChange: (next: StagedPhoto[]) => void;
  room?: number;
  disabled?: boolean;
  busy?: boolean;
  onProblem?: (message: string | null) => void;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);

  const live = useRef<StagedPhoto[]>(photos);
  useEffect(() => {
    live.current = photos;
  }, [photos]);

  useEffect(
    () => () => {
      live.current.forEach((item) => URL.revokeObjectURL(item.preview));
    },
    [],
  );

  const take = (files: File[]) => {
    const { staged, rejected } = stagePhotos(files, room - photos.length);
    onProblem?.(rejected.length > 0 ? rejected.join(" ") : null);
    if (staged.length > 0) onChange([...photos, ...staged]);
  };

  const drop = (item: StagedPhoto) => {
    URL.revokeObjectURL(item.preview);
    onChange(live.current.filter((one) => one.id !== item.id));
  };

  const full = photos.length >= room;

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-muted-foreground text-xs">
          {photos.length > 0
            ? `${photos.length} waiting to be saved`
            : `Up to ${MAX_IMAGE_LABEL} each`}
        </span>
      </div>

      <input
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
              className={cn("size-full object-cover", busy && "opacity-50")}
            />

            {busy ? (
              <span className="absolute inset-0 grid place-items-center bg-black/30">
                <Loader2 className="size-4 animate-spin text-white" />
              </span>
            ) : (
              <button
                type="button"
                onClick={() => drop(item)}
                aria-label="Remove this photo"
                className="absolute end-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              >
                <X className="size-3.5" />
              </button>
            )}
          </li>
        ))}

        {full ? null : (
          <li>
            <Button
              type="button"
              variant="outline"
              disabled={disabled || busy}
              onClick={() => input.current?.click()}
              className="border-input hover:border-foreground/40 text-muted-foreground hover:text-foreground grid size-20 place-items-center rounded-xl border border-dashed"
            >
              <ImagePlus className="size-5" />
              <span className="sr-only">Choose photos</span>
            </Button>
          </li>
        )}
      </ul>
    </div>
  );
}
