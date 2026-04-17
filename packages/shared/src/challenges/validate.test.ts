import { describe, it, expect } from "vitest";
import { validateManifest } from "./validate.js";

describe("validateManifest", () => {
  it("accepts a well-formed manifest", () => {
    const ok = {
      id: "x", title: "t", difficulty: "easy", mode: "image",
      grid_size: [1, 1, 1], tracks: ["minecraft"],
      target_image: "a", target_spec_md: "b",
      target_voxels: "c", target_bricks: "d",
      hints: [],
      optimal_instructions: 1, time_estimate_minutes: 1,
    };
    expect(() => validateManifest(ok)).not.toThrow();
  });
  it("rejects missing fields", () => {
    expect(() => validateManifest({ id: "x" })).toThrow(/missing/i);
  });
  it("rejects wrong difficulty", () => {
    expect(() => validateManifest({
      id: "x", title: "t", difficulty: "impossible",
      mode: "image", grid_size: [1, 1, 1], tracks: ["minecraft"],
      target_image: "a", target_spec_md: "b",
      target_voxels: "c", target_bricks: "d",
      hints: [], optimal_instructions: 1, time_estimate_minutes: 1,
    })).toThrow(/difficulty/i);
  });
});
