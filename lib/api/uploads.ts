import { apiFetch } from "@/lib/api/client";

export type UploadPurpose = "AVATAR" | "RESTAURANT_PHOTO" | "USER_PHOTO";

type SignedUpload = {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  headers: Record<string, string>;
};

/** One ceiling for every image on the site. Mirrors the API's own limit. */
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

export const MAX_IMAGE_LABEL = `${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))}MB`;

export const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const IMAGE_ACCEPT = IMAGE_TYPES.join(",");

/** Readable before the upload starts, so nobody waits to be told no. */
export function checkImage(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) {
    return "That file type is not supported. Use JPEG, PNG, WebP or AVIF.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `That image is too large. The limit is ${MAX_IMAGE_LABEL}.`;
  }
  if (file.size === 0) return "That file looks empty.";
  return null;
}

/**
 * The file goes from the browser straight to storage. Our API only signs the
 * request, so a big upload never occupies a connection on our own server, and
 * video later needs no change here.
 */
export async function uploadImage(
  file: File,
  purpose: UploadPurpose,
  restaurantId?: string,
): Promise<{ key: string; publicUrl: string }> {
  const { data } = await apiFetch<SignedUpload>("/uploads/sign", {
    method: "POST",
    body: {
      purpose,
      contentType: file.type,
      size: file.size,
      ...(restaurantId ? { restaurantId } : {}),
    },
    session: true,
  });

  // The signature also covers Content-Length, which the browser sets itself
  // from the body and will not let us override. That is the point: the size
  // we declared when signing has to match the bytes actually sent.
  const response = await fetch(data.uploadUrl, {
    method: "PUT",
    headers: data.headers,
    body: file,
  });

  if (!response.ok) {
    throw new Error("The upload did not go through. Check your connection.");
  }

  return { key: data.key, publicUrl: data.publicUrl };
}

/** Read once in the browser so the page can reserve space and never jump. */
export async function imageSize(
  file: File,
): Promise<{ width?: number; height?: number }> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return {};
  }
}

/** Runs `work` over `items` a few at a time, so ten photos do not open ten sockets. */
export async function inBatches<T>(
  items: T[],
  limit: number,
  work: (item: T) => Promise<void>,
): Promise<void> {
  const queue = [...items];

  await Promise.all(
    Array.from({ length: Math.min(limit, queue.length) }, async () => {
      let next = queue.shift();
      while (next !== undefined) {
        await work(next);
        next = queue.shift();
      }
    }),
  );
}
