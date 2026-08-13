import type { RestaurantCardData } from "@/types/api";

export type RecommendationAuthor = {
  username: string;
  name: string;
  avatarUrl: string | null;
};

export type OrderAgain = "DEFINITELY" | "MAYBE" | "NO";

export type Recommendation = {
  id: string;
  dish: string;
  rating: number;
  comment: string | null;
  photoUrl: string | null;
  wouldOrderAgain: OrderAgain | null;
  taste: number | null;
  service: number | null;
  value: number | null;
  ambience: number | null;
  hygiene: number | null;
  visitScore: number | null;
  aiSummary: string | null;
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
