"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ImageViewer } from "@/components/shared/image-viewer";
import { cn } from "@/lib/utils";
import type { RestaurantPhoto } from "@/types/api";

/** How far the edges fade out when there is more of the strip in that direction. */
const FADE = "2.5rem";

/**
 * Masking rather than overlaying a coloured gradient: the photos themselves
 * fade, so it works on any background without matching a colour to it.
 */
function edgeMask(left: boolean, right: boolean): string | undefined {
  if (!left && !right) return undefined;

  return `linear-gradient(to right, ${[
    left ? `transparent 0, #000 ${FADE}` : "#000 0",
    right ? `#000 calc(100% - ${FADE}), transparent 100%` : "#000 100%",
  ].join(", ")})`;
}

/**
 * The strip under the hero. It shows everything except the photo already on
 * display above, while the viewer it opens still walks the full set, so the
 * cover is never missing from the sequence.
 */
export function RestaurantGallery({
  name,
  photos,
  coverUrl,
}: {
  name: string;
  photos: RestaurantPhoto[];
  coverUrl: string | null;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const rail = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  /** Arrows only exist while there is somewhere to go in that direction. */
  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    setEdges({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.addEventListener("scroll", measure, { passive: true });

    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", measure);
    };
  }, [measure]);

  const slide = (direction: number) => {
    const el = rail.current;
    if (!el) return;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direction * el.clientWidth * 0.8,
      behavior: calm ? "auto" : "smooth",
    });
  };

  const rest = photos
    .map((photo, index) => ({ photo, index }))
    .filter(({ photo }) => photo.url !== coverUrl);

  if (rest.length === 0) return null;

  return (
    <>
      <div className="group/rail relative mt-3">
        <ul
          ref={rail}
          style={{
            maskImage: edgeMask(edges.left, edges.right),
            WebkitMaskImage: edgeMask(edges.left, edges.right),
          }}
          className="scrollbar-none -mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 pb-1 sm:gap-3"
        >
          {rest.map(({ photo, index }) => (
            <li key={photo.id} className="shrink-0 snap-start">
              <button
                type="button"
                onClick={() => setOpen(index)}
                aria-label={
                  photo.caption ?? `Open photo ${index + 1} of ${name}`
                }
                className="group bg-muted focus-visible:ring-ring relative block aspect-4/3 w-32 overflow-hidden rounded-xl outline-none focus-visible:ring-3 sm:w-40"
              >
                <Image
                  src={photo.url}
                  alt={photo.caption ?? ""}
                  fill
                  sizes="160px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            </li>
          ))}
        </ul>

        <RailArrow side="left" shown={edges.left} onClick={() => slide(-1)} />
        <RailArrow side="right" shown={edges.right} onClick={() => slide(1)} />
      </div>

      <ImageViewer
        images={photos}
        index={open}
        onIndexChange={setOpen}
        label={`Photos of ${name}`}
      />
    </>
  );
}

/**
 * Hidden on touch, where swiping is the natural gesture and a button would
 * only cover a thumbnail.
 */
function RailArrow({
  side,
  shown,
  onClick,
}: {
  side: "left" | "right";
  shown: boolean;
  onClick: () => void;
}) {
  if (!shown) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Scroll photos left" : "Scroll photos right"}
      className={cn(
        "bg-background/90 text-foreground ring-foreground/10 hover:bg-background absolute top-1/2 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full opacity-0 shadow-md ring-1 backdrop-blur-sm transition-opacity focus-visible:opacity-100 group-hover/rail:opacity-100 sm:grid",
        side === "left" ? "-start-2" : "-end-2",
      )}
    >
      {side === "left" ? (
        <ChevronLeft className="size-4.5" />
      ) : (
        <ChevronRight className="size-4.5" />
      )}
    </button>
  );
}
