import { apiFetch } from "@/lib/api/client";
import { EMPTY_FILTERS, type Filters } from "@/lib/filters";

type AiSearchResponse = {
  filters: {
    cuisine: string[];
    area: string[];
    dish: string[];
    occasion: string[];
    dietary: string[];
    price: string[];
    q: string;
  };
  explanation: string;

  usedAi: boolean;
};

export type AiSearchResult = {
  filters: Filters;
  explanation: string;
  usedAi: boolean;
};

export async function askAi(query: string): Promise<AiSearchResult> {
  const { data } = await apiFetch<AiSearchResponse>("/ai/search", {
    method: "POST",
    body: { q: query },
  });

  return {
    filters: { ...EMPTY_FILTERS, ...data.filters },
    explanation: data.explanation,
    usedAi: data.usedAi,
  };
}
