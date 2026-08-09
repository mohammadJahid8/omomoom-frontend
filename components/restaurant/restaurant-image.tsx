"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

type RestaurantImageProps = {
  src: string | null;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

export function RestaurantImage({
  src,
  alt = "",
  priority = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  className,
}: RestaurantImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="text-muted-foreground/40 flex h-full items-center justify-center">
        <ImageOff className="size-8" aria-hidden="true" />
        <span className="sr-only">Photo unavailable</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
