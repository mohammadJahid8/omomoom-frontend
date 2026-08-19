import type { RestaurantDetailData } from "@/types/api";

export const CLAIM_PRICE = "$49";
export const CLAIM_PERIOD = "month";

export type ListingGap = {
  key: string;
  label: string;
  /** What a guest currently sees, or null when there is nothing at all. */
  current: string | null;
  missing: boolean;
};

/**
 * The pitch is the owner's own listing, not a feature list. This works out what
 * is thin about it so the page can say "this is what Miami sees right now"
 * with their data rather than adjectives.
 */
export function listingGaps(restaurant: RestaurantDetailData): ListingGap[] {
  const gaps: ListingGap[] = [
    {
      key: "hours",
      label: "Opening hours",
      current: restaurant.hoursText,
      missing: !restaurant.hoursText,
    },
    {
      key: "phone",
      label: "Phone number",
      current: restaurant.phone,
      missing: !restaurant.phone,
    },
    {
      key: "website",
      label: "Website",
      current: restaurant.websiteUrl,
      missing: !restaurant.websiteUrl,
    },
    {
      key: "menu",
      label: "Menu link",
      current: restaurant.menuUrl,
      missing: !restaurant.menuUrl,
    },
    {
      key: "reservations",
      label: "Reservation link",
      current: restaurant.reservationUrl,
      missing: !restaurant.reservationUrl,
    },
    {
      key: "dishes",
      label: "What to order",
      current:
        restaurant.signatureDishes.length > 0
          ? restaurant.signatureDishes.join(", ")
          : null,
      missing: restaurant.signatureDishes.length === 0,
    },
    {
      key: "description",
      label: "Description",
      current: restaurant.description,
      missing: !restaurant.description,
    },
    {
      key: "photos",
      label: "Photos",
      current:
        restaurant.photos.length > 0
          ? `${restaurant.photos.length} photo${restaurant.photos.length === 1 ? "" : "s"}`
          : null,
      missing: restaurant.photos.length === 0,
    },
  ];

  return gaps;
}

export const OWNER_CONTROLS = [
  "Opening hours, including holidays",
  "Phone, website, menu and reservation links",
  "Description and your story",
  "Signature dishes, the ones you want people to order",
  "Photos of the room and the food",
  "Parking, accessibility and policies",
];

export const COMMUNITY_CONTROLS = [
  "Reviews and ratings from diners",
  "Photos other people have posted",
  "Where you appear in search results",
  "Omomoom editorial picks",
];
