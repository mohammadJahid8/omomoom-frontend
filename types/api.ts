export type PriceTier = "ONE" | "TWO" | "THREE" | "FOUR";

export type MichelinRating =
  "SELECTED" | "BIB_GOURMAND" | "ONE_STAR" | "TWO_STARS" | "THREE_STARS";

export type ClaimState = "UNCLAIMED" | "PENDING" | "CLAIMED";

export type ApiMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: ApiMeta;
  data: T;
  errorDetails?: { path: string; message: string }[];
};

export type CuisineRef = {
  name: string;
  slug: string;
  code: string | null;
};

export type RestaurantCardData = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  subCuisine: string | null;
  signatureDishes: string[];
  hoursText: string | null;
  priceTier: PriceTier | null;
  michelin: MichelinRating | null;
  claimState: ClaimState;
  ratingAverage: number;
  reviewCount: number;
  municipality: string | null;
  cuisine: string | null;
  cuisines: CuisineRef[];
  neighborhood: string | null;
  neighborhoodSlug: string | null;
  imageUrl: string | null;
  imageBlurhash: string | null;
};

export type TagRef = {
  name: string;
  slug: string;
  emoji: string | null;
};

export type TagGroups = Partial<Record<string, TagRef[]>>;

export type RestaurantPhoto = {
  id: string;
  url: string;
  blurhash: string | null;
  caption: string | null;
  role: string;
};

export type RestaurantDetailData = Omit<
  RestaurantCardData,
  "cuisines" | "imageUrl" | "imageBlurhash"
> & {
  imageUrl: string | null;
  imageBlurhash: string | null;
  addressLine: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string | null;
  phone: string | null;
  email: string | null;
  websiteUrl: string | null;
  menuUrl: string | null;
  reservationUrl: string | null;
  socials: Record<string, string> | null;
  story: string | null;
  whatMakesSpecial: string | null;
  chefStory: string | null;
  yearEstablished: number | null;
  createdAt: string;
  updatedAt: string;
  city: { name: string; slug: string; timezone: string } | null;
  hours: {
    dayOfWeek: number;
    opensAt: string | null;
    closesAt: string | null;
    label: string | null;
  }[];
  photos: RestaurantPhoto[];
  tags: TagGroups;
};

export type FacetOption = {
  slug: string;
  label: string;
  count: number;
  emoji?: string | null;
  code?: string | null;
};

export type RestaurantFacets = {
  cuisine: FacetOption[];
  area: FacetOption[];
  price: FacetOption[];
  dish: FacetOption[];
  occasion: FacetOption[];
  dietary: FacetOption[];
};

export type RestaurantListData = {
  restaurants: RestaurantCardData[];
  facets?: RestaurantFacets;
};

export type TagOption = FacetOption & { type: string };

export type NeighborhoodOption = {
  slug: string;
  label: string;
  city: string;
  citySlug: string;
  count: number;
};
