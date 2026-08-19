import type { RestaurantCardData } from "@/types/api";
import type { OrderAgain } from "@/types/contribution";

export type ProfileReview = {
  id: string;
  dish: string;
  rating: number;
  comment: string | null;
  wouldOrderAgain: OrderAgain | null;
  visitScore: number | null;
  aiSummary: string | null;
  createdAt: string;
  photos: { id: string; url: string; caption: string | null }[];
  restaurant: {
    id: string;
    slug: string;
    name: string;
    neighborhood: { name: string } | null;
  };
};

export type ProfilePhoto = {
  id: string;
  url: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  restaurant: { slug: string; name: string };
};

export type PublicProfile = {
  user: {
    username: string;
    name: string;
    avatarUrl: string | null;
    joinedAt: string;
  };
  counts: {
    reviews: number;
    photos: number;
    placesTried: number;
    wantToTry: number;
  };
  reviews: ProfileReview[];
  photos: ProfilePhoto[];
  placesTried: RestaurantCardData[];
  wantToTry: RestaurantCardData[];
};
