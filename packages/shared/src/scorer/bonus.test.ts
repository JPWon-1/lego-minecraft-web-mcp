import { describe, it, expect } from "vitest";
import { efficiencyBonus } from "./bonus.js";

describe("efficiencyBonus", () => {
  it("returns 15 for < 5 turns", () => {
    expect(efficiencyBonus({ turnCount: 3, batchToolUses: 0 })).toBe(15);
  });
  it("returns 10 for 5..10 turns", () => {
    expect(efficiencyBonus({ turnCount: 5, batchToolUses: 0 })).toBe(10);
    expect(efficiencyBonus({ turnCount: 10, batchToolUses: 0 })).toBe(10);
  });
  it("returns 5 for 11..20 turns", () => {
    expect(efficiencyBonus({ turnCount: 15, batchToolUses: 0 })).toBe(5);
  });
  it("returns 0 for 21+ turns", () => {
    expect(efficiencyBonus({ turnCount: 25, batchToolUses: 0 })).toBe(0);
  });
  it("adds +1 per batch tool use, capped at +5", () => {
    expect(efficiencyBonus({ turnCount: 3, batchToolUses: 3 })).toBe(15 + 3);
    expect(efficiencyBonus({ turnCount: 3, batchToolUses: 10 })).toBe(15 + 5);
  });
});
