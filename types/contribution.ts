import type { RestaurantCardData } from "@/types/api";

export type RecommendationAuthor = {
  username: string;
  name: string;
  avatarUrl: string | null;
};

export type Recommendation = {
  id: string;
  dish: string;
  rating: number;
  comment: string | null;
  photoUrl: string | null;
  createdAt: string;
  user: RecommendationAuthor;
};

export type RecommendationWithRestaurant = Recommendation & {
  restaurant: {
    slug: string;
    name: string;
    neighborhood: { name: string } | null;
    municipality: string | null;
    coverPhoto: { url: string; blurhash: string | null } | null;
  };
};

export type SavedRestaurant = RestaurantCardData & { savedAt: string };

export type ContributionStats = {
  recommendations: number;
  photos: number;
  placesTried: number;
  wantToTry: number;
};
