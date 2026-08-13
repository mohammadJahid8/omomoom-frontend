export type AsianCuisine = {
  slug: string;
  label: string;
  /** ISO country code for the flag, or a sentinel for the two that have none. */
  code: string;
};

export const ASIAN_CUISINES: AsianCuisine[] = [
  { slug: "japanese", label: "Japanese", code: "JP" },
  { slug: "chinese", label: "Chinese", code: "CN" },
  { slug: "thai", label: "Thai", code: "TH" },
  { slug: "korean", label: "Korean", code: "KR" },
  { slug: "vietnamese", label: "Vietnamese", code: "VN" },
  { slug: "indian", label: "Indian", code: "IN" },
  { slug: "taiwanese", label: "Taiwanese", code: "TW" },
  { slug: "filipino", label: "Filipino", code: "PH" },
  { slug: "indonesian", label: "Indonesian", code: "ID" },
  { slug: "lao", label: "Lao", code: "LA" },
  { slug: "asian", label: "Pan-Asian", code: "PAN_ASIAN" },
  { slug: "asian-fusion", label: "Asian Fusion", code: "FUSION" },
];

export const ASIAN_CUISINE_SLUGS = ASIAN_CUISINES.map((c) => c.slug);

export function asianCuisineLabel(slug: string): string {
  return ASIAN_CUISINES.find((c) => c.slug === slug)?.label ?? slug;
}
