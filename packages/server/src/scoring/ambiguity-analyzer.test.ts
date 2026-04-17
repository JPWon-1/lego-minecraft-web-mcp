import { describe, it, expect } from "vitest";
import type { Turn } from "@blockgame/shared";
import {
  keywordAmbiguityFallback,
  analyzeAmbiguity,
} from "./ambiguity-analyzer.js";

function turn(id: string, intent: string): Turn {
  return {
    turn_id: id,
    user_intent: intent,
    started_at: 0,
    tool_calls: [],
  };
}

describe("keywordAmbiguityFallback", () => {
  it("scores no ambiguity low", () => {
    const s = keywordAmbiguityFallback([
      turn("t1", "place 5x3 red wall at (0,0,0)"),
    ]);
    expect(s).toBeLessThanOrEqual(2);
  });

  it("scores heavy ambiguity high", () => {
    const intents = [
      turn("t1", "좀 더 왼쪽으로 옮겨줘"),
      turn("t2", "살짝 더 크게 만들어"),
      turn("t3", "약간 조금만 더"),
    ];
    // Heavy-ambiguity prompts should score meaningfully above the no-
    // ambiguity case (0-2). With the plan's fallback formula we expect >=5,
    // which falls in the "medium" penalty bucket (3-5 → penalty of 3).
    expect(keywordAmbiguityFallback(intents)).toBeGreaterThanOrEqual(5);
  });

  it("returns 0 for empty turn list", () => {
    expect(keywordAmbiguityFallback([])).toBe(0);
  });
});

describe("analyzeAmbiguity", () => {
  it("returns per-turn matches for each turn", async () => {
    const result = await analyzeAmbiguity([
      turn("t1", "좀 더 왼쪽으로"),
      turn("t2", "place red wall"),
    ]);
    expect(result.per_turn).toHaveLength(2);
    expect(result.per_turn[0].matches.length).toBeGreaterThan(0);
    expect(result.llm_available).toBe(false);
  });
});
