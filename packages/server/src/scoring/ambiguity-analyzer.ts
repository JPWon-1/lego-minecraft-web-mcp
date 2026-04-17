import type { Turn } from "@blockgame/shared";

const AMBIGUOUS_WORDS = [
  "좀",
  "약간",
  "조금",
  "살짝",
  "대충",
  "적당히",
  "더",
  "덜",
  "훨씬",
  "많이",
  "조금만",
  "a bit",
  "a little",
  "somewhat",
  "slightly",
  "more",
  "less",
];

export interface AmbiguityAnalysis {
  average_score: number; // 0..10
  per_turn: Array<{ turn_id: string; score: number; matches: string[] }>;
  positive: string[];
  negative: string[];
  wasted: string[];
  missing: string[];
  llm_available: boolean;
}

export function keywordAmbiguityFallback(turns: Turn[]): number {
  if (turns.length === 0) return 0;
  let total = 0;
  for (const t of turns) {
    const text = t.user_intent.toLowerCase();
    let count = 0;
    for (const w of AMBIGUOUS_WORDS) {
      if (text.includes(w)) count++;
    }
    total += Math.min(count * 2, 10);
  }
  return Math.round(total / turns.length);
}

export async function analyzeAmbiguity(turns: Turn[]): Promise<AmbiguityAnalysis> {
  // MVP: keyword-only. Real LLM call added later (integration task).
  const avg = keywordAmbiguityFallback(turns);
  const per_turn = turns.map((t) => ({
    turn_id: t.turn_id,
    score: keywordAmbiguityFallback([t]),
    matches: AMBIGUOUS_WORDS.filter((w) =>
      t.user_intent.toLowerCase().includes(w),
    ),
  }));
  return {
    average_score: avg,
    per_turn,
    positive: [],
    negative: [],
    wasted: [],
    missing: [],
    llm_available: false,
  };
}
