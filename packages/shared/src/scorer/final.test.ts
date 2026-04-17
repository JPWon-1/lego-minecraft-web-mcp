import { describe, it, expect } from "vitest";
import { computeFinalScore, gradeFor } from "./final.js";

describe("computeFinalScore", () => {
  it("sums all components", () => {
    const r = computeFinalScore({
      iou: 0.82,
      turnCount: 4,
      batchToolUses: 1,
      hintsUsed: 1,
      ambiguityAvg: 2,
    });
    expect(r.iou_points).toBe(82);
    expect(r.efficiency_bonus).toBe(16);
    expect(r.hint_penalty).toBe(5);
    expect(r.ambiguity_penalty).toBe(0);
    expect(r.final).toBe(93);
  });

  it("clamps final at 0..115", () => {
    const low = computeFinalScore({
      iou: 0, turnCount: 30, batchToolUses: 0,
      hintsUsed: 3, ambiguityAvg: 10,
    });
    expect(low.final).toBe(0);

    const high = computeFinalScore({
      iou: 1.0, turnCount: 1, batchToolUses: 5,
      hintsUsed: 0, ambiguityAvg: 0,
    });
    expect(high.final).toBe(115);
  });
});

describe("gradeFor", () => {
  it.each([
    [95, "S"],
    [85, "A"],
    [70, "B"],
    [50, "C"],
    [20, "D"],
  ])("grade(%i) = %s", (score, expected) => {
    expect(gradeFor(score)).toBe(expected);
  });
});
