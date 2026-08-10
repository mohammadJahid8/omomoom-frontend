export type AsianCuisine = { slug: string; label: string; emoji: string };

export const ASIAN_CUISINES: AsianCuisine[] = [
  { slug: "japanese", label: "Japanese", emoji: "🇯🇵" },
  { slug: "chinese", label: "Chinese", emoji: "🇨🇳" },
  { slug: "thai", label: "Thai", emoji: "🇹🇭" },
  { slug: "korean", label: "Korean", emoji: "🇰🇷" },
  { slug: "vietnamese", label: "Vietnamese", emoji: "🇻🇳" },
  { slug: "indian", label: "Indian", emoji: "🇮🇳" },
  { slug: "taiwanese", label: "Taiwanese", emoji: "🇹🇼" },
  { slug: "filipino", label: "Filipino", emoji: "🇵🇭" },
  { slug: "indonesian", label: "Indonesian", emoji: "🇮🇩" },
  { slug: "lao", label: "Lao", emoji: "🇱🇦" },
  { slug: "asian", label: "Pan-Asian", emoji: "🍜" },
  { slug: "asian-fusion", label: "Asian Fusion", emoji: "✨" },
];

export const ASIAN_CUISINE_SLUGS = ASIAN_CUISINES.map((c) => c.slug);

export function asianCuisineLabel(slug: string): string {
  return ASIAN_CUISINES.find((c) => c.slug === slug)?.label ?? slug;
}
