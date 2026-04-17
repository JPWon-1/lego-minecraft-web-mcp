import { describe, it, expect } from "vitest";
import { computeVoxelIoU } from "./iou.js";
import type { Block } from "../types/block.js";

function mkBlock(id: string, x: number, y: number, z: number, color = "#FFF"): Block {
  return {
    id, track: "minecraft", type: "voxel_1x1",
    position: [x, y, z], color, placed_at: 0, turn_id: "t",
  };
}

describe("computeVoxelIoU", () => {
  it("returns 1.0 for identical sets", () => {
    const a = [mkBlock("a", 0, 0, 0), mkBlock("b", 1, 0, 0)];
    expect(computeVoxelIoU(a, a)).toBe(1);
  });

  it("returns 0 for disjoint sets", () => {
    const a = [mkBlock("a", 0, 0, 0)];
    const b = [mkBlock("b", 5, 0, 0)];
    expect(computeVoxelIoU(a, b)).toBe(0);
  });

  it("returns 0 when both empty", () => {
    expect(computeVoxelIoU([], [])).toBe(0);
  });

  it("considers color mismatch as non-intersection", () => {
    const a = [mkBlock("a", 0, 0, 0, "#F00")];
    const b = [mkBlock("b", 0, 0, 0, "#0F0")];
    expect(computeVoxelIoU(a, b)).toBe(0);
  });

  it("computes partial overlap correctly", () => {
    const result = [mkBlock("r1", 0, 0, 0), mkBlock("r2", 1, 0, 0)];
    const target = [
      mkBlock("t1", 0, 0, 0),
      mkBlock("t2", 2, 0, 0),
      mkBlock("t3", 3, 0, 0),
    ];
    expect(computeVoxelIoU(result, target)).toBeCloseTo(0.25, 5);
  });

  it("is symmetric", () => {
    const a = [mkBlock("a", 0, 0, 0), mkBlock("b", 1, 0, 0)];
    const b = [mkBlock("c", 0, 0, 0), mkBlock("d", 2, 0, 0)];
    expect(computeVoxelIoU(a, b)).toBe(computeVoxelIoU(b, a));
  });
});
