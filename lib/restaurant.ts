import type { RestaurantDetailData } from "@/types/api";

export function directionsUrl(restaurant: RestaurantDetailData): string | null {
  const { googleMapsUrl, latitude, longitude, addressLine, name } = restaurant;

  if (googleMapsUrl) return googleMapsUrl;

  const search = (query: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  if (addressLine) return search(`${name}, ${addressLine}`);

  if (latitude !== null && longitude !== null) {
    return search(`${latitude},${longitude}`);
  }

  return name ? search(name) : null;
}

export function telHref(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return null;

  return `tel:${digits.length === 10 ? `+1${digits}` : `+${digits}`}`;
}

export function prettyUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    const path = pathname === "/" ? "" : pathname.replace(/\/$/, "");
    return `${hostname.replace(/^www\./, "")}${path}`;
  } catch {
    return url;
  }
}

export const TAG_GROUP_LABELS: Record<string, string> = {
  DISH: "Known for",
  OCCASION: "Good for",
  SERVICE: "Service",
  DRINK: "Drinks",
  DIETARY: "Dietary",
  FEATURE: "Features",
};

export const TAG_GROUP_ORDER = [
  "DISH",
  "OCCASION",
  "DIETARY",
  "SERVICE",
  "DRINK",
  "FEATURE",
] as const;

export function socialHandle(url: string): string {
  const match = url.match(/([^/]+)\/?$/);
  return match ? `@${match[1]}` : url;
}
