"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type ViewerImage = {
  url: string;
  caption?: string | null;
};

/**
 * One viewer for every photo on the site: the public gallery, the Studio grid
 * and a profile picture. Controlled from outside so the caller decides what
 * opening means, and renders nothing at all when closed.
 */
export function ImageViewer({
  images,
  index,
  onIndexChange,
  label = "Photo",
}: {
  images: ViewerImage[];
  index: number | null;
  onIndexChange: (next: number | null) => void;
  label?: string;
}) {
  const step = useCallback(
    (by: number) => {
      if (index === null || images.length === 0) return;
      onIndexChange((index + by + images.length) % images.length);
    },
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    if (index === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onIndexChange(null);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    // Locking the page stops the content scrolling behind the viewer.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, onIndexChange, step]);

  if (index === null) return null;

  const current = images[index];
  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={() => onIndexChange(null)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      <button
        type="button"
        onClick={() => onIndexChange(null)}
        aria-label="Close"
        className="absolute end-4 top-4 grid size-11 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
      >
        <X className="size-5" />
      </button>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              step(-1);
            }}
            aria-label="Previous photo"
            className="absolute start-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              step(1);
            }}
            aria-label="Next photo"
            className="absolute end-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      ) : null}

      <figure
        onClick={(event) => event.stopPropagation()}
        className="max-h-full w-full max-w-4xl"
      >
        <div className="relative mx-auto aspect-3/2 w-full">
          <Image
            src={current.url}
            alt={current.caption ?? ""}
            fill
            sizes="(min-width: 1024px) 56rem, 100vw"
            unoptimized={current.url.startsWith("blob:")}
            className="object-contain"
          />
        </div>
        <figcaption className="mt-3 text-center text-sm text-white/80">
          {current.caption ??
            (images.length > 1 ? `${index + 1} of ${images.length}` : "")}
        </figcaption>
      </figure>
    </div>
  );
}
