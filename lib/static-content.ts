const photo = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const POPULAR_SEARCHES: {
  label: string;
  emoji: string;
  dish?: string;
  q?: string;
}[] = [
  { label: "Sushi", emoji: "🍣", dish: "sushi" },
  { label: "Dim Sum", emoji: "🥟", q: "dim sum" },
  { label: "Ramen", emoji: "🍜", q: "ramen" },
  { label: "Steak", emoji: "🥩", dish: "steak" },
  { label: "Tacos", emoji: "🌮", dish: "tacos" },
  { label: "Cocktails", emoji: "🍸", dish: "cocktails" },
  { label: "Brunch", emoji: "🥐", dish: "brunch" },
  { label: "Seafood", emoji: "🦞", dish: "seafood" },
];

export const popularSearchHref = (entry: {
  dish?: string;
  q?: string;
}): string =>
  entry.dish
    ? `/restaurants?dish=${entry.dish}`
    : `/restaurants?q=${encodeURIComponent(entry.q ?? "")}`;

export const NEIGHBORHOOD_PHOTOS: Record<string, string> = {
  brickell: photo("photo-1506905925346-21bda4d32df4"),
  "south-beach": photo("photo-1535498730771-e735b998cd64"),
  "coral-gables": photo("photo-1519677100203-a0e668c92439"),
  "coconut-grove": photo("photo-1502920917128-1aa500764cbd"),
  wynwood: photo("photo-1533106497176-45ae19e68ba2"),
  "design-district": photo("photo-1517248135467-4c7edcad34c4"),
  "downtown-miami": photo("photo-1449034446853-66c86144b0ad"),
  "mid-beach": photo("photo-1571003123894-1f0594d2b5d9"),
  aventura: photo("photo-1441986300917-64674bd600d8"),
  doral: photo("photo-1470075801209-17f9ec0cada6"),
};

export const NEIGHBORHOOD_PHOTO_FALLBACK = photo(
  "photo-1414235077428-338989a2e8c0",
);

export const GUIDES = [
  {
    slug: "best-sushi-in-miami",
    title: "The best sushi in Miami",
    description:
      "From eight seat omakase counters to the neighborhood spot worth the drive.",
    restaurantCount: 14,
    imageUrl: photo("photo-1579871494447-9811cf80d66c", 900),
  },
  {
    slug: "hidden-gems-wynwood",
    title: "Hidden gems in Wynwood",
    description:
      "The places locals keep quiet about, tucked behind the murals and the crowds.",
    restaurantCount: 11,
    imageUrl: photo("photo-1533106497176-45ae19e68ba2", 900),
  },
  {
    slug: "best-brunch-brickell",
    title: "Where to brunch in Brickell",
    description:
      "Long tables, good coffee, and somewhere you can actually hear each other.",
    restaurantCount: 9,
    imageUrl: photo("photo-1533089860892-a7c6f0a88666", 900),
  },
] as const;

export const HERO_IMAGES = [
  { src: photo("photo-1544025162-d76694265947", 800), alt: "Grilled steak" },
  { src: photo("photo-1579871494447-9811cf80d66c", 800), alt: "Sushi platter" },
  {
    src: photo("photo-1565299624946-b28f40a0ae38", 800),
    alt: "Wood fired pizza",
  },
  {
    src: photo("photo-1551024506-0bccd828d307", 800),
    alt: "Ice cream dessert with caramel sauce",
  },
] as const;
