export type VisitRatings = {
  taste: number;
  service: number;
  value: number;
  ambience: number;
  hygiene: number;
};

/**
 * Mirrors the weighting the API stores, so the number moves as you rate rather
 * than appearing only after you post. Taste counts most: this is a food site.
 */
const WEIGHTS: Record<keyof VisitRatings, number> = {
  taste: 3,
  service: 1.5,
  value: 1.5,
  ambience: 1,
  hygiene: 1,
};

export function visitScore(ratings: VisitRatings): number | null {
  let weighted = 0;
  let total = 0;

  for (const [key, weight] of Object.entries(WEIGHTS) as [
    keyof VisitRatings,
    number,
  ][]) {
    const value = ratings[key];
    if (!value) continue;
    weighted += value * weight;
    total += weight;
  }

  if (total === 0) return null;

  return Number((weighted / total).toFixed(1));
}

export function scoreLabel(score: number): string {
  if (score >= 4.5) return "One of the best in the city";
  if (score >= 4) return "Worth going out of your way for";
  if (score >= 3.5) return "Solid, would send a friend";
  if (score >= 2.75) return "Fine, nothing to rush back for";
  return "Give this one a miss";
}
