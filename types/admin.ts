import type { Role } from "@/types/auth";
import type { MichelinRating, PriceTier } from "@/types/api";

export type RestaurantStatus = "DRAFT" | "PUBLISHED" | "HIDDEN";

export type AdminRestaurantRow = {
  id: string;
  slug: string;
  name: string;
  status: RestaurantStatus;
  claimState: "UNCLAIMED" | "PENDING" | "CLAIMED";
  municipality: string | null;
  priceTier: PriceTier | null;
  michelin: MichelinRating | null;
  ratingAverage: number;
  reviewCount: number;
  neighborhood: { id: string; name: string } | null;
  coverPhoto: { url: string } | null;
  updatedAt: string;
};

export type AdminRestaurant = AdminRestaurantRow & {
  description: string | null;
  subCuisine: string | null;
  signatureDishes: string | null;
  addressLine: string | null;
  phone: string | null;
  websiteUrl: string | null;
  menuUrl: string | null;
  reservationUrl: string | null;
  hoursText: string | null;
  neighborhoodId: string | null;
  _count: { recommendations: number; savedBy: number; events: number };
};

export type AdminRestaurantInput = {
  name: string;
  status: RestaurantStatus;
  description?: string | null;
  subCuisine?: string | null;
  signatureDishes?: string | null;
  neighborhoodId?: string | null;
  municipality?: string | null;
  addressLine?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  menuUrl?: string | null;
  reservationUrl?: string | null;
  hoursText?: string | null;
  priceTier?: PriceTier | "" | null;
  michelin?: MichelinRating | "" | null;
};

export type AdminUser = {
  id: string;
  email: string;
  username: string;
  name: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  avatarUrl: string | null;
  createdAt: string;
  _count: {
    recommendations: number;
    saves: number;
    ownedRestaurants: number;
  };
};
