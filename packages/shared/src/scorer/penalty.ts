const HINT_COSTS = [5, 10, 20] as const;

export function hintPenalty(hintsUsed: number): number {
  const n = Math.min(Math.max(hintsUsed, 0), HINT_COSTS.length);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += HINT_COSTS[i];
  return sum;
}

export function ambiguityPenalty(avgAmbiguityScore: number): number {
  const s = Math.max(0, Math.min(10, avgAmbiguityScore));
  if (s <= 2) return 0;
  if (s <= 5) return 3;
  if (s <= 8) return 7;
  return 10;
}
