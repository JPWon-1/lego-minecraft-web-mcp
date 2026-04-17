import { describe, it, expect } from "vitest";
import { hintPenalty, ambiguityPenalty } from "./penalty.js";

describe("hintPenalty", () => {
  it("returns 0 when no hints used", () => {
    expect(hintPenalty(0)).toBe(0);
  });
  it("returns 5 for 1st hint", () => {
    expect(hintPenalty(1)).toBe(5);
  });
  it("returns 15 cumulative for 2 hints", () => {
    expect(hintPenalty(2)).toBe(15);
  });
  it("returns 35 cumulative for 3 hints", () => {
    expect(hintPenalty(3)).toBe(35);
  });
  it("caps at 35 for 4+ hints", () => {
    expect(hintPenalty(4)).toBe(35);
    expect(hintPenalty(100)).toBe(35);
  });
});

describe("ambiguityPenalty", () => {
  it("returns 0 for score 0..2", () => {
    expect(ambiguityPenalty(0)).toBe(0);
    expect(ambiguityPenalty(2)).toBe(0);
  });
  it("returns 3 for score 3..5", () => {
    expect(ambiguityPenalty(3)).toBe(3);
    expect(ambiguityPenalty(5)).toBe(3);
  });
  it("returns 7 for score 6..8", () => {
    expect(ambiguityPenalty(8)).toBe(7);
  });
  it("returns 10 for score 9..10", () => {
    expect(ambiguityPenalty(9)).toBe(10);
    expect(ambiguityPenalty(10)).toBe(10);
  });
});
