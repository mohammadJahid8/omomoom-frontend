import type { MichelinRating, PriceTier } from "@/types/api";
import type { SubscriptionStatus } from "@/types/subscription";

export type StudioListing = {
  id: string;
  slug: string;
  name: string;
  status: "DRAFT" | "PUBLISHED" | "HIDDEN";
  claimState: "UNCLAIMED" | "PENDING" | "CLAIMED";

  hoursText: string | null;
  phone: string | null;
  email: string | null;
  addressLine: string | null;
  municipality: string | null;
  websiteUrl: string | null;
  menuUrl: string | null;
  reservationUrl: string | null;

  signatureDishes: string | null;
  description: string | null;
  story: string | null;
  chefStory: string | null;
  whatMakesSpecial: string | null;

  subCuisine: string | null;
  priceTier: PriceTier | null;
  michelin: MichelinRating | null;

  subscriptionStatus: SubscriptionStatus;
  subscribedUntil: string | null;
  subscriptionActive: boolean;

  ratingAverage: number;
  reviewCount: number;
  neighborhood: { name: string } | null;
  coverPhoto: { url: string } | null;
  _count: { recommendations: number; photos: number };
  updatedAt: string;
};

export type StudioUpdate = Partial<{
  hoursText: string | null;
  phone: string | null;
  email: string | null;
  addressLine: string | null;
  websiteUrl: string | null;
  menuUrl: string | null;
  reservationUrl: string | null;
  signatureDishes: string | null;
  description: string | null;
  story: string | null;
  chefStory: string | null;
  whatMakesSpecial: string | null;
  subCuisine: string | null;
  priceTier: PriceTier | "" | null;
}>;

export type StudioPhoto = {
  id: string;
  url: string;
  storageKey: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  role: "GALLERY" | "COVER" | "LOGO";
  sortOrder: number;
  createdAt: string;
  isCover: boolean;
};

export type StudioPhotos = { photos: StudioPhoto[]; max: number };
